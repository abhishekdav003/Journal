import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  FiUser,
  FiShoppingCart,
  FiSettings,
  FiCreditCard,
  FiLogOut,
  FiSearch,
  FiX,
} from "react-icons/fi";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [storageUser, setStorageUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);

  // Listen for auth updates (login, profile changes)
  useEffect(() => {
    const handleAuthUpdate = (e) => {
      try {
        // Handle custom auth-update event (same window)
        if (e.type === "auth-update" && e.detail) {
          setStorageUser(e.detail);
        } else {
          // Handle storage event (cross-window or manual localStorage changes)
          const storedUser = localStorage.getItem("user");
          if (storedUser && storedUser !== "undefined") {
            const parsed = JSON.parse(storedUser);
            setStorageUser(parsed?.user || parsed);
          }
        }
      } catch (e) {
        // Silently fail
      }
    };

    window.addEventListener("auth-update", handleAuthUpdate);
    window.addEventListener("storage", handleAuthUpdate);

    return () => {
      window.removeEventListener("auth-update", handleAuthUpdate);
      window.removeEventListener("storage", handleAuthUpdate);
    };
  }, []);

  // Router events se menu close karna
  useEffect(() => {
    const handleRouteChange = () => {
      setIsMobileMenuOpen(false);
      setShowUserDropdown(false);
    };
    router.events.on("routeChangeStart", handleRouteChange);
    return () => {
      router.events.off("routeChangeStart", handleRouteChange);
    };
  }, [router]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Derive current user from storage or auth context (no state update in effect)
  const currentUser = useMemo(() => {
    return storageUser || user?.user || user || null;
  }, [storageUser, user]);

  const displayName = currentUser?.name || currentUser?.email || "User";

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Courses", path: "/courses" },
    { name: "Teaching", path: "/teaching" },
    { name: "Training", path: "/training" },
  ];

  const isActive = (path) => router.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/courses?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    // FIX 1: Removed 'overflow-hidden' form header tag.
    // Added 'z-50' to keep header on top.
    <header className="w-full bg-linear-to-r from-[#1E1E2E] via-[#2B2B40] to-[#1E1E2E] shadow-xl border-b border-gray-800 font-sans relative z-50">
      {/* FIX 2: Moved Background decorations into a separate absolute div with overflow-hidden.
          This keeps the blobs inside the header area without cutting off the dropdowns. */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="absolute -right-20 -top-10 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-10 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center relative z-10">
        {/* --- LEFT: LOGO --- */}
        <Link href="/" className="flex items-center gap-1 group shrink-0">
          <span className="text-xl md:text-2xl font-bold tracking-tight bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Journal
          </span>
        </Link>

        {/* --- CENTER: DESKTOP NAVIGATION (Pill Design) + SEARCH --- */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Navigation */}
          <nav className="flex items-center space-x-2">
            {navItems.map((item) => (
              <Link key={item.name} href={item.path}>
                <span
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                    isActive(item.path)
                      ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                      : "text-gray-300 hover:bg-[#2B2B40] hover:text-white"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 bg-[#2B2B40] rounded-full px-4 py-2 hover:bg-[#3B3B50] transition-all"
          >
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-white placeholder-gray-400 outline-none text-sm w-32"
            />
          </form>
        </div>

        {/* --- RIGHT: AUTH BUTTONS & HAMBURGER --- */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Mobile Search Icon */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="md:hidden text-gray-300 hover:text-white transition-all"
          >
            <FiSearch size={20} />
          </button>

          {currentUser ? (
            /* LOGGED IN STATE */
            <div
              className="relative"
              ref={dropdownRef}
              onMouseEnter={() => {
                if (window.innerWidth >= 768) setShowUserDropdown(true);
              }}
              onMouseLeave={() => {
                if (window.innerWidth >= 768) setShowUserDropdown(false);
              }}
            >
              {/* User Profile Trigger */}
              <div
                onClick={(e) => {
                  // FIX 3: Simply toggle on click for mobile.
                  // Desktop uses hover, but click can also toggle or navigate.
                  if (window.innerWidth < 768) {
                    e.stopPropagation(); // Prevent immediate close
                    setShowUserDropdown(!showUserDropdown);
                  } else {
                    // Optional: Navigate on desktop click
                    // window.location.href = "/user/public-profile";
                  }
                }}
                className="flex items-center gap-2 cursor-pointer px-2 py-1 md:px-3 md:py-1.5 rounded-full transition-all hover:bg-[#2B2B40]"
              >
                {currentUser?.avatar ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-purple-500/30 hover:ring-purple-400 transition-all">
                    <Image
                      src={currentUser.avatar}
                      alt={displayName}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#EAD7FC] flex items-center justify-center text-[#8834D3] font-bold text-xs ring-2 ring-purple-500/30 hover:ring-purple-400 transition-all">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                {/* Show name only on desktop */}
                <span className="hidden md:inline text-sm font-semibold text-white max-w-30 truncate">
                  {displayName.split(" ")[0]}
                </span>
              </div>

              {/* Dropdown Menu */}
              {showUserDropdown && (
                <div className="absolute right-0 top-full pt-2 z-50">
                  <div className="w-72 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info Section */}
                    <div className="p-4 border-b border-gray-200 bg-linear-to-r from-purple-50 to-white">
                      <div className="flex items-center gap-3">
                        {currentUser?.avatar ? (
                          <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-purple-200">
                            <Image
                              src={currentUser.avatar}
                              alt={displayName}
                              width={56}
                              height={56}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-14 h-14 rounded-full bg-linear-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 truncate text-base">
                            {displayName}
                          </div>
                          <div className="text-sm text-gray-600 truncate">
                            {currentUser?.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {currentUser?.role === "tutor" ? (
                        // Tutor Menu Items
                        <>
                          <Link href="/tutor/dashboard">
                            <div className="px-4 py-2.5 hover:bg-purple-50 cursor-pointer flex items-center gap-3 text-gray-700 hover:text-purple-700 transition-all group">
                              <FiUser size={18} />
                              <span className="text-sm font-medium">
                                Dashboard
                              </span>
                            </div>
                          </Link>
                          <Link href="/tutor/courses">
                            <div className="px-4 py-2.5 hover:bg-purple-50 cursor-pointer flex items-center gap-3 text-gray-700 hover:text-purple-700 transition-all group">
                              <FiShoppingCart size={18} />
                              <span className="text-sm font-medium">
                                My Courses
                              </span>
                            </div>
                          </Link>
                          <Link href="/tutor/earnings">
                            <div className="px-4 py-2.5 hover:bg-purple-50 cursor-pointer flex items-center gap-3 text-gray-700 hover:text-purple-700 transition-all group">
                              <FiCreditCard size={18} />
                              <span className="text-sm font-medium">
                                Earnings
                              </span>
                            </div>
                          </Link>
                          <Link href="/tutor/settings">
                            <div className="px-4 py-2.5 hover:bg-purple-50 cursor-pointer flex items-center gap-3 text-gray-700 hover:text-purple-700 transition-all group">
                              <FiSettings size={18} />
                              <span className="text-sm font-medium">
                                Settings
                              </span>
                            </div>
                          </Link>
                        </>
                      ) : (
                        // Student Menu Items
                        <>
                          <Link href="/user/profile">
                            <div className="px-4 py-2.5 hover:bg-purple-50 cursor-pointer flex items-center gap-3 text-gray-700 hover:text-purple-700 transition-all group">
                              <FiUser size={18} />
                              <span className="text-sm font-medium">
                                Profile
                              </span>
                            </div>
                          </Link>
                          <Link href="/user/courses">
                            <div className="px-4 py-2.5 hover:bg-purple-50 cursor-pointer flex items-center gap-3 text-gray-700 hover:text-purple-700 transition-all group">
                              <FiShoppingCart size={18} />
                              <span className="text-sm font-medium">
                                My Courses
                              </span>
                            </div>
                          </Link>
                          <Link href="/user/payments">
                            <div className="px-4 py-2.5 hover:bg-purple-50 cursor-pointer flex items-center gap-3 text-gray-700 hover:text-purple-700 transition-all group">
                              <FiCreditCard size={18} />
                              <span className="text-sm font-medium">
                                Payments
                              </span>
                            </div>
                          </Link>
                          <Link href="/user/settings">
                            <div className="px-4 py-2.5 hover:bg-purple-50 cursor-pointer flex items-center gap-3 text-gray-700 hover:text-purple-700 transition-all group">
                              <FiSettings size={18} />
                              <span className="text-sm font-medium">
                                Settings
                              </span>
                            </div>
                          </Link>
                        </>
                      )}
                    </div>

                    {/* Logout Button */}
                    <div className="border-t border-gray-200">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          logout();
                        }}
                        className="w-full px-4 py-3 hover:bg-red-50 text-left flex items-center gap-3 text-red-600 hover:text-red-700 transition-all group"
                      >
                        <FiLogOut size={18} />
                        <span className="text-sm font-semibold">Logout</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* LOGGED OUT STATE */
            <>
              <Link href="/auth/student?tab=login">
                <span className="text-gray-300 font-bold text-xs md:text-sm hover:text-purple-400 px-2 md:px-3 py-2 cursor-pointer transition-all duration-200">
                  Login
                </span>
              </Link>

              <Link href="/auth/student?tab=register">
                <span className="bg-linear-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg font-bold text-xs md:text-sm shadow-lg shadow-purple-500/50 hover:shadow-xl hover:shadow-purple-500/70 hover:scale-105 transition-all cursor-pointer">
                  Sign Up
                </span>
              </Link>
            </>
          )}

          {/* Hamburger Button (Right Side, Mobile Only) */}
          <button
            className="md:hidden text-white focus:outline-none p-1 ml-1 hover:bg-[#2B2B40] rounded-lg transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-7 h-7"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* --- MOBILE MENU DROPDOWN --- */}
      {isMobileMenuOpen && (
        <div className="absolute top-16 left-0 w-full bg-[#1E1E2E] border-b border-gray-800 shadow-xl py-4 px-6 flex flex-col gap-2 animate-in slide-in-from-top-5 fade-in duration-200 z-40 md:hidden">
          {navItems.map((item) => (
            <Link key={item.name} href={item.path}>
              <span
                className={`block px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive(item.path)
                    ? "bg-purple-600 text-white shadow-lg shadow-purple-500/50"
                    : "text-gray-300 hover:bg-[#2B2B40] hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
              >
                {item.name}
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Backdrop for Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/60 mt-16 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}
