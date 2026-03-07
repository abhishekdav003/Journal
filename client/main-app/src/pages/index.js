/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Hero from "@/components/Hero";
import Contact from "@/components/Contact";
import CourseCard from "@/components/CourseCard";
import {
  getAllCourses,
  getPlatformStats,
  getPublicReviews,
} from "@/services/apiService";
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
  const [user, setUser] = useState(null);
  const [purchasedCourses, setPurchasedCourses] = useState([]);
  const [stats, setStats] = useState({
    totalTutors: 0,
    totalCourses: 0,
    totalStudents: 0,
    avgRating: 0,
  });
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    // Load user from localStorage
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (storedUser && token) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed?.user || parsed);

        // Load purchased courses from enrollments
        const enrollments = JSON.parse(
          localStorage.getItem("enrollments") || "[]",
        );
        setPurchasedCourses(enrollments.map((e) => e.courseId || e._id));
      }
    } catch (e) {
      console.error("Failed to load user:", e);
    }

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
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center mb-8 md:mb-12 lg:mb-16 text-gray-100">
            How it Works
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 border-2 md:border-4 border-[#8834D3] rounded-xl md:rounded-2xl p-6 md:p-8 lg:p-10">
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
                  className={`${step.color} p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2`}
                >
                  <IconComponent className="text-3xl md:text-4xl mb-3 md:mb-4 text-gray-700" />
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 md:mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Access Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <div className="grid lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
            {/* Illustration */}
            <div className="relative order-2 lg:order-1">
              {/*  */}
              <div className="hidden lg:block absolute -top-[5%] left-[10%] w-88 h-62 bg-linear-to-r from-[#362045] to-[#BD73FF] -z-1 rounded-[50px] -rotate-21"></div>
              <div className="hidden lg:block absolute -bottom-[10%] left-[15%] w-85 h-85 bg-linear-to-r from-[#BD73FF] to-[#362045] -z-2 rounded-[50px] -rotate-21"></div>
              {/*  */}
              <div className="hidden md:block absolute -top-[30%] left-[40%] w-8 md:w-10 h-8 md:h-10 bg-[#00A5CF] rounded-full"></div>
              <div className="hidden md:block absolute top-[40%] -left-[5%] w-5 md:w-6.25 h-5 md:h-6.25 bg-[#FF3226] rounded-full"></div>
              <div className="hidden md:block absolute bottom-[15%] right-[20%] w-5 md:w-6.25 h-5 md:h-6.25 bg-[#64BC7D] rounded-full"></div>

              <img
                src="./images/Home-Section.svg"
                alt="Access Illustration"
                className="w-full max-w-md md:max-w-lg lg:w-125 h-auto mx-auto"
              />
            </div>

            {/* Content */}
            <div className="space-y-6 order-1 lg:order-2">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-100 leading-tight">
                Access to everything for everyone
              </h2>
              <p className="text-gray-300 text-base md:text-lg leading-relaxed">
                Easy secure access to digital learning resources should be the
                status of modern education.
              </p>

              <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4">
                {[
                  { icon: "🌟", text: "World-Class" },
                  { icon: "💪", text: "Flexible" },
                  { icon: "💰", text: "Affordable" },
                  { icon: "💼", text: "Job-relevant" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 md:gap-3 bg-gray-500 p-3 md:p-4 rounded-lg md:rounded-xl"
                  >
                    <span className="text-xl md:text-2xl">{item.icon}</span>
                    <span className="font-bold text-sm md:text-base text-gray-100">{item.text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => router.push("/auth/student?tab=register")}
                className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-full font-bold text-base md:text-lg shadow-xl shadow-purple-500/30 transform hover:scale-105 transition-all mt-8 w-full sm:w-auto"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Courses Section */}
      <section id="courses" className="py-12 md:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          {/* Section Header */}
          <div className="flex items-center justify-between mb-8 md:mb-12 flex-wrap gap-4">
            <div className="flex items-center gap-3 md:gap-4">
              <FiTrendingUp className="text-3xl md:text-4xl text-red-500" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-100">
                Trending{" "}
                <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-600 to-pink-600">
                  Courses
                </span>
              </h2>
            </div>
            <button
              onClick={() => router.push("/courses")}
              className="text-purple-600 font-bold hover:text-purple-700 flex items-center gap-2 text-sm md:text-base"
            >
              View All <FiArrowRight className="text-sm md:text-base" />
            </button>
          </div>

          {/* Courses Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="animate-pulse border border-gray-800 rounded-lg overflow-hidden bg-[#1E1E2E]"
                >
                  <div className="aspect-video bg-gray-800"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-5 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/2"></div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-800 rounded w-12"></div>
                      <div className="h-4 bg-gray-800 rounded w-20"></div>
                    </div>
                    <div className="h-4 bg-gray-800 rounded w-32"></div>
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-6 bg-gray-800 rounded w-16"></div>
                      <div className="h-9 bg-gray-800 rounded w-28"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {courses.map((course) => (
                <CourseCard
                  key={course._id}
                  course={course}
                  user={user}
                  purchasedCourses={purchasedCourses}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 md:py-20">
              <FiBook className="text-gray-300 text-5xl md:text-6xl mx-auto mb-4" />
              <p className="text-gray-500 text-lg md:text-xl">No courses available yet</p>
            </div>
          )}
        </div>
      </section>

      {/* Reviews Section */}
      <section className="py-12 md:py-16 lg:py-20 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-20">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3 md:mb-4">
              What Our{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-300 to-pink-300">
                Students
              </span>{" "}
              Say
            </h2>
            <p className="text-purple-200 text-base md:text-lg">
              Real feedback from our learners
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/20 animate-pulse"
                >
                  <div className="h-20 bg-white/20 rounded mb-4"></div>
                  <div className="h-4 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="bg-white/10 backdrop-blur-lg rounded-2xl md:rounded-3xl p-6 md:p-8 border border-white/20 hover:bg-white/20 transition-all"
                >
                  <div className="flex items-center gap-3 md:gap-4 mb-4 md:mb-6">
                    {review.student?.avatar ? (
                      <img
                        src={review.student.avatar}
                        alt={review.student.name}
                        className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover ring-2 ring-purple-400 shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg md:text-xl shrink-0">
                        {review.student?.name?.charAt(0) || "S"}
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-white text-base md:text-lg">
                        {review.student?.name || "Student"}
                      </h4>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <FiStar
                            key={i}
                            className={`text-xs md:text-sm ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-400"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-purple-100 text-sm md:text-base leading-relaxed mb-2 line-clamp-3">
                    {review.comment}
                  </p>
                  <p className="text-purple-300 text-xs md:text-sm font-semibold truncate">
                    Course: {review.course?.title}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 md:py-12">
              <p className="text-purple-200 text-base md:text-lg">
                No reviews yet. Be the first to share your experience!
              </p>
            </div>
          )}
        </div>
      </section>

      <Contact />
    </>
  );
}
