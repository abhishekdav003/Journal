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
  FiPlay,
} from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

export default function CourseEditor() {
  const router = useRouter();
  const { id } = router.query;
  const thumbnailInputRef = useRef(null);
  const videoModalRef = useRef(null);
  const uploadIdCounterRef = useRef(0);

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
    videoPublicId: "",
    videoName: "",
    duration: 0,
    isPreview: false,
  });
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const [lectureFile, setLectureFile] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: null,
    moduleId: null,
    lectureId: null,
    message: "",
  });
  const [videoPreview, setVideoPreview] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [detailsData, setDetailsData] = useState({
    title: "",
    tagline: "",
    description: "",
    learningPoints: [""],
    requirements: [""],
    category: "programming",
    level: "beginner",
    price: 0,
  });
  const [isSavingDetails, setIsSavingDetails] = useState(false);
  const [isEditLectureModalOpen, setIsEditLectureModalOpen] = useState(false);
  const [editingLectureId, setEditingLectureId] = useState(null);
  const [editLectureData, setEditLectureData] = useState({
    title: "",
    description: "",
    videoUrl: "",
    videoPublicId: "",
    videoName: "",
    duration: 0,
    isPreview: false,
  });
  const [editLectureFile, setEditLectureFile] = useState(null);

  // Upload Queue for Multiple Simultaneous Uploads
  const [uploadQueue, setUploadQueue] = useState(new Map());
  const [cancelUploadId, setCancelUploadId] = useState(null);

  useEffect(() => {
    if (id) fetchCourseData(id);
  }, [id]);

  useEffect(() => {
    const isAnyModalOpen =
      isModuleModalOpen ||
      isEditModuleModalOpen ||
      isLectureModalOpen ||
      isEditLectureModalOpen ||
      isDetailsModalOpen ||
      confirmDialog.open ||
      !!videoPreview ||
      !!cancelUploadId;

    if (isAnyModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [
    isModuleModalOpen,
    isEditModuleModalOpen,
    isLectureModalOpen,
    isEditLectureModalOpen,
    isDetailsModalOpen,
    confirmDialog.open,
    videoPreview,
    cancelUploadId,
  ]);

  // Extract duration from video element in modal as fallback
  useEffect(() => {
    if (videoPreview && videoModalRef.current) {
      const handleLoadedMetadata = () => {
        const duration = Math.round(videoModalRef.current.duration);
        if (duration > 0 && (!lectureData.duration || lectureData.duration === 0)) {
          setLectureData((prev) => ({
            ...prev,
            duration,
          }));
          console.log(`Duration extracted from video modal: ${duration} seconds`);
        }
      };

      const video = videoModalRef.current;
      video.addEventListener("loadedmetadata", handleLoadedMetadata);
      return () => video.removeEventListener("loadedmetadata", handleLoadedMetadata);
    }
  }, [videoPreview, lectureData.duration]);

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

  const getVideoDisplayName = (url, fallback = "Uploaded video") => {
    if (!url) return fallback;
    const cleanUrl = url.split("?")[0];
    const lastSegment = cleanUrl.split("/").pop();
    if (!lastSegment) return fallback;
    try {
      return decodeURIComponent(lastSegment);
    } catch (err) {
      return lastSegment;
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
      const publicId =
        res.data.data?.thumbnail?.publicId ||
        res.data.data?.thumbnail?.public_id ||
        res.data.publicId;

      // Update local state immediately
      setCourse((prev) => ({
        ...prev,
        thumbnail: url,
        thumbnailPublicId: publicId || prev.thumbnailPublicId,
      }));

      // Save to backend
      await updateCourse(id, {
        thumbnail: url,
        ...(publicId ? { thumbnailPublicId: publicId } : {}),
      });
      toast.success("Thumbnail updated!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload thumbnail");
    } finally {
      setIsUploadingThumb(false);
    }
  };

  // Helper function to extract video duration from file
  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      const objectUrl = URL.createObjectURL(file);

      video.addEventListener("loadedmetadata", () => {
        const duration = Math.round(video.duration);
        URL.revokeObjectURL(objectUrl);
        resolve(duration);
      });

      video.addEventListener("error", () => {
        URL.revokeObjectURL(objectUrl);
        console.error("Failed to load video metadata");
        resolve(0);
      });

      video.src = objectUrl;
    });
  };

  const uploadLectureVideo = async (uploadId, file, toastId, fileName) => {
    const formData = new FormData();
    formData.append("video", file);

    const controller = new AbortController();

    // Update queue with controller
    setUploadQueue((prev) => {
      const newQueue = new Map(prev);
      const upload = newQueue.get(uploadId);
      if (upload) {
        newQueue.set(uploadId, { ...upload, controller });
      }
      return newQueue;
    });

    try {
      const res = await uploadVideo(
        formData,
        (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          
          const uploadData = {
            file,
            progress: percentCompleted,
            controller,
            status: "uploading",
            fileName,
          };
          
          setUploadQueue((prev) => {
            const newQueue = new Map(prev);
            newQueue.set(uploadId, uploadData);
            return newQueue;
          });
          
          // Update the toast with current data
          toast.custom(renderUploadToast(uploadId, uploadData), {
            id: toastId,
            duration: Infinity,
          });
        },
        { signal: controller.signal }
      );

      const url =
        res.data.data?.video?.url || res.data.data?.url || res.data.url;
      const publicId =
        res.data.data?.video?.publicId ||
        res.data.data?.video?.public_id ||
        res.data.publicId;

      // Mark as completed
      setUploadQueue((prev) => {
        const newQueue = new Map(prev);
        newQueue.delete(uploadId);
        return newQueue;
      });

      return { url, publicId };
    } catch (err) {
      if (err?.code === "ERR_CANCELED" || err?.name === "CanceledError") {
        // Mark as canceled
        setUploadQueue((prev) => {
          const newQueue = new Map(prev);
          newQueue.delete(uploadId);
          return newQueue;
        });
        toast.error("Upload canceled");
        return null;
      }

      // Mark as failed
      setUploadQueue((prev) => {
        const newQueue = new Map(prev);
        newQueue.delete(uploadId);
        return newQueue;
      });
      throw err;
    }
  };

  const cancelUpload = (uploadId) => {
    const upload = uploadQueue.get(uploadId);
    if (upload?.controller) {
      upload.controller.abort();
    }
    setUploadQueue((prev) => {
      const newQueue = new Map(prev);
      newQueue.delete(uploadId);
      return newQueue;
    });
  };

  const openCancelUploadModal = (uploadId) => {
    setCancelUploadId(uploadId);
  };

  const closeCancelUploadModal = () => {
    setCancelUploadId(null);
  };

  const confirmCancelUpload = () => {
    if (cancelUploadId) {
      cancelUpload(cancelUploadId);
    }
    closeCancelUploadModal();
  };

  const renderUploadToast = (uploadId, uploadData = null) => {
    const upload = uploadData || uploadQueue.get(uploadId);
    if (!upload) return null;

    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 w-full max-w-sm">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-bold text-gray-900">
            Uploading {upload.fileName}... {upload.progress}%
          </p>
          <button
            className="text-xs font-bold text-red-600 hover:text-red-700"
            onClick={() => openCancelUploadModal(uploadId)}
            type="button"
          >
            Cancel
          </button>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-purple-600 h-2 transition-all duration-300 ease-out"
            style={{ width: `${upload.progress}%` }}
          ></div>
        </div>
        <p className="text-[11px] text-gray-500 mt-2">
          Cancel will stop the upload. Your lecture will not be saved.
        </p>
      </div>
    );
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

    // Extract duration from the video file for saving
    let fileDuration = 0;
    try {
      fileDuration = await getVideoDuration(file);
    } catch (err) {
      console.warn("Could not extract duration from file:", err);
    }

    setLectureFile(file);
    setLectureData((prev) => ({
      ...prev,
      videoName: file.name,
      duration: fileDuration || prev.duration,
    }));
  };

  // 3. Publish Toggle
  const handleTogglePublish = async () => {
    try {
      await togglePublishCourse(id);
      setCourse((prev) => ({ ...prev, isPublished: !prev.isPublished }));
      toast.success(
        course.isPublished ? "Course Unpublished" : "Course Published Live!"
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
    setLectureFile(null);
    setLectureData({
      title: "",
      description: "",
      videoUrl: "",
      videoPublicId: "",
      videoName: "",
      duration: 0,
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
    if (!lectureData.title.trim()) {
      toast.error("Please add a lecture title");
      return;
    }
    try {
      const payload = {
        title: lectureData.title,
        description: lectureData.description,
        isPreview: lectureData.isPreview,
        moduleId: activeModuleId,
        duration: lectureData.duration || 0,
      };
      const fileToUpload = lectureFile;

      setIsLectureModalOpen(false);
      setLectureFile(null);
      setLectureData({
        title: "",
        description: "",
        videoUrl: "",
        videoPublicId: "",
        videoName: "",
        duration: 0,
        isPreview: false,
      });

      let videoUrl = lectureData.videoUrl;
      let videoPublicId = lectureData.videoPublicId;
      let duration = payload.duration;

      if (!videoUrl) {
        if (!fileToUpload) {
          toast.error("Please select a video");
          return;
        }

        // Generate unique upload ID
        const uploadId = `upload-${Date.now()}-${uploadIdCounterRef.current++}`;

        // Create upload data
        const uploadData = {
          file: fileToUpload,
          progress: 0,
          controller: null,
          status: "uploading",
          fileName: fileToUpload.name,
        };

        // Initialize upload in queue first
        setUploadQueue((prev) => {
          const newQueue = new Map(prev);
          newQueue.set(uploadId, uploadData);
          return newQueue;
        });

        const toastId = toast.custom(renderUploadToast(uploadId, uploadData), {
          duration: Infinity,
        });

        const uploadResult = await uploadLectureVideo(uploadId, fileToUpload, toastId, fileToUpload.name);

        if (!uploadResult) {
          toast.dismiss(toastId);
          toast.error("Upload canceled");
          return;
        }

        videoUrl = uploadResult.url;
        videoPublicId = uploadResult.publicId || videoPublicId;

        // Remove from queue after successful upload
        setUploadQueue((prev) => {
          const newQueue = new Map(prev);
          newQueue.delete(uploadId);
          return newQueue;
        });

        toast.dismiss(toastId);
        toast.success("Video uploaded");
      }

      await addLecture(id, {
        title: payload.title,
        description: payload.description,
        videoUrl,
        videoPublicId,
        duration,
        isPreview: payload.isPreview,
        moduleId: payload.moduleId,
      });
      toast.success("Lecture added");
      fetchCourseData(id);
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

  const openEditLectureModal = (lecture) => {
    setEditingLectureId(lecture._id);
    setEditLectureFile(null);
    setEditLectureData({
      title: lecture.title || "",
      description: lecture.description || "",
      videoUrl: lecture.videoUrl || "",
      videoPublicId: lecture.videoPublicId || "",
      videoName: getVideoDisplayName(lecture.videoUrl),
      duration: lecture.duration || 0,
      isPreview: !!lecture.isPreview,
    });
    setIsEditLectureModalOpen(true);
  };

  const handleEditVideoFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast("Uploading large file, please wait...", { icon: "⏳" });
    }

    let fileDuration = 0;
    try {
      fileDuration = await getVideoDuration(file);
    } catch (err) {
      console.warn("Could not extract duration from file:", err);
    }

    setEditLectureFile(file);
    setEditLectureData((prev) => ({
      ...prev,
      videoName: file.name,
      duration: fileDuration || prev.duration || 0,
    }));
  };

  const handleUpdateLecture = async (e) => {
    e.preventDefault();
    if (!editingLectureId) return;

    if (!editLectureData.title.trim()) {
      toast.error("Lecture title is required");
      return;
    }

    try {
      let videoUrl = editLectureData.videoUrl;
      let videoPublicId = editLectureData.videoPublicId;
      let duration = editLectureData.duration || 0;

      if (editLectureFile) {
        // Generate unique upload ID
        const uploadId = `upload-edit-${Date.now()}-${uploadIdCounterRef.current++}`;

        // Create upload data
        const uploadData = {
          file: editLectureFile,
          progress: 0,
          controller: null,
          status: "uploading",
          fileName: editLectureFile.name,
        };

        // Initialize upload in queue first
        setUploadQueue((prev) => {
          const newQueue = new Map(prev);
          newQueue.set(uploadId, uploadData);
          return newQueue;
        });

        const toastId = toast.custom(renderUploadToast(uploadId, uploadData), {
          duration: Infinity,
        });

        const uploadResult = await uploadLectureVideo(uploadId, editLectureFile, toastId, editLectureFile.name);

        if (!uploadResult) {
          toast.dismiss(toastId);
          toast.error("Upload canceled");
          return;
        }

        videoUrl = uploadResult.url;
        videoPublicId = uploadResult.publicId || videoPublicId;

        // Remove from queue after successful upload
        setUploadQueue((prev) => {
          const newQueue = new Map(prev);
          newQueue.delete(uploadId);
          return newQueue;
        });

        toast.dismiss(toastId);
        toast.success("Video uploaded");

        setEditLectureData((prev) => ({
          ...prev,
          videoUrl,
          videoPublicId,
        }));
      }

      if (!videoUrl || !videoUrl.trim()) {
        toast.error("Please upload a video");
        return;
      }

      await updateLecture(id, editingLectureId, {
        title: editLectureData.title,
        description: editLectureData.description,
        videoUrl,
        videoPublicId,
        duration,
        isPreview: editLectureData.isPreview,
      });
      toast.success("Lecture updated");
      setEditLectureFile(null);
      setIsEditLectureModalOpen(false);
      fetchCourseData(id);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update lecture");
    }
  };

  const openDetailsModal = () => {
    if (!course) return;
    setDetailsData({
      title: course.title || "",
      tagline: course.tagline || "",
      description: course.description || "",
      learningPoints:
        course.learningPoints && course.learningPoints.length > 0
          ? course.learningPoints
          : [""],
      requirements:
        course.requirements && course.requirements.length > 0
          ? course.requirements
          : [""],
      category: course.category || "programming",
      level: course.level || "beginner",
      price: typeof course.price === "number" ? course.price : 0,
    });
    setIsDetailsModalOpen(true);
  };

  const handleUpdateDetails = async (e) => {
    e.preventDefault();

    if (!detailsData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!detailsData.description.trim()) {
      toast.error("Description is required");
      return;
    }

    const cleanedLearningPoints = detailsData.learningPoints
      .map((point) => point.trim())
      .filter(Boolean);
    const cleanedRequirements = detailsData.requirements
      .map((req) => req.trim())
      .filter(Boolean);

    setIsSavingDetails(true);
    try {
      const res = await updateCourse(id, {
        ...detailsData,
        price: Number(detailsData.price) || 0,
        learningPoints: cleanedLearningPoints,
        requirements: cleanedRequirements,
      });
      setCourse(res.data.data?.course || res.data.data);
      toast.success("Course details updated");
      setIsDetailsModalOpen(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update details");
    } finally {
      setIsSavingDetails(false);
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
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                course.isPublished
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
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
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 ${
              course.isPublished
                ? "bg-gray-800 hover:bg-gray-900"
                : "bg-purple-600 hover:bg-purple-700 shadow-purple-200"
            }`}
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
                      className="bg-linear-to-r from-purple-50 to-purple-100/50 p-4 flex justify-between items-start cursor-pointer hover:from-purple-100 hover:to-purple-100 transition"
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
                              module.description
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
                                  className="text-green-500 shrink-0 mt-1"
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
                                    <div className="mt-3 flex items-center gap-3">
                                      <div
                                        className="relative group cursor-pointer w-24 h-16 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden shrink-0"
                                        onClick={() => setVideoPreview(lecture)}
                                      >
                                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                                          <FiVideo className="text-gray-600 text-2xl" />
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition">
                                          <FiPlay className="text-white text-xl fill-current" />
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <p className="text-xs text-gray-600 font-medium">
                                          {lecture.duration
                                            ? `${Math.floor(
                                                lecture.duration / 60
                                              )}:${(lecture.duration % 60)
                                                .toString()
                                                .padStart(2, "0")}`
                                            : "Duration unknown"}
                                        </p>
                                        <a
                                          href={lecture.videoUrl}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-600 hover:underline truncate block"
                                        >
                                          Watch full video
                                        </a>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 ml-4 shrink-0">
                                <button
                                  onClick={() =>
                                    handleTogglePreview(
                                      lecture._id,
                                      !lecture.isPreview
                                    )
                                  }
                                  className={`px-2.5 py-1 rounded-full text-xs font-bold border transition ${
                                    lecture.isPreview
                                      ? "bg-blue-600 text-white border-blue-600"
                                      : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                                  }`}
                                >
                                  {lecture.isPreview
                                    ? "Preview On"
                                    : "Preview Off"}
                                </button>
                                <button
                                  onClick={() => openEditLectureModal(lecture)}
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
                  <FiLayout
                    size={24}
                    className="text-gray-300 mx-auto mb-4"
                  />
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
                className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${
                  isUploadingThumb
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
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
                <button
                  onClick={openDetailsModal}
                  className="text-purple-600 text-xs font-bold hover:underline"
                >
                  Edit Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Edit Course Details
              </h3>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateDetails} className="space-y-6">
              <div className="max-h-[65vh] overflow-y-auto pr-1 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Course Title
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white"
                    placeholder="e.g. Master Next.js 14 from Scratch"
                    value={detailsData.title}
                    onChange={(e) =>
                      setDetailsData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Short Tagline
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white"
                    placeholder="A short, punchy summary of the course"
                    value={detailsData.tagline}
                    onChange={(e) =>
                      setDetailsData((prev) => ({
                        ...prev,
                        tagline: e.target.value,
                      }))
                    }
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white resize-none h-28"
                    placeholder="What will students learn in this course?"
                    value={detailsData.description}
                    onChange={(e) =>
                      setDetailsData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    {"What you'll learn"}
                  </label>
                  <div className="space-y-3">
                    {detailsData.learningPoints.map((point, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white"
                          placeholder={`Outcome ${index + 1}`}
                          value={point}
                          onChange={(e) => {
                            const updated = [...detailsData.learningPoints];
                            updated[index] = e.target.value;
                            setDetailsData((prev) => ({
                              ...prev,
                              learningPoints: updated,
                            }));
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (detailsData.learningPoints.length === 1) return;
                            const updated = detailsData.learningPoints.filter(
                              (_, idx) => idx !== index
                            );
                            setDetailsData((prev) => ({
                              ...prev,
                              learningPoints: updated,
                            }));
                          }}
                          className="px-3 py-2 text-sm font-bold text-gray-500 hover:text-red-600 transition"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDetailsData((prev) => ({
                        ...prev,
                        learningPoints: [...prev.learningPoints, ""],
                      }))
                    }
                    className="mt-3 text-sm font-bold text-purple-600 hover:text-purple-700 transition"
                  >
                    + Add another outcome
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Requirements (Optional)
                  </label>
                  <div className="space-y-3">
                    {detailsData.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <input
                          type="text"
                          className="flex-1 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white"
                          placeholder={`Requirement ${index + 1}`}
                          value={req}
                          onChange={(e) => {
                            const updated = [...detailsData.requirements];
                            updated[index] = e.target.value;
                            setDetailsData((prev) => ({
                              ...prev,
                              requirements: updated,
                            }));
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (detailsData.requirements.length === 1) return;
                            const updated = detailsData.requirements.filter(
                              (_, idx) => idx !== index
                            );
                            setDetailsData((prev) => ({
                              ...prev,
                              requirements: updated,
                            }));
                          }}
                          className="px-3 py-2 text-sm font-bold text-gray-500 hover:text-red-600 transition"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDetailsData((prev) => ({
                        ...prev,
                        requirements: [...prev.requirements, ""],
                      }))
                    }
                    className="mt-3 text-sm font-bold text-purple-600 hover:text-purple-700 transition"
                  >
                    + Add another requirement
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition bg-white text-gray-900 cursor-pointer"
                      value={detailsData.category}
                      onChange={(e) =>
                        setDetailsData((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                    >
                      <option value="programming">Programming</option>
                      <option value="design">Design</option>
                      <option value="business">Business</option>
                      <option value="marketing">Marketing</option>
                      <option value="photography">Photography</option>
                      <option value="music">Music</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Level
                    </label>
                    <select
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition bg-white text-gray-900 cursor-pointer"
                      value={detailsData.level}
                      onChange={(e) =>
                        setDetailsData((prev) => ({
                          ...prev,
                          level: e.target.value,
                        }))
                      }
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Price (INR)
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white"
                    placeholder="0 for Free"
                    value={detailsData.price}
                    onChange={(e) =>
                      setDetailsData((prev) => ({
                        ...prev,
                        price: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsDetailsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDetails}
                  className="px-5 py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSavingDetails ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditLectureModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Edit Lecture</h3>
              <button
                onClick={() => setIsEditLectureModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX size={24} />
              </button>
            </div>

            <form onSubmit={handleUpdateLecture}>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Lecture Title
                  </label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white"
                    value={editLectureData.title}
                    onChange={(e) =>
                      setEditLectureData((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white resize-none h-24"
                    value={editLectureData.description}
                    onChange={(e) =>
                      setEditLectureData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Video Source
                  </label>

                  {editLectureData.videoUrl || editLectureFile ? (
                    <div className="border border-gray-300 rounded-xl p-3 bg-green-50 mb-3">
                      <div className="flex items-center gap-2">
                        <FiVideo className="text-green-500" />
                        <span className="w-full text-sm text-gray-900 font-medium truncate">
                          {editLectureFile?.name ||
                            editLectureData.videoName ||
                            getVideoDisplayName(editLectureData.videoUrl)}
                        </span>
                        <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded whitespace-nowrap font-bold">
                          {editLectureFile ? "Selected" : "Current"}
                        </span>
                      </div>
                      <div className="mt-3">
                        <label className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 cursor-pointer">
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleEditVideoFileSelect}
                          />
                          Change file
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                      <input
                        type="file"
                        accept="video/*"
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        onChange={handleEditVideoFileSelect}
                      />
                      <div className="text-gray-500 text-sm">
                        <FiUploadCloud
                          className="mx-auto mb-1 text-gray-400"
                          size={24}
                        />
                        <span className="font-bold text-purple-600">
                          Click to upload video
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {editLectureData.videoUrl && (
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <input
                      type="checkbox"
                      id="editIsPreview"
                      checked={editLectureData.isPreview}
                      onChange={(e) =>
                        setEditLectureData((prev) => ({
                          ...prev,
                          isPreview: e.target.checked,
                        }))
                      }
                      className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor="editIsPreview"
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
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditLectureModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition shadow-lg"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

                  {lectureFile || lectureData.videoUrl ? (
                    <div className="border border-gray-300 rounded-xl p-3 bg-green-50 mb-3">
                      <div className="flex items-center gap-2">
                        <FiVideo className="text-green-500" />
                        <span className="w-full text-sm text-gray-900 font-medium truncate">
                          {lectureFile?.name ||
                            lectureData.videoName ||
                            getVideoDisplayName(lectureData.videoUrl)}
                        </span>
                        <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded whitespace-nowrap font-bold">
                          {lectureData.videoUrl ? "Uploaded" : "Ready"}
                        </span>
                      </div>
                      <div className="mt-3">
                        <label className="inline-flex items-center gap-2 text-xs font-bold text-purple-600 cursor-pointer">
                          <input
                            type="file"
                            accept="video/*"
                            className="hidden"
                            onChange={handleVideoFileSelect}
                          />
                          Change file
                        </label>
                      </div>
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
                        />
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
                  className="px-5 py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition shadow-lg"
                >
                  Add Lecture
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDialog.open && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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

      {cancelUploadId && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Cancel upload?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Upload will stop and this lecture will not be saved.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div
                className="px-4 py-2 rounded-lg font-bold text-center text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                onClick={closeCancelUploadModal}
              >
                Keep uploading
              </div>
              <div
                className="px-4 py-2 rounded-lg font-bold text-center bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
                onClick={confirmCancelUpload}
              >
                Cancel upload
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIDEO PREVIEW MODAL */}
      {videoPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">
                {videoPreview.title}
              </h3>
              <button
                onClick={() => setVideoPreview(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="bg-black aspect-video">
              <video
                ref={videoModalRef}
                src={videoPreview.videoUrl}
                controls
                autoPlay
                className="w-full h-full"
              />
            </div>
            <div className="p-4 space-y-2">
              {videoPreview.description && (
                <p className="text-sm text-gray-700">
                  {videoPreview.description}
                </p>
              )}
              <div className="flex gap-4 text-xs text-gray-500">
                <span>
                  Duration:{" "}
                  {videoPreview.duration
                    ? `${Math.floor(videoPreview.duration / 60)}:${(
                        videoPreview.duration % 60
                      )
                        .toString()
                        .padStart(2, "0")}`
                    : "Unknown"}
                </span>
                {videoPreview.isPreview && (
                  <span className="text-blue-600 font-bold">
                    Preview Enabled
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </TutorLayout>
  );
}