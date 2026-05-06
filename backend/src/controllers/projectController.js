import mongoose from "mongoose";

import Project from "../models/Project.js";
import Task from "../models/Task.js";
import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorMiddleware.js";

const populateProject = (query) => {
  return query
    .populate("members", "name email role")
    .populate("createdBy", "name email role");
};

export const createProject = asyncHandler(async (req, res) => {
  const { name, description, members = [] } = req.body;

  const uniqueMemberIds = [...new Set(members.map(String))];
  const memberUsers = await User.find({
    _id: { $in: uniqueMemberIds },
    role: "Member"
  });

  if (memberUsers.length !== uniqueMemberIds.length) {
    throw new AppError("Every project member must be a valid Member user", 400);
  }

  const project = await Project.create({
    name,
    description,
    members: uniqueMemberIds,
    createdBy: req.user._id
  });

  const savedProject = await populateProject(Project.findById(project._id));
  res.status(201).json({ project: savedProject });
});

export const getProjects = asyncHandler(async (req, res) => {
  const query =
    req.user.role === "Admin"
      ? { createdBy: req.user._id }
      : { members: req.user._id };

  const projects = await populateProject(Project.find(query).sort({ createdAt: -1 }));

  res.status(200).json({ projects });
});

export const getProject = asyncHandler(async (req, res) => {
  const project = await populateProject(Project.findById(req.params.id));

  if (!project) {
    throw new AppError("Project not found", 404);
  }

  const isOwner = project.createdBy._id.equals(req.user._id);
  const isMember = project.members.some((member) => member._id.equals(req.user._id));

  if (!isOwner && !isMember) {
    throw new AppError("You are not part of this project", 403);
  }

  res.status(200).json({ project });
});

export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findOne({
    _id: req.params.id,
    createdBy: req.user._id
  });

  if (!project) {
    throw new AppError("Project not found or you are not the owner", 404);
  }

  await Task.deleteMany({ projectId: project._id });
  await project.deleteOne();

  res.status(200).json({ message: "Project and related tasks deleted" });
});

export const addMember = asyncHandler(async (req, res) => {
  const { userId, email } = req.body;

  const project = await Project.findOne({
    _id: req.params.id,
    createdBy: req.user._id
  });

  if (!project) {
    throw new AppError("Project not found or you are not the owner", 404);
  }

  const user = userId
    ? await User.findById(userId)
    : await User.findOne({ email: email?.toLowerCase() });

  if (!user || user.role !== "Member") {
    throw new AppError("Only valid Member users can be added", 400);
  }

  if (!project.members.some((memberId) => memberId.equals(user._id))) {
    project.members.push(user._id);
    await project.save();
  }

  const updatedProject = await populateProject(Project.findById(project._id));
  res.status(200).json({ project: updatedProject });
});

export const removeMember = asyncHandler(async (req, res) => {
  const { memberId } = req.params;

  if (!mongoose.isValidObjectId(memberId)) {
    throw new AppError("Invalid member id", 400);
  }

  const project = await Project.findOne({
    _id: req.params.id,
    createdBy: req.user._id
  });

  if (!project) {
    throw new AppError("Project not found or you are not the owner", 404);
  }

  project.members = project.members.filter((id) => !id.equals(memberId));
  await project.save();
  await Task.updateMany(
    { projectId: project._id, assignedTo: memberId },
    { $set: { assignedTo: null } }
  );

  const updatedProject = await populateProject(Project.findById(project._id));
  res.status(200).json({ project: updatedProject });
});
