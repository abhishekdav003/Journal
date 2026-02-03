/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAllCourses } from "@/services/apiService";
import {
  FiBook,
  FiStar,
  FiUsers,
  FiClock,
  FiFilter,
  FiSearch,
  FiChevronDown,
  FiShoppingCart,
} from "react-icons/fi";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [user, setUser] = useState(null);
  const [purchasedCourses, setPurchasedCourses] = useState([]);

  useEffect(() => {
    // Load user from localStorage
    try {
      const storedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (storedUser && token) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed?.user || parsed);

        // Load purchased courses from enrollments
        // This could be fetched from API, but for now check from localStorage/enrollments
        const enrollments = JSON.parse(
          localStorage.getItem("enrollments") || "[]",
        );
        setPurchasedCourses(enrollments.map((e) => e.courseId || e._id));
      }
    } catch (e) {
      console.error("Failed to load user:", e);
    }
  }, []);

  useEffect(() => {
    if (router.isReady) {
      const { search } = router.query;
      if (search) {
        setSearchQuery(search);
      }
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedLevel]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (selectedLevel) params.level = selectedLevel;

      const response = await getAllCourses(params);
      if (response.data.success) {
        setCourses(response.data.data.courses || []);
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter((course) => {
    if (!searchQuery) return true;
    return (
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getCourseUrl = (course) => {
    const courseName = course.title.toLowerCase().replace(/\s+/g, "-");
    return `/course/${course._id}/${courseName}`;
  };

  const categories = [
    { value: "", label: "All Categories" },
    { value: "programming", label: "Programming" },
    { value: "design", label: "Design" },
    { value: "business", label: "Business" },
    { value: "marketing", label: "Marketing" },
    { value: "photography", label: "Photography" },
    { value: "music", label: "Music" },
    { value: "other", label: "Other" },
  ];

  const levels = [
    { value: "", label: "All Levels" },
    { value: "beginner", label: "Beginner" },
    { value: "intermediate", label: "Intermediate" },
    { value: "advanced", label: "Advanced" },
  ];

  return (
    <>
      <div className="min-h-screen bg-[#0F0F0F]">
        {/* Hero Header - Compact like Udemy */}
        <div className="relative bg-linear-to-br from-[#1E1E2E] via-[#2B2B40] to-[#1E1E2E] text-white py-12 overflow-hidden border-b border-gray-800">
          {/* Decorative blur circles */}
          <div className="absolute -top-10 -right-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl"></div>

          <div className="relative container mx-auto px-6 lg:px-20">
            <h1 className="text-3xl lg:text-4xl font-bold mb-6">
              Explore{" "}
              <span className="bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                All Courses
              </span>
            </h1>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <FiSearch className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
              <input
                type="text"
                placeholder="Search for anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-base transition-all shadow-lg"
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-20 py-8">
          {/* Horizontal Filters - Udemy Style */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3">
              {/* All Filters Button */}
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1E1E2E] hover:bg-[#2B2B40] text-white rounded-full border border-purple-500/30 transition-all">
                <FiFilter className="text-purple-400" />
                <span className="font-medium">All Filters</span>
              </button>

              {/* Category Dropdown */}
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2.5 pr-10 bg-[#1E1E2E] hover:bg-[#2B2B40] text-white rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer font-medium transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Level Dropdown */}
              <div className="relative">
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="px-4 py-2.5 pr-10 bg-[#1E1E2E] hover:bg-[#2B2B40] text-white rounded-full border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer font-medium transition-all"
                >
                  {levels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>

              {/* Clear Filters */}
              {(selectedCategory || selectedLevel) && (
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedLevel("");
                  }}
                  className="px-4 py-2.5 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full font-medium transition-all"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Results Count and Courses Grid */}
          <div>
            {loading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="aspect-video bg-[#1E1E2E] rounded-lg mb-3"></div>
                    <div className="space-y-2">
                      <div className="h-5 bg-[#1E1E2E] rounded w-3/4"></div>
                      <div className="h-4 bg-[#1E1E2E] rounded w-1/2"></div>
                      <div className="h-4 bg-[#1E1E2E] rounded w-2/3"></div>
                      <div className="h-6 bg-[#1E1E2E] rounded w-1/3 mt-3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredCourses.length > 0 ? (
              <>
                <div className="mb-5 flex items-center justify-between">
                  <p className="text-gray-400 text-sm">
                    Showing{" "}
                    <span className="font-bold text-white">
                      {filteredCourses.length}
                    </span>{" "}
                    {filteredCourses.length === 1 ? "result" : "results"}
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filteredCourses.map((course) => (
                    <div
                      key={course._id}
                      className="group cursor-pointer border border-gray-800 hover:border-purple-500/50 rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-purple-500/10"
                    >
                      {/* Course Image */}
                      <div
                        onClick={() => router.push(getCourseUrl(course))}
                        className="relative aspect-video bg-linear-to-br from-purple-900/30 to-pink-900/30 overflow-hidden"
                      >
                        {course.thumbnail ? (
                          <img
                            src={course.thumbnail}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#1E1E2E]">
                            <FiBook className="text-purple-400 text-5xl opacity-40" />
                          </div>
                        )}
                      </div>

                      {/* Course Info */}
                      <div
                        className="p-4"
                        onClick={() => router.push(getCourseUrl(course))}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0 space-y-2">
                            <h3 className="font-bold text-white text-base line-clamp-2 leading-snug group-hover:text-purple-400 transition-colors">
                              {course.title}
                            </h3>

                            <p className="text-gray-400 text-xs">
                              {course.tutor?.name || "Expert Instructor"}
                            </p>

                            {/* Rating and Stats */}
                            <div className="flex items-center gap-2 text-xs">
                              {course.rating > 0 && (
                                <>
                                  <span className="font-bold text-orange-400">
                                    {course.rating.toFixed(1)}
                                  </span>
                                  <div className="flex items-center text-orange-400">
                                    <FiStar
                                      className="fill-current"
                                      size={12}
                                    />
                                  </div>
                                  <span className="text-gray-500">•</span>
                                </>
                              )}
                              <span className="text-gray-400">
                                ({course.enrolledStudents?.length || 0})
                              </span>
                            </div>

                            {/* Duration and Lectures */}
                            <p className="text-xs text-gray-400">
                              {course.lectures?.length ||
                                course.modules?.reduce(
                                  (acc, mod) =>
                                    acc + (mod.lectures?.length || 0),
                                  0,
                                ) ||
                                0}{" "}
                              lectures • {course.level || "All Levels"}
                            </p>

                            {/* Price and Category */}
                            <div className="flex items-center gap-2">
                              <p className="text-xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                ₹{course.price?.toLocaleString() || 0}
                              </p>
                              {course.category && (
                                <span className="px-2 py-0.5 bg-linear-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 text-yellow-400 rounded text-[10px] font-bold uppercase">
                                  {course.category}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Add to Cart Button - Udemy Style (Right Side) */}
                          {!purchasedCourses.includes(course._id) && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();

                                // Check if user is logged in
                                if (!user) {
                                  alert("Please login to add courses to cart");
                                  router.push("/auth/student");
                                  return;
                                }

                                const cart = JSON.parse(
                                  localStorage.getItem("cart") || "[]",
                                );
                                const existingItem = cart.find(
                                  (item) => item._id === course._id,
                                );

                                if (!existingItem) {
                                  cart.push({
                                    _id: course._id,
                                    title: course.title,
                                    price: course.price,
                                    thumbnail: course.thumbnail,
                                    tutor: course.tutor,
                                    category: course.category,
                                    level: course.level,
                                  });
                                  localStorage.setItem(
                                    "cart",
                                    JSON.stringify(cart),
                                  );

                                  // Trigger cart update event
                                  window.dispatchEvent(
                                    new Event("cart-update"),
                                  );

                                  alert("Course added to cart!");
                                } else {
                                  alert("Course already in cart!");
                                }
                              }}
                              className="shrink-0 p-2.5 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg transition-all hover:scale-105 shadow-lg"
                              title="Add to Cart"
                            >
                              <FiShoppingCart size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-16 bg-[#1E1E2E] rounded-xl border border-gray-800">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                  <FiBook className="text-purple-400 text-4xl" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  No courses found
                </h3>
                <p className="text-gray-400 mb-5 text-sm">
                  Try adjusting your filters or search query
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("");
                    setSelectedLevel("");
                  }}
                  className="px-6 py-2.5 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-full transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
