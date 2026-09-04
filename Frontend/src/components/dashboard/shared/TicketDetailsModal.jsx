import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addTicketMessage, updateTicketStatus, updateTicketPriority, assignTicket } from "@/store";
import { X, Send, AlertCircle, Clock, CheckCircle2, User, Building2, Tag, ShieldCheck } from "lucide-react";

export default function TicketDetailsModal({ ticketId, onClose }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const activeRole = useSelector((state) => state.auth.activeRole);
  const ticket = useSelector((state) =>
    state.tickets.tickets.find((t) => t.id === ticketId)
  );

  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  if (!ticket) return null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !user) return;

    dispatch(
      addTicketMessage({
        ticketId: ticket.id,
        senderName: user.name,
        senderRole: activeRole,
        text: replyText.trim(),
      })
    );
    setReplyText("");
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case "Critical":
        return "bg-rose-500/10 text-rose-500 border-rose-500/30 dark:bg-rose-950/20";
      case "High":
        return "bg-amber-500/10 text-amber-500 border-amber-500/30 dark:bg-amber-950/20";
      case "Medium":
        return "bg-indigo-500/10 text-indigo-500 border-indigo-500/30 dark:bg-indigo-950/20";
      case "Low":
        return "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700";
      default:
        return "";
    }
  };

  const getStatusColor = (s) => {
    switch (s) {
      case "Open":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "In Progress":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      case "Resolved":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "Closed":
        return "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="w-full max-w-4xl bg-white dark:bg-[#0b101d] border border-slate-200 dark:border-slate-800/80 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[90vh] md:h-[650px]">
        
        {/* Left Side: Ticket Metadata Details */}
        <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between shrink-0 bg-slate-50/50 dark:bg-slate-900/10">
          <div className="space-y-5">
            {/* Ticket Header Metadata */}
            <div className="space-y-2">
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-450 dark:text-slate-500">
                Ticket Details
              </span>
              <h2 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                {ticket.title}
              </h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold">
                ID: {ticket.id} • Created {new Date(ticket.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Badges Stack */}
            <div className="flex flex-wrap gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority} Priority
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase border ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-350 border border-slate-200 dark:border-slate-700/60">
                {ticket.category}
              </span>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4.5 space-y-3.5 text-xs">
              {/* Creator details */}
              <div className="flex gap-2 items-center">
                <Building2 className="h-4 w-4 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-bold text-slate-400">Company</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200 truncate max-w-48">
                    {ticket.companyName}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <User className="h-4 w-4 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-bold text-slate-400">Raised By</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                    {ticket.createdBy} <span className="text-[9px] capitalize text-slate-400 font-bold">({ticket.creatorRole})</span>
                  </span>
                </div>
              </div>

              <div className="flex gap-2 items-center">
                <ShieldCheck className="h-4 w-4 text-slate-400" />
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-bold text-slate-400">Assigned Agent</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                    {ticket.assignedTo || "Unassigned"}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions (Role specific managers) */}
            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
              <span className="text-[9px] uppercase font-black tracking-wider text-slate-450 dark:text-slate-500 block">
                Manage Ticket Settings
              </span>
              
              {/* Status Update Dropdown (Any role with restrictions) */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-slate-400">Status</label>
                <select
                  value={ticket.status}
                  onChange={(e) => dispatch(updateTicketStatus({ id: ticket.id, status: e.target.value }))}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Priority Update & Assignment dropdown (Only visible to admin) */}
              {(activeRole === "admin" || activeRole === "sales-manager") && (
                <>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400">Priority</label>
                    <select
                      value={ticket.priority}
                      onChange={(e) => dispatch(updateTicketPriority({ id: ticket.id, priority: e.target.value }))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  {(activeRole === "admin" || activeRole === "sales-manager") && (
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-slate-400">Assign Operations Group</label>
                      <select
                        value={ticket.assignedTo || "Unassigned"}
                        onChange={(e) => dispatch(assignTicket({ id: ticket.id, assignedTo: e.target.value }))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="Unassigned">Unassigned</option>
                        <option value="System Engineer">System Engineer</option>
                        <option value="Support Agent">Support Agent</option>
                        <option value="Billing Desk">Billing Desk</option>
                        <option value="Product Team">Product Team</option>
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl text-xs font-bold transition text-slate-600 dark:text-slate-300 mt-4 md:mt-0"
          >
            Close Overview Panel
          </button>
        </div>

        {/* Right Side: Message Thread / Chat View */}
        <div className="flex-1 flex flex-col justify-between h-full bg-slate-50/20 dark:bg-slate-950/20 relative">
          
          {/* Thread Header */}
          <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white dark:bg-[#0b101d]">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white tracking-wider">
                Support Comm Chat
              </h3>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition">
              <X className="h-4 w-4 text-slate-400" />
            </button>
          </div>

          {/* Messages List */}
          <div className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[300px] md:max-h-none select-text">
            {/* Core Ticket Description (First Bubble) */}
            <div className="flex gap-3 items-start max-w-[85%]">
              <div className="h-7 w-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-500 capitalize">
                {ticket.createdBy.charAt(0)}
              </div>
              <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl rounded-tl-none">
                <p className="text-xs font-bold text-slate-450 dark:text-slate-500 mb-1 flex items-center gap-1">
                  <span>{ticket.createdBy}</span>
                  <span className="text-[8px] uppercase tracking-wide px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 font-extrabold text-slate-500">
                    {ticket.creatorRole}
                  </span>
                </p>
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
                  {ticket.description}
                </p>
                <span className="text-[8px] text-slate-400 font-medium mt-1.5 block">
                  {new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            {/* Replies Thread */}
            {ticket.messages.map((msg) => {
              const isMe = user && msg.senderName === user.name;
              return (
                <div key={msg.id} className={`flex gap-3 items-start max-w-[85%] ${isMe ? "ml-auto flex-row-reverse" : ""}`}>
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-[10px] uppercase text-white shadow-sm shrink-0 ${
                    isMe ? "bg-gradient-to-tr from-primary to-gray-500" : "bg-slate-350 dark:bg-slate-800"
                  }`}>
                    {msg.senderName.charAt(0)}
                  </div>
                  
                  <div className={`p-3 rounded-2xl ${
                    isMe
                      ? "bg-indigo-650 text-white rounded-tr-none border border-indigo-600/30"
                      : "bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200 dark:border-slate-800"
                  }`}>
                    <p className={`text-xs font-bold mb-1 flex items-center gap-1 ${isMe ? "text-indigo-200" : "text-slate-450 dark:text-slate-500"}`}>
                      <span>{msg.senderName}</span>
                      <span className={`text-[8px] uppercase tracking-wide px-1.5 py-0.2 rounded font-extrabold ${
                        isMe ? "bg-indigo-700 text-indigo-200" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                      }`}>
                        {msg.senderRole}
                      </span>
                    </p>
                    <p className="text-xs leading-relaxed">
                      {msg.text}
                    </p>
                    <span className={`text-[8px] font-medium mt-1.5 block ${isMe ? "text-indigo-300" : "text-slate-400"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Reply Form */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-200 dark:border-slate-800 flex gap-2.5 items-center bg-white dark:bg-[#0b101d] shrink-0">
            <input
              type="text"
              placeholder="Type your support update/response..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-950 dark:text-slate-50 focus:ring-2 focus:ring-indigo-500/20 outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!replyText.trim()}
              className="p-3.5 bg-gradient-to-r from-primary to-gray-500 text-white rounded-xl font-bold hover:scale-102 hover:shadow-lg transition disabled:opacity-40 disabled:hover:scale-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
        
      </div>
    </div>
  );
}
