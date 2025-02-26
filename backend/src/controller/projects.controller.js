const { asyncHandler } = require("../utils/error/errorHandling");
const { Project } = require("../models");
const { successResponse } = require("../utils/response/successResponse");

const createProject = asyncHandler(async (req, res, next) => {
  const project = req.body;
  project.teamId = req.params.teamId;
  // Check if project with the same name already exists
  const isProjectExist = await Project.findOne({
    where: { name: project.name },
  });

  if (isProjectExist) {
    return next(new Error("Project with this name already exists."));
  }

  // Create the project
  const createdProject = await Project.create(project);

  return successResponse(res, {
    message: "Project has been created successfully.",
    data: createdProject, // Include created project in the response
  });
});

const updateProject = asyncHandler(async (req, res, next) => {
  const newProject = req.body;
  const { projectId, teamId } = req.params;

  // Check if project exists
  const currentProject = await Project.findOne({
    where: { id: projectId, teamId },
  });
  if (!currentProject) {
    return next(new Error("Project not found."));
  }

  // Check if new name is already in use (by another project)
  if (newProject.name) {
    const isProjectExist = await Project.findOne({
      where: { name: newProject.name, id: { [Op.ne]: projectId } }, // Exclude current project from name check
    });

    if (isProjectExist) {
      return next(new Error("Project with this name already exists."));
    }
  }

  // Update the project
  await currentProject.update(newProject);

  return successResponse(res, {
    message: "Project has been updated successfully.",
    data: currentProject, // Include updated project in the response
  });
});

const getProject = asyncHandler(async (req, res, next) => {
  const { projectId, teamId } = req.params;

  // Find project by ID (including soft deletes if needed)
  const project = await Project.findOne({
    where: { id: projectId, teamId },
  });

  if (!project) {
    return next(new Error("Project not found.", { cause: 404 }));
  }

  return successResponse(res, {
    message: "Project has been retrieved successfully",
    data: project,
  });
});

const getAllProjects = asyncHandler(async (req, res, next) => {
  const { teamId } = req.params;

  // Pagination options (defaults to page 1 and 10 items per page)
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  // Fetch projects for the given team with pagination
  const projects = await Project.findAndCountAll({
    where: { teamId },
    limit: parseInt(limit),
    offset: parseInt(offset),
  });

  return successResponse(res, {
    message: "Your projects have been retrieved successfully.",
    data: projects.rows,
    meta: {
      total: projects.count,
      page: parseInt(page),
      limit: parseInt(limit),
    },
  });
});

const removeProject = asyncHandler(async (req, res, next) => {
  const { projectId, teamId } = req.params;

  // Find project by ID
  const project = await Project.findOne({ where: { id: projectId, teamId } });

  if (!project) {
    return next(new Error("Project not found."));
  }

  // Soft delete the project
  await project.destroy();

  return successResponse(res, {
    message: "Project has been deleted successfully.",
  });
});

module.exports = {
  createProject,
  updateProject,
  getProject,
  getAllProjects,
  removeProject,
};
