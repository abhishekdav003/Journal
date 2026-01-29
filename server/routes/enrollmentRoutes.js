import express from "express";
import {
  getEnrollment,
  updateProgress,
  getCourseEnrollments,
  getTutorStudents, // CHANGE 1: Yahan ye import add karein
} from "../controllers/enrollmentController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// All enrollment routes require authentication
router.use(protect);

// --- TUTOR ROUTES ---
// CHANGE 2: Ye route sabse uppar add karein (student routes se pehle)
router.get(
  "/tutor/my-students",
  restrictTo("tutor"),
  getTutorStudents
);

router.get(
  "/course/:courseId/students",
  restrictTo("tutor"),
  getCourseEnrollments,
);

// --- STUDENT ROUTES ---
router.get("/:courseId", restrictTo("student"), getEnrollment);
router.patch("/:courseId/progress", restrictTo("student"), updateProgress);

export default router;
