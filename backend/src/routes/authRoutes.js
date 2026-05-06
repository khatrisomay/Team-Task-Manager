import express from "express";
import { body } from "express-validator";

import { getMe, login, logout, register, signup } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";

const router = express.Router();

const registerValidation = [
  body("name")
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 2 })
    .withMessage("Name must be at least 2 characters"),
  body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("role").optional().isIn(["Admin", "Member"]).withMessage("Role must be Admin or Member")
];

router.post("/register", registerValidation, validate, register);
router.post("/signup", registerValidation, validate, signup);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Valid email is required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required")
  ],
  validate,
  login
);

router.post("/logout", logout);
router.get("/me", protect, getMe);

export default router;
