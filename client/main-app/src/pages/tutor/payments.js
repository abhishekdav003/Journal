import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { getDashboardStats } from '../../services/apiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FiDownload } from 'react-icons/fi';
import TutorLayout from '@/components/tutor/TutorLayout';
import { generateInvoice } from '@/utils/invoiceGenerator';

export default function TutorPayments() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    totalRevenue: 0,
    graphData: [],
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

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
    // Only fetch stats if user is authenticated and is a tutor
    if (!authLoading && user && user.role === "tutor") {
      fetchStats();
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (!showAllTransactions) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showAllTransactions]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await getDashboardStats();
      setStats(res.data.data);
    } catch (err) {
      console.error("Error fetching stats", err);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <TutorLayout>
      <div className="space-y-8">
        
        {/* Header Stat Card */}
        <div className="bg-linear-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white shadow-lg">
          <p className="text-purple-100 font-medium mb-1">Total Lifetime Revenue</p>
          <h1 className="text-4xl font-bold">₹{stats.totalRevenue.toLocaleString()}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Revenue Graph (Requirement 8) */}
          <div className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-6 rounded-2xl shadow-sm border border-gray-800/50 h-96">
            <h3 className="text-xl font-bold mb-6 text-white">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.graphData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #444', backgroundColor: '#1E1E2E', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)' }} 
                  labelStyle={{ color: '#fff' }}
                  cursor={{ fill: '#2B2B40' }}
                />
                <Bar dataKey="revenue" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Transactions Table (Requirement 10) */}
          <div className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-6 rounded-2xl shadow-sm border border-gray-800/50 h-96">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Recent Transactions</h3>
              {stats.recentTransactions.length > 0 && (
                <button
                  onClick={() => setShowAllTransactions(true)}
                  className="text-green-400 font-bold text-xs hover:text-green-300 hover:bg-green-600/10 px-2 py-1 rounded-lg transition-all duration-300 border border-green-500/30 hover:border-green-500/50 whitespace-nowrap"
                >
                  View All ({stats.recentTransactions.length})
                </button>
              )}
            </div>
            <div className="space-y-4">
              {stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.slice(0, 4).map((tx) => (
                  <div key={tx._id} className="flex justify-between items-center p-3 hover:bg-[#2B2B40]/60 rounded-lg transition-colors border border-gray-800/30 hover:border-purple-500/30">
                    <div>
                      <p className="font-semibold text-white">Payment received</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-green-400 font-bold bg-green-600/20 px-3 py-1 rounded-full text-sm border border-green-500/50">
                      +₹{tx.amount}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic">No recent transactions found.</p>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* All Transactions Modal */}
      {showAllTransactions && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAllTransactions(false)}
        >
          <div
            className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] rounded-2xl p-6 max-w-2xl w-full shadow-2xl border border-gray-800/50 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">All Transactions</h3>
              <button
                onClick={() => setShowAllTransactions(false)}
                className="text-gray-400 hover:text-white p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-300"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx) => (
                  <div key={tx._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 hover:bg-[#2B2B40]/60 rounded-lg transition-colors border border-gray-800/30 hover:border-purple-500/30">
                    <div>
                      <p className="font-semibold text-white">Payment received</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-green-400 font-bold bg-green-600/20 px-3 py-1 rounded-full text-sm border border-green-500/50">
                        +₹{tx.amount}
                      </span>
                      <button
                        onClick={() => generateInvoice(tx, user)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500/60 px-2.5 py-1 rounded-md transition-all"
                      >
                        <FiDownload size={14} />
                        PDF
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 italic">No recent transactions found.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </TutorLayout>
  );
}