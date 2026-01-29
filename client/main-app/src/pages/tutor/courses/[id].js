import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { 
  getCourse, 
  addModule, 
  addLecture, 
  togglePublishCourse,
  updateCourse, // Need to update course thumbnail
  uploadVideo,  // For lectures
  uploadThumbnail // For main course image
} from '../../../services/apiService';
import TutorLayout from '../../../components/tutor/TutorLayout';
import { 
  FiPlus, FiVideo, FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, 
  FiLayout, FiMonitor, FiCheckCircle, FiX, FiUploadCloud 
} from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';
import Image from 'next/image';

export default function CourseEditor() {
  const router = useRouter();
  const { id } = router.query;
  const thumbnailInputRef = useRef(null);
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  
  // Modal & Form States
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [isLectureModalOpen, setIsLectureModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(null);
  const [moduleTitle, setModuleTitle] = useState('');
  
  const [lectureData, setLectureData] = useState({ title: '', videoUrl: '' });
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);

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
    formData.append('file', file);

    try {
      setIsUploadingThumb(true);
      const res = await uploadThumbnail(formData);
      const url = res.data.data || res.data.url || res.data.secure_url;
      
      // Update local state immediately
      setCourse(prev => ({ ...prev, thumbnail: url }));
      
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
    if (file.size > 100 * 1024 * 1024) { // 100MB warning
       toast('Uploading large file, please wait...', { icon: '⏳' });
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setIsUploadingVideo(true);
      const res = await uploadVideo(formData);
      const url = res.data.data || res.data.url || res.data.secure_url;
      
      setLectureData(prev => ({ ...prev, videoUrl: url }));
      toast.success("Video uploaded successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload video");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  // 3. Publish Toggle
  const handleTogglePublish = async () => {
    try {
      await togglePublishCourse(id);
      setCourse(prev => ({ ...prev, isPublished: !prev.isPublished }));
      toast.success(course.isPublished ? "Course Unpublished" : "Course Published Live!");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const toggleModule = (index) => setExpandedModules(prev => ({ ...prev, [index]: !prev[index] }));

  // 4. Add Module
  const handleAddModule = async (e) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;
    try {
      const res = await addModule(id, { title: moduleTitle });
      toast.success("Module added");
      setCourse(prev => ({ ...prev, modules: res.data.data }));
      setModuleTitle('');
      setIsModuleModalOpen(false);
    } catch (err) {
      toast.error("Failed to create module");
    }
  };

  // 5. Add Lecture
  const openLectureModal = (moduleId) => {
    setActiveModuleId(moduleId);
    setLectureData({ title: '', videoUrl: '' });
    setIsLectureModalOpen(true);
  };

  const handleAddLecture = async (e) => {
    e.preventDefault();
    if (!lectureData.title.trim()) return;
    try {
      await addLecture(id, { 
        moduleId: activeModuleId,
        title: lectureData.title,
        videoUrl: lectureData.videoUrl, 
        type: 'video'
      });
      toast.success("Lecture added");
      fetchCourseData(id);
      setIsLectureModalOpen(false);
    } catch (err) {
      toast.error("Failed to add lecture");
    }
  };

  if (loading) return (
    <TutorLayout>
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    </TutorLayout>
  );

  if (!course) return null;

  return (
    <TutorLayout>
      <Toaster position="top-right" />
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{course.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {course.isPublished ? 'Live' : 'Draft'}
            </span>
          </div>
          <p className="text-gray-500 font-medium">Manage your curriculum, content, and settings.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <button 
            onClick={() => router.push(`/course/${id}`)}
            className="flex-1 md:flex-none px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition"
          >
            Preview
          </button>
          <button 
            onClick={handleTogglePublish}
            className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition transform active:scale-95 ${course.isPublished ? 'bg-gray-800 hover:bg-gray-900' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-200'}`}
          >
            {course.isPublished ? 'Unpublish' : 'Publish Course'}
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
              {course.modules && course.modules.length > 0 ? (
                course.modules.map((module, mIndex) => (
                  <div key={module._id || mIndex} className="border border-gray-200 rounded-2xl overflow-hidden bg-white hover:border-purple-200">
                    <div 
                      className="bg-gray-50/50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                      onClick={() => toggleModule(mIndex)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm text-gray-500">
                          {expandedModules[mIndex] ? <FiChevronUp /> : <FiChevronDown />}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm md:text-base">Section {mIndex + 1}: {module.title}</h3>
                          <p className="text-xs text-gray-500 font-medium">{module.lectures?.length || 0} lectures</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                         <button className="p-2 text-gray-400 hover:text-purple-600 transition"><FiEdit2 size={16}/></button>
                         <button className="p-2 text-gray-400 hover:text-red-500 transition"><FiTrash2 size={16}/></button>
                      </div>
                    </div>

                    {expandedModules[mIndex] && (
                      <div className="p-4 bg-white border-t border-gray-100 space-y-3">
                        {module.lectures && module.lectures.length > 0 ? (
                          module.lectures.map((lecture, lIndex) => (
                            <div key={lecture._id || lIndex} className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 group border border-transparent hover:border-gray-100 transition-all">
                              <div className="flex items-center gap-3">
                                <FiCheckCircle className="text-green-500" size={18} />
                                <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{lIndex + 1}. {lecture.title}</span>
                                {lecture.videoUrl && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded border border-gray-200">Video</span>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-4">
                            <p className="text-xs text-gray-400 italic mb-2">No content in this section yet.</p>
                          </div>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); openLectureModal(module._id); }}
                          className="w-full py-2 border-2 border-dashed border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition flex items-center justify-center gap-2"
                        >
                          <FiPlus /> Add Curriculum Item
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                  <FiLayout size={24} className="text-gray-300 mx-auto mb-4" />
                  <h3 className="font-bold text-gray-900">Start building your course</h3>
                  <button onClick={() => setIsModuleModalOpen(true)} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-purple-700 transition">
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
              <Image src={course.thumbnail || "https://placehold.co/600x400"} alt="Thumbnail" width={600} height={400} className="w-full h-full object-cover" />
              
              {/* Overlay with Loading State */}
              <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isUploadingThumb ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
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
              <h3 className="font-bold text-gray-900 mb-1 line-clamp-2">{course.title}</h3>
              <p className="text-xs text-gray-500 mb-4 capitalize">{course.category} • {course.level}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                 <span className="text-2xl font-black text-gray-900">₹{course.price}</span>
                 <button className="text-purple-600 text-xs font-bold hover:underline">Edit Details</button>
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
              <button onClick={() => setIsModuleModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX size={24}/></button>
            </div>
            <form onSubmit={handleAddModule}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Section Title</label>
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
                <button type="button" onClick={() => setIsModuleModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancel</button>
                <button type="submit" className="px-5 py-2.5 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-700 transition shadow-lg">Create Section</button>
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
              <h3 className="text-xl font-bold text-gray-900">Add Lecture Content</h3>
              <button onClick={() => setIsLectureModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FiX size={24}/></button>
            </div>
            <form onSubmit={handleAddLecture}>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Lecture Title</label>
                  <input 
                    autoFocus
                    type="text" 
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900 placeholder-gray-400 bg-white"
                    placeholder="e.g. Setting up the environment"
                    value={lectureData.title}
                    onChange={(e) => setLectureData({...lectureData, title: e.target.value})}
                  />
                </div>
                
                {/* Video URL Input OR Upload */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Video Source</label>
                  
                  {/* Option 1: URL */}
                  <div className="flex items-center gap-2 border border-gray-300 rounded-xl p-2 focus-within:ring-2 focus-within:ring-purple-500 transition bg-white mb-3">
                    <FiVideo className="text-gray-400 ml-2" />
                    <input 
                      type="text" 
                      className="w-full p-1 bg-transparent outline-none text-sm text-gray-900 placeholder-gray-400"
                      placeholder="Paste link (YouTube/Vimeo) or upload below"
                      value={lectureData.videoUrl}
                      onChange={(e) => setLectureData({...lectureData, videoUrl: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="h-px bg-gray-200 flex-1"></div>
                    <span className="text-xs text-gray-400 font-bold uppercase">OR UPLOAD</span>
                    <div className="h-px bg-gray-200 flex-1"></div>
                  </div>

                  {/* Option 2: File Upload */}
                  <div className="mt-3 relative border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition cursor-pointer">
                     <input 
                       type="file" 
                       accept="video/*"
                       className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                       onChange={handleVideoFileSelect}
                     />
                     {isUploadingVideo ? (
                        <div className="flex items-center justify-center gap-2 text-purple-600 font-bold text-sm">
                           <span className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full"></span>
                           Uploading video... (Please wait)
                        </div>
                     ) : (
                        <div className="text-gray-500 text-sm">
                           <FiUploadCloud className="mx-auto mb-1 text-gray-400" size={24} />
                           <span className="font-bold text-purple-600">Click to upload</span> MP4/WebM
                        </div>
                     )}
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setIsLectureModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition">Cancel</button>
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
    </TutorLayout>
  );
}