import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { FiBook, FiEdit3, FiEye, FiEyeOff, FiTrash2, FiEdit2 } from 'react-icons/fi';

export default function CourseCard({ course, onTogglePublish, onDelete, onQuickEdit }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete(course._id);
    setShowDeleteConfirm(false);
  };

  return (
    <>
      <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
        
        {/* Thumbnail Area */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <Image
            src={course.thumbnail || "https://placehold.co/600x400?text=No+Image"} 
            alt={course.title} 
            width={600}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          
          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 ${
              course.isPublished ? 'bg-green-500 text-white' : 'bg-gray-800 text-white'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${course.isPublished ? 'bg-white animate-pulse' : 'bg-gray-400'}`}></span>
              {course.isPublished ? 'Live' : 'Draft'}
            </span>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold shadow-sm text-gray-800">
            {course.price > 0 ? `₹${course.price}` : 'Free'}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md uppercase tracking-wide">
              {course.category || 'General'}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
              <FiBook size={12} /> {course.modules?.length || 0} Sections
            </div>
          </div>

          <div className="flex items-start gap-2 mb-1">
            <h3 className="font-bold text-gray-900 text-lg line-clamp-1 flex-1 group-hover:text-purple-600 transition-colors">
              {course.title}
            </h3>
            <button
              onClick={() => onQuickEdit(course)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Quick edit title"
            >
              <FiEdit2 size={14} />
            </button>
          </div>
          
          <p className="text-gray-500 text-xs font-medium mb-4 line-clamp-2 flex-1">
            {course.description || "No description provided."}
          </p>
          
          {/* Student Count */}
          {course.enrolledStudents?.length > 0 && (
            <div className="mb-3 px-3 py-1.5 bg-blue-50 rounded-lg text-xs font-semibold text-blue-700 flex items-center gap-1">
              👥 {course.enrolledStudents.length} {course.enrolledStudents.length === 1 ? 'Student' : 'Students'}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t border-gray-50 mt-auto">
            <Link href={`/tutor/courses/${course._id}`} className="flex-1">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                <FiEdit3 size={16} /> Manage
              </button>
            </Link>
            
            <button 
              onClick={() => onTogglePublish(course._id, course.isPublished)} 
              className={`p-2.5 border rounded-xl transition-colors ${
                course.isPublished 
                  ? 'border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50' 
                  : 'border-gray-200 text-gray-400 hover:text-green-600 hover:bg-green-50'
              }`}
              title={course.isPublished ? "Unpublish Course" : "Publish Course"}
            >
              {course.isPublished ? <FiEyeOff size={18}/> : <FiEye size={18}/>}
            </button>

            <button 
              onClick={handleDeleteClick}
              className="p-2.5 border border-gray-200 text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl transition-colors"
              title="Delete Course"
            >
              <FiTrash2 size={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiTrash2 className="text-red-600 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Delete Course?</h3>
                <p className="text-sm text-gray-500">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700 mb-2">
                <strong className="text-gray-900">Course:</strong> {course.title}
              </p>
              {course.enrolledStudents?.length > 0 && (
                <p className="text-sm text-red-600 font-semibold">
                  ⚠️ {course.enrolledStudents.length} student(s) enrolled. Cannot delete.
                </p>
              )}
            </div>

            {course.enrolledStudents?.length > 0 ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}