import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import TutorLayout from "../../components/tutor/TutorLayout";
// IMPORT API SERVICE
import { getTutorLearners } from "../../services/apiService";
import { FiSearch, FiUser, FiMail, FiCalendar, FiUsers } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function TutorLearners() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Authentication check and redirect
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/tutor?tab=login");
      } else if (user.role !== "tutor") {
        router.push(`/${user.role}/dashboard`);
      }
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    // Only fetch learners if user is authenticated and is a tutor
    if (!authLoading && user && user.role === "tutor") {
      fetchLearners();
    }
  }, [authLoading, user]);

  const fetchLearners = async () => {
    try {
      setLoading(true);
      const res = await getTutorLearners(); // Using centralized API
      // Adjust structure based on backend response
      setEnrollments(res.data.data.enrollments || res.data.data || []);
    } catch (err) {
      console.error("Error fetching learners", err);
      toast.error("Failed to load student list");
    } finally {
      setLoading(false);
    }
  };

  // Filter Logic
  const filteredEnrollments = enrollments.filter(
    (enr) =>
      enr.student?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enr.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Show loading while auth state is being determined
  if (authLoading) {
    return (
      <TutorLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </TutorLayout>
    );
  }

  // Redirect handled by useEffect, return null if not authenticated
  if (!user || user.role !== "tutor") return null;

  if (loading) {
    return (
      <TutorLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <Toaster position="top-right" />

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 sm:mb-8 gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            My Learners
          </h1>
          <p className="text-gray-400 font-medium mt-1 text-xs sm:text-sm">
            Track student progress and engagement.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-72">
          <FiSearch className="absolute left-3 sm:left-4 top-2.5 sm:top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or course..."
            className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 bg-[#1E1E2E] border border-gray-700/50 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition shadow-sm text-xs sm:text-sm font-medium text-white placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] rounded-2xl lg:rounded-3xl shadow-sm border border-gray-800/50 overflow-hidden">
        {filteredEnrollments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#2B2B40]/50 border-b border-gray-800/50 text-gray-400 text-xs uppercase tracking-wider">
                  <th className="px-4 sm:px-6 py-4 sm:py-5 font-bold">Student</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 font-bold">Enrolled Course</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 font-bold">Joined Date</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 font-bold">Progress</th>
                  <th className="px-4 sm:px-6 py-4 sm:py-5 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/30">
                {filteredEnrollments.map((enr) => (
                  <tr
                    key={enr._id}
                    className="hover:bg-[#2B2B40]/60 transition duration-150 group"
                  >
                    {/* Student Info */}
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-linear-to-br from-purple-600 to-indigo-600 flex items-center justify-center text-white font-bold border border-purple-500/50 text-xs sm:text-sm shrink-0">
                          {enr.student?.name?.[0]?.toUpperCase() || <FiUser size={14} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white text-xs sm:text-sm group-hover:text-purple-300 transition-colors truncate">
                            {enr.student?.name || "Unknown"}
                          </p>
                          <p className="text-[10px] sm:text-xs text-gray-400 flex items-center gap-1 truncate">
                            <FiMail size={10} /> <span className="truncate">{enr.student?.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Course Info */}
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <span className="text-xs sm:text-sm font-medium text-gray-300 bg-[#2B2B40] px-2 sm:px-3 py-1 rounded-lg border border-gray-700/50 inline-block truncate max-w-xs">
                        {enr.course?.title || "Deleted Course"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400 font-medium whitespace-nowrap">
                        <FiCalendar size={12} className="sm:w-3.5 sm:h-3.5 text-gray-500 shrink-0" />
                        <span className="hidden sm:inline">{new Date(
                          enr.enrolledAt || Date.now(),
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}</span>
                        <span className="sm:hidden">{new Date(
                          enr.enrolledAt || Date.now(),
                        ).toLocaleDateString(undefined, {
                          month: "numeric",
                          day: "numeric",
                        })}</span>
                      </div>
                    </td>

                    {/* Progress Bar */}
                    <td className="px-4 sm:px-6 py-3 sm:py-4">
                      <div className="w-24 sm:w-32">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-xs font-bold text-gray-300">
                            {enr.progress || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-[#2B2B40] rounded-full h-1.5 sm:h-2 overflow-hidden border border-gray-700/50">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              (enr.progress || 0) === 100
                                ? "bg-green-500"
                                : "bg-purple-600"
                            }`}
                            style={{ width: `${enr.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                      <span
                        className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wide whitespace-nowrap ${
                          (enr.progress || 0) === 100
                            ? "bg-green-600/20 text-green-400 border border-green-500/50"
                            : "bg-blue-600/20 text-blue-400 border border-blue-500/50"
                        }`}
                      >
                        {(enr.progress || 0) === 100
                          ? "Completed"
                          : "In Progress"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
            <div className="w-14 sm:w-16 h-14 sm:h-16 bg-[#2B2B40] rounded-full flex items-center justify-center mb-4 border border-gray-700/50">
              <FiUsers className="text-gray-500 text-xl sm:text-2xl" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white">
              No learners found
            </h3>
            <p className="text-gray-400 text-xs sm:text-sm mt-2 max-w-xs mx-auto">
              {searchTerm
                ? `No students found matching "${searchTerm}"`
                : "Once students enroll in your courses, they will appear here."}
            </p>
          </div>
        )}
      </div>
    </TutorLayout>
  );
}
