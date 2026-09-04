"use client";

import React, { useState } from "react";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import { toast } from "react-toastify";
import axiosInstance, { ENDPOINTS } from "@/utils/api";
import {
  Settings,
  CreditCard,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  X,
  Sliders,
  DollarSign,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
  Database,
  ArrowUpRight,
  Save,
  Clock,
  Zap,
  Plus,
} from "lucide-react";

export default function SuperAdminSystemPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("pricing");

  // ── Packages / Plan List state ─────────────────────────────────────────────
  const [packages,       setPackages]       = useState([]);
  const [pkgSearch,      setPkgSearch]      = useState("");
  const [pkgPlanFilter,  setPkgPlanFilter]  = useState("");
  const [pkgRowsPerPage, setPkgRowsPerPage] = useState(10);
  const [pkgPage,        setPkgPage]        = useState(1);
  const [editingPkg,     setEditingPkg]     = useState(null);
  const [showPkgModal,   setShowPkgModal]   = useState(false);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [newPkg, setNewPkg] = useState({
    name: "",
    priceMonthly: 0,
    maxChannels: 1,
    maxSeats: 1,
    maxTokens: 1000
  });

  const loadPlans = async () => {
    try {
      const res = await axiosInstance.get(ENDPOINTS.superAdmin.systemPlans);
      setPackages(res.data);
    } catch (err) {
      console.error("Failed to load system plans:", err);
    }
  };

  React.useEffect(() => {
    setMounted(true);
    loadPlans();
  }, []);

  // ── AI Analytics data ──────────────────────────────────────────────────────
  const totalSubRevenue = 285000;
  const geminiCost      = 28405;
  const openAICost      = 32104;
  const whatsappCost    = 14202;
  const totalApiCosts   = geminiCost + openAICost + whatsappCost;
  const profitMargin    = Math.round(((totalSubRevenue - totalApiCosts) / totalSubRevenue) * 100);

  const tenantConsumption = [
    { name: "Acme Real Estate",           plan: "Premium", geminiCalls: 5408, cost: 32400 },
    { name: "Bhubaneswar Wellness Clinic", plan: "Growth",  geminiCalls: 3892, cost: 22100 },
    { name: "Elite Spas & Salons",         plan: "Starter", geminiCalls: 1204, cost: 7200  },
  ];

  // ── Audit Logs data ────────────────────────────────────────────────────────
  const [auditLogs] = useState([
    { id: "log_01", timestamp: "2026-06-01 11:20:14", category: "Security",  event: "Client Workspace Acme Real Estate activated",                      user: "Super Admin",     ip: "192.168.1.55"  },
    { id: "log_02", timestamp: "2026-06-01 10:45:32", category: "Tenants",   event: "New Tenant Bhubaneswar Wellness Clinic registered",                 user: "API System",      ip: "103.88.24.12"  },
    { id: "log_03", timestamp: "2026-06-01 09:12:05", category: "Billing",   event: "Starter setup invoice payment confirmed for Elite Spas",            user: "Razorpay webhook",ip: "185.22.48.91"  },
    { id: "log_04", timestamp: "2026-06-01 08:30:00", category: "AI Engine", event: "Meta WhatsApp Cloud API integration synchronized successfully",      user: "API System",      ip: "192.168.1.1"   },
  ]);

  // ── Global Config state ────────────────────────────────────────────────────
  const [maintenanceMode,   setMaintenanceMode]   = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);
  const [globalRateLimit,   setGlobalRateLimit]   = useState(100);

  // ── Toast ──────────────────────────────────────────────────────────────────
  const triggerToast = (msg) => {
    toast.success(msg);
  };

  // Derived package metrics
  const totalPlans    = packages.length;
  const activePlans   = packages.length;
  const inactivePlans = 0;
  const planTypes     = packages.length;

  // Filtering
  const filteredPkgs = packages.filter(p => {
    const q = pkgSearch.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q);
    const matchPlan   = pkgPlanFilter   ? p.name === pkgPlanFilter   : true;
    return matchSearch && matchPlan;
  });

  const totalPkgPages = Math.max(1, Math.ceil(filteredPkgs.length / pkgRowsPerPage));
  const paginatedPkgs = filteredPkgs.slice((pkgPage - 1) * pkgRowsPerPage, pkgPage * pkgRowsPerPage);

  const handleEditPkg = (pkg) => {
    setEditingPkg({ ...pkg });
    setShowPkgModal(true);
  };

  const handleSavePkg = async () => {
    if (!editingPkg) return;
    try {
      const res = await axiosInstance.patch(ENDPOINTS.superAdmin.systemPlan(editingPkg.id), {
        priceMonthly: editingPkg.priceMonthly,
        maxChannels: editingPkg.maxChannels,
        maxSeats: editingPkg.maxSeats,
        maxTokens: editingPkg.maxTokens
      });
      setPackages(prev => prev.map(p => p.id === editingPkg.id ? res.data : p));
      setShowPkgModal(false);
      setEditingPkg(null);
      triggerToast("Plan updated successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save plan configuration");
    }
  };

  const handleSaveNewPkg = async () => {
    if (!newPkg.name.trim()) {
      toast.error("Plan name is required");
      return;
    }
    try {
      const res = await axiosInstance.post(ENDPOINTS.superAdmin.systemPlans, newPkg);
      setPackages(prev => [...prev, res.data]);
      setShowAddModal(false);
      triggerToast("New plan created successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create new plan");
    }
  };

  const handleDeletePkg = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan configuration?")) return;
    try {
      await axiosInstance.delete(ENDPOINTS.superAdmin.systemPlan(id));
      setPackages(prev => prev.filter(p => p.id !== id));
      triggerToast("Plan configuration deleted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete plan configuration");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!mounted) {
    return (
      <DashboardWrapper>
        <div className="space-y-6 animate-pulse p-6">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800/80 rounded-lg w-96" />
          </div>
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full max-w-lg" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <div className="space-y-6 select-none relative">
        {/* ── Edit Plan Modal ── */}
        {showPkgModal && editingPkg && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 dark:text-slate-50">Edit Plan Settings</h2>
                <button
                  onClick={() => { setShowPkgModal(false); setEditingPkg(null); }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[9px]">Plan Name</label>
                  <input
                    type="text"
                    disabled
                    value={editingPkg.name}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-100 dark:bg-slate-950/50 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[9px]">Monthly Price (₹)</label>
                  <input
                    type="number"
                    value={editingPkg.priceMonthly}
                    onChange={e => setEditingPkg({ ...editingPkg, priceMonthly: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[9px]">Max Inbound Channels</label>
                  <input
                    type="number"
                    value={editingPkg.maxChannels}
                    onChange={e => setEditingPkg({ ...editingPkg, maxChannels: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[9px]">Max Team Seats</label>
                  <input
                    type="number"
                    value={editingPkg.maxSeats}
                    onChange={e => setEditingPkg({ ...editingPkg, maxSeats: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[9px]">Max Chatbot Tokens</label>
                  <input
                    type="number"
                    value={editingPkg.maxTokens}
                    onChange={e => setEditingPkg({ ...editingPkg, maxTokens: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => { setShowPkgModal(false); setEditingPkg(null); }}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePkg}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-primary to-gray-500 text-white text-xs font-bold rounded-xl shadow hover:opacity-90 transition"
                >
                  <Save className="h-3.5 w-3.5" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Add Plan Modal ── */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-slate-900 dark:text-slate-50">Create New System Plan</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[9px]">Plan Name</label>
                  <input
                    type="text"
                    value={newPkg.name}
                    onChange={e => setNewPkg({ ...newPkg, name: e.target.value })}
                    placeholder="e.g. Enterprise Plan"
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[9px]">Monthly Price (₹)</label>
                  <input
                    type="number"
                    value={newPkg.priceMonthly}
                    onChange={e => setNewPkg({ ...newPkg, priceMonthly: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[9px]">Max Inbound Channels</label>
                  <input
                    type="number"
                    value={newPkg.maxChannels}
                    onChange={e => setNewPkg({ ...newPkg, maxChannels: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[9px]">Max Team Seats</label>
                  <input
                    type="number"
                    value={newPkg.maxSeats}
                    onChange={e => setNewPkg({ ...newPkg, maxSeats: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-400 uppercase text-[9px]">Max Chatbot Tokens</label>
                  <input
                    type="number"
                    value={newPkg.maxTokens}
                    onChange={e => setNewPkg({ ...newPkg, maxTokens: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewPkg}
                  className="flex items-center gap-1.5 px-5 py-2 bg-gradient-to-r from-primary to-gray-500 text-white text-xs font-bold rounded-xl shadow hover:opacity-90 transition"
                >
                  <Plus className="h-3.5 w-3.5" /> Create Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Page Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              System Settings & Platform Control <Settings className="h-6 w-6 text-indigo-500" />
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Configure multi-tenant price indices, analyze global AI resource expenses, and inspect security audit logging.
            </p>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-w-lg text-xs font-bold">
          {["pricing", "ai-cost", "audit", "global"].map(tab => {
            const labels = {
              pricing:  "Pricing Plans",
              "ai-cost":"AI Analytics",
              audit:    "Audit Logs",
              global:   "Global Config",
            };
            const icons = {
              pricing:  <CreditCard className="h-4 w-4" />,
              "ai-cost":<Cpu className="h-4 w-4" />,
              audit:    <Database className="h-4 w-4" />,
              global:   <Sliders className="h-4 w-4" />,
            };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition ${
                  activeTab === tab
                    ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                {icons[tab]} {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* TAB 1 — Pricing Plans */}
        {activeTab === "pricing" && (
          <div className="space-y-6">

            {/* Metric Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Plans */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Plans</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1 tabular-nums">
                    {String(totalPlans).padStart(2, "0")}
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center shrink-0">
                  <Settings className="h-5 w-5 text-orange-500" />
                </div>
              </div>

              {/* Active Plans */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Plans</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1 tabular-nums">
                    {String(activePlans).padStart(2, "0")}
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
              </div>

              {/* Inactive Plans */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inactive Plans</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1 tabular-nums">
                    {String(inactivePlans).padStart(2, "0")}
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-rose-100 dark:bg-rose-950/40 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-rose-500" />
                </div>
              </div>

              {/* No. of Plan Types */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">No of Plan Types</p>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-1 tabular-nums">
                    {String(planTypes).padStart(2, "0")}
                  </p>
                </div>
                <div className="h-11 w-11 rounded-xl bg-cyan-100 dark:bg-cyan-950/40 flex items-center justify-center shrink-0">
                  <Zap className="h-5 w-5 text-cyan-500" />
                </div>
              </div>
            </div>

            {/* Plan List Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">

              {/* Filter toolbar */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wide">Plan Configurations</h3>
                  <button
                    onClick={() => {
                      setNewPkg({
                        name: "",
                        priceMonthly: 0,
                        maxChannels: 1,
                        maxSeats: 1,
                        maxTokens: 1000
                      });
                      setShowAddModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-primary to-gray-500 text-white text-[11px] font-bold rounded-xl shadow-sm shadow-primary/20 hover:opacity-90 hover:scale-[1.02] transition-all"
                  >
                    <Plus className="h-3.5 w-3.5" /> Add Plan
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {/* Plan filter */}
                  <select
                    value={pkgPlanFilter}
                    onChange={e => { setPkgPlanFilter(e.target.value); setPkgPage(1); }}
                    className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-[11px] focus:outline-none cursor-pointer"
                  >
                    <option value="">All Plans</option>
                    {packages.map(p => (
                      <option key={p.id} value={p.name}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row per page + search */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800/60 text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span>Row Per Page</span>
                  <select
                    value={pkgRowsPerPage}
                    onChange={e => { setPkgRowsPerPage(Number(e.target.value)); setPkgPage(1); }}
                    className="px-2 py-1 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none font-bold cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                  </select>
                  <span>Entries</span>
                </div>
                <div className="relative max-w-xs w-full">
                  <svg className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Search..."
                    value={pkgSearch}
                    onChange={e => { setPkgSearch(e.target.value); setPkgPage(1); }}
                    className="w-full pl-8 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs transition"
                  />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                      <th className="px-5 pb-3 pt-4 w-8">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 cursor-pointer" />
                      </th>
                      <th className="pb-3 pt-4 pr-3 min-w-[140px]">
                        <span className="flex items-center gap-1">Plan Name <ArrowUpRight className="h-3 w-3 opacity-40" /></span>
                      </th>
                      <th className="pb-3 pt-4 pr-3 min-w-[110px]">
                        <span className="flex items-center gap-1">Monthly Price <ArrowUpRight className="h-3 w-3 opacity-40" /></span>
                      </th>
                      <th className="pb-3 pt-4 pr-3 min-w-[120px]">
                        <span className="flex items-center gap-1">Max Seats <ArrowUpRight className="h-3 w-3 opacity-40" /></span>
                      </th>
                      <th className="pb-3 pt-4 pr-3 min-w-[120px]">
                        <span className="flex items-center gap-1">Max Channels <ArrowUpRight className="h-3 w-3 opacity-40" /></span>
                      </th>
                      <th className="pb-3 pt-4 pr-3 min-w-[120px]">
                        <span className="flex items-center gap-1">Max Chatbot Tokens <ArrowUpRight className="h-3 w-3 opacity-40" /></span>
                      </th>
                      <th className="pb-3 pt-4 pr-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {paginatedPkgs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">No plans found.</td>
                      </tr>
                    ) : (
                      paginatedPkgs.map(pkg => (
                        <tr key={pkg.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 group transition-colors">
                          <td className="px-5 py-4">
                            <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 cursor-pointer" />
                          </td>
                          <td className="py-4 pr-3 font-bold text-slate-800 dark:text-slate-100">{pkg.name}</td>
                          <td className="py-4 pr-3 font-bold text-slate-700 dark:text-slate-200">₹{pkg.priceMonthly.toLocaleString()}</td>
                          <td className="py-4 pr-3 text-slate-600 dark:text-slate-300 font-semibold">{pkg.maxSeats}</td>
                          <td className="py-4 pr-3 text-slate-600 dark:text-slate-300 font-semibold">{pkg.maxChannels}</td>
                          <td className="py-4 pr-3 text-slate-600 dark:text-slate-300 font-semibold">{pkg.maxTokens.toLocaleString()}</td>
                          <td className="py-4 pr-5">
                            <div className="flex items-center gap-1.5 justify-end">
                              {/* Edit */}
                              <button
                                onClick={() => handleEditPkg(pkg)}
                                className="p-1.5 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-slate-400 hover:text-orange-500 rounded-lg transition"
                                title="Edit Plan"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              {/* Delete */}
                              <button
                                onClick={() => handleDeletePkg(pkg.id)}
                                className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-lg transition"
                                title="Delete Plan"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination footer */}
              <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                <span>
                  Showing {filteredPkgs.length === 0 ? 0 : (pkgPage - 1) * pkgRowsPerPage + 1}–{Math.min(pkgPage * pkgRowsPerPage, filteredPkgs.length)} of {filteredPkgs.length} entries
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPkgPage(p => Math.max(1, p - 1))}
                    disabled={pkgPage === 1}
                    className="px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40"
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPkgPages }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      onClick={() => setPkgPage(n)}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        n === pkgPage
                          ? "bg-orange-500 text-white"
                          : "border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                  <button
                    onClick={() => setPkgPage(p => Math.min(totalPkgPages, p + 1))}
                    disabled={pkgPage === totalPkgPages}
                    className="px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 — AI Analytics */}
        {activeTab === "ai-cost" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                  <span>Gross Platform Revenue</span>
                  <DollarSign className="h-5 w-5 text-indigo-500" />
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-3">₹{totalSubRevenue.toLocaleString()}</p>
                <span className="text-[10px] text-slate-400">Total active multi-tenant subscription billings</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                  <span>Total Gateway Expenses</span>
                  <Cpu className="h-5 w-5 text-rose-500 animate-pulse" />
                </div>
                <p className="text-3xl font-black text-slate-900 dark:text-slate-50 mt-3">₹{totalApiCosts.toLocaleString()}</p>
                <span className="text-[10px] text-rose-500 font-semibold">Gemini Pro + OpenAI + WhatsApp Cloud</span>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase">
                  <span>Net Profit Margin</span>
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-3xl font-black text-emerald-500">{profitMargin}%</span>
                  <span className="text-xs font-bold text-emerald-500">₹{(totalSubRevenue - totalApiCosts).toLocaleString()} Net profit</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-2">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${profitMargin}%` }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide">Global API Expenses Split</h3>
                <div className="space-y-3.5 pt-2">
                  {[
                    { source: "Google Gemini Pro API", cost: geminiCost,   pct: Math.round((geminiCost   / totalApiCosts) * 100), color: "bg-indigo-500" },
                    { source: "OpenAI GPT-4o Engines", cost: openAICost,   pct: Math.round((openAICost   / totalApiCosts) * 100), color: "bg-purple-500" },
                    { source: "Meta WhatsApp Messages", cost: whatsappCost, pct: Math.round((whatsappCost / totalApiCosts) * 100), color: "bg-blue-500"   },
                  ].map(gw => (
                    <div key={gw.source} className="space-y-1 text-xs">
                      <div className="flex justify-between font-bold">
                        <span className="text-slate-700 dark:text-slate-300">{gw.source}</span>
                        <span className="text-slate-400">₹{gw.cost.toLocaleString()} ({gw.pct}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div className={`h-full ${gw.color} rounded-full`} style={{ width: `${gw.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide flex items-center justify-between">
                  <span>Tenants Token Usage Indexes</span>
                  <span className="text-[10px] text-slate-400 font-bold">Showing top 3 resource consumers</span>
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                        <th className="pb-3 pr-2">Tenant Workspace</th>
                        <th className="pb-3 pr-2">Sub Tier</th>
                        <th className="pb-3 pr-2">AI Calls</th>
                        <th className="pb-3 text-right">Quota Utilization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {tenantConsumption.map(tenant => {
                        const pct = Math.round((tenant.geminiCalls / 10000) * 100);
                        return (
                          <tr key={tenant.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                            <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100">{tenant.name}</td>
                            <td className="py-3.5 font-semibold text-slate-500">{tenant.plan}</td>
                            <td className="py-3.5 font-bold text-slate-700 dark:text-slate-300">{tenant.geminiCalls.toLocaleString()} calls</td>
                            <td className="py-3.5 text-right w-40">
                              <div className="space-y-1 text-[10px] font-bold">
                                <span>{pct}% Quota used</span>
                                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3 — Audit Logs */}
        {activeTab === "audit" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide flex items-center gap-2">
                System Audit Trail Database <Database className="h-4 w-4 text-indigo-500 animate-pulse" />
              </h3>
              <span className="text-[10px] text-slate-400 font-bold">Filtering: All events log</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="pb-3 pr-2">Date / Time</th>
                    <th className="pb-3 pr-2">Category</th>
                    <th className="pb-3 pr-2">Platform Event Description</th>
                    <th className="pb-3 pr-2">Trigger Source</th>
                    <th className="pb-3 text-right">Origin IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium text-slate-600 dark:text-slate-350">
                  {auditLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-3.5 text-slate-400 font-semibold">
                        <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 shrink-0" /> {log.timestamp}</span>
                      </td>
                      <td className="py-3.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          log.category === "Security"  ? "bg-rose-100 dark:bg-rose-950/40 text-rose-600"      :
                          log.category === "Billing"   ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600" :
                          log.category === "Tenants"   ? "bg-blue-100 dark:bg-blue-950/40 text-blue-600"      :
                                                          "bg-purple-100 dark:bg-purple-950/40 text-purple-600"
                        }`}>{log.category}</span>
                      </td>
                      <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100">{log.event}</td>
                      <td className="py-3.5 font-bold text-indigo-500">{log.user}</td>
                      <td className="py-3.5 text-right font-mono text-[10px] text-slate-400">{log.ip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4 — Global Config */}
        {activeTab === "global" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm max-w-2xl space-y-6">
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide flex items-center gap-1.5">
              Global Platform Parameters <Sliders className="h-4 w-4 text-primary" />
            </h3>
            <div className="space-y-4 text-xs font-semibold">
              {/* Maintenance switch */}
              <div className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/10 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 block">System Maintenance Lockdown</span>
                  <span className="text-[10px] text-slate-400">Lock down all tenant logins for scheduled systemic migrations</span>
                </div>
                <button onClick={() => { setMaintenanceMode(!maintenanceMode); triggerToast(`Maintenance lockdown mode ${!maintenanceMode ? "activated" : "disabled"}.`); }}>
                  {maintenanceMode
                    ? <ToggleRight className="h-7 w-7 text-primary animate-pulse" />
                    : <ToggleLeft  className="h-7 w-7 text-slate-300 dark:text-slate-700" />}
                </button>
              </div>

              {/* Public registrations */}
              <div className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/10 rounded-2xl flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 block">Public Self-Serve Registrations</span>
                  <span className="text-[10px] text-slate-400">Allows external business landing pages registrations flow</span>
                </div>
                <button onClick={() => { setAllowRegistration(!allowRegistration); triggerToast(`Public registrations are now ${!allowRegistration ? "open" : "suspended"}.`); }}>
                  {allowRegistration
                    ? <ToggleRight className="h-7 w-7 text-primary animate-pulse" />
                    : <ToggleLeft  className="h-7 w-7 text-slate-300 dark:text-slate-700" />}
                </button>
              </div>

              {/* Rate limit slider */}
              <div className="space-y-2.5 p-4 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <div className="flex justify-between font-bold">
                  <label className="text-slate-900 dark:text-slate-100">Global Rate Limit Cap (Req/Sec)</label>
                  <span className="text-primary font-black">{globalRateLimit} reqs</span>
                </div>
                <input
                  type="range" min="50" max="500" step="50"
                  value={globalRateLimit}
                  onChange={e => setGlobalRateLimit(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <span className="text-[9px] text-slate-400 leading-normal block">Protects the central database API and webhook endpoints from distributed denial-of-service queries.</span>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => triggerToast("Global platform parameters successfully saved!")}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary to-gray-500 text-white rounded-xl font-bold shadow hover:opacity-90 transition"
                >
                  <Save className="h-4 w-4" /> Save Global Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
}
