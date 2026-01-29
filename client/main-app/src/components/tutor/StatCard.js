import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color }) {
  // Color configuration based on prop
  const colorStyles = {
    purple: "bg-purple-50 text-purple-600 group-hover:bg-purple-600 group-hover:text-white",
    blue: "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white",
    orange: "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white",
    green: "bg-green-50 text-green-600 group-hover:bg-green-600 group-hover:text-white",
  };

  const selectedColor = colorStyles[color] || colorStyles.purple;
  const isPositive = trend === "up";

  return (
    <div className={`group bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 hover:border-${color}-200 transition-all duration-300 h-full`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-2xl transition-colors duration-300 ${selectedColor}`}>
          <Icon size={24} />
        </div>
        {trendValue && (
          <span className={`flex items-center gap-1 font-bold text-sm px-3 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {isPositive ? <FiArrowUpRight size={14} /> : <FiArrowDownRight size={14} />} 
            {trendValue}
          </span>
        )}
      </div>
      <p className="text-gray-500 text-sm font-bold uppercase tracking-wider text-left">{title}</p>
      <h3 className="text-4xl font-black text-gray-900 mt-2 text-left">{value}</h3>
    </div>
  );
}