import express from "express";
import {
  adminLogin,
  getAdminProfile,
  changeAdminPassword,
  adminLogout,
} from "../controllers/adminController.js";
import {
  getAllEnrollmentsAdmin,
  deleteEnrollmentAdmin,
} from "../controllers/enrollmentController.js";
import {
  getAllPaymentsAdmin,
  updatePaymentStatusAdmin,
} from "../controllers/paymentController.js";
import { protectAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/login", adminLogin);

// Protected routes
router.use(protectAdmin); // All routes after this are protected for admin
router.get("/me", getAdminProfile);
router.get("/profile", getAdminProfile);
router.post("/change-password", changeAdminPassword);
router.post("/logout", adminLogout);

// ==================== ADMIN DATA MANAGEMENT ROUTES ====================

// Enrollments
router.get("/enrollments", getAllEnrollmentsAdmin);
router.delete("/enrollments/:id", deleteEnrollmentAdmin);

// Payments
router.get("/payments", getAllPaymentsAdmin);
router.patch("/payments/:id/status", updatePaymentStatusAdmin);

// Reviews are handled in reviewRoutes.js with /admin prefix

export default router;
