import Sidebar from "../../components/student/Sidebar";
import { FiSearch, FiBell, FiMessageSquare } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const Layout = ({ children }) => {
  const { user } = useAuth();
  const displayName = user?.name || "Student";

  return (
    <div className="flex min-h-screen bg-[#0F0F16] font-sans text-white">
      {/* 1. Fixed Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area (Sidebar ke right side) */}
      <div className="flex-1 flex flex-col transition-all duration-300">

        {/* Dynamic Page Content */}
        <main className="p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;