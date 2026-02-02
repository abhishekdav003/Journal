import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getCourse } from "@/services/apiService";
import { useAuth } from "@/context/AuthContext";
import {
  FiPlay,
  FiChevronDown,
  FiChevronUp,
  FiStar,
  FiUsers,
  FiClock,
  FiAward,
  FiShare2,
  FiHeart,
  FiX,
  FiMenu,
} from "react-icons/fi";
import Image from "next/image";

export default function LearnCourse() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState(0);
  const [activeLecture, setActiveLecture] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await getCourse(id);
      if (response.data.success) {
        setCourse(response.data.data.course);
        // Set first lecture as active
        if (response.data.data.course.modules?.length > 0) {
          setActiveLecture(response.data.data.course.modules[0]?.lectures?.[0]);
        } else if (response.data.data.course.lectures?.length > 0) {
          setActiveLecture(response.data.data.course.lectures[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  const lectures =
    course.modules?.length > 0
      ? course.modules[activeModule]?.lectures || []
      : course.lectures || [];

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Video Player Section */}
      <div className="flex-1 flex flex-col">
        {/* Video Player */}
        <div className="bg-black flex-1 flex items-center justify-center">
          {activeLecture?.videoUrl ? (
            <video
              src={activeLecture.videoUrl}
              controls
              className="w-full h-full"
            />
          ) : (
            <div className="text-center">
              <FiPlay className="text-6xl text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500">
                No video available for this lecture
              </p>
            </div>
          )}
        </div>

        {/* Video Info */}
        <div className="bg-gray-800 p-6 border-t border-gray-700">
          <h2 className="text-2xl font-bold mb-2">{activeLecture?.title}</h2>
          <p className="text-gray-300 mb-4">{activeLecture?.description}</p>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <FiClock className="text-purple-400" />
                <span className="text-sm">
                  {activeLecture?.duration || 0} min
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiAward className="text-yellow-400" />
                <span className="text-sm">Preview</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all">
                <FiShare2 size={20} />
              </button>
              <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-all">
                <FiHeart size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar - Courses List */}
      <div
        className={`${
          sidebarOpen ? "w-96" : "w-0"
        } bg-gray-800 border-l border-gray-700 flex flex-col transition-all duration-300 overflow-hidden`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between">
          <h3 className="font-bold text-lg">Lessons</h3>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-gray-400 hover:text-white"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Course Info */}
        <div className="p-4 border-b border-gray-700">
          <h4 className="font-bold text-sm mb-2">{course.title}</h4>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <FiStar className="text-yellow-400" />
              4.8
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FiUsers />
              {course.enrolledStudents?.length || 0}
            </span>
          </div>
        </div>

        {/* Modules/Lectures List */}
        <div className="flex-1 overflow-y-auto">
          {course.modules && course.modules.length > 0 ? (
            // Multiple Modules
            course.modules.map((module, moduleIdx) => (
              <div
                key={module._id || moduleIdx}
                className="border-b border-gray-700"
              >
                <button
                  onClick={() =>
                    setActiveModule(activeModule === moduleIdx ? -1 : moduleIdx)
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-700 transition-all text-left"
                >
                  <span className="font-semibold text-sm">{module.title}</span>
                  {activeModule === moduleIdx ? (
                    <FiChevronUp />
                  ) : (
                    <FiChevronDown />
                  )}
                </button>

                {activeModule === moduleIdx && (
                  <div className="bg-gray-900/50">
                    {module.lectures?.map((lecture, lectureIdx) => (
                      <button
                        key={lecture._id || lectureIdx}
                        onClick={() => setActiveLecture(lecture)}
                        className={`w-full p-3 flex items-start gap-3 hover:bg-gray-700 transition-all text-left border-l-2 ${
                          activeLecture?._id === lecture._id
                            ? "border-purple-600 bg-gray-700"
                            : "border-transparent"
                        }`}
                      >
                        <FiPlay
                          className={`shrink-0 mt-1 ${
                            activeLecture?._id === lecture._id
                              ? "text-purple-400"
                              : "text-gray-500"
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">
                            {lecture.title}
                          </p>
                          <p className="text-xs text-gray-400">
                            {lecture.duration || 0} min
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            // Single Lectures List
            <div>
              {lectures.map((lecture, idx) => (
                <button
                  key={lecture._id || idx}
                  onClick={() => setActiveLecture(lecture)}
                  className={`w-full p-4 flex items-start gap-3 hover:bg-gray-700 transition-all text-left border-l-2 ${
                    activeLecture?._id === lecture._id
                      ? "border-purple-600 bg-gray-700"
                      : "border-transparent"
                  }`}
                >
                  <FiPlay
                    className={`shrink-0 mt-1 ${
                      activeLecture?._id === lecture._id
                        ? "text-purple-400"
                        : "text-gray-500"
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">
                      {idx + 1}. {lecture.title}
                    </p>
                    <p className="text-xs text-gray-400">
                      {lecture.duration || 0} min
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700">
          <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all">
            Enroll Now - ₹{course.price}
          </button>
        </div>
      </div>

      {/* Mobile Toggle Sidebar */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="absolute right-4 bottom-4 md:hidden bg-purple-600 hover:bg-purple-700 p-3 rounded-lg"
        >
          <FiMenu size={24} />
        </button>
      )}
    </div>
  );
}
