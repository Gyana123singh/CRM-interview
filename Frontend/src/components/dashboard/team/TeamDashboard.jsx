"use client";

import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateLeadStatus, updateLeadNotes } from "@/store";
import Link from "next/link";
import {
  Clock,
  Phone,
  AlertCircle,
  Sparkles,
  MessageSquare,
  CheckSquare,
  Plus,
  Trash2,
  CheckCircle2,
  ChevronDown,
  User,
  Activity,
  UserCheck,
  Send,
  Calendar,
  X,
  FileText
} from "lucide-react";
import { toast } from "react-toastify";

export default function TeamDashboard() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const leads = useSelector((state) => state.leads.leads);
  const threads = useSelector((state) => state.chat.threads);

  // 1. Availability Status State
  const [agentStatus, setAgentStatus] = useState("online");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // 2. Checklist State (Dynamic)
  const [checklist, setChecklist] = useState([
    { id: "1", task: "Call Sunita Rao regarding clinic bot setup", done: false },
    { id: "2", task: "Send flat catalog options to Rahul Mohanty", done: true },
    { id: "3", task: "Set up scheduling time for tomorrow's demos", done: false },
    { id: "4", task: "Follow up on conversion payment files", done: false },
  ]);
  const [newTaskInput, setNewTaskInput] = useState("");

  // 3. Notes Edit State
  const [editingNotesLeadId, setEditingNotesLeadId] = useState(null);
  const [notesTempText, setNotesTempText] = useState("");

  // Dynamic Filtering based on current user context
  const myAssignedLeads = leads.filter((l) => {
    if (!user) return false;
    const userNameLower = user.name.toLowerCase();
    const assignedLower = l.assignedTo.toLowerCase();
    return (
      assignedLower === userNameLower ||
      (userNameLower.includes("amit") && assignedLower.includes("amit")) ||
      (userNameLower.includes("pradeep") && assignedLower.includes("pradeep")) ||
      l.id === "lead_02" // default assignment fallback
    );
  });

  const pendingReminders = myAssignedLeads.filter(
    (l) => l.status === "Follow-up" || l.status === "New"
  );

  // Calculate stats
  const totalLeads = myAssignedLeads.length;
  const convertedLeads = myAssignedLeads.filter((l) => l.status === "Converted").length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
  const checklistCompleted = checklist.filter((item) => item.done).length;
  const checklistTotal = checklist.length;
  const checklistProgress = checklistTotal > 0 ? Math.round((checklistCompleted / checklistTotal) * 100) : 0;

  // Active Chats from threads that belong to assigned leads
  const myLeadIds = myAssignedLeads.map((l) => l.id);
  const activeChats = threads.filter((t) => myLeadIds.includes(t.leadId) || t.leadId === "lead_01");

  // Dynamic notifications list from message threads
  const recentMessages = threads
    .flatMap((t) =>
      t.messages.map((m) => ({
        leadId: t.leadId,
        leadName: t.leadName,
        phone: t.phone,
        message: m,
      }))
    )
    .sort((a, b) => new Date(b.message.timestamp).getTime() - new Date(a.message.timestamp).getTime())
    .slice(0, 4);

  // Availability setup helper
  const statusConfig = {
    online: { label: "Online (Active Routing)", color: "bg-emerald-500", text: "text-emerald-500", bgLight: "bg-emerald-50 dark:bg-emerald-950/20", border: "border-emerald-200 dark:border-emerald-900/40" },
    busy: { label: "Busy (In Call)", color: "bg-amber-500", text: "text-amber-500", bgLight: "bg-amber-50 dark:bg-amber-950/20", border: "border-amber-200 dark:border-amber-900/40" },
    offline: { label: "Offline (Routing Paused)", color: "bg-rose-500", text: "text-rose-500", bgLight: "bg-rose-50 dark:bg-rose-950/20", border: "border-rose-200 dark:border-rose-900/40" },
  };

  // 4. Checklist Handlers
  const handleToggleChecklist = (id) => {
    setChecklist(
      checklist.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const handleAddChecklistItem = (e) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const newItem = {
      id: Date.now().toString(),
      task: newTaskInput.trim(),
      done: false,
    };
    setChecklist([...checklist, newItem]);
    setNewTaskInput("");
  };

  const handleDeleteChecklistItem = (id) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  // 5. Notes Editor Handlers
  const openNotesEditor = (leadId, currentNotes = "") => {
    setEditingNotesLeadId(leadId);
    setNotesTempText(currentNotes);
  };

  const saveNotes = () => {
    if (editingNotesLeadId) {
      dispatch(updateLeadNotes({ id: editingNotesLeadId, notes: notesTempText }));
      setEditingNotesLeadId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 select-none">

      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 p-6 rounded-3xl border border-indigo-950 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 bg-indigo-500/10 rounded-full filter blur-2xl animate-pulse" />

        <div className="space-y-2.5 z-10">
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-[10px] font-black uppercase tracking-wider">
              Sales Desk Workspace
            </div>
            {/* Live Indicator */}
            <span className="flex h-2 w-2 relative">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${statusConfig[agentStatus].color}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${statusConfig[agentStatus].color}`}></span>
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
            Welcome Back, {user?.name || "Agent"}! <Sparkles className="h-5 w-5 text-indigo-400" />
          </h1>
          <p className="text-xs text-indigo-200">
            You have <strong className="text-white font-bold">{pendingReminders.length} leads</strong> requiring contact or follow-up calls today.
          </p>
        </div>

        {/* Availability Switcher & Actions */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          {/* Custom Status Dropdown Switcher */}
          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition ${statusConfig[agentStatus].bgLight} ${statusConfig[agentStatus].border} ${statusConfig[agentStatus].text}`}
            >
              <Activity className="h-4 w-4" />
              <span>Status: {agentStatus.toUpperCase()}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </button>

            {isStatusDropdownOpen && (
              <>
                <div className="fixed inset-0 z-20" onClick={() => setIsStatusDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-2xl p-2.5 shadow-2xl z-35 space-y-1.5 text-xs text-slate-200">
                  <p className="px-2 py-1 text-[9px] uppercase font-black tracking-wider text-slate-500 border-b border-slate-800">
                    Set Live Routing Status
                  </p>
                  {["online", "busy", "offline"].map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setAgentStatus(status);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-xl font-bold transition hover:bg-slate-800 text-left ${agentStatus === status ? "bg-slate-800 text-white" : "text-slate-400"
                        }`}
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${statusConfig[status].color}`} />
                      <span className="capitalize">{status}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <Link
            href="/team/conversations"
            className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-purple-600/20"
          >
            Open Live WhatsApp Chat <MessageSquare className="h-4 w-4 animate-pulse" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Panel */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Total Assigned */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 pb-5.5 rounded-2xl shadow-xs hover:border-orange-500/30 dark:hover:border-orange-500/20 transition-all flex flex-col justify-between min-h-28">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-orange-500/10 border border-orange-500/20 text-orange-500 shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-slate-450 dark:text-slate-500 tracking-wider">ASSIGNED LEADS</span>
              <span className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 leading-none mt-1">{totalLeads}</span>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800/60 my-2.5" />
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="text-orange-500 font-extrabold">~</span> Active Cards
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/60 dark:bg-slate-800/40">
            <div className="h-full bg-orange-500 rounded-r-full transition-all duration-500" style={{ width: `${Math.min(totalLeads * 15, 100)}%` }} />
          </div>
        </div>

        {/* Pending Follow-ups */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 pb-5.5 rounded-2xl shadow-xs hover:border-teal-500/30 dark:hover:border-teal-500/20 transition-all flex flex-col justify-between min-h-28">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-teal-500/10 border border-teal-500/20 text-teal-500 shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-slate-450 dark:text-slate-500 tracking-wider">FOLLOW-UP ALERTS</span>
              <span className="text-2xl md:text-3xl font-black text-teal-500 leading-none mt-1">{pendingReminders.length}</span>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800/60 my-2.5" />
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="text-teal-500 font-extrabold">~</span> Due Today
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/60 dark:bg-slate-800/40">
            <div className="h-full bg-teal-500 rounded-r-full transition-all duration-500" style={{ width: `${totalLeads > 0 ? (pendingReminders.length / totalLeads) * 100 : 0}%` }} />
          </div>
        </div>

        {/* Chats Count */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 pb-5.5 rounded-2xl shadow-xs hover:border-rose-500/30 dark:hover:border-rose-500/20 transition-all flex flex-col justify-between min-h-28">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-rose-500/10 border border-rose-500/20 text-rose-500 shrink-0">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-slate-450 dark:text-slate-500 tracking-wider">ACTIVE INBOUND CHATS</span>
              <span className="text-2xl md:text-3xl font-black text-rose-500 leading-none mt-1">{activeChats.length}</span>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800/60 my-2.5" />
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="text-rose-500 font-extrabold">~</span> WhatsApp Threads
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/60 dark:bg-slate-800/40">
            <div className="h-full bg-rose-500 rounded-r-full transition-all duration-500" style={{ width: `${Math.min(activeChats.length * 30, 100)}%` }} />
          </div>
        </div>

        {/* Checklist Progress */}
        <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 pb-5.5 rounded-2xl shadow-xs hover:border-purple-400 dark:hover:border-purple-500/20 transition-all flex flex-col justify-between min-h-28">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-purple-500/10 border border-purple-500/20 text-purple-500 shrink-0">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-slate-450 dark:text-slate-500 tracking-wider">CHECKLIST PROGRESS</span>
              <span className="text-2xl md:text-3xl font-black text-purple-500 leading-none mt-1">{checklistProgress}%</span>
            </div>
          </div>
          <div className="border-t border-slate-100 dark:border-slate-800/60 my-2.5" />
          <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <span className="text-purple-500 font-extrabold">~</span> {checklistCompleted}/{checklistTotal} Tasks
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100/60 dark:bg-slate-800/40">
            <div className="h-full bg-purple-500 rounded-r-full transition-all duration-500" style={{ width: `${checklistProgress}%` }} />
          </div>
        </div>

      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Columns (Active Leads Roster & Notification Stream) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Leads Roster */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide flex items-center gap-2">
                <UserCheck className="h-4.5 w-4.5 text-indigo-500" /> Active Lead Desk
              </h3>
              <span className="text-[10px] text-slate-450 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800/60 px-2 py-0.5 rounded-md">
                {myAssignedLeads.length} Cards Assigned
              </span>
            </div>

            <div className="space-y-3.5">
              {myAssignedLeads.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 font-semibold bg-slate-50 dark:bg-slate-950/20 rounded-2xl">
                  No active CRM leads currently routed to you.
                </div>
              ) : (
                myAssignedLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="p-4 border border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-950/10 hover:bg-slate-50/50 dark:hover:bg-slate-950/30 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs transition border-l-3 border-l-indigo-500"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-none">
                          {lead.name}
                        </span>

                        {/* Dynamic Inline Status Selector Dropdown */}
                        <div className="relative inline-block text-left">
                          <select
                            value={lead.status}
                            onChange={(e) =>
                              dispatch(
                                updateLeadStatus({
                                  id: lead.id,
                                  status: e.target.value,
                                })
                              )
                            }
                            className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 cursor-pointer focus:ring-1 focus:ring-indigo-500 outline-none ${lead.status === "New"
                                ? "text-blue-500"
                                : lead.status === "Contacted"
                                  ? "text-cyan-500"
                                  : lead.status === "Interested"
                                    ? "text-purple-500"
                                    : lead.status === "Follow-up"
                                      ? "text-amber-500"
                                      : lead.status === "Converted"
                                        ? "text-emerald-500"
                                        : "text-rose-500"
                              }`}
                          >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Interested">Interested</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Converted">Converted</option>
                            <option value="Lost">Lost</option>
                            <option value="Not Reachable">Not Reachable</option>
                          </select>
                        </div>
                      </div>

                      <p className="text-slate-650 dark:text-slate-350 font-bold">{lead.serviceInterest}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        {lead.phone} • {lead.location}
                      </p>

                      {/* Display / Toggle Notes inline */}
                      {lead.notes ? (
                        <div className="mt-2 text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-500/5 dark:bg-indigo-950/20 px-2.5 py-1.5 rounded-lg border border-indigo-500/10 font-medium relative">
                          <span className="font-extrabold block text-[8px] uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Agent Notes
                          </span>
                          {lead.notes}
                          <button
                            onClick={() => openNotesEditor(lead.id, lead.notes)}
                            className="absolute right-2 top-2 text-[9px] text-indigo-500 hover:text-indigo-400 font-bold"
                          >
                            Edit
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => openNotesEditor(lead.id, "")}
                          className="mt-1 flex items-center gap-1 text-[9px] text-slate-450 hover:text-indigo-500 font-bold transition"
                        >
                          <Plus className="h-3 w-3" /> Add Agent Follow-up Notes
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
                      <Link
                        href={`/team/conversations?leadId=${lead.id}`}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-950/60 font-bold tracking-wide transition"
                        title="Open WhatsApp Thread"
                      >
                        <MessageSquare className="h-3.5 w-3.5" /> Chat
                      </Link>
                      <a
                        href={`tel:${lead.phone}`}
                        className="p-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-450 border border-emerald-100 dark:border-emerald-950/60 transition"
                        title="Initiate Call Link"
                      >
                        <Phone className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Notes Popup modal */}
          {editingNotesLeadId && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-40">
              <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
                  <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-100 tracking-wide flex items-center gap-1.5">
                    <FileText className="h-4.5 w-4.5 text-indigo-500" /> Update Lead Notes
                  </h3>
                  <button onClick={() => setEditingNotesLeadId(null)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <X className="h-4 w-4 text-slate-400" />
                  </button>
                </div>

                <div className="space-y-1 text-xs">
                  <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wide">
                    Agent Log notes (Status updates, booking details, call responses)
                  </label>
                  <textarea
                    rows={4}
                    value={notesTempText}
                    onChange={(e) => setNotesTempText(e.target.value)}
                    placeholder="Enter details here..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>

                <div className="flex gap-2.5 justify-end text-xs">
                  <button
                    onClick={() => setEditingNotesLeadId(null)}
                    className="px-4 py-2 border rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNotes}
                    className="px-4 py-2 bg-gradient-to-r from-primary to-gray-500 text-white rounded-xl font-bold shadow-md shadow-primary/20 hover:scale-102 transition"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Activity Stream notification stream */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide flex items-center gap-1.5">
              <Activity className="h-4.5 w-4.5 text-indigo-500" /> Recent Conversation Feed
            </h3>

            <div className="space-y-3">
              {recentMessages.map((msg, idx) => (
                <Link
                  key={idx}
                  href={`/team/conversations?leadId=${msg.leadId}`}
                  className="p-3 border border-slate-100 dark:border-slate-850 hover:border-indigo-200 dark:hover:border-indigo-900 rounded-2xl flex items-start justify-between gap-3 text-xs transition hover:bg-slate-50/50 dark:hover:bg-slate-950/20 group cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{msg.leadName}</span>
                      <span className="px-1.5 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold text-[8px] uppercase">
                        {msg.message.channel}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 truncate max-w-sm font-semibold">
                      {msg.message.sender === "customer" ? "Lead: " : "You: "}
                      {msg.message.text}
                    </p>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">
                    {new Date(msg.message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (Cheklists & Calendar Bookings) */}
        <div className="space-y-6">

          {/* Checklist Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
              <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide flex items-center gap-1.5">
                Checklist Tasks <CheckSquare className="h-4.5 w-4.5 text-indigo-500" />
              </h3>
              <span className="text-[10px] text-emerald-500 font-extrabold bg-emerald-500/5 px-2 py-0.5 rounded-full">
                {checklistCompleted}/{checklistTotal} Done
              </span>
            </div>

            {/* Tasks list */}
            <div className="space-y-3.5">
              {checklist.length === 0 ? (
                <p className="text-center text-[10px] text-slate-400 py-4 font-semibold">
                  You have completed all task checklists!
                </p>
              ) : (
                checklist.map((item) => (
                  <div key={item.id} className="flex gap-2.5 items-center text-xs justify-between group">
                    <div className="flex gap-2.5 items-start">
                      <input
                        type="checkbox"
                        checked={item.done}
                        onChange={() => handleToggleChecklist(item.id)}
                        className="mt-0.5 rounded border-slate-350 dark:border-slate-800 text-indigo-650 focus:ring-indigo-500 cursor-pointer h-4 w-4 bg-slate-50 dark:bg-slate-950"
                      />
                      <span
                        className={`text-slate-650 dark:text-slate-300 font-semibold leading-tight break-all ${item.done ? "line-through text-slate-400 dark:text-slate-550" : ""
                          }`}
                      >
                        {item.task}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteChecklistItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Add task form */}
            <form onSubmit={handleAddChecklistItem} className="flex items-center gap-2 pt-2 text-xs">
              <input
                type="text"
                placeholder="Add checklist item..."
                value={newTaskInput}
                onChange={(e) => setNewTaskInput(e.target.value)}
                className="flex-1 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/20 outline-none placeholder:text-slate-450"
              />
              <button
                type="submit"
                className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition shadow-md shadow-indigo-600/10"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>
          </div>



          {/* Quick Info Box */}
          <div className="bg-slate-900 border border-slate-800 text-slate-300 p-5 rounded-3xl space-y-2.5 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 h-24 w-24 bg-indigo-500/5 rounded-full filter blur-xl" />
            <div className="h-8 w-8 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400 shrink-0">
              <AlertCircle className="h-4.5 w-4.5" />
            </div>
            <h4 className="text-xs font-black uppercase text-white tracking-wider">
              Auto-Routing Reminder
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal font-medium">
              Lead assignments depend directly on your availability status. Setting status to <strong>ONLINE</strong> registers your seat in the round-robin routing loop.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
