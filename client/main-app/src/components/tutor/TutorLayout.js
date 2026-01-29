import TutorSidebar from './Sidebar';

export default function TutorLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar is fixed width */}
      <TutorSidebar />

      {/* Main Content Area - pushed right by the sidebar width (ml-64) */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}