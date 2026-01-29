import Link from 'next/link';
import { useRouter } from 'next/router';
import { LayoutDashboard, BookOpen, Users, IndianRupee, Star, UserCircle } from 'lucide-react';

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

  return (
    <div className="w-68 bg-white h-screen border-r border-gray-100 sticky left-0 top-0 p-6 z-50">
      
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path;
          return (
            <Link key={item.name} href={item.path}>
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group ${
                isActive 
                ? 'bg-purple-50 text-purple-700 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
                <item.icon size={20} className={`${isActive ? 'text-purple-600' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="font-semibold text-sm">{item.name}</span>
                {isActive && <div className="ml-auto w-1.5 h-1.5 bg-purple-600 rounded-full"></div>}
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}