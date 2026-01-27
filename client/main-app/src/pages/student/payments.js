import Layout from "./layout";
import {
  FiDownload,
  FiCreditCard,
  FiClock,
  FiCheckCircle,
} from "react-icons/fi";

export default function Payments() {
  const transactions = [
    {
      id: 1,
      course: "UI/UX Design Masterclass",
      date: "Jan 20, 2026",
      amount: "$49.99",
      status: "Success",
    },
    {
      id: 2,
      course: "Advanced React Patterns",
      date: "Jan 15, 2026",
      amount: "$59.00",
      status: "Success",
    },
    {
      id: 3,
      course: "Node.js Backend Bootcamp",
      date: "Jan 10, 2026",
      amount: "$39.50",
      status: "Pending",
    },
    {
      id: 4,
      course: "Fullstack Next.js Course",
      date: "Jan 05, 2026",
      amount: "$29.00",
      status: "Success",
    },
  ];

  return (
    <Layout>
      {/* WRAPPER FIX:
         w-full + min-w-0: Flex child ko shrink hone deta hai.
         overflow-x-hidden: Kisi bhi haal mein page scroll nahi hoga.
      */}
      <div className="w-full min-w-0 space-y-8 animate-in fade-in duration-500 pb-10 overflow-x-hidden">
        
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Payments
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage your billing and transaction history.
            </p>
          </div>
          <button className="w-full sm:w-auto bg-[#6D28D9] hover:bg-[#5b21b6] text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/40 active:scale-95">
            + Add Method
          </button>
        </div>

        {/* --- Payment Cards Row --- */}
        {/* Grid logic: Mobile(1), Tablet(2), Laptop(3) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-gradient-to-br from-[#6D28D9] to-[#4C1D95] p-6 rounded-3xl text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <p className="text-purple-200 text-sm font-medium">Total Spent</p>
              <h2 className="text-4xl font-bold mt-2">$148.49</h2>
              <p className="text-xs bg-white/20 inline-block px-2 py-1 rounded-md mt-4 backdrop-blur-sm">
                3 Courses Purchased
              </p>
            </div>
            <div className="absolute -right-5 -bottom-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          </div>

          {/* Card 2 */}
          <div className="bg-[#1E1E2E] p-6 rounded-3xl border border-gray-800 flex flex-col justify-between group hover:border-purple-500/50 transition-all shadow-lg">
            <div className="flex justify-between items-start">
              <div className="p-3 bg-[#2B2B40] rounded-xl text-white">
                <FiCreditCard className="w-6 h-6" />
              </div>
              <span className="text-xs text-gray-500 bg-[#2B2B40] px-2 py-1 rounded">
                Primary
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Mastercard ending in</p>
              <p className="text-xl font-bold text-white tracking-widest mt-1">
                **** 8824
              </p>
            </div>
          </div>
        </div>

        {/* --- Transaction History --- */}
        <div className="bg-[#1E1E2E] rounded-3xl border border-gray-800 shadow-lg w-full flex flex-col overflow-hidden">
          <div className="p-6 border-b border-gray-800">
            <h3 className="text-lg font-bold text-white">
              Transaction History
            </h3>
          </div>

          {/* ✅ KEY FIX HERE: 
             Pehle 'md:block' tha (768px+ par table dikhti thi).
             Ab 'lg:block' kar diya hai (1024px+ par table dikhegi).
             
             Reason: 768px-1024px ke beech sidebar open hota hai aur jagah kam hoti hai,
             isliye table fit nahi hoti. Ab us range me bhi "Card View" dikhega.
          */}
          <div className="hidden lg:block w-full overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap min-w-[700px]">
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
                  <tr
                    key={item.id}
                    className="hover:bg-[#2B2B40]/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-white font-medium">
                      {item.course}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {item.date}
                    </td>
                    <td className="px-6 py-4 text-white font-bold">
                      {item.amount}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                          item.status === "Success"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                        }`}
                      >
                        {item.status === "Success" ? (
                          <FiCheckCircle size={12} />
                        ) : (
                          <FiClock size={12} />
                        )}
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

          {/* ✅ MOBILE/TABLET VIEW (Cards):
             'lg:hidden' ka matlab hai ye view Mobile aur Tablet (1024px se neeche)
             dono par dikhega. Isse overflow ka koi chance hi nahi bachta.
          */}
          <div className="lg:hidden flex flex-col gap-4 p-4">
            {transactions.map((item) => (
              <div
                key={item.id}
                className="bg-[#141417] border border-gray-800 rounded-xl p-4 flex flex-col gap-3"
              >
                {/* Row 1 */}
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium text-sm line-clamp-2">
                      {item.course}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {item.date}
                    </div>
                  </div>
                  <div className="text-white font-bold text-right shrink-0">
                    {item.amount}
                  </div>
                </div>

                <div className="h-px bg-gray-800/50 w-full" />

                {/* Row 2 */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                      item.status === "Success"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}
                  >
                    {item.status === "Success" ? (
                      <FiCheckCircle size={12} />
                    ) : (
                      <FiClock size={12} />
                    )}
                    {item.status}
                  </span>

                  <button className="flex items-center gap-2 text-xs text-gray-300 hover:text-white bg-[#2B2B40] hover:bg-[#3E3E55] px-3 py-1.5 rounded-lg transition-colors">
                    <FiDownload size={14} /> Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}