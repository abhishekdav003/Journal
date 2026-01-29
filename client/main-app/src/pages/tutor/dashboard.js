import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
// CHANGE 1: Import the API service function instead of axios
import { getDashboardStats } from "../../services/apiService"; 
import TutorLayout from "../../components/tutor/TutorLayout";

export default function TutorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    recentTransactions: []
  });

  useEffect(() => {
    // 1. Redirect if not logged in
    if (!loading && !user) {
      router.push("/auth/tutor?tab=login");
      return;
    } 
    
    // 2. Redirect if not a tutor
    if (!loading && user && user.role !== "tutor") {
      router.push(`/${user.role}/dashboard`);
      return;
    }

    // 3. Fetch Data if user is authorized
    if (user && user.role === "tutor") {
      fetchStats();
    }
  }, [user, loading, router]);

  const fetchStats = async () => {
    try {
      // CHANGE 2: Use the service call (automatically handles the Token)
      const res = await getDashboardStats();
      setStats(res.data.data);
    } catch (err) {
      console.error("Failed to load dashboard stats", err);
      // Optional: If 401, you might want to force logout
      if (err.response && err.response.status === 401) {
        router.push("/auth/tutor?tab=login");
      }
    }
  };

  if (loading || !user) return null;

  return (
    <TutorLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome back, {user.name}! 👨‍🏫
        </h1>
        <p className="text-gray-500 mt-1">Here is what's happening with your courses today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">₹{stats.totalRevenue?.toLocaleString()}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Active Students</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalStudents}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Courses</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{stats.totalCourses}</h3>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Recent Transactions</h3>
          <div className="space-y-4">
            {stats.recentTransactions?.length > 0 ? (
              stats.recentTransactions.map((tx) => (
                <div key={tx._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">Course Enrollment</p>
                    <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className="text-green-600 font-bold text-sm">+₹{tx.amount}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm italic">No recent transactions.</p>
            )}
          </div>
        </div>
        
        <div className="bg-linear-to-br from-purple-600 to-indigo-700 rounded-2xl p-8 text-white">
          <h3 className="text-xl font-bold mb-2">Create a New Course</h3>
          <p className="text-purple-100 mb-6 text-sm">Ready to share your knowledge? Build a new course curriculum today.</p>
          <button 
            onClick={() => router.push('/tutor/courses/create')}
            className="bg-white text-purple-700 px-6 py-3 rounded-lg font-bold text-sm hover:bg-gray-100 transition"
          >
            + Start Creating
          </button>
        </div>
      </div>
    </TutorLayout>
  );
}