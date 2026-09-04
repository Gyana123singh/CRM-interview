"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import {
  Code,
  Copy,
  Check,
  Globe,
  Share2,
  Send,
  Phone,
  Mail,
  Sparkles,
  Play,
  Terminal,
  Settings2,
  X,
  Eye,
  Layers,
  CheckCircle2,
  Loader2,
  Palette
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/api";
import { getApiUrl } from "@/utils/config";

export function ScriptGeneratorModal({ isOpen, onClose }) {
  const user = useSelector((state) => state.auth.user);
  const defaultCompanyId = user?.companyId || "company-infotattva-id";
  const [mounted, setMounted] = useState(false);

  const [activeChannel, setActiveChannel] = useState("website"); // website, referral, social, email, phone
  const [framework, setFramework] = useState("iframe"); // iframe, html, react, vue_angular, widget
  const [companyId, setCompanyId] = useState(defaultCompanyId);
  const [endpointUrl, setEndpointUrl] = useState(`${getApiUrl()}/leads/create`);
  const [formTitle, setFormTitle] = useState("Get Free Consultation");
  const [theme, setTheme] = useState("dark"); // dark, light, glass, gradient
  const [accentColor, setAccentColor] = useState("#6366f1");
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Live preview interactive state
  const [previewName, setPreviewName] = useState("");
  const [previewPhone, setPreviewPhone] = useState("");
  const [previewEmail, setPreviewEmail] = useState("");
  const [previewService, setPreviewService] = useState("");
  const [previewMessage, setPreviewMessage] = useState("");
  const [previewSubmitting, setPreviewSubmitting] = useState(false);
  const [previewSuccess, setPreviewSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user?.companyId) {
      setCompanyId(user.companyId);
    }
  }, [user]);

  if (!isOpen || !mounted) return null;

  // Base Embed URL for iFrame & Widgets
  const getEmbedUrl = () => {
    const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const titleParam = encodeURIComponent(formTitle);
    const accentParam = encodeURIComponent(accentColor);
    return `${origin}/embed/forms?id=${companyId}&theme=${theme}&accent=${accentParam}&title=${titleParam}`;
  };

  // 1. iFrame Embed Snippet (Works universally: HTML, WordPress, Webflow, Wix, Shopify, React, Vue, Angular)
  const generateIframeScript = () => {
    return `<!-- CRM Lead Capture iFrame Widget (Universal: WordPress, Webflow, Wix, React, Vue, Angular) -->
<iframe
  src="${getEmbedUrl()}"
  width="100%"
  height="540"
  style="border: none; border-radius: 16px; width: 100%; max-width: 480px; display: block; margin: 0 auto; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);"
  title="${formTitle}"
  loading="lazy"
></iframe>`;
  };

  // 2. Native HTML + Vanilla JS Snippet
  const generateHtmlScript = () => {
    const bgStyle =
      theme === "dark"
        ? "background: #0f172a; color: #f8fafc; border: 1px solid #1e293b;"
        : theme === "glass"
          ? "background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(12px); color: #fff; border: 1px solid rgba(255,255,255,0.1);"
          : theme === "gradient"
            ? "background: linear-gradient(135deg, #1e1b4b, #311b92); color: #fff; border: 1px solid #312e81;"
            : "background: #ffffff; color: #0f172a; border: 1px solid #e2e8f0;";

    return `<!-- CRM Sales Management Form (HTML + Vanilla JS) -->
<div id="crm-lead-widget" style="max-width: 440px; margin: 0 auto; padding: 24px; border-radius: 16px; font-family: system-ui, -apple-system, sans-serif; ${bgStyle}">
  <h3 style="margin-top: 0; font-size: 18px; font-weight: 800; text-align: center;">${formTitle}</h3>
  <form id="crm-lead-form" style="display: flex; flex-direction: column; gap: 12px; margin-top: 16px;">
    <div>
      <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; opacity: 0.8;">Full Name *</label>
      <input type="text" id="crm-lead-name" placeholder="John Doe" required style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; background: rgba(15,23,42,0.4); color: inherit; box-sizing: border-box;" />
    </div>
    <div>
      <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; opacity: 0.8;">WhatsApp / Phone *</label>
      <input type="tel" id="crm-lead-phone" placeholder="+91 98765 43210" required style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; background: rgba(15,23,42,0.4); color: inherit; box-sizing: border-box;" />
    </div>
    <div>
      <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; opacity: 0.8;">Email Address</label>
      <input type="email" id="crm-lead-email" placeholder="john@example.com" style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; background: rgba(15,23,42,0.4); color: inherit; box-sizing: border-box;" />
    </div>
    <div>
      <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; opacity: 0.8;">Service Interest</label>
      <input type="text" id="crm-lead-service" placeholder="e.g. Interior Design, Consultation" style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; background: rgba(15,23,42,0.4); color: inherit; box-sizing: border-box;" />
    </div>
    <div>
      <label style="display: block; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; opacity: 0.8;">Message</label>
      <textarea id="crm-lead-message" rows="3" placeholder="Describe your project requirements..." style="width: 100%; padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; background: rgba(15,23,42,0.4); color: inherit; resize: none; box-sizing: border-box;"></textarea>
    </div>
    <button type="submit" id="crm-lead-submit" style="width: 100%; padding: 12px; border-radius: 8px; border: none; background: ${accentColor}; color: #ffffff; font-weight: 800; text-transform: uppercase; cursor: pointer; margin-top: 8px; font-size: 13px;">Submit Inquiry</button>
  </form>
</div>

<script>
  document.getElementById("crm-lead-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    const submitBtn = document.getElementById("crm-lead-submit");
    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;

    const payload = {
      companyId: "${companyId}",
      name: document.getElementById("crm-lead-name").value,
      phone: document.getElementById("crm-lead-phone").value,
      email: document.getElementById("crm-lead-email").value,
      serviceInterest: document.getElementById("crm-lead-service").value || "Website Inquiry",
      message: document.getElementById("crm-lead-message").value,
      source: "Website Forms"
    };

    try {
      const res = await fetch("${endpointUrl}", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("🎉 Inquiry submitted successfully! Our team will contact you shortly.");
        document.getElementById("crm-lead-form").reset();
      } else {
        const data = await res.json();
        alert("Submission error: " + (data.error || "Failed to submit lead"));
      }
    } catch(err) {
      console.error("CRM Ingestion Error:", err);
      alert("Unable to send inquiry. Please try again later.");
    } finally {
      submitBtn.innerText = "Submit Inquiry";
      submitBtn.disabled = false;
    }
  });
</script>`;
  };

  // 3. React.js / Next.js Component Snippet
  const generateReactScript = () => {
    return `import React, { useState } from 'react';

export default function LeadCaptureForm() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', serviceInterest: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('${endpointUrl}', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: '${companyId}',
          ...formData,
          source: 'Website Forms'
        })
      });
      if (res.ok) setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) return <div style={{ color: '#10b981', textAlign: 'center', padding: '20px' }}>✅ Thank you! Inquiry logged.</div>;

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 420, padding: 24, borderRadius: 16, background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h3>${formTitle}</h3>
      <input type="text" placeholder="Full Name *" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ padding: 10, borderRadius: 8 }} />
      <input type="tel" placeholder="Phone *" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ padding: 10, borderRadius: 8 }} />
      <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ padding: 10, borderRadius: 8 }} />
      <input type="text" placeholder="Service Interest" value={formData.serviceInterest} onChange={e => setFormData({...formData, serviceInterest: e.target.value})} style={{ padding: 10, borderRadius: 8 }} />
      <textarea placeholder="Message" value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} style={{ padding: 10, borderRadius: 8 }} />
      <button type="submit" disabled={loading} style={{ background: '${accentColor}', color: '#fff', padding: 12, borderRadius: 8, border: 'none', fontWeight: 'bold' }}>
        {loading ? 'Submitting...' : 'Submit Inquiry'}
      </button>
    </form>
  );
}`;
  };

  // 4. Vue / Angular Snippet
  const generateVueAngularScript = () => {
    return `// Vue 3 Composition API / Angular Lead Ingestion Service snippet
// API Endpoint: ${endpointUrl}
// Tenant Company ID: ${companyId}

const submitLead = async (leadData) => {
  const response = await fetch('${endpointUrl}', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      companyId: '${companyId}',
      name: leadData.name,
      phone: leadData.phone,
      email: leadData.email,
      serviceInterest: leadData.serviceInterest,
      message: leadData.message,
      source: 'Website Forms'
    })
  });
  return await response.json();
};`;
  };

  // 5. Floating Lead Widget Tag
  const generateWidgetScript = () => {
    return `<!-- CRM Floating Lead Widget Tag -->
<script
  src="${getEmbedUrl()}"
  data-crm-company="${companyId}"
  data-crm-theme="${theme}"
  data-crm-accent="${encodeURIComponent(accentColor)}"
  async
></script>`;
  };

  // 6. Referral Code Tracker
  const generateReferralScript = () => {
    return `<!-- Referral Query Auto-Tracker Script -->
<script>
  (function trackReferrals() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("ref")) {
      const refCode = params.get("ref");
      sessionStorage.setItem("crm_referral_id", refCode);
      console.log("Captured CRM Referral Code:", refCode);
    }
  })();
</script>`;
  };

  // 7. Social Media Webhook Snippet
  const generateSocialScript = () => {
    return `// Meta Lead Ads / TikTok Webhook Ingestion Payload (POST)
// Webhook Endpoint: ${endpointUrl.replace('/leads/create', '/webhooks/facebook-leads')}

{
  "companyId": "${companyId}",
  "name": "Social Lead",
  "phone": "+91 98765 43210",
  "email": "lead@social.com",
  "source": "Social Media",
  "serviceInterest": "Instagram Promo Ad",
  "message": "Direct Lead Form Submission"
}`;
  };

  // 8. Email Parser Snippet
  const generateEmailScript = () => {
    return `// SendGrid / Mailgun Email Ingestion Webhook (POST)
// Endpoint: ${endpointUrl}

{
  "companyId": "${companyId}",
  "name": "Inbound Email Inquiry",
  "phone": "+91 94380 99999",
  "email": "inquiry@clientcorp.com",
  "source": "Email",
  "serviceInterest": "Enterprise Plan Inquiry",
  "message": "Automated email ingestion."
}`;
  };

  // 9. Phone IVR Snippet
  const generatePhoneScript = () => {
    return `// Cloud Telephony / Twilio IVR Webhook (POST)
// Endpoint: ${endpointUrl}

{
  "companyId": "${companyId}",
  "name": "Inbound Caller",
  "phone": "+91 91234 56789",
  "source": "Phone",
  "serviceInterest": "Virtual Desk Line Call",
  "message": "Completed 45s inbound call"
}`;
  };

  const getActiveCode = () => {
    if (activeChannel === "website") {
      switch (framework) {
        case "iframe":
          return generateIframeScript();
        case "html":
          return generateHtmlScript();
        case "react":
          return generateReactScript();
        case "vue_angular":
          return generateVueAngularScript();
        case "widget":
          return generateWidgetScript();
        default:
          return generateIframeScript();
      }
    } else if (activeChannel === "referral") {
      return generateReferralScript();
    } else if (activeChannel === "social") {
      return generateSocialScript();
    } else if (activeChannel === "email") {
      return generateEmailScript();
    } else if (activeChannel === "phone") {
      return generatePhoneScript();
    }
    return generateIframeScript();
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    toast.success("Script code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestIngestion = async () => {
    setIsTesting(true);
    try {
      const channelNames = {
        website: "Website Forms",
        referral: "Referral",
        social: "Social Media",
        email: "Email",
        phone: "Phone"
      };

      const testSource = channelNames[activeChannel] || "Website Forms";

      const payload = {
        companyId,
        name: `Test Script Lead (${testSource})`,
        phone: "+91 99999 88888",
        email: `test.${activeChannel}@crmdemo.com`,
        location: "Script Generator Modal",
        serviceInterest: `${testSource} Verification`,
        message: `Generated via Embed Script Generator tool at ${new Date().toLocaleTimeString()}`,
        source: testSource
      };

      await axiosInstance.post("/leads/create", payload);
      toast.success(`🎉 Test Lead created successfully via [${testSource}]! Check your CRM Leads dashboard.`);
    } catch (err) {
      console.error(err);
      toast.error("Test ingestion failed: " + (err?.response?.data?.error || err.message));
    } finally {
      setIsTesting(false);
    }
  };

  const handlePreviewSubmit = async (e) => {
    e.preventDefault();
    if (!previewName.trim() || !previewPhone.trim()) {
      toast.error("Name and Phone are required for test submission.");
      return;
    }

    setPreviewSubmitting(true);
    try {
      await axiosInstance.post("/leads/create", {
        companyId,
        name: previewName,
        phone: previewPhone,
        email: previewEmail || undefined,
        serviceInterest: previewService || "Website Contact Form",
        message: previewMessage || "Live preview test submission from CRM Script Generator",
        source: "Website Forms"
      });

      setPreviewSuccess(true);
      toast.success("🎉 Live Preview Test Submitted! Check your CRM Leads list.");
      setTimeout(() => {
        setPreviewSuccess(false);
        setPreviewName("");
        setPreviewPhone("");
        setPreviewEmail("");
        setPreviewService("");
        setPreviewMessage("");
      }, 3500);
    } catch (err) {
      toast.error(err?.response?.data?.error || "Failed to submit lead");
    } finally {
      setPreviewSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-5 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-white flex items-center gap-2 tracking-tight">
              <Code className="w-5 h-5 text-indigo-400" /> Embed Lead Form & Script Generator
            </h2>
            <p className="text-xs text-slate-400">
              Generate embed code for HTML, JavaScript, React.js, Angular, Vue, Webflow, WordPress, or any web framework.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Channels */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-slate-800 pb-3">
          {[
            { id: "website", label: "Website Form", icon: Globe, color: "text-blue-400" },
            { id: "referral", label: "Referral Link", icon: Share2, color: "text-purple-400" },
            { id: "social", label: "Social Media", icon: Send, color: "text-emerald-400" },
            { id: "email", label: "Email Parse", icon: Mail, color: "text-amber-400" },
            { id: "phone", label: "Phone / IVR", icon: Phone, color: "text-rose-400" }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeChannel === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveChannel(tab.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "bg-slate-950/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800"
                  }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : tab.color}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Framework Selector (Only for Website Form channel) */}
        {activeChannel === "website" && (
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-2xl border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">Framework:</span>
            {[
              { id: "iframe", label: "iFrame (Universal)" },
              { id: "html", label: "HTML & JS" },
              { id: "react", label: "React.js / Next.js" },
              { id: "vue_angular", label: "Vue / Angular" },
              { id: "widget", label: "Floating Widget Tag" }
            ].map((fw) => (
              <button
                key={fw.id}
                onClick={() => setFramework(fw.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${framework === fw.id
                  ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  }`}
              >
                {fw.label}
              </button>
            ))}
          </div>
        )}

        {/* Main Content Grid: Controls + Code Snippet + Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controls Panel */}
          <div className="lg:col-span-4 space-y-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
              <Settings2 className="w-4 h-4 text-indigo-400" /> Form Settings
            </h3>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Company Tenant ID</label>
              <input
                type="text"
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Form Title</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {activeChannel === "website" && (
              <>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Visual Theme</label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40 text-xs"
                  >
                    <option value="dark">🌙 Dark Glassmorphism</option>
                    <option value="gradient">✨ Midnight Gradient</option>
                    <option value="light">☀️ Clean Light Mode</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-indigo-400" /> Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="h-8 w-12 rounded bg-transparent cursor-pointer border border-slate-800"
                    />
                    <input
                      type="text"
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs"
                    />
                  </div>
                </div>
              </>
            )}

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={handleTestIngestion}
                disabled={isTesting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Play className="w-4 h-4" /> {isTesting ? "Firing Test..." : "Test Backend Ingestion"}
              </button>

              <p className="text-[10px] text-slate-500 text-center font-medium">
                Directly sends a test lead into your CRM leads table.
              </p>
            </div>
          </div>

          {/* Code Snippet Column */}
          <div className="lg:col-span-4 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" /> Copy Script Code
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>

            <div className="relative flex-1 rounded-2xl bg-slate-950 border border-slate-800 p-3.5 font-mono text-[11px] text-slate-200 max-h-[380px] overflow-y-auto leading-relaxed shadow-inner">
              <pre>{getActiveCode()}</pre>
            </div>
          </div>

          {/* Live Preview Panel Column */}
          <div className="lg:col-span-4 space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-indigo-400" /> Live Interactive Preview
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Form rendering preview</span>
            </div>

            <div
              className={`flex-1 p-4 rounded-2xl border shadow-xl flex flex-col justify-between transition-colors duration-300 ${theme === "dark"
                ? "bg-slate-950 text-slate-100 border-slate-800"
                : theme === "gradient"
                  ? "bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 text-slate-100 border-indigo-800/50"
                  : "bg-slate-50 text-slate-900 border-slate-200"
                }`}
            >
              {previewSuccess ? (
                <div className="flex flex-col items-center justify-center min-h-[300px] text-center p-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h4 className="text-sm font-bold">Inquiry Logged!</h4>
                  <p className="text-xs text-slate-400 mt-1">Lead added directly to your CRM pipeline.</p>
                </div>
              ) : (
                <form onSubmit={handlePreviewSubmit} className="space-y-2.5 text-xs">
                  <h4 className="font-extrabold text-sm text-center uppercase tracking-tight mb-2">
                    {formTitle || "Get Free Consultation"}
                  </h4>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={previewName}
                      onChange={(e) => setPreviewName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">WhatsApp / Phone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 94380 99999"
                      value={previewPhone}
                      onChange={(e) => setPreviewPhone(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-100 outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400">Service Interest</label>
                    <input
                      type="text"
                      placeholder="e.g. Interior Design"
                      value={previewService}
                      onChange={(e) => setPreviewService(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs text-slate-100 outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={previewSubmitting}
                    className="w-full py-2 font-bold text-white uppercase rounded-lg text-xs flex items-center justify-center gap-1.5 shadow transition hover:opacity-90 mt-2"
                    style={{ backgroundColor: accentColor }}
                  >
                    {previewSubmitting ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      "Submit Test Inquiry"
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
          <span>💡 Paste this script directly into any HTML page, WordPress, Webflow, Wix, React, Vue, or Angular site.</span>
          <span className="text-indigo-400 font-bold">Real-time Lead Ingestion to CRM Dashboard Active</span>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ScriptGeneratorModal;
