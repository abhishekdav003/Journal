import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getPlatformStats } from "../services/apiService";
import {
  FiBriefcase,
  FiUsers,
  FiTarget,
  FiAward,
  FiTrendingUp,
  FiCheckCircle,
  FiClock,
  FiVideo,
  FiBook,
  FiGlobe,
} from "react-icons/fi";

export default function Training() {
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

  const trainingPrograms = [
    {
      icon: <FiBriefcase className="w-8 h-8" />,
      title: "Corporate Training",
      description:
        "Customized training programs for teams and organizations. Upskill your workforce with expert-led courses in technology, business, and soft skills.",
      duration: "4-12 weeks",
      level: "All Levels",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <FiTarget className="w-8 h-8" />,
      title: "Skill Development",
      description:
        "Intensive bootcamps and workshops focused on in-demand skills. From programming to digital marketing, master the skills that matter.",
      duration: "2-8 weeks",
      level: "Beginner to Advanced",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <FiAward className="w-8 h-8" />,
      title: "Professional Certification",
      description:
        "Industry-recognized certification programs. Earn credentials that boost your career and validate your expertise.",
      duration: "6-16 weeks",
      level: "Intermediate to Expert",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const features = [
    {
      icon: <FiVideo className="w-6 h-6" />,
      title: "Live & Recorded Sessions",
      description: "Interactive live classes with recorded sessions for review",
    },
    {
      icon: <FiUsers className="w-6 h-6" />,
      title: "Expert Instructors",
      description:
        "Learn from industry professionals with real-world experience",
    },
    {
      icon: <FiBook className="w-6 h-6" />,
      title: "Hands-on Projects",
      description: "Build portfolio-worthy projects while learning",
    },
    {
      icon: <FiAward className="w-6 h-6" />,
      title: "Certificate of Completion",
      description: "Earn certificates to showcase your achievements",
    },
    {
      icon: <FiGlobe className="w-6 h-6" />,
      title: "Global Community",
      description: "Network with learners and professionals worldwide",
    },
    {
      icon: <FiClock className="w-6 h-6" />,
      title: "Flexible Schedule",
      description: "Learn at your own pace with lifetime access",
    },
  ];

  const benefits = [
    "Customized curriculum for your organization's needs",
    "Dedicated account manager for enterprise clients",
    "Progress tracking and analytics dashboard",
    "Group discounts for team enrollments",
    "Post-training support and mentorship",
    "Integration with your existing LMS systems",
  ];

  return (
    <div className="min-h-screen bg-[#0F0F0F]">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
              <span className="bg-linear-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Professional Training Programs
              </span>
            </h1>

            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Empower your team with cutting-edge skills. Our comprehensive
              training programs are designed to drive real business results and
              career growth.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push("/courses")}
                className="px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
              >
                <FiBriefcase className="w-5 h-5" />
                Browse Training Programs
              </button>
              <button
                onClick={() => router.push("/contact")}
                className="px-8 py-4 bg-[#1E1E2E] hover:bg-[#2B2B40] text-white font-bold rounded-xl border border-blue-500/30 transition-all"
              >
                Contact for Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Only show if data available */}
      {!loading && stats && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-[#1E1E2E] to-[#0F0F0F]">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center p-6 bg-[#0F0F0F]/50 border border-gray-800 rounded-2xl hover:border-blue-500/30 transition-all">
                <div className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stats.totalCourses?.toLocaleString() || 0}
                </div>
                <div className="text-gray-400 text-sm">Training Programs</div>
              </div>
              <div className="text-center p-6 bg-[#0F0F0F]/50 border border-gray-800 rounded-2xl hover:border-blue-500/30 transition-all">
                <div className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stats.totalEnrollments?.toLocaleString() || 0}
                </div>
                <div className="text-gray-400 text-sm">
                  Professionals Trained
                </div>
              </div>
              <div className="text-center p-6 bg-[#0F0F0F]/50 border border-gray-800 rounded-2xl hover:border-blue-500/30 transition-all">
                <div className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stats.totalTutors?.toLocaleString() || 0}
                </div>
                <div className="text-gray-400 text-sm">Expert Instructors</div>
              </div>
              <div className="text-center p-6 bg-[#0F0F0F]/50 border border-gray-800 rounded-2xl hover:border-blue-500/30 transition-all">
                <div className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stats.totalStudents?.toLocaleString() || 0}
                </div>
                <div className="text-gray-400 text-sm">Active Learners</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Training Programs Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Our{" "}
              <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Training Programs
              </span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Choose from our range of comprehensive training programs designed
              for different learning goals and career paths.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {trainingPrograms.map((program, index) => (
              <div
                key={index}
                className="group bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-8 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:scale-105"
              >
                <div
                  className={`inline-flex p-4 rounded-xl bg-linear-to-r ${program.color} mb-6`}
                >
                  {program.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {program.title}
                </h3>
                <p className="text-gray-400 leading-relaxed mb-6">
                  {program.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-400 border-t border-gray-800 pt-4">
                  <div className="flex items-center gap-1">
                    <FiClock className="w-4 h-4" />
                    <span>{program.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <FiTarget className="w-4 h-4" />
                    <span>{program.level}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-b from-[#1E1E2E] to-[#0F0F0F]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              What's{" "}
              <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Included
              </span>
            </h2>
            <p className="text-gray-400 text-lg">
              Everything you need for a successful learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-start gap-4 p-6 bg-[#1E1E2E] rounded-xl border border-gray-800 hover:border-blue-500/30 transition-all"
              >
                <div className="p-3 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/20">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
              <div className="relative bg-linear-to-br from-[#1E1E2E] to-[#2B2B40] p-8 rounded-3xl border border-blue-500/20">
                <div className="text-center mb-8">
                  <div className="inline-flex p-4 bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
                    <FiBriefcase className="w-12 h-12 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    Enterprise Solutions
                  </h3>
                </div>
                <div className="space-y-3">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1 p-1 bg-green-500/20 rounded-full">
                        <FiCheckCircle className="text-green-400 w-4 h-4" />
                      </div>
                      <span className="text-gray-300 text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-4xl font-bold text-white mb-6">
                Enterprise-Grade{" "}
                <span className="bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Training Solutions
                </span>
              </h2>
              <p className="text-gray-400 text-lg mb-8">
                Scalable training programs designed for organizations of all
                sizes. We work with you to create customized learning paths that
                align with your business goals.
              </p>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-linear-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      Consultation
                    </h4>
                    <p className="text-gray-400 text-sm">
                      We assess your team's needs and goals
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-linear-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      Customization
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Tailored curriculum based on your requirements
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-linear-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="text-white font-semibold mb-1">
                      Implementation
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Launch training with full support and tracking
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push("/contact")}
                className="mt-8 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-xl transition-all shadow-lg hover:scale-105 inline-flex items-center gap-2"
              >
                <FiBriefcase className="w-5 h-5" />
                Request Enterprise Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-linear-to-r from-blue-600 to-purple-600 p-12 rounded-3xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Transform Your Team?
              </h2>
              <p className="text-blue-100 text-lg mb-8">
                Start your training journey today and unlock your team's full
                potential with our expert-led programs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => router.push("/courses")}
                  className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <FiBook className="w-5 h-5" />
                  Explore Training Programs
                </button>
                <button
                  onClick={() => router.push("/contact")}
                  className="px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl transition-all border border-white/20"
                >
                  Talk to Our Team
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
