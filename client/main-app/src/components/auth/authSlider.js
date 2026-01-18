import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

export default function AuthSlider({ role, activeTab }) {
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(`/${user.role}/dashboard`);
    }
  }, [user, router]);

  const switchTab = (tab) => {
    // Fixed: Removed space in query param "? tab="
    router.push(`/auth/${role}?tab=${tab}`, undefined, { shallow: true });
  };

  // Fixed: Removed extra spaces in role processing
  const displayRole = role?.charAt(0).toUpperCase() + role?.slice(1);

  // If user is logged in, show loading
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-600 to-indigo-700">
        <div className="text-white text-xl font-medium animate-pulse">
          Redirecting to Dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8 items-center">
        
        {/* LEFT SIDE - Auth Form */}
        <div className="order-2 md:order-1">
          <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20">
            
            {/* Header */}
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Welcome to ABC Education Hub
              </h1>
              <p className="text-gray-600 text-sm">
                Enter your credentials to access your account
              </p>
            </div>

            {/* Tab Buttons */}
            <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl">
              <button
                onClick={() => switchTab("login")}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === "login"
                    ? "bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Login
              </button>
              <button
                onClick={() => switchTab("register")}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === "register"
                    ? "bg-linear-to-r from-purple-600 to-indigo-600 text-white shadow-lg transform scale-105"
                    : "text-gray-600 hover:text-gray-800"
                }`}
              >
                Register
              </button>
            </div>

            {/* Form Container with Slide Animation */}
            <div className="relative overflow-hidden">
              <div
                className={`transition-all duration-500 ease-in-out ${
                  activeTab === "login"
                    ? "opacity-100 transform translate-x-0"
                    : "opacity-0 transform -translate-x-full absolute inset-0"
                }`}
              >
                {activeTab === "login" && <LoginForm role={role} displayRole={displayRole} />}
              </div>

              <div
                className={`transition-all duration-500 ease-in-out ${
                  activeTab === "register"
                    ? "opacity-100 transform translate-x-0"
                    : "opacity-0 transform translate-x-full absolute inset-0"
                }`}
              >
                {activeTab === "register" && <RegisterForm role={role} displayRole={displayRole} />}
              </div>
            </div>

            {/* Terms & Privacy */}
            <p className="text-center text-xs text-gray-500 mt-6">
              By clicking continue, you agree to our{" "}
              <a href="#" className="text-purple-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-purple-600 hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* RIGHT SIDE - Illustration */}
        <div className="order-1 md:order-2 flex items-center justify-center">
          <div className="text-center text-white space-y-6">
            <div className="w-full max-w-md mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20">
                <div className="text-9xl mb-4">🎓</div>
                <h2 className="text-3xl font-bold mb-3">Learn Anything</h2>
                <p className="text-lg text-purple-100">
                  Join thousands of {displayRole}s on their learning journey
                </p>
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">📚</div>
                <p className="text-sm font-medium">1000+ Courses</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">👨‍🏫</div>
                <p className="text-sm font-medium">Expert Tutors</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl mb-2">🏆</div>
                <p className="text-sm font-medium">Certificates</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}