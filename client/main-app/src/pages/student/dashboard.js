import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../context/AuthContext";

function StudentDashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

   // DEBUGGING: Console check karo
  useEffect(() => {
    if (user) {
      console.log("Current User Data in Header:", user);
    }
  }, [user]);

  const displayName = user?.name || user?.user?.name || user?.fullName || "User";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/student?tab=login");
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <h1>Student Dashboard</h1>
      <p>Welcome, {displayName}!</p>
    </div>
  );
}

export default StudentDashboardPage;
