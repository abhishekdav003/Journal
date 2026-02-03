import express from "express";
import Review from "../models/Review.js";
import Course from "../models/Course.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = express.Router();
router.use(protect);

// 1. GET Reviews for Tutor
router.get(
  "/tutor",
  restrictTo("tutor"),
  catchAsync(async (req, res) => {
    const courses = await Course.find({ tutor: req.user._id }).select("_id");
    const courseIds = courses.map((c) => c._id);

    const reviews = await Review.find({ course: { $in: courseIds } })
      .populate("student", "name avatar")
      .populate("course", "title")
      .sort("-createdAt");

    res.status(200).json({ success: true, data: reviews });
  }),
);

// 2. REPLY to Review
router.patch(
  "/:id/reply",
  restrictTo("tutor"),
  catchAsync(async (req, res) => {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { tutorReply: req.body.reply },
      { new: true },
    );
    res.status(200).json({ success: true, data: review });
  }),
);

// 3. GET Reviews for a Course (Students)
router.get(
  "/course/:courseId",
  catchAsync(async (req, res) => {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate("student", "name avatar")
      .sort("-createdAt");

    // Calculate rating breakdown
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => breakdown[r.rating]++);

    const total = reviews.length;
    const percentages = {};
    Object.keys(breakdown).forEach((star) => {
      percentages[star] =
        total > 0 ? Math.round((breakdown[star] / total) * 100) : 0;
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        breakdown: percentages,
        total,
      },
    });
  }),
);

// 4. CREATE Review (Students only)
router.post(
  "/course/:courseId",
  restrictTo("student"),
  catchAsync(async (req, res) => {
    const { rating, comment } = req.body;
    const courseId = req.params.courseId;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    // Check if user is enrolled
    const isEnrolled = course.enrolledStudents.some(
      (student) => student.toString() === req.user._id.toString(),
    );

    if (!isEnrolled) {
      return res.status(403).json({
        success: false,
        message: "You must be enrolled in this course to leave a review",
      });
    }

    // Check if user already reviewed
    const existingReview = await Review.findOne({
      course: courseId,
      student: req.user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this course",
      });
    }

    // Create review
    const review = await Review.create({
      course: courseId,
      student: req.user._id,
      rating,
      comment,
    });

    // Update course rating
    const allReviews = await Review.find({ course: courseId });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Course.findByIdAndUpdate(courseId, {
      rating: avgRating.toFixed(1),
      numReviews: allReviews.length,
    });

    const populatedReview = await Review.findById(review._id).populate(
      "student",
      "name avatar",
    );

    res.status(201).json({
      success: true,
      data: populatedReview,
    });
  }),
);

// 5. UPDATE Review (Students can edit their own review)
router.patch(
  "/:reviewId",
  restrictTo("student"),
  catchAsync(async (req, res) => {
    const { rating, comment } = req.body;
    const reviewId = req.params.reviewId;

    // Find the review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check if user is the owner of the review
    if (review.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own reviews",
      });
    }

    // Update review
    review.rating = rating;
    review.comment = comment;
    await review.save();

    // Recalculate course rating
    const allReviews = await Review.find({ course: review.course });
    const avgRating =
      allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await Course.findByIdAndUpdate(review.course, {
      rating: avgRating.toFixed(1),
      numReviews: allReviews.length,
    });

    const populatedReview = await Review.findById(review._id).populate(
      "student",
      "name avatar",
    );

    res.status(200).json({
      success: true,
      data: populatedReview,
    });
  }),
);

export default router;
