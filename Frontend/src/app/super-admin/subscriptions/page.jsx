"use client";

import React, { useState, useEffect } from "react";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import InvoiceModal from "@/components/modal/super-admin/InvoiceModal";
import ConfirmModal from "@/components/shared/ConfirmModal";
import axiosInstance from "@/utils/axiosInstance";
import { toast } from "react-toastify";
import {
  Home,
  Search,
  Calendar,
  ArrowUpRight,
  ChevronDown,
  FileText,
  Download,
  Trash2,
  Hexagon,
  Zap,
  Atom,
  Leaf,
  Compass,
  Building,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Sparkline({ color = "#f97316", data }) {
  const pts = data ?? [12, 8, 14, 6, 16, 10, 18];
  const max = Math.max(...pts);
  const W = 70, H = 28;
  const coords = pts.map((v, i) => {
    const x = (i / (pts.length - 1)) * W;
    const y = H - (v / max) * H;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-[70px] h-7 shrink-0">
      <polyline points={coords} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SubscriberLogo({ sub }) {
  const icons = {
    hexagon: <Hexagon className="h-4 w-4" />,
    zap:     <Zap className="h-4 w-4" />,
    atom:    <Atom className="h-4 w-4" />,
    leaf:    <Leaf className="h-4 w-4" />,
    compass: <Compass className="h-4 w-4" />,
    building:<Building className="h-4 w-4" />,
  };
  return (
    <div className={`h-8 w-8 rounded-xl flex items-center justify-center border shrink-0 ${sub.logoColor}`}>
      {icons[sub.logoType]}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SubscriptionsPage() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [sortBy, setSortBy] = useState("Last 7 Days");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Invoice modal state
  const [showInvoice, setShowInvoice] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/api/super-admin/subscriptions");
      setSubscriptions(res.data);
    } catch (err) {
      console.error("Failed to load subscriptions:", err);
      toast.error(err.response?.data?.error || "Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchSubscriptions();
  }, []);

  const handleOpenInvoice = (sub) => {
    setActiveInvoice(sub);
    setShowInvoice(true);
  };

  const handleDelete = (id) => {
    setConfirmDeleteId(id);
  };

  const executeDeleteSubscription = async () => {
    if (!confirmDeleteId) return;
    try {
      await axiosInstance.delete(`/api/super-admin/subscriptions/${confirmDeleteId}`);
      toast.success("Subscription record deleted successfully");
      setSubscriptions(prev => prev.filter(s => s.id !== confirmDeleteId));
    } catch (err) {
      console.error("Failed to delete subscription:", err);
      toast.error(err.response?.data?.error || "Failed to delete subscription");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  // Metrics derived from data
  const totalTransaction = subscriptions.reduce((sum, s) => sum + s.amount, 0);
  const totalSubscribers = subscriptions.length;
  const activeSubscribers = subscriptions.filter(s => s.status === "Paid").length;
  const expiredSubscribers = subscriptions.filter(s => s.status === "Unpaid").length;

  // Filtering & sorting
  const filtered = subscriptions.filter(s => {
    const q = searchTerm.toLowerCase();
    const matchSearch = s.subscriberName.toLowerCase().includes(q) || s.subscriberEmail.toLowerCase().includes(q);
    const matchPlan   = selectedPlan   ? s.plan.toLowerCase().includes(selectedPlan.toLowerCase())  : true;
    const matchStatus = selectedStatus ? s.status === selectedStatus : true;
    return matchSearch && matchPlan && matchStatus;
  });

  const paginated = filtered.slice(0, rowsPerPage);

  // Build invoice data object
  const invoiceData = activeInvoice
    ? {
        invoiceNumber: `INV${String(activeInvoice.id.replace("sub_", "")).padStart(4, "0")}`.toUpperCase().replace("INV", "INV0"),
        issueDate: activeInvoice.createdDate,
        dueDate: activeInvoice.expiringOn,
        subscriberName: activeInvoice.subscriberName,
        subscriberAddress: activeInvoice.subscriberAddress,
        subscriberEmail: activeInvoice.subscriberEmail,
        plan: activeInvoice.plan,
        billingCycle: activeInvoice.billingCycle,
        createdDate: activeInvoice.createdDate,
        expiringOn: activeInvoice.expiringOn,
        amount: activeInvoice.amount,
        paymentMethod: activeInvoice.paymentMethod,
        paymentLast4: activeInvoice.paymentLast4,
        tax: 0,
      }
    : null;

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
          title="Delete Subscription Record"
          message="Are you sure you want to delete this subscription transaction record?"
          onConfirm={executeDeleteSubscription}
          onCancel={() => setConfirmDeleteId(null)}
        />

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Subscription
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              <Home className="h-3.5 w-3.5" />
              <span>/</span>
              <span>Super Admin</span>
              <span>/</span>
              <span className="text-slate-600 dark:text-slate-300">Subscription</span>
            </div>
          </div>

          <button className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition self-start md:self-auto shadow-sm">
            <ArrowUpRight className="h-4 w-4" />
            Export
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>

        {/* ── Stats Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Transaction */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Transaction</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">
                  ${totalTransaction.toLocaleString()}
                </p>
              </div>
              <Sparkline color="#f97316" data={[10, 16, 12, 20, 14, 22, 18]} />
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-500 font-bold">
              <span>↗ +19.01%</span>
              <span className="text-slate-400 font-normal">from last week</span>
            </div>
          </div>

          {/* Total Subscribers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Subscribers</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">
                  {totalSubscribers + 591}
                </p>
              </div>
              <Sparkline color="#3b82f6" data={[8, 12, 10, 14, 12, 18, 14]} />
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-500 font-bold">
              <span>↗ +19.01%</span>
              <span className="text-slate-400 font-normal">from last week</span>
            </div>
          </div>

          {/* Active Subscribers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Subscribers</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">
                  {activeSubscribers + 552}
                </p>
              </div>
              <Sparkline color="#22c55e" data={[6, 10, 8, 14, 10, 16, 12]} />
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-500 font-bold">
              <span>↗ +19.01%</span>
              <span className="text-slate-400 font-normal">from last week</span>
            </div>
          </div>

          {/* Expired Subscribers */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expired Subscribers</p>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">
                  {expiredSubscribers + 39}
                </p>
              </div>
              <Sparkline color="#ef4444" data={[14, 10, 16, 8, 12, 6, 10]} />
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-500 font-bold">
              <span>↗ +19.01%</span>
              <span className="text-slate-400 font-normal">from last week</span>
            </div>
          </div>
        </div>

        {/* ── Subscription List Card ── */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">

          {/* Filter Row */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 border-b border-slate-100 dark:border-slate-800/60">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-50 uppercase tracking-wide">
              Subscription List
            </h3>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Date Range */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/30 text-slate-500">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-[11px]">05/28/2026 - 06/03/2026</span>
              </div>

              {/* Plan Filter */}
              <select
                value={selectedPlan}
                onChange={e => setSelectedPlan(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-[11px] focus:outline-none cursor-pointer"
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
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-[11px] focus:outline-none cursor-pointer"
              >
                <option value="">Select Status</option>
                <option value="Paid">Paid</option>
                <option value="Unpaid">Unpaid</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-300 text-[11px] focus:outline-none cursor-pointer"
              >
                <option value="Last 7 Days">Sort By : Last 7 Days</option>
                <option value="Newest">Sort By : Newest</option>
                <option value="Oldest">Sort By : Oldest</option>
              </select>
            </div>
          </div>

          {/* Row Per Page + Search */}
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
              </select>
              <span>Entries</span>
            </div>

            <div className="relative max-w-xs w-full">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
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
                    <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-orange-500 focus:ring-orange-500/20 cursor-pointer" />
                  </th>
                  <th className="pb-3 pt-4 pr-3 min-w-[180px]">Subscriber</th>
                  <th className="pb-3 pt-4 pr-3 min-w-[160px]">Plan</th>
                  <th className="pb-3 pt-4 pr-3">Billing Cycle</th>
                  <th className="pb-3 pt-4 pr-3">Payment Method</th>
                  <th className="pb-3 pt-4 pr-3">Amount</th>
                  <th className="pb-3 pt-4 pr-3">Created Date</th>
                  <th className="pb-3 pt-4 pr-3">Expiring On</th>
                  <th className="pb-3 pt-4 pr-5">Status</th>
                  <th className="pb-3 pt-4 pr-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {paginated.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-slate-400 font-bold">
                      No subscriptions found.
                    </td>
                  </tr>
                ) : (
                  paginated.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/20 group transition-colors">
                      {/* Checkbox */}
                      <td className="px-5 py-4">
                        <input type="checkbox" className="rounded border-slate-300 dark:border-slate-700 text-orange-500 focus:ring-orange-500/20 cursor-pointer" />
                      </td>

                      {/* Subscriber */}
                      <td className="py-4 pr-3">
                        <div className="flex items-center gap-3">
                          <SubscriberLogo sub={sub} />
                          <span className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
                            {sub.subscriberName}
                          </span>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-4 pr-3 text-slate-500 dark:text-slate-400 font-medium">
                        {sub.plan}
                      </td>

                      {/* Billing Cycle */}
                      <td className="py-4 pr-3 text-slate-500 dark:text-slate-400 font-medium">
                        {sub.billingCycle}
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 pr-3">
                        {sub.paymentMethod === "Paypal" ? (
                          <span className="text-blue-500 font-bold">{sub.paymentMethod}</span>
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 font-medium">{sub.paymentMethod}</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-4 pr-3 font-bold text-slate-700 dark:text-slate-200">
                        ${sub.amount.toLocaleString()}
                      </td>

                      {/* Created Date */}
                      <td className="py-4 pr-3 text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
                        {sub.createdDate}
                      </td>

                      {/* Expiring On */}
                      <td className="py-4 pr-3 text-slate-500 dark:text-slate-400 font-semibold whitespace-nowrap">
                        {sub.expiringOn}
                      </td>

                      {/* Status */}
                      <td className="py-4 pr-5">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            sub.status === "Paid"
                              ? "bg-emerald-500 text-white"
                              : "bg-rose-500 text-white"
                          }`}
                        >
                          {sub.status === "Paid" ? "✦ Paid" : "✦ Unpaid"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-5">
                        <div className="flex items-center gap-1.5 justify-end">
                          {/* View Invoice */}
                          <button
                            onClick={() => handleOpenInvoice(sub)}
                            className="p-1.5 hover:bg-orange-50 dark:hover:bg-orange-950/30 text-slate-400 hover:text-orange-500 rounded-lg transition"
                            title="View Invoice"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                          {/* Download */}
                          <button
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-lg transition"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(sub.id)}
                            className="p-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-400 hover:text-rose-500 rounded-lg transition"
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

          {/* Footer Pagination */}
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

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoice}
        onClose={() => { setShowInvoice(false); setActiveInvoice(null); }}
        invoice={invoiceData}
      />
    </DashboardWrapper>
  );
}
