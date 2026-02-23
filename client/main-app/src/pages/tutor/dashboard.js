import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { getDashboardStats } from "../../services/apiService";
import TutorLayout from "../../components/tutor/TutorLayout";
// Import StatCard component (ensure you created this file from previous steps)
import StatCard from "../../components/tutor/StatCard"; 
import { 
  FiUsers, 
  FiBookOpen, 
  FiDollarSign, 
  FiPlus, 
  FiArrowUpRight
} from "react-icons/fi";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from "recharts";

export default function TutorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    recentTransactions: [],
    monthlyData: []
  });
  const [dataLoading, setDataLoading] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // EFFECT 1: Handle Authentication & Redirection
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/tutor?tab=login");
      } else if (user.role !== "tutor") {
        router.push(`/${user.role}/dashboard`);
      }
    }
  }, [user, loading, router]);

  // EFFECT 2: Fetch Data (Only runs when user is confirmed as tutor)
  useEffect(() => {
    // Defined INSIDE useEffect to prevent infinite loops / dependency issues
    const fetchStats = async () => {
      try {
        setDataLoading(true);
        const res = await getDashboardStats(selectedYear);
        const data = res.data.data;
        
        // Map backend graphData to monthlyData
        setStats({
          totalCourses: data.totalCourses || 0,
          totalStudents: data.totalStudents || 0,
          totalRevenue: data.totalRevenue || 0,
          monthlyData: data.graphData || [],
          recentTransactions: data.recentTransactions || []
        });
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        if (err.response && err.response.status === 401) {
          router.push("/auth/tutor?tab=login");
        }
      } finally {
        setDataLoading(false);
      }
    };

    if (user && user.role === "tutor") {
      fetchStats();
    }
    // Re-run when user ID or selected year changes
  }, [user?._id, user?.role, selectedYear]); 

  if (loading || !user || user.role !== "tutor") return null;

  return (
    <TutorLayout>
      {/* Header with Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-4 sm:mb-5 lg:mb-6 animate-in fade-in duration-700">
        {/* Welcome Banner */}
        <div className="lg:col-span-2 bg-linear-to-br from-[#1E1E2E] via-[#2B2B40] to-[#1A1A28] p-4 sm:p-5 rounded-2xl sm:rounded-3xl relative overflow-hidden border border-purple-500/20 shadow-2xl shadow-purple-900/30 hover:shadow-purple-800/50 hover:border-purple-500/50 transition-all duration-500 group backdrop-blur-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-gray-300 text-xs sm:text-sm font-semibold bg-[#2B2B40]/90 backdrop-blur-sm inline-block px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-gray-700/50 group-hover:border-purple-500/30 transition-colors duration-300">
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  weekday: "long",
                })}
              </p>
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-white mt-1 sm:mt-2 leading-tight group-hover:text-transparent group-hover:bg-linear-to-r group-hover:from-purple-400 group-hover:via-pink-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
              Welcome back,{" "}
              <span className="bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                {user.name?.split(' ')[0]}!
              </span>
            </h1>
            <p className="text-gray-400 mt-1.5 sm:mt-2 max-w-sm sm:max-w-md text-xs sm:text-sm leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
              Here is a professional overview of your teaching performance. Keep growing your impact! 🚀
            </p>
          </div>
          {/* Decorative elements */}
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-purple-600/15 rounded-full blur-3xl animate-pulse opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-pink-600/15 rounded-full blur-3xl opacity-70 group-hover:opacity-90 transition-opacity duration-500"></div>
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-500"></div>
        </div>

        {/* Create Course Button Card */}
        <div className="bg-linear-to-br from-[#E0Cffc] to-[#F3E8FF] p-4 sm:p-5 rounded-2xl sm:rounded-3xl flex flex-col justify-between text-[#2D1B4E] shadow-xl shadow-purple-200/50 hover:shadow-2xl hover:shadow-purple-300/70 hover:-translate-y-1 transition-all duration-500 group border border-purple-200/30 hover:border-purple-300/50">
          <div>
            <p className="text-3xl sm:text-4xl font-black mb-2 sm:mb-3 bg-linear-to-r from-purple-600 to-purple-700 bg-clip-text text-transparent group-hover:from-purple-700 group-hover:to-purple-800 transition-all duration-300">
              Ready to Teach?
            </p>
            <p className="font-bold text-base sm:text-lg mt-1 group-hover:text-purple-800 transition-colors duration-300">Create a new course</p>
            <p className="text-xs sm:text-sm text-purple-700/70 mt-1 group-hover:text-purple-700 transition-colors duration-300">Share your expertise and inspire learners</p>
          </div>
          <button 
            onClick={() => router.push('/tutor/courses/create')}
            className="flex items-center justify-center gap-2 bg-linear-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl font-bold transition-all transform active:scale-95 shadow-lg hover:shadow-xl mt-4 sm:mt-5 w-full text-sm sm:text-base"
          >
            <FiPlus size={20} className="sm:w-5 sm:h-5" />
            Create Course
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-5 lg:mb-6 animate-in fade-in duration-700 delay-100">
        <StatCard 
          title="Total Earnings" 
          value={dataLoading ? '...' : `₹${stats.totalRevenue?.toLocaleString()}`} 
          icon={FiDollarSign} 
          color="purple" 
        />
        <StatCard 
          title="Active Learners" 
          value={dataLoading ? '...' : stats.totalStudents} 
          icon={FiUsers} 
          color="blue" 
        />
        <StatCard 
          title="Live Content" 
          value={dataLoading ? '...' : `${stats.totalCourses} Courses`} 
          icon={FiBookOpen} 
          color="orange" 
        />
      </div>

      {/* Analytics & Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 animate-in fade-in duration-700 delay-200">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-linear-to-br from-[#1E1E2E] via-[#1F1F2E] to-[#2B2B40] p-2.5 sm:p-3 lg:p-4 rounded-2xl lg:rounded-3xl shadow-2xl shadow-purple-900/25 border border-gray-800/50 hover:border-green-500/50 hover:shadow-purple-900/40 transition-all duration-500 group backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-3">
            <div>
              <h3 className="text-sm sm:text-base lg:text-lg font-black text-white group-hover:text-green-300 transition-colors duration-300">Revenue Analytics</h3>
              <p className="text-xs text-gray-400 mt-0.5 font-medium hidden sm:block">{new Date().getFullYear()}</p>
            </div>
            <select 
              className="bg-[#2B2B40]/80 border border-gray-700/50 rounded-lg text-xs font-bold p-1.5 sm:p-2 text-gray-300 outline-none cursor-pointer w-full sm:w-auto hover:border-green-500/50 hover:bg-[#2B2B40] transition-all duration-300 focus:ring-2 focus:ring-green-500/50 backdrop-blur-sm"
              value={selectedYear}
              onChange={(e) => {
                const value = e.target.value;
                setSelectedYear(value === "all" ? "all" : parseInt(value));
              }}
            >
              <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>
              <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1}</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="h-32 sm:h-36 lg:h-44 w-full">
            {dataLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600/30 border-t-green-600"></div>
              </div>
            ) : stats.monthlyData?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyData} margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#10b981"/>
                      <stop offset="50%" stopColor="#34d399"/>
                      <stop offset="100%" stopColor="#6ee7b7"/>
                    </linearGradient>
                    <filter id="glowEffect" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#444" opacity={0.3} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 9, fontWeight: 500}} 
                    interval={0}
                    dy={0}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: '2px solid #10b981', 
                      backgroundColor: '#0F0F1E', 
                      boxShadow: '0 25px 35px -5px rgba(16, 185, 129, 0.4)',
                      padding: '12px 16px'
                    }} 
                    labelStyle={{ color: '#fff', fontWeight: '600', fontSize: '13px' }}
                    formatter={(value) => [`₹${value?.toLocaleString() || 0}`, 'Revenue']}
                    cursor={{ stroke: '#10b981', strokeWidth: 2, opacity: 0.5 }} 
                  />
                  <ReferenceLine y={0} stroke="transparent" />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="url(#lineGradient)"
                    strokeWidth={3.5}
                    dot={{fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#0F0F1E'}}
                    activeDot={{r: 6, fill: '#34d399', stroke: '#0F0F1E', strokeWidth: 2}}
                    isAnimationActive={true}
                    animationDuration={1000}
                    filter="url(#glowEffect)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <FiDollarSign size={40} className="sm:w-12 sm:h-12 mb-4 opacity-30" />
                <p className="text-xs sm:text-sm font-medium">No revenue data available yet</p>
                <p className="text-[10px] sm:text-xs mt-2 text-gray-500">Start selling courses to see analytics</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-linear-to-br from-[#1E1E2E] via-[#1F1F2E] to-[#2B2B40] p-2.5 sm:p-3 lg:p-4 rounded-2xl lg:rounded-3xl shadow-2xl shadow-purple-900/25 border border-gray-800/50 hover:border-green-500/50 hover:shadow-purple-900/40 transition-all duration-500 group backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3 gap-3">
            <div>
              <h3 className="text-sm sm:text-base lg:text-lg font-black text-white group-hover:text-green-300 transition-colors duration-300">Recent Sales</h3>
              <p className="text-xs text-gray-400 mt-0.5 font-medium hidden sm:block">Latest enrollments</p>
            </div>
            {stats.recentTransactions?.length > 0 && (
              <button 
                onClick={() => router.push("/tutor/payments")}
                className="text-green-400 font-bold text-xs hover:text-green-300 hover:bg-green-600/10 px-2 py-1 rounded-lg transition-all duration-300 border border-green-500/30 hover:border-green-500/50 whitespace-nowrap"
              >
                View All ({stats.recentTransactions.length})
              </button>
            )}
          </div>
          <div className="space-y-1.5 sm:space-y-2 overflow-hidden">
            {dataLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-600/30 border-t-green-600"></div>
              </div>
            ) : stats.recentTransactions?.length > 0 ? (
              stats.recentTransactions.slice(0, 4).map((tx) => (
                <div key={tx._id} className="group/item flex justify-between items-center p-2 sm:p-3 hover:bg-[#2B2B40]/60 rounded-lg transition-all cursor-pointer border border-gray-800/30 hover:border-green-500/40 duration-300">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 bg-green-600/20 rounded-lg flex items-center justify-center font-black text-green-400 group-hover/item:bg-green-600 group-hover/item:text-white transition-all duration-300 shadow-lg shrink-0 border border-green-500/50">
                      <FiArrowUpRight size={16} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-white text-xs sm:text-sm group-hover/item:text-green-300 transition-colors duration-300 truncate">
                        {tx.course?.title || tx.student?.name || 'Enrollment'}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'})}
                      </p>
                    </div>
                  </div>
                  <span className="text-green-400 font-black text-xs sm:text-sm group-hover/item:text-green-300 transition-colors duration-300 ml-2">+₹{tx.amount}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FiDollarSign size={32} className="mx-auto mb-3 text-gray-600 opacity-50" />
                <p className="text-gray-400 text-xs sm:text-sm font-medium">No sales recorded yet.</p>
                <p className="text-gray-500 text-[10px] sm:text-xs mt-2">Transactions will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Transactions Modal */}
      {showAllTransactions && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAllTransactions(false)}>
          <div className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] rounded-2xl lg:rounded-3xl p-6 max-w-2xl w-full shadow-2xl shadow-green-900/40 border border-gray-800/50 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-white">All Sales Transactions</h3>
              <button
                onClick={() => setShowAllTransactions(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-300"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {stats.recentTransactions?.length > 0 ? (
                stats.recentTransactions.map((tx) => (
                  <div key={tx._id} className="group/item flex justify-between items-center p-4 hover:bg-[#2B2B40]/60 rounded-lg transition-all border border-gray-800/30 hover:border-green-500/40 duration-300">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center font-black text-green-400 group-hover/item:bg-green-600 group-hover/item:text-white transition-all duration-300 border border-green-500/50 shrink-0">
                        <FiArrowUpRight size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white text-sm group-hover/item:text-green-300 transition-colors duration-300 truncate">
                          {tx.course?.title || 'Course Enrollment'}
                        </p>
                        <p className="text-xs text-gray-400 font-medium">
                          {tx.student?.name || 'Student'} • {new Date(tx.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'})}
                        </p>
                      </div>
                    </div>
                    <span className="text-green-400 font-black text-sm group-hover/item:text-green-300 transition-colors duration-300 ml-3">+₹{tx.amount}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <FiDollarSign size={40} className="mx-auto mb-4 text-gray-600 opacity-50" />
                  <p className="text-gray-400 text-sm font-medium">No sales recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </TutorLayout>
  );
}
