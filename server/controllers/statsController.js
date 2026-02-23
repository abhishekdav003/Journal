import User from "../models/User.js";
import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import Review from "../models/Review.js";
import Payment from "../models/Payment.js";
import { catchAsync } from "../utils/catchAsync.js";

// @desc    Get platform statistics (public)
// @route   GET /api/stats/platform
// @access  Public
export const getPlatformStats = catchAsync(async (req, res) => {
  // Count total active tutors
  const totalTutors = await User.countDocuments({
    role: "tutor",
    isActive: true,
  });

  // Count total published courses
  const totalCourses = await Course.countDocuments({
    isPublished: true,
    isArchived: false,
  });

  // Count total active students
  const totalStudents = await User.countDocuments({
    role: "student",
    isActive: true,
  });

  // Count total enrollments
  const totalEnrollments = await Enrollment.countDocuments();

  // Get average course rating
  const courses = await Course.find({
    isPublished: true,
    isArchived: false,
    numReviews: { $gt: 0 },
  }).select("rating numReviews");

  const avgRating =
    courses.length > 0
      ? courses.reduce((sum, c) => sum + c.rating, 0) / courses.length
      : 0;

  // Get top categories
  const categoryStats = await Course.aggregate([
    { $match: { isPublished: true, isArchived: false } },
    { $group: { _id: "$category", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalTutors,
      totalCourses,
      totalStudents,
      totalEnrollments,
      avgRating: Math.round(avgRating * 10) / 10,
      topCategories: categoryStats,
    },
  });
});

// @desc    Get recent reviews (public)
// @route   GET /api/stats/reviews
// @access  Public
export const getPublicReviews = catchAsync(async (req, res) => {
  const limit = parseInt(req.query.limit) || 6;

  const reviews = await Review.find()
    .populate("student", "name avatar")
    .populate("course", "title category")
    .sort({ createdAt: -1 })
    .limit(limit);

  res.status(200).json({
    success: true,
    data: { reviews },
  });
});

// @desc    Get admin dashboard statistics
// @route   GET /api/stats/admin-dashboard
// @access  Private/Admin
export const getAdminDashboardStats = catchAsync(async (req, res) => {
  // Count users by role (excluding admins as they're in separate collection)
  const totalUsers = await User.countDocuments();
  const studentCount = await User.countDocuments({ role: "student" });
  const tutorCount = await User.countDocuments({ role: "tutor" });

  // Count courses
  const totalCourses = await Course.countDocuments();
  const publishedCourses = await Course.countDocuments({ isPublished: true });
  const draftCourses = await Course.countDocuments({ isPublished: false });

  // Count enrollments
  const activeEnrollments = await Enrollment.countDocuments({
    status: "active",
  });
  const totalEnrollments = await Enrollment.countDocuments();

  // Payment statistics
  const completedPayments = await Payment.countDocuments({
    status: "completed",
  });
  const pendingPayments = await Payment.countDocuments({ status: "pending" });
  const failedPayments = await Payment.countDocuments({ status: "failed" });

  // Calculate total revenue
  const revenueResult = await Payment.aggregate([
    { $match: { status: "completed" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

  // Calculate average course rating
  const courses = await Course.find({ numReviews: { $gt: 0 } }).select(
    "rating numReviews",
  );
  const averageRating =
    courses.length > 0
      ? courses.reduce((sum, c) => sum + c.rating, 0) / courses.length
      : 0;

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      studentCount,
      tutorCount,
      totalCourses,
      publishedCourses,
      draftCourses,
      activeEnrollments,
      totalEnrollments,
      completedPayments,
      pendingPayments,
      failedPayments,
      totalRevenue,
      averageRating: Math.round(averageRating * 10) / 10,
    },
  });
});

// @desc    Get payment analytics by year and month
// @route   GET /api/stats/payment-analytics
// @access  Private/Admin
export const getPaymentAnalytics = catchAsync(async (req, res) => {
  const { year } = req.query;
  const selectedYear = year ? parseInt(year) : new Date().getFullYear();

  // Get payment data for the selected year
  const startDate = new Date(selectedYear, 0, 1);
  const endDate = new Date(selectedYear, 11, 31, 23, 59, 59);

  const payments = await Payment.aggregate([
    {
      $match: {
        status: "completed",
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalAmount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  // Create array with all 12 months, filling in missing data with 0
  const monthlyData = [];
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  for (let i = 1; i <= 12; i++) {
    const monthData = payments.find((p) => p._id === i);
    monthlyData.push({
      month: monthNames[i - 1],
      monthNumber: i,
      totalAmount: monthData ? monthData.totalAmount : 0,
      count: monthData ? monthData.count : 0,
    });
  }

  // Get available years (starting from 2026)
  const firstPayment = await Payment.findOne()
    .sort({ createdAt: 1 })
    .select("createdAt");
  const currentYear = new Date().getFullYear();
  const startYear = Math.max(
    2026,
    firstPayment ? new Date(firstPayment.createdAt).getFullYear() : 2026,
  );

  const availableYears = [];
  for (let y = startYear; y <= currentYear; y++) {
    availableYears.push(y);
  }

  res.status(200).json({
    success: true,
    data: {
      year: selectedYear,
      monthlyData,
      availableYears,
      totalRevenue: monthlyData.reduce((sum, m) => sum + m.totalAmount, 0),
      totalTransactions: monthlyData.reduce((sum, m) => sum + m.count, 0),
    },
  });
});
