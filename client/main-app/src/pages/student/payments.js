import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./layout";
import { useAuth } from "../../context/AuthContext";
import { getPaymentHistory } from "@/services/apiService";
import {
  FiDownload,
  FiCreditCard,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import Image from "next/image";

export default function Payments() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Redirect unauthenticated users
  useEffect(() => {
    if (authLoading) return;
    const token =
      typeof window !== "undefined" && localStorage.getItem("token");
    if (!token || !user) {
      router.replace("/auth/student?tab=login");
    }
  }, [authLoading, user, router]);

  // Fetch payment history
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const response = await getPaymentHistory();
        if (response.data.success) {
          setTransactions(response.data.data.payments || []);
          setTotalAmount(response.data.totalAmount || 0);
        }
      } catch (error) {
        console.error("Failed to fetch payment history:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPayments();
    }
  }, [user]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "completed":
        return { label: "Success", color: "green" };
      case "pending":
        return { label: "Pending", color: "yellow" };
      case "failed":
        return { label: "Failed", color: "red" };
      case "refunded":
        return { label: "Refunded", color: "blue" };
      default:
        return { label: status, color: "gray" };
    }
  };

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
          {/* Card 1 - Total Spent */}
          <div className="bg-linear-to-br from-[#6D28D9] to-[#4C1D95] p-6 rounded-3xl text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10">
              <p className="text-purple-200 text-sm font-medium">
                💰 Total Spent
              </p>
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-10 bg-white/20 rounded w-32 mt-2"></div>
                  <div className="h-6 bg-white/20 rounded w-40 mt-4"></div>
                </div>
              ) : (
                <>
                  <h2 className="text-4xl font-bold mt-2">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </h2>
                  <p className="text-xs bg-white/20 inline-block px-2 py-1 rounded-md mt-4 backdrop-blur-sm">
                    {
                      transactions.filter((t) => t.status === "completed")
                        .length
                    }{" "}
                    Courses Purchased
                  </p>
                </>
              )}
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
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                  <FiCreditCard className="text-gray-600 text-3xl" />
                </div>
                <p className="text-gray-400 text-lg">No transactions yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Your payment history will appear here
                </p>
              </div>
            ) : (
              <table className="w-full text-left whitespace-nowrap min-w-175">
                <thead className="bg-[#2B2B40] text-gray-400 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Course Name</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Amount</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium text-right">
                      Order ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {transactions.map((item) => {
                    const statusInfo = getStatusDisplay(item.status);
                    return (
                      <tr
                        key={item._id}
                        className="hover:bg-[#2B2B40]/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {item.course?.thumbnail && (
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                                <Image
                                  src={item.course.thumbnail}
                                  alt={item.course.title}
                                  width={48}
                                  height={48}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            )}
                            <span className="text-white font-medium">
                              {item.course?.title || "Course Deleted"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {formatDate(item.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-white font-bold">
                          ₹{item.amount.toLocaleString("en-IN")}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
                              statusInfo.color === "green"
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : statusInfo.color === "yellow"
                                  ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                  : statusInfo.color === "red"
                                    ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                    : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                            }`}
                          >
                            {statusInfo.color === "green" ? (
                              <FiCheckCircle size={12} />
                            ) : statusInfo.color === "yellow" ? (
                              <FiClock size={12} />
                            ) : (
                              <FiAlertCircle size={12} />
                            )}
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-gray-500 text-xs font-mono">
                            #{item.razorpayOrderId?.slice(-8) || "N/A"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ✅ MOBILE/TABLET VIEW (Cards) */}
          <div className="lg:hidden flex flex-col gap-4 p-4">
            {loading ? (
              <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
              </div>
            ) : transactions.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-800 flex items-center justify-center">
                  <FiCreditCard className="text-gray-600 text-3xl" />
                </div>
                <p className="text-gray-400 text-lg">No transactions yet</p>
                <p className="text-gray-500 text-sm mt-2">
                  Your payment history will appear here
                </p>
              </div>
            ) : (
              transactions.map((item) => {
                const statusInfo = getStatusDisplay(item.status);
                return (
                  <div
                    key={item._id}
                    className="bg-[#141417] border border-gray-800 rounded-xl p-4 flex flex-col gap-3"
                  >
                    {/* Course Info */}
                    {item.course?.thumbnail && (
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-800">
                        <Image
                          src={item.course.thumbnail}
                          alt={item.course.title}
                          width={400}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Row 1 */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm line-clamp-2">
                          {item.course?.title || "Course Deleted"}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {formatDate(item.createdAt)}
                        </div>
                      </div>
                      <div className="text-white font-bold text-right shrink-0">
                        ₹{item.amount.toLocaleString("en-IN")}
                      </div>
                    </div>

                    <div className="h-px bg-gray-800/50 w-full" />

                    {/* Row 2 */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusInfo.color === "green"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : statusInfo.color === "yellow"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : statusInfo.color === "red"
                                ? "bg-red-500/10 text-red-400 border border-red-500/20"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                        }`}
                      >
                        {statusInfo.color === "green" ? (
                          <FiCheckCircle size={12} />
                        ) : statusInfo.color === "yellow" ? (
                          <FiClock size={12} />
                        ) : (
                          <FiAlertCircle size={12} />
                        )}
                        {statusInfo.label}
                      </span>

                      <span className="text-gray-500 text-xs font-mono">
                        #{item.razorpayOrderId?.slice(-8) || "N/A"}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
