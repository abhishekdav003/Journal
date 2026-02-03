/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./layout";
import { useAuth } from "../../context/AuthContext";
import { getPaymentHistory } from "@/services/apiService";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import PaymentTimer from "../../components/student/PaymentTimer";
import { generateInvoice } from "../../utils/invoiceGenerator";
import {
  FiDownload,
  FiCreditCard,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiBook,
  FiRefreshCw,
} from "react-icons/fi";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function Payments() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [transactions, setTransactions] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [retryingPayment, setRetryingPayment] = useState(null);

  // Handle invoice download
  const handleDownloadInvoice = (transaction) => {
    if (transaction.status !== "completed") {
      toast.error("Invoice can only be downloaded for completed payments");
      return;
    }
    generateInvoice(transaction, user);
    toast.success("Invoice generated successfully!");
  };

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Handle retry payment
  const handleRetryPayment = async (paymentId, courseTitle) => {
    try {
      setRetryingPayment(paymentId);

      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login to retry payment");
        router.push("/auth/student?tab=login");
        return;
      }

      // Call retry API
      const response = await axios.post(
        `${API_URL}/payments/${paymentId}/retry`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const { orderId, amount, currency, keyId } = response.data.data;

      // Open Razorpay checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: "Journal Learning",
        description: courseTitle,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${API_URL}/payments/verify`,
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (verifyResponse.data.success) {
              toast.success("Payment successful! Redirecting to course...");
              setTimeout(() => {
                router.push("/student/courses");
              }, 2000);
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error(
              error.response?.data?.message || "Payment verification failed",
            );
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#6D28D9",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Retry payment failed:", error);
      toast.error(error.response?.data?.message || "Failed to retry payment");
    } finally {
      setRetryingPayment(null);
    }
  };

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
      case "expired":
        return { label: "Expired", color: "orange" };
      case "refunded":
        return { label: "Refunded", color: "blue" };
      default:
        return { label: status, color: "gray" };
    }
  };

  return (
    <Layout>
      <Toaster position="top-center" />
      {/* WRAPPER FIX:
         w-full + min-w-0: Flex child ko shrink hone deta hai.
         overflow-x-hidden: Kisi bhi haal mein page scroll nahi hoga.
      */}
      <div className="w-full min-w-0 space-y-8 animate-in fade-in duration-500 pb-10 overflow-x-hidden">
        {/* --- Header --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Payment History
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              View your course purchase transactions
            </p>
          </div>
        </div>

        {/* --- Payment Summary Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 - Total Spent */}
          <div className="bg-gradient-to-br from-[#6D28D9] via-[#5B21B6] to-[#4C1D95] p-6 rounded-2xl text-white relative overflow-hidden shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 border border-purple-500/20">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <FiCreditCard className="w-5 h-5" />
                </div>
                <p className="text-purple-200 text-sm font-medium">
                  Total Spent
                </p>
              </div>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-white/20 rounded-lg w-36"></div>
                  <div className="h-5 bg-white/20 rounded-lg w-28"></div>
                </div>
              ) : (
                <>
                  <h2 className="text-4xl font-bold mb-3">
                    ₹{totalAmount.toLocaleString("en-IN")}
                  </h2>
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                      <p className="text-xs font-medium">
                        {
                          transactions.filter((t) => t.status === "completed")
                            .length
                        }{" "}
                        Courses
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
          </div>

          {/* Card 2 - Successful Payments */}
          <div className="bg-gradient-to-br from-[#10B981] to-[#059669] p-6 rounded-2xl text-white relative overflow-hidden shadow-2xl hover:shadow-green-500/20 transition-all duration-300 border border-green-400/20">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <FiCheckCircle className="w-5 h-5" />
                </div>
                <p className="text-green-100 text-sm font-medium">
                  Successful Payments
                </p>
              </div>
              {loading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-10 bg-white/20 rounded-lg w-24"></div>
                  <div className="h-5 bg-white/20 rounded-lg w-32"></div>
                </div>
              ) : (
                <>
                  <h2 className="text-4xl font-bold mb-3">
                    {
                      transactions.filter((t) => t.status === "completed")
                        .length
                    }
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <FiCheckCircle className="w-4 h-4" />
                    <span className="text-green-100">
                      All payments verified
                    </span>
                  </div>
                </>
              )}
            </div>
            <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
          </div>

          {/* Card 3 - Transaction Stats */}
          <div className="bg-[#1E1E2E] p-6 rounded-2xl border border-gray-800 shadow-xl hover:shadow-gray-800/50 transition-all duration-300">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 bg-[#2B2B40] rounded-lg">
                <FiAlertCircle className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-gray-400 text-sm font-medium">
                Other Transactions
              </p>
            </div>
            {loading ? (
              <div className="animate-pulse space-y-3">
                <div className="h-8 bg-gray-800 rounded-lg w-20"></div>
                <div className="h-px bg-gray-800 w-full"></div>
                <div className="space-y-2">
                  <div className="h-5 bg-gray-800 rounded w-24"></div>
                  <div className="h-5 bg-gray-800 rounded w-28"></div>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-white mb-4">
                  {transactions.filter((t) => t.status !== "completed").length}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#2B2B40]/50 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2">
                      <FiClock className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm text-gray-400">Pending</span>
                    </div>
                    <span className="text-lg font-bold text-yellow-400">
                      {
                        transactions.filter((t) => t.status === "pending")
                          .length
                      }
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#2B2B40]/50 rounded-lg border border-gray-800">
                    <div className="flex items-center gap-2">
                      <FiAlertCircle className="w-4 h-4 text-red-400" />
                      <span className="text-sm text-gray-400">
                        Failed/Expired
                      </span>
                    </div>
                    <span className="text-lg font-bold text-red-400">
                      {
                        transactions.filter((t) =>
                          ["failed", "expired"].includes(t.status),
                        ).length
                      }
                    </span>
                  </div>
                </div>
              </>
            )}
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
                    <th className="px-6 py-4 font-medium text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-gray-800"></div>
                          <div className="h-4 bg-gray-800 rounded w-40"></div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-3 bg-gray-800 rounded w-24"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-4 bg-gray-800 rounded w-20"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-6 bg-gray-800 rounded-full w-24"></div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="h-3 bg-gray-800 rounded w-20 ml-auto"></div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 bg-gray-800 rounded-lg w-24 mx-auto"></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                    <th className="px-6 py-4 font-medium text-center">
                      Action
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
                            {item.course?.thumbnail ? (
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                                <img
                                  src={item.course.thumbnail}
                                  alt={item.course.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-800 shrink-0 flex items-center justify-center">
                                <FiBook className="text-gray-600" />
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
                          <div className="flex flex-col gap-1">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium w-fit ${
                                statusInfo.color === "green"
                                  ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                  : statusInfo.color === "yellow"
                                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                    : statusInfo.color === "orange"
                                      ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
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
                            {item.status === "pending" && (
                              <PaymentTimer createdAt={item.createdAt} />
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="text-gray-500 text-xs font-mono">
                            #{item.razorpayOrderId?.slice(-8) || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {item.status === "completed" && (
                              <button
                                onClick={() => handleDownloadInvoice(item)}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition-colors"
                                title="Download Invoice"
                              >
                                <FiDownload size={12} />
                                <span>Invoice</span>
                              </button>
                            )}
                            {["pending", "failed", "expired"].includes(
                              item.status,
                            ) && (
                              <button
                                onClick={() =>
                                  handleRetryPayment(
                                    item._id,
                                    item.course?.title || "Course",
                                  )
                                }
                                disabled={retryingPayment === item._id}
                                className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
                              >
                                {retryingPayment === item._id ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white"></div>
                                    <span>Processing...</span>
                                  </>
                                ) : (
                                  <>
                                    <FiRefreshCw size={12} />
                                    <span>Retry</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
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
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-[#141417] border border-gray-800 rounded-xl p-4 flex flex-col gap-3 animate-pulse"
                  >
                    {/* Thumbnail skeleton */}
                    <div className="w-full h-32 rounded-lg bg-gray-800"></div>

                    {/* Title and amount skeleton */}
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="h-4 bg-gray-800 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-800 rounded w-1/2"></div>
                      </div>
                      <div className="h-5 bg-gray-800 rounded w-20"></div>
                    </div>

                    <div className="h-px bg-gray-800/50 w-full" />

                    {/* Status and order ID skeleton */}
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-gray-800 rounded-full w-24"></div>
                      <div className="h-3 bg-gray-800 rounded w-16"></div>
                    </div>
                  </div>
                ))}
              </>
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
                    {item.course?.thumbnail ? (
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-800">
                        <img
                          src={item.course.thumbnail}
                          alt={item.course.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-32 rounded-lg bg-gray-800 flex items-center justify-center">
                        <FiBook className="text-gray-600 text-4xl" />
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
                              : statusInfo.color === "orange"
                                ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
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

                    {/* Retry Button */}
                    {["pending", "failed", "expired"].includes(item.status) && (
                      <button
                        onClick={() =>
                          handleRetryPayment(
                            item._id,
                            item.course?.title || "Course",
                          )
                        }
                        disabled={retryingPayment === item._id}
                        className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                      >
                        {retryingPayment === item._id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <FiRefreshCw size={14} />
                            <span>Retry Payment</span>
                          </>
                        )}
                      </button>
                    )}
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
