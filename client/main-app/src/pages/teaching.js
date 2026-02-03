import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getPlatformStats } from "../services/apiService";
import {
  FiVideo,
  FiUsers,
  FiDollarSign,
  FiBarChart2,
  FiAward,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiTrendingUp,
  FiBook,
} from "react-icons/fi";

export default function Teaching() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getPlatformStats();
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch platform stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      icon: <FiVideo className="w-8 h-8" />,
      title: "Easy Course Creation",
      description:
        "Create and upload courses with our intuitive video platform. Upload lectures, add descriptions, and organize content effortlessly.",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Global Student Reach",
      description:
        "Connect with students worldwide. Build your audience and share your expertise with learners across the globe.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FiDollarSign className="w-8 h-8" />,
      title: "Flexible Pricing",
      description:
        "Set your own course prices and earn revenue from your courses. Get paid automatically with secure payment processing.",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <FiBarChart2 className="w-8 h-8" />,
      title: "Analytics Dashboard",
      description:
        "Track student enrollment, course performance, and earnings. Make data-driven decisions to grow your teaching business.",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Build Your Brand",
      description:
        "Create a professional tutor profile. Showcase your expertise, collect reviews, and establish yourself as an authority.",
      color: "from-indigo-500 to-purple-500",
    },
    {
      icon: <FiClock className="w-8 h-8" />,
      title: "Teach on Your Schedule",
      description:
        "Work whenever you want. Create courses once and earn passive income as students enroll over time.",
      color: "from-pink-500 to-rose-500",
    },
  ];

  const benefits = [
    "No teaching experience required - we provide guidance",
    "Free video hosting and course management tools",
    "Secure payment processing with automatic payouts",
    "Marketing support to help promote your courses",
    "Dedicated tutor support team available 24/7",
    "Certificate generation for course completion",
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                Teach What You Love
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Transform your knowledge into income. Create online courses, reach
              students worldwide, and build a sustainable teaching business on
              your own terms.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/auth/tutor?tab=register")}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
              >
                <FiBook className="w-5 h-5" />
                Start Teaching Today
              </button>
              <button
                onClick={() => router.push("/auth/tutor?tab=login")}
                className="px-8 py-4 bg-[#1E1E2E] hover:bg-[#2B2B40] text-white font-bold rounded-xl border border-purple-500/30 transition-all"
              >
                Sign In as Tutor
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Only show if data available */}
      {!loading && stats && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1E1E2E] to-[#0F0F0F]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-[#0F0F0F]/50 border border-gray-800 rounded-2xl hover:border-purple-500/30 transition-all">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stats.totalStudents?.toLocaleString() || 0}
                </div>
                <div className="text-gray-400 text-sm">Active Students</div>
              </div>
              <div className="text-center p-6 bg-[#0F0F0F]/50 border border-gray-800 rounded-2xl hover:border-purple-500/30 transition-all">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stats.totalTutors?.toLocaleString() || 0}
                </div>
                <div className="text-gray-400 text-sm">Expert Tutors</div>
              </div>
              <div className="text-center p-6 bg-[#0F0F0F]/50 border border-gray-800 rounded-2xl hover:border-purple-500/30 transition-all">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stats.totalCourses?.toLocaleString() || 0}
                </div>
                <div className="text-gray-400 text-sm">Courses Available</div>
              </div>
              <div className="text-center p-6 bg-[#0F0F0F]/50 border border-gray-800 rounded-2xl hover:border-purple-500/30 transition-all">
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  {stats.totalEnrollments?.toLocaleString() || 0}
                </div>
                <div className="text-gray-400 text-sm">Total Enrollments</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to{" "}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              We provide all the tools and support you need to create, publish,
              and sell your courses online.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gradient-to-br from-[#1E1E2E] to-[#2B2B40] p-8 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                <div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.color} mb-6`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#1E1E2E] to-[#0F0F0F]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Why Teachers{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Choose Us
                </span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Join thousands of successful educators who have built thriving
                online teaching businesses with our platform.
              </p>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="mt-1 p-1 bg-green-500/20 rounded-full">
                      <FiCheckCircle className="text-green-400 w-5 h-5" />
                    </div>
                    <span className="text-gray-300">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-[#1E1E2E] to-[#2B2B40] p-8 rounded-3xl border border-purple-500/20">
                <h3 className="text-2xl font-bold text-white mb-6">
                  Start Earning in 3 Simple Steps
                </h3>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Create Your Profile
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Sign up and set up your tutor profile in minutes
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Upload Your Course
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Record and upload your video lectures with ease
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-1">
                        Get Paid
                      </h4>
                      <p className="text-gray-400 text-sm">
                        Publish your course and start earning automatically
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Start Teaching?
              </h2>
              <p className="text-purple-100 text-lg mb-8">
                Join our community of educators and start sharing your knowledge
                today. It's free to get started!
              </p>
              <button
                onClick={() => router.push("/auth/tutor?tab=register")}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:scale-105 inline-flex items-center gap-2"
              >
                <FiCalendar className="w-5 h-5" />
                Create Your Free Account
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
