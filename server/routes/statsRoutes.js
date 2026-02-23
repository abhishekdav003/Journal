import express from "express";
import {
  getPlatformStats,
  getPublicReviews,
  getAdminDashboardStats,
  getPaymentAnalytics,
} from "../controllers/statsController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes - no authentication required
router.get("/platform", getPlatformStats);
router.get("/reviews", getPublicReviews);

// Admin routes
router.get("/admin-dashboard", protectAdmin, getAdminDashboardStats);
router.get("/payment-analytics", protectAdmin, getPaymentAnalytics);

export default router;
