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
        <div className="relative bg-linear-to-br from-[#1E1E2E] via-[#2B2B40] to-[#1E1E2E] p-8 rounded-2xl border border-red-500/30 shadow-xl overflow-hidden">
          {/* Decorative blur circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-red-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
              <FiXCircle className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                Close Account
              </h1>
              <p className="text-gray-300 text-sm mt-1">
                ⚠️ Permanently delete your account and all associated data
              </p>
            </div>
          </div>
        </div>

        {/* Warning Section */}
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl">
          <div className="flex items-start gap-4">
            <FiAlertTriangle
              className="text-red-400 shrink-0 mt-1"
              size={24}
            />
            <div>
              <h3 className="text-lg font-semibold text-red-400 mb-2">
                Warning
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                If you close your account, you will be unsubscribed from all{" "}
                <strong>{currentUser?.enrolledCourses?.length || 0}</strong> of
                {
                  " your courses, and will lose access forever. Account deletion is"
                }
                {
                  " final. There will be no way to retrieve or restore your account,"
                }
                {
                  " or any associated data with your account. If you're sure you"
                }
                {" want to continue, type"}
                <strong className="text-white">
                  {'"close my account"'}
                </strong>{" "}
                below and click Close Account.
              </p>
            </div>
          </div>
        </div>

        {/* Close Account Form */}
        <div className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-8 rounded-2xl border border-purple-500/20 shadow-xl space-y-6">
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-1 h-8 bg-linear-to-b from-red-500 to-orange-500 rounded-full"></div>
              <h3 className="text-xl font-bold text-white">
                🔐 Final Confirmation Required
              </h3>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2 font-medium">
                {'Type "close my account" to confirm deletion'}
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full bg-[#0F0F16] border border-gray-700 rounded-xl px-4 py-3.5 text-white focus:border-red-500 focus:ring-2 focus:ring-red-500/50 focus:outline-none transition-all placeholder-gray-500"
                placeholder="Type here to confirm..."
              />
            </div>

            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={confirmText.toLowerCase() !== "close my account"}
              className="group bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
            >
              <FiXCircle size={22} />
              Close My Account Forever
            </button>
          </div>

          <div className="pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-300 flex items-center gap-2">
              <span>💉</span>
              Need help instead?{" "}
              <a
                href="mailto:support@journal.com"
                className="text-purple-400 hover:text-purple-300 underline font-medium"
              >
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-linear-to-br from-[#1E1E2E] via-[#2B2B40] to-[#1E1E2E] rounded-2xl border-2 border-red-500/30 p-8 max-w-md w-full space-y-6 shadow-2xl animate-scale-in">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                  <FiAlertTriangle className="text-white" size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Final Confirmation
                  </h3>
                  <p className="text-sm text-red-300 mt-1 font-medium">
                    ⚠️ This action cannot be undone
                  </p>
                </div>
              </div>

              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-gray-200 text-sm leading-relaxed">
                  Are you{" "}
                  <strong className="text-white">absolutely sure</strong> you
                  want to permanently delete your account? All your data,
                  courses, and progress will be{" "}
                  <strong className="text-red-300">lost forever</strong>.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:scale-105"
                >
                  ← Cancel
                </button>
                <button
                  onClick={handleCloseAccount}
                  className="flex-1 bg-linear-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Yes, Delete →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
