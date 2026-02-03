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

  const handleViewTutorProfile = (tutorId) => {
    router.push(`/tutor/${tutorId}`);
  };

  // Calculate tutor's average rating from their courses (only count courses with ratings > 0)
  const calculateTutorRating = (tutorId) => {
    const tutorCourses = activeCourses.filter(
      course => course.tutor?._id === tutorId && course.rating > 0
    );
    
    if (tutorCourses.length === 0) return null;
    
    const totalRating = tutorCourses.reduce((sum, course) => sum + course.rating, 0);
    const avgRating = totalRating / tutorCourses.length;
    
    return avgRating.toFixed(1);
  };

  // Count total students enrolled in tutor's courses
  const countTutorStudents = (tutorId) => {
    const tutorCourses = activeCourses.filter(
      course => course.tutor?._id === tutorId
    );
    
    const totalStudents = tutorCourses.reduce(
      (sum, course) => sum + (course.enrolledStudents?.length || 0),
      0
    );
    
    return totalStudents;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Welcome Banner Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#1E1E2E] p-8 rounded-3xl border border-gray-800/50">
            <div className="h-4 bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-2/3 mb-3"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="bg-[#1E1E2E] p-6 rounded-3xl border border-gray-800/50">
            <div className="h-12 bg-gray-700 rounded-full w-12 mb-4"></div>
            <div className="h-12 bg-gray-700 rounded w-20 mt-4"></div>
            <div className="h-4 bg-gray-700 rounded w-32 mt-2"></div>
          </div>
        </div>
        {/* Active Courses Skeleton */}
        <div>
          <div className="h-6 bg-gray-700 rounded w-48 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1E1E2E] p-5 rounded-3xl border border-gray-800/50">
                <div className="h-44 bg-gray-700 rounded-2xl mb-4"></div>
                <div className="h-5 bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="flex gap-3 mb-5">
                  <div className="h-6 bg-gray-700 rounded w-20"></div>
                  <div className="h-6 bg-gray-700 rounded w-16"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-12 bg-gray-700 rounded-xl flex-1"></div>
                  <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Performance Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#1E1E2E] p-6 rounded-3xl border border-gray-800/50">
            <div className="h-6 bg-gray-700 rounded w-48 mb-6"></div>
            <div className="h-52 bg-gray-700 rounded-xl"></div>
          </div>
          <div className="bg-[#1E1E2E] p-6 rounded-3xl border border-gray-800/50">
            <div className="h-6 bg-gray-700 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-700 rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
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
            activeCourses
              .sort((a, b) => {
                // First priority: incomplete courses (progress < 100)
                const aIncomplete = a.progress < 100 ? 1 : 0;
                const bIncomplete = b.progress < 100 ? 1 : 0;
                if (aIncomplete !== bIncomplete) return bIncomplete - aIncomplete;
                
                // Second priority: courses with progress (started but not complete)
                const aHasProgress = a.progress > 0 && a.progress < 100 ? 1 : 0;
                const bHasProgress = b.progress > 0 && b.progress < 100 ? 1 : 0;
                if (aHasProgress !== bHasProgress) return bHasProgress - aHasProgress;
                
                // Third priority: last visited (most recent first)
                const aDate = new Date(a.lastVisited || a.enrolledAt || 0);
                const bDate = new Date(b.lastVisited || b.enrolledAt || 0);
                return bDate - aDate;
              })
              .slice(0, 3)
              .map((course) => (
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
        {/* Performance Graph - Enhanced Professional Design */}
        <div className="lg:col-span-2 bg-linear-to-br from-[#1E1E2E] via-[#252535] to-[#1E1E2E] p-8 rounded-3xl border border-purple-500/20 shadow-2xl shadow-purple-900/30 hover:shadow-purple-800/40 transition-all duration-300 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-xl">📊</span>
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-xl bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      Course Performance
                    </h3>
                    <p className="text-gray-400 text-xs mt-0.5">
                      Track your learning journey and achievements
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right mr-2">
                  <p className="text-2xl font-black text-white">
                    {coursePerformance.length > 0 
                      ? Math.round(coursePerformance.reduce((acc, c) => acc + c.progress, 0) / coursePerformance.length)
                      : 0}%
                  </p>
                  <p className="text-[10px] text-gray-400 font-semibold">Avg Progress</p>
                </div>
                <select className="bg-[#2B2B40] text-xs px-4 py-2.5 rounded-xl outline-none border border-gray-700/50 text-white  cursor-pointer font-semibold">
                  <option>All Time</option>
                  <option>This Week</option>
                  <option>This Month</option>
                </select>
              </div>
            </div>
            
            {coursePerformance.length === 0 ? (
              <div className="text-center py-20 bg-[#1E1E2E]/50 rounded-2xl border border-dashed border-gray-700/50 backdrop-blur-sm">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-gray-300 text-lg font-semibold">No course data available</p>
                <p className="text-gray-500 text-sm mt-2">
                  Enroll in courses to see your performance metrics
                </p>
              </div>
            ) : (
              <>
                {/* Grid lines background */}
                <div className="relative bg-[#1E1E2E]/30 rounded-2xl p-6 border border-gray-800/30 backdrop-blur-sm">
                  {/* Horizontal grid lines */}
                  <div className="absolute inset-x-6 top-6 bottom-20 flex flex-col justify-between pointer-events-none">
                    {[100, 75, 50, 25, 0].map((val) => (
                      <div key={val} className="flex items-center gap-3">
                        <span className="text-[10px] text-gray-600 font-bold w-8 text-right">{val}%</span>
                        <div className="flex-1 h-px bg-gray-800/50"></div>
                      </div>
                    ))}
                  </div>

                  {/* Bar Chart */}
                  <div className="flex items-end justify-around h-56 gap-6 px-12 pt-4 relative z-10">
                    {coursePerformance.map((data, i) => {
                      // Dynamic color and styling based on progress
                      const getBarStyles = (progress) => {
                        if (progress >= 75) return {
                          gradient: 'from-emerald-500 via-green-500 to-teal-400',
                          shadow: 'shadow-green-500/50',
                          glow: 'group-hover:shadow-green-400/60',
                          ring: 'ring-green-500/30',
                          badge: 'from-green-600 to-emerald-600'
                        };
                        if (progress >= 50) return {
                          gradient: 'from-blue-500 via-cyan-500 to-blue-400',
                          shadow: 'shadow-blue-500/50',
                          glow: 'group-hover:shadow-blue-400/60',
                          ring: 'ring-blue-500/30',
                          badge: 'from-blue-600 to-cyan-600'
                        };
                        if (progress >= 25) return {
                          gradient: 'from-yellow-500 via-amber-500 to-orange-400',
                          shadow: 'shadow-yellow-500/50',
                          glow: 'group-hover:shadow-yellow-400/60',
                          ring: 'ring-yellow-500/30',
                          badge: 'from-yellow-600 to-orange-600'
                        };
                        return {
                          gradient: 'from-rose-500 via-red-500 to-pink-400',
                          shadow: 'shadow-red-500/50',
                          glow: 'group-hover:shadow-red-400/60',
                          ring: 'ring-red-500/30',
                          badge: 'from-red-600 to-pink-600'
                        };
                      };
                      
                      const styles = getBarStyles(data.progress);
                      
                      return (
                        <div
                          key={i}
                          className="flex-1 max-w-[100px] h-full relative group flex flex-col justify-end items-center cursor-pointer transform hover:-translate-y-2 transition-all duration-300"
                        >
                          {/* Percentage Badge */}
                          <div className={`absolute -top-12 left-1/2 transform -translate-x-1/2 z-30 bg-linear-to-r ${styles.badge} px-4 py-2 rounded-xl border-2 border-white/20 shadow-2xl ${styles.shadow} group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300`}>
                            <p className="text-sm font-black text-white">
                              {Math.round(data.progress)}%
                            </p>
                            <div className="absolute -bottom-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-inherit rotate-45 border-r-2 border-b-2 border-white/20"></div>
                          </div>

                          {/* Progress Bar */}
                          <div
                            style={{ 
                              height: `${Math.max(data.progress, 8)}%`,
                              minHeight: '32px'
                            }}
                            className={`w-full bg-linear-to-t ${styles.gradient} rounded-2xl transition-all duration-700 ease-out relative shadow-2xl ${styles.shadow} ${styles.glow} group-hover:scale-105 ring-4 ${styles.ring} overflow-hidden`}
                          >
                            {/* Animated shine effect */}
                            <div className="absolute inset-0 bg-linear-to-t from-transparent via-white/30 to-white/40 group-hover:via-white/50 transition-all rounded-2xl"></div>
                            {/* Sparkle effect */}
                            <div className="absolute inset-0 bg-gradient-radial from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            {/* Bottom glow line */}
                            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/50 blur-sm"></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Course Names */}
                  <div className="flex justify-around gap-6 mt-6 px-12">
                    {coursePerformance.map((data, i) => (
                      <div key={i} className="flex-1 max-w-[100px] text-center group cursor-pointer">
                        <div className="bg-[#2B2B40]/50 backdrop-blur-sm px-2 py-2 rounded-lg border border-gray-700/30 group-hover:border-purple-500/50 transition-all">
                          <p className="text-xs text-gray-300 group-hover:text-purple-400 transition-colors font-bold truncate">
                            {data.shortName}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-0.5 truncate" title={data.courseName}>
                            {data.lectureCount || 0} lessons
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-3 gap-4 mt-6">
                  <div className="bg-linear-to-br from-green-600/10 to-emerald-600/5 p-4 rounded-2xl border border-green-500/20">
                    <p className="text-2xl font-black text-green-400">
                      {coursePerformance.filter(c => c.progress >= 75).length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-semibold">Excellent Progress</p>
                  </div>
                  <div className="bg-linear-to-br from-blue-600/10 to-cyan-600/5 p-4 rounded-2xl border border-blue-500/20">
                    <p className="text-2xl font-black text-blue-400">
                      {coursePerformance.filter(c => c.progress >= 50 && c.progress < 75).length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-semibold">On Track</p>
                  </div>
                  <div className="bg-linear-to-br from-yellow-600/10 to-orange-600/5 p-4 rounded-2xl border border-yellow-500/20">
                    <p className="text-2xl font-black text-yellow-400">
                      {coursePerformance.filter(c => c.progress < 50).length}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-semibold">Needs Attention</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Your Tutors - Enhanced Design */}
        <div className="bg-linear-to-br from-[#1E1E2E] via-[#252535] to-[#1E1E2E] p-8 rounded-3xl border border-purple-500/20 shadow-2xl shadow-purple-900/30 hover:shadow-purple-800/40 transition-all duration-300 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-600/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-xl">👨‍🏫</span>
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-xl bg-linear-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Your Tutors
                  </h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Expert instructors guiding your journey
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {activeCourses.length === 0 ? (
                <div className="text-center py-12 bg-[#1E1E2E]/50 rounded-2xl border border-dashed border-gray-700/50 backdrop-blur-sm">
                  <div className="text-5xl mb-3">👨‍🏫</div>
                  <p className="text-gray-300 font-semibold">No tutors yet</p>
                  <p className="text-gray-500 text-sm mt-1">Enroll in courses to connect with expert tutors</p>
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

                  return uniqueTutors.slice(0, 4).map((course, index) => {
                    const tutorRating = calculateTutorRating(course.tutor._id);
                    const tutorStudents = countTutorStudents(course.tutor._id);
                    
                    return (
                    <div
                      key={course._id}
                      onClick={() => handleViewTutorProfile(course.tutor._id)}
                      className="bg-linear-to-r from-[#2B2B40]/80 via-[#252535]/60 to-[#1E1E2E]/80 p-5 rounded-2xl flex items-center gap-4 border border-gray-700/30 hover:border-purple-500/50 transition-all duration-300 group hover:shadow-2xl hover:shadow-purple-500/30 cursor-pointer transform hover:-translate-y-1 hover:scale-[1.02] backdrop-blur-sm"
                    >
                      {/* Tutor Avatar with ring */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-linear-to-br from-purple-600 to-pink-600 rounded-full blur-md opacity-50 group-hover:opacity-80 transition-opacity"></div>
                        <div className="relative w-16 h-16 rounded-full bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold overflow-hidden shadow-xl ring-4 ring-purple-500/30 group-hover:ring-purple-400/50 group-hover:scale-110 transition-all duration-300">
                          {course.tutor?.avatar ? (
                            <img
                              src={course.tutor.avatar}
                              alt={course.tutor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-2xl">
                              {course.tutor?.name?.charAt(0).toUpperCase() || "T"}
                            </span>
                          )}
                        </div>
                        {/* Online status indicator */}
                        <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-green-500 rounded-full border-4 border-[#1E1E2E] shadow-lg">
                          <div className="w-full h-full bg-green-400 rounded-full animate-ping opacity-75"></div>
                        </div>
                      </div>
                      
                      {/* Tutor Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-base font-bold text-white group-hover:text-purple-300 transition-colors truncate">
                          {course.tutor?.name || "Tutor"}
                        </p>
                        <p className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors mt-0.5">
                          {course.category}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          {tutorRating ? (
                            <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-lg">
                              <span className="text-yellow-400 text-xs">⭐</span>
                              <span className="text-yellow-300 text-xs font-bold">
                                {tutorRating}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 bg-gray-600/20 px-2 py-1 rounded-lg">
                              <span className="text-gray-400 text-xs">⭐</span>
                              <span className="text-gray-400 text-xs font-bold">
                                New
                              </span>
                            </div>
                          )}
                          <div className="bg-purple-500/20 px-2 py-1 rounded-lg">
                            <span className="text-purple-300 text-xs font-semibold">
                              {tutorStudents} student{tutorStudents !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* View Profile Arrow */}
                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-0 group-hover:translate-x-1">
                        <div className="w-10 h-10 bg-linear-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    );
                  });
                })()
              )}
            </div>
            
            {activeCourses.length > 0 && (() => {
              const uniqueTutorCount = new Set(
                activeCourses.map(course => course.tutor?._id).filter(Boolean)
              ).size;
              
              return uniqueTutorCount > 4 && (
                <button className="w-full mt-5 py-3.5 text-sm text-white bg-linear-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600 hover:to-pink-600 rounded-xl transition-all duration-300 font-bold border border-purple-500/30 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/30 group">
                  <span className="flex items-center justify-center gap-2">
                    View All {uniqueTutorCount} Tutors
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
