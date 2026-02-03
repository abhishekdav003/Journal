import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, BookOpen, Users, IndianRupee, Star, UserCircle } from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', path: '/tutor/dashboard', icon: LayoutDashboard, label: 'Home' },
  { name: 'Courses', path: '/tutor/courses', icon: BookOpen, label: 'Courses' },
  { name: 'Learners', path: '/tutor/learners', icon: Users, label: 'Students' },
  { name: 'Payments', path: '/tutor/payments', icon: IndianRupee, label: 'Payments' },
  { name: 'Profile', path: '/tutor/profile', icon: UserCircle, label: 'Profile' },
];

export default function MobileTabBar() {
  const router = useRouter();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path || router.pathname.startsWith(item.path + '/');
          return (
            <Link key={item.name} href={item.path}>
              <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 min-w-15 ${
                isActive 
                  ? 'text-purple-600' 
                  : 'text-gray-400'
              }`}>
                <div className={`p-2 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-purple-50 scale-110' 
                    : 'hover:bg-gray-50'
                }`}>
                  <item.icon size={20} strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] font-bold mt-1 ${
                  isActive ? 'text-purple-600' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -top-0.5 w-8 h-1 bg-purple-600 rounded-full"></div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
