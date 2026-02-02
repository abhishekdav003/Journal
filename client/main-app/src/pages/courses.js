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
} from "react-icons/fi";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");

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
      <div className="min-h-screen bg-gray-50">
        {/* Hero Header */}
        <div className="bg-linear-to-br from-purple-900 via-purple-800 to-indigo-900 text-white py-20">
          <div className="container mx-auto px-6 lg:px-20">
            <h1 className="text-5xl lg:text-6xl font-extrabold mb-4">
              Explore{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-300 to-pink-300">
                Courses
              </span>
            </h1>
            <p className="text-xl text-purple-200 mb-8">
              Discover {courses.length}+ courses to enhance your skills
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl">
              <FiSearch className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-16 pr-6 py-5 rounded-2xl bg-white/10 backdrop-blur-lg border border-white/20 text-white placeholder-purple-200 focus:outline-none focus:ring-4 focus:ring-purple-500/50 text-lg"
              />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 lg:px-20 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-72 space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-6">
                  <FiFilter className="text-purple-600 text-xl" />
                  <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                </div>

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Level Filter */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    Level
                  </label>
                  <select
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-gray-50"
                  >
                    {levels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                {(selectedCategory || selectedLevel) && (
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedLevel("");
                    }}
                    className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
                  >
                    Clear Filters
                  </button>
                )}
              </div>

              {/* Stats Card */}
              <div className="bg-linear-to-br from-purple-600 to-pink-600 rounded-2xl p-6 text-white">
                <h4 className="font-bold text-lg mb-2">Total Courses</h4>
                <p className="text-4xl font-extrabold">{courses.length}</p>
                <p className="text-purple-100 text-sm mt-2">
                  Available to learn
                </p>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-3xl p-6 animate-pulse"
                    >
                      <div className="aspect-video bg-gray-200 rounded-2xl mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  ))}
                </div>
              ) : filteredCourses.length > 0 ? (
                <>
                  <div className="mb-6 flex items-center justify-between">
                    <p className="text-gray-600">
                      Showing{" "}
                      <span className="font-bold text-purple-600">
                        {filteredCourses.length}
                      </span>{" "}
                      courses
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
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
                          <div className="absolute top-4 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold capitalize">
                            {course.level || "All levels"}
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
                                {course.enrolledStudents?.length || 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FiClock className="text-blue-500" />
                              <span>
                                {course.lectures?.length || 0} lectures
                              </span>
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
                </>
              ) : (
                <div className="text-center py-20 bg-white rounded-3xl">
                  <FiBook className="text-gray-300 text-6xl mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    No courses found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your filters or search query
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("");
                      setSelectedLevel("");
                    }}
                    className="mt-6 px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
