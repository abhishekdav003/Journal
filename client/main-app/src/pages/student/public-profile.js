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
          <h1 className="text-2xl font-bold text-white">Public profile</h1>
          <p className="text-gray-400 text-sm mt-1">
            Add information about yourself
          </p>
        </div>

        {/* Profile Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#1E1E2E] p-8 rounded-xl border border-gray-800 space-y-6"
        >
          {/* Basics Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Basics:</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  First Name
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
                  className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  placeholder="First"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({ ...profileData, lastName: e.target.value })
                  }
                  className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                  placeholder="Last"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Headline
                <span className="float-right text-xs">
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
                className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                placeholder='Add a professional headline like, "Instructor at Udemy" or "Architect."'
              />
            </div>
          </div>

          {/* Biography */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Biography</h3>
            <textarea
              value={profileData.bio}
              onChange={(e) =>
                setProfileData({ ...profileData, bio: e.target.value })
              }
              rows={6}
              className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none resize-none"
              placeholder="Biography"
            />
            <p className="text-xs text-gray-500 mt-2">
              Links and coupon codes are not permitted in this section.
            </p>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white mb-4">Links:</h3>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Website
              </label>
              <input
                type="url"
                value={profileData.website}
                onChange={(e) =>
                  setProfileData({ ...profileData, website: e.target.value })
                }
                className="w-full bg-[#0F0F16] border border-gray-700/50 rounded-lg px-4 py-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                placeholder="Website (http(s)://..)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Twitter
                </label>
                <div className="flex items-center bg-[#0F0F16] border border-gray-700/50 rounded-lg overflow-hidden">
                  <span className="px-3 text-gray-500 text-sm">
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
                    className="flex-1 bg-transparent px-2 py-3 text-white focus:outline-none"
                    placeholder="Username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Facebook
                </label>
                <div className="flex items-center bg-[#0F0F16] border border-gray-700/50 rounded-lg overflow-hidden">
                  <span className="px-3 text-gray-500 text-sm">
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
                    className="flex-1 bg-transparent px-2 py-3 text-white focus:outline-none"
                    placeholder="Username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  LinkedIn
                </label>
                <div className="flex items-center bg-[#0F0F16] border border-gray-700/50 rounded-lg overflow-hidden">
                  <span className="px-3 text-gray-500 text-sm">
                    linkedin.com/
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
                    className="flex-1 bg-transparent px-2 py-3 text-white focus:outline-none"
                    placeholder="Resource ID"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  YouTube
                </label>
                <div className="flex items-center bg-[#0F0F16] border border-gray-700/50 rounded-lg overflow-hidden">
                  <span className="px-3 text-gray-500 text-sm">
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
                    className="flex-1 bg-transparent px-2 py-3 text-white focus:outline-none"
                    placeholder="Username"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#6D28D9] hover:bg-[#5b21b6] text-white px-8 py-3 rounded-lg font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
