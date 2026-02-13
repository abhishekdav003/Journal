import axios from "axios";

const API = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export const login = (data) => API.post("/auth/login", data);
export const register = (data) => API.post("/auth/register", data);
export const resetPassword = (token, data) =>
  API.post(`/auth/reset-password/${token}`, data);
export const changePassword = (data) => API.post("/auth/change-password", data);
export const updateProfile = (data) => API.patch("/auth/update-profile", data);

export const getMe = () => API.get("/auth/me");

export const getStudentData = () => API.get("/student-data");
export const getTeacherData = () => API.get("/teacher-data");
export const getAdminData = () => API.get("/admin-data");
export const uploadAvatar = (formData) =>
  API.post("/auth/upload-avatar", formData);

// Dashboard APIs
export const getDashboardStats = () => API.get("/dashboard/stats");
export const getEnrolledCourses = () => API.get("/dashboard/courses");

// Payment APIs
export const getPaymentHistory = () => API.get("/payments/history");

// Tutor/Course specific APIs
export const getTutorCourses = () => API.get("/courses/tutor/my-courses");
export const togglePublishCourse = (id) => API.patch(`/courses/${id}/publish`);

// Public Course APIs
export const getAllCourses = (params) => API.get("/courses", { params });

// Course Management (Tutor)
export const createCourse = (data) => API.post("/courses", data);
export const getCourse = (id) => API.get(`/courses/${id}`);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
export const addModule = (id, data) => API.post(`/courses/${id}/modules`, data);
export const updateModule = (id, moduleId, data) =>
  API.put(`/courses/${id}/modules/${moduleId}`, data);
export const deleteModule = (id, moduleId) =>
  API.delete(`/courses/${id}/modules/${moduleId}`);
export const addLecture = (id, data) =>
  API.post(`/courses/${id}/lectures`, data);
export const updateLecture = (id, lectureId, data) =>
  API.put(`/courses/${id}/lectures/${lectureId}`, data);
export const deleteLecture = (id, lectureId) =>
  API.delete(`/courses/${id}/lectures/${lectureId}`);
export const archiveCourse = (id) => API.patch(`/courses/${id}/archive`);

// Video Upload
export const uploadVideo = (formData, onUploadProgress, options = {}) =>
  API.post("/videos/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 1800000, // 30 minutes for large videos
    onUploadProgress: onUploadProgress,
    ...options,
  });
export const uploadThumbnail = (formData) =>
  API.post("/videos/thumbnail", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// Analytics
export const getTutorStats = () => API.get("/dashboard/stats");
export const getTutorLearners = () => API.get("/enrollments/tutor/my-students");

// Reviews
export const getTutorReviews = () => API.get("/reviews/tutor");
export const replyToReview = (id, data) =>
  API.patch(`/reviews/${id}/reply`, data);
export const getCourseReviews = (courseId) =>
  API.get(`/reviews/course/${courseId}`);
export const createReview = (courseId, data) =>
  API.post(`/reviews/course/${courseId}`, data);
export const updateReview = (reviewId, data) =>
  API.patch(`/reviews/${reviewId}`, data);

// Questions (Q&A)
export const getCourseQuestions = (courseId) =>
  API.get(`/questions/course/${courseId}`);
export const createQuestion = (courseId, data) =>
  API.post(`/questions/course/${courseId}`, data);
export const answerQuestion = (questionId, data) =>
  API.post(`/questions/${questionId}/answer`, data);

// Progress Tracking
export const updateLectureProgress = (courseId, data) =>
  API.patch(`/enrollments/${courseId}/progress`, data);
export const getEnrollmentProgress = (courseId) =>
  API.get(`/enrollments/${courseId}`);

// Public Stats (no auth required)
export const getPlatformStats = () => API.get("/stats/platform");
export const getPublicReviews = (limit = 6) =>
  API.get(`/stats/reviews?limit=${limit}`);
