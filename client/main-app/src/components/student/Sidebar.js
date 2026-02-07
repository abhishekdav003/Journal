import Link from "next/link";
import { useRouter } from "next/router";
import {
  FiGrid,
  FiBookOpen,
  FiCreditCard,
  FiUser,
  FiCamera,
  FiShield,
  FiXCircle,
} from "react-icons/fi";

const Sidebar = () => {
  const router = useRouter();

  const menuItems = [
    { name: "Dashboard", icon: FiGrid, href: "/user/profile" },
    { name: "Courses", icon: FiBookOpen, href: "/user/courses" },
    { name: "Payments", icon: FiCreditCard, href: "/user/payments" },
    { name: "Profile", icon: FiUser, href: "/user/public-profile" },
    { name: "Photo", icon: FiCamera, href: "/user/photo" },
    { name: "Account Security", icon: FiShield, href: "/user/account-security" },
    { name: "Close Account", icon: FiXCircle, href: "/user/close-account", danger: true },
  ];

  const isActive = (path) => router.asPath === path;

  return (
    <aside className="sticky top-0 left-0 min-h-screen w-16 md:w-64 shrink-0 flex flex-col border-r border-gray-800 bg-[#181824] p-3 text-gray-400 transition-all duration-300 md:p-6">

      <div>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <Link key={item.name} href={item.href}>
              <span
                className={`flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 cursor-pointer font-medium ${
                  item.danger
                    ? "hover:bg-red-500/10 hover:text-red-400 text-gray-400"
                    : isActive(item.href)
                    ? "bg-[#6D28D9] text-white"
                    : "hover:bg-[#2B2B40] hover:text-white"
                }`}
              >
                <div className="flex items-center justify-center">
                  <item.icon
                    className={`w-5 h-5 ${
                      item.danger
                        ? "text-gray-400"
                        : isActive(item.href)
                        ? "text-white"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <span className="hidden md:inline text-sm">{item.name}</span>
              </span>
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;