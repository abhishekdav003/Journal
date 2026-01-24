import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
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
export const resetPassword = (token, data) => API.post(`/auth/reset-password/${token}`, data);
export const changePassword = (data) => API.post("/auth/forgot-password", data);

export const getStudentData = () => API.get("/student-data");
export const getTeacherData = () => API.get("/teacher-data");
export const getAdminData = () => API.get("/admin-data");
