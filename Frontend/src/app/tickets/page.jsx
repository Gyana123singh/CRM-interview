"use client";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTicket } from "@/store";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import TicketDetailsModal from "@/components/dashboard/shared/TicketDetailsModal";
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  MessageSquare,
  Building,
  User,
  AlertTriangle,
  FolderOpen
} from "lucide-react";

import { toast } from "react-toastify";

export default function TicketsPage() {
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch();

  React.useEffect(() => {
    setMounted(true);
  }, []);
  const user = useSelector((state) => state.auth.user);
  const activeRole = useSelector((state) => state.auth.activeRole);
  const tickets = useSelector((state) => state.tickets.tickets);

  // Modal State
  const [selectedTicketId, setSelectedTicketId] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Ticket Form State
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("Technical Bug");
  const [newPriority, setNewPriority] = useState("Medium");
  const [ticketErrors, setTicketErrors] = useState({});

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");

  // Filter logic based on Role permissions
  const getRoleFilteredTickets = () => {
    if (!user) return [];

    let baseTickets = [...tickets];

    if (activeRole === "admin" || activeRole === "sales-manager") {
      // Admins and Sales Managers see tickets from their company
      baseTickets = tickets.filter((t) => t.companyId === user.companyId);
    } else {
      // Sales Executives / Team see tickets created by themselves
      baseTickets = tickets.filter((t) => t.createdBy === user.name);
    }

    // Apply filters
    return baseTickets.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "All" ? true : t.status === statusFilter;
      const matchesPriority = priorityFilter === "All" ? true : t.priority === priorityFilter;
      const matchesCategory = categoryFilter === "All" ? true : t.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
    });
  };

  const filteredTickets = getRoleFilteredTickets();

  // Stats calculation
  const totalCount = filteredTickets.length;
  const openCount = filteredTickets.filter((t) => t.status === "Open").length;
  const inProgressCount = filteredTickets.filter((t) => t.status === "In Progress").length;
  const resolvedCount = filteredTickets.filter((t) => t.status === "Resolved" || t.status === "Closed").length;

  const validateTicketForm = () => {
    const errors = {};
    if (!newTitle || !newTitle.trim() || newTitle.trim().length < 5) {
      errors.title = "Ticket subject must be at least 5 characters";
    }
    if (!newDescription || !newDescription.trim() || newDescription.trim().length < 10) {
      errors.description = "Detailed description must be at least 10 characters";
    }
    setTicketErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!validateTicketForm()) {
      toast.error("Please fill in all ticket details correctly.");
      return;
    }

    if (!user) {
      toast.error("User session missing. Please log in again.");
      return;
    }

    dispatch(
      addTicket({
        title: newTitle.trim(),
        description: newDescription.trim(),
        category: newCategory,
        priority: newPriority,
        createdBy: user.name,
        creatorRole: activeRole,
        companyId: user.companyId || "company_platform",
        companyName: user.companyName || "CRM Sales Management System",
      })
    );

    toast.success(`Platform ticket "${newTitle.trim()}" filed successfully!`);

    // Reset Form
    setNewTitle("");
    setNewDescription("");
    setNewCategory("Technical Bug");
    setNewPriority("Medium");
    setTicketErrors({});
    setShowCreateModal(false);
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "bg-rose-500/10 text-rose-500 border-rose-500/20";
      case "High":
        return "bg-amber-500/10 text-amber-500 border-amber-500/20";
      case "Medium":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";
      case "Low":
        return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Open":
        return "bg-blue-500/15 text-blue-500 border border-blue-500/20";
      case "In Progress":
        return "bg-purple-500/15 text-purple-500 border border-purple-500/20";
      case "Resolved":
        return "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20";
      case "Closed":
        return "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
    }
  };

  if (!mounted) {
    return (
      <DashboardWrapper>
        <div className="space-y-6 animate-pulse p-6">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800/80 rounded-lg w-96" />
          </div>
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full max-w-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
      <div className="space-y-6 select-none animate-fade-in pb-12">

        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              Support Ticketing Portal <LifeBuoy className="h-6 w-6 text-indigo-500 animate-pulse" />
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {activeRole === "admin"
                ? "Oversee and resolve support tickets across your organization."
                : "Create support cards and correspond directly with systems engineers."}
            </p>
          </div>

          {activeRole !== "super-admin" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary to-gray-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:scale-102 hover:shadow-lg transition shadow-md shadow-primary/20 shrink-0"
            >
              <Plus className="h-4 w-4" /> Raise Support Ticket
            </button>
          )}
        </div>

        {/* Dashboard Quotas/Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs transition hover:border-slate-350 dark:hover:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 shrink-0">
                <FolderOpen className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-slate-450 dark:text-slate-500 tracking-wider">Total Tickets</span>
                <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 leading-none mt-1">{totalCount}</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-indigo-500" />
          </div>

          {/* Card 2: Open */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs transition hover:border-slate-350 dark:hover:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-blue-500/10 border border-blue-500/20 text-blue-500 shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-slate-450 dark:text-slate-500 tracking-wider">Open Status</span>
                <span className="text-2xl md:text-3xl font-black text-blue-500 leading-none mt-1">{openCount}</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-500" />
          </div>

          {/* Card 3: In Progress */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs transition hover:border-slate-350 dark:hover:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-purple-500/10 border border-purple-500/20 text-purple-500 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-slate-450 dark:text-slate-500 tracking-wider">In Progress</span>
                <span className="text-2xl md:text-3xl font-black text-purple-500 leading-none mt-1">{inProgressCount}</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-purple-500" />
          </div>

          {/* Card 4: Resolved */}
          <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl shadow-xs transition hover:border-slate-350 dark:hover:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 shrink-0">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black text-slate-450 dark:text-slate-500 tracking-wider">Resolved</span>
                <span className="text-2xl md:text-3xl font-black text-emerald-500 leading-none mt-1">{resolvedCount}</span>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-emerald-500" />
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-xs w-full max-w-sm">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search tickets by ID, title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-slate-955 dark:text-slate-50 placeholder:text-slate-400"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-slate-405">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl outline-none"
              >
                <option value="All">All</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-405">Priority:</span>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl outline-none"
              >
                <option value="All">All</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-405">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl outline-none"
              >
                <option value="All">All All</option>
                <option value="Technical Bug">Technical Bug</option>
                <option value="Billing">Billing</option>
                <option value="Feature Request">Feature Request</option>
                <option value="General Inquiry">General Inquiry</option>
                <option value="Integration Issue">Integration Issue</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Listing Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs overflow-hidden">
          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3.5 mb-4">
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-100 tracking-wide flex items-center gap-2">
              <LifeBuoy className="h-4.5 w-4.5 text-indigo-500" /> Active Tickets Queue
            </h3>
            <span className="text-[10px] text-slate-455 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {filteredTickets.length} Items Found
            </span>
          </div>

          <div className="overflow-x-auto select-text">
            {filteredTickets.length === 0 ? (
              <div className="py-12 text-center text-xs font-semibold text-slate-400 bg-slate-50 dark:bg-slate-950/20 rounded-2xl">
                No support tickets found matching current query parameters.
              </div>
            ) : (
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-slate-850 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                    <th className="pb-3 pr-2 w-16">ID</th>
                    <th className="pb-3 pr-2">Subject / Details</th>
                    {activeRole === "super-admin" && <th className="pb-3 pr-2">Client Company</th>}
                    <th className="pb-3 pr-2 w-28">Category</th>
                    <th className="pb-3 pr-2 w-24">Priority</th>
                    <th className="pb-3 pr-2 w-28">Assigned To</th>
                    <th className="pb-3 pr-2 w-24">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850/80">
                  {filteredTickets.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-950/25 group cursor-pointer transition-colors"
                    >
                      <td className="py-4 font-bold text-slate-400 text-[10px] uppercase">{t.id}</td>
                      <td className="py-4 pr-3 max-w-sm">
                        <div className="space-y-1">
                          <p className="font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-indigo-500 transition-colors">
                            {t.title}
                          </p>
                          <p className="text-[10px] text-slate-455 dark:text-slate-400 truncate max-w-sm font-semibold">
                            {t.description}
                          </p>
                          <p className="text-[9px] text-slate-400 font-semibold flex items-center gap-2">
                            <span className="flex items-center gap-0.5"><User className="h-3 w-3" /> {t.createdBy}</span>
                            <span>• {new Date(t.updatedAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </td>
                      {activeRole === "super-admin" && (
                        <td className="py-4 pr-2 font-bold text-slate-700 dark:text-slate-350">
                          <span className="flex items-center gap-1"><Building className="h-3.5 w-3.5 text-slate-400" /> {t.companyName}</span>
                        </td>
                      )}
                      <td className="py-4 pr-2 text-slate-500 dark:text-slate-400 font-bold uppercase text-[9px] tracking-wide">
                        {t.category}
                      </td>
                      <td className="py-4 pr-2">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${getPriorityBadgeColor(t.priority)}`}>
                          {t.priority}
                        </span>
                      </td>
                      <td className="py-4 pr-2 text-slate-600 dark:text-slate-300 font-bold">
                        {t.assignedTo || "Unassigned"}
                      </td>
                      <td className="py-4 pr-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${getStatusBadgeColor(t.status)}`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTicketId(t.id);
                          }}
                          className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-950/80 border border-indigo-100 dark:border-indigo-900/40 rounded-xl font-bold transition flex items-center gap-1.5 ml-auto text-[11px]"
                        >
                          <MessageSquare className="h-3.5 w-3.5" /> Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Create Support Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-45 animate-fade-in">
            <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
                <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-100 tracking-wide flex items-center gap-1.5">
                  <LifeBuoy className="h-4.5 w-4.5 text-indigo-500 animate-pulse" /> File Platform Ticket
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
                >
                  <Clock className="h-4 w-4 rotate-45 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket} className="space-y-4 text-xs font-semibold">

                {/* Title */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Ticket Subject *</label>
                    {ticketErrors.title && (
                      <span className="text-[11px] font-medium text-rose-400">⚠️ {ticketErrors.title}</span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Short description of the technical or billing problem..."
                    value={newTitle}
                    onChange={(e) => {
                      setNewTitle(e.target.value);
                      if (ticketErrors.title) setTicketErrors((prev) => ({ ...prev, title: undefined }));
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 outline-none transition-all ${
                      ticketErrors.title
                        ? "border-rose-500/60 text-rose-200 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10"
                        : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/50"
                    }`}
                  />
                </div>

                {/* Dropdowns */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Issue Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    >
                      <option value="Technical Bug">Technical Bug</option>
                      <option value="Billing">Billing Inquiry</option>
                      <option value="Feature Request">Feature Request</option>
                      <option value="General Inquiry">General Inquiry</option>
                      <option value="Integration Issue">Integration Issue</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Priority Severity</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical Severity</option>
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Detailed Description *</label>
                    {ticketErrors.description && (
                      <span className="text-[11px] font-medium text-rose-400">⚠️ {ticketErrors.description}</span>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Provide details of the bug, transaction issue, or custom request. Include error codes or web logs if possible..."
                    value={newDescription}
                    onChange={(e) => {
                      setNewDescription(e.target.value);
                      if (ticketErrors.description) setTicketErrors((prev) => ({ ...prev, description: undefined }));
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 outline-none transition-all ${
                      ticketErrors.description
                        ? "border-rose-500/60 text-rose-200 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10"
                        : "border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-indigo-500/50"
                    }`}
                  />
                </div>

                <div className="flex gap-2.5 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-primary to-gray-500 text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:scale-102 transition"
                  >
                    Submit Support Ticket
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* View / Manage Ticket Details Modal */}
        {selectedTicketId && (
          <TicketDetailsModal
            ticketId={selectedTicketId}
            onClose={() => setSelectedTicketId(null)}
          />
        )}

      </div>
    </DashboardWrapper>
  );
}
