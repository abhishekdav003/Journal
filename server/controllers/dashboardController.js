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
  if (req.user.role === 'tutor') {
    const tutorId = req.user._id;

    // 1. Basic Counters
    const totalCourses = await Course.countDocuments({ tutor: tutorId });
    
    const courses = await Course.find({ tutor: tutorId }).select('_id');
    const courseIds = courses.map(c => c._id);
    const totalStudents = await Enrollment.countDocuments({ course: { $in: courseIds } });

    // 2. Revenue Calculation
    const payments = await Payment.find({ 
      course: { $in: courseIds },
      status: 'completed' 
    });
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // 3. Revenue Graph Data (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Payment.aggregate([
      { $match: { course: { $in: courseIds }, status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$amount" } } },
      { $sort: { "_id": 1 } }
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const graphData = monthlyRevenue.map(item => ({
      name: monthNames[item._id - 1],
      revenue: item.total
    }));

    return res.status(200).json({
      success: true,
      data: {
        totalCourses,
        totalStudents,
        totalRevenue,
        graphData,
        recentTransactions: payments.slice(0, 5)
      }
    });
  }

  // --------------------------
  // STUDENT DASHBOARD LOGIC
  // --------------------------
  const studentId = req.user._id;

  const enrollments = await Enrollment.find({ student: studentId })
    .populate({
      path: "course",
      select: "title thumbnail category tutor sections",
      populate: { path: "tutor", select: "name email" },
    })
    .sort({ createdAt: -1 });

  let totalTutorials = 0;
  let totalTimeMinutes = 0;

  const activeCourses = enrollments.map((enrollment) => {
    const course = enrollment.course;
    let lectureCount = 0;
    let courseDuration = 0;

    if (course.sections && Array.isArray(course.sections)) {
      course.sections.forEach((section) => {
        if (section.lectures && Array.isArray(section.lectures)) {
          lectureCount += section.lectures.length;
          section.lectures.forEach((lecture) => {
            courseDuration += lecture.duration || 0;
          });
        }
      });
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
    };
  });

  const payments = await Payment.find({ student: studentId })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("amount status createdAt")
    .populate("course", "title");

  const overallProgress = enrollments.length > 0
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.completionPercentage || 0), 0) / enrollments.length)
      : 0;

  const coursePerformance = activeCourses.map((course) => ({
    courseName: course.title,
    progress: course.progress,
    shortName: course.title.split(" ").slice(0, 3).join(" "),
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