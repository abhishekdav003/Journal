"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import { useState } from "react";

const Sidebar = () => {
  const pathname = usePathname();
  const { admin, logout } = useAdmin();
  const [showProfile, setShowProfile] = useState(false);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: "📊", shortName: "Home" },
    { name: "Users", href: "/dashboard/users", icon: "👥", shortName: "Users" },
    {
      name: "Courses",
      href: "/dashboard/courses",
      icon: "📚",
      shortName: "Courses",
    },
    {
      name: "Enrollments",
      href: "/dashboard/enrollments",
      icon: "✅",
      shortName: "Enroll",
    },
    {
      name: "Payments",
      href: "/dashboard/payments",
      icon: "💰",
      shortName: "Pay",
    },
    {
      name: "Reviews",
      href: "/dashboard/reviews",
      icon: "⭐",
      shortName: "Review",
    },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-64 bg-gray-900 text-white min-h-screen flex-col fixed left-0 top-0 z-40">
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold">Admin Panel</h1>
          <p className="text-sm text-gray-400 mt-1">LMS Management</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-800"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{admin?.name}</p>
              <p className="text-xs text-gray-400 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white border-b border-gray-700 z-50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-xs text-gray-400">LMS Management</p>
          </div>
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {admin?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="text-left">
              <p className="text-xs font-medium">{admin?.name}</p>
            </div>
          </button>
        </div>

        {/* Mobile Profile Dropdown */}
        {showProfile && (
          <div className="absolute top-full left-0 right-0 bg-gray-800 border-b border-gray-700 p-4 mt-0">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                {admin?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{admin?.name}</p>
                <p className="text-xs text-gray-400">{admin?.email}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowProfile(false);
                logout();
              }}
              className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-medium text-sm"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 text-white border-t border-gray-700 z-50">
        <nav className="flex items-center justify-around px-2 py-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition min-w-15 ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 active:bg-gray-800"
                }`}
                onClick={() => setShowProfile(false)}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs font-medium">{item.shortName}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
