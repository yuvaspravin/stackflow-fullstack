import React from "react";
import { useOutletContext, useSearchParams } from "react-router-dom";
import {
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Area,
  AreaChart,
} from "recharts";
import {
  AlertTriangle,
  IndianRupee,
  Package,
  ShoppingCart,
  ArrowUpRight,
  Loader2,
  Clock,
  TrendingUp,
  FileText,
  Download,
} from "lucide-react";

// --- Infrastructure ---
import Card from "../components/common/Card";
import { useGetDashboardDataQuery } from "../redux/api/apiSlice";
import { formatINR } from "../utils/formatCurrency";
import { exportToCSV, generateDashboardPDF } from "../utils/exportUtils";

const DashboardPage = () => {
  const { currentUser } = useOutletContext();

  // 1. URL STATE: Grab the search term from the Global Topbar
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  // 2. API HOOK: RTK Query auto-refetches whenever 'searchTerm' changes
  const { data, isLoading, isError } = useGetDashboardDataQuery(searchTerm);

  if (isLoading) return <FullPageLoader />;

  if (isError) {
    return (
      <div className="p-10 text-center text-rose-500 font-bold bg-rose-50 rounded-2xl border border-rose-100">
        Dashboard sync failed. Please check your network connection.
      </div>
    );
  }

  const { stats, chartData, recentOrders } = data;

  return (
    <div className="font-sans animate-in fade-in duration-500 pb-10 space-y-8">
      {/* 3. HEADER & ACTION SECTION */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
            Global Overview
          </p>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">
            Welcome, {currentUser?.name?.split(" ")[0] || "User"}
          </h2>
        </div>

        {/* Action Buttons for Business Intelligence */}
        <div className="flex items-center gap-2 w-full xl:w-auto">
          <button
            onClick={() => generateDashboardPDF(stats, recentOrders)}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
          >
            <FileText size={14} /> PDF Report
          </button>
          <button
            onClick={() => exportToCSV(recentOrders, "StockFlow_Sales_Export")}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-100 transition-all"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* 4. METRIC CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Inventory Volume"
          value={stats.totalProducts}
          subText="Total SKUs managed"
          icon={<Package size={20} />}
          color="bg-indigo-50 text-indigo-600"
        />
        <MetricCard
          label="Total Sales"
          value={stats.totalOrders}
          subText="Orders processed"
          icon={<ShoppingCart size={20} />}
          color="bg-blue-50 text-blue-600"
        />
        <MetricCard
          label="Gross Revenue"
          value={formatINR(stats.totalRevenue)}
          subText="Total income earned"
          icon={<IndianRupee size={20} />}
          color="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          label="Outstanding Dues"
          value={formatINR(stats.totalDues)}
          subText={
            stats.lowStockCount > 0
              ? `${stats.lowStockCount} items low stock`
              : "Payments pending"
          }
          icon={<AlertTriangle size={20} />}
          color="bg-rose-50 text-rose-600"
          highlight={stats.totalDues > 0}
        />
      </div>

      {/* 5. MAIN CONTENT: CHART & RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Area Chart */}
        <Card className="lg:col-span-2 flex flex-col p-6 shadow-sm border-slate-200">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                Revenue Pipeline
              </h3>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                Last 7 Transactions Analysis
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-[10px] font-bold text-blue-600 uppercase">
              <TrendingUp size={12} /> Trend
            </div>
          </div>

          <div className="w-full h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }}
                  tickFormatter={(val) => `₹${val}`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                  formatter={(value) => [formatINR(value), "Revenue"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Filtered Recent Activity Sidebar */}
        <Card className="p-6 border-slate-200 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recent Activity
            </h3>
            {searchTerm && (
              <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md font-bold uppercase">
                Filtered
              </span>
            )}
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto pr-1 custom-scrollbar">
            {recentOrders.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-20 py-20">
                <Clock size={48} className="mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">
                  No Matches
                </p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order._id}
                  className="flex justify-between items-center p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-100 text-slate-400 rounded-lg">
                      <Clock size={14} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">
                        {order.customerName}
                      </p>
                      <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-tighter">
                        {order.orderId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">
                      {formatINR(order.totalAmount)}
                    </p>
                    <p
                      className={`text-[8px] font-bold uppercase ${order.paymentStatus === "Paid" ? "text-emerald-500" : "text-amber-500"}`}
                    >
                      {order.paymentStatus}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Business Sync: Live
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Reusable Metric Card Sub-component
const MetricCard = ({ label, value, subText, icon, color, highlight }) => (
  <Card
    className={`p-6 border-slate-200 transition-all hover:shadow-md ${highlight ? "ring-1 ring-rose-500 ring-offset-2" : ""}`}
  >
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
          {label}
        </p>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
          {value}
        </h3>
      </div>
      <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
    </div>
    <div className="mt-4 flex items-center justify-between">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
        {subText}
      </p>
      <ArrowUpRight size={12} className="text-slate-300" />
    </div>
  </Card>
);

// Loading State Sub-component
const FullPageLoader = () => (
  <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
    <Loader2 className="animate-spin text-blue-600 w-12 h-12" />
    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest animate-pulse">
      Syncing Operational Intelligence...
    </p>
  </div>
);

export default DashboardPage;
