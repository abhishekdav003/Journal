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
        const token = localStorage.getItem("token");
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

        if (token) {
          // fetch authoritative user from API and sync localStorage
          try {
            const res = await getMe();
            const fetched = res.data?.data?.user || res.data?.user || res.data;
            if (fetched) {
              localStorage.setItem("user", JSON.stringify(fetched));
              if (mounted) setUser(fetched);
            }
          } catch (err) {
            console.error("Failed to refresh user from API:", err);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            if (mounted) setUser(null);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
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
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/auth/student?tab=login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);