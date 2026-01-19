import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";
import { useEffect, useState } from "react";
import Image from "next/image";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import Link from "next/link";

export default function AuthSlider({ role, activeTab }) {
  const router = useRouter();
  const { user } = useAuth();
  
  const [currentImage, setCurrentImage] = useState(
    activeTab === 'login' ? "/images/login-img.svg" : "/images/register-img.svg"
  );
  const [fadeImage, setFadeImage] = useState(false);
  // ✅ FIXED USE EFFECT (Animation Logic)
  useEffect(() => {
    const targetImage = activeTab === 'login' ? "/images/login-img.svg" : "/images/register-img.svg";

    if (currentImage === targetImage) return;

    setFadeImage(true);
    
    const timeout = setTimeout(() => {
        setCurrentImage(targetImage);
        setFadeImage(false);
    }, 300);

    return () => clearTimeout(timeout);
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]); 

  const switchTab = (tab) => {
    if (tab === activeTab) return;
    router.push(`/auth/${role}?tab=${tab}`, undefined, { shallow: true });
  };

  const displayRole = role?.charAt(0).toUpperCase() + role?.slice(1);
  const oppositeRole = role === 'student' ? 'tutor' : 'student';

  if (user && user.role) return null;

  return (
    // MAIN BACKGROUND: #EAD7FC
    <div className="min-h-screen w-full flex items-center justify-center p-4 md:p-8 bg-[#EAD7FC] relative overflow-hidden">
        
        {/* DECORATIVE BLOBS */}
        <div className="absolute top-[-10%] left-[-10%] w-125 h-125 bg-[#8834D3] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-125 h-125 bg-[#8834D3] rounded-full mix-blend-multiply filter blur-[120px] opacity-40 animate-blob animation-delay-2000"></div>

        {/* GLASS CARD CONTAINER */}
        <div className="relative -top-8 z-10 w-full max-w-6xl h-170 md:h-162.5 bg-white/40 backdrop-blur-xl rounded-[3rem] shadow-2xl overflow-hidden grid md:grid-cols-2 ">
            
            {/* LEFT SIDE: Image Section */}
            <div className="hidden md:flex flex-col items-center justify-center relative overflow-hidden">
                <div className={`relative w-full h-full flex items-center justify-center transition-all duration-500 transform ${fadeImage ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                    <Image 
                        src={currentImage}
                        alt="Auth Illustration"
                        fill
                        className="object-cover" 
                        priority
                    />
                </div>
            </div>

            {/* RIGHT SIDE: Form Section */}
            <div className="w-full h-full flex flex-col items-center justify-center p-6 md:p-8 relative bg-white/30 ">
                
                <div className="w-full max-w-md relative z-10 flex flex-col h-full justify-center border ">
                    
                    {/* Header */}
                    <div className="text-center mb-6">
                        <h1 className="text-2xl font-bold text-[#2D1B4E]">Welcome to Journal Education</h1>
                        <p className="text-[#594a75] mt-2 text-sm font-medium">
                            Please enter your details to access your {displayRole} account.
                        </p>
                    </div>

                    {/* --- SMOOTH SLIDING PILL TABS --- */}
                    <div className="relative flex bg-white/50 rounded-full p-1.5 mb-8 backdrop-blur-md border border-white/40 shadow-sm">
                        
                        {/* THE GLIDER */}
                        <div
                            className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#8834D3] rounded-full shadow-md transition-all duration-300 ease-in-out z-0 ${
                                activeTab === 'login' ? 'left-1.5' : 'left-[calc(50%+1.5px)]'
                            }`}
                        ></div>

                        {/* Login Button */}
                        <button
                            onClick={() => switchTab("login")}
                            className={`relative z-10 flex-1 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${
                                activeTab === "login" 
                                ? "text-white" 
                                : "text-[#594a75] hover:text-[#8834D3]"
                            }`}
                        >
                            Login
                        </button>

                        {/* Register Button */}
                        <button
                            onClick={() => switchTab("register")}
                            className={`relative z-10 flex-1 py-3 rounded-full text-sm font-bold transition-colors duration-300 ${
                                activeTab === "register" 
                                ? "text-white" 
                                : "text-[#594a75] hover:text-[#8834D3]"
                            }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* SLIDING FORM AREA */}
                    <div className="relative w-full grow overflow-hidden"> 
                        <div className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out transform ${
                            activeTab === 'login' ? 'translate-x-0 opacity-100 z-10' : '-translate-x-full opacity-0 z-0'
                        }`}>
                            <LoginForm role={role} />
                        </div>

                        <div className={`absolute top-0 left-0 w-full h-full transition-all duration-500 ease-in-out transform ${
                            activeTab === 'register' ? 'translate-x-0 opacity-100 z-10' : 'translate-x-full opacity-0 z-0'
                        }`}>
                            <RegisterForm role={role} displayRole={displayRole} />
                        </div>
                    </div>

                    {/* FOOTER SWITCHER */}
                    <div className="mt-4 text-center">
                        <p className="text-sm text-[#594a75]">
                            Not a {displayRole}?{" "}
                            <Link href={`/auth/${oppositeRole}?tab=${activeTab}`}>
                                <span className="text-[#8834D3] font-bold hover:underline cursor-pointer">
                                    {activeTab === 'login' ? 'Login' : 'Register'} as {oppositeRole.charAt(0).toUpperCase() + oppositeRole.slice(1)}
                                </span>
                            </Link>
                        </p>
                    </div>

                </div>
            </div>
        </div>
    </div>
  );
}