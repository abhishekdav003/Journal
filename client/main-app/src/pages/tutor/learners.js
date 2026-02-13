import { useEffect, useState } from "react";
import TutorLayout from "../../components/tutor/TutorLayout";
// IMPORT API SERVICE
import { getTutorLearners } from "../../services/apiService";
import { FiSearch, FiUser, FiMail, FiCalendar, FiUsers } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";

export default function TutorLearners() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchLearners();
  }, []);

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            My Learners
          </h1>
          <p className="text-gray-500 font-medium mt-1">
            Track student progress and engagement.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or course..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition shadow-sm text-sm font-medium text-gray-900 placeholder-gray-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-4xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredEnrollments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-5 font-bold">Student</th>
                  <th className="px-6 py-5 font-bold">Enrolled Course</th>
                  <th className="px-6 py-5 font-bold">Joined Date</th>
                  <th className="px-6 py-5 font-bold">Progress</th>
                  <th className="px-6 py-5 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredEnrollments.map((enr) => (
                  <tr
                    key={enr._id}
                    className="hover:bg-gray-50 transition duration-150 group"
                  >
                    {/* Student Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-700 font-bold border border-blue-50">
                          {enr.student?.name?.[0]?.toUpperCase() || <FiUser />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm group-hover:text-purple-600 transition-colors">
                            {enr.student?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <FiMail size={10} /> {enr.student?.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Course Info */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-gray-700 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100 inline-block">
                        {enr.course?.title || "Deleted Course"}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <FiCalendar size={14} className="text-gray-400" />
                        {new Date(
                          enr.enrolledAt || Date.now(),
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>

                    {/* Progress Bar */}
                    <td className="px-6 py-4">
                      <div className="w-full max-w-35">
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-xs font-bold text-gray-700">
                            {enr.progress || 0}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
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
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                          (enr.progress || 0) === 100
                            ? "bg-green-50 text-green-600 border border-green-100"
                            : "bg-blue-50 text-blue-600 border border-blue-100"
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <FiUsers className="text-gray-400 text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              No learners found
            </h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
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
