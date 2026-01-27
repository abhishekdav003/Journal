import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./layout";
import { useAuth } from "../../context/AuthContext";
import {
  changePassword,
  updateProfile,
  uploadAvatar,
} from "@/services/apiService";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiCamera,
  FiSave,
  FiAlertTriangle,
  FiX,
  FiEye,
  FiEyeOff,
  FiEdit2,
} from "react-icons/fi";
import Image from "next/image";

export default function Settings() {
  const { user, logout, login, loading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users to login
  useEffect(() => {
    if (loading) return; // wait until auth finished initializing
    const token =
      typeof window !== "undefined" && localStorage.getItem("token");
    if (!token || !user) {
      router.replace("/auth/student?tab=login");
    }
  }, [loading, user, router]);

  // States for Data & UI
  const [saving, setSaving] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Separate state for what is shown on the profile (avatar/header)
  const [displayProfile, setDisplayProfile] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });

  // Password Visibility State (New)
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });

  // Password Form State
  const [passData, setPassData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 1. Initialize profile states from auth context
  useEffect(() => {
    try {
      setSaving(true);
      const saved = user?.user || user || {};

      const base = {
        name: saved.name || "User",
        email: saved.email || "user@example.com",
        phone: saved.phone || "",
        bio: saved.bio || "",
        avatar: saved.avatar || "/images/default-user.svg",
      };

      setDisplayProfile(base); // what avatar/header shows
      setProfileData(base); // editable form
    } catch (error) {
      console.error("Failed to init profile", error);
    } finally {
      setSaving(false);
    }
  }, [user]);

  // 2. Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("token");

    try {
      const res = await updateProfile(profileData);
      if (res.data.success) {
        // Try to read updated user from response
        const updatedUser = res.data.data?.user || res.data.user || null;

        if (updatedUser) {
          try {
            login(updatedUser, localStorage.getItem("token"));
          } catch (err) {
            // ignore
          }

          setDisplayProfile({
            name: updatedUser.name || profileData.name,
            email: updatedUser.email || profileData.email,
            phone: updatedUser.phone || profileData.phone,
            bio: updatedUser.bio || profileData.bio,
          });

          // ensure localStorage is in sync for refreshes
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setProfileData((p) => ({
            ...p,
            ...{
              name: updatedUser.name,
              email: updatedUser.email,
              phone: updatedUser.phone,
              bio: updatedUser.bio,
            },
          }));
        } else {
          // fallback: update display from form data
          setDisplayProfile((p) => ({ ...p, ...profileData }));
          const prev = user?.user || user || {};
          localStorage.setItem(
            "user",
            JSON.stringify({ ...prev, ...profileData }),
          );
        }

        setNotification({
          type: "success",
          message: "Profile updated successfully!",
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        setNotification({
          type: "error",
          message: "Failed to update profile.",
        });
        setTimeout(() => setNotification(null), 3000);
      }
    } catch (error) {
      console.error("Update failed:", error);
      setNotification({ type: "error", message: "Failed to update profile." });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  // 3. Handle Password Update
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    if (
      !passData.currentPassword ||
      !passData.newPassword ||
      !passData.confirmPassword
    ) {
      setNotification({
        type: "error",
        message: "All password fields are required.",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setNotification({
        type: "error",
        message: "New passwords do not match!",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    setPassLoading(true);

    try {
      await changePassword({
        oldPassword: passData.currentPassword,
        newPassword: passData.newPassword,
      });

      setNotification({
        type: "success",
        message: "Password changed successfully!",
      });
      setPassData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error("Password update error:", error);
      const errMsg =
        error.response?.data?.message || "Failed to update password.";
      setNotification({ type: "error", message: errMsg });
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setPassLoading(false);
    }
  };

  // 4. Handle Close Account
  const handleCloseAccount = async () => {
    console.log("Deleting account...");
    logout();
  };

  // Helper to toggle password visibility
  const togglePass = (field) => {
    setShowPass((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  // Handle avatar upload
  async function handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    setSaving(true);
    const fd = new FormData();
    fd.append("avatar", file);

    try {
      const res = await uploadAvatar(fd);
      if (res.data.success) {
        const updatedUser = res.data.data?.user || res.data.user || null;
        if (updatedUser) {
          try {
            login(updatedUser, localStorage.getItem("token"));
          } catch (err) {}

          setDisplayProfile((p) => ({ ...p, avatar: updatedUser.avatar }));
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        setNotification({ type: "success", message: "Avatar uploaded" });
        setTimeout(() => setNotification(null), 2500);
      }
    } catch (err) {
      console.error("Avatar upload failed", err);
      const serverMsg = err?.response?.data?.message;
      setNotification({
        type: "error",
        message:
          serverMsg || (err?.message ? err.message : "Avatar upload failed"),
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setSaving(false);
      // reset input
      if (document.getElementById("avatarInput"))
        document.getElementById("avatarInput").value = "";
    }
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
        {/* --- NOTIFICATION --- */}
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

        {/* --- HEADER --- */}
        <div>
          <h1 className="text-3xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-sm mt-1">
            Manage your profile details and account security.
          </p>
        </div>

        {/* --- PROFILE BANNER & AVATAR --- */}
        <div className="relative group rounded-3xl bg-[#1E1E2E] border border-gray-800 shadow-xl overflow-visible mt-10">
          {/* Cover Photo */}
          <div className="h-48 bg-linear-to-r from-[#6D28D9] via-[#8B5CF6] to-[#1E1E2E] rounded-t-3xl w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
            <div className="absolute inset-0 bg-black/10"></div>
          </div>

          {/* Avatar Section */}
          <div className="px-8 pb-6 flex flex-col md:flex-row items-start md:items-end -mt-16 gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-[#1E1E2E] p-1.5 shadow-2xl">
                <Image
                  src={
                    displayProfile.avatar
                      ? displayProfile.avatar
                      : "/images/default-user.svg"
                  }
                  alt={displayProfile.name || "User"}
                  width={128}
                  height={128}
                  className="w-full h-full rounded-full object-cover border-2 border-[#1E1E2E]"
                />
              </div>
              <input
                id="avatarInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                onClick={() => document.getElementById("avatarInput").click()}
                className="absolute bottom-1 right-1 bg-purple-600 p-2.5 rounded-full text-white border-4 border-[#1E1E2E] hover:bg-purple-500 transition-colors shadow-lg cursor-pointer"
              >
                <FiCamera size={16} />
              </button>
            </div>
            <div className="mb-2 flex-1">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                {displayProfile.name || "User Name"}
              </h2>
              <p className="text-gray-400 font-medium">
                {displayProfile.email}
              </p>
            </div>
          </div>
        </div>

        {/* --- FORMS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. PERSONAL INFORMATION */}
          <div className="bg-[#1E1E2E] p-8 rounded-3xl border border-gray-800 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <FiUser size={20} />
                </span>
                Personal Information
              </h3>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">
                  Full Name
                </label>
                <div className="relative">
                  <FiEdit2 className="absolute left-4 top-4 text-gray-500" />
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-xl pl-10 pr-4 py-3.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-4 text-gray-500" />
                  <input
                    placeholder="+91 99999 99999"
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) =>
                      setProfileData({ ...profileData, phone: e.target.value })
                    }
                    className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-xl pl-10 pr-4 py-3.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">
                  Bio
                </label>
                <textarea
                  placeholder="Tell us a little about yourself..."
                  rows="4"
                  value={profileData.bio}
                  onChange={(e) =>
                    setProfileData({ ...profileData, bio: e.target.value })
                  }
                  className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none transition-all resize-none"
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-purple-900/30 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {loading ? (
                    "Saving Changes..."
                  ) : (
                    <>
                      <FiSave /> Save Profile
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 2. SECURITY & PASSWORD */}
          <div className="space-y-8">
            {/* Change Password Card */}
            <div className="bg-[#1E1E2E] p-8 rounded-3xl border border-gray-800 shadow-lg">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <span className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                  <FiLock size={20} />
                </span>
                Security
              </h3>

              <form onSubmit={handlePasswordUpdate} className="space-y-5">
                {/* Current Password */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass.current ? "text" : "password"}
                      placeholder="••••••••"
                      value={passData.currentPassword}
                      onChange={(e) =>
                        setPassData({
                          ...passData,
                          currentPassword: e.target.value,
                        })
                      }
                      className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-xl px-4 py-3.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => togglePass("current")}
                      className="absolute right-4 top-4 text-gray-500 hover:text-white"
                    >
                      {showPass.current ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass.new ? "text" : "password"}
                      placeholder="••••••••"
                      value={passData.newPassword}
                      onChange={(e) =>
                        setPassData({
                          ...passData,
                          newPassword: e.target.value,
                        })
                      }
                      className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-xl px-4 py-3.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => togglePass("new")}
                      className="absolute right-4 top-4 text-gray-500 hover:text-white"
                    >
                      {showPass.new ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider ml-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPass.confirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={passData.confirmPassword}
                      onChange={(e) =>
                        setPassData({
                          ...passData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-xl px-4 py-3.5 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => togglePass("confirm")}
                      className="absolute right-4 top-4 text-gray-500 hover:text-white"
                    >
                      {showPass.confirm ? (
                        <FiEyeOff size={18} />
                      ) : (
                        <FiEye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passLoading}
                    className="text-purple-400 font-bold hover:text-white transition-colors disabled:opacity-50 text-sm flex items-center gap-2 ml-auto"
                  >
                    {passLoading ? "Updating..." : "Update Password ->"}
                  </button>
                </div>
              </form>
            </div>

            {/* Danger Zone */}
            <div className="bg-[#1E1E2E] p-8 rounded-3xl border border-red-900/30 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 blur-3xl rounded-full pointer-events-none"></div>
              <h3 className="text-xl font-bold text-red-500 mb-2 flex items-center gap-2">
                <FiAlertTriangle /> Danger Zone
              </h3>
              <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                Permanently delete your account and all associated data. This
                action is irreversible and cannot be undone.
              </p>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white py-3.5 rounded-xl font-bold transition-all duration-300"
              >
                Close Account
              </button>
            </div>
          </div>
        </div>

        {/* --- WARNING MODAL --- */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1E1E2E] border border-red-500/30 w-full max-w-md p-8 rounded-3xl shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-red-500/10 rounded-full text-red-500">
                  <FiAlertTriangle size={28} />
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <FiX size={24} />
                </button>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Delete Account?
              </h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Are you strictly sure you want to delete your account? All of
                your courses, progress, and history will be permanently erased.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-[#2B2B40] hover:bg-[#3E3E55] text-white py-3.5 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCloseAccount}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-red-900/40"
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
