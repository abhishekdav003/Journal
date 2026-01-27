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
          <h1 className="text-2xl font-bold text-white">Profile picture</h1>
          <p className="text-gray-400 text-sm mt-1">
            Add a nice photo of yourself for your profile.
          </p>
        </div>

        {/* Photo Upload Section */}
        <div className="bg-[#1E1E2E] p-8 rounded-xl border border-gray-800 space-y-6">
          <div className="flex flex-col md:flex-row items-start gap-8">
            {/* Current Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-48 h-48 rounded-full overflow-hidden bg-[#2B2B40] border-4 border-gray-800">
                <Image
                  src={currentAvatar}
                  alt="Profile"
                  width={192}
                  height={192}
                  className="w-full h-full object-cover"
                />
                {saving && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-400 text-center">Preview</p>
            </div>

            {/* Upload Instructions */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  Image preview
                </h3>
                <p className="text-sm text-gray-400">
                  Minimum 200x200 pixels, Maximum 6000x6000 pixels
                </p>
              </div>

              <div className="space-y-3">
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
                  className="bg-[#6D28D9] hover:bg-[#5b21b6] text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiCamera size={20} />
                  {saving ? "Uploading..." : "Upload Image"}
                </button>
              </div>

              <div className="mt-6 p-4 bg-[#0F0F16] rounded-lg border border-gray-700">
                <h4 className="text-sm font-semibold text-white mb-2">Tips:</h4>
                <ul className="text-xs text-gray-400 space-y-1 list-disc list-inside">
                  <li>Use a high-quality image with good lighting</li>
                  <li>Make sure your face is clearly visible</li>
                  <li>Recommended size: 800x800 pixels</li>
                  <li>Supported formats: JPG, PNG, WEBP</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
