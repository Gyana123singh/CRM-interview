"use client";

import React, { useState, useEffect } from "react";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import { toast } from "react-toastify";
import {
  Plus,
  Download,
  Filter,
  Sparkles,
  ArrowRightLeft,
  CheckCircle,
  Edit,
  Clock,
  Code,
  Upload
} from "lucide-react";
import { downloadCSV } from "@/utils/exportCsv";
import CSVImportModal from "@/components/shared/CSVImportModal";
import {
  useGetLeadsQuery,
  useUpdateLeadStatusMutation,
  useUpdateLeadPriorityMutation,
  useAssignLeadMutation,
  useGetAgentsQuery,
  useCreateLeadMutation
} from "@/store/api/leadsApi";
import { DataTable } from "@/components/ui/DataTable";
import { ConvertLeadModal } from "@/components/leads/ConvertLeadModal";
import { ActivityTimelineModal } from "@/components/shared/ActivityTimelineModal";
import { ScriptGeneratorModal } from "@/components/leads/ScriptGeneratorModal";
import { subscribeToRealtimeEvent } from "@/utils/socketEvents";

function StatusSelectCell({ lead, onStatusChange }) {
  const [val, setVal] = useState(lead.status || "New");

  useEffect(() => {
    setVal(lead.status || "New");
  }, [lead.status]);

  const handleChange = (e) => {
    const nextVal = e.target.value;
    setVal(nextVal);
    onStatusChange(lead.id || lead._id, nextVal);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "Converted":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25";
      case "Lost":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25";
      case "Interested":
        return "bg-purple-500/15 text-purple-400 border-purple-500/30 hover:bg-purple-500/25";
      case "Follow-up":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25";
      case "Contacted":
        return "bg-teal-500/15 text-teal-400 border-teal-500/30 hover:bg-teal-500/25";
      default:
        return "bg-indigo-500/15 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/25";
    }
  };

  return (
    <div className="inline-flex items-center whitespace-nowrap shrink-0">
      <select
        value={val}
        onChange={handleChange}
        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer outline-none whitespace-nowrap shrink-0 ${getStatusStyle(val)}`}
      >
        <option value="New" className="bg-slate-900 text-slate-200">New</option>
        <option value="Contacted" className="bg-slate-900 text-slate-200">Contacted</option>
        <option value="Interested" className="bg-slate-900 text-slate-200">Interested</option>
        <option value="Follow-up" className="bg-slate-900 text-slate-200">Follow-up</option>
        <option value="Converted" className="bg-slate-900 text-slate-200">Converted</option>
        <option value="Lost" className="bg-slate-900 text-slate-200">Lost</option>
      </select>
    </div>
  );
}

function PrioritySelectCell({ lead, onPriorityChange }) {
  const [val, setVal] = useState(lead.priority || "Medium");

  useEffect(() => {
    setVal(lead.priority || "Medium");
  }, [lead.priority]);

  const handleChange = (e) => {
    const nextVal = e.target.value;
    setVal(nextVal);
    onPriorityChange(lead.id || lead._id, nextVal);
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case "Urgent":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30 hover:bg-rose-500/30";
      case "High":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30 hover:bg-amber-500/30";
      case "Low":
        return "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700/80";
      default:
        return "bg-indigo-500/20 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/30";
    }
  };

  return (
    <div className="inline-flex items-center whitespace-nowrap shrink-0">
      <select
        value={val}
        onChange={handleChange}
        className={`px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer outline-none whitespace-nowrap shrink-0 ${getPriorityStyle(val)}`}
      >
        <option value="Low" className="bg-slate-900 text-slate-200">Low</option>
        <option value="Medium" className="bg-slate-900 text-slate-200">Medium</option>
        <option value="High" className="bg-slate-900 text-slate-200">High</option>
        <option value="Urgent" className="bg-slate-900 text-slate-200">Urgent</option>
      </select>
    </div>
  );
}

function AssignedRepSelectCell({ lead, agentsList, onAssignAgent }) {
  const [val, setVal] = useState(lead.assignedToId || "");

  useEffect(() => {
    setVal(lead.assignedToId || "");
  }, [lead.assignedToId]);

  const handleChange = (e) => {
    const nextVal = e.target.value;
    setVal(nextVal);
    onAssignAgent(lead.id || lead._id, nextVal);
  };

  return (
    <div className="inline-flex items-center whitespace-nowrap shrink-0">
      <select
        value={val}
        onChange={handleChange}
        className="px-3 py-1 bg-slate-950 border border-slate-800 rounded-full text-xs font-medium text-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 whitespace-nowrap shrink-0 cursor-pointer hover:border-slate-700 transition-colors"
      >
        <option value="" className="bg-slate-900 text-slate-400">Unassigned</option>
        {agentsList.map((ag) => (
          <option key={ag.id || ag._id} value={ag.id || ag._id} className="bg-slate-900 text-slate-200">
            {ag.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function ClientAdminLeadsPage() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedLeadForEdit, setSelectedLeadForEdit] = useState(null);
  const [selectedLeadForConvert, setSelectedLeadForConvert] = useState(null);
  const [selectedLeadForTimeline, setSelectedLeadForTimeline] = useState(null);
  const [showScriptGeneratorModal, setShowScriptGeneratorModal] = useState(false);

  // Form states for manual lead creation
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [serviceInterest, setServiceInterest] = useState("");
  const [source, setSource] = useState("Website");
  const [priority, setPriority] = useState("Medium");
  const [assignedToId, setAssignedToId] = useState("");
  const [notes, setNotes] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);

  const { data, isLoading, refetch } = useGetLeadsQuery({
    page,
    limit: 10,
    search: search || undefined,
    status: statusFilter && !statusFilter.toLowerCase().includes("all") ? statusFilter : undefined,
    source: sourceFilter && !sourceFilter.toLowerCase().includes("all") ? sourceFilter : undefined,
    priority: priorityFilter && !priorityFilter.toLowerCase().includes("all") ? priorityFilter : undefined
  });

  useEffect(() => {
    setMounted(true);
    refetch();
    const unsub1 = subscribeToRealtimeEvent("lead_created", () => refetch());
    const unsub2 = subscribeToRealtimeEvent("lead_updated", () => refetch());
    const unsub3 = subscribeToRealtimeEvent("lead_assigned", () => refetch());
    return () => {
      unsub1();
      unsub2();
      unsub3();
    };
  }, [refetch]);

  const { data: agentsData } = useGetAgentsQuery(undefined, { skip: !mounted });
  const agentsList = Array.isArray(agentsData) ? agentsData : [];

  const [updateLeadStatus] = useUpdateLeadStatusMutation();
  const [updateLeadPriority] = useUpdateLeadPriorityMutation();
  const [assignLead] = useAssignLeadMutation();
  const [createLead, { isLoading: isCreating }] = useCreateLeadMutation();

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateLeadStatus({ id, status: newStatus }).unwrap();
      toast.success("Lead status updated successfully");
      refetch();
    } catch (err) {
      toast.error(err?.data?.error?.message || err?.data?.error || err?.data?.message || err?.message || "Failed to update status");
    }
  };

  const handlePriorityChange = async (id, newPriority) => {
    try {
      await updateLeadPriority({ id, priority: newPriority }).unwrap();
      toast.success("Lead priority updated successfully");
      refetch();
    } catch (err) {
      toast.error(err?.data?.error?.message || err?.data?.error || err?.data?.message || err?.message || "Failed to update priority");
    }
  };

  const handleAssignAgent = async (id, agentId) => {
    try {
      await assignLead({ id, agentId: agentId || null }).unwrap();
      toast.success("Agent assigned successfully");
      refetch();
    } catch (err) {
      toast.error(err?.data?.error?.message || err?.data?.error || err?.data?.message || err?.message || "Failed to assign agent");
    }
  };

  const handleAddLeadSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error("Name and phone number are required");
      return;
    }

    try {
      await createLead({
        name,
        phone,
        email,
        location,
        serviceInterest: serviceInterest || "AI Integration Consultation",
        source,
        priority,
        assignedTo: assignedToId || undefined,
        notes
      }).unwrap();

      toast.success(`Lead "${name}" created successfully!`);
      setName("");
      setPhone("");
      setEmail("");
      setLocation("");
      setServiceInterest("");
      setNotes("");
      setAssignedToId("");
      setShowAddModal(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.error?.message || "Failed to create lead");
    }
  };

  const leadsList = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  const columns = [
    {
      header: "Lead / Contact",
      cell: (lead) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-indigo-500/10 text-indigo-400 font-bold flex items-center justify-center text-sm uppercase border border-indigo-500/20">
            {lead.name ? lead.name.charAt(0) : "L"}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-100">{lead.name}</span>
            <span className="text-xs text-slate-400">
              {lead.phone} {lead.email ? `• ${lead.email}` : ""}
            </span>
          </div>
        </div>
      )
    },
    {
      header: "Service Interest",
      cell: (lead) => <span className="font-medium text-slate-200">{lead.serviceInterest}</span>
    },
    {
      header: "Source",
      cell: (lead) => (
        <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 whitespace-nowrap inline-block shrink-0">
          {lead.source}
        </span>
      )
    },
    {
      header: "Priority",
      cell: (lead) => <PrioritySelectCell lead={lead} onPriorityChange={handlePriorityChange} />
    },
    {
      header: "Assigned Rep",
      cell: (lead) => <AssignedRepSelectCell lead={lead} agentsList={agentsList} onAssignAgent={handleAssignAgent} />
    },
    {
      header: "Status",
      cell: (lead) => <StatusSelectCell lead={lead} onStatusChange={handleStatusChange} />
    },
    {
      header: "Actions",
      cell: (lead) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedLeadForEdit(lead)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-all"
            title="Edit Lead Details & Priority"
          >
            <Edit className="w-3.5 h-3.5 text-indigo-400" /> Edit
          </button>

          <button
            onClick={() => setSelectedLeadForTimeline(lead)}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-lg transition-all"
            title="View Activity Timeline & Schedule Follow-ups"
          >
            <Clock className="w-3.5 h-3.5" /> Timeline
          </button>

          {lead.status !== "Converted" ? (
            <button
              onClick={() => setSelectedLeadForConvert(lead)}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Convert
            </button>
          ) : (
            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <CheckCircle className="w-3.5 h-3.5" /> Converted
            </span>
          )}
        </div>
      )
    }
  ];

  if (!mounted) return null;

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Page Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Leads CRM Management <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
            </h1>
            <p className="text-sm text-slate-400">
              Manage inbound leads, assign representatives, edit priority & details, and execute lead conversion.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setShowScriptGeneratorModal(true)}
              className="inline-flex items-center justify-center gap-2 h-10 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all whitespace-nowrap shrink-0"
              title="Generate Embed Scripts for HTML, JavaScript, React, Angular, Vue, Webflow, WordPress"
            >
              <Code className="h-4 w-4 shrink-0 text-emerald-200" />
              <span className="whitespace-nowrap">⚡ Ingestion Script Generator</span>
            </button>
            <button
              type="button"
              onClick={() => setShowImportModal(true)}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 border border-indigo-500/30 bg-indigo-500/10 rounded-xl text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 transition whitespace-nowrap shrink-0"
            >
              <Upload className="h-4 w-4 shrink-0 text-indigo-400" />
              <span className="whitespace-nowrap">Import CSV</span>
            </button>
            <button
              type="button"
              onClick={() => downloadCSV("/leads/export", "leads_export.csv")}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 border border-slate-800 bg-slate-900/80 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition whitespace-nowrap shrink-0"
            >
              <Download className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="whitespace-nowrap">Export CSV</span>
            </button>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Add New Lead</span>
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-slate-900/60 border border-slate-800 rounded-xl backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            >
              <option value="All">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Interested">Interested</option>
              <option value="Follow-up">Follow-up</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-400">Priority:</span>
            <select
              value={priorityFilter || "All"}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-slate-400">Source:</span>
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200"
            >
              <option value="All">All Sources</option>
              <option value="Website">Website</option>
              <option value="Referral">Referral</option>
              <option value="Social Media">Social Media</option>
              <option value="Email">Email</option>
              <option value="Phone">Phone</option>
              <option value="Manual Entry">Manual Entry</option>
            </select>
          </div>
        </div>

        {/* Enterprise TanStack DataTable */}
        <DataTable
          columns={columns}
          data={leadsList}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={(p) => setPage(p)}
          searchValue={search}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          searchPlaceholder="Search leads by name, email, phone..."
          emptyMessage="No leads found matching your criteria."
        />

        {/* Edit Lead Modal */}
        {selectedLeadForEdit && (
          <EditLeadModal
            lead={selectedLeadForEdit}
            isOpen={!!selectedLeadForEdit}
            onClose={() => setSelectedLeadForEdit(null)}
            onSuccess={() => refetch()}
          />
        )}

        {/* Lead Conversion Transaction Modal */}
        {selectedLeadForConvert && (
          <ConvertLeadModal
            lead={selectedLeadForConvert}
            isOpen={!!selectedLeadForConvert}
            onClose={() => setSelectedLeadForConvert(null)}
            onSuccess={() => {
              toast.success("Transactional conversion complete! Customer and Deal created.");
              refetch();
            }}
          />
        )}

        {/* Activity Timeline & Follow-ups Modal */}
        {selectedLeadForTimeline && (
          <ActivityTimelineModal
            leadId={selectedLeadForTimeline.id}
            title={`Lead: ${selectedLeadForTimeline.name}`}
            isOpen={!!selectedLeadForTimeline}
            onClose={() => setSelectedLeadForTimeline(null)}
          />
        )}

        {/* Script Generator Modal */}
        {showScriptGeneratorModal && (
          <ScriptGeneratorModal
            isOpen={showScriptGeneratorModal}
            onClose={() => setShowScriptGeneratorModal(false)}
          />
        )}

        {/* Add Lead Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
              <h3 className="text-base font-semibold text-white">Create New Lead</h3>
              <p className="text-xs text-slate-400 mt-1">Add a new prospective lead into your workspace pipeline.</p>

              <form onSubmit={handleAddLeadSubmit} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Phone *</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="rahul@example.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Mumbai"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Source</label>
                    <select
                      value={source}
                      onChange={(e) => setSource(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                    >
                      <option value="Website">Website</option>
                      <option value="Referral">Referral</option>
                      <option value="Social Media">Social Media</option>
                      <option value="Email">Email</option>
                      <option value="Phone">Phone</option>
                      <option value="Manual Entry">Manual Entry</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Priority</label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Assign Agent</label>
                    <select
                      value={assignedToId}
                      onChange={(e) => setAssignedToId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                    >
                      <option value="">Unassigned</option>
                      {agentsList.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Service Interest</label>
                  <input
                    type="text"
                    value={serviceInterest}
                    onChange={(e) => setServiceInterest(e.target.value)}
                    placeholder="e.g. Enterprise AI Integration"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Notes</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Initial conversation notes..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                  >
                    Create Lead
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* CSV Import Modal */}
        <CSVImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          entityType="Lead"
          onSuccess={() => refetch()}
        />
      </div>
    </DashboardWrapper>
  );
}
