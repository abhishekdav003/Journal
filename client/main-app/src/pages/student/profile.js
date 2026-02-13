import { useEffect } from "react";
import { useRouter } from "next/router";
import DashboardHome from "../../components/student/DashboardHome";
import { useAuth } from "../../context/AuthContext";
import Layout from "./layout";

export default function Profile() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (loading) return;
    const token =
      typeof window !== "undefined" && localStorage.getItem("token");
    if (!token || !user) {
      router.replace("/auth/student?tab=login");
    }
  }, [loading, user, router]);

  // Show loading state
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      </Layout>
    );
  }

  // Don't render if not authenticated
  if (!user) return null;

  return (
    <Layout>
      <DashboardHome user={user} />
    </Layout>
  );
}
