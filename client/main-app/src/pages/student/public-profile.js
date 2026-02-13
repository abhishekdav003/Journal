import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./layout";
import { useAuth } from "../../context/AuthContext";
import { updateProfile } from "@/services/apiService";
import { FiSave, FiAlertTriangle } from "react-icons/fi";
import Image from "next/image";

export default function PublicProfile() {
  const { user, login, loading } = useAuth();
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

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    headline: "",
    bio: "",
    website: "",
    twitter: "",
    facebook: "",
    linkedin: "",
    youtube: "",
  });

  // Initialize from user
  useEffect(() => {
    const saved = user?.user || user || {};
    const nameParts = (saved.name || "").split(" ");
    setProfileData({
      firstName: nameParts[0] || "",
      lastName: nameParts.slice(1).join(" ") || "",
      headline: saved.headline || "",
      bio: saved.bio || "",
      website: saved.website || "",
      twitter: saved.twitter || "",
      facebook: saved.facebook || "",
      linkedin: saved.linkedin || "",
      youtube: saved.youtube || "",
    });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const fullName =
        `${profileData.firstName} ${profileData.lastName}`.trim();
      const res = await updateProfile({
        name: fullName,
        headline: profileData.headline,
        bio: profileData.bio,
        website: profileData.website,
        twitter: profileData.twitter,
        facebook: profileData.facebook,
        linkedin: profileData.linkedin,
        youtube: profileData.youtube,
      });

      if (res.data.success) {
        const updatedUser = res.data.data?.user || res.data.user;
        if (updatedUser) {
          login(updatedUser, localStorage.getItem("token"));
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        setNotification({
          type: "success",
          message: "Profile updated successfully!",
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

  const currentUser = user?.user || user || {};
  const displayName = currentUser?.name || "User";

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 pb-10">
        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-top duration-300 border backdrop-blur-sm ${
              notification.type === "success"
                ? "bg-linear-to-r from-green-900/90 to-emerald-900/90 border-green-500/50 text-green-100 shadow-green-500/20"
                : "bg-linear-to-r from-red-900/90 to-rose-900/90 border-red-500/50 text-red-100 shadow-red-500/20"
            }`}
          >
            {notification.type === "success" ? (
              <FiSave className="text-2xl" />
            ) : (
              <FiAlertTriangle className="text-2xl" />
            )}
            <p className="font-semibold">{notification.message}</p>
          </div>
        )}

        {/* Header with avatar */}
        <div className="bg-linear-to-br from-[#1E1E2E] via-[#2B2B40] to-[#1E1E2E] p-8 rounded-2xl border border-purple-500/20 shadow-xl relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-pink-600/10 rounded-full blur-3xl"></div>
          <div className="relative z-10 flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-purple-600 to-pink-600 flex items-center justify-center overflow-hidden shadow-xl border-4 border-[#2B2B40]">
              {currentUser?.avatar ? (
                <Image
                  src={currentUser.avatar}
                  alt={displayName}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-white">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white">
                {displayName}
              </h1>
              <p className="text-gray-300 text-sm mt-1 font-medium">
                {currentUser?.email}
              </p>
              <p className="text-purple-400 text-sm mt-2">
                Complete your public profile to stand out
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-8 rounded-2xl border border-gray-800/50 shadow-xl space-y-8"
        >
          {/* Basics Section */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-700/50">
              <div className="w-1 h-6 bg-linear-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h3 className="text-xl font-bold text-white">
                Basic Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  First Name <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      firstName: e.target.value,
                    })
                  }
                  className="w-full bg-[#0F0F16] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all duration-200"
                  placeholder="Enter first name"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, lastName: e.target.value })
                  }
                  className="w-full bg-[#0F0F16] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all duration-200"
                  placeholder="Enter last name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                Headline
                <span className="float-right text-xs text-gray-500">
                  {profileData.headline.length}/60
                </span>
              </label>
              <input
                type="text"
                maxLength={60}
                value={profileData.headline}
                onChange={(e) =>
                  setProfileData({ ...profileData, headline: e.target.value })
                }
                className="w-full bg-[#0F0F16] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all duration-200"
                placeholder='e.g., "Full Stack Developer" or "UI/UX Designer"'
              />
            </div>
          </div>

          {/* Biography */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-700/50">
              <div className="w-1 h-6 bg-linear-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h3 className="text-xl font-bold text-white">About You</h3>
            </div>
            <textarea
              value={profileData.bio}
              onChange={(e) =>
                setProfileData({ ...profileData, bio: e.target.value })
              }
              rows={6}
              className="w-full bg-[#0F0F16] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none resize-none transition-all duration-200"
              placeholder="Tell us about yourself, your experience, and what you're passionate about..."
            />
            <p className="text-xs text-gray-500">
              💡 Links and promotional content are not permitted in this
              section.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-700/50">
              <div className="w-1 h-6 bg-linear-to-b from-purple-500 to-pink-500 rounded-full"></div>
              <h3 className="text-xl font-bold text-white">Social Links</h3>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-300">
                🌐 Website
              </label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) =>
                  setProfileData({ ...profileData, website: e.target.value })
                }
                className="w-full bg-[#0F0F16] border border-gray-700 rounded-xl px-4 py-3.5 text-white placeholder-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none transition-all duration-200"
                placeholder="https://yourwebsite.com"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <span className="text-lg">🐦</span> Twitter
                </label>
                <div className="group flex items-center bg-[#0F0F16] border border-gray-700 rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500 hover:border-gray-600">
                  <span className="px-4 text-gray-500 text-sm border-r border-gray-700">
                    twitter.com/
                  </span>
                  <input
                    type="text"
                    value={profileData.twitter}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        twitter: e.target.value,
                      })
                    }
                    className="flex-1 bg-transparent px-4 py-3.5 text-white focus:outline-none placeholder-gray-500"
                    placeholder="yourusername"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <span className="text-lg">📘</span> Facebook
                </label>
                <div className="group flex items-center bg-[#0F0F16] border border-gray-700 rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500 hover:border-gray-600">
                  <span className="px-4 text-gray-500 text-sm border-r border-gray-700">
                    facebook.com/
                  </span>
                  <input
                    type="text"
                    value={profileData.facebook}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        facebook: e.target.value,
                      })
                    }
                    className="flex-1 bg-transparent px-4 py-3.5 text-white focus:outline-none placeholder-gray-500"
                    placeholder="yourusername"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <span className="text-lg">💼</span> LinkedIn
                </label>
                <div className="group flex items-center bg-[#0F0F16] border border-gray-700 rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500 hover:border-gray-600">
                  <span className="px-4 text-gray-500 text-sm border-r border-gray-700">
                    linkedin.com/in/
                  </span>
                  <input
                    type="text"
                    value={profileData.linkedin}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        linkedin: e.target.value,
                      })
                    }
                    className="flex-1 bg-transparent px-4 py-3.5 text-white focus:outline-none placeholder-gray-500"
                    placeholder="yourusername"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                  <span className="text-lg">📺</span> YouTube
                </label>
                <div className="group flex items-center bg-[#0F0F16] border border-gray-700 rounded-xl overflow-hidden transition-all focus-within:ring-2 focus-within:ring-purple-500/50 focus-within:border-purple-500 hover:border-gray-600">
                  <span className="px-4 text-gray-500 text-sm border-r border-gray-700">
                    youtube.com/
                  </span>
                  <input
                    type="text"
                    value={profileData.youtube}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        youtube: e.target.value,
                      })
                    }
                    className="flex-1 bg-transparent px-4 py-3.5 text-white focus:outline-none placeholder-gray-500"
                    placeholder="@yourchannel"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={saving}
              className="group relative bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-3"
            >
              <FiSave className="text-xl" />
              {saving ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Saving...
                </>
              ) : (
                "Save Profile"
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
