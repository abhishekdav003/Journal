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
      <div className="group bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-800/50 hover:border-purple-500/40 hover:shadow-xl hover:shadow-purple-900/30 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full relative">
        
        {/* Thumbnail Area */}
        <div className="relative h-40 sm:h-48 w-full overflow-hidden bg-[#2B2B40]">
          <Image
            src={course.thumbnail || "https://placehold.co/600x400?text=No+Image"} 
            alt={course.title} 
            width={600}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
          
          {/* Status Badge */}
          <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
            <span className={`px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 border ${
              course.isPublished ? 'bg-green-600/20 text-green-400 border-green-500/50' : 'bg-gray-600/20 text-gray-400 border-gray-500/50'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${course.isPublished ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></span>
              {course.isPublished ? 'Live' : 'Draft'}
            </span>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-[#2B2B40]/90 backdrop-blur-sm px-2.5 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-bold shadow-sm text-purple-400 border border-purple-500/30">
            {course.price > 0 ? `₹${course.price}` : 'Free'}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="p-4 sm:p-5 flex-1 flex flex-col">
          <div className="flex justify-between items-start mb-2 gap-2">
            <span className="text-[10px] font-bold text-purple-400 bg-purple-600/20 px-2 py-1 rounded-md uppercase tracking-wide border border-purple-500/50">
              {course.category || 'General'}
            </span>
            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium shrink-0">
              <FiBook size={12} /> {course.modules?.length || 0}
            </div>
          </div>

          <div className="flex items-start gap-2 mb-2">
            <h3 className="font-bold text-white text-base sm:text-lg line-clamp-1 flex-1 group-hover:text-purple-300 transition-colors">
              {course.title}
            </h3>
            <button
              onClick={() => onQuickEdit(course)}
              className="p-1 text-gray-400 hover:text-purple-400 hover:bg-purple-600/20 rounded-lg transition-all duration-300"
              title="Quick edit title"
            >
              <FiEdit2 size={14} />
            </button>
          </div>
          
          <p className="text-gray-400 text-xs font-medium mb-4 line-clamp-2 flex-1">
            {course.description || "No description provided."}
          </p>
          
          {/* Student Count */}
          {course.enrolledStudents?.length > 0 && (
            <div className="mb-4 px-3 py-1.5 bg-blue-600/20 rounded-lg text-xs font-semibold text-blue-400 flex items-center gap-1 border border-blue-500/50 w-fit">
              👥 {course.enrolledStudents.length} {course.enrolledStudents.length === 1 ? 'Student' : 'Students'}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-4 border-t border-gray-800/50 mt-auto">
            <Link href={`/tutor/courses/${course._id}`} className="flex-1">
              <button className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold transition-all duration-300 active:scale-95">
                <FiEdit3 size={16} /> Manage
              </button>
            </Link>
            
            <button 
              onClick={() => onTogglePublish(course._id, course.isPublished)} 
              className={`p-2.5 border rounded-xl transition-all duration-300 ${
                course.isPublished 
                  ? 'border-gray-700/50 text-gray-400 hover:text-red-400 hover:bg-red-600/20 hover:border-red-500/50' 
                  : 'border-gray-700/50 text-gray-400 hover:text-green-400 hover:bg-green-600/20 hover:border-green-500/50'
              }`}
              title={course.isPublished ? "Unpublish Course" : "Publish Course"}
            >
              {course.isPublished ? <FiEyeOff size={18}/> : <FiEye size={18}/>}
            </button>

            <button 
              onClick={handleDeleteClick}
              className="p-2.5 border border-gray-700/50 text-gray-400 hover:text-red-400 hover:bg-red-600/20 hover:border-red-500/50 rounded-xl transition-all duration-300"
              title="Delete Course"
            >
              <FiTrash2 size={18}/>
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] rounded-2xl lg:rounded-3xl p-6 max-w-md w-full shadow-2xl shadow-purple-900/30 border border-gray-800/50" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center border border-red-500/50">
                <FiTrash2 className="text-red-400 text-xl" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white">Delete Course?</h3>
                <p className="text-xs sm:text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-[#2B2B40]/50 rounded-xl p-4 mb-6 border border-gray-800/50">
              <p className="text-xs sm:text-sm text-gray-300 mb-3">
                <strong className="text-white">Course:</strong> {course.title}
              </p>
              {course.enrolledStudents?.length > 0 && (
                <p className="text-xs sm:text-sm text-red-400 font-semibold">
                  ⚠️ {course.enrolledStudents.length} student(s) enrolled. Cannot delete.
                </p>
              )}
            </div>

            {course.enrolledStudents?.length > 0 ? (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
                >
                  Close
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all duration-300 active:scale-95"
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