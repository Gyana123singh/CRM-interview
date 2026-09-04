"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Send, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import axios from "axios";
import { getApiUrl } from "@/utils/config";

// Helper component that consumes search params
function EmbedFormContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get("id") || "";
  const theme = searchParams.get("theme") || "light";
  const accentColor = searchParams.get("accent") || "#6366f1";
  const rawTitle = searchParams.get("title");
  const overrideTitle = rawTitle ? decodeURIComponent(rawTitle) : null;

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
      setError("Invalid setup. Missing tenant company ID parameter.");
      return;
    }
    if (!name.trim() || !phone.trim()) {
      setError("Name and Phone Number are required fields.");
      return;
    }

    setLoading(true);
    setError("");

    const sourceParam = searchParams.get("source") || (searchParams.get("ref") ? "Referral" : "Website Forms");
    const refCode = searchParams.get("ref") || "";

    try {
      await axios.post(`${getApiUrl()}/leads/create`, {
        companyId,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        serviceInterest: serviceInterest.trim() || undefined,
        message: message.trim() || undefined,
        source: sourceParam,
        notes: refCode ? `Referred via referral code: ${refCode}` : undefined
      });

      setSuccess(true);
    } catch (err) {
      console.error("Embed Lead Submission Error:", err);
      setError(err.response?.data?.error || "Unable to submit your inquiry. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center select-none animate-in fade-in zoom-in-95 duration-300 bg-slate-950 text-slate-100">
        <div className="h-16 w-16 rounded-full flex items-center justify-center mb-4 bg-emerald-500/10 text-emerald-500 border border-emerald-500/25 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-black mb-1 text-slate-100">Inquiry Received!</h2>
        <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed">
          Thank you for reaching out. Your inquiry has been submitted and our team will get back to you shortly.
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
      case "gradient":
        return {
          container: "bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-slate-50",
          card: "bg-slate-900/80 border-indigo-500/30 backdrop-blur-xl shadow-2xl",
          input: "border-indigo-900/50 bg-slate-950/60 text-slate-100 focus:bg-slate-950"
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
        className={`w-full max-w-md p-6 rounded-2xl border shadow-xl flex flex-col gap-4 ${themeClasses.card}`}
      >
        <div className="text-center">
          <h1 className="text-base font-extrabold tracking-tight uppercase">
            {overrideTitle || "Get Free Consultation"}
          </h1>
          <p className="text-[11px] opacity-70 mt-0.5">Fill out your information to get in touch</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-xs font-semibold flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-3 text-xs font-semibold">
          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider opacity-80">Full Name *</label>
            <input
              type="text"
              required
              id="lead-form-name"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-xl outline-none transition duration-150 ${themeClasses.input}`}
              style={{ borderColor: theme === "dark" ? "#1e293b" : undefined }}
              onFocus={(e) => (e.target.style.borderColor = accentColor)}
              onBlur={(e) => (e.target.style.borderColor = theme === "dark" ? "#1e293b" : "")}
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider opacity-80">WhatsApp / Phone *</label>
            <input
              type="tel"
              required
              id="lead-form-phone"
              placeholder="e.g. +91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-xl outline-none transition duration-150 ${themeClasses.input}`}
              style={{ borderColor: theme === "dark" ? "#1e293b" : undefined }}
              onFocus={(e) => (e.target.style.borderColor = accentColor)}
              onBlur={(e) => (e.target.style.borderColor = theme === "dark" ? "#1e293b" : "")}
            />
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider opacity-80">Email Address</label>
            <input
              type="email"
              id="lead-form-email"
              placeholder="e.g. rahul@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-xl outline-none transition duration-150 ${themeClasses.input}`}
              style={{ borderColor: theme === "dark" ? "#1e293b" : undefined }}
              onFocus={(e) => (e.target.style.borderColor = accentColor)}
              onBlur={(e) => (e.target.style.borderColor = theme === "dark" ? "#1e293b" : "")}
            />
          </div>

          {/* Service/Interest Field */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider opacity-80">Service Interest</label>
            <input
              type="text"
              id="lead-form-service"
              placeholder="e.g. Interior Design, AI Integration"
              value={serviceInterest}
              onChange={(e) => setServiceInterest(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-xl outline-none transition duration-150 ${themeClasses.input}`}
              style={{ borderColor: theme === "dark" ? "#1e293b" : undefined }}
              onFocus={(e) => (e.target.style.borderColor = accentColor)}
              onBlur={(e) => (e.target.style.borderColor = theme === "dark" ? "#1e293b" : "")}
            />
          </div>

          {/* Message Field */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wider opacity-80">Message</label>
            <textarea
              rows={2.5}
              id="lead-form-message"
              placeholder="Briefly describe your requirements..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`w-full px-3.5 py-2 border rounded-xl outline-none transition duration-150 resize-none ${themeClasses.input}`}
              style={{ borderColor: theme === "dark" ? "#1e293b" : undefined }}
              onFocus={(e) => (e.target.style.borderColor = accentColor)}
              onBlur={(e) => (e.target.style.borderColor = theme === "dark" ? "#1e293b" : "")}
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
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      }
    >
      <EmbedFormContent />
    </Suspense>
  );
}
