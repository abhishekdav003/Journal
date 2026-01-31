import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
  getCourse,
  addModule,
  addLecture,
  updateLecture,
  togglePublishCourse,
  updateCourse,
  uploadVideo,
  uploadThumbnail,
  deleteLecture,
  updateModule,
  deleteModule,
} from "../../../services/apiService";
import TutorLayout from "../../../components/tutor/TutorLayout";
import {
  FiPlus,
  FiVideo,
  FiEdit2,
  FiTrash2,
  FiChevronDown,
  FiChevronUp,
  FiLayout,
  FiMonitor,
  FiCheckCircle,
  FiX,
  FiUploadCloud,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

export default function CourseEditor() {
  const router = useRouter();
  const { id } = router.query;
  const thumbnailInputRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});

  // Modal & Form States
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isEditModuleModalOpen, setIsEditModuleModalOpen] = useState(false);
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [moduleTitle, setModuleTitle] = useState("");
  const [moduleDescription, setModuleDescription] = useState("");
  const [editModuleId, setEditModuleId] = useState(null);
  const [editModuleTitle, setEditModuleTitle] = useState("");
  const [editModuleDescription, setEditModuleDescription] = useState("");

  const [lectureData, setLectureData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    isPreview: false,
  });
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
    moduleId: null,
    lectureId: null,
    message: "",
  });

  useEffect(() => {
    if (id) fetchCourseData(id);
  }, [id]);

  const fetchCourseData = async (courseId) => {
    try {
      setLoading(true);
      const res = await getCourse(courseId);
      setCourse(res.data.data.course || res.data.data);
      const modules = res.data.data.course?.modules || res.data.data.modules;
      if (modules?.length > 0) setExpandedModules({ 0: true });
    } catch (err) {
      console.error("Failed to fetch course", err);
      toast.error("Could not load course details");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS ---

  // 1. Thumbnail Upload Handler (Main Course Image)
  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("thumbnail", file);

    try {
      setIsUploadingThumb(true);
      const res = await uploadThumbnail(formData);
      const url =
        res.data.data?.thumbnail?.url || res.data.data?.url || res.data.url;

      // Update local state immediately
      setCourse((prev) => ({ ...prev, thumbnail: url }));

      // Save to backend
      await updateCourse(id, { thumbnail: url });
      toast.success("Thumbnail updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload thumbnail");
    } finally {
      setIsUploadingThumb(false);
    }
  };

  // 2. Video Upload Handler (Lecture Modal)
  const handleVideoFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (optional, purely UX)
    if (file.size > 100 * 1024 * 1024) {
      // 100MB warning
      toast("Uploading large file, please wait...", { icon: "⏳" });
    }

    const formData = new FormData();
    formData.append("video", file);

    try {
      setIsUploadingVideo(true);
      setUploadProgress(0);

      const res = await uploadVideo(formData, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total,
        );
        setUploadProgress(percentCompleted);
      });

      const url =
        res.data.data?.video?.url || res.data.data?.url || res.data.url;

      setLectureData((prev) => ({ ...prev, videoUrl: url }));
      toast.success("Video uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload video");
    } finally {
      setIsUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  // 3. Publish Toggle
  const handleTogglePublish = async () => {
    try {
      await togglePublishCourse(id);
      setCourse((prev) => ({ ...prev, isPublished: !prev.isPublished }));
      toast.success(
        course.isPublished ? "Course Unpublished" : "Course Published Live!",
      );
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const toggleModule = (index) =>
    setExpandedModules((prev) => ({ ...prev, [index]: !prev[index] }));

  // 4. Add Module
  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    try {
      const res = await addModule(id, {
        title: moduleTitle,
        description: moduleDescription,
      });
      toast.success("Module added");
      setCourse((prev) => ({ ...prev, modules: res.data.data }));
      setModuleTitle("");
      setModuleDescription("");
      setIsModuleModalOpen(false);
    } catch (err) {
      toast.error("Failed to create module");
    }
  };

  const handleEditModule = (moduleId, currentTitle, currentDescription) => {
    setEditModuleId(moduleId);
    setEditModuleTitle(currentTitle || "");
    setEditModuleDescription(currentDescription || "");
    setIsEditModuleModalOpen(true);
  };

  const handleUpdateModule = async (e) => {
    e.preventDefault();
    if (!editModuleId || !editModuleTitle.trim()) return;
    try {
      await updateModule(id, editModuleId, {
        title: editModuleTitle,
        description: editModuleDescription,
      });
      toast.success("Section updated");
      fetchCourseData(id);
      setIsEditModuleModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update section");
    }
  };

  const openConfirm = ({ type, moduleId, lectureId, message }) => {
    setConfirmDialog({
      open: true,
      type,
      moduleId: moduleId || null,
      lectureId: lectureId || null,
      message,
    });
  };

  const closeConfirm = () => {
    setConfirmDialog({
      open: false,
      type: null,
      moduleId: null,
      lectureId: null,
      message: "",
    });
  };

  const handleConfirmAction = async () => {
    if (confirmDialog.type === "lecture" && confirmDialog.lectureId) {
      await handleDeleteLecture(confirmDialog.lectureId);
    }
    if (confirmDialog.type === "module" && confirmDialog.moduleId) {
      await handleDeleteModule(confirmDialog.moduleId);
    }
    closeConfirm();
  };

  // 5. Add Lecture
  const openLectureModal = (moduleId) => {
    setActiveModuleId(moduleId);
    setLectureData({
      title: "",
      description: "",
      videoUrl: "",
      isPreview: false,
    });
    setIsLectureModalOpen(true);
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!activeModuleId || activeModuleId === "__legacy__") {
      toast.error("Please select a section to add this video");
      return;
    }
    if (!lectureData.title.trim() || !lectureData.videoUrl.trim()) {
      toast.error("Please add both title and video");
      return;
    }
    try {
      await addLecture(id, {
        title: lectureData.title,
        description: lectureData.description,
        videoUrl: lectureData.videoUrl,
        isPreview: lectureData.isPreview,
        moduleId: activeModuleId,
      });
      toast.success("Lecture added");
      setLectureData({
        title: "",
        description: "",
        videoUrl: "",
        isPreview: false,
      });
      fetchCourseData(id);
      setIsLectureModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add lecture");
    }
  };

  // 6. Delete Lecture
  const handleDeleteLecture = async (lectureId) => {
    try {
      await deleteLecture(id, lectureId);
      toast.success("Lecture deleted");
      fetchCourseData(id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete lecture");
    }
  };

  const handleDeleteModule = async (moduleId) => {
    try {
      await deleteModule(id, moduleId);
      toast.success("Section deleted");
      fetchCourseData(id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete section");
    }
  };

  const handleTogglePreview = async (lectureId, nextValue) => {
    try {
      await updateLecture(id, lectureId, { isPreview: nextValue });
      toast.success(nextValue ? "Preview enabled" : "Preview disabled");
      fetchCourseData(id);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update preview");
    }
  };

  if (loading)
    return (
      <TutorLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </TutorLayout>
    );

  if (!course) return null;

  const modulesList =
    course.modules && course.modules.length > 0
      ? course.modules
      : course.lectures && course.lectures.length > 0
        ? [
            {
              _id: "__legacy__",
              title: "Unassigned (Old Videos)",
              description:
                "These videos were uploaded before sections were enabled.",
              lectures: course.lectures,
            },
          ]
        : [];

  return (
    <TutorLayout>
      <Toaster position="top-right" />

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {course.title}
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${course.isPublished ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
            >
              {course.isPublished ? "Live" : "Draft"}
            </span>
          </div>
          <p className="text-gray-500 font-medium">
            Manage your curriculum, content, and settings.
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button
            onClick={() => router.push(`/preview/${id}`)}
            className="flex-1 md:flex-none px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
          >
            View Preview
          </button>
          <button
            onClick={handleTogglePublish}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 ${course.isPublished ? "bg-gray-800 hover:bg-gray-900" : "bg-purple-600 hover:bg-purple-700 shadow-purple-200"}`}
          >
            {course.isPublished ? "Unpublish" : "Publish Course"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- LEFT: CURRICULUM --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <FiLayout className="text-purple-600" /> Curriculum
              </h2>
              <button
                onClick={() => setIsModuleModalOpen(true)}
                className="flex items-center gap-2 text-sm font-bold text-purple-600 bg-purple-50 px-4 py-2 rounded-lg hover:bg-purple-100 transition"
              >
                <FiPlus size={16} /> Add Section
              </button>
            </div>

            <div className="space-y-4">
              {modulesList.length > 0 ? (
                modulesList.map((module, mIndex) => (
                  <div
                    key={module._id || mIndex}
                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white"
                  >
                    <div
                      className="bg-gradient-to-r from-purple-50 to-purple-100/50 p-4 flex justify-between items-start cursor-pointer hover:from-purple-100 hover:to-purple-100 transition"
                      onClick={() => toggleModule(mIndex)}
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 bg-white rounded-lg border border-purple-200 shadow-sm text-purple-600 mt-0.5">
                          {expandedModules[mIndex] ? (
                            <FiChevronUp size={16} />
                          ) : (
                            <FiChevronDown size={16} />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-base">
                            Section {mIndex + 1}: {module.title}
                          </h3>
                          {module.description && (
                            <p className="text-sm text-gray-600 mt-1">
                              {module.description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 font-medium mt-2">
                            {module.lectures?.length || 0} lecture
                            {module.lectures?.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (module._id === "__legacy__") {
                              toast.error("Legacy section cannot be edited");
                              return;
                            }
                            handleEditModule(
                              module._id,
                              module.title,
                              module.description,
                            );
                          }}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (module._id === "__legacy__") {
                              toast.error("Legacy section cannot be deleted");
                              return;
                            }
                            openConfirm({
                              type: "module",
                              moduleId: module._id,
                              message:
                                "Are you sure you want to delete this section and all its videos?",
                            });
                          }}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {expandedModules[mIndex] && (
                      <div className="p-4 bg-white border-t border-gray-100 space-y-3">
                        {module.lectures && module.lectures.length > 0 ? (
                          module.lectures.map((lecture, lIndex) => (
                            <div
                              key={lecture._id || lIndex}
                              className="flex justify-between items-start p-3 rounded-lg hover:bg-gray-50 border border-gray-200 hover:border-purple-200 transition-all bg-white"
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <FiCheckCircle
                                  className="text-green-500 flex-shrink-0 mt-1"
                                  size={18}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-sm font-bold text-gray-900">
                                      {lIndex + 1}. {lecture.title}
                                    </p>
                                    {lecture.isPreview && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                                        Preview
                                      </span>
                                    )}
                                    {lecture.videoUrl && (
                                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                                        Video
                                      </span>
                                    )}
                                  </div>
                                  {lecture.description && (
                                    <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                      {lecture.description}
                                    </p>
                                  )}
                                  {lecture.videoUrl && (
                                    <p className="text-xs text-gray-500 mt-2 truncate">
                                      {lecture.videoUrl}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                <button
                                  onClick={() =>
                                    handleTogglePreview(
                                      lecture._id,
                                      !lecture.isPreview,
                                    )
                                  }
                                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition ${lecture.isPreview ? "bg-blue-600 text-white border-blue-600" : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"}`}
                                >
                                  {lecture.isPreview
                                    ? "Preview On"
                                    : "Preview Off"}
                                </button>
                                <button
                                  onClick={() =>
                                    toast("Edit lecture coming soon", {
                                      icon: "🛠️",
                                    })
                                  }
                                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition"
                                >
                                  <FiEdit2 size={16} />
                                </button>
                                <button
                                  onClick={() =>
                                    openConfirm({
                                      type: "lecture",
                                      lectureId: lecture._id,
                                      message:
                                        "Are you sure you want to delete this video?",
                                    })
                                  }
                                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                  <FiTrash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-sm text-gray-400 italic">
                              No videos in this section yet.
                            </p>
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (module._id === "__legacy__") {
                              toast.error("Create a new section to add videos");
                              return;
                            }
                            openLectureModal(module._id);
                          }}
                          className="w-full py-2 border-2 border-dashed border-purple-300 rounded-lg text-sm font-bold text-purple-600 hover:bg-purple-50 transition flex items-center justify-center gap-2"
                        >
                          <FiPlus size={16} /> Add Video
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <FiLayout size={24} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900">No sections yet</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Create your first section to organize videos
                  </p>
                  <button
                    onClick={() => setIsModuleModalOpen(true)}
                    className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-purple-700 transition"
                  >
                    + Create First Section
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT: COURSE DETAILS (Thumbnail Upload) --- */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-40 bg-gray-200 relative group">
              {/* Image Preview */}
              <Image
                src={course.thumbnail || "https://placehold.co/600x400"}
                alt="Thumbnail"
                width={600}
                height={400}
                className="w-full h-full object-cover"
              />

              {/* Overlay with Loading State */}
              <div
                className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUploadingThumb ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
              >
                {isUploadingThumb ? (
                  <span className="text-white text-xs font-bold flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Uploading...
                  </span>
                ) : (
                  <button
                    onClick={() => thumbnailInputRef.current.click()}
                    className="bg-white text-black px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
                  >
                    <FiMonitor /> Change Image
                  </button>
                )}
              </div>
              {/* Hidden File Input */}
              <input
                type="file"
                ref={thumbnailInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleThumbnailChange}
              />
            </div>

            <div className="p-6">
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">
                {course.title}
              </h3>
              <p className="text-xs text-gray-500 mb-4 capitalize">
                {course.category} • {course.level}
              </p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-2xl font-black text-gray-900">
                  ₹{course.price}
                </span>
                <button className="text-purple-600 text-xs font-bold hover:underline">
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL: Add Module */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">New Section</h3>
              <button
                onClick={() => setIsModuleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleAddModule}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Section Title
                </label>
                <input
                  autoFocus
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white"
                  placeholder="e.g. Introduction to React"
                  value={moduleTitle}
                  onChange={(e) => setModuleTitle(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition shadow-lg"
                >
                  Create Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 transform transition-all">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Section</h3>
              <button
                onClick={() => setIsEditModuleModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateModule}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Section Title
                </label>
                <input
                  autoFocus
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white"
                  placeholder="e.g. Introduction to React"
                  value={editModuleTitle}
                  onChange={(e) => setEditModuleTitle(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModuleModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition shadow-lg"
                >
                  Update Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Add Lecture with Video Upload */}
      {isLectureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Add Lecture Content
              </h3>
              <button
                onClick={() => setIsLectureModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>
            <form onSubmit={handleAddLecture}>
              <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Lecture Title
                  </label>
                  <input
                    autoFocus
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white"
                    placeholder="e.g. Setting up the environment"
                    value={lectureData.title}
                    onChange={(e) =>
                      setLectureData({ ...lectureData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white resize-none h-24"
                    placeholder="Add details about this lecture for students..."
                    value={lectureData.description}
                    onChange={(e) =>
                      setLectureData({
                        ...lectureData,
                        description: e.target.value,
                      })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {lectureData.description.length}/500 characters
                  </p>
                </div>

                {/* Video Upload Section */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Video Source
                  </label>

                  {lectureData.videoUrl ? (
                    // Show uploaded video URL as read-only
                    <div className="flex items-center gap-2 border border-gray-300 rounded-xl p-2 bg-green-50 mb-3">
                      <FiVideo className="text-green-500 ml-2" />
                      <input
                        type="text"
                        className="w-full p-1 bg-transparent outline-none text-sm text-gray-900 font-medium"
                        value={lectureData.videoUrl}
                        disabled
                        readOnly
                      />
                      <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded whitespace-nowrap font-bold">
                        Uploaded
                      </span>
                    </div>
                  ) : (
                    // Show upload area if no video yet
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className="h-px bg-gray-200 flex-1"></div>
                        <span className="text-xs text-gray-400 font-bold uppercase">
                          UPLOAD VIDEO
                        </span>
                        <div className="h-px bg-gray-200 flex-1"></div>
                      </div>

                      {/* File Upload */}
                      <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                        <input
                          type="file"
                          accept="video/*"
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          onChange={handleVideoFileSelect}
                          disabled={isUploadingVideo}
                        />
                        {isUploadingVideo ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-center gap-2 text-purple-600 font-bold text-sm">
                              <span className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></span>
                              Uploading video... {uploadProgress}%
                            </div>
                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                              <div
                                className="bg-purple-600 h-2.5 transition-all duration-300 ease-out"
                                style={{ width: `${uploadProgress}%` }}
                              ></div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 text-sm">
                            <FiUploadCloud
                              className="mx-auto mb-1 text-gray-400"
                              size={24}
                            />
                            <span className="font-bold text-purple-600">
                              Click to upload
                            </span>{" "}
                            MP4/WebM
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              {lectureData.videoUrl && (
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <input
                    type="checkbox"
                    id="isPreview"
                    checked={lectureData.isPreview}
                    onChange={(e) =>
                      setLectureData({
                        ...lectureData,
                        isPreview: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor="isPreview"
                      className="text-sm font-bold text-gray-900 cursor-pointer"
                    >
                      Make this a Preview Video
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Students can watch this video without purchasing the
                      course
                    </p>
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsLectureModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingVideo}
                  className="px-5 py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  Add Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDialog.open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Confirm Delete
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              {confirmDialog.message ||
                "Are you sure you want to delete this item?"}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={closeConfirm}
                className="px-4 py-2 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                className="px-4 py-2 rounded-lg font-bold bg-red-600 text-white hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </TutorLayout>
  );
}
