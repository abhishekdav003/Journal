import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { login } from "@/services/apiService";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

export default function LoginForm({ role }) {
  const router = useRouter();
  const { login: loginUser } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Verifying...");

    try {
      const response = await login({ email, password, role });
      
      // --- DEBUGGING START ---
      console.log("FULL API RESPONSE:", response);
      console.log("RESPONSE DATA:", response.data);
      // --- DEBUGGING END ---

      // CHECK 1: Kya data 'response.data.data' mein hai ya 'response.data.user' mein?
      // Aksar backend se structure alag hota hai.
      // Main yahan fallback laga raha hu:
      const userData = response.data.data || response.data.user || response.data;
      const token = response.data.token;

      // Agar backend role nahi bhej raha, to hum manually inject kar denge (Temporary Fix)
      if (userData && !userData.role) {
         console.warn("Backend se Role nahi aaya! Manually adding role:", role);
         userData.role = role; 
      }

      if (userData && token) {
        // Auth Context ko update karo
        loginUser(userData, token);
        
        toast.success("Success!", { id: toastId });
        
        // Redirect logic (Safe Check)
        if (userData.role) {
            setTimeout(() => {
                if (userData.role === 'student') {
                    router.push(`/user/profile`);
                } else {
                    router.push(`/${userData.role}/dashboard`);
                }
            }, 1000);
        } else {
            toast.error("Role missing in user data!", { id: toastId });
        }
      } else {
        throw new Error("Invalid response from server");
      }

    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err.response?.data?.message || "Login failed", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Email Field */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D1B4E] ml-1 uppercase tracking-wide">Email ID</label>
          <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-6 py-4 rounded-xl bg-white border border-[#EAD7FC] focus:ring-4 focus:ring-[#8834D3]/20 focus:border-[#8834D3] outline-none transition-all text-gray-800 placeholder-gray-400 shadow-sm"
              required
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1">
          <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-[#2D1B4E] uppercase tracking-wide">Password</label>
              <Link href="/forgot-password">
                  <span className="text-xs font-bold text-[#8834D3] hover:text-[#6a25a8] cursor-pointer transition-colors">
                      Forgot Password?
                  </span>
              </Link>
          </div>

          <div className="relative">
            <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-6 pr-12 py-4 rounded-xl bg-white border border-[#EAD7FC] focus:ring-4 focus:ring-[#8834D3]/20 focus:border-[#8834D3] outline-none transition-all text-gray-800 placeholder-gray-400 shadow-sm"
                required
            />
            
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8834D3] transition-colors focus:outline-none"
            >
                {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 mt-4 ${
            isLoading 
              ? "bg-[#8834D3]/70 cursor-not-allowed" 
              : "bg-[#8834D3] hover:bg-[#7228b5]"
          }`}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
        
        <div className="text-center text-xs text-[#594a75]/80 mt-4 px-4">
            By continuing, you agree to our Terms & Privacy Policy
        </div>
      </form>
    </>
  );
}