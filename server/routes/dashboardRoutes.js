import express from "express";
import {
  getDashboardStats,
  getEnrolledCourses,
} from "../controllers/dashboardController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

// All routes are protected
router.use(protect);

// Get dashboard statistics
router.get("/stats", getDashboardStats);

// Get enrolled courses
router.get("/courses", getEnrolledCourses);

export default router;
