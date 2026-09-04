"use client";

import React, { useState, useEffect } from "react";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import axiosInstance, { ENDPOINTS } from "@/utils/api";
import { toast } from "react-toastify";
import {
  Users,
  Plus,
  UserCheck,
  Shield,
  KeyRound,
  Mail,
  Phone,
  Sparkles,
  CheckCircle2,
  XCircle,
  Loader2,
  Trash2
} from "lucide-react";

export default function AgentsManagementPage() {
  const [mounted, setMounted] = useState(false);
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields for registering Sales Manager / Sales Executive
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("sales-executive");
  const [password, setPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [address, setAddress] = useState("");

  const fetchAgents = async () => {
    setIsLoading(true);
    try {
      const res = await axiosInstance.get(ENDPOINTS.admin.agents);
      setAgents(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.error || "Failed to load team agents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchAgents();
  }, []);

  // Form errors state for validation
  const [formErrors, setFormErrors] = useState({});

  const validateAgentForm = () => {
    const errors = {};
    if (!name || !name.trim() || name.trim().length < 2) {
      errors.name = "Full Name is required (min 2 chars)";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      errors.email = "Valid email address is required";
    }
    if (!phone || !phone.trim() || phone.trim().length < 6) {
      errors.phone = "Phone number is required (min 6 digits)";
    }
    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    if (!role) {
      errors.role = "Access role is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateAgent = async (e) => {
    e.preventDefault();
    if (!validateAgentForm()) {
      toast.error("Please fill in all required user credential fields correctly.");
      return;
    }

    setIsSubmitting(true);
    try {
      await axiosInstance.post(ENDPOINTS.admin.agents, {
        name,
        email,
        phone,
        role,
        password,
        specialty,
        fatherName,
        address
      });

      toast.success(`User "${name}" registered as ${role.toUpperCase().replace("-", " ")} successfully!`);
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setSpecialty("");
      setFatherName("");
      setAddress("");
      setFormErrors({});
      setShowAddModal(false);
      fetchAgents();
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to register user credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await axiosInstance.patch(ENDPOINTS.admin.agentActive(id));
      toast.success("User access status updated");
      fetchAgents();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  const handleDeleteAgent = async (id, agentName) => {
    if (!confirm(`Are you sure you want to revoke and delete ${agentName}?`)) return;
    try {
      await axiosInstance.delete(ENDPOINTS.admin.agentDelete(id));
      toast.success(`Access for ${agentName} revoked`);
      fetchAgents();
    } catch (err) {
      toast.error("Failed to delete user account");
    }
  };

  if (!mounted) return null;

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Team & Role Credential Management <Sparkles className="h-5 w-5 text-indigo-400" />
            </h1>
            <p className="text-sm text-slate-400">
              Register credentials for Sales Managers and Sales Executives with full personal & professional details to allow login and route assignments.
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" /> Register New Role Account
          </button>
        </div>

        {/* Team Members List */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-2xl backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" /> Registered System Users ({agents.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading team credentials...
            </div>
          ) : agents.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-800 rounded-xl">
              No Sales Managers or Sales Executives registered yet. Click <strong>"Register New Role Account"</strong> above.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-3">User & Contact</th>
                    <th className="py-3 px-3">Role</th>
                    <th className="py-3 px-3">Department & Info</th>
                    <th className="py-3 px-3">Assigned Leads</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200 font-medium">
                  {agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-slate-800/30 transition">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs uppercase border border-indigo-500/30">
                            {agent.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-100">{agent.name}</p>
                            <p className="text-[10px] text-slate-400">{agent.email} • {agent.phone}</p>
                            {agent.fatherName && <p className="text-[9px] text-slate-500">Guardian: {agent.fatherName}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                          agent.role === "sales-manager"
                            ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                            : agent.role === "sales-executive"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                        }`}>
                          {agent.role ? agent.role.replace("-", " ") : "Sales Executive"}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-slate-300 font-semibold">{agent.specialty}</p>
                        {agent.address && <p className="text-[9px] text-slate-500 truncate max-w-[150px]">{agent.address}</p>}
                      </td>
                      <td className="py-3 px-3 font-bold text-amber-400">{agent.leadsCount} leads</td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleToggleActive(agent.id)}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                            agent.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          }`}
                        >
                          {agent.isActive ? "Active (Login Allowed)" : "Disabled"}
                        </button>
                      </td>
                      <td className="py-3 px-3">
                        <button
                          onClick={() => handleDeleteAgent(agent.id, agent.name)}
                          className="p-1.5 hover:bg-rose-500/10 text-rose-400 rounded-lg transition"
                          title="Revoke Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Register Account Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-400" /> Register User Credentials
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-bold">
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateAgent} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold flex items-center justify-between">
                      <span>Full Name <span className="text-rose-400">*</span></span>
                      {formErrors.name && <span className="text-[11px] font-medium text-rose-400">⚠️ {formErrors.name}</span>}
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (formErrors.name) setFormErrors((prev) => ({ ...prev, name: undefined }));
                      }}
                      placeholder="e.g. Vikram Sen"
                      className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-slate-100 transition-all focus:outline-none ${
                        formErrors.name
                          ? "border-rose-500/60 text-rose-200 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10"
                          : "border-slate-800 focus:ring-2 focus:ring-indigo-500/50"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold">Father / Guardian Name</label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={(e) => setFatherName(e.target.value)}
                      placeholder="e.g. Rajesh Sen"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold flex items-center justify-between">
                      <span>Email Address (Login ID) <span className="text-rose-400">*</span></span>
                      {formErrors.email && <span className="text-[11px] font-medium text-rose-400">⚠️ {formErrors.email}</span>}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (formErrors.email) setFormErrors((prev) => ({ ...prev, email: undefined }));
                      }}
                      placeholder="vikram@infotattva.com"
                      className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-slate-100 transition-all focus:outline-none ${
                        formErrors.email
                          ? "border-rose-500/60 text-rose-200 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10"
                          : "border-slate-800 focus:ring-2 focus:ring-indigo-500/50"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold flex items-center justify-between">
                      <span>Phone Number <span className="text-rose-400">*</span></span>
                      {formErrors.phone && <span className="text-[11px] font-medium text-rose-400">⚠️ {formErrors.phone}</span>}
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: undefined }));
                      }}
                      placeholder="+91 94380 88888"
                      className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-slate-100 transition-all focus:outline-none ${
                        formErrors.phone
                          ? "border-rose-500/60 text-rose-200 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10"
                          : "border-slate-800 focus:ring-2 focus:ring-indigo-500/50"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold flex items-center justify-between">
                      <span>Access Role <span className="text-rose-400">*</span></span>
                      {formErrors.role && <span className="text-[11px] font-medium text-rose-400">⚠️ {formErrors.role}</span>}
                    </label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-slate-100 font-bold transition-all focus:outline-none ${
                        formErrors.role
                          ? "border-rose-500/60 text-rose-200 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10"
                          : "border-slate-800 focus:ring-2 focus:ring-indigo-500/50"
                      }`}
                    >
                      <option value="sales-manager">👔 Sales Manager</option>
                      <option value="sales-executive">💼 Sales Executive</option>
                      <option value="team">👥 Team Member</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-semibold flex items-center justify-between">
                      <span>Initial Password <span className="text-rose-400">*</span></span>
                      {formErrors.password && <span className="text-[11px] font-medium text-rose-400">⚠️ {formErrors.password}</span>}
                    </label>
                    <input
                      type="text"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: undefined }));
                      }}
                      placeholder="securepassword"
                      className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm text-slate-100 font-mono transition-all focus:outline-none ${
                        formErrors.password
                          ? "border-rose-500/60 text-rose-200 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10"
                          : "border-slate-800 focus:ring-2 focus:ring-indigo-500/50"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Specialty / Department</label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. High-Ticket Enterprise Real Estate"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-semibold">Residential / Office Address</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Plot 45, DLF Cybercity, Patia, Bhubaneswar, Odisha"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                  >
                    {isSubmitting ? "Registering..." : "Register User Credentials"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
}
