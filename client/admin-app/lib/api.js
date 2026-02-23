import axios from "axios";
import Cookies from "js-cookie";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("admin_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("admin_token", { path: "/" });
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post("/admin/login", { email, password }),
  getProfile: () => api.get("/admin/me"),
};

// Users APIs
export const usersAPI = {
  getAll: (params) => api.get("/auth/users", { params }),
  getById: (id) => api.get(`/auth/users/${id}`),
  update: (id, data) => api.put(`/auth/users/${id}`, data),
  delete: (id) => api.delete(`/auth/users/${id}`),
  toggleStatus: (id) => api.patch(`/auth/users/${id}/toggle-status`),
};

// Courses APIs
export const coursesAPI = {
  getAll: (params) => api.get("/courses", { params }),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post("/courses", data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  togglePublish: (id) => api.patch(`/courses/${id}/publish`),
};

// Enrollments APIs
export const enrollmentsAPI = {
  getAll: (params) => api.get("/admin/enrollments", { params }),
  getById: (id) => api.get(`/admin/enrollments/${id}`),
  delete: (id) => api.delete(`/admin/enrollments/${id}`),
};

// Payments APIs
export const paymentsAPI = {
  getAll: (params) => api.get("/admin/payments", { params }),
  getById: (id) => api.get(`/admin/payments/${id}`),
  updateStatus: (id, status) =>
    api.patch(`/admin/payments/${id}/status`, { status }),
};

// Reviews APIs
export const reviewsAPI = {
  getAll: (params) => api.get("/reviews/admin/all", { params }),
  delete: (id) => api.delete(`/reviews/admin/${id}`),
};

// Stats APIs
export const statsAPI = {
  getDashboard: () => api.get("/stats/admin-dashboard"),
  getRevenue: (period) => api.get("/stats/revenue", { params: { period } }),
  getUserGrowth: (period) =>
    api.get("/stats/user-growth", { params: { period } }),
  getPaymentAnalytics: (year) =>
    api.get("/stats/payment-analytics", { params: { year } }),
};

export default api;
