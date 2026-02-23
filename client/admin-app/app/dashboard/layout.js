"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen overflow-x-hidden">
        <Sidebar />
        <main className="flex-1 bg-gray-50 min-h-screen lg:ml-64 pt-16 lg:pt-0 pb-20 lg:pb-0 w-full max-w-full overflow-x-hidden">
          <div className="p-4 sm:p-6 lg:p-8 max-w-full">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
