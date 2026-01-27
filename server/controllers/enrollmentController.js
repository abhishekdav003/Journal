import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";

// @desc    Get enrollment details
// @route   GET /api/enrollments/:courseId
// @access  Private/Student
export const getEnrollment = catchAsync(async (req, res, next) => {
  const enrollment = await Enrollment.findOne({
    student: req.user._id,
    course: req.params.courseId,
  }).populate({
    path: "course",
    populate: { path: "tutor", select: "name email" },
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
