import Layout from "./layout";
import { FiDownload, FiCreditCard, FiClock, FiCheckCircle } from "react-icons/fi";

export default function Payments() {
  // Dummy Data
  const transactions = [
    { id: 1, course: "UI/UX Design Masterclass", date: "Jan 20, 2026", amount: "$49.99", status: "Success" },
    { id: 2, course: "Advanced React Patterns", date: "Jan 15, 2026", amount: "$59.00", status: "Success" },
    { id: 3, course: "Node.js Backend Bootcamp", date: "Jan 10, 2026", amount: "$39.50", status: "Pending" },
  ];

  return (
    <Layout>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
             <h1 className="text-3xl font-bold text-white">Payments</h1>
             <p className="text-gray-400 text-sm mt-1">Manage your billing and transaction history.</p>
          </div>
          <button className="bg-[#6D28D9] hover:bg-[#5b21b6] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/40">
            + Add Method
          </button>
        </div>

        {/* Payment Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Main Balance */}
            <div className="bg-linear-to-br from-[#6D28D9] to-[#4C1D95] p-6 rounded-3xl text-white relative overflow-hidden shadow-xl">
                <div className="relative z-10">
                    <p className="text-purple-200 text-sm font-medium">Total Spent</p>
                    <h2 className="text-4xl font-bold mt-2">$148.49</h2>
                    <p className="text-xs bg-white/20 inline-block px-2 py-1 rounded-md mt-4 backdrop-blur-sm">
                        3 Courses Purchased
                    </p>
                </div>
                {/* Decoration */}
                <div className="absolute -right-5 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            </div>

            {/* Card 2: Saved Card */}
            <div className="bg-[#1E1E2E] p-6 rounded-3xl border border-gray-800 flex flex-col justify-between group hover:border-purple-500/50 transition-all">
                <div className="flex justify-between items-start">
                    <div className="p-3 bg-[#2B2B40] rounded-xl text-white">
                        <FiCreditCard className="w-6 h-6" />
                    </div>
                    <span className="text-xs text-gray-500 bg-[#2B2B40] px-2 py-1 rounded">Primary</span>
                </div>
                <div>
                    <p className="text-gray-400 text-sm">Mastercard ending in</p>
                    <p className="text-xl font-bold text-white tracking-widest mt-1">**** 8824</p>
                </div>
            </div>
        </div>

        {/* Transaction History Table */}
        <div className="bg-[#1E1E2E] rounded-3xl border border-gray-800 overflow-hidden">
            <div className="p-6 border-b border-gray-800">
                <h3 className="text-lg font-bold text-white">Transaction History</h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#2B2B40] text-gray-400 text-xs uppercase">
                        <tr>
                            <th className="px-6 py-4 font-medium">Course Name</th>
                            <th className="px-6 py-4 font-medium">Date</th>
                            <th className="px-6 py-4 font-medium">Amount</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Invoice</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {transactions.map((item) => (
                            <tr key={item.id} className="hover:bg-[#2B2B40]/50 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">{item.course}</td>
                                <td className="px-6 py-4 text-gray-400 text-sm">{item.date}</td>
                                <td className="px-6 py-4 text-white font-bold">{item.amount}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                                        item.status === 'Success' 
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                    }`}>
                                        {item.status === 'Success' ? <FiCheckCircle size={12} /> : <FiClock size={12} />}
                                        {item.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-gray-400 hover:text-purple-400 transition-colors p-2">
                                        <FiDownload size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>

      </div>
    </Layout>
  );
}