"use client";

import React from "react";
import { useSelector } from "react-redux";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardWrapper({ children }) {
  const activeRole = useSelector((state) => state.auth.activeRole);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto p-6 focus:outline-none scroll-smooth">
          <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
