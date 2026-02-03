/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  FiShoppingCart,
  FiTrash2,
  FiArrowRight,
  FiBook,
  FiTag,
} from "react-icons/fi";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartItems(cart);
    } catch (error) {
      console.error("Failed to load cart:", error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = (courseId) => {
    const updatedCart = cartItems.filter((item) => item._id !== courseId);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Trigger cart update event
    window.dispatchEvent(new Event("cart-update"));
  };

  const clearCart = () => {
    if (confirm("Are you sure you want to clear your cart?")) {
      setCartItems([]);
      localStorage.setItem("cart", JSON.stringify([]));

      // Trigger cart update event
      window.dispatchEvent(new Event("cart-update"));
    }
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price || 0), 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    // Check if user is logged in
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please login to continue");
      router.push("/auth/student");
      return;
    }

    // Navigate to checkout/payment
    router.push("/student/payments");
  };

  const getCourseUrl = (course) => {
    const courseName = course.title.toLowerCase().replace(/\s+/g, "-");
    return `/course/${course._id}/${courseName}`;
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Header */}
      <div className="bg-linear-to-br from-[#1E1E2E] via-[#2B2B40] to-[#1E1E2E] text-white py-12 border-b border-gray-800">
        <div className="container mx-auto px-6 lg:px-20">
          <div className="flex items-center gap-3 mb-4">
            <FiShoppingCart className="text-4xl text-purple-400" />
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">Shopping Cart</h1>
              <p className="text-gray-400 mt-1">
                {cartItems.length}{" "}
                {cartItems.length === 1 ? "course" : "courses"} in your cart
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 lg:px-20 py-12">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading cart...</p>
          </div>
        ) : cartItems.length === 0 ? (
          // Empty Cart State
          <div className="text-center py-20 bg-[#1E1E2E] rounded-2xl border border-gray-800">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <FiShoppingCart className="text-purple-400 text-5xl" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-400 mb-6">
              Explore our courses and add them to your cart
            </p>
            <button
              onClick={() => router.push("/courses")}
              className="px-8 py-3 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-full transition-all inline-flex items-center gap-2"
            >
              Browse Courses
              <FiArrowRight />
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">
                  {cartItems.length} Course{cartItems.length !== 1 && "s"} in
                  Cart
                </h2>
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {cartItems.map((course) => (
                <div
                  key={course._id}
                  className="bg-[#1E1E2E] border border-gray-800 hover:border-purple-500/30 rounded-xl overflow-hidden transition-all"
                >
                  <div className="flex gap-4 p-4">
                    {/* Course Thumbnail */}
                    <div
                      onClick={() => router.push(getCourseUrl(course))}
                      className="flex-shrink-0 w-32 h-20 bg-linear-to-br from-purple-900/30 to-pink-900/30 rounded-lg overflow-hidden cursor-pointer"
                    >
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiBook className="text-purple-400 text-3xl opacity-40" />
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <h3
                        onClick={() => router.push(getCourseUrl(course))}
                        className="font-bold text-white text-base line-clamp-2 hover:text-purple-400 cursor-pointer transition-colors mb-2"
                      >
                        {course.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-2">
                        {course.tutor?.name || "Expert Instructor"}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {course.category && (
                          <span className="px-2 py-0.5 bg-linear-to-r from-yellow-400/20 to-orange-400/20 border border-yellow-400/30 text-yellow-400 rounded text-[10px] font-bold uppercase">
                            {course.category}
                          </span>
                        )}
                        {course.level && (
                          <span className="px-2 py-0.5 bg-linear-to-r from-blue-400/20 to-cyan-400/20 border border-blue-400/30 text-blue-400 rounded text-[10px] font-bold uppercase">
                            {course.level}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="flex flex-col items-end justify-between">
                      <p className="text-2xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        ₹{course.price?.toLocaleString() || 0}
                      </p>
                      <button
                        onClick={() => removeFromCart(course._id)}
                        className="text-red-400 hover:text-red-300 transition-colors p-2"
                        title="Remove from cart"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-[#1E1E2E] border border-gray-800 rounded-2xl p-6 sticky top-6">
                <h2 className="text-xl font-bold text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between text-gray-400">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span className="text-white font-semibold">
                      ₹{calculateTotal().toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-gray-400 pt-4 border-t border-gray-700">
                    <span className="font-bold text-white text-lg">Total</span>
                    <span className="text-2xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      ₹{calculateTotal().toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-4 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  Proceed to Checkout
                  <FiArrowRight />
                </button>

                <div className="mt-6 pt-6 border-t border-gray-700">
                  <div className="flex items-start gap-2 text-gray-400 text-sm">
                    <FiTag className="mt-0.5 flex-shrink-0" />
                    <p>30-Day Money-Back Guarantee</p>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/courses")}
                  className="w-full mt-4 py-3 bg-[#2B2B40] hover:bg-[#3B3B50] text-white font-medium rounded-xl transition-all border border-gray-700"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
