import User from "../models/User.js";
import asyncHandler from "../middleware/asyncHandler.js";

export const getUsers = asyncHandler(async (req, res) => {
  const { role, search } = req.query;
  const query = {};

  if (role) {
    query.role = role;
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } }
    ];
  }

  const users = await User.find(query)
    .select("name email role")
    .sort({ name: 1 });

  res.status(200).json({ users });
});
