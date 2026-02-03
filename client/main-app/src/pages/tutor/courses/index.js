import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getTutorCourses, togglePublishCourse, deleteCourse, updateCourse } from '../../../services/apiService';
import TutorLayout from '../../../components/tutor/TutorLayout';
// IMPORT COURSE CARD
import CourseCard from '../../../components/tutor/CourseCard'; 
import { FiPlus, FiBook, FiSearch, FiX } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

export default function MyCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await getTutorCourses();
      setCourses(res.data?.data?.courses || res.data?.courses || []);
    } catch (err) {
      console.error("Error fetching courses", err);
      toast.error("Failed to load your courses");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await togglePublishCourse(id);
      setCourses(courses.map(c => 
        c._id === id ? { ...c, isPublished: !currentStatus } : c
      ));
      toast.success(currentStatus ? "Course unpublished" : "Course is now Live!");
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteCourse = async (courseId) => {
    const deletePromise = deleteCourse(courseId);
    
    toast.promise(deletePromise, {
      loading: 'Deleting course and media from Cloudinary...',
      success: 'Course deleted successfully!',
      error: (err) => err.response?.data?.message || 'Failed to delete course'
    });

    try {
      await deletePromise;
      setCourses(courses.filter(course => course._id !== courseId));
    } catch (error) {
      // Error already handled by toast.promise
    }
  };

  const handleQuickEdit = (course) => {
    setEditingCourse(course);
    setNewTitle(course.title);
    setShowEditModal(true);
  };

  const handleSaveTitle = async () => {
    if (!newTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    if (newTitle === editingCourse.title) {
      setShowEditModal(false);
      return;
    }

    setUpdating(true);
    try {
      await updateCourse(editingCourse._id, { title: newTitle });
      setCourses(courses.map(course => 
        course._id === editingCourse._id 
          ? { ...course, title: newTitle } 
          : course
      ));
      toast.success('Course title updated successfully!');
      setShowEditModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update title');
    } finally {
      setUpdating(false);
    }
  };

  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <TutorLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </TutorLayout>
    );
  }

  return (
    <TutorLayout>
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Courses</h1>
          <p className="text-gray-500 font-medium mt-1">Manage, edit, and track your content.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <FiSearch className="absolute left-3 top-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search courses..." 
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition shadow-sm text-gray-900 placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Link href="/tutor/courses/create">
            <button className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-purple-200 transition transform active:scale-95 whitespace-nowrap w-full sm:w-auto">
              <FiPlus size={20} /> New Course
            </button>
          </Link>
        </div>
      </div>

      {/* Courses Grid using Component */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <CourseCard 
              key={course._id} 
              course={course} 
              onTogglePublish={handleTogglePublish}
              onDelete={handleDeleteCourse}
              onQuickEdit={handleQuickEdit}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200 text-center">
          <div className="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
            <FiBook className="text-purple-600 text-3xl" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {searchTerm ? "No courses found" : "No courses created yet"}
          </h3>
          <p className="text-gray-500 max-w-md mb-8">
            {searchTerm 
              ? `We couldn't find any courses matching "${searchTerm}".` 
              : "Start your teaching journey by creating your first curriculum. It only takes a few minutes!"}
          </p>
          <Link href="/tutor/courses/create">
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-purple-200 transition">
              Create Your First Course
            </button>
          </Link>
        </div>
      )}

      {/* Quick Edit Title Modal */}
      {showEditModal && editingCourse && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Edit Course Title</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none transition text-gray-900"
                placeholder="Enter course title"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !updating) {
                    handleSaveTitle();
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-2">
                Original: <span className="font-semibold">{editingCourse.title}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={updating}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTitle}
                disabled={updating || !newTitle.trim()}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {updating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </TutorLayout>
  );
}