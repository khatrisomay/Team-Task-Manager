import express from "express";
import { body, param } from "express-validator";

import {
  addMember,
  createProject,
  deleteProject,
  getProject,
  getProjects,
  removeMember
} from "../controllers/projectController.js";
import { authorize, protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getProjects)
  .post(
    protect,
    authorize("Admin"),
    [
      body("name").trim().isLength({ min: 3 }).withMessage("Project name must be at least 3 characters"),
      body("description").optional().trim(),
      body("members").optional().isArray().withMessage("Members must be an array"),
      body("members.*").optional().isMongoId().withMessage("Invalid member id")
    ],
    validate,
    createProject
  );

router
  .route("/:id")
  .get(
    protect,
    [param("id").isMongoId().withMessage("Invalid project id")],
    validate,
    getProject
  )
  .delete(
    protect,
    authorize("Admin"),
    [param("id").isMongoId().withMessage("Invalid project id")],
    validate,
    deleteProject
  );

router.post(
  "/:id/members",
  protect,
  authorize("Admin"),
  [
    param("id").isMongoId().withMessage("Invalid project id"),
    body("userId").optional().isMongoId().withMessage("Invalid user id"),
    body("email").optional().isEmail().withMessage("Valid email is required")
  ],
  validate,
  addMember
);

router.delete(
  "/:id/members/:memberId",
  protect,
  authorize("Admin"),
  [
    param("id").isMongoId().withMessage("Invalid project id"),
    param("memberId").isMongoId().withMessage("Invalid member id")
  ],
  validate,
  removeMember
);

export default router;
