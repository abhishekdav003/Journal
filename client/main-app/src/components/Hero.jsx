import { useRouter } from "next/router";
import {
  FiArrowRight,
  FiPlayCircle,
  FiBook,
  FiUsers,
  FiAward,
} from "react-icons/fi";

export default function Hero() {
  const router = useRouter();

  return (
    <section className="relative bg-linear-to-br from-purple-900 via-purple-800 to-indigo-900 min-h-[90vh] flex items-center overflow-hidden">
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

            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
              <span className="text-white">Effectiveness</span>
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-300 to-pink-300">
                of the Classrooms
              </span>{" "}
              <span className="text-white">Now</span>
              <br />
              <span className="text-white">in Your</span>{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-purple-300 to-pink-300">
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
                <h3 className="text-4xl font-bold text-white">100+</h3>
                <p className="text-purple-200 mt-1">Tutors</p>
              </div>
              <div className="w-px bg-purple-400/30"></div>
              <div>
                <h3 className="text-4xl font-bold text-white">50+</h3>
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
            <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
              <div className="aspect-video bg-linear-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center mb-6">
                <FiBook className="text-white text-9xl opacity-30" />
              </div>

              {/* Feature Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                  <FiPlayCircle className="text-purple-300 text-2xl mb-2" />
                  <p className="text-white text-sm font-bold">
                    Learn at Your Pace
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                  <FiAward className="text-yellow-300 text-2xl mb-2" />
                  <p className="text-white text-sm font-bold">Get Certified</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                  <FiUsers className="text-blue-300 text-2xl mb-2" />
                  <p className="text-white text-sm font-bold">Expert Tutors</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 border border-white/20">
                  <FiBook className="text-green-300 text-2xl mb-2" />
                  <p className="text-white text-sm font-bold">Rich Content</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
