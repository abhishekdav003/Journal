import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { LayoutDashboard, BookOpen, Users, IndianRupee, Star, UserCircle, LogOut } from 'lucide-react';
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
  const { user, logout } = useAuth();

  return (
    <div className="h-screen w-full flex flex-col bg-linear-to-b from-[#1E1E2E] to-[#161620] border-r border-gray-800/50">
      
      {/* Top Section - Logo & User Info */}
      <div className="flex flex-col shrink-0 px-6 py-4 space-y-4 border-b border-gray-800/30">
        {/* Tutor Dashboard Header */}
        <div className="text-center">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Tutor</p>
          <p className="text-xl font-bold bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Dashboard</p>
        </div>

        {/* User Info Card */}
        {user && (
          <div className="p-4 bg-linear-to-br from-purple-900/40 to-pink-900/40 rounded-xl border border-purple-500/30 hover:border-purple-500/50 transition-all">
            <div className="flex items-center gap-3">
              {user?.avatar ? (
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-purple-500/30">
                  <Image
                    src={user.avatar}
                    alt={user?.name || 'Tutor avatar'}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 bg-linear-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white text-sm truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path || router.pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-linear-to-r from-purple-600 to-pink-500 text-white shadow-lg shadow-purple-500/30' 
                  : 'text-gray-400 hover:text-purple-300 hover:bg-gray-800/30'
              }`}
            >
              <Icon size={20} className="shrink-0" />
              <span className="font-semibold text-sm">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section - Logout & Footer */}
      <div className="flex flex-col shrink-0 px-3 py-6 space-y-4 border-t border-gray-800/30">
        {/* Logout Button */}
        <button 
          onClick={() => logout()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 font-semibold text-sm border border-red-500/20 hover:border-red-500/40 transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>

      </div>
    </div>
  );
}
