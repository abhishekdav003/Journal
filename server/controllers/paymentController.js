import Razorpay from "razorpay";
import crypto from "crypto";
import Course from "../models/Course.js";
import Payment from "../models/Payment.js";
import Enrollment from "../models/Enrollment.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { logger } from "../utils/logger.js";

// Initialize Razorpay (guarded)
let razorpay;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  try {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  } catch (err) {
    logger.error("Razorpay initialization error:", err);
    razorpay = null;
  }
} else {
  logger.warn(
    "Razorpay keys missing. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable payments.",
  );
}

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private/Student
export const createOrder = catchAsync(async (req, res, next) => {
  if (!razorpay) {
    return next(new AppError("Payment provider not configured", 503));
  }
  const { courseId } = req.body;

  // Check if course exists
  const course = await Course.findById(courseId);
  if (!course || !course.isPublished) {
    return next(new AppError("Course not found", 404));
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
  });

  if (existingEnrollment) {
    return next(new AppError("Already enrolled in this course", 400));
  }

  // Create Razorpay order
  const options = {
    amount: course.price * 100, // Convert to paise
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
    notes: {
      courseId: course._id.toString(),
      studentId: req.user._id.toString(),
      tutorId: course.tutor.toString(),
    },
  };

  const order = await razorpay.orders.create(options);

  // Create payment record
  const payment = await Payment.create({
    student: req.user._id,
    course: course._id,
    tutor: course.tutor,
    amount: course.price,
    razorpayOrderId: order.id,
  });

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // Return key for frontend
      courseTitle: course.title,
    },
  });
});

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private/Student
export const verifyPayment = catchAsync(async (req, res, next) => {
  if (!razorpay) {
    return next(new AppError("Payment provider not configured", 503));
  }
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

  // Find payment record
  const payment = await Payment.findOne({ razorpayOrderId });

  if (!payment) {
    return next(new AppError("Payment record not found", 404));
  }

  // Verify signature
  const body = razorpayOrderId + "|" + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpaySignature) {
    payment.status = "failed";
    await payment.save();
    return next(new AppError("Payment verification failed", 400));
  }

  // Update payment
  payment.razorpayPaymentId = razorpayPaymentId;
  payment.razorpaySignature = razorpaySignature;
  payment.status = "completed";
  await payment.save();

  // Create enrollment with payment reference
  const enrollment = await Enrollment.create({
    student: payment.student,
    course: payment.course,
    payment: payment._id,
    progress: [], // Empty initially
    completionPercentage: 0,
  });

  // Add student to course enrolled students
  await Course.findByIdAndUpdate(payment.course, {
    $addToSet: { enrolledStudents: payment.student },
  });

  res.status(200).json({
    success: true,
    message: "Payment verified and enrollment successful",
    data: { payment, enrollment },
  });
});

// @desc    Get payment history
// @route   GET /api/payments/history
// @access  Private
export const getPaymentHistory = catchAsync(async (req, res) => {
  const query = { student: req.user._id };

  // If tutor, show their earnings
  if (req.user.role === "tutor") {
    query.tutor = req.user._id;
    delete query.student;
  }

  // Get unique payments (avoid duplicates)
  const payments = await Payment.find(query)
    .populate("course", "title thumbnail")
    .populate("student", "name email")
    .sort("-createdAt");

  // Remove duplicate payments for same course
  const uniquePayments = payments.reduce((acc, payment) => {
    const existing = acc.find(
      (p) => p.course?._id?.toString() === payment.course?._id?.toString(),
    );
    if (!existing) {
      acc.push(payment);
    } else {
      // Keep the completed one if exists, otherwise keep the first
      if (payment.status === "completed" && existing.status !== "completed") {
        const index = acc.findIndex(
          (p) => p.course?._id?.toString() === payment.course?._id?.toString(),
        );
        acc[index] = payment;
      }
    }
    return acc;
  }, []);

  const total = uniquePayments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.amount, 0);

  res.status(200).json({
    success: true,
    count: uniquePayments.length,
    totalAmount: total,
    data: { payments: uniquePayments },
  });
});

// @desc    Request refund
// @route   POST /api/payments/:id/refund
// @access  Private/Student
export const requestRefund = catchAsync(async (req, res, next) => {
  if (!razorpay) {
    return next(new AppError("Payment provider not configured", 503));
  }
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    return next(new AppError("Payment not found", 404));
  }

  // Check ownership
  if (payment.student.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  // Check if payment is completed
  if (payment.status !== "completed") {
    return next(new AppError("Only completed payments can be refunded", 400));
  }

  // Check refund eligibility (e.g., within 7 days)
  const daysSincePurchase = Math.floor(
    (Date.now() - payment.createdAt) / (1000 * 60 * 60 * 24),
  );

  if (daysSincePurchase > 7) {
    return next(new AppError("Refund period has expired (7 days limit)", 400));
  }

  // Process refund with Razorpay
  const refund = await razorpay.payments.refund(payment.razorpayPaymentId, {
    amount: payment.amount * 100,
  });

  // Update payment status
  payment.status = "refunded";
  await payment.save();

  // Remove enrollment
  await Enrollment.findOneAndDelete({
    student: payment.student,
    course: payment.course,
  });

  // Remove student from course
  await Course.findByIdAndUpdate(payment.course, {
    $pull: { enrolledStudents: payment.student },
  });

  res.status(200).json({
    success: true,
    message: "Refund processed successfully",
    data: { refund },
  });
});

// @desc    Retry failed/expired payment
// @route   POST /api/payments/:id/retry
// @access  Private/Student
export const retryPayment = catchAsync(async (req, res, next) => {
  if (!razorpay) {
    return next(new AppError("Payment provider not configured", 503));
  }

  const oldPayment = await Payment.findById(req.params.id).populate("course");

  if (!oldPayment) {
    return next(new AppError("Payment not found", 404));
  }

  // Check ownership
  if (oldPayment.student.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  // Only allow retry for failed/expired payments
  if (!["failed", "expired", "pending"].includes(oldPayment.status)) {
    return next(
      new AppError(
        "Only failed, expired or pending payments can be retried",
        400,
      ),
    );
  }

  // Check if already enrolled
  const existingEnrollment = await Enrollment.findOne({
    student: req.user._id,
    course: oldPayment.course._id,
  });

  if (existingEnrollment) {
    return next(new AppError("Already enrolled in this course", 400));
  }

  // Create new Razorpay order
  const options = {
    amount: oldPayment.amount * 100,
    currency: "INR",
    receipt: `receipt_retry_${Date.now()}`,
    notes: {
      courseId: oldPayment.course._id.toString(),
      studentId: req.user._id.toString(),
      tutorId: oldPayment.tutor.toString(),
      previousPaymentId: oldPayment._id.toString(),
    },
  };

  const order = await razorpay.orders.create(options);

  // Create new payment record
  const newPayment = await Payment.create({
    student: req.user._id,
    course: oldPayment.course._id,
    tutor: oldPayment.tutor,
    amount: oldPayment.amount,
    razorpayOrderId: order.id,
  });

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      courseTitle: oldPayment.course.title,
    },
  });
});
