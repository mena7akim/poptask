const { asyncHandler } = require("../utils/error/errorHandling");
const { Task, TaskAssignee, TaskDependency } = require("../models");
const { sequelize } = require("../db/connection");
const { successResponse } = require("../utils/response/successResponse");
const { Op } = require("sequelize");

const createTask = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId;
  const { task, dependencies } = req.body;
  task.projectId = projectId;

  await sequelize.transaction(async (t) => {
    const createdTask = await Task.create(task, { transaction });

    if (dependencies && dependencies.length > 0) {
      const taskDependencies = dependencies.map((dependency) => ({
        from: dependency,
        to: createdTask.id,
      }));

      await TaskDependency.bulkCreate(taskDependencies, { transaction });
    }

    await transaction.commit();
  });

  return successResponse(res, {
    message: "Task created successfully",
    data: createdTask,
  });
});

const updateTask = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId;
  const { task, dependencies } = req.body;

  const taskId = req.params.taskId;
  const existingTask = await Task.findOne({ where: { id: taskId, projectId } });

  if (!existingTask) {
    return next(new Error("Task not found in this project", { cause: 404 }));
  }

  let tasksGraph = await getTasksAsGraph(projectId);

  await sequelize.transaction(async (t) => {
    for (const node of tasksGraph) {
      // removing the node from its previous dependencies
      if (dependencies.includes(node) && !tasksGraph[node].includes(taskId)) {
        tasksGraph[node].push(taskId);
      }
      // adding the node to its new dependencies
      else if (
        !dependencies.includes(node) &&
        tasksGraph[node].includes(taskId)
      ) {
        tasksGraph[node] = tasksGraph[node].filter((node) => node != taskId);
      }
    }
    if (!isDAG(tasksGraph)) {
      throw new Error("The updated dependencies create a cycle", {
        cause: 400,
      });
    }

    await Task.update(task, { where: { id: taskId }, transaction: t });

    await TaskDependency.destroy({ where: { to: taskId }, transaction: t });

    if (dependencies && dependencies.length > 0) {
      const taskDependencies = dependencies.map((dependency) => ({
        from: dependency,
        to: taskId,
      }));

      await TaskDependency.bulkCreate(taskDependencies, { transaction: t });
    }

    await t.commit();
  });

  return successResponse(res, {
    message: "Task updated successfully",
    data: { taskId },
  });
});

const popTask = asyncHandler(async (req, res, next) => {
  const { projectId } = req.params;
  const { userId } = req.user;

  const task = await TaskAssignee.findOne({
    where: {
      userId,
    },
    include: [
      {
        model: Task,
        where: {
          projectId,
        },
      },
    ],
  });

  if (task) {
    return successResponse(res, {
      message: "Task found successfully",
      data: task,
    });
  }

  const tasksGraph = await getTasksAsGraph(projectId);

  const pickedTask = await getPendingTask(projectId, userId, tasksGraph);

  if (!pickedTask) {
    return successResponse(res, {
      message: "No task found",
      data: {},
    });
  }

  await sequelize.transaction(async (t) => {
    await TaskAssignee.create(
      {
        userId,
        taskId: pickedTask,
      },
      { transaction: t }
    );

    await Task.update(
      {
        status: "in-progress",
      },
      {
        where: {
          id: pickedTask,
        },
        transaction: t,
      }
    );
  });

  const pickedTaskDetails = await Task.findOne({
    where: {
      id: pickedTask,
    },
  });

  return successResponse(res, {
    message: "Task found successfully",
    data: pickedTaskDetails,
  });
});

const skipTask = asyncHandler(async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const { userId } = req.user;

  const task = await TaskAssignee.findOne({
    where: {
      userId,
      taskId,
    },
    include: [
      {
        model: Task,
        where: {
          projectId,
        },
      },
    ],
  });

  if (!task) {
    return next(new Error("Task not found in this project", { cause: 404 }));
  }

  await sequelize.transaction(async (t) => {
    await TaskAssignee.destroy({ where: { taskId }, transaction: t });

    await Task.update(
      {
        status: "pending",
      },
      {
        where: {
          id: taskId,
        },
        transaction: t,
      }
    );

    await t.commit();
  });

  return successResponse(res, {
    message: "Task skipped successfully",
  });
});

const completeTask = asyncHandler(async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const { userId } = req.user;

  const task = await TaskAssignee.findOne({
    where: {
      userId,
      taskId,
    },
    include: [
      {
        model: Task,
        where: {
          projectId,
        },
      },
    ],
  });

  if (!task) {
    return next(new Error("Task not found in this project", { cause: 404 }));
  }

  await sequelize.transaction(async (t) => {
    await TaskAssignee.destroy({ where: { taskId }, transaction: t });

    await Task.update(
      {
        status: "completed",
      },
      {
        where: {
          id: taskId,
        },
        transaction: t,
      }
    );

    await t.commit();
  });

  return successResponse(res, {
    message: "Task completed successfully",
  });
});

const deleteTask = asyncHandler(async (req, res, next) => {
  const { taskId, projectId } = req.params;

  const task = await Task.findOne({
    where: {
      id: taskId,
      projectId: projectId,
    },
    include: [TaskStatus],
    transaction,
  });

  if (!task) {
    return next(new Error("Task not found in this project", { cause: 404 }));
  }

  await Task.destroy({
    where: { id: taskId },
    transaction,
  });

  await transaction.commit();

  return successResponse(res, {
    message: "Task deleted successfully",
    data: { deletedTaskId: taskId },
  });
});

const getTasksAsGraph = async (projectId) => {
  let tasks = await Task.findAll({
    attributes: ["id", "status"],
    where: {
      projectId: projectId,
    },
  });
  tasks = tasks.map((task) => {
    return { id: task.id, status: task.status };
  });
  let edges = await TaskDependency.findAll({
    attributes: ["from", "to"],
    where: {
      from: {
        [Op.in]: tasks.map((task) => task.id),
      },
    },
  });

  let graph = {};

  tasks.forEach((task) => {
    graph[task.id] = { list: [], status: task.status };
  });

  edges.forEach((edge) => {
    graph[edge.from].list.push(edge.to);
  });

  return graph;
};

const isDAG = (graph) => {
  const color = Object.fromEntries(Object.keys(graph).map((node) => [node, 0]));

  const dfs = (node) => {
    color[node] = 1;
    for (const neighbor of graph[node].list) {
      if (color[neighbor] == 0) {
        if (dfs(neighbor)) return true;
      } else if (color[neighbor] == 1) {
        return true;
      }
    }
    color[node] = 2;
    return false;
  };

  for (const node in graph) {
    if (color[node] == 0 && dfs(node)) {
      return false;
    }
  }
  return true;
};

const getPendingTask = async (projectId, userId, tasksGraph) => {
  const assignedTasksHistory = await TaskAssignee.findAll({
    where: {
      userId,
    },
    include: [
      {
        model: Task,
        where: {
          projectId,
        },
      },
    ],
    paranoid: true,
  });

  const assignedTasks = assignedTasksHistory.map((task) => task.taskId);
  const reversedGraph = Object.fromEntries(
    Object.keys(tasksGraph).map((node) => [
      node,
      { list: [], status: tasksGraph[node].status },
    ])
  );
  for (const node in tasksGraph) {
    for (const neighbor of tasksGraph[node].list) {
      reversedGraph[neighbor].list.push(node);
    }
  }
  const visited = new Set();
  let pickedTask = null;
  const dfs = (node) => {
    visited.push(node);
    for (const neighbor of reversedGraph[node].list) {
      if (visited.has(neighbor)) {
        continue;
      }
      const isCandidate =
        reversedGraph[neighbor].status === "pending" &&
        !assignedTasks.includes(neighbor);
      for (const neighborOfNeighbor of reversedGraph[neighbor].list) {
        if (reversedGraph[neighborOfNeighbor].status !== "completed") {
          isCandidate = false;
          break;
        }
      }
      if (isCandidate) {
        pickedTask = neighbor;
        return;
      }
      dfs(neighbor);
    }
  };

  for (const node in reversedGraph) {
    if (!visited.has(node) && !pickedTask) {
      dfs(node);
    }
  }

  return pickedTask;
};

module.exports = {
  createTask,
  updateTask,
  popTask,
  skipTask,
  completeTask,
  deleteTask,
};
