import { useEffect } from "react";
import { useRouter } from "next/router";
import AuthSlider from "@/components/auth/authSlider";

export default function AuthPage() {
  const router = useRouter();
  const { role, tab = "login" } = router.query;

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      const userData = JSON.parse(user);
      // Redirect to appropriate dashboard based on role
      if (userData.role === "student") {
        router.replace("/student/courses");
      } else if (userData.role === "tutor") {
        router.replace("/tutor/dashboard");
      }
      return;
    }

    // Validate role parameter
    if (role && role !== "student" && role !== "tutor") {
      router.push("/");
    }
  }, [role, router]);

  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#EAD7FC]">
        <div className="w-12 h-12 border-4 border-[#8834D3] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (role !== "student" && role !== "tutor") {
    return null;
  }

  return (
    <>
      <AuthSlider role={role} activeTab={tab} />
    </>
  );
}
