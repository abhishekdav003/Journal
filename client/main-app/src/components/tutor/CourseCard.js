import Image from 'next/image';
import Link from 'next/link';
import { FiBook, FiEdit3, FiEye, FiEyeOff } from 'react-icons/fi';

export default function CourseCard({ course, onTogglePublish }) {
  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full">
      
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

        <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-1 group-hover:text-purple-600 transition-colors">
          {course.title}
        </h3>
        <p className="text-gray-500 text-xs font-medium mb-4 line-clamp-2 flex-1">
          {course.description || "No description provided."}
        </p>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-50 mt-auto">
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
        </div>
      </div>
    </div>
  );
}