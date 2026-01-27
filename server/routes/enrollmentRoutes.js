import express from "express";
import {
  getEnrollment,
  updateProgress,
  getCourseEnrollments,
} from "../controllers/enrollmentController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// All enrollment routes require authentication
router.use(protect);

// Student routes
router.get("/:courseId", restrictTo("student"), getEnrollment);
router.patch("/:courseId/progress", restrictTo("student"), updateProgress);

// Tutor routes
router.get(
  "/course/:courseId/students",
  restrictTo("tutor"),
  getCourseEnrollments,
);

export default router;
