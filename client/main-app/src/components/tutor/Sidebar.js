import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, BookOpen, Users, IndianRupee, Star, UserCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { name: 'Dashboard', path: '/tutor/dashboard', icon: LayoutDashboard },
  { name: 'My Courses', path: '/tutor/courses', icon: BookOpen },
  { name: 'Learners', path: '/tutor/learners', icon: Users },
  { name: 'Payments', path: '/tutor/payments', icon: IndianRupee },
  { name: 'Reviews', path: '/tutor/reviews', icon: Star },
  { name: 'Profile', path: '/tutor/profile', icon: UserCircle },
];

export default function TutorSidebar() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="w-64 lg:w-68 bg-white h-screen border-r border-gray-100 p-6 flex flex-col overflow-y-auto">
      
      {/* Header with Logo/Branding */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Journal</h2>
        <p className="text-xs text-gray-500 mt-0.5">Tutor Panel</p>
      </div>

      {/* User Info Card */}
      {user && (
        <div className="mb-6 p-4 bg-linear-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-base shrink-0">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-gray-900 text-base truncate">{user.name}</p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path || router.pathname.startsWith(item.path + '/');
          return (
            <Link key={item.name} href={item.path}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                isActive 
                ? 'bg-purple-50 text-purple-700 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <item.icon size={20} className={`shrink-0 ${isActive ? 'text-purple-600' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="font-semibold text-base">{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-purple-600 rounded-full shrink-0"></div>}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer - Version info */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">
          Journal Learning Platform
          <br />
          <span className="text-[10px]">v2.0 • Tutor Dashboard</span>
        </p>
      </div>
    </div>
  );
}