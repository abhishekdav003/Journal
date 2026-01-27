import Layout from "./layout";

export default function Courses() {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">My Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Dummy Content */}
            <div className="bg-[#1E1E2E] h-48 rounded-3xl border border-gray-800 flex items-center justify-center text-gray-500">
                Course 1
            </div>
            <div className="bg-[#1E1E2E] h-48 rounded-3xl border border-gray-800 flex items-center justify-center text-gray-500">
                Course 2
            </div>
        </div>
      </div>
    </Layout>
  );
}