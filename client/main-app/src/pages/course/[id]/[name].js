/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FiArrowLeft,
  FiStar,
  FiUsers,
  FiBook,
  FiClock,
  FiPlay,
  FiCheckCircle,
  FiShoppingCart,
} from "react-icons/fi";
import axios from "axios";

// Helper function to format duration in seconds to mm:ss
const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export default function CourseDetail() {
  const router = useRouter();
  const { id, name } = router.query;
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        setUser(user);
      }
      fetchCourseDetail();
      checkEnrollment(token);
    }
  }, [id]);

  const fetchCourseDetail = async () => {
    try {
      if (!id) return;
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.get(`${baseURL}/api/courses/${id}`);
      // Backend returns { success: true, data: { course, isEnrolled } }
      const courseData =
        response.data.data?.course || response.data.course || response.data;

      // Calculate total duration and lecture count from modules
      let totalDuration = 0;
      let totalLectures = 0;

      if (courseData.modules && Array.isArray(courseData.modules)) {
        courseData.modules.forEach((module) => {
          if (module.lectures && Array.isArray(module.lectures)) {
            module.lectures.forEach((lecture) => {
              totalDuration += lecture.duration || 0;
              totalLectures += 1;
            });
          }
        });
      }

      courseData.calculatedTotalDuration = totalDuration;
      courseData.calculatedTotalLectures = totalLectures;

      setCourse(courseData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching course:", error);
      setLoading(false);
    }
  };

  const checkEnrollment = async (token) => {
    try {
      if (!token || !id) return;
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const response = await axios.get(
        `${baseURL}/api/enrollments/check/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setEnrolled(response.data.enrolled || false);
    } catch (error) {
      console.error("Error checking enrollment:", error);
    }
  };

  const handleEnroll = async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/auth/student");
      return;
    }

    if (course.price && course.price > 0) {
      // Redirect to payment page
      router.push(`/student/payments?courseId=${id}`);
      return;
    }

    // Free course - direct enrollment
    setEnrolling(true);
    try {
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.post(
        `${baseURL}/api/enrollments`,
        { courseId: id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setEnrolled(true);
      setTimeout(() => {
        router.push(`/learn/${id}/${name}`);
      }, 1000);
    } catch (error) {
      console.error("Enrollment error:", error);
      alert(error.response?.data?.message || "Enrollment failed");
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading course details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="flex flex-col items-center justify-center h-96">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Course not found
          </h2>
          <button
            onClick={() => router.push("/courses")}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            <FiArrowLeft />
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Course Details (Udemy Style) */}
      <div className="bg-[#1c1d1f] text-white py-12">
        <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          <div className="lg:col-span-2 space-y-4">
            {/* Breadcrumb / Back */}
            <div className="flex items-center gap-2 text-purple-300 text-sm font-semibold mb-4">
              <button
                onClick={() => router.back()}
                className="hover:underline flex items-center gap-1"
              >
                <FiArrowLeft /> Back to Courses
              </button>
              <span>/</span>
              <span className="text-white font-normal">
                {course.category || "General"}
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
              {course.title}
            </h1>
            <p className="text-lg text-gray-200 line-clamp-2">
              {course.tagline || course.description?.substring(0, 150)}...
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm mt-4">
              <div className="flex items-center gap-1 text-yellow-400">
                <span className="font-bold text-base">
                  {course.rating ? course.rating.toFixed(1) : "0.0"}
                </span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FiStar
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(course.rating || 0) ? "fill-current" : "text-gray-500"}`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-purple-300 underline">
                ({course.totalRatings || 0} ratings)
              </span>
              <span className="text-white">
                {course.enrolledStudents || 0} students
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm pt-2">
              <span className="text-gray-300">Created by</span>
              <button
                onClick={() => router.push(`/tutor/${course.tutor?._id}`)}
                className="text-purple-300 underline hover:text-purple-200"
              >
                {course.tutor?.name || course.instructorName || "Expert Tutor"}
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-300 pt-2">
              <div className="flex items-center gap-1">
                <FiClock /> Last updated{" "}
                {new Date(course.updatedAt || Date.now()).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <FiCheckCircle /> {course.level || "All Levels"}
              </div>
            </div>
          </div>
          {/* Note: Sidebar card is in the main content area but positioned absolutely on desktop to overlap */}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12 relative">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Course Info */}
          <div className="lg:col-span-2 space-y-12">
            {/* What you'll learn */}
            <div className="border border-gray-300 p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {"What you'll learn"}
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                {course.learningPoints && course.learningPoints.length > 0 ? (
                  course.learningPoints.map((point, idx) => (
                    <div key={idx} className="flex gap-3">
                      <FiCheckCircle className="text-green-500 shrink-0 mt-1" />
                      <span className="text-gray-700">{point}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="flex gap-3">
                      <FiCheckCircle className="text-green-500 shrink-0 mt-1" />
                      <span className="text-gray-700">
                        Master core concepts and principles
                      </span>
                    </div>
                    <div className="flex gap-3">
                      <FiCheckCircle className="text-green-500 shrink-0 mt-1" />
                      <span className="text-gray-700">
                        Build practical skills and projects
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Course Content */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Course content
              </h2>
              <div className="text-sm text-gray-600 mb-4">
                {course.modules?.length || 0} sections •{" "}
                {course.calculatedTotalLectures || 0} lectures •{" "}
                {Math.floor((course.calculatedTotalDuration || 0) / 3600)}h{" "}
                {Math.floor(
                  ((course.calculatedTotalDuration || 0) % 3600) / 60,
                )}
                m total length
              </div>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                {course.modules && course.modules.length > 0 ? (
                  course.modules.map((module, idx) => (
                    <div key={idx} className="bg-white">
                      <button className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 text-left font-semibold text-gray-900">
                        <span className="flex items-center gap-2">
                          <FiBook />
                          {module.title}
                        </span>
                        <span className="text-sm text-gray-500 font-normal">
                          {module.lectures?.length || 0} lectures
                        </span>
                      </button>
                      <div className="p-4 space-y-3">
                        {module.lectures?.map((lec, lIdx) => (
                          <div
                            key={lIdx}
                            className="flex items-center justify-between text-sm text-gray-700"
                          >
                            <div className="flex items-center gap-3">
                              <FiPlay className="text-gray-400" />
                              <span>{lec.title}</span>
                            </div>
                            <span className="text-gray-500">
                              {formatDuration(lec.duration)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    No content available yet.
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Description
              </h2>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {course.description ||
                  "This is a comprehensive course designed to help you master the subject."}
              </div>
            </div>

            {/* Instructor Info */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Instructor
              </h2>
              <div className="flex gap-4">
                <img
                  src={
                    course.tutor?.avatar ||
                    course.instructorAvatar ||
                    "https://via.placeholder.com/100"
                  }
                  alt={course.tutor?.name || "Instructor"}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div>
                  <a
                    href="#"
                    className="text-purple-600 font-bold text-lg hover:underline"
                  >
                    {course.tutor?.name ||
                      course.instructorName ||
                      "Expert Tutor"}
                  </a>
                  <p className="text-gray-600 mb-2">
                    {course.tutor?.email || "Top Rated Instructor"}
                  </p>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {course.tutor?.bio ||
                      "Passionate educator with years of experience in the field."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            {/* Course Card */}
            <div className="sticky top-24 bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Thumbnail */}
              <div className="relative bg-linear-to-br from-purple-500 to-pink-500 aspect-video flex items-center justify-center">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FiPlay className="text-white text-6xl opacity-50" />
                )}
              </div>

              {/* Price & Action */}
              <div className="p-6 space-y-4">
                {course.price && course.price > 0 ? (
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      ₹{course.price}
                    </p>
                    {course.originalPrice && (
                      <p className="text-lg text-gray-500 line-through">
                        ₹{course.originalPrice}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl font-bold text-green-600">FREE</p>
                  </div>
                )}

                {enrolled ? (
                  <button
                    onClick={() => router.push(`/learn/${id}/${name}`)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition"
                  >
                    <FiPlay /> Go to Course
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition disabled:opacity-50"
                  >
                    <FiShoppingCart />{" "}
                    {enrolling ? "Enrolling..." : "Enroll Now"}
                  </button>
                )}

                {!user && (
                  <p className="text-sm text-gray-600 text-center">
                    Please{" "}
                    <button
                      onClick={() => router.push("/auth/student")}
                      className="text-purple-600 font-semibold hover:underline"
                    >
                      login
                    </button>{" "}
                    to enroll
                  </p>
                )}
              </div>

              {/* Course Stats */}
              <div className="border-t border-gray-200 p-6 space-y-3">
                <div className="flex items-center gap-3 text-gray-700">
                  <FiBook className="text-purple-600" />
                  <span>
                    {course.modules?.length || 0} modules •{" "}
                    {course.calculatedTotalLectures || 0} lectures
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiClock className="text-blue-600" />
                  <span>
                    {Math.floor((course.calculatedTotalDuration || 0) / 3600)}h{" "}
                    {Math.floor(
                      ((course.calculatedTotalDuration || 0) % 3600) / 60,
                    )}
                    m of content
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-700">
                  <FiUsers className="text-green-600" />
                  <span>{course.enrolledStudents || 0} students</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
