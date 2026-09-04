"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import axios from "axios";

// Helper component that consumes search params
function EmbedFormContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("id") || "";
  const theme = searchParams.get("theme") || "light";
  const accentColor = searchParams.get("accent") || "#6366f1";
  const overrideTitle = searchParams.get("title");

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceInterest, setServiceInterest] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) {
      setError("Invalid setup. Missing company ID configuration parameter.");
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setError("Name and Phone Number are required fields.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      await axios.post(`${apiUrl}/api/leads/create`, {
        companyId,
        name,
        phone,
        email: email.trim() || undefined,
        serviceInterest: serviceInterest.trim() || undefined,
        message: message.trim() || undefined,
        source: "WEBSITE_FORMS"
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Unable to send your inquiry. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center select-none animate-in fade-in zoom-in-95 duration-300">
        <div className="h-16 w-16 rounded-full flex items-center justify-center mb-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/25">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-lg font-black mb-1.5 text-slate-900 dark:text-slate-100">Inquiry Submitted!</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-[280px] leading-relaxed">
          Thank you for reaching out. Your request has been logged and our team will contact you on WhatsApp shortly.
        </p>
      </div>
    );
  }

  // Determine theme layout classes
  const getThemeClasses = () => {
    switch (theme) {
      case "dark":
        return {
          container: "bg-slate-950 text-slate-50",
          card: "bg-slate-900/90 border-slate-800 shadow-slate-950/50",
          input: "border-slate-800 bg-slate-950 text-slate-100 focus:bg-slate-900"
        };
      case "glass":
        return {
          container: "bg-slate-950/20 dark:bg-slate-900/10",
          card: "bg-white/40 dark:bg-slate-900/35 backdrop-blur-md border-white/20 dark:border-slate-800/40 text-slate-900 dark:text-slate-100 shadow-black/5",
          input: "border-slate-200 dark:border-slate-800/60 bg-white/20 dark:bg-slate-950/30 text-slate-900 dark:text-slate-100 focus:bg-white/40 dark:focus:bg-slate-950/50"
        };
      case "light":
      default:
        return {
          container: "bg-slate-50 text-slate-900",
          card: "bg-white border-slate-200 shadow-slate-200/50",
          input: "border-slate-200 bg-white text-slate-900 focus:bg-slate-50"
        };
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-300 ${themeClasses.container}`}>
      <form
        onSubmit={handleSubmit}
        className={`w-full max-w-md p-6 rounded-2xl border shadow-xl flex flex-col gap-4.5 ${themeClasses.card}`}
      >
        <div className="text-center">
          <h1 className="text-base font-black tracking-tight uppercase">
            {overrideTitle || "Get Free Project Consultation"}
          </h1>
          <p className="text-[10px] text-slate-450 mt-0.5">Enter details below to assign a lead advisor</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-rose-500/10 bg-rose-500/5 text-rose-500 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3.5 text-xs font-semibold">
          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-slate-400">Full Name *</label>
            <input
              type="text"
              required
              id="lead-form-name"
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-xl outline-none transition duration-150 focus:ring-2 focus:ring-offset-0`}
              style={{
                borderColor: theme === "dark" ? "#1e293b" : "#e2e8f0"
              }}
              onFocus={(e) => e.target.style.borderColor = accentColor}
              onBlur={(e) => e.target.style.borderColor = theme === "dark" ? "#1e293b" : "#e2e8f0"}
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-slate-400">WhatsApp Number *</label>
            <input
              type="tel"
              required
              id="lead-form-phone"
              placeholder="e.g. +91 94380 99999"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-xl outline-none transition duration-150 focus:ring-2 focus:ring-offset-0`}
              style={{
                borderColor: theme === "dark" ? "#1e293b" : "#e2e8f0"
              }}
              onFocus={(e) => e.target.style.borderColor = accentColor}
              onBlur={(e) => e.target.style.borderColor = theme === "dark" ? "#1e293b" : "#e2e8f0"}
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-slate-400">Email Address</label>
            <input
              type="email"
              id="lead-form-email"
              placeholder="e.g. john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-xl outline-none transition duration-150 focus:ring-2 focus:ring-offset-0`}
              style={{
                borderColor: theme === "dark" ? "#1e293b" : "#e2e8f0"
              }}
              onFocus={(e) => e.target.style.borderColor = accentColor}
              onBlur={(e) => e.target.style.borderColor = theme === "dark" ? "#1e293b" : "#e2e8f0"}
            />
          </div>

          {/* Service/Interest Field */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-slate-400">Service Interest</label>
            <input
              type="text"
              id="lead-form-service"
              placeholder="e.g. Real Estate, Consulting, AI Integration"
              value={serviceInterest}
              onChange={(e) => setServiceInterest(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-xl outline-none transition duration-150 focus:ring-2 focus:ring-offset-0`}
              style={{
                borderColor: theme === "dark" ? "#1e293b" : "#e2e8f0"
              }}
              onFocus={(e) => e.target.style.borderColor = accentColor}
              onBlur={(e) => e.target.style.borderColor = theme === "dark" ? "#1e293b" : "#e2e8f0"}
            />
          </div>

          {/* Message Field */}
          <div className="space-y-1">
            <label className="text-[9px] uppercase tracking-wider text-slate-400">Message</label>
            <textarea
              rows={2}
              id="lead-form-message"
              placeholder="Briefly describe your requirements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-xl outline-none transition duration-150 focus:ring-2 focus:ring-offset-0 resize-none`}
              style={{
                borderColor: theme === "dark" ? "#1e293b" : "#e2e8f0"
              }}
              onFocus={(e) => e.target.style.borderColor = accentColor}
              onBlur={(e) => e.target.style.borderColor = theme === "dark" ? "#1e293b" : "#e2e8f0"}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          id="lead-form-submit"
          className="w-full py-2.5 text-white font-extrabold rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow hover:scale-[1.01] active:scale-[0.99] transition duration-150 mt-1 disabled:opacity-50 disabled:pointer-events-none"
          style={{ backgroundColor: accentColor }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            <>
              <Send className="h-3.5 w-3.5" /> Submit Inquiry
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function EmbedFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-900/10">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-650" />
      </div>
    }>
      <EmbedFormContent />
    </Suspense>
  );
}
