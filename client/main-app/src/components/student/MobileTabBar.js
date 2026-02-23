import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiGrid, FiBookOpen, FiCreditCard, FiUser } from 'react-icons/fi';

const menuItems = [
  { name: 'Dashboard', path: '/student/profile', icon: FiGrid, label: 'Home' },
  { name: 'Courses', path: '/student/courses', icon: FiBookOpen, label: 'Courses' },
  { name: 'Payments', path: '/student/payments', icon: FiCreditCard, label: 'Payments' },
  { name: 'Profile', path: '/student/public-profile', icon: FiUser, label: 'Profile' },
];

export default function MobileTabBar() {
  const router = useRouter();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1a1a2e] border-t border-gray-700 shadow-2xl">
      <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
        {menuItems.map((item) => {
          const isActive = router.pathname === item.path || router.pathname.startsWith(item.path + '/');
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.path}>
              <div className={`flex flex-col items-center justify-center px-3 py-2 rounded-xl transition-all duration-200 min-w-15 ${
                isActive 
                  ? 'text-purple-500' 
                  : 'text-gray-400'
              }`}>
                <div className={`p-2 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-purple-500/20 scale-110' 
                    : 'hover:bg-gray-700/50'
                }`}>
                  <Icon size={20} strokeWidth={2.5} />
                </div>
                <span className={`text-[10px] font-bold mt-1 ${
                  isActive ? 'text-purple-500' : 'text-gray-400'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute -top-0.5 w-8 h-1 bg-purple-500 rounded-full"></div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
