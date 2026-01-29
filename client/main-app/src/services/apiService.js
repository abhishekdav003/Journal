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
export const getTutorCourses = () => API.get('/courses/tutor/my-courses');
export const togglePublishCourse = (id) => API.patch(`/courses/${id}/publish`);

// Course Management (Tutor)
export const createCourse = (data) => API.post("/courses", data);
export const getCourse = (id) => API.get(`/courses/${id}`);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const addModule = (id, data) => API.post(`/courses/${id}/modules`, data);
export const archiveCourse = (id) => API.patch(`/courses/${id}/archive`);

// Analytics
export const getTutorStats = () => API.get("/dashboard/stats");
export const getTutorLearners = () => API.get("/enrollments/tutor/my-students");

// Reviews
export const getTutorReviews = () => API.get("/reviews/tutor");
export const replyToReview = (id, data) => API.patch(`/reviews/${id}/reply`, data);