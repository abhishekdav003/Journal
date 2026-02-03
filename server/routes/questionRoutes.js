import express from "express";
import Question from "../models/Question.js";
import Course from "../models/Course.js";
import { protect, restrictTo } from "../middleware/auth.js";
import { catchAsync } from "../utils/catchAsync.js";

const router = express.Router();
router.use(protect);

// GET all questions for a course
router.get(
  "/course/:courseId",
  catchAsync(async (req, res) => {
    const questions = await Question.find({ course: req.params.courseId })
      .populate("student", "name avatar")
      .populate("answers.user", "name avatar")
      .sort("-createdAt");

    res.status(200).json({
      success: true,
      data: { questions, total: questions.length },
    });
  }),
);

// POST - Create a new question
router.post(
  "/course/:courseId",
  restrictTo("student"),
  catchAsync(async (req, res) => {
    const { question, lectureId } = req.body;
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
        message: "You must be enrolled in this course to ask questions",
      });
    }

    // Create question
    const newQuestion = await Question.create({
      course: courseId,
      student: req.user._id,
      lecture: lectureId || null,
      question,
    });

    const populatedQuestion = await Question.findById(newQuestion._id).populate(
      "student",
      "name avatar",
    );

    res.status(201).json({
      success: true,
      data: populatedQuestion,
    });
  }),
);

// POST - Add an answer to a question
router.post(
  "/:questionId/answer",
  catchAsync(async (req, res) => {
    const { answer } = req.body;
    const questionId = req.params.questionId;

    const question = await Question.findById(questionId);
    if (!question) {
      return res
        .status(404)
        .json({ success: false, message: "Question not found" });
    }

    question.answers.push({
      user: req.user._id,
      answer,
    });

    await question.save();

    const updatedQuestion = await Question.findById(questionId)
      .populate("student", "name avatar")
      .populate("answers.user", "name avatar");

    res.status(200).json({
      success: true,
      data: updatedQuestion,
    });
  }),
);

export default router;
