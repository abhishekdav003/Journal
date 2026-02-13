import TutorSidebar from './Sidebar';
import MobileTabBar from './MobileTabBar';

export default function TutorLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar - Only visible on large screens */}
      <div className="hidden lg:block sticky top-0 left-0 h-screen">
        <TutorSidebar />
      </div>

      {/* Main Content Area - Responsive padding and margins */}
      <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Tab Bar - Only visible on mobile/tablet */}
      <MobileTabBar />
    </div>
  );
}