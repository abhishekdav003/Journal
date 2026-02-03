import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./layout";
import { useAuth } from "../../context/AuthContext";
import { getEnrolledCourses } from "@/services/apiService";
import {
  FiClock,
  FiPlayCircle,
  FiUser,
  FiBarChart2,
  FiBook,
  FiAward,
} from "react-icons/fi";
import Image from "next/image";

export default function Courses() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, in-progress, completed

  // Redirect unauthenticated users
  useEffect(() => {
    if (authLoading) return;
    const token =
      typeof window !== "undefined" && localStorage.getItem("token");
    if (!token || !user) {
      router.replace("/auth/student?tab=login");
    }
  }, [authLoading, user, router]);

  // Fetch enrolled courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getEnrolledCourses();
        if (response.data.success) {
          setCourses(response.data.data.courses || []);
        }
      } catch (error) {
        console.error("Failed to fetch courses:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user]);

  const getFilteredCourses = () => {
    if (filter === "completed") {
      return courses.filter((c) => c.progress >= 100);
    } else if (filter === "in-progress") {
      return courses.filter((c) => c.progress > 0 && c.progress < 100);
    }
    return courses;
  };

  const filteredCourses = getFilteredCourses();

  const stats = {
    total: courses.length,
    inProgress: courses.filter((c) => c.progress > 0 && c.progress < 100)
      .length,
    completed: courses.filter((c) => c.progress >= 100).length,
    totalMinutes: courses.reduce((sum, c) => {
      // Calculate duration from sections/lectures
      let duration = 0;
      if (c.sections && Array.isArray(c.sections)) {
        c.sections.forEach((section) => {
          if (section.lectures && Array.isArray(section.lectures)) {
            section.lectures.forEach((lecture) => {
              duration += lecture.duration || 0;
            });
          }
        });
      }
      return sum + duration;
    }, 0),
  };

  return (
    <Layout>
      <div className="w-full min-w-0 space-y-8 animate-in fade-in duration-500 pb-10 overflow-x-hidden">
        {/* Header */}
        <div className="relative bg-linear-to-br from-[#1E1E2E] via-[#2B2B40] to-[#1E1E2E] p-8 rounded-2xl border border-purple-500/20 shadow-xl overflow-hidden">
          {/* Decorative blur circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <FiBook className="text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                My Learning Journey
              </h1>
            </div>
            <p className="text-gray-300 text-sm mt-2 ml-15">
              🎯 Track your progress and continue learning
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Courses */}
          <div className="bg-linear-to-br from-purple-900/40 to-purple-800/40 p-6 rounded-2xl border border-purple-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <FiBook className="text-purple-400" size={20} />
              </div>
              <span className="text-purple-300 text-sm font-medium">Total</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.total}</p>
            <p className="text-xs text-purple-200 mt-1">Enrolled</p>
          </div>

          {/* In Progress */}
          <div className="bg-linear-to-br from-blue-900/40 to-blue-800/40 p-6 rounded-2xl border border-blue-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <FiPlayCircle className="text-blue-400" size={20} />
              </div>
              <span className="text-blue-300 text-sm font-medium">Active</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.inProgress}</p>
            <p className="text-xs text-blue-200 mt-1">In Progress</p>
          </div>

          {/* Completed */}
          <div className="bg-linear-to-br from-green-900/40 to-green-800/40 p-6 rounded-2xl border border-green-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <FiAward className="text-green-400" size={20} />
              </div>
              <span className="text-green-300 text-sm font-medium">Done</span>
            </div>
            <p className="text-3xl font-bold text-white">{stats.completed}</p>
            <p className="text-xs text-green-200 mt-1">Completed</p>
          </div>

          {/* Total Time */}
          <div className="bg-linear-to-br from-pink-900/40 to-pink-800/40 p-6 rounded-2xl border border-pink-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <FiClock className="text-pink-400" size={20} />
              </div>
              <span className="text-pink-300 text-sm font-medium">Time</span>
            </div>
            <p className="text-3xl font-bold text-white">
              {Math.floor(stats.totalMinutes / 60)}
            </p>
            <p className="text-xs text-pink-200 mt-1">Hours</p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter("all")}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              filter === "all"
                ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105"
                : "bg-[#1E1E2E] text-gray-400 border border-gray-700 hover:border-purple-500/50 hover:text-white"
            }`}
          >
            📚 All Courses ({courses.length})
          </button>
          <button
            onClick={() => setFilter("in-progress")}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              filter === "in-progress"
                ? "bg-linear-to-r from-blue-600 to-cyan-600 text-white shadow-lg scale-105"
                : "bg-[#1E1E2E] text-gray-400 border border-gray-700 hover:border-blue-500/50 hover:text-white"
            }`}
          >
            🟢 In Progress ({stats.inProgress})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${
              filter === "completed"
                ? "bg-linear-to-r from-green-600 to-emerald-600 text-white shadow-lg scale-105"
                : "bg-[#1E1E2E] text-gray-400 border border-gray-700 hover:border-green-500/50 hover:text-white"
            }`}
          >
            ✅ Completed ({stats.completed})
          </button>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-[#1E1E2E] rounded-2xl border border-gray-800 overflow-hidden animate-pulse"
              >
                <div className="h-48 bg-gray-800"></div>
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                  <div className="h-2 bg-gray-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] rounded-2xl border border-purple-500/20 p-16 text-center">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <FiBook className="text-purple-400 text-4xl" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              No Courses Found
            </h3>
            <p className="text-gray-400 mb-6">
              {filter === "all"
                ? "You haven't enrolled in any courses yet"
                : filter === "completed"
                  ? "No completed courses yet. Keep learning!"
                  : "No courses in progress. Start learning now!"}
            </p>
            <button
              onClick={() => router.push("/")}
              className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              🔍 Browse Courses
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => {
              const progress = course.progress || 0;
              const isCompleted = progress >= 100;

              // Calculate lecture count and duration from sections
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

              return (
                <div
                  key={course._id}
                  className="group bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] rounded-2xl border border-purple-500/20 overflow-hidden shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 cursor-pointer"
                  onClick={() => router.push(`/course/${course._id}`)}
                >
                  {/* Thumbnail */}
                  <div className="relative h-48 overflow-hidden bg-gray-900">
                    {course.thumbnail ? (
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        width={400}
                        height={192}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-purple-900/50 to-pink-900/50">
                        <FiBook className="text-6xl text-purple-400/50" />
                      </div>
                    )}

                    {/* Progress Badge */}
                    {isCompleted ? (
                      <div className="absolute top-3 right-3 bg-linear-to-r from-green-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                        <FiAward size={14} /> Completed
                      </div>
                    ) : progress > 0 ? (
                      <div className="absolute top-3 right-3 bg-linear-to-r from-blue-500 to-cyan-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        {Math.round(progress)}% Done
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 bg-linear-to-r from-purple-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        🆕 New
                      </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    {/* Title */}
                    <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-purple-400 transition-colors">
                      {course.title}
                    </h3>

                    {/* Tutor */}
                    {course.tutor && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <FiUser size={14} />
                        <span>{course.tutor.name}</span>
                      </div>
                    )}

                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <FiPlayCircle size={14} />
                        <span>{lectureCount} Lectures</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock size={14} />
                        <span>
                          {Math.floor(courseDuration / 60)}h{" "}
                          {courseDuration % 60}m
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 font-medium">
                          Progress
                        </span>
                        <span className="text-purple-400 font-bold">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-linear-to-r from-purple-500 via-purple-400 to-pink-500 rounded-full transition-all duration-500 relative"
                          style={{ width: `${progress}%` }}
                        >
                          <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                    </div>

                    {/* Continue Button */}
                    <button
                      className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                      onClick={(e) => {
                        e.stopPropagation();
                        const courseName = course.title
                          .toLowerCase()
                          .replace(/\s+/g, "-");
                        router.push(`/learn/${course._id}/${courseName}`);
                      }}
                    >
                      <FiPlayCircle size={18} />
                      {isCompleted
                        ? "Review Course"
                        : progress > 0
                          ? "Continue Learning"
                          : "Start Course"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
