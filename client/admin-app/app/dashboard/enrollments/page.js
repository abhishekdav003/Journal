"use client";

import { useEffect, useState } from "react";
import { enrollmentsAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function EnrollmentsPage() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const response = await enrollmentsAPI.getAll();
      console.log("Enrollments Response:", response.data); // Debug log
      setEnrollments(response.data.data.enrollments || []);
    } catch (error) {
      toast.error("Failed to fetch enrollments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredEnrollments = enrollments.filter(
    (enrollment) =>
      enrollment.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      enrollment.course?.title?.toLowerCase().includes(search.toLowerCase()),
  );

  const totalEnrollments = filteredEnrollments.length;
  const avgProgress =
    totalEnrollments > 0
      ? Math.round(
          filteredEnrollments.reduce((sum, e) => sum + (e.progress || 0), 0) /
            totalEnrollments,
        )
      : 0;
  const completedCourses = filteredEnrollments.filter(
    (e) => e.progress === 100,
  ).length;

  const getProgressColor = (progress) => {
    if (progress >= 75) return "bg-green-500";
    if (progress >= 50) return "bg-blue-500";
    if (progress >= 25) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="max-w-full overflow-hidden">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
          Enrollment Management
        </h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          View all course enrollments
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6 mb-6">
        <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-4 lg:p-6 text-white">
          <p className="text-xs lg:text-sm opacity-80">Total Enrollments</p>
          <p className="text-xl lg:text-3xl font-bold mt-1 lg:mt-2">
            {totalEnrollments}
          </p>
        </div>
        <div className="bg-linear-to-br from-green-500 to-green-600 rounded-xl shadow-md p-4 lg:p-6 text-white">
          <p className="text-xs lg:text-sm opacity-80">Completed Courses</p>
          <p className="text-xl lg:text-3xl font-bold mt-1 lg:mt-2">
            {completedCourses}
          </p>
        </div>
        <div className="bg-linear-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-4 lg:p-6 text-white">
          <p className="text-xs lg:text-sm opacity-80">Average Progress</p>
          <p className="text-xl lg:text-3xl font-bold mt-1 lg:mt-2">
            {avgProgress}%
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 lg:p-6 mb-6">
        <input
          type="text"
          placeholder="Search by student or course..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Student
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Course
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Tutor
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Progress
                  </th>
                  <th className="px-3 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Enrolled Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => (
                  <tr
                    key={enrollment._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div>
                        <p className="font-medium text-gray-800 text-sm lg:text-base">
                          {enrollment.student?.name}
                        </p>
                        <p className="text-xs lg:text-sm text-gray-500">
                          {enrollment.student?.email}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <p className="font-medium text-gray-800 text-sm lg:text-base">
                        {enrollment.course?.title}
                      </p>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div>
                        <p className="font-medium text-gray-700 text-sm lg:text-base">
                          {enrollment.course?.tutor?.name || "N/A"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {enrollment.course?.tutor?.email || ""}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <div className="w-full min-w-25">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getProgressColor(enrollment.progress)}`}
                              style={{ width: `${enrollment.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-xs lg:text-sm font-medium text-gray-600 whitespace-nowrap">
                            {enrollment.progress || 0}%
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-3 lg:py-4">
                      <span className="text-xs lg:text-sm font-medium text-gray-800">
                        {formatDate(enrollment.enrolledAt)}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        {enrollment.enrolledAt
                          ? new Date(enrollment.enrolledAt).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )
                          : ""}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredEnrollments.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No enrollments found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
