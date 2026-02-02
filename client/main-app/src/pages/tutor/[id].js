/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import Head from "next/head";
import { FaStar, FaArrowRight, FaGraduationCap, FaBook } from "react-icons/fa";

export default function TutorProfile() {
  const router = useRouter();
  const { id } = router.query;
  const [tutor, setTutor] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchTutorProfile = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/auth/users/${id}`,
        );
        setTutor(response.data.data.user);
        setCourses(response.data.data.user.courses || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching tutor profile:", err);
        setError("Failed to load tutor profile");
      } finally {
        setLoading(false);
      }
    };

    fetchTutorProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-2xl">Loading tutor profile...</div>
      </div>
    );
  }

  if (error || !tutor) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-950 via-purple-900 to-slate-950 flex items-center justify-center">
        <div className="text-white text-2xl">{error || "Tutor not found"}</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{tutor.name} - Tutor Profile | Learning Platform</title>
        <meta
          name="description"
          content={`${tutor.name}'s tutor profile and courses`}
        />
      </Head>

      <div className="min-h-screen bg-linear-to-br from-slate-950 via-purple-900 to-slate-950">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10">
          {/* Tutor Header Section */}
          <div className="bg-linear-to-r from-purple-900/40 to-slate-900/40 border-b border-purple-500/30 backdrop-blur-xl py-12">
            <div className="max-w-6xl mx-auto px-4">
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                {/* Avatar */}
                <div className="shrink-0">
                  {tutor.avatar ? (
                    <img
                      src={tutor.avatar}
                      alt={tutor.name}
                      className="w-40 h-40 rounded-full border-4 border-purple-400 shadow-2xl object-cover"
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-linear-to-br from-purple-400 to-purple-600 flex items-center justify-center border-4 border-purple-400 shadow-2xl">
                      <span className="text-6xl text-white font-bold">
                        {tutor.name?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tutor Info */}
                <div className="grow text-center md:text-left">
                  <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {tutor.name}
                  </h1>
                  <p className="text-purple-200 text-lg mb-4">
                    {tutor.role || "Expert Tutor"}
                  </p>

                  {tutor.bio && (
                    <p className="text-gray-300 text-base mb-6 max-w-2xl">
                      {tutor.bio}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="flex flex-col md:flex-row gap-4 text-gray-300 mb-6">
                    <div>
                      <span className="text-gray-400">Email: </span>
                      <a
                        href={`mailto:${tutor.email}`}
                        className="text-purple-300 hover:text-purple-200"
                      >
                        {tutor.email}
                      </a>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                    <div className="flex items-center gap-2">
                      <FaGraduationCap className="text-purple-400 text-xl" />
                      <div>
                        <p className="text-gray-400 text-sm">Courses Created</p>
                        <p className="text-white text-xl font-bold">
                          {courses.length}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaBook className="text-purple-400 text-xl" />
                      <div>
                        <p className="text-gray-400 text-sm">Total Students</p>
                        <p className="text-white text-xl font-bold">
                          {courses.reduce(
                            (sum, course) =>
                              sum + (course.enrolledStudents || 0),
                            0,
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaStar className="text-yellow-400 text-xl" />
                      <div>
                        <p className="text-gray-400 text-sm">Avg Rating</p>
                        <p className="text-white text-xl font-bold">
                          {courses.length > 0
                            ? (
                                courses.reduce(
                                  (sum, course) => sum + (course.rating || 0),
                                  0,
                                ) / courses.length
                              ).toFixed(1)
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Courses Section */}
          <div className="max-w-6xl mx-auto px-4 py-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Courses by {tutor.name}
            </h2>
            <p className="text-gray-400 mb-12">
              {courses.length > 0
                ? `${courses.length} course${courses.length !== 1 ? "s" : ""} available`
                : "No courses yet"}
            </p>

            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course._id}
                    onClick={() =>
                      router.push(
                        `/course/${course._id}/${course.title.replace(/\s+/g, "-")}`,
                      )
                    }
                    className="group bg-linear-to-br from-purple-900/30 to-slate-900/30 border border-purple-500/30 hover:border-purple-400/60 rounded-xl overflow-hidden backdrop-blur-xl hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-48 overflow-hidden bg-linear-to-br from-purple-400 to-slate-600">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-linear-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                          <FaBook className="text-4xl text-white/30" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors line-clamp-2 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                        {course.description}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center justify-between mb-4 text-sm text-gray-300">
                        <span className="bg-purple-900/50 px-3 py-1 rounded-full">
                          {course.level || "All Levels"}
                        </span>
                        {course.rating && (
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-400" />
                            <span>{course.rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Price and CTA */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {course.price > 0 ? (
                            <>
                              <span className="text-xl font-bold text-white">
                                ₹{course.price}
                              </span>
                              {course.originalPrice && (
                                <span className="text-sm text-gray-400 line-through">
                                  ₹{course.originalPrice}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xl font-bold text-purple-300">
                              Free
                            </span>
                          )}
                        </div>
                        <button className="bg-purple-600 hover:bg-purple-500 p-2 rounded-lg transition-colors">
                          <FaArrowRight className="text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <FaBook className="text-6xl text-purple-400/30 mx-auto mb-4" />
                <p className="text-gray-400 text-xl">
                  {"This tutor hasn't published any courses yet. Please check back later."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
