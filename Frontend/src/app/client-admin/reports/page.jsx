"use client";

import React from "react";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import { BarChart3, TrendingUp, Sparkles, Clock, Target, CalendarDays, ArrowUpRight } from "lucide-react";

export default function ReportsPage() {
  const performanceData = [
    { name: "Pradeep Patra", leads: 24, converted: 12, rate: "50%" },
    { name: "Amit Sharma", leads: 18, converted: 6, rate: "33%" },
    { name: "Rina Das", leads: 12, converted: 5, rate: "41%" },
  ];

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            CRM Reports & Performance Analytics <BarChart3 className="h-6 w-6 text-indigo-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monitor representative conversion metrics, WhatsApp channel speed triggers, and multi-tenant campaign lists.
          </p>
        </div>

        {/* Dynamic Analytics Curve Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart View */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-slate-400">Monthly Lead Acquisition</span>
                <span className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  Sales Funnel Breakdown <TrendingUp className="h-4.5 w-4.5 text-indigo-500" />
                </span>
              </div>
              <span className="text-[10px] bg-indigo-500/10 text-indigo-600 px-2 py-0.5 rounded flex items-center gap-0.5 font-bold uppercase">
                Campaign Active
              </span>
            </div>

            {/* Custom Responsive SVG Funnel/Bar Chart Mock */}
            <div className="relative w-full h-60 border-b border-slate-150 dark:border-slate-800 flex items-end justify-around pb-2 select-none">
              <svg className="absolute inset-0 h-full w-full opacity-10" fill="none">
                <line x1="0" y1="40" x2="100%" y2="40" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="90" x2="100%" y2="90" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="140" x2="100%" y2="140" stroke="currentColor" strokeWidth="1" />
                <line x1="0" y1="190" x2="100%" y2="190" stroke="currentColor" strokeWidth="1" />
              </svg>

              {[
                { stage: "Ad Click / Inquiries", percentage: 90, color: "bg-indigo-600", value: "48 Leads" },
                { stage: "WhatsApp Qualify", percentage: 70, color: "bg-indigo-500", value: "34 Qualified" },
                { stage: "Sales Call Demo", percentage: 45, color: "bg-indigo-400", value: "22 Scheduled" },
                { stage: "Paying Conversions", percentage: 25, color: "bg-emerald-500", value: "12 Closed" },
              ].map((bar, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 z-10 w-24">
                  <span className="text-[9px] font-black text-slate-500 dark:text-slate-400">{bar.value}</span>
                  <div className="w-8 rounded-t-lg bg-slate-100 dark:bg-slate-800 h-40 flex items-end">
                    <div className={`w-full ${bar.color} rounded-t-lg transition-all`} style={{ height: `${bar.percentage}%` }} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 truncate text-center max-w-[80px]">{bar.stage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Representative Performance Ratings Widget */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm flex flex-col justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide flex items-center gap-1">
                Representative Conversion Ratios <Sparkles className="h-4.5 w-4.5 text-indigo-500" />
              </h3>
              <p className="text-[10px] text-slate-400">Representative close rate based on assigned inquiries.</p>
            </div>

            <div className="space-y-4">
              {performanceData.map((staff) => (
                <div key={staff.name} className="flex items-center justify-between text-xs pb-3 border-b border-slate-100 dark:border-slate-800 last:border-0 last:pb-0">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-900 dark:text-slate-50">{staff.name}</span>
                    <span className="text-[10px] text-slate-400">Assigned: {staff.leads} Leads</span>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div className="flex flex-col font-bold">
                      <span className="text-slate-900 dark:text-slate-50">{staff.converted} Closed</span>
                      <span className="text-emerald-500 text-[10px]">{staff.rate} Ratio</span>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Global Campaign Channels list grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex gap-3 text-xs items-center shadow-sm">
            <div className="p-3 bg-indigo-500/10 text-indigo-600 rounded-xl">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px]">Mean Response Time</p>
              <p className="text-lg font-black text-slate-900 dark:text-slate-50 mt-0.5">45 Seconds</p>
              <span className="text-[10px] text-slate-400">Average WhatsApp Reply Delay</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex gap-3 text-xs items-center shadow-sm">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px]">Total Conversion Count</p>
              <p className="text-lg font-black text-slate-900 dark:text-slate-50 mt-0.5">23 closed deals</p>
              <span className="text-[10px] text-emerald-500 font-semibold">+8% increase this week</span>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex gap-3 text-xs items-center shadow-sm">
            <div className="p-3 bg-purple-500/10 text-purple-600 rounded-xl">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <p className="text-slate-400 font-bold uppercase text-[9px]">Pending Follow-up Actions</p>
              <p className="text-lg font-black text-slate-900 dark:text-slate-50 mt-0.5">14 reminders</p>
              <span className="text-[10px] text-slate-400">Awaiting executive validation</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}
