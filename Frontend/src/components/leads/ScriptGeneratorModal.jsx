"use client";

import React, { useState } from "react";
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
  Layers,
  Settings2,
  X
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/api";
import { getApiUrl } from "@/utils/config";

export function ScriptGeneratorModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("website"); // website, referral, social, email, phone
  const [companyId, setCompanyId] = useState("comp_01");
  const [endpointUrl, setEndpointUrl] = useState(`${getApiUrl()}/leads/create`);
  const [theme, setTheme] = useState("dark"); // dark, light, gradient
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  if (!isOpen) return null;

  // Code Generators for all 5 channels
  const generateWebsiteScript = () => {
    const bgClass = theme === "dark" 
      ? "background: #0f172a; color: #f8fafc; border: 1px solid #1e293b;" 
      : theme === "gradient" 
      ? "background: linear-gradient(135deg, #1e1b4b, #311b92); color: #fff;" 
      : "background: #ffffff; color: #0f172a; border: 1px solid #e2e8f0;";

    return `<!-- Lead Sangrah CRM Web Capture Widget -->
<div id="crm-lead-widget" style="max-width: 420px; padding: 24px; border-radius: 16px; font-family: sans-serif; ${bgClass}">
  <h3 style="margin-top: 0; font-size: 18px; font-weight: 700;">Get In Touch</h3>
  <form id="crm-lead-form" style="display: flex; flex-direction: column; gap: 12px;">
    <input type="text" id="lead-name" placeholder="Full Name *" required style="padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; background: rgba(15, 23, 42, 0.6); color: inherit;" />
    <input type="tel" id="lead-phone" placeholder="Phone Number *" required style="padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; background: rgba(15, 23, 42, 0.6); color: inherit;" />
    <input type="email" id="lead-email" placeholder="Email Address" style="padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; background: rgba(15, 23, 42, 0.6); color: inherit;" />
    <input type="text" id="lead-service" placeholder="Service Interest" style="padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; background: rgba(15, 23, 42, 0.6); color: inherit;" />
    <textarea id="lead-message" placeholder="Message Details" rows="3" style="padding: 10px 14px; border-radius: 8px; border: 1px solid #334155; background: rgba(15, 23, 42, 0.6); color: inherit;"></textarea>
    <button type="submit" style="padding: 12px; border-radius: 8px; border: none; background: #6366f1; color: white; font-weight: bold; cursor: pointer;">Submit Request</button>
  </form>
</div>

<script>
  document.getElementById("crm-lead-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    const payload = {
      companyId: "${companyId}",
      name: document.getElementById("lead-name").value,
      phone: document.getElementById("lead-phone").value,
      email: document.getElementById("lead-email").value,
      serviceInterest: document.getElementById("lead-service").value || "Website Inquiry",
      message: document.getElementById("lead-message").value,
      source: "Website"
    };

    try {
      const res = await fetch("${endpointUrl}", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Inquiry logged successfully into CRM!");
        document.getElementById("crm-lead-form").reset();
      } else {
        alert("Submission failed");
      }
    } catch(err) {
      console.error(err);
    }
  });
</script>`;
  };

  const generateReferralScript = () => {
    return `<!-- Referral Query Auto-Tracker Script -->
<script>
  (function trackReferrals() {
    const params = new URLSearchParams(window.location.search);
    if (params.has("ref")) {
      const refCode = params.get("ref");
      sessionStorage.setItem("crm_referral_id", refCode);
      console.log("Captured Referral Code:", refCode);
    }
  })();

  // Attach to lead payload
  function getLeadSource() {
    const ref = sessionStorage.getItem("crm_referral_id");
    return ref ? "Referral" : "Website";
  }
</script>`;
  };

  const generateSocialScript = () => {
    return `// Meta / Facebook / TikTok Webhook Endpoint Payload (POST)
// Webhook URL: ${endpointUrl.replace('/leads/create', '/webhooks/facebook-leads')}

{
  "companyId": "${companyId}",
  "name": "Social Campaign Lead",
  "phone": "+91 98765 43210",
  "email": "lead@social.com",
  "source": "Social Media",
  "serviceInterest": "Instagram Campaign Promo",
  "message": "Instant Lead Form Submission"
}`;
  };

  const generateEmailScript = () => {
    return `// SendGrid / Mailgun Inbound Email Webhook Payload (POST)
// Endpoint: ${endpointUrl}

{
  "companyId": "${companyId}",
  "name": "Direct Email Inquiry",
  "phone": "+91 94380 99999",
  "email": "inquiry@clientcorp.com",
  "source": "Email",
  "serviceInterest": "Enterprise Quotation",
  "message": "Automatic ingestion from support inbox parse."
}`;
  };

  const generatePhoneScript = () => {
    return `// Twilio / Exotel Cloud Telephony Webhook Payload (POST)
// Endpoint: ${endpointUrl}

{
  "companyId": "${companyId}",
  "name": "Inbound Caller (+91 91234 56789)",
  "phone": "+91 91234 56789",
  "source": "Phone",
  "serviceInterest": "IVR Virtual Desk Call",
  "message": "Completed 45-second call to Sales Line 1"
}`;
  };

  const getActiveCode = () => {
    switch (activeTab) {
      case "website": return generateWebsiteScript();
      case "referral": return generateReferralScript();
      case "social": return generateSocialScript();
      case "email": return generateEmailScript();
      case "phone": return generatePhoneScript();
      default: return generateWebsiteScript();
    }
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
        website: "Website",
        referral: "Referral",
        social: "Social Media",
        email: "Email",
        phone: "Phone"
      };

      const testSource = channelNames[activeTab] || "Website";

      const payload = {
        companyId,
        name: `Test Script Lead (${testSource})`,
        phone: "+91 99999 88888",
        email: `test.${activeTab}@crmdemo.com`,
        location: "Script Generator Test",
        serviceInterest: `${testSource} Ingestion Verification`,
        message: `Verified via Admin Script Generator tool at ${new Date().toLocaleTimeString()}`,
        source: testSource
      };

      await axiosInstance.post("/leads/create", payload);
      toast.success(`🎉 Test Lead successfully created via [${testSource}] script!`);
    } catch (err) {
      console.error(err);
      toast.error("Test ingestion failed: " + (err?.response?.data?.error || err.message));
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-6 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-indigo-400" /> Web Ingestion Script Generator & Embed Builder
            </h2>
            <p className="text-xs text-slate-400">
              Generate ready-to-paste scripts for Website Forms, Referral Trackers, Meta Social Webhooks, Email Ingestion & Phone IVR.
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channel Selection Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 border-b border-slate-800 pb-3">
          {[
            { id: "website", label: "Website Form", icon: Globe, color: "text-blue-400" },
            { id: "referral", label: "Referral Link", icon: Share2, color: "text-purple-400" },
            { id: "social", label: "Social Media", icon: Send, color: "text-emerald-400" },
            { id: "email", label: "Email Parse", icon: Mail, color: "text-amber-400" },
            { id: "phone", label: "Phone / IVR", icon: Phone, color: "text-rose-400" }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                  isActive
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

        {/* Configurations & Code Generator */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Controls Panel */}
          <div className="space-y-4 bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-xs">
            <h3 className="font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
              <Settings2 className="w-4 h-4 text-indigo-400" /> Script Configuration
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
              <label className="block text-slate-400 font-semibold mb-1">API Endpoint URL</label>
              <input
                type="text"
                value={endpointUrl}
                onChange={(e) => setEndpointUrl(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>

            {activeTab === "website" && (
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Widget Visual Theme</label>
                <select
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-100 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                >
                  <option value="dark">🌙 Dark Glassmorphism</option>
                  <option value="gradient">✨ Midnight Gradient</option>
                  <option value="light">☀️ Clean Light Mode</option>
                </select>
              </div>
            )}

            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={handleTestIngestion}
                disabled={isTesting}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition text-xs flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" /> {isTesting ? "Firing Test Lead..." : `Test ${activeTab.toUpperCase()} Ingestion`}
              </button>

              <p className="text-[10px] text-slate-500 text-center font-medium">
                Test fires a sample lead directly into your database.
              </p>
            </div>
          </div>

          {/* Generated Code Block */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-emerald-400" /> Ready-To-Embed Code Snippet
              </span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Code"}</span>
              </button>
            </div>

            <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-[11px] text-slate-200 max-h-96 overflow-y-auto leading-relaxed shadow-inner">
              <pre>{getActiveCode()}</pre>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
          <span>💡 Paste this script directly into your Website's HTML `&lt;body&gt;` or Webhook manager.</span>
          <span className="text-indigo-400 font-bold">Automatic Agent Assignment & WhatsApp Bot Active</span>
        </div>

      </div>
    </div>
  );
}
