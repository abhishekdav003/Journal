import Enrollment from "../models/Enrollment.js";
import Course from "../models/Course.js";
import Payment from "../models/Payment.js";
import { catchAsync } from "../utils/catchAsync.js";

// @desc    Get dashboard stats (Handles BOTH Tutor and Student)
// @route   GET /api/dashboard/stats
// @access  Private
export const getDashboardStats = catchAsync(async (req, res) => {
  // --------------------------
  // TUTOR DASHBOARD LOGIC
  // --------------------------
  if (req.user.role === "tutor") {
    const tutorId = req.user._id;

    // 1. Basic Counters
    const totalCourses = await Course.countDocuments({ tutor: tutorId });

    const courses = await Course.find({ tutor: tutorId }).select("_id");
    const courseIds = courses.map((c) => c._id);
    const totalStudents = await Enrollment.countDocuments({
      course: { $in: courseIds },
    });

    // 2. Revenue Calculation
    const payments = await Payment.find({
      course: { $in: courseIds },
      status: "completed",
    })
    .sort({ createdAt: -1 })
    .populate('student', 'name email')
    .populate('course', 'title');
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Revenue Graph Data (Year-based or All-time, with 0 revenue months included)
    const yearParam = req.query.year;
    let graphData = [];

    if (yearParam === "all") {
      // All-time data grouped by year-month
      const monthlyRevenue = await Payment.aggregate([
        {
          $match: {
            course: { $in: courseIds },
            status: "completed",
          },
        },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            total: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]);

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

      graphData = monthlyRevenue.map((item) => ({
        name: `${monthNames[item._id.month - 1]} ${item._id.year}`,
        revenue: item.total,
      }));
    } else {
      // Year-specific data
      const year = parseInt(yearParam) || new Date().getFullYear();
      const currentDate = new Date();
      const startOfYear = new Date(year, 0, 1);
      const endOfMonth = new Date(year, currentDate.getMonth(), 31, 23, 59, 59);

      const monthlyRevenue = await Payment.aggregate([
        {
          $match: {
            course: { $in: courseIds },
            status: "completed",
            createdAt: { $gte: startOfYear, $lte: endOfMonth },
          },
        },
        { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } },
      ]);

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

      // Show all 12 months for all years
      const monthsToShow = 12;

      for (let i = 0; i < monthsToShow; i++) {
        const monthName = monthNames[i];

        const monthRevenueData = monthlyRevenue.find(item => item._id === i + 1);
        graphData.push({
          name: monthName,
          revenue: monthRevenueData ? monthRevenueData.total : 0,
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        totalCourses,
        totalStudents,
        totalRevenue,
        graphData,
        recentTransactions: payments.slice(0, 5),
      },
    });
  }

  // --------------------------
  // STUDENT DASHBOARD LOGIC
  // --------------------------
  const studentId = req.user._id;

  const enrollments = await Enrollment.find({ student: studentId })
    .populate({
      path: "course",
      select:
        "title thumbnail category tutor modules lectures totalDuration rating numReviews enrolledStudents",
      populate: { path: "tutor", select: "name email avatar" },
    })
    .sort({ createdAt: -1 });

  let totalTutorials = 0;
  let totalTimeMinutes = 0;

  const activeCourses = enrollments.map((enrollment) => {
    const course = enrollment.course;
    let lectureCount = 0;
    let courseDuration = 0;

    if (course.modules && Array.isArray(course.modules)) {
      course.modules.forEach((module) => {
        if (module.lectures && Array.isArray(module.lectures)) {
          lectureCount += module.lectures.length;
          module.lectures.forEach((lecture) => {
            courseDuration += lecture.duration || 0;
          });
        }
      });
    } else if (course.lectures && Array.isArray(course.lectures)) {
      lectureCount = course.lectures.length;
      course.lectures.forEach((lecture) => {
        courseDuration += lecture.duration || 0;
      });
    } else if (course.totalDuration) {
      courseDuration = course.totalDuration;
    }

    totalTutorials += lectureCount;
    totalTimeMinutes += courseDuration;

    return {
      _id: course._id,
      title: course.title,
      thumbnail: course.thumbnail,
      category: course.category,
      tutor: course.tutor,
      progress: enrollment.completionPercentage || 0,
      lectureCount,
      duration: courseDuration,
      lastAccessed: enrollment.updatedAt,
      rating: course.rating || 0,
      numReviews: course.numReviews || 0,
      enrolledStudents: course.enrolledStudents || [],
    };
  });

  const payments = await Payment.find({ student: studentId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("amount status createdAt")
    .populate("course", "title");

  const overallProgress =
    enrollments.length > 0
      ? Math.round(
          enrollments.reduce(
            (sum, e) => sum + (e.completionPercentage || 0),
            0,
          ) / enrollments.length,
        )
      : 0;

  const coursePerformance = activeCourses.map((course) => ({
    courseName: course.title,
    progress: course.progress,
    shortName: course.title.split(" ").slice(0, 3).join(" "),
    lectureCount: course.lectureCount,
  }));

  res.status(200).json({
    success: true,
    data: {
      stats: {
        enrolledCourses: enrollments.length,
        totalTutorials,
        totalTimeMinutes,
        overallProgress,
      },
      activeCourses,
      recentPayments: payments,
      coursePerformance,
    },
  });
});

// @desc    Get enrolled courses (Keep as is for Student)
export const getEnrolledCourses = catchAsync(async (req, res) => {
  const studentId = req.user._id;
  const enrollments = await Enrollment.find({ student: studentId })
    .populate({
      path: "course",
      populate: { path: "tutor", select: "name email avatar" },
    })
    .sort({ updatedAt: -1 });

  const courses = enrollments.map((enrollment) => ({
    ...enrollment.course.toObject(),
    progress: enrollment.completionPercentage || 0,
    enrollmentId: enrollment._id,
    lastAccessed: enrollment.updatedAt,
  }));

  res.status(200).json({
    success: true,
    count: courses.length,
    data: { courses },
  });
});
