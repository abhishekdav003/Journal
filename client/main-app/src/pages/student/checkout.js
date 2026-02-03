import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./layout";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";
import { FiLock, FiShoppingCart, FiCheckCircle } from "react-icons/fi";

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { courseId } = router.query;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    const token =
      typeof window !== "undefined" && localStorage.getItem("token");
    if (!token || !user) {
      router.replace("/auth/student?tab=login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const baseURL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
      const response = await axios.get(`${baseURL}/courses/${courseId}`);
      setCourse(
        response.data.data?.course || response.data.course || response.data,
      );
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!course) return;

    setProcessing(true);
    const token = localStorage.getItem("token");
    const baseURL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Please try again.");
        setProcessing(false);
        return;
      }

      // Create order
      const orderResponse = await axios.post(
        `${baseURL}/payments/create-order`,
        { courseId: course._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const { orderId, amount, currency, keyId } = orderResponse.data.data;

      // Razorpay options
      const options = {
        key: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: currency,
        name: "Learning Platform",
        description: course.title,
        order_id: orderId,
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await axios.post(
              `${baseURL}/payments/verify`,
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              },
              { headers: { Authorization: `Bearer ${token}` } },
            );

            if (verifyResponse.data.success) {
              toast.success(
                "Payment successful! Enrolling you in the course...",
              );
              setTimeout(() => {
                router.push(
                  `/learn/${course._id}/${course.title.toLowerCase().replace(/\s+/g, "-")}`,
                );
              }, 2000);
            }
          } catch (error) {
            console.error("Payment verification failed:", error);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: {
          color: "#6D28D9",
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
            toast.error("Payment cancelled");
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast.error(
        error.response?.data?.message || "Payment failed. Please try again.",
      );
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  if (!course) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Course not found
          </h2>
          <button
            onClick={() => router.push("/courses")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Browse Courses
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toaster position="top-right" />
      <div className="max-w-4xl mx-auto space-y-8 pb-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Complete Your Purchase
          </h1>
          <p className="text-gray-400">
            Review your order and complete payment
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            {/* Course Details */}
            <div className="bg-[#1E1E2E] rounded-3xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">
                Course Details
              </h2>
              <div className="flex gap-4">
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-32 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">
                    {course.title}
                  </h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span className="capitalize">
                      {course.level || "All levels"}
                    </span>
                    <span>•</span>
                    <span>{course.modules?.length || 0} modules</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="bg-[#1E1E2E] rounded-3xl border border-gray-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <FiLock className="text-green-500" />
                Secure Payment
              </h2>
              <div className="space-y-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-500" />
                  <span>SSL encrypted payment gateway</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-500" />
                  <span>Powered by Razorpay</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiCheckCircle className="text-green-500" />
                  <span>Instant access after payment</span>
                </div>
              </div>
            </div>
          </div>

          {/* Price Summary Card */}
          <div className="lg:col-span-1">
            <div className="bg-linear-to-br from-[#6D28D9] to-[#4C1D95] rounded-3xl p-6 text-white sticky top-24">
              <h2 className="text-lg font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-purple-200">Course Price</span>
                  <span className="font-bold">
                    ₹{course.price?.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-purple-200">Tax (18%)</span>
                  <span className="font-bold">
                    ₹{Math.round(course.price * 0.18).toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="border-t border-white/20 pt-4">
                  <div className="flex justify-between text-lg">
                    <span>Total</span>
                    <span className="font-bold">
                      ₹{Math.round(course.price * 1.18).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={processing}
                className="w-full bg-white text-purple-600 font-bold py-3 px-6 rounded-xl hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-purple-600"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <FiShoppingCart />
                    Proceed to Pay
                  </>
                )}
              </button>

              <p className="text-xs text-purple-200 text-center mt-4">
                By proceeding, you agree to our Terms & Conditions
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
