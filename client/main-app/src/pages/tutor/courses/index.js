import { useEffect, useState } from 'react';
import { getTutorCourses, togglePublishCourse } from '../../../services/apiService'; // IMPORT SERVICE
import TutorLayout from '../../../components/tutor/TutorLayout';
import Link from 'next/link';

export default function MyCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await getTutorCourses();
      setCourses(res.data.data.courses);
    } catch (err) {
      console.error("Error fetching courses", err);
    }
  };

  const handleToggle = async (id) => {
    try {
      await togglePublishCourse(id);
      // Refresh local state to show new status
      setCourses(courses.map(c => c._id === id ? { ...c, isPublished: !c.isPublished } : c));
    } catch (err) {
      alert("Failed to update status");
    }
  };

  return (
    <TutorLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Courses</h1>
        <Link href="/tutor/courses/create">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
            + Create New Course
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map(course => (
          <div key={course._id} className="bg-white rounded-xl shadow p-4 border border-gray-100">
            <div className="h-32 bg-gray-200 rounded-lg mb-4 overflow-hidden">
               {/* Use actual thumbnail if available */}
               <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
            </div>
            <h3 className="font-semibold text-lg mb-1 truncate">{course.title}</h3>
            <p className="text-gray-500 text-sm mb-4 capitalize">{course.level}</p>
            
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${course.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {course.isPublished ? 'Published' : 'Draft'}
              </span>
              
              <div className="flex gap-3">
                <button onClick={() => handleToggle(course._id)} className="text-sm text-gray-500 hover:text-purple-600">
                  {course.isPublished ? 'Unpublish' : 'Publish'}
                </button>
                <Link href={`/tutor/courses/${course._id}`} className="text-sm text-purple-600 font-medium hover:underline">
                  Manage
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </TutorLayout>
  );
}