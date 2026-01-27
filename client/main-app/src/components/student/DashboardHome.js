import { FiClock, FiPlayCircle, FiMoreHorizontal } from "react-icons/fi";

const DashboardHome = ({ user }) => {
  const currentUser = user?.user || user || null;
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* 1. TOP SECTION: Welcome Banner + Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Banner */}
        <div className="lg:col-span-2 bg-[#1E1E2E] p-8 rounded-3xl relative overflow-hidden border border-gray-800/50">
          <div className="relative z-10">
            <p className="text-gray-400 text-sm mb-2 font-medium bg-[#2B2B40] inline-block px-3 py-1 rounded-lg">
              January 20, 2026 • Monday
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mt-4">
              Welcome back,{" "}
              <span className="text-[#A78BFA]">
                {currentUser?.name || "Student"}!
              </span>
            </h1>
            <p className="text-gray-400 mt-2 max-w-md">
              You have completed 70% of your goal this week. Keep it up!
            </p>
          </div>
          {/* Abstract decorative circle */}
          <div className="absolute -right-10 -bottom-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl"></div>
        </div>

        {/* Stat Card */}
        <div className="bg-[#E0Cffc] p-6 rounded-3xl flex flex-col justify-between text-[#2D1B4E]">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-white/50 rounded-xl backdrop-blur-sm">
              <span className="text-2xl">🎓</span>
            </div>
            <button>
              <FiMoreHorizontal className="w-6 h-6" />
            </button>
          </div>
          <div>
            <p className="text-4xl font-extrabold mt-4">07</p>
            <p className="font-bold text-lg">Enrolled Courses</p>
            <div className="w-full h-1.5 bg-white/50 rounded-full mt-3">
              <div className="w-[70%] h-full bg-[#6D28D9] rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE COURSES SECTION */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white pl-4 border-l-4 border-purple-500">
            Active Courses
          </h2>
          <button className="bg-[#2B2B40] text-sm px-4 py-2 rounded-full hover:bg-purple-600 transition-colors">
            See All
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="bg-[#1E1E2E] p-5 rounded-3xl border border-gray-800 hover:border-purple-500/50 transition-all group"
            >
              {/* Image Placeholder */}
              <div className="h-40 bg-[#2B2B40] rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-900/50 rounded-full flex items-center justify-center mx-auto mb-2 text-purple-300">
                    UI
                  </div>
                  <p className="text-xs text-gray-500">UI/UX Design</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-1">
                Learn UI/UX Design
              </h3>

              <div className="flex items-center gap-4 text-xs text-gray-400 mb-5 mt-3">
                <span className="flex items-center gap-1 bg-[#2B2B40] px-2 py-1 rounded">
                  <FiPlayCircle /> 35 Tutorials
                </span>
                <span className="flex items-center gap-1 bg-[#2B2B40] px-2 py-1 rounded">
                  <FiClock /> 40m/daily
                </span>
              </div>

              <div className="flex items-center justify-between gap-3">
                <button className="flex-1 bg-[#6D28D9] hover:bg-[#5b21b6] text-white py-2.5 rounded-xl text-sm font-bold transition-all">
                  Start Class
                </button>
                <div className="w-10 h-10 rounded-full border-2 border-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                  70%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. PERFORMANCE & CALENDAR ROW (Simplifed) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graph Placeholder */}
        <div className="lg:col-span-2 bg-[#1E1E2E] p-6 rounded-3xl border border-gray-800">
          <div className="flex justify-between mb-6">
            <h3 className="font-bold text-white">Performance</h3>
            <select className="bg-[#2B2B40] text-xs px-3 py-1 rounded-lg outline-none border-none">
              <option>Courses</option>
            </select>
          </div>
          <div className="flex items-end justify-between h-40 gap-4 px-2">
            {[40, 70, 30, 85, 50, 90, 60].map((h, i) => (
              <div
                key={i}
                className="w-full bg-[#2B2B40] rounded-t-lg h-full relative group"
              >
                <div
                  style={{ height: `${h}%` }}
                  className="absolute bottom-0 w-full bg-linear-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all duration-500 group-hover:from-purple-500 group-hover:to-purple-300"
                ></div>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-4">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>

        {/* Calendar Mini */}
        <div className="bg-[#1E1E2E] p-6 rounded-3xl border border-gray-800">
          <h3 className="font-bold text-white mb-4">Linked Tutors</h3>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="bg-[#2B2B40] p-3 rounded-2xl flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-full bg-gray-600"></div>
                <div>
                  <p className="text-sm font-bold text-white">Sarah Smith</p>
                  <p className="text-xs text-gray-400">UI/UX Design</p>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-purple-400 hover:text-white transition-colors">
            See All
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
