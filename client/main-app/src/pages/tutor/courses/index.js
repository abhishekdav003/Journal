import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getTutorCourses, togglePublishCourse } from '../../../services/apiService';
import TutorLayout from '../../../components/tutor/TutorLayout';
// IMPORT COURSE CARD
import CourseCard from '../../../components/tutor/CourseCard'; 
import { FiPlus, FiBook, FiSearch } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

export default function MyCourses() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    </TutorLayout>
  );
}