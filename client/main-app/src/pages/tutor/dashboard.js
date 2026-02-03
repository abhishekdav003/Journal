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
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

export default function TutorDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalStudents: 0,
    totalRevenue: 0,
    recentTransactions: [],
    monthlyData: [
      { name: "Jan", revenue: 4000 },
      { name: "Feb", revenue: 3000 },
      { name: "Mar", revenue: 5000 },
      { name: "Apr", revenue: 4500 },
      { name: "May", revenue: 6000 },
      { name: "Jun", revenue: 5500 },
    ]
  });

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
        const res = await getDashboardStats();
        // Use functional state update to merge safely
        setStats((prev) => ({ ...prev, ...res.data.data }));
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
        if (err.response && err.response.status === 401) {
          router.push("/auth/tutor?tab=login");
        }
      }
    };

    if (user && user.role === "tutor") {
      fetchStats();
    }
    // Only re-run if user ID changes (avoids loop if user object reference changes)
  }, [user?._id, user?.role]); 

  if (loading || !user || user.role !== "tutor") return null;

  return (
    <TutorLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8 lg:mb-10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
            Welcome back, <span className="text-purple-600">{user.name?.split(' ')[0]}</span>! 👋
          </h1>
          <p className="text-gray-500 mt-1 sm:mt-2 text-sm sm:text-base lg:text-lg font-medium">Here is a professional overview of your teaching performance.</p>
        </div>
        <button 
          onClick={() => router.push('/tutor/courses/create')}
          className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 sm:px-6 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold transition-all transform active:scale-95 shadow-xl shadow-purple-100 w-full md:w-auto text-sm sm:text-base"
        >
          <FiPlus size={20} />
          Create New Course
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-6 sm:mb-8 lg:mb-10">
        <StatCard 
          title="Total Earnings" 
          value={`₹${stats.totalRevenue?.toLocaleString()}`} 
          icon={FiDollarSign} 
          trend="up" 
          trendValue="12%" 
          color="purple" 
        />
        <StatCard 
          title="Active Learners" 
          value={stats.totalStudents} 
          icon={FiUsers} 
          trend="up" 
          trendValue="New Students" 
          color="blue" 
        />
        <StatCard 
          title="Live Content" 
          value={`${stats.totalCourses} Courses`} 
          icon={FiBookOpen} 
          color="orange" 
        />
      </div>

      {/* Analytics & Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
            <h3 className="text-lg sm:text-xl font-black text-gray-900">Revenue Analytics</h3>
            <select className="bg-gray-50 border-none rounded-xl text-xs sm:text-sm font-bold p-2 outline-none cursor-pointer w-full sm:w-auto">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          <div className="h-64 sm:h-72 w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.monthlyData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis hide />
                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }} cursor={{ stroke: '#8b5cf6', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-[2.5rem] shadow-sm border border-gray-100 text-left">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-black text-gray-900">Recent Sales</h3>
            <button className="text-purple-600 font-bold text-xs sm:text-sm hover:underline">View All</button>
          </div>
          <div className="space-y-4 sm:space-y-6">
            {stats.recentTransactions?.length > 0 ? (
              stats.recentTransactions.map((tx) => (
                <div key={tx._id} className="group flex justify-between items-center p-3 sm:p-4 hover:bg-gray-50 rounded-2xl sm:rounded-3xl transition-all cursor-pointer">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-gray-400 group-hover:bg-white group-hover:text-purple-600 transition-all shadow-sm shrink-0">
                      <FiArrowUpRight size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-xs sm:text-sm">Enrollment</p>
                      <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </p>
                    </div>
                  </div>
                  <span className="text-gray-900 font-black text-xs sm:text-sm">+₹{tx.amount}</span>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-400 text-xs sm:text-sm font-medium italic">No sales recorded yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </TutorLayout>
  );
}