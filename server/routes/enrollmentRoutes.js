import express from "express";
import {
  getEnrollment,
  updateProgress,
  getCourseEnrollments,
  getTutorStudents,
  checkEnrollment,
  createEnrollment,
} from "../controllers/enrollmentController.js";
import { protect, restrictTo, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Public route with optional auth - check enrollment
router.get("/check/:courseId", optionalAuth, checkEnrollment);

// All other enrollment routes require authentication
router.use(protect);

router.post("/", createEnrollment);

// --- TUTOR ROUTES ---
// CHANGE 2: Ye route sabse uppar add karein (student routes se pehle)
router.get("/tutor/my-students", restrictTo("tutor"), getTutorStudents);

router.get(
  "/course/:courseId/students",
  restrictTo("tutor"),
  getCourseEnrollments,
);

// --- STUDENT ROUTES ---
router.get("/:courseId", restrictTo("student"), getEnrollment);
router.patch("/:courseId/progress", restrictTo("student"), updateProgress);

export default router;
