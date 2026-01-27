import express from "express";
import {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  requestRefund,
} from "../controllers/paymentController.js";
import { protect, restrictTo } from "../middleware/auth.js";

const router = express.Router();

// All payment routes require authentication
router.use(protect);

// Student routes
router.post("/create-order", restrictTo("student"), createOrder);
router.post("/verify", restrictTo("student"), verifyPayment);
router.post("/:id/refund", restrictTo("student"), requestRefund);

// Both student and tutor can view payment history
router.get("/history", getPaymentHistory);

export default router;
