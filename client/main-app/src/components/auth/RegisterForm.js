import { useState } from "react";
import { useRouter } from "next/router";
import { register } from "@/services/apiService";
import toast, { Toaster } from "react-hot-toast";

export default function RegisterForm({ role }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", confirmPassword: ""
  });
  
  // States for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => setFormData({...formData, [e.target.name]: e.target.value});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Validation Logic
    if (formData.password.length < 6) {
        return toast.error("Password must be at least 6 characters");
    }
    if (formData.password !== formData.confirmPassword) {
        return toast.error("Passwords do not match!");
    }
    
    setIsLoading(true);
    const toastId = toast.loading("Creating Account...");

    try {
      const res = await register({ ...formData, role });
      if (res.data.success) {
        toast.success("Account Created!", { id: toastId });
        setTimeout(() => router.push(`/auth/${role}?tab=login`), 2000);
      }
    } catch (err) {
      // Backend error message show karega (e.g., "Password is required")
      const errorMsg = err.response?.data?.message || "Registration failed";
      toast.error(errorMsg, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D1B4E] ml-1 uppercase tracking-wide">Full Name</label>
          <input
            name="name" type="text" placeholder="John Doe" onChange={handleChange}
            className="w-full px-6 py-3 rounded-xl bg-white border border-[#EAD7FC] focus:ring-4 focus:ring-[#8834D3]/20 focus:border-[#8834D3] outline-none text-gray-800 shadow-sm"
            required
          />
        </div>

        {/* Email ID */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-[#2D1B4E] ml-1 uppercase tracking-wide">Email ID</label>
          <input
            name="email" type="email" placeholder="name@example.com" onChange={handleChange}
            className="w-full px-6 py-3 rounded-xl bg-white border border-[#EAD7FC] focus:ring-4 focus:ring-[#8834D3]/20 focus:border-[#8834D3] outline-none text-gray-800 shadow-sm"
            required
          />
        </div>

        {/* GRID LAYOUT FOR PASSWORDS */}
        <div className="grid grid-cols-2 gap-3">
            
            {/* Password Field */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D1B4E] ml-1 uppercase tracking-wide">Password</label>
                <div className="relative">
                    <input
                        name="password" 
                        type={showPassword ? "text" : "password"} 
                        placeholder="••••••" 
                        onChange={handleChange}
                        className="w-full pl-6 pr-10 py-3 rounded-xl bg-white border border-[#EAD7FC] focus:ring-4 focus:ring-[#8834D3]/20 focus:border-[#8834D3] outline-none text-gray-800 shadow-sm"
                        required
                        minLength={6} // HTML Validation bhi add kar di
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8834D3] transition-colors focus:outline-none"
                    >
                        {showPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1">
                <label className="text-xs font-bold text-[#2D1B4E] ml-1 uppercase tracking-wide">Confirm Password</label>
                <div className="relative">
                    <input
                        name="confirmPassword" 
                        type={showConfirmPassword ? "text" : "password"} 
                        placeholder="••••••" 
                        onChange={handleChange}
                        className="w-full pl-6 pr-10 py-3 rounded-xl bg-white border border-[#EAD7FC] focus:ring-4 focus:ring-[#8834D3]/20 focus:border-[#8834D3] outline-none text-gray-800 shadow-sm"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#8834D3] transition-colors focus:outline-none"
                    >
                        {showConfirmPassword ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>

        <button
          type="submit" disabled={isLoading}
          className={`w-full py-4 rounded-xl text-white font-bold text-lg transition-all duration-300 transform hover:-translate-y-1 mt-4 ${
            isLoading 
              ? "bg-[#8834D3]/70 cursor-not-allowed" 
              : "bg-[#8834D3] hover:bg-[#7228b5]"
          }`}
        >
          {isLoading ? "Processing..." : "Create Account"}
        </button>
      </form>
    </>
  );
}