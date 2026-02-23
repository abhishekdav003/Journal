"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";

export default function Home() {
  const router = useRouter();
  const { admin, loading } = useAdmin();

  useEffect(() => {
    if (!loading) {
      if (admin) {
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    }
  }, [admin, loading, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
