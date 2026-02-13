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

// Test endpoint - check current user info
router.get("/test/user-info", (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      roleType: typeof req.user.role,
    },
  });
});

router.post("/", createEnrollment);

// --- TUTOR ROUTES ---

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
