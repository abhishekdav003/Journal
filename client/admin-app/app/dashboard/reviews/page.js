"use client";

import { useEffect, useState } from "react";
import { reviewsAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await reviewsAPI.getAll();
      setReviews(response.data.data.reviews || []);
    } catch (error) {
      toast.error("Failed to fetch reviews");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      await reviewsAPI.delete(reviewId);
      toast.success("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to delete review");
    }
  };

  const filteredReviews = reviews.filter(
    (review) =>
      review.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      review.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
      review.comment?.toLowerCase().includes(search.toLowerCase()),
  );

  const renderStars = (rating) => {
    return "⭐".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="max-w-full overflow-hidden">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
          Review Management
        </h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          Manage all course reviews
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 lg:p-6 mb-6">
        <input
          type="text"
          placeholder="Search reviews..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 text-sm lg:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:gap-6">
          {filteredReviews.map((review) => (
            <div
              key={review._id}
              className="bg-white rounded-xl shadow-md p-4 lg:p-6 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base lg:text-lg">
                      {review.student?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm lg:text-base">
                        {review.student?.name}
                      </p>
                      <p className="text-xs lg:text-sm text-gray-500">
                        {review.student?.email}
                      </p>
                    </div>
                  </div>

                  <div className="lg:ml-15">
                    <p className="font-semibold text-gray-700 mb-2 text-sm lg:text-base">
                      Course: {review.course?.title}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">
                        {renderStars(review.rating)}
                      </span>
                      <span className="text-sm font-semibold text-gray-600">
                        {review.rating}/5
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3">{review.comment}</p>

                    <p className="text-sm text-gray-500">
                      Posted on{" "}
                      {new Date(review.createdAt).toLocaleDateString()} at{" "}
                      {new Date(review.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(review._id)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium ml-4"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredReviews.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <p className="text-gray-500 text-lg">No reviews found</p>
        </div>
      )}
    </div>
  );
}
