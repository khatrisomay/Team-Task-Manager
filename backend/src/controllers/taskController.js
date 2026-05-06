import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorMiddleware.js";

const taskPopulate = [
  { path: "assignedTo", select: "name email role" },
  { path: "projectId", select: "name description" },
  { path: "createdBy", select: "name email role" }
];

const getAccessibleProjectIds = async (user) => {
  const query = user.role === "Admin" ? { createdBy: user._id } : { members: user._id };
  const projects = await Project.find(query).select("_id");
  return projects.map((project) => project._id);
};

export const getTasks = asyncHandler(async (req, res) => {
  const { projectId, status, priority, search } = req.query;
  const accessibleProjectIds = await getAccessibleProjectIds(req.user);

  const query = {
    projectId: { $in: accessibleProjectIds }
  };

  if (req.user.role === "Member") {
    query.assignedTo = req.user._id;
  }

  if (projectId) {
    const canAccessProject = accessibleProjectIds.some((id) => id.equals(projectId));

    if (!canAccessProject) {
      throw new AppError("You are not part of this project", 403);
    }

    query.projectId = projectId;
  }

  if (status) {
    query.status = status;
  }

  if (priority) {
    query.priority = priority;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  const tasks = await Task.find(query)
    .populate(taskPopulate)
    .sort({ deadline: 1, createdAt: -1 });

  res.status(200).json({ tasks });
});

export const createTask = asyncHandler(async (req, res) => {
  const { title, description, deadline, priority, assignedTo, projectId } = req.body;

  const project = await Project.findOne({
    _id: projectId,
    createdBy: req.user._id
  });

  if (!project) {
    throw new AppError("Project not found or you are not the owner", 404);
  }

  const assignee = await User.findById(assignedTo);
  if (!assignee || assignee.role !== "Member") {
    throw new AppError("Task must be assigned to a valid Member", 400);
  }

  if (!project.members.some((memberId) => memberId.equals(assignee._id))) {
    throw new AppError("Assignee must be part of this project", 400);
  }

  const task = await Task.create({
    title,
    description,
    deadline,
    priority,
    assignedTo,
    projectId,
    createdBy: req.user._id
  });

  console.log(
    `[mock-email] Task "${task.title}" assigned to ${assignee.email}. Deadline: ${task.deadline.toDateString()}`
  );

  const savedTask = await Task.findById(task._id).populate(taskPopulate);
  res.status(201).json({ task: savedTask });
});

export const updateTask = asyncHandler(async (req, res) => {
  const { title, description, deadline, priority, assignedTo, status } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const project = await Project.findOne({
    _id: task.projectId,
    createdBy: req.user._id
  });

  if (!project) {
    throw new AppError("You can update only tasks from your own projects", 403);
  }

  if (assignedTo) {
    const assignee = await User.findById(assignedTo);
    if (!assignee || assignee.role !== "Member") {
      throw new AppError("Task must be assigned to a valid Member", 400);
    }

    if (!project.members.some((memberId) => memberId.equals(assignee._id))) {
      throw new AppError("Assignee must be part of this project", 400);
    }

    task.assignedTo = assignedTo;
  }

  task.title = title ?? task.title;
  task.description = description ?? task.description;
  task.deadline = deadline ?? task.deadline;
  task.priority = priority ?? task.priority;
  task.status = status ?? task.status;

  await task.save();

  const updatedTask = await Task.findById(task._id).populate(taskPopulate);
  res.status(200).json({ task: updatedTask });
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  if (req.user.role === "Member" && !task.assignedTo?.equals(req.user._id)) {
    throw new AppError("Members can update only their assigned tasks", 403);
  }

  if (req.user.role === "Admin") {
    const ownsProject = await Project.exists({
      _id: task.projectId,
      createdBy: req.user._id
    });

    if (!ownsProject) {
      throw new AppError("You can update only tasks from your own projects", 403);
    }
  }

  task.status = status;
  await task.save();

  const updatedTask = await Task.findById(task._id).populate(taskPopulate);
  res.status(200).json({ task: updatedTask });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError("Task not found", 404);
  }

  const ownsProject = await Project.exists({
    _id: task.projectId,
    createdBy: req.user._id
  });

  if (!ownsProject) {
    throw new AppError("You can delete only tasks from your own projects", 403);
  }

  await task.deleteOne();
  res.status(200).json({ message: "Task deleted" });
});
