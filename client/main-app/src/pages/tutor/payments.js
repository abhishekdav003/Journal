import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import TutorLayout from '@/components/tutor/TutorLayout';

export default function TutorPayments() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    graphData: [],
    recentTransactions: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/dashboard/stats', { 
          withCredentials: true 
        });
        setStats(res.data.data);
      } catch (err) {
        console.error("Error fetching stats");
      }
    };
    fetchStats();
  }, []);

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
          <div className="bg-white p-6 rounded-2xl shadow-sm h-96">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Monthly Revenue</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.graphData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{ fill: '#F3F4F6' }}
                />
                <Bar dataKey="revenue" fill="#7C3AED" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent Transactions Table (Requirement 10) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm h-96 overflow-y-auto">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Recent Transactions</h3>
            <div className="space-y-4">
              {stats.recentTransactions.length > 0 ? (
                stats.recentTransactions.map((tx) => (
                  <div key={tx._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100">
                    <div>
                      <p className="font-semibold text-gray-800">Payment received</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span className="text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full text-sm">
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
    </TutorLayout>
  );
}