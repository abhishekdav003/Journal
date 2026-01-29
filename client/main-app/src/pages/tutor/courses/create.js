import { useState } from 'react';
import { useRouter } from 'next/router'; // Use Next.js router
import { createCourse } from '../../../services/apiService'; // IMPORT FROM SERVICE
import TutorLayout from '../../../components/tutor/TutorLayout';

export default function CreateCourse() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'programming',
    level: 'beginner',
    price: 0,
    thumbnail: 'https://placehold.co/600x400' // Placeholder for now
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call now includes the Token automatically
      await createCourse(formData);
      alert("Course created successfully!");
      router.push('/tutor/courses');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create course");
    }
  };

  return (
    <TutorLayout>
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6">Create New Course</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
            <input 
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none" 
              placeholder="e.g. Master Next.js 14" 
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-purple-500 outline-none" 
              placeholder="What will students learn?" 
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              required 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select 
                className="w-full p-3 border rounded-lg" 
                onChange={(e) => setFormData({...formData, level: e.target.value})}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
              <input 
                type="number" 
                className="w-full p-3 border rounded-lg" 
                placeholder="0 for Free" 
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required 
              />
            </div>
          </div>
          
          <button type="submit" className="w-full bg-purple-600 text-white p-3 rounded-lg font-bold hover:bg-purple-700 transition">
            Create Course
          </button>
        </form>
      </div>
    </TutorLayout>
  );
}