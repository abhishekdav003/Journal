import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourse,
  updateCourse,
  deleteCourse,
  getTutorCourses,
  togglePublishCourse,
  addLecture,
  updateLecture,
  deleteLecture,
  getEnrolledCourses,
  archiveCourse,
  addModule,
  updateModule,
  deleteModule,
} from "../controllers/courseController.js";
import { protect, restrictTo, optionalAuth } from "../middleware/auth.js";

const router = express.Router();

// Public routes (with optional auth for owner access)
router.get("/", getAllCourses);
router.get("/:id", optionalAuth, getCourse);

// Protected routes - require authentication
router.use(protect);

// Student routes
router.get("/student/enrolled", restrictTo("student"), getEnrolledCourses);

// Tutor routes
router.post("/", restrictTo("tutor"), createCourse);
router.get("/tutor/my-courses", restrictTo("tutor"), getTutorCourses);
router.put("/:id", restrictTo("tutor"), updateCourse);
router.delete("/:id", restrictTo("tutor"), deleteCourse);
router.patch("/:id/publish", restrictTo("tutor"), togglePublishCourse);

// Lecture management routes
router.post("/:id/lectures", restrictTo("tutor"), addLecture);
router.put("/:id/lectures/:lectureId", restrictTo("tutor"), updateLecture);
router.delete("/:id/lectures/:lectureId", restrictTo("tutor"), deleteLecture);

// Module management routes
router.post("/:id/modules", restrictTo("tutor"), addModule);
router.put("/:id/modules/:moduleId", restrictTo("tutor"), updateModule);
router.delete("/:id/modules/:moduleId", restrictTo("tutor"), deleteModule);

// Archive route
router.patch("/:id/archive", restrictTo("tutor"), archiveCourse);

export default router;
