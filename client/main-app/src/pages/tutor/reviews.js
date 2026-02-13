import { useEffect, useState } from 'react';
import TutorLayout from '../../components/tutor/TutorLayout';
// IMPORT API SERVICES
import { getTutorReviews, replyToReview } from '../../services/apiService';
import { FiStar, FiMessageSquare, FiCornerDownRight, FiSend } from 'react-icons/fi';
import toast, { Toaster } from 'react-hot-toast';

export default function TutorReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState({});

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await getTutorReviews(); //
      // Assuming res.data.data contains the array of reviews
      setReviews(res.data.data || []);
    } catch (err) {
      console.error("Failed to fetch reviews", err);
      toast.error("Could not load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId) => {
    const text = replyText[reviewId];
    if (!text || !text.trim()) {
        toast.error("Reply cannot be empty");
        return;
    }

    try {
      setSubmittingReply(prev => ({ ...prev, [reviewId]: true }));
      
      // Call API
      await replyToReview(reviewId, { reply: text }); //
      
      toast.success("Reply sent successfully!");
      
      // Update UI instantly without reload
      setReviews(prevReviews => 
        prevReviews.map(rev => 
          rev._id === reviewId ? { ...rev, tutorReply: text } : rev
        )
      );
      
      // Clear input
      setReplyText(prev => ({ ...prev, [reviewId]: '' }));

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to send reply");
    } finally {
      setSubmittingReply(prev => ({ ...prev, [reviewId]: false }));
    }
  };

  // Helper to render stars
  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FiStar 
        key={i} 
        size={16} 
        className={`${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

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
      
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Student Feedback</h1>
        <p className="text-gray-500 mt-1 font-medium">See what your students are saying about your courses.</p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        
        {reviews.length === 0 ? (
           /* Empty State */
           <div className="bg-white p-12 rounded-4xl border border-dashed border-gray-200 text-center shadow-sm">
             <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
               <FiMessageSquare className="text-purple-600 text-2xl" />
             </div>
             <h3 className="text-xl font-bold text-gray-900">No reviews yet</h3>
             <p className="text-gray-500 mt-2">When students enroll and rate your courses, they will appear here.</p>
           </div>
        ) : (
           reviews.map((review) => (
             <div key={review._id} className="bg-white p-8 rounded-4xl shadow-sm border border-gray-100 transition hover:shadow-md">
               
               {/* Review Header */}
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-purple-200 shadow-lg">
                     {review.student?.name?.[0]?.toUpperCase() || 'S'}
                   </div>
                   <div>
                     <h4 className="font-bold text-gray-900 text-lg">{review.student?.name || "Unknown Student"}</h4>
                     <p className="text-xs text-purple-600 font-bold uppercase tracking-wide bg-purple-50 px-2 py-0.5 rounded-md w-fit mt-1">
                        {review.course?.title || "Course Deleted"}
                     </p>
                   </div>
                 </div>
                 
                 <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                   <span className="font-bold text-yellow-700 mr-1">{review.rating}.0</span>
                   <div className="flex gap-0.5">{renderStars(review.rating)}</div>
                 </div>
               </div>
   
               {/* Review Body */}
               <div className="mb-6 relative">
                 <div className="absolute top-0 left-0 text-gray-200 -translate-x-2 -translate-y-2">
                    <span className="text-4xl font-serif">“</span>
                 </div>
                 <p className="text-gray-700 leading-relaxed pl-4 italic bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                    {review.comment}
                 </p>
               </div>
   
               {/* Reply Section */}
               <div className="pl-4 md:pl-8 border-l-2 border-gray-100">
                 {review.tutorReply ? (
                   <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100 relative">
                     <div className="flex items-center gap-2 mb-2 text-purple-800 font-bold text-sm">
                        <FiCornerDownRight /> 
                        <span>Your Reply</span>
                     </div>
                     <p className="text-gray-700 text-sm">{review.tutorReply}</p>
                   </div>
                 ) : (
                   <div className="mt-4">
                     <div className="flex gap-3">
                       <input 
                         type="text" 
                         placeholder="Write a professional reply..." 
                         className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none transition bg-white"
                         value={replyText[review._id] || ''}
                         onChange={(e) => setReplyText({...replyText, [review._id]: e.target.value})}
                       />
                       <button 
                         onClick={() => handleReply(review._id)}
                         disabled={submittingReply[review._id]}
                         className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-black transition flex items-center gap-2 disabled:opacity-70 shadow-lg"
                       >
                         {submittingReply[review._id] ? (
                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                         ) : (
                            <>Reply <FiSend size={14} /></>
                         )}
                       </button>
                     </div>
                     <p className="text-[10px] text-gray-400 mt-2 ml-1">
                        * Be polite and professional. Replies are public.
                     </p>
                   </div>
                 )}
               </div>
             </div>
           ))
        )}
      </div>
    </TutorLayout>
  );
}