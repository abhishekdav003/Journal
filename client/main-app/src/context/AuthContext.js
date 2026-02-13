import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { getMe } from "../services/apiService";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      try {
        const token =
          typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const rawUser = localStorage.getItem("user");

        let parsed = null;
        try {
          if (rawUser && rawUser !== "undefined") {
            parsed = JSON.parse(rawUser);
            if (parsed && parsed.user) parsed = parsed.user;
          }
        } catch (e) {
          parsed = null;
        }

        if (mounted && parsed) setUser(parsed);

        // Only attempt to refresh from API when we have a valid token string
        if (token && token !== "undefined") {
          // fetch authoritative user from API and sync localStorage
          try {
            const res = await getMe();
            const fetched = res.data?.data?.user || res.data?.user || res.data;
            if (fetched) {
              localStorage.setItem("user", JSON.stringify(fetched));
              if (mounted) setUser(fetched);
            }
          } catch (err) {
            // Handle unauthorized separately to avoid noisy stack traces
            const status = err?.response?.status;
            if (status === 401) {
              // Token expired or invalid - redirect to login
              // Clear stored auth state
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              if (mounted) setUser(null);
              // Redirect to login page
              if (typeof window !== "undefined") {
                window.location.href = "/auth/student?tab=login";
              }
            } else {
              // Clear stored auth state on any failure to keep UI consistent
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              if (mounted) setUser(null);
            }
          }
        }
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const login = (userData, token) => {
    if (token) localStorage.setItem("token", token);
    const userToStore = userData?.user || userData;
    localStorage.setItem("user", JSON.stringify(userToStore));
    setUser(userToStore);
    // Dispatch custom event for same-window components to detect auth change
    window.dispatchEvent(
      new CustomEvent("auth-update", { detail: userToStore }),
    );
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/auth/student?tab=login");
  };

  const refreshUser = async () => {
    try {
      const res = await getMe();
      const fetched = res.data?.data?.user || res.data?.user || res.data;
      if (fetched) {
        localStorage.setItem("user", JSON.stringify(fetched));
        setUser(fetched);
      }
    } catch (err) {
      // Silently fail
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
