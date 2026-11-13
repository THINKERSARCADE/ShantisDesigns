import React, { useState } from 'react';
import { DailyMetricPoint, PaymentChannelBreakdown } from '../utils/dashboardLogic';
import { TrendingUp, MessageSquare, Smartphone, DollarSign, Calendar, Layers } from 'lucide-react';

interface DashboardChartsProps {
  timeSeriesData: DailyMetricPoint[];
  channelBreakdown: PaymentChannelBreakdown;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  timeSeriesData,
  channelBreakdown
}) => {
  const [activeRange, setActiveRange] = useState<'30d' | '14d' | '7d'>('30d');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Slice time series based on selected range
  const sliceCount = activeRange === '7d' ? 7 : activeRange === '14d' ? 14 : 30;
  const filteredData = timeSeriesData.slice(-sliceCount);

  // Math for Line Chart SVG
  const maxRevenue = Math.max(...filteredData.map(d => d.revenueKes), 100000);
  const maxLeads = Math.max(...filteredData.map(d => d.leadsCount), 10);

  const chartWidth = 600;
  const chartHeight = 180;
  const paddingX = 20;
  const paddingY = 20;

  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  // Build SVG Points
  const revenuePoints = filteredData.map((d, idx) => {
    const x = paddingX + (idx / Math.max(1, filteredData.length - 1)) * usableWidth;
    const y = chartHeight - paddingY - (d.revenueKes / maxRevenue) * usableHeight;
    return { x, y, data: d };
  });

  const leadsPoints = filteredData.map((d, idx) => {
    const x = paddingX + (idx / Math.max(1, filteredData.length - 1)) * usableWidth;
    const y = chartHeight - paddingY - (d.leadsCount / maxLeads) * usableHeight;
    return { x, y, data: d };
  });

  const revenueSvgPath = revenuePoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`, '');
  const leadsSvgPath = leadsPoints.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`, '');

  // Fill area under revenue line
  const revenueAreaPath = `${revenueSvgPath} L ${revenuePoints[revenuePoints.length - 1]?.x},${chartHeight - paddingY} L ${revenuePoints[0]?.x},${chartHeight - paddingY} Z`;

  // Total summary for current view
  const currentTotalRevenue = filteredData.reduce((sum, d) => sum + d.revenueKes, 0);
  const currentTotalLeads = filteredData.reduce((sum, d) => sum + d.leadsCount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* CHART 1: Interactive Line Graph — "Revenue vs. WhatsApp Leads" */}
      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
        
        {/* Header & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#F58220]" />
              <h3 className="font-extrabold text-base text-slate-900">
                Revenue vs. WhatsApp Leads Analytics
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative 30-day view of online sales (KES) vs direct WhatsApp sizing inquiries
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setActiveRange('7d')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeRange === '7d' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setActiveRange('14d')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeRange === '14d' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setActiveRange('30d')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeRange === '30d' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
          </div>
        </div>

        {/* Legend Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase text-emerald-800 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#238B3D]"></span>
                Total Revenue ({activeRange})
              </p>
              <p className="text-lg font-black text-slate-900 mt-0.5 font-mono">
                KES {currentTotalRevenue.toLocaleString()}
              </p>
            </div>
            <DollarSign className="w-6 h-6 text-[#238B3D]/40" />
          </div>

          <div className="bg-amber-50/60 border border-amber-100 rounded-xl p-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase text-amber-800 flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F58220]"></span>
                WhatsApp Leads ({activeRange})
              </p>
              <p className="text-lg font-black text-slate-900 mt-0.5 font-mono">
                {currentTotalLeads} Inquiries
              </p>
            </div>
            <MessageSquare className="w-6 h-6 text-[#F58220]/40" />
          </div>
        </div>

        {/* Line Chart SVG */}
        <div className="relative w-full overflow-hidden pt-2">
          <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#238B3D" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#238B3D" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#cbd5e1" />

            {/* Gradient Fill under Revenue */}
            <path d={revenueAreaPath} fill="url(#revenueGrad)" />

            {/* Revenue Line (Green) */}
            <path d={revenueSvgPath} fill="none" stroke="#238B3D" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

            {/* WhatsApp Leads Line (Orange) */}
            <path d={leadsSvgPath} fill="none" stroke="#F58220" strokeWidth="2.5" strokeDasharray="4 2" strokeLinecap="round" />

            {/* Interactive Points */}
            {revenuePoints.map((p, i) => (
              <g key={i} className="cursor-pointer" onMouseEnter={() => setHoveredIndex(i)} onMouseLeave={() => setHoveredIndex(null)}>
                <circle cx={p.x} cy={p.y} r={hoveredIndex === i ? 6 : 3.5} fill="#238B3D" stroke="#ffffff" strokeWidth="2" />
                <circle cx={leadsPoints[i].x} cy={leadsPoints[i].y} r={hoveredIndex === i ? 5 : 3} fill="#F58220" stroke="#ffffff" strokeWidth="1.5" />
              </g>
            ))}
          </svg>

          {/* Hover Tooltip Box */}
          {hoveredIndex !== null && filteredData[hoveredIndex] && (
            <div className="mt-2 bg-slate-900 text-white rounded-xl p-3 text-xs flex items-center justify-between shadow-lg">
              <span className="font-bold text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-[#F58220]" />
                {filteredData[hoveredIndex].label} ({filteredData[hoveredIndex].date})
              </span>
              <div className="flex items-center gap-4 font-mono font-bold">
                <span className="text-emerald-400">
                  KES {filteredData[hoveredIndex].revenueKes.toLocaleString()}
                </span>
                <span className="text-[#F58220]">
                  {filteredData[hoveredIndex].leadsCount} Leads
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CHART 2: Donut/Pie Chart — "M-Pesa Payments vs WhatsApp Orders" */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <Layers className="w-5 h-5 text-[#238B3D]" />
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Channel Share Breakdown
              </h3>
              <p className="text-xs text-slate-500">M-Pesa Daraja vs WhatsApp Direct Checkout</p>
            </div>
          </div>
        </div>

        {/* Donut Chart Visual */}
        <div className="flex flex-col items-center justify-center py-2 relative">
          <div className="w-40 h-40 relative flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              {/* Background Circle */}
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#f1f5f9" strokeWidth="4" />

              {/* M-Pesa Segment (Green) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#238B3D"
                strokeWidth="4.5"
                strokeDasharray={`${channelBreakdown.mpesaPercentage} ${100 - channelBreakdown.mpesaPercentage}`}
                strokeDashoffset="0"
                className="transition-all duration-500"
              />

              {/* WhatsApp Segment (Orange) */}
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="#F58220"
                strokeWidth="4.5"
                strokeDasharray={`${channelBreakdown.whatsappPercentage} ${100 - channelBreakdown.whatsappPercentage}`}
                strokeDashoffset={`-${channelBreakdown.mpesaPercentage}`}
                className="transition-all duration-500"
              />
            </svg>

            {/* Inner Center Label */}
            <div className="absolute text-center">
              <span className="text-2xl font-black text-slate-900 block leading-none">
                {channelBreakdown.totalCount}
              </span>
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mt-1 block">
                Total Orders
              </span>
            </div>
          </div>
        </div>

        {/* Legend Table */}
        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#238B3D]"></div>
              <div>
                <p className="font-bold text-slate-900">M-Pesa Daraja STK Push</p>
                <p className="text-[10px] text-slate-500">{channelBreakdown.mpesaCount} Transactions</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#238B3D]">{channelBreakdown.mpesaPercentage}%</p>
              <p className="text-[10px] text-slate-500 font-mono">KES {channelBreakdown.mpesaValueKes.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#F58220]"></div>
              <div>
                <p className="font-bold text-slate-900">WhatsApp Leads & Checkout</p>
                <p className="text-[10px] text-slate-500">{channelBreakdown.whatsappCount} Orders / Leads</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-[#F58220]">{channelBreakdown.whatsappPercentage}%</p>
              <p className="text-[10px] text-slate-500 font-mono">KES {channelBreakdown.whatsappValueKes.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
