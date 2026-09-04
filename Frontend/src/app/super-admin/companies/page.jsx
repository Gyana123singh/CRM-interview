"use client";

import React, { useState } from "react";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import AddCompanyModal from "@/components/modal/super-admin/AddCompanySuperAdminModal";
import UpgradeCompanyPlanModal from "@/components/modal/super-admin/UpgradeCompanyPlanModal";
import ConfirmModal from "@/components/shared/ConfirmModal";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import {
  Building,
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  Calendar,
  ArrowUpRight,
  Home,
  MapPin,
  Hexagon,
  Zap,
  Atom,
  Leaf,
  Compass,
} from "lucide-react";

// Sparkline SVG Component
function Sparkline({ color = "#f97316" }) {
  return (
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
}

export default function CompaniesPage() {
  const [mounted, setMounted] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [systemPlans, setSystemPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [companiesRes, plansRes] = await Promise.all([
        axiosInstance.get("/api/super-admin/companies"),
        axiosInstance.get("/api/super-admin/system-plans")
      ]);

      const logoTypes = ["hexagon", "zap", "atom", "leaf", "compass"];
      const logoColors = [
        "bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800",
        "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800",
        "bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800",
        "bg-teal-100 text-teal-600 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800",
        "bg-indigo-100 text-indigo-600 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800",
        "bg-sky-100 text-sky-600 border-sky-200 dark:bg-sky-950/40 dark:border-sky-800",
        "bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800",
        "bg-rose-100 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:border-rose-800",
        "bg-cyan-100 text-cyan-600 border-cyan-200 dark:bg-cyan-950/40 dark:border-cyan-800",
      ];

      const mappedCompanies = companiesRes.data.map((c, index) => ({
        ...c,
        createdDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "Recently",
        accountUrl: c.accountUrl || `${c.name.toLowerCase().replace(/\s+/g, "")}.example.com`,
        logoType: logoTypes[index % logoTypes.length],
        logoColor: logoColors[index % logoColors.length],
        credits: c.credits !== undefined ? c.credits : 1000,
      }));

      setCompanies(mappedCompanies);
      setSystemPlans(plansRes.data);
    } catch (error) {
      console.error("Failed to load initial super admin data:", error);
      toast.error(error.response?.data?.error || "Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    setMounted(true);
    fetchInitialData();
  }, []);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("Last 7 Days");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [modalMode, setModalMode] = useState("add");
  const [selectedCompany, setSelectedCompany] = useState(null);

  const handleSaveCompany = async (companyData) => {
    try {
      if (modalMode === "add") {
        const payload = {
          name: companyData.name,
          email: companyData.email,
          phone: companyData.phone || "+91 94380 99999",
          industry: companyData.industry || "Real Estate",
          password: companyData.password,
          credits: companyData.credits,
        };
        const res = await axiosInstance.post("/api/super-admin/companies", payload);
        toast.success("Company registered successfully!");
        
        // Map new company
        const newMapped = {
          ...res.data,
          createdDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
          accountUrl: `${res.data.name.toLowerCase().replace(/\s+/g, "")}.example.com`,
          logoType: "hexagon",
          logoColor: "bg-purple-100 text-purple-600 border-purple-200 dark:bg-purple-950/40 dark:border-purple-800",
          credits: res.data.credits !== undefined ? res.data.credits : 1000,
        };
        setCompanies(prev => [newMapped, ...prev]);
      } else if (modalMode === "edit" && selectedCompany) {
        const payload = {
          name: companyData.name,
          email: companyData.email,
          industry: companyData.industry || "Real Estate",
          credits: companyData.credits,
        };
        const res = await axiosInstance.patch(`/api/super-admin/companies/${selectedCompany.id}`, payload);
        toast.success("Company settings updated successfully!");
        
        setCompanies(prev => prev.map(c =>
          c.id === selectedCompany.id
            ? {
              ...c,
              ...res.data,
              // keep visual styling local fields
              createdDate: c.createdDate,
              accountUrl: c.accountUrl,
              logoType: c.logoType,
              logoColor: c.logoColor,
              credits: res.data.credits !== undefined ? res.data.credits : c.credits,
            }
            : c
        ));
      }
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error(error.response?.data?.error || "Failed to save company");
    }
  };

  const toggleStatus = async (id) => {
    try {
      const company = companies.find(c => c.id === id);
      if (!company) return;

      const nextStatus = company.status === "active" ? "suspended" : "active";
      const res = await axiosInstance.patch(`/api/super-admin/companies/${id}/status`, { status: nextStatus });
      toast.success(`Company status updated to ${nextStatus}`);
      
      setCompanies(prev => prev.map(c =>
        c.id === id ? { ...c, status: res.data.status } : c
      ));
    } catch (error) {
      console.error("Error updating company status:", error);
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const handleManualUpgrade = async (companyId, planName, reference) => {
    try {
      const payload = {
        plan: planName,
        paymentReference: reference || "Manual Cash Override by Super Admin"
      };
      const res = await axiosInstance.patch(`/api/super-admin/companies/${companyId}`, payload);
      toast.success(`Successfully upgraded company plan to ${planName}!`);
      
      setCompanies(prev => prev.map(c =>
        c.id === companyId
          ? {
              ...c,
              ...res.data,
              createdDate: c.createdDate,
              accountUrl: c.accountUrl,
              logoType: c.logoType,
              logoColor: c.logoColor,
            }
          : c
      ));
    } catch (error) {
      console.error("Error manually upgrading company plan:", error);
      toast.error(error.response?.data?.error || "Failed to upgrade company plan");
      throw error;
    }
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const renderLogo = (company) => {
    if (company.logo) {
      return (
        <img
          src={company.logo}
          alt={company.name}
          className="h-8 w-8 rounded-full object-cover border border-slate-100 dark:border-slate-800 shrink-0"
        />
      );
    }
    const colorClass = company.logoColor || "bg-orange-100 text-orange-600 border-orange-200";
    const Icon = () => {
      switch (company.logoType) {
        case "hexagon": return <Hexagon className="h-4 w-4" />;
        case "zap": return <Zap className="h-4 w-4" />;
        case "atom": return <Atom className="h-4 w-4" />;
        case "leaf": return <Leaf className="h-4 w-4" />;
        case "compass": return <Compass className="h-4 w-4" />;
        default: return <Building className="h-4 w-4" />;
      }
    };
    return (
      <div className={`h-8 w-8 rounded-xl flex items-center justify-center border shrink-0 ${colorClass}`}>
        <Icon />
      </div>
    );
  };

  // Filtering
  const filtered = companies.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.accountUrl.toLowerCase().includes(searchTerm.toLowerCase());
    const matchPlan = selectedPlan ? c.plan.toLowerCase().includes(selectedPlan.toLowerCase()) : true;
    const matchStatus = selectedStatus ? c.status === selectedStatus : true;
    return matchSearch && matchPlan && matchStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === "Newest") return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
    if (sortBy === "Oldest") return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
    return 0;
  });

  const paginated = sorted.slice(0, rowsPerPage);

  const totalActive = companies.filter(c => c.status === "active").length;
  const totalInactive = companies.filter(c => c.status === "suspended").length;

  if (!mounted || loading) {
    return (
      <DashboardWrapper>
        <div className="space-y-6 animate-pulse p-6">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800/80 rounded-lg w-96" />
          </div>
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full max-w-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
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
      <div className="space-y-6">
        <ConfirmModal
          isOpen={!!confirmDeleteId}
          title="Delete Company"
          message="Are you sure you want to delete this tenant company? This will revoke all representative and client admin access instantly."
          onConfirm={() => {
            if (confirmDeleteId) {
              setCompanies(companies.filter(c => c.id !== confirmDeleteId));
            }
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Breadcrumb */}
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              Companies
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <Home className="h-3.5 w-3.5" />
              <span>/</span>
              <span>Super Admin</span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300">Companies List</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
              <ArrowUpRight className="h-4 w-4" />
              Export
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => {
                setSelectedCompany(null);
                setModalMode("add");
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 hover:shadow-xl text-white rounded-xl text-xs font-black transition"
            >
              <Plus className="h-4 w-4" /> Add Company
            </button>
          </div>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Companies */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-100 dark:bg-orange-950/40 text-orange-500 rounded-2xl border border-orange-200/40">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Companies</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-0.5">{companies.length}</p>
              </div>
            </div>
            <Sparkline color="#f97316" />
          </div>

          {/* Active Companies */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-500 rounded-2xl border border-emerald-200/40">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Companies</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-0.5">{totalActive}</p>
              </div>
            </div>
            <Sparkline color="#f97316" />
          </div>

          {/* Inactive Companies */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 dark:bg-red-950/40 text-red-500 rounded-2xl border border-red-200/40">
                <Building className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inactive Companies</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-0.5">{totalInactive}</p>
              </div>
            </div>
            <Sparkline color="#f97316" />
          </div>

          {/* Company Location */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyan-100 dark:bg-cyan-950/40 text-cyan-500 rounded-2xl border border-cyan-200/40">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Company Location</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-0.5">180</p>
              </div>
            </div>
            <Sparkline color="#f97316" />
          </div>
        </div>

        {/* ── Companies List Card ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">

          {/* Filter Controls Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wide">
              Companies List
            </h3>

            <div className="flex flex-wrap items-center gap-3 text-[11px] font-semibold">
              {/* Date Range */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 text-slate-500 text-xs">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>05/28/2026 - 06/03/2026</span>
              </div>

              {/* Plan Filter */}
              <select
                value={selectedPlan}
                onChange={e => setSelectedPlan(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="">Select Plan</option>
                <option value="Basic">Basic</option>
                <option value="Advanced">Advanced</option>
                <option value="Enterprise">Enterprise</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="">Select Status</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="Last 7 Days">Sort By: Last 7 Days</option>
                <option value="Newest">Sort By: Newest</option>
                <option value="Oldest">Sort By: Oldest</option>
              </select>
            </div>
          </div>

          {/* Pagination & Search Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 py-3 border-b border-slate-100 dark:border-slate-800/60 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500">
              <span>Row Per Page</span>
              <select
                value={rowsPerPage}
                onChange={e => setRowsPerPage(Number(e.target.value))}
                className="px-2 py-1 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 focus:outline-none font-bold cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>Entries</span>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-xs transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                  <th className="px-5 pb-3 pt-4 w-8">
                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-orange-500 cursor-pointer focus:ring-orange-500/20" />
                  </th>
                  <th className="pb-3 pt-4 pr-3">Company Name</th>
                  <th className="pb-3 pt-4 pr-3">Email</th>
                  <th className="pb-3 pt-4 pr-3">Account URL</th>
                  <th className="pb-3 pt-4 pr-3">Plan</th>
                  <th className="pb-3 pt-4 pr-3">Credits</th>
                  <th className="pb-3 pt-4 pr-3">Created Date</th>
                  <th className="pb-3 pt-4 pr-5">Status</th>
                  <th className="pb-3 pt-4 text-right pr-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400 font-bold">
                      No matching companies found.
                    </td>
                  </tr>
                ) : (
                  paginated.map(company => (
                    <tr key={company.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 group transition-colors">
                      {/* Checkbox */}
                      <td className="px-5 py-4">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-orange-500 cursor-pointer focus:ring-orange-500/20" />
                      </td>

                      {/* Company Name */}
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-3">
                          {renderLogo(company)}
                          <span className="font-bold text-slate-800 dark:text-slate-100 text-xs leading-tight">
                            {company.name}
                          </span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 pr-3 text-slate-500 dark:text-slate-400 font-medium">
                        {company.email}
                      </td>

                      {/* Account URL */}
                      <td className="py-4 pr-3 text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                        {company.accountUrl}
                      </td>

                      {/* Plan + Upgrade button */}
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                            {company.plan}
                          </span>
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setShowUpgradeModal(true);
                            }}
                            className="text-[9px] font-black uppercase bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/80 px-1.5 py-0.5 rounded hover:bg-purple-200 dark:hover:bg-purple-900 transition whitespace-nowrap"
                          >
                            Upgrade
                          </button>
                        </div>
                      </td>

                      {/* Credits */}
                      <td className="py-4 pr-3 font-bold text-teal-650 dark:text-teal-400">
                        {company.credits !== undefined && company.credits !== null ? company.credits.toLocaleString() : "1,000"}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 pr-3 text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
                        {company.createdDate}
                      </td>

                      {/* Status */}
                      <td className="py-4 pr-5">
                        <button
                          onClick={() => toggleStatus(company.id)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold capitalize flex items-center gap-1.5 w-fit transition ${company.status === "active"
                              ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                              : "bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
                            }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${company.status === "active" ? "bg-emerald-500" : "bg-rose-500"}`} />
                          {company.status === "active" ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-5 text-right">
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setModalMode("view");
                              setShowAddModal(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition"
                            title="View"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedCompany(company);
                              setModalMode("edit");
                              setShowAddModal(true);
                            }}
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(company.id)}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-600 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer: results count */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
            <span>
              Showing {paginated.length} of {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
            </span>
            <div className="flex items-center gap-1">
              <button className="px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">Previous</button>
              <button className="px-2.5 py-1 bg-orange-500 text-white rounded-lg font-bold">1</button>
              <button className="px-2.5 py-1 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition">Next</button>
            </div>
          </div>
        </div>

      </div>

      {/* Add Company Modal */}
      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setSelectedCompany(null);
        }}
        onAdd={handleSaveCompany}
        mode={modalMode}
        company={selectedCompany}
        plans={systemPlans}
      />

      {/* Manual Upgrade Modal */}
      <UpgradeCompanyPlanModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setSelectedCompany(null);
        }}
        onUpgrade={handleManualUpgrade}
        company={selectedCompany}
        plans={systemPlans}
      />
    </DashboardWrapper>
  );
}
