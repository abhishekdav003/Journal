import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import Link from "next/link";
 
function dashboard() {

   const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Auth Protection Logic
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/student?tab=login");
      } else if (user.role !== "student") {
        router.push(`/${user.role}/dashboard`);
      }
    }
  }, [user, loading, router]);

  if (loading || !isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAD7FC]/20">
        <div className="w-12 h-12 border-4 border-[#8834D3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  const displayName = user?.name || "Student";

  // --- DUMMY DATA FOR UI ---
  const activeCourses = [
    { id: 1, title: "Advanced React Patterns", instructor: "Sarah Smith", progress: 75, totalLessons: 20, completed: 15, image: "⚛️" },
    { id: 2, title: "UI/UX Design Fundamentals", instructor: "John Doe", progress: 30, totalLessons: 12, completed: 4, image: "🎨" },
    { id: 3, title: "Node.js Backend Masterclass", instructor: "Mike Johnson", progress: 10, totalLessons: 45, completed: 4, image: "🟢" },
  ];

  const upcomingClasses = [
    { id: 1, subject: "React Hooks Deep Dive", time: "Today, 4:00 PM", tutor: "Sarah Smith", link: "#" },
    { id: 2, subject: "Figma Prototyping", time: "Tomorrow, 10:00 AM", tutor: "John Doe", link: "#" },
  ];
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:flex justify-between items-center border border-purple-100">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2D1B4E] mb-2">
              Hello, {displayName}! 👋
            </h1>
            <p className="text-gray-500 font-medium">
              Ready to continue your learning journey today?
            </p>
          </div>
          <div className="mt-4 md:mt-0">
             <button className="bg-[#8834D3] hover:bg-[#7228b5] text-white px-6 py-3 rounded-xl font-bold shadow-md shadow-purple-200 transition-transform transform active:scale-95">
                Browse New Courses
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default dashboard