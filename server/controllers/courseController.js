import Course from "../models/Course.js";
import Enrollment from "../models/Enrollment.js";
import { AppError } from "../utils/appError.js";
import { catchAsync } from "../utils/catchAsync.js";
import { deleteFromCloudinary } from "../config/cloudinary.js";

// @desc    Create new course
// @route   POST /api/courses
// @access  Private/Tutor
// CHANGE: Update createCourse to handle production validation
export const createCourse = catchAsync(async (req, res, next) => {
  const { price, title, category, level } = req.body;

  // Basic production validation
  if (price < 0) return next(new AppError("Price cannot be negative", 400));

  const courseData = {
    ...req.body,
    tutor: req.user._id,
  };

  const course = await Course.create(courseData);

  res.status(201).json({
    success: true,
    data: { course },
  });
});

// ADD: Archive Course function (Requirement 2)
export const archiveCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course || course.tutor.toString() !== req.user._id.toString()) {
    return next(new AppError("Course not found or unauthorized", 404));
  }

  course.isArchived = !course.isArchived;
  course.isPublished = false; // Automatically unpublish if archived
  await course.save();

  res.status(200).json({ success: true, message: "Course status updated" });
});

// @desc    Get all courses (published)
// @route   GET /api/courses
// @access  Public
export const getAllCourses = catchAsync(async (req, res) => {
  const { category, level, search, sort = "-createdAt" } = req.query;

  const query = { isPublished: true };

  if (category) query.category = category;
  if (level) query.level = level;
  if (search) query.$text = { $search: search };

  const courses = await Course.find(query)
    .populate("tutor", "name email avatar bio")
    .select("-lectures")
    .sort(sort);

  res.status(200).json({
    success: true,
    count: courses.length,
    data: { courses },
  });
});

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Public
export const getCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate(
    "tutor",
    "name email avatar bio",
  );

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // If not published, only tutor can view
  if (
    !course.isPublished &&
    (!req.user || req.user._id.toString() !== course.tutor._id.toString())
  ) {
    return next(new AppError("Course not found", 404));
  }

  // Check if user is enrolled
  let isEnrolled = false;
  if (req.user) {
    isEnrolled = course.enrolledStudents.some(
      (student) => student.toString() === req.user._id.toString(),
    );
  }

  // If not enrolled, hide non-preview lectures
  if (
    !isEnrolled &&
    (!req.user || req.user._id.toString() !== course.tutor._id.toString())
  ) {
    // Hide non-preview videos from direct lectures array
    course.lectures = course.lectures.map((lecture) => {
      if (!lecture.isPreview) {
        lecture.videoUrl = null;
        lecture.videoPublicId = null;
      }
      return lecture;
    });

    // Hide non-preview videos from modules (if exists)
    if (course.modules?.length) {
      course.modules = course.modules.map((mod) => {
        mod.lectures = (mod.lectures || []).map((lecture) => {
          if (!lecture.isPreview) {
            lecture.videoUrl = null;
            lecture.videoPublicId = null;
          }
          return lecture;
        });
        return mod;
      });
    }

    // Hide non-preview videos from sections (if exists)
    if (course.sections?.length) {
      course.sections = course.sections.map((section) => {
        section.lectures = (section.lectures || []).map((lecture) => {
          if (!lecture.isPreview) {
            lecture.videoUrl = null;
            lecture.videoPublicId = null;
          }
          return lecture;
        });
        return section;
      });
    }
  }

  res.status(200).json({
    success: true,
    data: { course, isEnrolled },
  });
});

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private/Tutor
export const updateCourse = catchAsync(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // Check ownership
  if (course.tutor.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to update this course", 403));
  }

  // If thumbnail is being replaced, delete the old one from Cloudinary
  const isThumbnailChanged =
    req.body.thumbnail && req.body.thumbnail !== course.thumbnail;
  const isPublicIdChanged =
    req.body.thumbnailPublicId &&
    req.body.thumbnailPublicId !== course.thumbnailPublicId;

  if (course.thumbnailPublicId && (isPublicIdChanged || isThumbnailChanged)) {
    await deleteFromCloudinary(course.thumbnailPublicId, "image");
  }

  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Course updated successfully",
    data: { course },
  });
});

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private/Tutor
export const deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // Check ownership
  if (course.tutor.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to delete this course", 403));
  }

  // Check if students are enrolled
  if (course.enrolledStudents.length > 0) {
    return next(
      new AppError("Cannot delete course with enrolled students", 400),
    );
  }

  // Delete all lecture videos from Cloudinary
  for (const lecture of course.lectures) {
    if (lecture.videoPublicId) {
      await deleteFromCloudinary(lecture.videoPublicId, "video");
    }
  }

  // Delete all module lecture videos from Cloudinary
  if (course.modules?.length) {
    for (const mod of course.modules) {
      for (const lecture of mod.lectures || []) {
        if (lecture.videoPublicId) {
          await deleteFromCloudinary(lecture.videoPublicId, "video");
        }
      }
    }
  }

  // Delete thumbnail from Cloudinary
  if (course.thumbnailPublicId) {
    await deleteFromCloudinary(course.thumbnailPublicId, "image");
  }

  await course.deleteOne();

  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});

// @desc    Get tutor's courses
// @route   GET /api/courses/tutor/my-courses
// @access  Private/Tutor
export const getTutorCourses = catchAsync(async (req, res) => {
  const courses = await Course.find({ tutor: req.user._id }).sort("-createdAt");

  res.status(200).json({
    success: true,
    count: courses.length,
    data: { courses },
  });
});

// @desc    Publish/Unpublish course
// @route   PATCH /api/courses/:id/publish
// @access  Private/Tutor
export const togglePublishCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // Check ownership
  if (course.tutor.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to publish this course", 403));
  }

  // Validate course has required content
  const hasLectures =
    course.lectures?.length > 0 ||
    course.modules?.some((mod) => mod.lectures?.length > 0);

  if (!course.isPublished && !hasLectures) {
    return next(new AppError("Cannot publish course without lectures", 400));
  }

  course.isPublished = !course.isPublished;
  await course.save();

  res.status(200).json({
    success: true,
    message: `Course ${course.isPublished ? "published" : "unpublished"} successfully`,
    data: { course },
  });
});

// @desc    Add lecture to course
// @route   POST /api/courses/:id/lectures
// @access  Private/Tutor
export const addLecture = catchAsync(async (req, res, next) => {
  const {
    title,
    description,
    videoUrl,
    videoPublicId,
    duration,
    isPreview,
    moduleId,
  } = req.body;

  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // Check ownership
  if (course.tutor.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to update this course", 403));
  }

  const lecture = {
    title,
    description,
    videoUrl,
    videoPublicId,
    duration,
    isPreview: isPreview || false,
  };

  if (moduleId) {
    if (!course.modules || course.modules.length === 0) {
      return next(new AppError("No sections found for this course", 400));
    }
    const module = course.modules.id(moduleId);
    if (!module) {
      return next(new AppError("Module not found", 404));
    }
    if (!module.lectures) module.lectures = [];
    lecture.order = (module.lectures?.length || 0) + 1;
    module.lectures.push(lecture);
  } else {
    lecture.order = course.lectures.length + 1;
    course.lectures.push(lecture);
  }
  await course.save();

  res.status(201).json({
    success: true,
    message: "Lecture added successfully",
    data: { course },
  });
});

// @desc    Update lecture
// @route   PUT /api/courses/:id/lectures/:lectureId
// @access  Private/Tutor
export const updateLecture = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // Check ownership
  if (course.tutor.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to update this course", 403));
  }

  let lecture = course.lectures.id(req.params.lectureId);
  if (!lecture && course.modules?.length) {
    course.modules.some((mod) => {
      const found = mod.lectures.id(req.params.lectureId);
      if (found) {
        lecture = found;
        return true;
      }
      return false;
    });
  }

  if (!lecture) {
    return next(new AppError("Lecture not found", 404));
  }

  // If video is being replaced, delete old video from Cloudinary
  if (
    req.body.videoPublicId &&
    lecture.videoPublicId &&
    req.body.videoPublicId !== lecture.videoPublicId
  ) {
    await deleteFromCloudinary(lecture.videoPublicId, "video");
  }

  // Update lecture fields
  Object.assign(lecture, req.body);
  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture updated successfully",
    data: { course },
  });
});

// @desc    Delete lecture
// @route   DELETE /api/courses/:id/lectures/:lectureId
// @access  Private/Tutor
export const deleteLecture = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError("Course not found", 404));
  }

  // Check ownership
  if (course.tutor.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized to update this course", 403));
  }

  let lecture = course.lectures.id(req.params.lectureId);
  if (!lecture && course.modules?.length) {
    course.modules.some((mod) => {
      const found = mod.lectures.id(req.params.lectureId);
      if (found) {
        lecture = found;
        return true;
      }
      return false;
    });
  }

  if (!lecture) {
    return next(new AppError("Lecture not found", 404));
  }

  // Delete video from Cloudinary
  if (lecture.videoPublicId) {
    await deleteFromCloudinary(lecture.videoPublicId, "video");
  }

  lecture.deleteOne();
  await course.save();

  res.status(200).json({
    success: true,
    message: "Lecture deleted successfully",
    data: { course },
  });
});

// @desc    Get enrolled courses
// @route   GET /api/courses/student/enrolled
// @access  Private/Student
export const getEnrolledCourses = catchAsync(async (req, res) => {
  const enrollments = await Enrollment.find({ student: req.user._id })
    .populate({
      path: "course",
      populate: { path: "tutor", select: "name email avatar" },
    })
    .sort("-createdAt");

  const courses = enrollments.map((enrollment) => ({
    ...enrollment.course.toObject(),
    progress: enrollment.completionPercentage,
    enrolledAt: enrollment.createdAt,
  }));

  res.status(200).json({
    success: true,
    count: courses.length,
    data: { courses },
  });
});

// @desc    Add a module to a course
// @route   POST /api/courses/:id/modules
export const addModule = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course || course.tutor.toString() !== req.user._id.toString()) {
    return next(new AppError("Course not found or unauthorized", 404));
  }

  course.modules.push({
    title: req.body.title,
    description: req.body.description || "",
    lectures: [],
    order: course.modules.length + 1,
  });

  await course.save();
  res.status(201).json({ success: true, data: course.modules });
});

// @desc    Update a module
// @route   PUT /api/courses/:id/modules/:moduleId
export const updateModule = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course || course.tutor.toString() !== req.user._id.toString()) {
    return next(new AppError("Course not found or unauthorized", 404));
  }

  const module = course.modules.id(req.params.moduleId);
  if (!module) {
    return next(new AppError("Module not found", 404));
  }

  if (req.body.title !== undefined) module.title = req.body.title;
  if (req.body.description !== undefined)
    module.description = req.body.description;

  await course.save();
  res.status(200).json({ success: true, data: course.modules });
});

// @desc    Delete a module
// @route   DELETE /api/courses/:id/modules/:moduleId
export const deleteModule = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course || course.tutor.toString() !== req.user._id.toString()) {
    return next(new AppError("Course not found or unauthorized", 404));
  }

  const module = course.modules.id(req.params.moduleId);
  if (!module) {
    return next(new AppError("Module not found", 404));
  }

  // Delete all lecture videos in this module from Cloudinary
  for (const lecture of module.lectures || []) {
    if (lecture.videoPublicId) {
      await deleteFromCloudinary(lecture.videoPublicId, "video");
    }
  }

  module.deleteOne();
  await course.save();

  res
    .status(200)
    .json({ success: true, message: "Module deleted", data: course.modules });
});
