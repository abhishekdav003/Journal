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
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce-in border ${
              notification.type === "success"
                ? "bg-[#1E1E2E] border-green-500 text-green-400"
                : "bg-[#1E1E2E] border-red-500 text-red-400"
            }`}
          >
            {notification.type === "success" ? (
              <FiSave className="text-xl" />
            ) : (
              <FiAlertTriangle className="text-xl" />
            )}
            <p className="font-semibold">{notification.message}</p>
          </div>
        )}

        {/* Header */}
        <div className="bg-[#1E1E2E] p-6 rounded-xl border border-gray-800">
          <h1 className="text-2xl font-bold text-white">Account Security</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your email and password settings
          </p>
        </div>

        {/* Email Section (Blocked) */}
        <div className="bg-[#1E1E2E] p-8 rounded-xl border border-gray-800 space-y-4">
          <h3 className="text-lg font-semibold text-white mb-4">Email:</h3>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Your email address
            </label>
            <div className="relative">
              <input
                type="email"
                value={currentUser?.email || ""}
                disabled
                className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed opacity-50"
              />
              <div className="absolute inset-0 cursor-not-allowed rounded-lg"></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your email cannot be changed at this time.
            </p>
          </div>
        </div>

        {/* Password Section */}
        <form
          onSubmit={handlePasswordUpdate}
          className="bg-[#1E1E2E] p-8 rounded-xl border border-gray-800 space-y-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <FiLock className="text-purple-500" size={24} />
            <h3 className="text-lg font-semibold text-white">
              Change Password
            </h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Current Password
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
                  className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-lg px-4 py-3 pr-12 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword({
                      ...showPassword,
                      current: !showPassword.current,
                    })
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
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
              <label className="block text-sm text-gray-400 mb-2">
                New Password
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
                  className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-lg px-4 py-3 pr-12 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword({ ...showPassword, new: !showPassword.new })
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
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

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#6D28D9] hover:bg-[#5b21b6] text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
