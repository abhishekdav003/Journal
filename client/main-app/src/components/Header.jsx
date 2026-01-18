import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

export default function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // FIX: Router events se menu close karna (Safe way)
  useEffect(() => {
    const handleRouteChange = () => setIsMobileMenuOpen(false);
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router]);

  const displayName = user?.name || user?.user?.name || "User";

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Teaching", path: "/teaching" },
    { name: "Training", path: "/training" },
    { name: "Research", path: "/research" },
  ];

  const isActive = (path) => router.pathname === path;

  return (
    // FIXED HEADER: White, Shadow, Z-Index 50 (Hamesha upar dikhega)
    <header className=" w-full bg-white shadow-sm border-b border-gray-100 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex justify-between items-center">
        
        {/* --- LEFT: LOGO --- */}
        <Link href="/" className="flex items-center gap-1 group shrink-0">
            <span className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">
                ABC<span className="text-[#8834D3]">Hub</span>
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#8834D3] mt-2 group-hover:animate-pulse"></span>
        </Link>
        
        {/* --- CENTER: DESKTOP NAVIGATION (Pill Design) --- */}
        <nav className="hidden md:flex items-center space-x-2">
          {navItems.map((item) => (
            <Link key={item.name} href={item.path}>
              {/* Pill Style Logic */}
              <span className={`px-4 py-2 rounded-full text-sm font-bold transition-all duration-300 cursor-pointer ${
                isActive(item.path) 
                  ? "bg-purple-50 text-[#8834D3]" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-[#8834D3]" 
              }`}>
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* --- RIGHT: AUTH BUTTONS & HAMBURGER --- */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {user ? (
            /* LOGGED IN STATE */
            <div className="flex items-center gap-2 md:gap-4">
              <Link href={`/${user.role || user.user.role}/dashboard`}> 
                <div className={`flex items-center gap-2 cursor-pointer px-2 py-1 md:px-3 md:py-1.5 rounded-full transition-all hover:bg-gray-50`}>
                    <div className="w-8 h-8 rounded-full bg-[#EAD7FC] flex items-center justify-center text-[#8834D3] font-bold text-xs">
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-gray-700 hidden sm:block">
                        {displayName.split(' ')[0]}
                    </span>
                </div>
              </Link>
              
              <button 
                onClick={logout} 
                className="text-xs md:text-sm font-medium text-gray-500 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            /* LOGGED OUT STATE */
            <>
              <Link href="/auth/student?tab=login">
                <span className="text-gray-600 font-bold text-xs md:text-sm hover:text-[#8834D3] px-2 md:px-3 py-2 cursor-pointer transition-colors">
                  Login
                </span>
              </Link>

              <Link href="/auth/student?tab=register">
                <span className="bg-[#8834D3] text-white px-3 py-1.5 md:px-5 md:py-2.5 rounded-lg font-bold text-xs md:text-sm shadow-md shadow-purple-200 hover:bg-[#7228b5] hover:shadow-lg transition-all cursor-pointer transform active:scale-95">
                  Sign Up
                </span>
              </Link>
            </>
          )}

          {/* Hamburger Button (Right Side, Mobile Only) */}
          <button 
              className="md:hidden text-gray-700 focus:outline-none p-1 ml-1"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
              {isMobileMenuOpen ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
              ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
              )}
          </button>

        </div>
      </div>

      {/* --- MOBILE MENU DROPDOWN (Links Only) --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-gray-100 shadow-xl py-4 px-6 flex flex-col gap-2 animate-in slide-in-from-top-5 fade-in duration-200 z-40">
            {navItems.map((item) => (
                <Link key={item.name} href={item.path}>
                    <span className={`block px-4 py-3 rounded-xl text-sm font-bold transition-colors ${
                        isActive(item.path)
                        ? "bg-purple-50 text-[#8834D3]"
                        : "text-gray-600 hover:bg-gray-50 hover:text-[#8834D3]"
                    }`}>
                        {item.name}
                    </span>
                </Link>
            ))}
        </div>
      )}
      
      {/* Backdrop for Mobile Menu */}
      {isMobileMenuOpen && (
        <div 
            className="fixed inset-0 bg-black/20 mt-16 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
    </header>
  );
}