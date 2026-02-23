"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { authAPI } from "@/lib/api";
import toast from "react-hot-toast";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get("admin_token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.getProfile();
      if (response.data && response.data.data && response.data.data.user) {
        setAdmin(response.data.data.user);
      } else {
        console.error("Invalid response structure");
        Cookies.remove("admin_token", { path: "/" });
      }
    } catch (error) {
      console.error("Auth check failed:", error.response?.status);
      // Only remove token on 401 (unauthorized) or 403 (forbidden)
      if (error.response?.status === 401 || error.response?.status === 403) {
        Cookies.remove("admin_token", { path: "/" });
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, data } = response.data;

      if (data.user.role !== "admin") {
        toast.error("Admin access only");
        return false;
      }

      // Set cookie with 12 hours expiry (0.5 days)
      Cookies.set("admin_token", token, {
        expires: 0.5,
        path: "/",
        sameSite: "strict",
      });
      setAdmin(data.user);
      toast.success("Login successful");
      router.push("/dashboard");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  };

  const logout = () => {
    Cookies.remove("admin_token", { path: "/" });
    setAdmin(null);
    router.push("/login");
    toast.success("Logged out successfully");
  };

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};
