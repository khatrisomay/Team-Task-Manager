import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";
import { AppError } from "../middleware/errorMiddleware.js";
import { sendTokenResponse } from "../utils/token.js";

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError("Email is already registered", 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "Member"
  });

  sendTokenResponse(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    throw new AppError("Invalid email or password", 401);
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
