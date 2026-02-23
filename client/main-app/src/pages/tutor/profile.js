import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TutorLayout from "../../components/tutor/TutorLayout";
import { useAuth } from "../../context/AuthContext";
// IMPORT API SERVICES
import {
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAccount,
} from "../../services/apiService";
import {
  FiCamera,
  FiSave,
  FiLock,
  FiUser,
  FiMail,
  FiPhone,
  FiFileText,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

export default function TutorProfile() {
  const { user, refreshUser, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bio: "",
  });

  const [passData, setPassData] = useState({
    oldPassword: "",
    newPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Sync user data to form
  useEffect(() => {
    // Authentication check and redirect
    if (!authLoading) {
      if (!user) {
        router.push("/auth/tutor?tab=login");
      } else if (user.role !== "tutor") {
        router.push(`/${user.role}/dashboard`);
      }
    }
  }, [user, authLoading, router]);

  // Sync user data to form
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
  }, [user]);

  // Lock scroll when modal is open
  useEffect(() => {
    if (showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showDeleteModal]);


  // 1. Update Basic Info
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Using centralized API service
      await updateProfile(formData);
      toast.success("Profile details updated successfully!");

      // Refresh global auth state to reflect changes immediately
      await refreshUser();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // 2. Upload Avatar
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Optional: Check file size/type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const data = new FormData();
    data.append("avatar", file); // Key matches multer config on server

    try {
      setUploadingAvatar(true);
      await uploadAvatar(data); // Using API service
      toast.success("Profile picture updated!");

      // Refresh context to show new image in Sidebar/Header
      await refreshUser();
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload image");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // 3. Change Password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passData.oldPassword || !passData.newPassword) {
      toast.error("Please fill in both password fields");
      return;
    }

    try {
      setLoading(true);
      await changePassword(passData); // Using API service
      toast.success("Password changed successfully");
      setPassData({ oldPassword: "", newPassword: "" });
      
      // Refresh user to update token if needed
      await refreshUser();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  // 4. Delete Account
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      toast.error("Please enter your password to confirm deletion");
      return;
    }

    try {
      setDeletingAccount(true);
      await deleteAccount({ password: deletePassword });
      toast.success("Account deleted successfully");
      setShowDeleteModal(false);
      
      // Clear auth and redirect
      logout();
      router.push("/");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete account");
      setDeletePassword("");
    } finally {
      setDeletingAccount(false);
    }
  };

  // Show loading while auth state is being determined
  if (authLoading) {
    return (
      <TutorLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </TutorLayout>
    );
  }

  // Redirect handled by useEffect, return null if not authenticated
  if (!user || user.role !== "tutor") return null;

  return (
    <TutorLayout>
      <Toaster position="top-right" />

      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">
            Account Settings
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your profile details and security preferences.
          </p>
        </div>

        {/* --- Profile Header & Avatar --- */}
        <div className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-8 rounded-4xl shadow-sm border border-gray-800/50 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-purple-600 shadow-lg ring-4 ring-purple-500/20">
              <Image
                src={user?.avatar || "/images/default-user.svg"}
                alt="Profile"
                width={128}
                height={128}
                className={`w-full h-full object-cover transition duration-300 ${uploadingAvatar ? "opacity-50 blur-sm" : ""}`}
              />
              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                </div>
              )}
            </div>

            <label className="absolute bottom-1 right-1 bg-purple-600 p-2.5 rounded-full cursor-pointer hover:bg-purple-700 transition shadow-lg transform group-hover:scale-110">
              <FiCamera className="w-5 h-5 text-white" />
              <input
                type="file"
                className="hidden"
                onChange={handleAvatarChange}
                accept="image/*"
                disabled={uploadingAvatar}
              />
            </label>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">{user?.name}</h2>
            <span className="inline-block mt-1 px-3 py-1 bg-purple-600/20 text-purple-400 text-xs font-bold rounded-full uppercase tracking-wider border border-purple-500/50">
              {user?.role || "Tutor"}
            </span>
            <p className="text-gray-400 mt-3 text-sm max-w-md">
              Update your photo and personal details here. This information will
              be displayed on your public tutor profile.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* --- Edit Details Form --- */}
          <div className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-8 rounded-4xl shadow-sm border border-gray-800/50">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-800/50 pb-4">
              <FiUser className="text-purple-400" size={20} />
              <h3 className="text-lg font-bold text-white">
                Personal Information
              </h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-white mb-2">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-700/50 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-white bg-[#1E1E2E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-4 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-900 bg-white"
                    placeholder="+91 ..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Bio / Headline
                </label>
                <div className="relative">
                  <FiFileText className="absolute left-4 top-4 text-gray-400" />
                  <textarea
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-900 bg-white resize-none"
                    placeholder="Tell students about yourself..."
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 text-white py-3.5 rounded-xl font-bold hover:bg-purple-700 disabled:opacity-70 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-200"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                ) : (
                  <>
                    <FiSave size={18} /> Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* --- Security Form --- */}
          <div className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100 h-fit">
            <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
              <FiLock className="text-purple-600" size={20} />
              <h3 className="text-lg font-bold text-gray-900">
                Security & Password
              </h3>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={passData.oldPassword}
                    onChange={(e) =>
                      setPassData({ ...passData, oldPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-900 bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showOldPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passData.newPassword}
                    onChange={(e) =>
                      setPassData({ ...passData, newPassword: e.target.value })
                    }
                    className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-900 bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showNewPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                ) : (
                  <>
                    <FiLock size={18} /> Update Password
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 p-4 bg-orange-50 rounded-xl border border-orange-100">
              <h4 className="text-orange-800 font-bold text-sm mb-1">
                Danger Zone
              </h4>
              <p className="text-orange-600 text-xs mb-3">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="text-red-600 text-xs font-bold hover:underline transition"
              >
                Delete Account
              </button>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Account?</h3>
                  <p className="text-gray-600 text-sm mb-4">
                    This action is permanent. All your data will be deleted. Please enter your password to confirm.
                  </p>
                  <form onSubmit={handleDeleteAccount} className="space-y-4">
                    <input
                      type="password"
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none text-sm"
                      disabled={deletingAccount}
                    />
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowDeleteModal(false);
                          setDeletePassword("");
                        }}
                        disabled={deletingAccount}
                        className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={deletingAccount}
                        className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {deletingAccount ? (
                          <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></span>
                        ) : (
                          "Delete"
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TutorLayout>
  );
}
