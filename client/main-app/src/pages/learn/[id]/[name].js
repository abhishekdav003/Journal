/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  getCourse,
  getCourseReviews,
  createReview,
  updateReview,
  getCourseQuestions,
  createQuestion,
  answerQuestion,
  updateLectureProgress,
  getEnrollmentProgress,
} from "@/services/apiService";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";
import {
  FiPlay,
  FiChevronDown,
  FiChevronRight,
  FiStar,
  FiUsers,
  FiClock,
  FiBookOpen,
  FiCheckCircle,
  FiX,
  FiList,
  FiMaximize,
  FiVolume2,
  FiSettings,
} from "react-icons/fi";

export default function LearnCourse() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState(new Set([0]));
  const [activeLecture, setActiveLecture] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [reviews, setReviews] = useState([]);
  const [reviewsBreakdown, setReviewsBreakdown] = useState({});
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [isEditingReview, setIsEditingReview] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [submittingQuestion, setSubmittingQuestion] = useState(false);
  const [answeringQuestionId, setAnsweringQuestionId] = useState(null);
  const [newAnswer, setNewAnswer] = useState("");
  const [enrollment, setEnrollment] = useState(null);
  const [completedLectures, setCompletedLectures] = useState(new Set());
  const [videoProgress, setVideoProgress] = useState(0);
  const [showCompleteButton, setShowCompleteButton] = useState(false);
  const [videoRef, setVideoRef] = useState(null);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchCourse();
    }
  }, [id]);

  useEffect(() => {
    if (id && activeTab === "reviews") {
      fetchReviews();
    }
  }, [id, activeTab]);

  useEffect(() => {
    if (id && activeTab === "q&a") {
      fetchQuestions();
    }
  }, [id, activeTab]);

  useEffect(() => {
    if (id && user) {
      fetchEnrollmentProgress();
    }
  }, [id, user]);

  useEffect(() => {
    // Reset video progress when lecture changes
    setVideoProgress(0);
    setShowCompleteButton(false);
  }, [activeLecture]);

  const fetchCourse = async () => {
    try {
      setLoading(true);
      const response = await getCourse(id);
      if (response.data.success) {
        const courseData = response.data.data.course;
        setCourse(courseData);

        console.log("Course data:", courseData);

        // Set first lecture as active - check both sections and modules
        if (
          courseData.sections?.length > 0 &&
          courseData.sections[0].lectures?.length > 0
        ) {
          setActiveLecture(courseData.sections[0].lectures[0]);
          console.log(
            "First lecture from sections:",
            courseData.sections[0].lectures[0],
          );
        } else if (
          courseData.modules?.length > 0 &&
          courseData.modules[0].lectures?.length > 0
        ) {
          setActiveLecture(courseData.modules[0].lectures[0]);
          console.log(
            "First lecture from modules:",
            courseData.modules[0].lectures[0],
          );
        } else if (courseData.lectures?.length > 0) {
          setActiveLecture(courseData.lectures[0]);
          console.log(
            "First lecture from direct lectures:",
            courseData.lectures[0],
          );
        } else {
          console.log("No lectures found in course");
        }
      }
    } catch (error) {
      console.error("Failed to fetch course:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (index) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const getTotalStats = () => {
    let totalLectures = 0;
    let totalDuration = 0;

    // Check sections first (new structure)
    if (course?.sections?.length > 0) {
      course.sections.forEach((section) => {
        if (section.lectures) {
          totalLectures += section.lectures.length;
          section.lectures.forEach((lecture) => {
            totalDuration += lecture.duration || 0;
          });
        }
      });
    }
    // Fallback to modules (old structure)
    else if (course?.modules?.length > 0) {
      course.modules.forEach((module) => {
        if (module.lectures) {
          totalLectures += module.lectures.length;
          module.lectures.forEach((lecture) => {
            totalDuration += lecture.duration || 0;
          });
        }
      });
    }
    // Fallback to direct lectures
    else if (course?.lectures?.length > 0) {
      totalLectures = course.lectures.length;
      course.lectures.forEach((lecture) => {
        totalDuration += lecture.duration || 0;
      });
    }

    return { lectures: totalLectures, duration: totalDuration };
  };

  const fetchReviews = async () => {
    try {
      const response = await getCourseReviews(id);
      if (response.data.success) {
        const allReviews = response.data.data.reviews;
        setReviews(allReviews);
        setReviewsBreakdown(response.data.data.breakdown);

        // Find user's existing review
        if (user) {
          const existingReview = allReviews.find(
            (review) => review.student?._id === user._id,
          );
          if (existingReview) {
            setUserReview(existingReview);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!userRating) {
      toast.error("Please select a rating");
      return;
    }
    if (!userComment.trim()) {
      toast.error("Please write a review");
      return;
    }

    try {
      setSubmittingReview(true);

      if (isEditingReview && userReview) {
        // Update existing review
        const response = await updateReview(userReview._id, {
          rating: userRating,
          comment: userComment,
        });

        if (response.data.success) {
          toast.success("Review updated successfully!");
          setIsEditingReview(false);
          fetchReviews();
        }
      } else {
        // Create new review
        const response = await createReview(id, {
          rating: userRating,
          comment: userComment,
        });

        if (response.data.success) {
          toast.success("Review submitted successfully!");
          setUserRating(0);
          setUserComment("");
          fetchReviews();
        }
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to submit review";
      toast.error(message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleEditReview = () => {
    if (userReview) {
      setUserRating(userReview.rating);
      setUserComment(userReview.comment);
      setIsEditingReview(true);
    }
  };

  const handleCancelEdit = () => {
    setUserRating(0);
    setUserComment("");
    setIsEditingReview(false);
  };

  const fetchQuestions = async () => {
    try {
      const response = await getCourseQuestions(id);
      if (response.data.success) {
        setQuestions(response.data.data.questions);
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    }
  };

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim()) {
      toast.error("Please enter a question");
      return;
    }

    try {
      setSubmittingQuestion(true);
      const response = await createQuestion(id, {
        question: newQuestion,
        lectureId: activeLecture?._id,
      });

      if (response.data.success) {
        toast.success("Question posted successfully!");
        setNewQuestion("");
        fetchQuestions();
      }
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to post question";
      toast.error(message);
    } finally {
      setSubmittingQuestion(false);
    }
  };

  const handleSubmitAnswer = async (questionId) => {
    if (!newAnswer.trim()) {
      toast.error("Please enter an answer");
      return;
    }

    try {
      const response = await answerQuestion(questionId, {
        answer: newAnswer,
      });

      if (response.data.success) {
        toast.success("Answer posted successfully!");
        setNewAnswer("");
        setAnsweringQuestionId(null);
        fetchQuestions();
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to post answer";
      toast.error(message);
    }
  };

  const fetchEnrollmentProgress = async () => {
    try {
      const response = await getEnrollmentProgress(id);
      if (response.data.success) {
        setEnrollment(response.data.data.enrollment);
        const completed = new Set(
          response.data.data.enrollment.progress
            .filter((p) => p.completed)
            .map((p) => p.lecture.toString()),
        );
        setCompletedLectures(completed);
      }
    } catch (error) {
      console.error("Failed to fetch enrollment progress:", error);
    }
  };

  const handleMarkLectureComplete = async (lectureId, completed) => {
    try {
      await updateLectureProgress(id, {
        lectureId,
        completed,
      });

      // Show completion message for 1 second
      setShowCompletionMessage(true);
      setTimeout(() => {
        setShowCompletionMessage(false);
      }, 1000);

      const newCompleted = new Set(completedLectures);
      if (completed) {
        newCompleted.add(lectureId);
      } else {
        newCompleted.delete(lectureId);
      }
      setCompletedLectures(newCompleted);
      fetchEnrollmentProgress(); // Refresh to get updated percentage
    } catch (error) {
      console.error("Failed to update progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const handleVideoProgress = (e) => {
    const video = e.target;
    const progress = (video.currentTime / video.duration) * 100;
    setVideoProgress(progress);

    // Show complete button after 95%
    if (progress >= 95) {
      setShowCompleteButton(true);
    }

    // Auto-complete at 98%
    if (
      progress >= 98 &&
      activeLecture &&
      !completedLectures.has(activeLecture._id)
    ) {
      handleMarkLectureComplete(activeLecture._id, true);
    }
  };

  if (loading || !course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#1c1d1f]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading course...</p>
        </div>
      </div>
    );
  }

  const stats = getTotalStats();

  return (
    <div className="flex flex-col h-screen bg-[#1c1d1f] text-white overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-[#2d2f31] border-b border-gray-700 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FiX size={24} />
          </button>
          <div>
            <h1 className="text-sm font-semibold line-clamp-1">
              {course.title}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
              <span className="flex items-center gap-1">
                <FiStar className="text-yellow-500" size={12} />
                {course.rating || "4.8"}
              </span>
              <span>•</span>
              <span>{stats.lectures} lectures</span>
              <span>•</span>
              <span>
                {Math.floor(stats.duration / 60)}h {stats.duration % 60}m
              </span>
              {enrollment && (
                <>
                  <span>•</span>
                  <span className="text-purple-400 font-semibold">
                    {enrollment.completionPercentage}% Complete
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="flex items-center gap-2 text-sm px-3 py-2 hover:bg-gray-700 rounded transition-colors"
        >
          <FiList size={18} />
          <span className="hidden md:inline">Course content</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Video Player Section */}
        <div className="flex-1 flex flex-col">
          {/* Video Player */}
          <div className="relative bg-black" style={{ height: "60vh" }}>
            {activeLecture?.videoUrl ? (
              <>
                <video
                  key={activeLecture._id}
                  ref={setVideoRef}
                  src={activeLecture.videoUrl}
                  controls
                  controlsList="nodownload"
                  className="w-full h-full"
                  autoPlay
                  onTimeUpdate={handleVideoProgress}
                >
                  Your browser does not support the video tag.
                </video>
                {/* Temporary Completion Message */}
                {showCompletionMessage && (
                  <div className="absolute bottom-4 right-4">
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm bg-green-600 text-white shadow-lg animate-pulse">
                      <FiCheckCircle size={16} />
                      Completed!
                    </div>
                  </div>
                )}
                {/* Mark Complete Button - Only show after 95% and NOT if already completed */}
                {activeLecture &&
                  showCompleteButton &&
                  !completedLectures.has(activeLecture._id) &&
                  !showCompletionMessage && (
                    <div className="absolute bottom-4 right-4">
                      <button
                        onClick={() => {
                          handleMarkLectureComplete(activeLecture._id, true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-lg bg-purple-600 hover:bg-purple-700 text-white cursor-pointer"
                      >
                        <FiCheckCircle size={16} />
                        Mark as Complete
                      </button>
                    </div>
                  )}
              </>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-900">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiPlay className="text-4xl text-gray-600" />
                  </div>
                  <p className="text-gray-500">
                    Select a lecture to start learning
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tabs & Content Below Video */}
          <div className="flex-1 bg-[#1c1d1f] overflow-y-auto">
            {/* Tabs */}
            <div className="border-b border-gray-700 px-6">
              <div className="flex gap-8">
                {["Overview", "Q&A", "Reviews"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                    className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === tab.toLowerCase()
                        ? "border-white text-white"
                        : "border-transparent text-gray-400 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "overview" && activeLecture && (
                <div>
                  <h2 className="text-2xl font-bold mb-3">
                    {activeLecture.title}
                  </h2>
                  <p className="text-gray-300 leading-relaxed mb-6">
                    {activeLecture.description || course.description}
                  </p>

                  {/* Instructor Info */}
                  {course.tutor && (
                    <div className="mt-8 border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold mb-4">
                        About the instructor
                      </h3>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-xl overflow-hidden shrink-0">
                          {course.tutor.avatar ? (
                            <img
                              src={course.tutor.avatar}
                              alt={course.tutor.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            course.tutor.name?.charAt(0).toUpperCase() || "T"
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">
                            {course.tutor.name}
                          </h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {course.tutor.bio || "Expert Instructor"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "q&a" && (
                <div>
                  {/* Ask Question Form */}
                  <div className="mb-6 p-6 bg-[#2d2f31] rounded-lg">
                    <h3 className="text-lg font-semibold mb-3">
                      Ask a Question
                    </h3>
                    {activeLecture && (
                      <p className="text-xs text-gray-400 mb-3">
                        About: {activeLecture.title}
                      </p>
                    )}
                    <div className="space-y-3">
                      <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Type your question here..."
                        className="w-full bg-[#1c1d1f] border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 resize-none"
                        rows={4}
                      />
                      <button
                        onClick={handleSubmitQuestion}
                        disabled={submittingQuestion}
                        className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                      >
                        {submittingQuestion ? "Posting..." : "Post Question"}
                      </button>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="border-t border-gray-700 pt-6">
                    <h3 className="text-lg font-semibold mb-4">
                      All Questions ({questions.length})
                    </h3>
                    {questions.length > 0 ? (
                      <div className="space-y-4">
                        {questions.map((question) => (
                          <div
                            key={question._id}
                            className="p-4 bg-[#2d2f31] rounded-lg"
                          >
                            {/* Question */}
                            <div className="flex items-start gap-3 mb-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
                                {question.student?.avatar ? (
                                  <img
                                    src={question.student.avatar}
                                    alt={question.student.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  question.student?.name
                                    ?.charAt(0)
                                    .toUpperCase() || "S"
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-semibold text-sm">
                                    {question.student?.name || "Anonymous"}
                                  </h4>
                                  <span className="text-xs text-gray-400">
                                    {new Date(
                                      question.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-300">
                                  {question.question}
                                </p>
                              </div>
                            </div>

                            {/* Answers */}
                            {question.answers &&
                              question.answers.length > 0 && (
                                <div className="ml-13 space-y-3 mb-3">
                                  {question.answers.map((answer, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-start gap-3 pl-4 border-l-2 border-purple-600"
                                    >
                                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden shrink-0">
                                        {answer.user?.avatar ? (
                                          <img
                                            src={answer.user.avatar}
                                            alt={answer.user.name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          answer.user?.name
                                            ?.charAt(0)
                                            .toUpperCase() || "U"
                                        )}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                          <h5 className="font-semibold text-xs">
                                            {answer.user?.name || "Anonymous"}
                                          </h5>
                                          <span className="text-xs text-gray-400">
                                            {new Date(
                                              answer.createdAt,
                                            ).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className="text-sm text-gray-300">
                                          {answer.answer}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                            {/* Answer Form */}
                            {answeringQuestionId === question._id ? (
                              <div className="ml-13 pl-4 border-l-2 border-purple-600">
                                <textarea
                                  value={newAnswer}
                                  onChange={(e) => setNewAnswer(e.target.value)}
                                  placeholder="Write your answer..."
                                  className="w-full bg-[#1c1d1f] border border-gray-700 rounded-lg p-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 resize-none mb-2"
                                  rows={3}
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() =>
                                      handleSubmitAnswer(question._id)
                                    }
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded text-xs font-semibold transition-colors"
                                  >
                                    Submit Answer
                                  </button>
                                  <button
                                    onClick={() => {
                                      setAnsweringQuestionId(null);
                                      setNewAnswer("");
                                    }}
                                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-1 rounded text-xs font-semibold transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setAnsweringQuestionId(question._id)
                                }
                                className="ml-13 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                              >
                                Reply
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiBookOpen className="text-5xl text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">
                          No questions yet. Be the first to ask!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div>
                  {/* Course Rating Summary */}
                  {reviews.length > 0 && (
                    <div className="mb-8 p-6 bg-[#2d2f31] rounded-lg">
                      <div className="flex items-start gap-8">
                        <div className="text-center">
                          <div className="text-5xl font-bold mb-2">
                            {course.rating || "0"}
                          </div>
                          <div className="flex items-center justify-center gap-1 mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FiStar
                                key={star}
                                className={`${
                                  star <= Math.round(course.rating || 0)
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-600"
                                }`}
                                size={16}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-400">
                            {reviews.length}{" "}
                            {reviews.length === 1 ? "review" : "reviews"}
                          </p>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-3">
                            Rating Breakdown
                          </h3>
                          {[5, 4, 3, 2, 1].map((stars) => (
                            <div
                              key={stars}
                              className="flex items-center gap-3 mb-2"
                            >
                              <div className="flex items-center gap-1 w-16">
                                {[...Array(stars)].map((_, i) => (
                                  <FiStar
                                    key={i}
                                    className="text-yellow-500 fill-yellow-500"
                                    size={12}
                                  />
                                ))}
                              </div>
                              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-yellow-500"
                                  style={{
                                    width: `${reviewsBreakdown[stars] || 0}%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-gray-400 w-12 text-right">
                                {reviewsBreakdown[stars] || 0}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* User's Review or Add Review Form */}
                  {userReview && !isEditingReview ? (
                    // Show user's existing review with edit option
                    <div className="mb-8 p-6 bg-[#2d2f31] rounded-lg border-2 border-purple-600">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-semibold">Your Review</h3>
                        <button
                          onClick={handleEditReview}
                          className="text-sm text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                        >
                          <FiSettings size={16} />
                          Edit Review
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Your Rating
                          </label>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FiStar
                                key={star}
                                size={20}
                                className={`${
                                  star <= userReview.rating
                                    ? "text-yellow-500 fill-yellow-500"
                                    : "text-gray-600"
                                }`}
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-400">
                              {userReview.rating} star
                              {userReview.rating > 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Your Comment
                          </label>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            {userReview.comment}
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Reviewed on{" "}
                          {new Date(userReview.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Show review form (for new review or editing)
                    <div className="mb-8 p-6 bg-[#2d2f31] rounded-lg">
                      <h3 className="text-lg font-semibold mb-4">
                        {isEditingReview
                          ? "Edit Your Review"
                          : "Leave a Review"}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Your Rating
                          </label>
                          <div className="flex items-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => setUserRating(star)}
                                className="transition-colors"
                              >
                                <FiStar
                                  size={24}
                                  className={`${
                                    star <= userRating
                                      ? "text-yellow-500 fill-yellow-500"
                                      : "text-gray-600 hover:text-yellow-400"
                                  }`}
                                />
                              </button>
                            ))}
                            {userRating > 0 && (
                              <span className="ml-2 text-sm text-gray-400">
                                {userRating} star{userRating > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Your Review
                          </label>
                          <textarea
                            value={userComment}
                            onChange={(e) => setUserComment(e.target.value)}
                            placeholder="Share your thoughts about this course..."
                            className="w-full bg-[#1c1d1f] border border-gray-700 rounded-lg p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-purple-600 resize-none"
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={handleSubmitReview}
                            disabled={submittingReview}
                            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                          >
                            {submittingReview
                              ? isEditingReview
                                ? "Updating..."
                                : "Submitting..."
                              : isEditingReview
                                ? "Update Review"
                                : "Submit Review"}
                          </button>
                          {isEditingReview && (
                            <button
                              onClick={handleCancelEdit}
                              className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-sm font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Reviews List */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Student Reviews
                    </h3>
                    {reviews.length > 0 ? (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <div
                            key={review._id}
                            className="p-4 bg-[#2d2f31] rounded-lg"
                          >
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold overflow-hidden shrink-0">
                                {review.student?.avatar ? (
                                  <img
                                    src={review.student.avatar}
                                    alt={review.student.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  review.student?.name
                                    ?.charAt(0)
                                    .toUpperCase() || "S"
                                )}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <h4 className="font-semibold text-sm">
                                    {review.student?.name || "Anonymous"}
                                  </h4>
                                  <span className="text-xs text-gray-400">
                                    {new Date(
                                      review.createdAt,
                                    ).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 mb-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar
                                      key={star}
                                      size={12}
                                      className={`${
                                        star <= review.rating
                                          ? "text-yellow-500 fill-yellow-500"
                                          : "text-gray-600"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="text-sm text-gray-300">
                                  {review.comment}
                                </p>
                                {review.tutorReply && (
                                  <div className="mt-3 pl-4 border-l-2 border-purple-600">
                                    <p className="text-xs font-semibold text-purple-400 mb-1">
                                      Instructor Response:
                                    </p>
                                    <p className="text-sm text-gray-300">
                                      {review.tutorReply}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FiStar className="text-5xl text-gray-600 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">
                          No reviews yet. Be the first to review this course!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar - Course Content */}
        {sidebarOpen && (
          <div className="w-full md:w-96 bg-[#2d2f31] border-l border-gray-700 flex flex-col overflow-hidden">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-700">
              <h3 className="font-bold text-lg">Course content</h3>
              <p className="text-xs text-gray-400 mt-1">
                {stats.lectures} lectures • {Math.floor(stats.duration / 60)}h{" "}
                {stats.duration % 60}m
              </p>
              {enrollment && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-purple-400 font-semibold">
                      {enrollment.completionPercentage}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600 transition-all duration-300"
                      style={{ width: `${enrollment.completionPercentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sections List */}
            <div className="flex-1 overflow-y-auto">
              {/* Check sections first, then modules, then lectures */}
              {course.sections?.length > 0 || course.modules?.length > 0 ? (
                (course.sections || course.modules || []).map(
                  (item, itemIdx) => (
                    <div
                      key={item._id || itemIdx}
                      className="border-b border-gray-700"
                    >
                      {/* Section/Module Header */}
                      <button
                        onClick={() => toggleSection(itemIdx)}
                        className="w-full p-4 flex items-center justify-between hover:bg-[#3e4042] transition-colors text-left"
                      >
                        <div className="flex-1 pr-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-gray-400">
                              {course.sections ? "Section" : "Module"}{" "}
                              {itemIdx + 1}
                            </span>
                          </div>
                          <h4 className="font-semibold text-sm">
                            {item.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1">
                            {item.lectures?.length || 0} lectures •{" "}
                            {item.lectures?.reduce(
                              (sum, l) => sum + (l.duration || 0),
                              0,
                            )}{" "}
                            min
                          </p>
                        </div>
                        <FiChevronDown
                          className={`transition-transform ${expandedSections.has(itemIdx) ? "rotate-180" : ""}`}
                        />
                      </button>

                      {/* Lectures List */}
                      {expandedSections.has(itemIdx) && item.lectures && (
                        <div className="bg-[#1c1d1f]">
                          {item.lectures.map((lecture, lectureIdx) => (
                            <button
                              key={lecture._id || lectureIdx}
                              onClick={() => setActiveLecture(lecture)}
                              className={`w-full p-4 flex items-start gap-3 hover:bg-[#3e4042] transition-colors text-left ${
                                activeLecture?._id === lecture._id
                                  ? "bg-[#3e4042]"
                                  : ""
                              }`}
                            >
                              <div
                                className={`shrink-0 mt-0.5 ${
                                  activeLecture?._id === lecture._id
                                    ? "text-white"
                                    : "text-gray-500"
                                }`}
                              >
                                {completedLectures.has(lecture._id) ? (
                                  <FiCheckCircle
                                    size={16}
                                    className="text-green-500"
                                  />
                                ) : (
                                  <FiPlay size={16} />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm ${
                                    activeLecture?._id === lecture._id
                                      ? "text-white font-medium"
                                      : "text-gray-300"
                                  }`}
                                >
                                  {lectureIdx + 1}. {lecture.title}
                                </p>
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                                  <FiClock size={12} />
                                  <span>{lecture.duration || 0} min</span>
                                  {lecture.isPreview && (
                                    <>
                                      <span>•</span>
                                      <span className="text-purple-400">
                                        Preview
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                )
              ) : course.lectures?.length > 0 ? (
                // Direct lectures without modules/sections
                <div>
                  {course.lectures.map((lecture, lectureIdx) => (
                    <button
                      key={lecture._id || lectureIdx}
                      onClick={() => setActiveLecture(lecture)}
                      className={`w-full p-4 flex items-start gap-3 hover:bg-[#3e4042] transition-colors text-left border-b border-gray-700 ${
                        activeLecture?._id === lecture._id ? "bg-[#3e4042]" : ""
                      }`}
                    >
                      <div
                        className={`shrink-0 mt-0.5 ${
                          activeLecture?._id === lecture._id
                            ? "text-white"
                            : "text-gray-500"
                        }`}
                      >
                        {completedLectures.has(lecture._id) ? (
                          <FiCheckCircle size={16} className="text-green-500" />
                        ) : (
                          <FiPlay size={16} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            activeLecture?._id === lecture._id
                              ? "text-white font-medium"
                              : "text-gray-300"
                          }`}
                        >
                          {lectureIdx + 1}. {lecture.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                          <FiClock size={12} />
                          <span>{lecture.duration || 0} min</span>
                          {lecture.isPreview && (
                            <>
                              <span>•</span>
                              <span className="text-purple-400">Preview</span>
                            </>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-gray-400">
                  <FiBookOpen className="text-4xl mx-auto mb-3" />
                  <p>No course content available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
