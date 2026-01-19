import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";

export default function TutorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/tutor?tab=login");
    } else if (! loading && user && user.role !== "tutor") {
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {user.name}!  👨‍🏫
          </h1>
          <p className="text-gray-600">
            Tutor Dashboard - Manage your courses and students
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-linear-to-br from-purple-500 to-purple-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Total Courses</p>
                <h3 className="text-4xl font-bold">12</h3>
              </div>
              <div className="text-6xl opacity-20">📚</div>
            </div>
          </div>

          <div className="bg-linear-to-br from-indigo-500 to-indigo-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm mb-1">Total Students</p>
                <h3 className="text-4xl font-bold">234</h3>
              </div>
              <div className="text-6xl opacity-20">👥</div>
            </div>
          </div>

          <div className="bg-linear-to-br from-pink-500 to-pink-700 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-pink-100 text-sm mb-1">Total Revenue</p>
                <h3 className="text-4xl font-bold">$5. 2k</h3>
              </div>
              <div className="text-6xl opacity-20">💰</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all">
              <span className="text-4xl mb-2">➕</span>
              <span className="font-semibold text-gray-700">Create Course</span>
            </button>

            <button className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all">
              <span className="text-4xl mb-2">📊</span>
              <span className="font-semibold text-gray-700">View Analytics</span>
            </button>

            <button className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all">
              <span className="text-4xl mb-2">💬</span>
              <span className="font-semibold text-gray-700">Messages</span>
            </button>

            <button className="flex flex-col items-center justify-center p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:shadow-lg transition-all">
              <span className="text-4xl mb-2">⚙️</span>
              <span className="font-semibold text-gray-700">Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}