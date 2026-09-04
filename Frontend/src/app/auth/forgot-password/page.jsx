"use client";

import React, { useState } from "react";
import { Mail, ArrowLeft, Sparkles, Bot } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <div className="relative min-h-screen w-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none">
      {/* Background Mesh Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full filter blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full filter blur-3xl" />

      {/* Glass Card Container */}
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md shadow-2xl space-y-6 z-10">
        
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-gradient-to-tr from-primary to-gray-500 flex items-center justify-center shadow-lg">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent uppercase tracking-wider">
            Reset Password
          </h1>
          <p className="text-xs text-slate-400">
            Submit your registered email, and we will send a password reset validation link.
          </p>
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit} suppressHydrationWarning className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-slate-400 uppercase text-[9px] tracking-wide flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-primary" /> Registered Email
              </label>
              <input
                type="email"
                required
                suppressHydrationWarning
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@company.com"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950/80 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition"
              />
            </div>

            <button
              type="submit"
              suppressHydrationWarning
              className="w-full py-3 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 text-white font-bold rounded-xl shadow-lg transition uppercase tracking-widest flex items-center justify-center gap-1.5"
            >
              Send Reset Link <Sparkles className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <div className="text-center space-y-4 py-4 animate-fade-in text-xs">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
              <p className="font-bold">Password Reset Email Dispatched!</p>
              <p className="text-[10px] text-slate-400 mt-1">Check your inbox at <strong>{email}</strong> for instructions to configure your new credentials.</p>
            </div>
          </div>
        )}

        <div className="text-center pt-2">
          <Link href="/auth/login" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-350 transition font-bold">
            <ArrowLeft className="h-4 w-4" /> Back to Login page
          </Link>
        </div>

      </div>
    </div>
  );
}
