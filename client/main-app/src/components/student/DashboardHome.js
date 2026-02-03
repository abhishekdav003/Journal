/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { FiClock, FiPlayCircle, FiMoreHorizontal } from "react-icons/fi";
import { getDashboardStats } from "@/services/apiService";

const DashboardHome = ({ user }) => {
  const router = useRouter();
  const currentUser = user?.user || user || null;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardStats();
        if (response.data.success) {
          setDashboardData(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  const handleContinueCourse = (courseId, courseTitle) => {
    const courseName = courseTitle.toLowerCase().replace(/\s+/g, "-");
    router.push(`/learn/${courseId}/${courseName}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const stats = dashboardData?.stats || {
    enrolledCourses: 0,
    totalTutorials: 0,
    overallProgress: 0,
  };
  const activeCourses = dashboardData?.activeCourses || [];
  const coursePerformance = dashboardData?.coursePerformance || [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. TOP SECTION: Welcome Banner + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Banner */}
        <div className="lg:col-span-2 bg-linear-to-br from-[#1E1E2E] via-[#2B2B40] to-[#1E1E2E] p-8 rounded-3xl relative overflow-hidden border border-purple-500/20 shadow-2xl shadow-purple-900/20 hover:shadow-purple-800/30 transition-all duration-300">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-gray-300 text-xs font-semibold bg-[#2B2B40]/80 backdrop-blur-sm inline-block px-4 py-2 rounded-full border border-gray-700/50">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </p>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-2 leading-tight">
              Welcome back,{" "}
              <span className="bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                {currentUser?.name || "Student"}!
              </span>
            </h1>
            <p className="text-gray-400 mt-3 max-w-md text-sm leading-relaxed">
              You have completed{" "}
              <span className="text-purple-400 font-bold">
                {stats.overallProgress}%
              </span>{" "}
              of your goal this week. Keep pushing forward! 🚀
            </p>
          </div>
          {/* Enhanced decorative elements */}
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-pink-600/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl"></div>
        </div>

        {/* Stat Card */}
        <div className="bg-linear-to-br from-[#E0Cffc] to-[#F3E8FF] p-6 rounded-3xl flex flex-col justify-between text-[#2D1B4E] shadow-xl shadow-purple-200/50 hover:shadow-2xl hover:shadow-purple-300/60 transition-all duration-300 hover:-translate-y-1">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/60 rounded-2xl backdrop-blur-sm shadow-lg">
              <span className="text-3xl">🎓</span>
            </div>
            <button className="hover:bg-white/30 p-2 rounded-lg transition-colors">
              <FiMoreHorizontal className="w-6 h-6" />
            </button>
          </div>
          <div>
            <p className="text-5xl font-black mt-4 bg-linear-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
              {String(stats.enrolledCourses).padStart(2, "0")}
            </p>
            <p className="font-bold text-lg mt-1">Enrolled Courses</p>
            <div className="w-full h-2 bg-white/60 rounded-full mt-4 overflow-hidden shadow-inner">
              <div
                className="h-full bg-linear-to-r from-purple-600 to-pink-600 rounded-full transition-all duration-700 ease-out shadow-lg"
                style={{ width: `${stats.overallProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-purple-700 font-semibold mt-2">
              {stats.overallProgress}% Complete
            </p>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE COURSES SECTION */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-white flex items-center gap-3">
              <span className="w-1 h-8 bg-linear-to-b from-purple-500 to-pink-500 rounded-full"></span>
              Active Courses
            </h2>
            <p className="text-gray-400 text-sm mt-1 ml-7">
              Continue your learning journey
            </p>
          </div>
          <button className="bg-linear-to-r from-purple-600 to-pink-600 text-white text-sm px-5 py-2.5 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all duration-300 font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105">
            See All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCourses.length === 0 ? (
            <div className="col-span-full text-center py-16 bg-[#1E1E2E] rounded-3xl border border-dashed border-gray-700">
              <div className="text-6xl mb-4">📚</div>
              <p className="text-gray-400 text-lg">No active courses yet</p>
              <p className="text-gray-500 text-sm mt-2">
                Enroll in a course to get started!
              </p>
            </div>
          ) : (
            activeCourses.slice(0, 3).map((course) => (
              <div
                key={course._id}
                className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-5 rounded-3xl border border-gray-800/50 hover:border-purple-500/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-purple-900/30 hover:-translate-y-2"
              >
                {/* Course Thumbnail */}
                <div className="h-44 bg-linear-to-br from-[#2B2B40] to-[#1E1E2E] rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center shadow-lg group-hover:shadow-purple-500/20 transition-all duration-300">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      style={{ borderRadius: "1rem" }}
                    />
                  ) : (
                    <div className="text-center">
                      <div className="w-16 h-16 bg-linear-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-3 text-white font-bold text-xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                        {course.category?.substring(0, 2).toUpperCase() || "CO"}
                      </div>
                      <p className="text-xs text-gray-400 font-medium">
                        {course.category}
                      </p>
                    </div>
                  )}
                  {/* Overlay gradient on hover */}
                  <div className="absolute inset-0 bg-linear-to-t from-purple-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 truncate group-hover:text-purple-400 transition-colors">
                  {course.title}
                </h3>

                <div className="flex items-center gap-3 text-xs text-gray-400 mb-5 mt-3">
                  <span className="flex items-center gap-1.5 bg-[#2B2B40] px-3 py-1.5 rounded-lg border border-gray-700/50">
                    <FiPlayCircle className="text-purple-400" />{" "}
                    {course.lectureCount || 0} Lessons
                  </span>
                  <span className="flex items-center gap-1.5 bg-[#2B2B40] px-3 py-1.5 rounded-lg border border-gray-700/50">
                    <FiClock className="text-pink-400" />{" "}
                    {course.duration
                      ? `${Math.round(course.duration / 60)}h`
                      : "0h"}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() =>
                      handleContinueCourse(course._id, course.title)
                    }
                    className="flex-1 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 rounded-xl text-sm font-bold transition-all duration-300 shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/50 hover:scale-[1.02]"
                  >
                    Continue
                  </button>
                  <div className="w-14 h-14 rounded-full border-2 border-purple-500 flex items-center justify-center text-xs font-bold text-purple-400 bg-[#1E1E2E] shadow-lg group-hover:scale-110 transition-transform">
                    {Math.round(course.progress)}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 3. PERFORMANCE & CALENDAR ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Graph */}
        <div className="lg:col-span-2 bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-6 rounded-3xl border border-gray-800/50 shadow-xl hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-white text-lg">
                Course Performance
              </h3>
              <p className="text-gray-400 text-xs mt-1">
                Track your progress across courses
              </p>
            </div>
            <select className="bg-[#2B2B40] text-xs px-4 py-2 rounded-lg outline-none border border-gray-700 text-white hover:border-purple-500 transition-colors cursor-pointer">
              <option>All Courses</option>
            </select>
          </div>
          {coursePerformance.length === 0 ? (
            <div className="text-center py-16 bg-[#1E1E2E] rounded-2xl border border-dashed border-gray-700">
              <div className="text-5xl mb-3">📊</div>
              <p className="text-gray-400">No course data available</p>
              <p className="text-gray-500 text-sm mt-1">
                Enroll in courses to see performance
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between h-52 gap-3 px-2 mb-2">
                {coursePerformance.map((data, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-xl h-full relative group flex flex-col justify-end items-center overflow-hidden"
                  >
                    {/* Background bar */}
                    <div className="absolute bottom-0 w-full h-full bg-linear-to-t from-[#2B2B40] to-[#1E1E2E] rounded-t-xl border-t-2 border-gray-700"></div>

                    {/* Progress percentage at top */}
                    <div className="absolute -top-7 text-xs font-bold text-purple-400 group-hover:text-purple-300 transition-colors z-10 bg-[#1E1E2E] px-2 py-1 rounded-lg border border-purple-500/30">
                      {Math.round(data.progress)}%
                    </div>

                    {/* Colored progress bar with animation */}
                    <div
                      style={{ height: `${data.progress}%` }}
                      className="w-full bg-linear-to-t from-purple-600 via-purple-500 to-pink-500 rounded-t-xl transition-all duration-700 ease-out relative z-10 group-hover:from-purple-500 group-hover:via-purple-400 group-hover:to-pink-400 shadow-lg shadow-purple-500/50"
                    >
                      {/* Shine effect */}
                      <div className="absolute inset-0 bg-linear-to-t from-transparent via-white/10 to-transparent group-hover:via-white/20 transition-all"></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between gap-3 mt-8 px-2">
                {coursePerformance.map((data, i) => (
                  <div key={i} className="flex-1 text-center">
                    <p
                      className="text-[9px] text-gray-400 leading-tight line-clamp-2 group-hover:text-purple-400 transition-colors font-medium"
                      style={{
                        writingMode: "vertical-rl",
                        textOrientation: "mixed",
                        height: "65px",
                        margin: "0 auto",
                      }}
                    >
                      {data.shortName}
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Linked Tutors */}
        <div className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-6 rounded-3xl border border-gray-800/50 shadow-xl hover:shadow-2xl hover:shadow-purple-900/20 transition-all duration-300">
          <div className="mb-4">
            <h3 className="font-bold text-white text-lg">Your Tutors</h3>
            <p className="text-gray-400 text-xs mt-1">Connected instructors</p>
          </div>
          <div className="space-y-3">
            {activeCourses.length === 0 ? (
              <div className="text-center py-8 bg-[#1E1E2E] rounded-2xl border border-dashed border-gray-700">
                <div className="text-4xl mb-2">👨‍🏫</div>
                <p className="text-gray-400 text-sm">No tutors yet</p>
              </div>
            ) : (
              (() => {
                // Deduplicate tutors by tutor ID
                const uniqueTutors = [];
                const seenTutorIds = new Set();

                activeCourses.forEach((course) => {
                  const tutorId = course.tutor?._id;
                  if (tutorId && !seenTutorIds.has(tutorId)) {
                    seenTutorIds.add(tutorId);
                    uniqueTutors.push(course);
                  }
                });

                return uniqueTutors.slice(0, 3).map((course) => (
                  <div
                    key={course._id}
                    className="bg-linear-to-r from-[#2B2B40] to-[#1E1E2E] p-4 rounded-2xl flex items-center gap-3 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300 group hover:shadow-lg hover:shadow-purple-500/20"
                  >
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-lg group-hover:scale-110 transition-transform">
                      {course.tutor?.avatar ? (
                        <img
                          src={course.tutor.avatar}
                          alt={course.tutor.name}
                          className="object-cover"
                          sizes="48px"
                          style={{ borderRadius: "9999px" }}
                        />
                      ) : (
                        course.tutor?.name?.charAt(0).toUpperCase() || "T"
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                        {course.tutor?.name || "Tutor"}
                      </p>
                      <p className="text-xs text-gray-400">{course.category}</p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                ));
              })()
            )}
          </div>
          {activeCourses.length > 0 && (
            <button className="w-full mt-4 py-2.5 text-sm text-purple-400 hover:text-white hover:bg-purple-600/20 rounded-xl transition-all duration-300 font-semibold border border-transparent hover:border-purple-500/30">
              View All Tutors →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
