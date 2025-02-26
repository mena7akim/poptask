const { asyncHandler } = require("../utils/error/errorHandling");
const { Task, TaskAssignee, TaskStatus, TaskDependency } = require("../models");
const { sequelize } = require("../db/connection");
const { successResponse } = require("../utils/response/successResponse");
const { Op } = require("sequelize");

const createTask = asyncHandler(async (req, res, next) => {
  const { task, dependencies } = req.body;
  task.projectId = req.params.projectId;

  const pendingStatus = await TaskStatus.findOne({
    where: { statusName: "Pending" },
  });
  if (!pendingStatus) return next(new Error("Pending status not found"));

  task.statusId = pendingStatus.id;
  const transaction = await sequelize.transaction();

  try {
    const createdTask = await Task.create(task, { transaction });

    if (dependencies?.length) {
      // Verify all dependencies exist in the same project
      const validDependencies = await Task.findAll({
        where: {
          id: dependencies,
          projectId: task.projectId,
        },
        transaction,
      });

      if (validDependencies.length !== dependencies.length) {
        throw new Error(
          "One or more dependencies are invalid or belong to different project"
        );
      }

      // Create dependency records
      await TaskDependency.bulkCreate(
        dependencies.map((depId) => ({
          dependentTaskId: createdTask.id,
          dependencyTaskId: depId,
        })),
        { transaction }
      );
    }

    await transaction.commit();
    return successResponse(res, {
      message: "Task created successfully",
      data: createdTask,
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

const updateTask = asyncHandler(async (req, res, next) => {
  const { taskId } = req.params;
  const { task: taskData, dependencies } = req.body;

  const transaction = await sequelize.transaction();

  try {
    const existingTask = await Task.findByPk(taskId, {
      include: [TaskStatus],
      transaction,
    });

    if (!existingTask) throw new Error("Task not found");

    // Only process dependencies if task is Pending
    if (existingTask.TaskStatus.statusName === "Pending" && dependencies) {
      // Get current dependencies upfront
      const currentDependencies = await existingTask.getDependencies({
        transaction,
        attributes: ["id"],
      });
      const currentDepIds = currentDependencies.map((d) => d.id);

      // Calculate changes early for validation
      const dependenciesToAdd = dependencies.filter(
        (id) => !currentDepIds.includes(id)
      );
      const dependenciesToRemove = currentDepIds.filter(
        (id) => !dependencies.includes(id)
      );

      // Validate new dependencies first - same project check
      if (dependenciesToAdd.length > 0) {
        const validDeps = await Task.findAll({
          where: {
            id: dependenciesToAdd,
            projectId: existingTask.projectId,
          },
          transaction,
        });

        if (validDeps.length !== dependenciesToAdd.length) {
          throw new Error("Invalid dependencies or cross-project dependencies");
        }
      }

      // Circular check only for new dependencies being added
      for (const depId of dependenciesToAdd) {
        if (await hasCircularDependency(taskId, depId, transaction)) {
          throw new Error(
            `Circular dependency detected between task ${taskId} and ${depId}`
          );
        }
      }

      // Perform actual dependency updates
      await TaskDependency.destroy({
        where: {
          dependentTaskId: taskId,
          dependencyTaskId: dependenciesToRemove,
        },
        transaction,
      });

      await TaskDependency.bulkCreate(
        dependenciesToAdd.map((depId) => ({
          dependentTaskId: taskId,
          dependencyTaskId: depId,
        })),
        { transaction }
      );
    }

    await existingTask.update(taskData, { transaction });
    await transaction.commit();

    const updatedTask = await Task.findByPk(taskId, {
      include: [{ model: Task, as: "Dependencies" }, TaskStatus],
    });

    return successResponse(res, {
      message: "Task updated successfully",
      data: updatedTask,
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

const popTask = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const projectId = req.params.projectId;

  const isUserAssigned = await TaskAssignee.findAll({
    where: {
      userId: user.id,
    },
  });

  if (isUserAssigned) {
    return next(new Error("User is already assigned to task."));
  }

  const transaction = await sequelize.transaction();

  try {
    // Get required statuses
    const [pendingStatus, inProgressStatus, completedStatus] =
      await Promise.all([
        TaskStatus.findOne({ where: { statusName: "Pending" }, transaction }),
        TaskStatus.findOne({
          where: { statusName: "In Progress" },
          transaction,
        }),
        TaskStatus.findOne({ where: { statusName: "Completed" }, transaction }),
      ]);

    // Find eligible task with row locking
    const task = await Task.findOne({
      where: {
        projectId,
        statusId: pendingStatus.id,
        // Check all dependencies are completed using subquery
        [Op.and]: sequelize.literal(`(
          SELECT COUNT(*) FROM "TaskDependencies" AS Dependency
          JOIN "Tasks" AS DepTask ON Dependency."dependencyTaskId" = DepTask.id
          WHERE Dependency."dependentTaskId" = "Task".id
          AND DepTask."statusId" != ${completedStatus.id}
        ) = 0`),
      },
      transaction,
      lock: true,
      skipLocked: true,
    });

    if (!task) {
      await transaction.commit();
      return successResponse(res, {
        message: "No available tasks to pop",
        data: null,
      });
    }

    // Assign to current user
    await TaskAssignee.create(
      {
        taskId: task.id,
        userId: user.id,
      },
      { transaction }
    );

    // Update status to In Progress
    await task.update({ statusId: inProgressStatus.id }, { transaction });

    await transaction.commit();
    return successResponse(res, {
      message: "Task popped successfully",
      data: task,
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

const skipTask = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { taskId, projectId } = req.params;
  const transaction = await sequelize.transaction();

  try {
    // Verify task belongs to project
    const task = await Task.findOne({
      where: {
        id: taskId,
        projectId: projectId,
      },
      transaction,
    });

    if (!task) {
      throw new Error("Task not found in this project");
    }

    // Check user assignment
    const assignment = await TaskAssignee.findOne({
      where: {
        taskId: taskId,
        userId: user.id,
      },
      transaction,
    });

    if (!assignment) {
      throw new Error("User is not assigned to this task");
    }

    // Get pending status
    const pendingStatus = await TaskStatus.findOne({
      where: { statusName: "Pending" },
      transaction,
    });

    if (!pendingStatus) {
      throw new Error("Pending status not found");
    }

    // Remove assignment
    await TaskAssignee.destroy({
      where: {
        taskId: taskId,
        userId: user.id,
      },
      transaction,
    });

    // Reset task status
    await task.update(
      {
        statusId: pendingStatus.id,
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    return successResponse(res, {
      message: "Task skipped successfully.",
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
});

const completeTask = asyncHandler(async (req, res, next) => {
  const user = req.user;
  const { taskId, projectId } = req.params;
  const transaction = await sequelize.transaction();

  try {
    // Verify task belongs to project
    const task = await Task.findOne({
      where: {
        id: taskId,
        projectId: projectId,
      },
      transaction,
    });

    if (!task) {
      throw new Error("Task not found in this project");
    }

    // Check user assignment
    const assignment = await TaskAssignee.findOne({
      where: {
        taskId: taskId,
        userId: user.id,
      },
      transaction,
    });

    if (!assignment) {
      throw new Error("User is not assigned to this task");
    }

    // Get pending status
    const completedStatus = await TaskStatus.findOne({
      where: { statusName: "Completed" },
      transaction,
    });

    if (!completedStatus) {
      throw new Error("Completed status not found");
    }

    // Remove assignment
    await TaskAssignee.destroy({
      where: {
        taskId: taskId,
        userId: user.id,
      },
      transaction,
    });

    // Reset task status
    await task.update(
      {
        statusId: pendingStatus.id,
      },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    return successResponse(res, {
      message: "Task marked as compeleted successfully.",
    });
  } catch (error) {
    await transaction.rollback();
    return next(error);
  }
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

// Circular dependency checker
async function hasCircularDependency(taskId, dependencyId, transaction) {
  const visited = new Set();
  const stack = [dependencyId];

  while (stack.length > 0) {
    const currentId = stack.pop();

    if (currentId === taskId) return true;
    if (visited.has(currentId)) continue;
    visited.add(currentId);

    const deps = await TaskDependency.findAll({
      where: { dependentTaskId: currentId },
      transaction,
    });

    stack.push(...deps.map((d) => d.dependencyTaskId));
  }

  return false;
}

module.exports = {
  createTask,
  updateTask,
  popTask,
  skipTask,
  completeTask,
  deleteTask,
};
