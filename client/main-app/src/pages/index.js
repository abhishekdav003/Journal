/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import Hero from "@/components/Hero";
import Contact from "@/components/Contact";
import { getAllCourses, getPlatformStats, getPublicReviews } from "@/services/apiService";
import {
  FiBook,
  FiUsers,
  FiCheckCircle,
  FiSearch,
  FiStar,
  FiClock,
  FiUser,
  FiArrowRight,
  FiTrendingUp,
  FiAward,
  FiTarget,
} from "react-icons/fi";

export default function Home() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ 
    totalTutors: 0, 
    totalCourses: 0, 
    totalStudents: 0,
    avgRating: 0 
  });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch courses
      const coursesResponse = await getAllCourses({ limit: 6 });
      if (coursesResponse.data.success) {
        setCourses(coursesResponse.data.data.courses || []);
      }

      // Fetch platform statistics
      const statsResponse = await getPlatformStats();
      if (statsResponse.data.success) {
        setStats(statsResponse.data.data);
      }

      // Fetch public reviews
      const reviewsResponse = await getPublicReviews(3);
      if (reviewsResponse.data.success) {
        setReviews(reviewsResponse.data.data.reviews || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCourseUrl = (course) => {
    const courseName = course.title.toLowerCase().replace(/\s+/g, "-");
    return `/course/${course._id}/${courseName}`;
  };

  return (
    <>
      {/* Hero Section */}
      <Hero />

      {/* How it Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-20">
          <h2 className="text-4xl lg:text-5xl font-extrabold text-center mb-16 text-gray-900">
            How it{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
              Works
            </span>
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Set Your Plan",
                desc: "Choose from various learning paths and subscription plans that fit your needs.",
                icon: FiTarget,
                color: "bg-blue-100",
              },
              {
                title: "Find Your Course",
                desc: "Browse thousands of courses by category, level, and instructor expertise.",
                icon: FiSearch,
                color: "bg-orange-100",
              },
              {
                title: "Book Your Seat",
                desc: "Enroll in courses and get immediate access to all learning materials.",
                icon: FiBook,
                color: "bg-green-100",
              },
              {
                title: "Get Certificate",
                desc: "Complete courses and earn verified certificates to showcase your skills.",
                icon: FiAward,
                color: "bg-pink-100",
              },
            ].map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={index}
                  className={`${step.color} p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2`}
                >
                  <IconComponent className="text-4xl mb-4 text-gray-700" />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Access Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Illustration */}
            <div className="relative">
              <div className="relative bg-linear-to-br from-purple-600 to-pink-600 rounded-3xl p-12 aspect-square flex items-center justify-center">
                <FiBook className="text-white text-9xl opacity-40" />
              </div>
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
                Access to{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
                  everything
                </span>{" "}
                for everyone
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Easy secure access to digital learning resources should be the
                status of modern education.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { icon: "🌟", text: "World-Class" },
                  { icon: "💪", text: "Flexible" },
                  { icon: "💰", text: "Affordable" },
                  { icon: "💼", text: "Job-relevant" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-gray-50 p-4 rounded-xl"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <span className="font-bold text-gray-900">{item.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push("/auth/student?tab=register")}
                className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-purple-500/30 transform hover:scale-105 transition-all mt-8"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Courses Section */}
      <section id="courses" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-20">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <FiTrendingUp className="text-4xl text-red-500" />
              <h2 className="text-4xl font-extrabold text-gray-900">
                Trending{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
                  Courses
                </span>
              </h2>
            </div>
            <button
              onClick={() => router.push("/courses")}
              className="text-purple-600 font-bold hover:text-purple-700 flex items-center gap-2"
            >
              View All <FiArrowRight />
            </button>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-6 animate-pulse">
                  <div className="aspect-video bg-gray-200 rounded-2xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course) => (
                <div
                  key={course._id}
                  onClick={() => router.push(getCourseUrl(course))}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 cursor-pointer border border-gray-100"
                >
                  {/* Course Image */}
                  <div className="relative aspect-video bg-linear-to-br from-purple-400 to-pink-400">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FiBook className="text-white text-6xl opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold capitalize">
                      {course.category || "General"}
                    </div>
                  </div>

                  {/* Course Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 min-h-14">
                      {course.title}
                    </h3>

                    <p className="text-gray-600 text-sm line-clamp-3">
                      {course.description ||
                        "Learn everything you need to master this subject with expert guidance."}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-500 pt-2">
                      <div className="flex items-center gap-1">
                        <FiStar className="text-yellow-500" />
                        <span className="font-semibold">4.8</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiUsers className="text-purple-500" />
                        <span>
                          {course.enrolledStudents?.length || 0} students
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiClock className="text-blue-500" />
                        <span>{course.level || "All levels"}</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                          {course.tutor?.name?.charAt(0) || "T"}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {course.tutor?.name || "Expert Tutor"}
                          </p>
                          <p className="text-xs text-gray-500">Instructor</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-purple-600">
                          ₹{course.price || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <FiBook className="text-gray-300 text-6xl mx-auto mb-4" />
              <p className="text-gray-500 text-xl">No courses available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-20 bg-linear-to-br from-purple-900 via-purple-800 to-indigo-900 text-white">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-extrabold mb-4">
              What Our{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-300 to-pink-300">
                Students
              </span>{" "}
              Say
            </h2>
            <p className="text-purple-200 text-lg">Real feedback from our learners</p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 animate-pulse">
                  <div className="h-20 bg-white/20 rounded mb-4"></div>
                  <div className="h-4 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-4 mb-6">
                    {review.student?.avatar ? (
                      <img 
                        src={review.student.avatar} 
                        alt={review.student.name} 
                        className="w-16 h-16 rounded-full object-cover ring-2 ring-purple-400"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {review.student?.name?.charAt(0) || "S"}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-lg">
                        {review.student?.name || "Student"}
                      </h4>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`text-sm ${
                              i < review.rating 
                                ? "text-yellow-400 fill-current" 
                                : "text-gray-400"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-purple-100 leading-relaxed mb-2 line-clamp-3">
                    {review.comment}
                  </p>
                  <p className="text-purple-300 text-sm font-semibold">
                    Course: {review.course?.title}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-purple-200 text-lg">No reviews yet. Be the first to share your experience!</p>
            </div>
          )}
        </div>
      </section>

      <Contact />
    </>
  );
}
