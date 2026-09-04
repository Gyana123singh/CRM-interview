"use client";

import React, { useState } from "react";
import {
  useGetActivitiesQuery,
  useCreateActivityMutation,
  useUpdateActivityStatusMutation
} from "@/store/api/activitiesApi";
import {
  X,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Sparkles,
  MessageSquare
} from "lucide-react";
import { toast } from "react-toastify";

export function ActivityTimelineModal({ leadId, dealId, customerId, title, isOpen, onClose }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activityType, setActivityType] = useState("Call");
  const [actTitle, setActTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  const { data, isLoading } = useGetActivitiesQuery(
    { leadId, dealId, customerId },
    { skip: !isOpen }
  );
  const [createActivity, { isLoading: isCreating }] = useCreateActivityMutation();
  const [updateStatus] = useUpdateActivityStatusMutation();

  const activities = data?.data?.items || [];

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      toast.error("Description is required");
      return;
    }

    try {
      await createActivity({
        leadId,
        dealId,
        customerId,
        activityType,
        title: actTitle.trim() || `${activityType} Follow-up`,
        description: description.trim(),
        dueDate: dueDate ? new Date(dueDate).toISOString() : undefined
      }).unwrap();

      toast.success(`${activityType} activity scheduled successfully!`);
      setActTitle("");
      setDescription("");
      setDueDate("");
      setShowAddForm(false);
    } catch (err) {
      toast.error(err?.data?.error?.message || "Failed to schedule activity");
    }
  };

  const handleToggleStatus = async (actId, currentStatus) => {
    const nextStatus = currentStatus === "Completed" ? "Pending" : "Completed";
    try {
      await updateStatus({ id: actId, status: nextStatus }).unwrap();
      toast.success(`Activity marked as ${nextStatus}`);
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Timeline & Follow-ups <Sparkles className="w-4 h-4 text-indigo-400" />
            </h3>
            <p className="text-xs text-slate-400">{title || "Sales Activity Log"}</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Schedule Action Bar */}
        <div className="py-3 border-b border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Activities ({activities.length})
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow transition"
          >
            <Plus className="w-3.5 h-3.5" /> {showAddForm ? "Cancel" : "Schedule Activity"}
          </button>
        </div>

        {/* Inline Schedule Form */}
        {showAddForm && (
          <form onSubmit={handleCreateSubmit} className="p-4 bg-slate-950/70 border border-indigo-500/20 rounded-xl my-3 space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Type</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                >
                  <option value="Call">Call</option>
                  <option value="Email">Email</option>
                  <option value="Meeting">Meeting</option>
                  <option value="Demo">Demo</option>
                  <option value="Reminder">Reminder</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-medium mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Title / Subject</label>
              <input
                type="text"
                placeholder="e.g. Call to discuss proposal details"
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Description / Notes *</label>
              <textarea
                required
                rows={2}
                placeholder="Key action items or meeting notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-200"
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="submit"
                disabled={isCreating}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg"
              >
                Save Activity
              </button>
            </div>
          </form>
        )}

        {/* Timeline Log Feed */}
        <div className="flex-1 overflow-y-auto py-3 space-y-3">
          {isLoading ? (
            <p className="text-center py-6 text-xs text-slate-500">Loading timeline history...</p>
          ) : activities.length === 0 ? (
            <p className="text-center py-6 text-xs text-slate-500">No activity logs recorded yet.</p>
          ) : (
            activities.map((act) => (
              <div
                key={act.id}
                className={`p-3 rounded-xl border transition flex items-start justify-between gap-3 text-xs ${
                  act.status === "Completed"
                    ? "bg-slate-950/40 border-slate-800/60 opacity-75"
                    : act.status === "Overdue"
                    ? "bg-rose-500/5 border-rose-500/20"
                    : "bg-slate-900/90 border-slate-800"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      act.status === "Completed"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : act.status === "Overdue"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                    }`}>
                      {act.activityType || act.type}
                    </span>
                    <span className="font-bold text-slate-100">{act.title || act.description}</span>
                  </div>

                  <p className="text-slate-300 font-medium leading-relaxed">{act.description}</p>

                  <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                    <span>By: {act.user?.name || "System"}</span>
                    {act.dueDate && <span>Due: {new Date(act.dueDate).toLocaleDateString()}</span>}
                  </div>
                </div>

                {act.type === "FOLLOW_UP" && (
                  <button
                    onClick={() => handleToggleStatus(act.id, act.status)}
                    className={`p-1.5 rounded-lg border transition ${
                      act.status === "Completed"
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                        : "bg-slate-800 text-slate-400 hover:text-white"
                    }`}
                    title="Toggle Completed"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
