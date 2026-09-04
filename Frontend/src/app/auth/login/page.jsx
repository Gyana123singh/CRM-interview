"use client";

import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { setUser } from "@/store";
import { Bot, KeyRound, Mail, Sparkles, Shield, User } from "lucide-react";
import Link from "next/link";
import axiosInstance, { ENDPOINTS } from "@/utils/api";
import { toast } from "react-toastify";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("admin");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axiosInstance.post(ENDPOINTS.auth.login, {
        email,
        password,
      });

      const data = response.data;

      // Save token and user in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("crm_token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // Dispatch user to Redux
      dispatch(setUser(data.user));
      
      toast.success(`Welcome back, ${data.user.name}!`);
      router.push("/");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || err.message || "An unexpected error occurred during sign in.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Background Mesh Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full filter blur-3xl" />

      {/* Main Glassmorphic Card Container */}
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-2xl space-y-6 z-10">

        {/* Brand Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-gray-500 flex items-center justify-center shadow-lg shadow-purple-600/20">
            <Bot className="h-6 w-6 text-white animate-pulse" />
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent uppercase tracking-wider">
            Infotattva AI CRM
          </h1>
          <p className="text-xs text-slate-400">
            Automate customer acquisition and WhatsApp workflows.
          </p>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} suppressHydrationWarning className="space-y-4 text-xs">

          {/* Email */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wide flex items-center gap-1">
              <Mail className="h-3.5 w-3.5 text-primary" /> Email Address
            </label>
            <input
              type="email"
              required
              suppressHydrationWarning
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wide flex items-center gap-1">
                <KeyRound className="h-3.5 w-3.5 text-primary" /> Security Password
              </label>
              <Link href="/auth/forgot-password" className="text-[10px] text-purple-400 hover:text-purple-300 font-bold transition">
                Forgot?
              </Link>
            </div>
            <input
              type="password"
              required
              suppressHydrationWarning
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-200 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
            />
          </div>

          {/* Sandbox Role Switcher Selector */}
          <div className="space-y-2 pt-1">
            <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wide flex items-center gap-1">
              <Shield className="h-3.5 w-3.5 text-teal-400" /> Active Role Selector Sandbox
            </label>

            <div className="grid grid-cols-3 gap-2">
              {[
                { role: "admin", label: "Admin", color: "hover:border-indigo-500/50" },
                { role: "sales-manager", label: "Sales Mgr", color: "hover:border-blue-500/50" },
                { role: "sales-executive", label: "Sales Exec", color: "hover:border-emerald-500/50" }
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => handleRoleSelect(item.role)}
                  className={`py-2 rounded-xl border text-[10px] font-bold uppercase transition flex flex-col items-center justify-center gap-1 ${
                    selectedRole === item.role
                      ? "border-primary bg-primary/10 text-slate-100 shadow"
                      : `border-slate-800 bg-slate-950/50 text-slate-400 ${item.color}`
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] text-slate-400 font-medium">
              💡 <strong>Admin Generated Accounts</strong>: Sales Managers & Sales Executives log in using the Email & Password created for them by the Admin.
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            suppressHydrationWarning
            className="w-full py-3 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 transition disabled:opacity-50 uppercase tracking-widest flex items-center justify-center gap-1.5 mt-2"
          >
            {isLoading ? (
              <>
                <div className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Initialize Session <Sparkles className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center pt-2 text-[10px] text-slate-500">
          <span>Infotattva Business Solutions AI Platform Gateway</span>
        </div>
      </div>
    </div>
  );
}
