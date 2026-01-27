import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./layout";
import { useAuth } from "../../context/AuthContext";
import { FiAlertTriangle, FiXCircle } from "react-icons/fi";

export default function CloseAccount() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  // Redirect unauthenticated users
  useEffect(() => {
    if (loading) return;
    const token =
      typeof window !== "undefined" && localStorage.getItem("token");
    if (!token || !user) {
      router.replace("/auth/student?tab=login");
    }
  }, [loading, user, router]);

  const handleCloseAccount = () => {
    if (confirmText.toLowerCase() === "close my account") {
      // In a real app, call API to delete account
      console.log("Closing account...");
      logout();
    }
  };

  const currentUser = user?.user || user || {};

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Header */}
        <div className="bg-[#1E1E2E] p-6 rounded-xl border border-gray-800">
          <h1 className="text-2xl font-bold text-white">Close Account</h1>
          <p className="text-gray-400 text-sm mt-1">
            Permanently delete your account and all associated data
          </p>
        </div>

        {/* Warning Section */}
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl">
          <div className="flex items-start gap-4">
            <FiAlertTriangle
              className="text-red-400 flex-shrink-0 mt-1"
              size={24}
            />
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                Warning
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                If you close your account, you will be unsubscribed from all{" "}
                <strong>{currentUser?.enrolledCourses?.length || 0}</strong> of
                {' your courses, and will lose access forever. Account deletion is'}
                {' final. There will be no way to retrieve or restore your account,'}
                {' or any associated data with your account. If you\'re sure you'}
                {' want to continue, type'}
                <strong className="text-white">{'"close my account"'}</strong> below
                and click Close Account.
              </p>
            </div>
          </div>
        </div>

        {/* Close Account Form */}
        <div className="bg-[#1E1E2E] p-8 rounded-xl border border-gray-800 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Are you absolutely sure you want to close your account?
            </h3>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                {'Type "close my account" to confirm'}
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 focus:outline-none"
                placeholder="close my account"
              />
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={confirmText.toLowerCase() !== "close my account"}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiXCircle size={20} />
              Close Account
            </button>
          </div>

          <div className="pt-6 border-t border-gray-800">
            <p className="text-sm text-gray-400">
              Need help? Contact support at{" "}
              <a
                href="mailto:support@journal.com"
                className="text-purple-400 hover:underline"
              >
                support@journal.com
              </a>
            </p>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-[#1E1E2E] rounded-xl border border-gray-800 p-8 max-w-md w-full space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <FiAlertTriangle className="text-red-400" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    Final Confirmation
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    This action cannot be undone
                  </p>
                </div>
              </div>

              <p className="text-gray-300 text-sm">
                Are you absolutely sure you want to permanently delete your
                account? All your data, courses, and progress will be lost
                forever.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
