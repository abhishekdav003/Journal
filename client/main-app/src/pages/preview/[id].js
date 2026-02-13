import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getCourse } from "../../services/apiService";
import { FiPlay, FiChevronDown, FiChevronUp, FiLock } from "react-icons/fi";
import toast, { Toaster } from "react-hot-toast";
import Image from "next/image";

export default function CoursePreview() {
  const router = useRouter();
  const { id } = router.query;

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCourseData(id);
    }
  }, [id]);

  const fetchCourseData = async (courseId) => {
    try {
      setLoading(true);
      const res = await getCourse(courseId);
      const courseData = res.data.data.course || res.data.data;
      setCourse(courseData);

      // Find first preview video and auto-select it
      const firstPreview = courseData.modules?.find((m) =>
        m.lectures?.some((l) => l.isPreview),
      );
      if (firstPreview) {
        const firstLecture = firstPreview.lectures.find((l) => l.isPreview);
        if (firstLecture) {
          setSelectedVideo(firstLecture);
          setExpandedModules({ [0]: true });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load course preview");
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (index) => {
    setExpandedModules((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleSelectVideo = (lecture) => {
    if (lecture.isPreview) {
      setSelectedVideo(lecture);
      setIsPreviewModalOpen(true);
    } else {
      toast.error("This video is locked. Enroll to watch the full course", {
        icon: "🔒",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg font-semibold">
            Loading course preview...
          </p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center text-gray-700">
          <p className="text-2xl font-bold mb-4">Course not found</p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const modules = course.modules || [];

  // Get all preview videos for the free sample list
  const allPreviewVideos = modules
    .flatMap((mod) => mod.lectures || [])
    .filter((lec) => lec.isPreview);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="text-gray-600 hover:text-gray-900 transition font-bold"
            >
              ← Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              Preview
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Player */}
          <div className="lg:col-span-2">
            {selectedVideo ? (
              <div className="space-y-6">
                {/* Video Container */}
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl">
                  <video
                    key={selectedVideo._id}
                    className="w-full h-full"
                    controls
                    controlsList="nodownload"
                  >
                    <source src={selectedVideo.videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Video Info */}
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h2 className="text-2xl font-bold text-gray-900 flex-1">
                      {selectedVideo.title}
                    </h2>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full whitespace-nowrap">
                      Preview
                    </span>
                  </div>

                  {selectedVideo.description && (
                    <p className="text-gray-700 text-base leading-relaxed mb-6">
                      {selectedVideo.description}
                    </p>
                  )}

                  <div className="pt-6 border-t border-gray-200">
                    <button
                      onClick={() => router.push(`/student/courses`)}
                      className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
                    >
                      Enroll Now to Watch Full Course
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 shadow-lg">
                <p className="text-gray-400 text-center">
                  <FiLock className="w-12 h-12 mx-auto mb-3 opacity-40" />
                  Select a preview video to watch
                </p>
              </div>
            )}
          </div>

          {/* Sidebar - Course Content & Info */}
          <div className="space-y-6">
            {/* Course Info Card */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200 shadow-sm">
              {course.thumbnail && (
                <div className="relative w-full h-40 bg-gray-200">
                  <Image
                    src={course.thumbnail}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-5 space-y-4">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">
                    Category
                  </p>
                  <p className="text-gray-900 font-bold capitalize">
                    {course.category}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">
                    Level
                  </p>
                  <p className="text-gray-900 font-bold capitalize">
                    {course.level}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">
                    Price
                  </p>
                  <p className="text-gray-900 text-3xl font-bold">
                    ₹{course.price}
                  </p>
                </div>
                <button
                  onClick={() => router.push(`/student/courses`)}
                  className="w-full px-4 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
                >
                  Enroll Now
                </button>
              </div>
            </div>

            {/* Course Curriculum */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-gray-50">
                <h3 className="text-gray-900 font-bold text-lg">
                  Course Content
                </h3>
                <p className="text-gray-600 text-xs mt-1">
                  {modules.length} section{modules.length !== 1 ? "s" : ""}
                </p>
              </div>

              {modules.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {modules.map((module, mIndex) => (
                    <div key={module._id || mIndex}>
                      <button
                        onClick={() => toggleModule(mIndex)}
                        className="w-full p-4 hover:bg-gray-50 transition flex justify-between items-center text-left"
                      >
                        <div className="flex-1">
                          <p className="text-gray-900 font-bold text-sm">
                            {module.title}
                          </p>
                          <p className="text-gray-600 text-xs mt-0.5">
                            {module.lectures?.length || 0} video
                            {module.lectures?.length !== 1 ? "s" : ""}
                          </p>
                          {module.description && (
                            <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                              {module.description}
                            </p>
                          )}
                        </div>
                        <div className="text-gray-400">
                          {expandedModules[mIndex] ? (
                            <FiChevronUp size={18} />
                          ) : (
                            <FiChevronDown size={18} />
                          )}
                        </div>
                      </button>

                      {expandedModules[mIndex] && (
                        <div className="bg-gray-50 divide-y divide-gray-200">
                          {module.lectures && module.lectures.length > 0 ? (
                            module.lectures.map((lecture, lIndex) => (
                              <button
                                key={lecture._id || lIndex}
                                onClick={() => handleSelectVideo(lecture)}
                                disabled={!lecture.isPreview}
                                className={`w-full p-4 text-left hover:bg-gray-100 transition flex gap-3 ${
                                  selectedVideo?._id === lecture._id
                                    ? "bg-purple-50 border-l-4 border-purple-600"
                                    : ""
                                } ${
                                  !lecture.isPreview
                                    ? "opacity-60 cursor-not-allowed hover:bg-gray-50"
                                    : "cursor-pointer"
                                }`}
                              >
                                <div className="pt-1 text-gray-400 shrink-0">
                                  {lecture.isPreview ? (
                                    <FiPlay size={16} />
                                  ) : (
                                    <FiLock size={16} />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="text-gray-900 text-sm font-semibold">
                                      {lIndex + 1}. {lecture.title}
                                    </p>
                                    {lecture.isPreview && (
                                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-bold">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                  {lecture.description && (
                                    <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                                      {lecture.description}
                                    </p>
                                  )}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              No videos in this section
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <p>No content available</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {isPreviewModalOpen && selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b border-gray-700 bg-gray-900">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Course Preview
                </h2>
                <p className="text-gray-400 text-sm mt-1">{course.title}</p>
              </div>
              <button
                onClick={() => setIsPreviewModalOpen(false)}
                className="text-gray-400 hover:text-white transition text-3xl leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-xl overflow-hidden shadow-xl border border-gray-700">
                <video
                  key={selectedVideo._id}
                  className="w-full h-full"
                  controls
                  controlsList="nodownload"
                  autoPlay
                >
                  <source src={selectedVideo.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* Video Title & Description */}
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-white">
                  {selectedVideo.title}
                </h3>
                {selectedVideo.description && (
                  <p className="text-gray-300 leading-relaxed">
                    {selectedVideo.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-700">
                <button
                  onClick={() => router.push(`/student/courses`)}
                  className="flex-1 px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
                >
                  Enroll Now - ₹{course.price}
                </button>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="px-6 py-3 bg-gray-800 text-white font-bold rounded-lg hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>

              {/* Free Sample Videos Section */}
              {allPreviewVideos.length > 1 && (
                <div className="pt-6 border-t border-gray-700 space-y-4">
                  <h4 className="text-white font-bold text-lg">
                    Free Sample Videos:
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {allPreviewVideos.map((video, idx) => (
                      <button
                        key={video._id || idx}
                        onClick={() => {
                          setSelectedVideo(video);
                          window.scrollTo(0, 0);
                        }}
                        className={`w-full p-4 rounded-lg text-left transition ${
                          selectedVideo._id === video._id
                            ? "bg-purple-600/30 border-l-4 border-purple-500"
                            : "bg-gray-800 hover:bg-gray-700 border-l-4 border-gray-700 hover:border-purple-500"
                        }`}
                      >
                        <p className="text-white font-semibold">
                          {video.title}
                        </p>
                        {video.description && (
                          <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                            {video.description}
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Call to Action Footer */}
              <div className="pt-6 border-t border-gray-700 bg-gray-800/50 rounded-lg p-6 space-y-3">
                <h4 className="text-white font-bold">
                  Ready to start learning?
                </h4>
                <p className="text-gray-300 text-sm">
                  Enroll now to access the complete course with all lessons,
                  exercises, and certificate of completion.
                </p>
                <button
                  onClick={() => router.push(`/student/courses`)}
                  className="w-full px-6 py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 transition"
                >
                  Enroll in Full Course - ₹{course.price}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
