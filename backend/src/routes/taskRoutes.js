import express from "express";
import { body, param, query } from "express-validator";

import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
  updateTaskStatus
} from "../controllers/taskController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router
  .route("/")
  .get(
    protect,
    [
      query("projectId").optional().isMongoId().withMessage("Invalid project id"),
      query("status").optional().isIn(["Todo", "In Progress", "Done"]).withMessage("Invalid status"),
      query("priority").optional().isIn(["Low", "Medium", "High"]).withMessage("Invalid priority")
    ],
    validate,
    getTasks
  )
  .post(
    protect,
    authorize("Admin"),
    [
      body("title").trim().isLength({ min: 3 }).withMessage("Task title must be at least 3 characters"),
      body("description").optional().trim(),
      body("deadline").isISO8601().withMessage("Valid deadline is required"),
      body("priority").optional().isIn(["Low", "Medium", "High"]).withMessage("Invalid priority"),
      body("assignedTo").isMongoId().withMessage("Valid assignee is required"),
      body("projectId").isMongoId().withMessage("Valid project id is required")
    ],
    validate,
    createTask
  );

router.patch(
  "/:id/status",
  protect,
  [
    param("id").isMongoId().withMessage("Invalid task id"),
    body("status").isIn(["Todo", "In Progress", "Done"]).withMessage("Invalid status")
  ],
  validate,
  updateTaskStatus
);

router
  .route("/:id")
  .patch(
    protect,
    authorize("Admin"),
    [
      param("id").isMongoId().withMessage("Invalid task id"),
      body("title").optional().trim().isLength({ min: 3 }).withMessage("Task title must be at least 3 characters"),
      body("deadline").optional().isISO8601().withMessage("Valid deadline is required"),
      body("priority").optional().isIn(["Low", "Medium", "High"]).withMessage("Invalid priority"),
      body("status").optional().isIn(["Todo", "In Progress", "Done"]).withMessage("Invalid status"),
      body("assignedTo").optional().isMongoId().withMessage("Invalid assignee")
    ],
    validate,
    updateTask
  )
  .delete(
    protect,
    authorize("Admin"),
    [param("id").isMongoId().withMessage("Invalid task id")],
    validate,
    deleteTask
  );

export default router;
