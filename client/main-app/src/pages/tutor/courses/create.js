import { useState } from "react";
import { useRouter } from "next/router";
import { createCourse, uploadThumbnail } from "../../../services/apiService"; // Imported uploadThumbnail
import TutorLayout from "../../../components/tutor/TutorLayout";
import { FiSave, FiX, FiImage, FiUploadCloud } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

export default function CreateCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "programming",
    level: "beginner",
    price: 0,
    thumbnail: "", // Will store the URL from server
  });

  // Handle Image File Selection
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Basic Validation
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    const data = new FormData();
    data.append("thumbnail", file); // 'thumbnail' matches multer config on server

    try {
      setUploadingImg(true);
      const res = await uploadThumbnail(data);
      // Server returns { data: { thumbnail: { url } } }
      const url =
        res.data.data?.thumbnail?.url || res.data.data?.url || res.data.url;

      setFormData({ ...formData, thumbnail: url });
      toast.success("Thumbnail uploaded successfully!");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Failed to upload image");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createCourse(formData);
      toast.success("Course created successfully!");
      setTimeout(() => {
        router.push("/tutor/courses");
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create course");
      setLoading(false);
    }
  };

  return (
    <TutorLayout>
      <Toaster position="top-right" />

      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Create New Course
            </h1>
            <p className="text-gray-500 mt-1">
              Fill in the details to start your new curriculum.
            </p>
          </div>
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-full transition"
          >
            <FiX size={24} className="text-gray-500" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Course Title
            </label>
            <input
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-900 placeholder-gray-400 bg-white"
              placeholder="e.g. Master Next.js 14 from Scratch"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Description
            </label>
            <textarea
              className="w-full p-4 border border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-purple-500 outline-none transition font-medium resize-none text-gray-900 placeholder-gray-400 bg-white"
              placeholder="What will students learn in this course?"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Category
              </label>
              <select
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition bg-white text-gray-900 cursor-pointer"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
              >
                <option value="programming">Programming</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="music">Music</option>
              </select>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Level
              </label>
              <select
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition bg-white text-gray-900 cursor-pointer"
                value={formData.level}
                onChange={(e) =>
                  setFormData({ ...formData, level: e.target.value })
                }
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Price (₹)
              </label>
              <input
                type="number"
                min="0"
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition font-medium text-gray-900 placeholder-gray-400 bg-white"
                placeholder="0 for Free"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
              />
            </div>

            {/* Thumbnail Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Course Thumbnail
              </label>
              <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                />

                {formData.thumbnail ? (
                  <div className="relative h-14.5 flex items-center px-4">
                    <Image
                      src={formData.thumbnail}
                      alt="Preview"
                      width={40}
                      height={40}
                      className="rounded object-cover mr-3 border"
                    />
                    <span className="text-sm text-green-600 font-medium truncate flex-1">
                      Image Uploaded
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setFormData({ ...formData, thumbnail: "" });
                      }}
                      className="text-gray-400 hover:text-red-500 z-20"
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <div className="h-14.5 flex items-center px-4 text-gray-500">
                    {uploadingImg ? (
                      <span className="flex items-center gap-2 text-sm">
                        <span className="animate-spin h-4 w-4 border-2 border-purple-500 border-t-transparent rounded-full"></span>
                        Uploading...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-sm">
                        <FiUploadCloud size={20} />
                        Click to upload image
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || uploadingImg}
              className="w-full bg-purple-600 text-white p-4 rounded-xl font-bold hover:bg-purple-700 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
              ) : (
                <>
                  <FiSave size={20} /> Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </TutorLayout>
  );
}
