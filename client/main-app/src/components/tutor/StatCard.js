import { FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";

export default function StatCard({ title, value, icon: Icon, trend, trendValue, color }) {
  // Color configuration based on prop - dark theme for tutor dashboard
  const colorStyles = {
    purple: "bg-purple-600/20 text-purple-400 group-hover:bg-purple-600 group-hover:text-white border-purple-500/50 group-hover:border-purple-400",
    blue: "bg-blue-600/20 text-blue-400 group-hover:bg-blue-600 group-hover:text-white border-blue-500/50 group-hover:border-blue-400",
    orange: "bg-orange-600/20 text-orange-400 group-hover:bg-orange-600 group-hover:text-white border-orange-500/50 group-hover:border-orange-400",
    green: "bg-green-600/20 text-green-400 group-hover:bg-green-600 group-hover:text-white border-green-500/50 group-hover:border-green-400",
  };

  const shadowColorMap = {
    purple: "shadow-purple-900/20 hover:shadow-purple-900/30",
    blue: "shadow-blue-900/20 hover:shadow-blue-900/30",
    orange: "shadow-orange-900/20 hover:shadow-orange-900/30",
    green: "shadow-green-900/20 hover:shadow-green-900/30",
  };

  const selectedColor = colorStyles[color] || colorStyles.purple;
  const selectedShadow = shadowColorMap[color] || shadowColorMap.purple;
  const isPositive = trend === "up";
  const borderColor = {
    purple: "hover:border-purple-500/50",
    blue: "hover:border-blue-500/50",
    orange: "hover:border-orange-500/50",
    green: "hover:border-green-500/50",
  };

  return (
    <div className={`group bg-linear-to-br from-[#1E1E2E] via-[#1F1F2E] to-[#2B2B40] p-3 sm:p-4 lg:p-5 rounded-2xl lg:rounded-3xl shadow-2xl border border-gray-800/50 ${selectedShadow} ${borderColor[color] || borderColor.purple} transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 h-full backdrop-blur-sm relative overflow-hidden`}>
      {/* Decorative gradient background */}
      <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-300`} style={{background: color === 'purple' ? '#8b5cf6' : color === 'blue' ? '#3b82f6' : color === 'orange' ? '#f97316' : '#22c55e'}}></div>
      <div className="flex justify-between items-start mb-2 sm:mb-3 gap-2">
        <div className={`p-2 sm:p-2.5 lg:p-3 rounded-lg sm:rounded-xl transition-all duration-300 border ${selectedColor}`}>
          <Icon size={16} className="sm:w-5 sm:h-5 lg:w-5 lg:h-5" />
        </div>
        {trendValue && (
          <span className={`flex items-center gap-1 font-bold text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full whitespace-nowrap ${isPositive ? 'bg-green-600/20 text-green-400 border border-green-500/50' : 'bg-red-600/20 text-red-400 border border-red-500/50'}`}>
            {isPositive ? <FiArrowUpRight size={12} /> : <FiArrowDownRight size={12} />} 
            <span>{trendValue}</span>
          </span>
        )}
      </div>
      <p className="text-gray-400 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-left group-hover:text-gray-300 transition-colors duration-300">{title}</p>
      <h3 className="text-lg sm:text-xl lg:text-3xl font-black bg-linear-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mt-1 sm:mt-1.5 lg:mt-2 text-left group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-purple-300 transition-all duration-300 animate-in fade-in">{value}</h3>
    </div>
  );
}