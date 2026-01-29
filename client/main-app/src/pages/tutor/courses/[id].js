import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
// CHANGE: Import API functions instead of raw axios
import { getCourse, addModule } from '../../../services/apiService'; 
import TutorLayout from '../../../components/tutor/TutorLayout';

export default function ManageCourseContent() {
  const router = useRouter();
  const { id } = router.query;
  const [course, setCourse] = useState(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [loading, setLoading] = useState(true);

  // Quick client-side check: ensure token exists before making protected requests
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    console.log('Course page token:', token);
    if (!token) {
      // Avoid confusing repeated 404s from server when unauthenticated
      alert('You must be logged in to manage courses. Redirecting to login.');
      router.push('/auth/student?tab=login');
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchCourseData(id);
    }
  }, [id]);

  const fetchCourseData = async (courseId) => {
    try {
      setLoading(true);
      // This call now includes your Token, so the server knows you are the owner
      const res = await getCourse(courseId);
      setCourse(res.data.data.course);
    } catch (err) {
      console.error("Failed to fetch course", err);
      // If unauthorized or not found, go back
      if (err.response && (err.response.status === 404 || err.response.status === 401)) {
        alert("Course not found or access denied.");
        router.push('/tutor/courses');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim()) return;
    try {
      const res = await addModule(id, { title: newModuleTitle });
      // Update local state with new module list
      setCourse({ ...course, modules: res.data.data });
      setNewModuleTitle('');
    } catch (err) {
      alert("Error adding module");
    }
  };

  if (loading) return <TutorLayout><div className="p-8">Loading...</div></TutorLayout>;
  if (!course) return null;

  return (
    <TutorLayout>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
            <p className="text-gray-500">Manage curriculum and content</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {course.isPublished ? 'Published' : 'Draft Mode'}
          </span>
        </div>

        {/* Module Creator */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8 border border-gray-100">
          <h3 className="font-bold text-lg mb-4">Add Curriculum Module</h3>
          <div className="flex gap-4">
            <input 
              className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
              placeholder="Module Title (e.g. 'Chapter 1: Basics')" 
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
            />
            <button 
              onClick={handleAddModule} 
              className="bg-purple-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-700 transition"
            >
              Add Module
            </button>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-6">
          {course.modules?.length > 0 ? (
            course.modules.map((module, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                  <h4 className="font-bold text-gray-800">Module {index + 1}: {module.title}</h4>
                  <button className="text-purple-600 text-sm font-medium hover:underline">+ Add Video</button>
                </div>
                <div className="p-8 text-center">
                  <p className="text-gray-400 text-sm italic">No lectures in this module yet.</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-500">No modules created yet. Start by adding one above!</p>
            </div>
          )}
        </div>
      </div>
    </TutorLayout>
  );
}