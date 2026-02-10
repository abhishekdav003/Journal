/* eslint-disable react-hooks/immutability */
/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { getPlatformStats } from "@/services/apiService";
import {
  FiArrowRight,
  FiPlayCircle,
  FiBook,
  FiUsers,
  FiAward,
} from "react-icons/fi";

export default function Hero() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalTutors: 0,
    totalCourses: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await getPlatformStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      // Silently fail, will show 0 by default
    }
  };

  return (
    <section className="relative bg-transparent min-h-[90vh] flex items-center overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-500"></div>

      <div className="container mx-auto px-6 lg:px-20 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-white space-y-8">
            <div className="inline-block bg-purple-500/30 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-400/30">
              <span className="text-purple-200 text-sm font-semibold">
                ✨ New Learning Portal
              </span>
            </div>

            <h1 className="font-extrabold leading-tight">
              <span className="text-[#AD2BF8] text-5xl lg:text-7xl">Effectiveness</span>
              <br />
              <span className="text-white bg-clip-text text-4xl lg:text-[50px]">
                of the
              </span>
              <span className="text-[#AD2BF8] text-4xl lg:text-[50px]">{" Classrooms "}</span>
              <span className="text-white text-4xl lg:text-[50px]">Now{' '}</span>
              <span className="text-white text-4xl lg:text-[50px]">in Your{" "}</span>
              <span className="text-transparent bg-clip-text bg-[#AD2BF8] text-4xl lg:text-[50px]">
                Hands.
              </span>
            </h1>

            <p className="text-xl text-purple-100 leading-relaxed max-w-xl">
              The Classroom experience brought to your comfort zone. Learn and
              earn with comfort of your home.
            </p>

            {/* Stats */}
            <div className="flex gap-12 pt-6">
              <div>
                <h3 className="text-4xl font-bold text-white">
                  {stats.totalTutors > 0 ? `${stats.totalTutors}+` : "Loading..."}
                </h3>
                <p className="text-purple-200 mt-1">Tutors</p>
              </div>
              <div className="w-px bg-purple-400/30"></div>
              <div>
                <h3 className="text-4xl font-bold text-white">
                  {stats.totalCourses > 0 ? `${stats.totalCourses}+` : "Loading..."}
                </h3>
                <p className="text-purple-200 mt-1">Online Courses</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4 flex-wrap">
              <button
                onClick={() => router.push("/auth/student?tab=register")}
                className="bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-2xl shadow-purple-500/50 transform hover:scale-105 transition-all flex items-center gap-2"
              >
                <FiPlayCircle />
                Get Started
              </button>
              <button
                onClick={() => router.push("/courses")}
                className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white px-8 py-4 rounded-full font-bold text-lg border border-white/30 transform hover:scale-105 transition-all flex items-center gap-2"
              >
                Explore Courses
                <FiArrowRight />
              </button>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative hidden lg:block">
            <div className="relative">
              <div className="absolute -top-[15%] left-[25%] h-8.75 w-8.75 rounded-full bg-[#EE6055]"></div>
              <div className="absolute bottom-[15%] -left-[5%] h-8.75 w-8.75 rounded-full bg-[#26C553]"></div>
              <div className="absolute top-[30%] -right-[1%] h-8.75 w-8.75 rounded-full bg-[#00A5CF]"></div>
              <img
                src="./images/Hero.svg"
                alt="Hero Illustration"
                className="w-full h-auto rounded-2xl"
              />
              <div className="absolute rounded-[50px] rotate-45 -z-1 top-0 left-[50%] -translate-x-1/2 w-[333.42px] h-[346.07px] bg-linear-to-r from-[#BD73FF] to-[#362045]"></div>
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
