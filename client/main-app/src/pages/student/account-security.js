import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./layout";
import { useAuth } from "../../context/AuthContext";
import { changePassword } from "@/services/apiService";
import {
  FiSave,
  FiAlertTriangle,
  FiEye,
  FiEyeOff,
  FiLock,
} from "react-icons/fi";

export default function AccountSecurity() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (loading) return;
    const token =
      typeof window !== "undefined" && localStorage.getItem("token");
    if (!token || !user) {
      router.replace("/auth/student?tab=login");
    }
  }, [loading, user, router]);

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
  });

  const currentUser = user?.user || user || {};

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setNotification({
        type: "error",
        message: "All password fields are required.",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setNotification({
        type: "error",
        message: "New password must be at least 6 characters.",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setSaving(true);

    try {
      await changePassword({
        oldPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setNotification({
        type: "success",
        message: "Password changed successfully!",
      });
      setPasswordData({
        currentPassword: "",
        newPassword: "",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Password update error:", error);
      const errMsg =
        error.response?.data?.message || "Failed to update password.";
      setNotification({ type: "error", message: errMsg });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6 pb-10">
        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-lg flex items-center gap-3 animate-bounce-in border-2 ${
              notification.type === "success"
                ? "bg-linear-to-r from-green-900/90 to-emerald-900/90 border-green-500/50 text-green-100"
                : "bg-linear-to-r from-red-900/90 to-rose-900/90 border-red-500/50 text-red-100"
            }`}
          >
            {notification.type === "success" ? (
              <FiSave className="text-2xl" />
            ) : (
              <FiAlertTriangle className="text-2xl" />
            )}
            <p className="font-semibold text-base">{notification.message}</p>
          </div>
        )}

        {/* Header */}
        <div className="relative bg-linear-to-br from-[#1E1E2E] via-[#2B2B40] to-[#1E1E2E] p-8 rounded-2xl border border-purple-500/20 shadow-xl overflow-hidden">
          {/* Decorative blur circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl"></div>

          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
              <FiLock className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Account Security
              </h1>
              <p className="text-gray-300 text-sm mt-1">
                🔒 Manage your email and password settings
              </p>
            </div>
          </div>
        </div>

        {/* Email Section (Blocked) */}
        <div className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-8 rounded-2xl border border-purple-500/20 shadow-xl space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-8 bg-linear-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <h3 className="text-xl font-bold text-white">📧 Email Address</h3>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2 font-medium">
              Your registered email
            </label>
            <div className="relative">
              <input
                type="email"
                value={currentUser?.email || ""}
                disabled
                className="w-full bg-[#0F0F16] border border-gray-700 rounded-xl px-4 py-3.5 text-gray-400 cursor-not-allowed opacity-70"
              />
              <div className="absolute inset-0 cursor-not-allowed rounded-xl"></div>
            </div>
            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-start gap-2">
              <FiAlertTriangle className="text-yellow-400 mt-0.5 shrink-0" />
              <p className="text-xs text-yellow-200">
                Your email address is locked and cannot be changed at this time.
                Contact support if you need assistance.
              </p>
            </div>
          </div>
        </div>

        {/* Password Section */}
        <form
          onSubmit={handlePasswordUpdate}
          className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-8 rounded-2xl border border-purple-500/20 shadow-xl space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-1 h-10 bg-linear-to-b from-purple-500 to-pink-500 rounded-full"></div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-linear-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <FiLock className="text-purple-400" size={24} />
              </div>
              <h3 className="text-xl font-bold text-white">Change Password</h3>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm text-gray-300 mb-2 font-medium">
                🔑 Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full bg-[#0F0F16] border border-gray-700 rounded-xl px-4 py-3.5 pr-12 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all placeholder-gray-500"
                  placeholder="Enter your current password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword({
                      ...showPassword,
                      current: !showPassword.current,
                    })
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  {showPassword.current ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-2 font-medium">
                🆕 New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full bg-[#0F0F16] border border-gray-700 rounded-xl px-4 py-3.5 pr-12 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all placeholder-gray-500"
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword({ ...showPassword, new: !showPassword.new })
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                >
                  {showPassword.new ? (
                    <FiEyeOff size={20} />
                  ) : (
                    <FiEye size={20} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={saving}
              className="group bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
            >
              <FiLock className="text-xl" />
              {saving ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Updating...
                </>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
