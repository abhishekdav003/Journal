"use client";

import { useEffect, useState } from "react";
import { coursesAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await coursesAPI.getAll();
      setCourses(response.data.data.courses || []);
    } catch (error) {
      toast.error("Failed to fetch courses");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (courseId) => {
    try {
      await coursesAPI.togglePublish(courseId);
      toast.success("Course status updated");
      fetchCourses();
    } catch (error) {
      toast.error("Failed to update course status");
    }
  };

  const handleDelete = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;

    try {
      await coursesAPI.delete(courseId);
      toast.success("Course deleted successfully");
      fetchCourses();
    } catch (error) {
      toast.error("Failed to delete course");
    }
  };

  const filteredCourses = courses.filter(
    (course) =>
      course.title?.toLowerCase().includes(search.toLowerCase()) ||
      course.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalCourses = filteredCourses.length;
  const publishedCourses = filteredCourses.filter((c) => c.isPublished).length;
  const totalEnrollments = filteredCourses.reduce(
    (sum, c) => sum + (c.enrolledStudents?.length || 0),
    0,
  );
  const totalReviews = filteredCourses.reduce(
    (sum, c) => sum + (c.numReviews || 0),
    0,
  );
  const avgRating =
    totalReviews > 0
      ? (
          filteredCourses.reduce(
            (sum, c) => sum + (c.rating || 0) * (c.numReviews || 0),
            0,
          ) / totalReviews
        ).toFixed(1)
      : "0.0";

  return (
    <div className="max-w-full overflow-hidden">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
          Course Management
        </h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          Manage all courses in the system
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-4 lg:p-6 text-white">
          <p className="text-xs lg:text-sm opacity-80">Total Courses</p>
          <p className="text-xl lg:text-3xl font-bold mt-1 lg:mt-2">
            {totalCourses}
          </p>
        </div>
        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-md p-4 lg:p-6 text-white">
          <p className="text-xs lg:text-sm opacity-80">Published</p>
          <p className="text-xl lg:text-3xl font-bold mt-1 lg:mt-2">
            {publishedCourses}
          </p>
        </div>
        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-4 lg:p-6 text-white">
          <p className="text-xs lg:text-sm opacity-80">Total Enrollments</p>
          <p className="text-xl lg:text-3xl font-bold mt-1 lg:mt-2">
            {totalEnrollments}
          </p>
        </div>
        <div className="bg-linear-to-br from-yellow-500 to-yellow-600 rounded-xl shadow-md p-4 lg:p-6 text-white">
          <p className="text-xs lg:text-sm opacity-80">Average Rating</p>
          <p className="text-xl lg:text-3xl font-bold mt-1 lg:mt-2">
            ⭐ {avgRating}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 lg:p-6 mb-6">
        <div className="flex items-center justify-between">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm lg:text-base"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition"
            >
              <div className="h-48 bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-6xl">📚</span>
                )}
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
                    {course.title}
                  </h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      course.isPublished
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {course.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-gray-600">
                    👨‍🏫 {course.tutor?.name || "Unknown"}
                  </span>
                  <span className="font-bold text-blue-600">
                    ₹{course.price?.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>
                    ⭐ {course.rating?.toFixed(1) || "0.0"} (
                    {course.numReviews || 0})
                  </span>
                  <span>
                    👥 {course.enrolledStudents?.length || 0} enrolled
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleTogglePublish(course._id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                  >
                    {course.isPublished ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredCourses.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No courses found</p>
        </div>
      )}
    </div>
  );
}
