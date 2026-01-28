import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Layout from "./layout";
import { useAuth } from "../../context/AuthContext";
import { uploadAvatar } from "@/services/apiService";
import { FiCamera, FiSave, FiAlertTriangle } from "react-icons/fi";
import Image from "next/image";

export default function Photo() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Redirect unauthenticated users
  useEffect(() => {
    if (loading) return;
    const token =
      typeof window !== "undefined" && localStorage.getItem("token");
    if (!token || !user) {
      router.replace("/auth/student?tab=login");
    }
  }, [loading, user, router]);

  const currentUser = user?.user || user || {};
  const currentAvatar =
    currentUser?.avatar || previewUrl || "/images/default-user.svg";

  async function handleAvatarChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);

    setSaving(true);
    const fd = new FormData();
    fd.append("avatar", file);

    try {
      const res = await uploadAvatar(fd);
      if (res.data.success) {
        const updatedUser = res.data.data?.user || res.data.user || null;
        if (updatedUser) {
          login(updatedUser, localStorage.getItem("token"));
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }

        setNotification({
          type: "success",
          message: "Image uploaded successfully!",
        });
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
      setPreviewUrl(null);
    } finally {
      setSaving(false);
      if (document.getElementById("avatarInput"))
        document.getElementById("avatarInput").value = "";
    }
  }

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

          <div className="relative z-10 flex items-center gap-6">
            {/* Current Avatar Display */}
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-purple-500/30 shadow-lg">
              <Image
                src={currentAvatar}
                alt="Profile"
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Profile Picture
              </h1>
              <p className="text-gray-300 text-sm mt-2">
                Add a professional photo that represents you best
              </p>
            </div>
          </div>
        </div>

        {/* Photo Upload Section */}
        <div className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-8 rounded-2xl border border-purple-500/20 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Current Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-48 h-48 rounded-full overflow-hidden bg-linear-to-br from-purple-900/50 to-pink-900/50 border-4 border-purple-500/30 shadow-2xl">
                <Image
                  src={currentAvatar}
                  alt="Profile"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
                {saving && (
                  <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-sm">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-400"></div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-300 text-center font-medium">
                🖼️ Preview
              </p>
            </div>

            {/* Upload Instructions */}
            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-8 bg-linear-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  <h3 className="text-xl font-bold text-white">
                    Image Requirements
                  </h3>
                </div>
                <p className="text-sm text-gray-300 pl-3">
                  📏 Minimum 200x200 pixels, Maximum 6000x6000 pixels
                </p>
              </div>

              <div className="space-y-4">
                <input
                  id="avatarInput"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={saving}
                />
                <button
                  onClick={() => document.getElementById("avatarInput").click()}
                  disabled={saving}
                  className="group bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <FiCamera size={22} />
                  {saving ? (
                    <>
                      <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                      Uploading...
                    </>
                  ) : (
                    "Upload New Image"
                  )}
                </button>
              </div>

              <div className="mt-6 p-6 bg-[#0F0F16] rounded-xl border border-purple-500/20 shadow-lg">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl">💡</span>
                  <h4 className="text-sm font-bold text-purple-300">
                    Pro Tips:
                  </h4>
                </div>
                <ul className="text-sm text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Use a high-quality image with good lighting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Make sure your face is clearly visible</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Recommended size: 800x800 pixels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Supported formats: JPG, PNG, WEBP</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
