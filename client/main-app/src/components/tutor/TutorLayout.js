import TutorSidebar from './Sidebar';
import MobileTabBar from './MobileTabBar';

export default function TutorLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#0F0F1E] flex flex-col lg:flex-row">
      {/* Desktop Sidebar - Only visible on large screens */}
      <div className="hidden lg:block w-64 lg:w-72 shrink-0 border-r border-gray-800/50">
        <TutorSidebar />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pb-16 lg:pb-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Bottom Tab Bar - Only visible on mobile/tablet */}
      <MobileTabBar />
    </div>
  );
}