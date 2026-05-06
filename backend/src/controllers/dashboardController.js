import Project from "../models/Project.js";
import Task from "../models/Task.js";
import asyncHandler from "../middleware/asyncHandler.js";

const statuses = ["Todo", "In Progress", "Done"];

export const getDashboard = asyncHandler(async (req, res) => {
  const projectQuery =
    req.user.role === "Admin" ? { createdBy: req.user._id } : { members: req.user._id };

  const projects = await Project.find(projectQuery).select("_id name");
  const projectIds = projects.map((project) => project._id);

  const taskQuery = {
    projectId: { $in: projectIds }
  };

  if (req.user.role === "Member") {
    taskQuery.assignedTo = req.user._id;
  }

  const tasks = await Task.find(taskQuery)
    .populate("assignedTo", "name email role")
    .populate("projectId", "name")
    .sort({ deadline: 1 });

  const now = new Date();
  const groupedTasks = statuses.reduce((groups, status) => {
    groups[status] = tasks.filter((task) => task.status === status);
    return groups;
  }, {});

  const summary = {
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === "Done").length,
    pendingTasks: tasks.filter((task) => task.status !== "Done").length,
    overdueTasks: tasks.filter((task) => task.status !== "Done" && task.deadline < now).length,
    totalProjects: projects.length
  };

  res.status(200).json({ summary, groupedTasks, projects });
});
