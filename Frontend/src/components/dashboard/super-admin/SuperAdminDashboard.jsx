"use client";

import React, { useState, useEffect } from "react";
import { Shield, Building, CreditCard, Cpu, MessageSquareDashed, Sparkles, CheckCircle2, AlertTriangle, ToggleLeft, ToggleRight, Plus, Users, Calendar, ChevronDown, Hexagon, Zap, Atom, Leaf, Compass, Eye, Edit2, Trash2, Home, Search, MapPin, ArrowUpRight } from "lucide-react";
import AddCompanyModal from "../../modal/super-admin/AddCompanySuperAdminModal";
import ConfirmModal from "../../shared/ConfirmModal";

export default function SuperAdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [companies, setCompanies] = useState([
    {
      id: "comp_01",
      name: "BrightWave Innovations",
      industry: "Real Estate",
      contactPerson: "Michael Vance",
      email: "michael@example.com",
      accountUrl: "bwi.example.com",
      plan: "Advanced (Monthly)",
      status: "active",
      leadsCount: 148,
      createdDate: "12 Sep 2024",
      logoColor: "bg-purple-100 dark:bg-purple-950/40 text-purple-600 border-purple-200 dark:border-purple-800",
      logoType: "hexagon",
    },
    {
      id: "comp_02",
      name: "Stellar Dynamics",
      industry: "Aerospace",
      contactPerson: "Sophie Turner",
      email: "sophie@example.com",
      accountUrl: "sd.example.com",
      plan: "Basic (Yearly)",
      status: "active",
      leadsCount: 92,
      createdDate: "24 Oct 2024",
      logoColor: "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 border-emerald-200 dark:border-emerald-800",
      logoType: "zap",
    },
    {
      id: "comp_03",
      name: "Quantum Nexus",
      industry: "Technology",
      contactPerson: "Cameron Diaz",
      email: "cameron@example.com",
      accountUrl: "qn.example.com",
      plan: "Advanced (Monthly)",
      status: "active",
      leadsCount: 35,
      createdDate: "18 Feb 2024",
      logoColor: "bg-blue-100 dark:bg-blue-950/40 text-blue-600 border-blue-200 dark:border-blue-800",
      logoType: "atom",
    },
    {
      id: "comp_04",
      name: "EcoVision Enterprises",
      industry: "Green Energy",
      contactPerson: "Doris Green",
      email: "doris@example.com",
      accountUrl: "eve.example.com",
      plan: "Advanced (Monthly)",
      status: "active",
      leadsCount: 0,
      createdDate: "17 Oct 2024",
      logoColor: "bg-teal-100 dark:bg-teal-950/40 text-teal-600 border-teal-200 dark:border-teal-800",
      logoType: "leaf",
    },
    {
      id: "comp_05",
      name: "Aurora Technologies",
      industry: "Software",
      contactPerson: "Thomas Wright",
      email: "thomas@example.com",
      accountUrl: "at.example.com",
      plan: "Enterprise (Monthly)",
      status: "active",
      leadsCount: 12,
      createdDate: "20 Jul 2024",
      logoColor: "bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 border-indigo-200 dark:border-indigo-800",
      logoType: "compass",
    },
  ]);

  const [apiGateways, setApiGateways] = useState([
    { name: "Google Gemini Pro API", status: "operational", keyActive: true },
    { name: "OpenAI GPT-4o Agent Engine", status: "operational", keyActive: true },
    { name: "Claude 3.5 Sonnet Integration", status: "operational", keyActive: false },
    { name: "Meta WhatsApp Cloud Business API", status: "operational", keyActive: true },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("Last 7 Days");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleAddCompany = (newCompany) => {
    const companyToAdd = {
      id: `comp_${Math.random().toString(36).substr(2, 9)}`,
      name: newCompany.name,
      industry: "Technology",
      contactPerson: "New Admin",
      email: newCompany.email,
      accountUrl: newCompany.accountUrl,
      plan: newCompany.plan,
      status: newCompany.status,
      leadsCount: 0,
      createdDate: newCompany.createdDate,
      logoColor: "bg-orange-100 dark:bg-orange-950/40 text-orange-600 border-orange-200 dark:border-orange-850",
      logoType: "hexagon",
      logo: newCompany.logo || undefined,
    };

    setCompanies([companyToAdd, ...companies]);
  };

  const toggleStatus = (id) => {
    setCompanies(companies.map(c => c.id === id ? { ...c, status: c.status === "active" ? "suspended" : "active" } : c));
  };

  const handleDeleteCompany = (id) => {
    setConfirmDeleteId(id);
  };

  // Companies weekly registration data (Mon-Sun)
  const weeklyCompaniesData = [
    { day: "M", count: 3, height: "45%" },
    { day: "T", count: 5, height: "70%" },
    { day: "W", count: 2, height: "30%" },
    { day: "T", count: 7, height: "95%" },
    { day: "F", count: 5, height: "70%" },
    { day: "S", count: 5, height: "70%" },
    { day: "S", count: 5, height: "70%" },
  ];

  // Stacked monthly revenue data (Jan-Dec)
  const monthlyRevenueData = [
    { month: "Jan", orange: 25, teal: 30, blue: 5 },
    { month: "Feb", orange: 25, teal: 5, blue: 0 },
    { month: "Mar", orange: 25, teal: 20, blue: 0 },
    { month: "Apr", orange: 25, teal: 30, blue: 25 },
    { month: "May", orange: 25, teal: 30, blue: 30 },
    { month: "Jun", orange: 25, teal: 30, blue: 35 },
    { month: "Jul", orange: 25, teal: 30, blue: 25 },
    { month: "Aug", orange: 25, teal: 30, blue: 25 },
    { month: "Sep", orange: 25, teal: 30, blue: 25 },
    { month: "Oct", orange: 25, teal: 30, blue: 30 },
    { month: "Nov", orange: 20, teal: 0, blue: 0 },
    { month: "Dec", orange: 25, teal: 30, blue: 25 },
  ];

  // Plan counts & dynamic percentages calculated from client state
  const planCounts = companies.reduce(
    (acc, c) => {
      if (c.plan === "Starter Plan") acc.starter++;
      else if (c.plan === "Growth Plan") acc.growth++;
      else if (c.plan === "Premium Plan") acc.premium++;
      return acc;
    },
    { starter: 0, growth: 0, premium: 0 }
  );

  const totalComp = companies.length || 1;
  const starterPercent = Math.round((planCounts.starter / totalComp) * 100);
  const growthPercent = Math.round((planCounts.growth / totalComp) * 100);
  const premiumPercent = Math.max(0, 100 - starterPercent - growthPercent);

  // SVG Donut Calculations
  const radius = 36;
  const circumference = 2 * Math.PI * radius; // ~226.195
  const starterStroke = (starterPercent / 100) * circumference;
  const growthStroke = (growthPercent / 100) * circumference;
  const premiumStroke = (premiumPercent / 100) * circumference;

  const starterOffset = 0;
  const growthOffset = starterStroke;
  const premiumOffset = starterStroke + growthStroke;

  // Sparkline Component
  const Sparkline = ({ color = "#f97316" }) => (
    <svg className="w-16 h-8 overflow-visible opacity-80 shrink-0" viewBox="0 0 60 20">
      <path
        d="M0 15 Q 10 5, 20 12 T 40 4 T 60 10"
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );

  // Logo Renderer
  const renderLogo = (company) => {
    if (company.logo) {
      return (
        <img
          src={company.logo}
          alt={company.name}
          className="h-8 w-8 rounded-full object-cover border border-slate-100 dark:border-slate-800"
        />
      );
    }
    const colorClass = company.logoColor || "bg-orange-100 text-orange-600 border-orange-200 dark:border-orange-950";
    const IconComponent = () => {
      switch (company.logoType) {
        case "hexagon": return <Hexagon className="h-4.5 w-4.5" />;
        case "zap": return <Zap className="h-4.5 w-4.5" />;
        case "atom": return <Atom className="h-4.5 w-4.5" />;
        case "leaf": return <Leaf className="h-4.5 w-4.5" />;
        case "compass": return <Compass className="h-4.5 w-4.5" />;
        default: return <Building className="h-4.5 w-4.5" />;
      }
    };
    return (
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center border shrink-0 ${colorClass}`}>
        <IconComponent />
      </div>
    );
  };

  // Filtering Logic
  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.accountUrl.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPlan = selectedPlan ? company.plan.toLowerCase().includes(selectedPlan.toLowerCase()) : true;
    const matchesStatus = selectedStatus ? company.status === selectedStatus : true;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Sort Logic
  const sortedCompanies = [...filteredCompanies].sort((a, b) => {
    if (sortBy === "Newest") return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    if (sortBy === "Oldest") return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
    return 0; // Default
  });

  // Paginated Companies
  const paginatedCompanies = sortedCompanies.slice(0, rowsPerPage);

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
            <div className="h-4 bg-slate-200 dark:bg-slate-850 rounded-lg w-96" />
          </div>
          <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl col-span-2" />
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={!!confirmDeleteId}
        title="Delete Company"
        message="Are you sure you want to delete this tenant company? This will revoke all representative and client admin access instantly."
        onConfirm={() => {
          if (confirmDeleteId) {
            setCompanies(companies.filter((c) => c.id !== confirmDeleteId));
          }
        }}
        onCancel={() => setConfirmDeleteId(null)}
      />
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            Super Admin Control Center <Shield className="h-6 w-6 text-indigo-500" />
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Configure multi-tenant clients, global AI model APIs, WhatsApp connection settings, and system-wide usage metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            <ArrowUpRight className="h-4 w-4" /> Export <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Global Platforms Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Tenants</span>
            <Building className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-3">{companies.length}</p>
          <span className="text-[10px] text-slate-400">Total registered workspaces</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Active Companies</span>
            <Building className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-3">
            {companies.filter((c) => c.status === "active").length}
          </p>
          <span className="text-[10px] text-slate-400">Active customer subscriptions</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Subscribers</span>
            <Users className="h-5 w-5 text-pink-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-3">
            {companies.reduce((sum, c) => sum + c.leadsCount, 0).toLocaleString()}
          </p>
          <span className="text-[10px] text-slate-400">Leads managed on platform</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Platform Revenue</span>
            <CreditCard className="h-5 w-5 text-teal-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-3">₹2,85,000</p>
          <span className="text-[10px] text-slate-400">Monthly recurring retainer billing</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">AI API Calls</span>
            <Cpu className="h-5 w-5 text-purple-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-3">12,405</p>
          <span className="text-[10px] text-emerald-500 font-bold">99.8% Success Gateway Rate</span>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">WhatsApp Delivery</span>
            <MessageSquareDashed className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-3">48,912</p>
          <span className="text-[10px] text-slate-400">Outgoing customer auto-responses</span>
        </div>
      </div>

      {/* Analytics Contents (Companies, Revenue, Top Plans) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Companies Weekly Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-[360px] shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 dark:text-slate-50 text-sm tracking-tight">Companies</h3>
            <button className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-100 dark:border-slate-200/60 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/40">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>This Week</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>

          {/* Bar Chart Area */}
          <div className="flex items-end justify-between h-44 gap-2 px-1 relative">
            <div className="absolute left-0 right-0 top-0 border-t border-slate-100 dark:border-slate-800/40 w-full" />
            <div className="absolute left-0 right-0 top-1/3 border-t border-slate-100 dark:border-slate-800/40 w-full" />
            <div className="absolute left-0 right-0 top-2/3 border-t border-slate-100 dark:border-slate-800/40 w-full" />

            {weeklyCompaniesData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center flex-1 group relative">
                <div className="absolute -top-8 px-1.5 py-0.5 bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950 text-[9px] rounded font-bold opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md z-10">
                  {item.count} Signups
                </div>
                <div className="w-4 h-36 bg-slate-50 dark:bg-slate-950/40 rounded-full flex flex-col justify-end overflow-hidden">
                  <div
                    className="w-full bg-slate-800 dark:bg-slate-200 rounded-full transition-all duration-500 ease-out"
                    style={{ height: item.height }}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-2">{item.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <span className="bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
              +6%
            </span>
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
              5 Companies from last month
            </span>
          </div>
        </div>

        {/* Monthly Revenue Stacked Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-[360px] shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 dark:text-slate-50 text-sm tracking-tight">Revenue</h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> Revenue
              </span>
              <button className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-100 dark:border-slate-200/60 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/40">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>2026</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Revenue KPI Display */}
          <div className="mt-2">
            <p className="text-2xl font-black text-slate-900 dark:text-slate-50">₹2,85,000</p>
            <p className="text-[10px] text-emerald-500 font-bold flex items-center gap-0.5 mt-0.5">
              +40% <span className="text-slate-400 font-normal">increased from last year</span>
            </p>
          </div>

          {/* Stacked Chart Columns Area */}
          <div className="flex items-end justify-between h-36 mt-4 gap-1.5 px-1 relative">
            <div className="absolute left-0 right-0 top-0 border-t border-slate-100 dark:border-slate-800/40 w-full" />
            <div className="absolute left-0 right-0 top-1/2 border-t border-slate-100 dark:border-slate-800/40 w-full" />

            {monthlyRevenueData.map((item, idx) => {
              const total = item.orange + item.teal + item.blue;
              return (
                <div key={idx} className="flex flex-col items-center flex-1 group relative">
                  <div className="absolute -top-12 px-2 py-1 bg-slate-900 text-white dark:bg-slate-50 dark:text-slate-950 text-[9px] rounded font-bold opacity-0 group-hover:opacity-100 transition pointer-events-none whitespace-nowrap shadow-md z-10 flex flex-col gap-0.5">
                    {item.blue > 0 && <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-500" />Enterprise: {item.blue}%</span>}
                    {item.teal > 0 && <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-[#0e3f4e]" />Premium: {item.teal}%</span>}
                    {item.orange > 0 && <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-orange-500" />Basic: {item.orange}%</span>}
                  </div>

                  <div className="w-3 h-28 bg-slate-50 dark:bg-slate-950/40 rounded-full flex flex-col justify-end overflow-hidden">
                    <div className="w-full flex flex-col-reverse" style={{ height: `${total}%` }}>
                      {item.orange > 0 && (
                        <div className="bg-orange-500" style={{ height: `${(item.orange / total) * 100}%` }} />
                      )}
                      {item.teal > 0 && (
                        <div className="bg-[#0e3f4e] dark:bg-teal-900" style={{ height: `${(item.teal / total) * 100}%` }} />
                      )}
                      {item.blue > 0 && (
                        <div className="bg-blue-500" style={{ height: `${(item.blue / total) * 100}%` }} />
                      )}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-2">{item.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Plans Donut Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col justify-between h-[360px] shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-slate-900 dark:text-slate-50 text-sm tracking-tight">Top Plans</h3>
            <button className="flex items-center gap-1.5 px-2.5 py-1 border border-slate-100 dark:border-slate-200/60 dark:border-slate-800 rounded-lg text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-950/40">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>This Month</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center justify-center h-40 relative">
            <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
              <circle cx="60" cy="60" r={radius} fill="transparent" stroke="rgb(241, 245, 249)" className="dark:stroke-slate-800" strokeWidth="12" />

              {starterPercent > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#f97316"
                  strokeWidth="12"
                  strokeDasharray={`${starterStroke} ${circumference}`}
                  strokeDashoffset={-starterOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              )}

              {growthPercent > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#eab308"
                  strokeWidth="12"
                  strokeDasharray={`${growthStroke} ${circumference}`}
                  strokeDashoffset={-growthOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              )}

              {premiumPercent > 0 && (
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="transparent"
                  stroke="#3b82f6"
                  strokeWidth="12"
                  strokeDasharray={`${premiumStroke} ${circumference}`}
                  strokeDashoffset={-premiumOffset}
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />
              )}
            </svg>

            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</span>
              <span className="text-xl font-black text-slate-900 dark:text-slate-50">{companies.length}</span>
            </div>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/40">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> Basic (Starter)
              </span>
              <span className="text-slate-900 dark:text-slate-100">{starterPercent}%</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-yellow-500" /> Premium (Growth)
              </span>
              <span className="text-slate-900 dark:text-slate-100">{growthPercent}%</span>
            </div>
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                <span className="h-2 w-2 rounded-full bg-blue-500" /> Enterprise (Premium)
              </span>
              <span className="text-slate-900 dark:text-slate-100">{premiumPercent}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Companies List Section Title & Breadcrumb */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950/20 p-5 rounded-2xl border border-slate-150 dark:border-slate-800/60 mt-4">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Companies</h2>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
            <Home className="h-3.5 w-3.5 text-slate-400" />
            <span>/</span>
            <span>Super Admin</span>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300">Companies List</span>
          </div>
        </div>
      </div>

      {/* Companies List Container Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-6 shadow-sm">

        {/* Table Filter Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wide">
            Companies List
          </h3>

          <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
            <div className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 text-slate-500">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>05/28/2026 - 06/03/2026</span>
            </div>

            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">Select Plan</option>
              <option value="Basic">Basic</option>
              <option value="Advanced">Advanced</option>
              <option value="Enterprise">Enterprise</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">Select Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="Last 7 Days">Sort By: Last 7 Days</option>
              <option value="Newest">Sort By: Newest</option>
              <option value="Oldest">Sort By: Oldest</option>
            </select>
          </div>
        </div>

        {/* Entries page controls and Search bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/40 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Row Per Page</span>
            <select
              value={rowsPerPage}
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              className="px-2 py-1 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 focus:outline-none font-bold"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>
            <span>Entries</span>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none text-xs"
            />
          </div>
        </div>

        {/* The Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-450 uppercase tracking-wider font-bold text-[10px]">
                <th className="pb-3 w-8">
                  <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-orange-500 focus:ring-orange-500/20 cursor-pointer" />
                </th>
                <th className="pb-3 pr-2">Company Name</th>
                <th className="pb-3 pr-2">Email</th>
                <th className="pb-3 pr-2">Account URL</th>
                <th className="pb-3 pr-2">Plan</th>
                <th className="pb-3 pr-2">Created Date</th>
                <th className="pb-3 pr-2">Status</th>
                <th className="pb-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {paginatedCompanies.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 font-bold">
                    No matching companies found.
                  </td>
                </tr>
              ) : (
                paginatedCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 group">
                    <td className="py-4">
                      <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-orange-500 focus:ring-orange-500/20 cursor-pointer" />
                    </td>
                    <td className="py-4 font-bold text-slate-900 dark:text-slate-550">
                      <div className="flex items-center gap-3">
                        {renderLogo(company)}
                        <span className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                          {company.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 font-medium">
                      {company.email}
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                      {company.accountUrl}
                    </td>
                    <td className="py-4">
                      <div className="flex items-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                          {company.plan}
                        </span>
                        <button className="ml-2 text-[9px] font-black uppercase bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/80 px-1.5 py-0.5 rounded hover:bg-purple-200 dark:hover:bg-purple-900 transition">
                          Upgrade
                        </button>
                      </div>
                    </td>
                    <td className="py-4 text-slate-500 dark:text-slate-400 font-semibold">
                      {company.createdDate}
                    </td>
                    <td className="py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize flex items-center gap-1.5 w-fit cursor-pointer ${company.status === "active"
                        ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                        : "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                        }`} onClick={() => toggleStatus(company.id)}>
                        <span className={`h-1.5 w-1.5 rounded-full ${company.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {company.status === "active" ? "Active" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded transition" title="View">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded transition" title="Edit">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCompany(company.id)}
                          className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 rounded transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settings Row: API Gateways and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global API Gateways Status Controls */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm">
          <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide flex items-center gap-1.5">
            Global API Gateways <Sparkles className="h-4 w-4 text-indigo-500" />
          </h3>

          <div className="space-y-4">
            {apiGateways.map((gateway, idx) => (
              <div key={gateway.name} className="p-3 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                <div className="flex gap-2.5 items-start">
                  <div className="mt-0.5">
                    {gateway.keyActive ? (
                      <CheckCircle2 className="h-4.5 w-4.5 text-emerald-500" />
                    ) : (
                      <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">{gateway.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize mt-0.5">Status: {gateway.status}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const next = [...apiGateways];
                    next[idx].keyActive = !next[idx].keyActive;
                    setApiGateways(next);
                  }}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {gateway.keyActive ? (
                    <ToggleRight className="h-7 w-7 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="h-7 w-7 text-slate-300 dark:text-slate-700" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* System Settings / Health Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide">
              System Operations
            </h3>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-500 dark:text-slate-400">Maintenance Mode</span>
                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-black text-[10px]">INACTIVE</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-500 dark:text-slate-400">New Registrations</span>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 rounded font-black text-[10px]">ALLOWED</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="font-bold text-slate-500 dark:text-slate-400">SMTP Server Status</span>
                <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 rounded font-black text-[10px]">VERIFIED</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-400 font-bold text-center">
            System Core Engine v1.0.0
          </div>
        </div>
      </div>

      {/* Add New Company Modal */}
      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCompany}
      />
    </div>
  );
}
