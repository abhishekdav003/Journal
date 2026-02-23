"use client";

import { useEffect, useState } from "react";
import { statsAPI } from "@/lib/api";
import toast from "react-hot-toast";

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentAnalytics, setPaymentAnalytics] = useState(null);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const loadPaymentAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const response = await statsAPI.getPaymentAnalytics(selectedYear);
        const analyticsData = response.data.data;
        setPaymentAnalytics(analyticsData);

        if (selectedYear !== currentYear && analyticsData?.availableYears) {
          const hasCurrentYear =
            analyticsData.availableYears.includes(currentYear);
          if (hasCurrentYear) {
            setSelectedYear(currentYear);
          }
        }
      } catch (error) {
        toast.error("Failed to fetch payment analytics");
        console.error(error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    loadPaymentAnalytics();
  }, [selectedYear, currentYear]);

  const fetchStats = async () => {
    try {
      const response = await statsAPI.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch statistics");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon, bgColor, textColor }) => (
    <div className={`${bgColor} rounded-xl shadow-md p-4 lg:p-6`}>
      <div className="flex items-center justify-between">
        <div>
          <p
            className={`${textColor} text-xs lg:text-sm font-medium opacity-80`}
          >
            {title}
          </p>
          <p
            className={`${textColor} text-xl lg:text-3xl font-bold mt-1 lg:mt-2`}
          >
            {value || 0}
          </p>
        </div>
        <div className={`text-2xl lg:text-4xl ${textColor} opacity-80`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-full overflow-hidden">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-sm lg:text-base text-gray-600 mt-2">
          Welcome to the admin panel
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 mb-6 lg:mb-8">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers}
          icon="👥"
          bgColor="bg-linear-to-br from-blue-500 to-blue-600"
          textColor="text-white"
        />
        <StatCard
          title="Total Courses"
          value={stats?.totalCourses}
          icon="📚"
          bgColor="bg-linear-to-br from-green-500 to-green-600"
          textColor="text-white"
        />
        <StatCard
          title="Active Enrollments"
          value={stats?.activeEnrollments}
          icon="✅"
          bgColor="bg-linear-to-br from-purple-500 to-purple-600"
          textColor="text-white"
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon="💰"
          bgColor="bg-linear-to-br from-orange-500 to-orange-600"
          textColor="text-white"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            User Distribution
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Students</span>
              <span className="font-bold text-blue-600">
                {stats?.studentCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Tutors</span>
              <span className="font-bold text-green-600">
                {stats?.tutorCount || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="font-bold text-purple-600">
                {stats?.totalUsers || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Course Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Published</span>
              <span className="font-bold text-green-600">
                {stats?.publishedCourses || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Draft</span>
              <span className="font-bold text-yellow-600">
                {stats?.draftCourses || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Avg Rating</span>
              <span className="font-bold text-orange-600">
                {stats?.averageRating?.toFixed(1) || 0} ⭐
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Payment Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <span className="font-bold text-green-600">
                {stats?.completedPayments || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="font-bold text-yellow-600">
                {stats?.pendingPayments || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Failed</span>
              <span className="font-bold text-red-600">
                {stats?.failedPayments || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Analytics Graph */}
      <div className="mt-6 lg:mt-8 bg-white rounded-xl shadow-md p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg lg:text-xl font-semibold text-gray-800">
              Payment Analytics
            </h3>
            <p className="text-xs lg:text-sm text-gray-600 mt-1">
              Monthly revenue breakdown for {selectedYear}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              {paymentAnalytics?.availableYears?.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {analyticsLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6">
              <div className="bg-linear-to-br from-green-500 to-green-600 rounded-lg p-3 lg:p-4 text-white">
                <p className="text-xs opacity-80">Total Revenue</p>
                <p className="text-lg lg:text-2xl font-bold mt-1">
                  ₹{paymentAnalytics?.totalRevenue?.toLocaleString() || 0}
                </p>
              </div>
              <div className="bg-linear-to-br from-blue-500 to-blue-600 rounded-lg p-3 lg:p-4 text-white">
                <p className="text-xs opacity-80">Total Transactions</p>
                <p className="text-lg lg:text-2xl font-bold mt-1">
                  {paymentAnalytics?.totalTransactions || 0}
                </p>
              </div>
            </div>

            {/* Line Chart */}
            <div className="overflow-x-auto md:overflow-x-visible">
              <div className="min-w-140 md:min-w-0 w-full h-64 md:h-72 lg:h-80 relative flex">
                {/* Y-axis labels */}
                <div className="w-14 md:w-16 lg:w-20 flex flex-col justify-between py-2 pr-2">
                  {(() => {
                    const maxAmount = Math.max(
                      ...paymentAnalytics.monthlyData.map((m) => m.totalAmount),
                      1,
                    );
                    const steps = [
                      maxAmount,
                      maxAmount * 0.75,
                      maxAmount * 0.5,
                      maxAmount * 0.25,
                      0,
                    ];
                    return steps.map((value, i) => (
                      <div
                        key={i}
                        className="text-xs lg:text-sm text-gray-600 text-right"
                      >
                        ₹
                        {value >= 1000
                          ? `${(value / 1000).toFixed(0)}k`
                          : value.toFixed(0)}
                      </div>
                    ));
                  })()}
                </div>

                {/* Chart */}
                <div className="flex-1 relative">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 1200 320"
                    preserveAspectRatio="none"
                  >
                    {/* Grid lines */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <line
                        key={i}
                        x1="0"
                        y1={i * 80}
                        x2="1200"
                        y2={i * 80}
                        stroke="#e5e7eb"
                        strokeWidth="1"
                      />
                    ))}

                    {/* Generate curved line path */}
                    {(() => {
                      const maxAmount = Math.max(
                        ...paymentAnalytics.monthlyData.map(
                          (m) => m.totalAmount,
                        ),
                        1,
                      );
                      const points = paymentAnalytics.monthlyData.map(
                        (data, index) => ({
                          x: ((index + 0.5) * 1200) / 12,
                          y: 280 - (data.totalAmount / maxAmount) * 240,
                          amount: data.totalAmount,
                        }),
                      );

                      // Create smooth curve using cubic bezier curves (clamped to avoid dip below baseline)
                      const createSmoothCurve = (pts) => {
                        if (pts.length < 2) return "";
                        const clamp = (value, min, max) =>
                          Math.min(Math.max(value, min), max);
                        const topY = 40;
                        const bottomY = 280;

                        let path = `M ${pts[0].x},${pts[0].y}`;

                        for (let i = 0; i < pts.length - 1; i++) {
                          const current = pts[i];
                          const next = pts[i + 1];

                          // Calculate control points for smooth curve
                          const tension = 0.22;
                          const prev = i > 0 ? pts[i - 1] : current;
                          const afterNext =
                            i < pts.length - 2 ? pts[i + 2] : next;

                          const cp1x = current.x + (next.x - prev.x) * tension;
                          const cp1yRaw =
                            current.y + (next.y - prev.y) * tension;
                          const cp2x =
                            next.x - (afterNext.x - current.x) * tension;
                          const cp2yRaw =
                            next.y - (afterNext.y - current.y) * tension;

                          const segmentMinY = Math.min(current.y, next.y);
                          const segmentMaxY = Math.max(current.y, next.y);
                          const cp1y = clamp(
                            cp1yRaw,
                            Math.max(topY, segmentMinY),
                            Math.min(bottomY, segmentMaxY),
                          );
                          const cp2y = clamp(
                            cp2yRaw,
                            Math.max(topY, segmentMinY),
                            Math.min(bottomY, segmentMaxY),
                          );

                          path += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${next.x},${next.y}`;
                        }

                        return path;
                      };

                      const pathD = createSmoothCurve(points);

                      // Create gradient fill path
                      const fillPath =
                        pathD +
                        ` L ${points[points.length - 1].x},320 L ${points[0].x},320 Z`;

                      return (
                        <>
                          {/* Gradient definition */}
                          <defs>
                            <linearGradient
                              id="lineGradient"
                              x1="0%"
                              y1="0%"
                              x2="0%"
                              y2="100%"
                            >
                              <stop
                                offset="0%"
                                stopColor="#3b82f6"
                                stopOpacity="0.3"
                              />
                              <stop
                                offset="100%"
                                stopColor="#3b82f6"
                                stopOpacity="0.05"
                              />
                            </linearGradient>
                          </defs>

                          {/* Fill area under the curve */}
                          <path d={fillPath} fill="url(#lineGradient)" />

                          {/* Main line */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#60a5fa"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeOpacity="0.35"
                          />
                          <path
                            d={pathD}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />

                          {/* Data points with value labels */}
                          {points.map((point, index) => (
                            <g key={index}>
                              <circle
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                fill="white"
                                stroke="#3b82f6"
                                strokeWidth="2.5"
                                className="hover:r-8 transition-all cursor-pointer"
                              />
                              {/* Value label above point */}
                              {point.amount > 0 && (
                                <text
                                  x={point.x}
                                  y={point.y - 15}
                                  textAnchor="middle"
                                  className="text-xs fill-gray-700 font-semibold"
                                  style={{ fontSize: "11px" }}
                                >
                                  ₹
                                  {point.amount >= 1000
                                    ? `${(point.amount / 1000).toFixed(1)}k`
                                    : point.amount}
                                </text>
                              )}
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>

                  {/* Month labels and hover info */}
                  <div className="absolute inset-0 flex items-end justify-between pointer-events-none">
                    {paymentAnalytics?.monthlyData?.map((data, index) => (
                      <div
                        key={index}
                        className="relative flex-1 flex flex-col items-center pointer-events-auto group"
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                            <div className="font-semibold">
                              {data.month} {selectedYear}
                            </div>
                            <div className="mt-1">
                              Revenue: ₹{data.totalAmount.toLocaleString()}
                            </div>
                            <div>Transactions: {data.count}</div>
                          </div>
                        </div>

                        {/* Month Label */}
                        <div className="text-xs lg:text-sm font-medium text-gray-600 mt-2">
                          {data.month}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-center gap-6 text-xs lg:text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-blue-500 rounded"></div>
                  <span>Revenue Trend</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-white border-2 border-blue-500 rounded-full"></div>
                  <span>Data Points</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
