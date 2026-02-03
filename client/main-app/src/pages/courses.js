/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getAllCourses } from "@/services/apiService";
import CourseCard from "@/components/CourseCard";
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
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="animate-pulse border border-gray-800 rounded-lg overflow-hidden"
                  >
                    <div className="aspect-video bg-[#1E1E2E]"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-[#1E1E2E] rounded w-3/4"></div>
                      <div className="h-4 bg-[#1E1E2E] rounded w-1/2"></div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 bg-[#1E1E2E] rounded w-12"></div>
                        <div className="h-4 bg-[#1E1E2E] rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-[#1E1E2E] rounded w-32"></div>
                      <div className="flex items-center justify-between pt-2">
                        <div className="h-6 bg-[#1E1E2E] rounded w-16"></div>
                        <div className="h-9 bg-[#1E1E2E] rounded w-28"></div>
                      </div>
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

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course._id}
                      course={course}
                      user={user}
                      purchasedCourses={purchasedCourses}
                    />
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
