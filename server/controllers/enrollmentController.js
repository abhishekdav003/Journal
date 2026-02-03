import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Payment from "../models/Payment.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

// @desc    Check if user is enrolled in a course
// @route   GET /api/enrollments/check/:courseId
// @access  Public (but requires token if user wants to check enrollment)
export const checkEnrollment = catchAsync(async (req, res, next) => {
  // If no user (not authenticated), return not enrolled
  if (!req.user) {
    return res.status(200).json({
      success: true,
      enrolled: false,
      data: null,
    });
  }

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  res.status(200).json({
    success: true,
    enrolled: !!enrollment,
    data: enrollment,
  });
});

// @desc    Enroll in a course
// @route   POST /api/enrollments
// @access  Private/Student
export const createEnrollment = catchAsync(async (req, res, next) => {
  const { courseId } = req.body;

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  const existingEnrollment = await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
  });

  if (existingEnrollment) {
    return next(new AppError("Already enrolled in this course", 400));
  }

  // Create enrollment
  const enrollment = await Enrollment.create({
    student: req.user._id,
    course: courseId,
    enrolledAt: Date.now(),
    progress: [], // Empty array initially
    completionPercentage: 0,
  });

  // Create payment record for free courses too (₹0)
  const payment = await Payment.create({
    student: req.user._id,
    course: courseId,
    tutor: course.tutor,
    amount: course.price || 0,
    status: "completed", // Free courses are automatically completed
    razorpayOrderId: `FREE_${Date.now()}`,
  });

  // Link payment to enrollment
  enrollment.payment = payment._id;
  await enrollment.save();

  // Update course enrolled students count
  await Course.findByIdAndUpdate(courseId, {
    $addToSet: { enrolledStudents: req.user._id },
  });

  res.status(201).json({
    success: true,
    message: "Successfully enrolled in the course",
    data: { enrollment },
  });
});

// @desc    Get enrollment details
// @route   GET /api/enrollments/:courseId
// @access  Private/Student
export const getEnrollment = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  }).populate({
    path: "course",
    populate: { path: "tutor", select: "name email avatar" },
  });

  if (!enrollment) {
    return next(new AppError("Enrollment not found", 404));
  }

  res.status(200).json({
    success: true,
    data: { enrollment },
  });
});

// @desc    Update lecture progress
// @route   PATCH /api/enrollments/:courseId/progress
// @access  Private/Student
export const updateProgress = catchAsync(async (req, res, next) => {
  const { lectureId, completed } = req.body;

  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  });

  if (!enrollment) {
    return next(new AppError("Enrollment not found", 404));
  }

  // Find and update the lecture progress
  const lectureProgress = enrollment.progress.find(
    (p) => p.lecture.toString() === lectureId,
  );

  if (!lectureProgress) {
    return next(new AppError("Lecture not found in this course", 404));
  }

  lectureProgress.completed = completed;
  if (completed) {
    lectureProgress.completedAt = Date.now();
  } else {
    lectureProgress.completedAt = undefined;
  }

  // Update completion percentage
  enrollment.updateProgress();

  await enrollment.save();

  res.status(200).json({
    success: true,
    message: "Progress updated successfully",
    data: { enrollment },
  });
});

// @desc    Get all enrollments for a course (Tutor only)
// @route   GET /api/enrollments/course/:courseId/students
// @access  Private/Tutor
export const getCourseEnrollments = catchAsync(async (req, res, next) => {
  // Verify course ownership
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  if (course.tutor.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to view these enrollments", 403));
  }

  const enrollments = await Enrollment.find({ course: req.params.courseId })
    .populate("student", "name email")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: { enrollments },
  });
});

// @desc    Get all students enrolled in a tutor's courses
// @route   GET /api/enrollments/tutor/my-students
export const getTutorStudents = catchAsync(async (req, res, next) => {
  // Find all courses owned by this tutor
  const courses = await Course.find({ tutor: req.user._id });
  const courseIds = courses.map((c) => c._id);

  // Find all enrollments for those courses
  const enrollments = await Enrollment.find({ course: { $in: courseIds } })
    .populate("student", "name email")
    .populate("course", "title")
    .sort("-createdAt");

  res.status(200).json({
    success: true,
    count: enrollments.length,
    data: { enrollments },
  });
});
