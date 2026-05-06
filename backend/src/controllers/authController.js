import bcrypt from "bcryptjs";

import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { sendTokenResponse } from "../utils/token.js";

const safeBody = (body) => ({
  ...body,
  password: body.password ? "[provided]" : undefined
});

const safeUser = (user) => {
  if (!user) {
    return null;
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};

export const register = asyncHandler(async (req, res) => {
  console.log("Register body:", safeBody(req.body));

  const { name, email, password, role } = req.body;
  const displayName = name?.trim() || email.split("@")[0];

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("User already exists", 400);
  }

  const user = await User.create({
    name: displayName,
    email,
    password,
    role: role || "Member"
  });

  console.log("User created:", safeUser(user));
  sendTokenResponse(res, user, 201);
});

export const signup = register;

export const login = asyncHandler(async (req, res) => {
  console.log("Login body:", safeBody(req.body));

  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  console.log("User found:", safeUser(user));

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  console.log("Password match:", isMatch);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  sendTokenResponse(res, user);
});

export const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
};

export const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});
