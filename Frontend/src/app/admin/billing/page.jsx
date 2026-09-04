"use client";

import React, { useState, useEffect } from "react";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import { CreditCard, Check, Sparkles, AlertCircle, ShieldCheck, Download, Plus, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance, { ENDPOINTS } from "@/utils/api";
import { useSearchParams } from "next/navigation";

const getPlanUIDetails = (plan) => {
  const isStarter = plan.name.toLowerCase().includes("starter");
  const isGrowth = plan.name.toLowerCase().includes("growth");
  const isPremium = plan.name.toLowerCase().includes("premium");

  let badge = "Standard Tier";
  let description = "Affordable platform access for small teams.";
  let popular = false;
  let features = [];

  if (isStarter) {
    badge = "Local Service Tier";
    description = "Ideal for small local services and emerging clinics.";
    features = [
      `${plan.maxChannels} Connected Inbound Channel${plan.maxChannels > 1 ? "s" : ""}`,
      `${plan.maxSeats} Team User Seat${plan.maxSeats > 1 ? "s" : ""}`,
      `${plan.maxTokens.toLocaleString()} Chatbot Tokens quota`,
      "Basic Google Gemini Auto-responses",
      "CRM Pipeline Lead Cards",
      "Standard Welcome WhatsApp template",
    ];
  } else if (isGrowth) {
    badge = "Highly Recommended";
    description = "Best for growing businesses, salons, and education consultants.";
    popular = true;
    features = [
      `${plan.maxChannels} Connected Inbound Channels`,
      `${plan.maxSeats} Team User Seats`,
      `${plan.maxTokens.toLocaleString()} Chatbot Tokens quota`,
      "Advanced Gemini 1.5 Pro AI Co-pilot",
      "Delay follow-up rules builder",
      "Interactive Appointments calendar",
      "Representative close ratios reports",
    ];
  } else if (isPremium) {
    badge = "Enterprise Scale";
    description = "For high-volume real estate developers and multi-tenant clinics.";
    features = [
      plan.maxChannels >= 99 ? "Unlimited WhatsApp/Web Channels" : `${plan.maxChannels} Connected Inbound Channels`,
      plan.maxSeats >= 99 ? "Unlimited Team User Seats" : `${plan.maxSeats} Team User Seats`,
      plan.maxTokens >= 200000 ? "Unlimited Chatbot Tokens" : `${plan.maxTokens.toLocaleString()} Chatbot Tokens quota`,
      "Custom Fine-tuned AI Prompts",
      "Delay follow-ups with automatic triggers",
      "Representative lead routing logic",
      "Multi-tenant platform control API",
      "Dedicated account manager",
    ];
  } else {
    features = [
      `${plan.maxChannels} Connected Inbound Channels`,
      `${plan.maxSeats} Team User Seats`,
      `${plan.maxTokens.toLocaleString()} Chatbot Tokens`,
    ];
  }

  return { badge, description, popular, features };
};

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState("monthly");
  const [activeTab, setActiveTab] = useState("plans");
  const [currentPlan, setCurrentPlan] = useState("Growth Plan");
  const [invoices, setInvoices] = useState([]);
  const [plans, setPlans] = useState([
    {
      id: "starter",
      name: "Starter Plan",
      priceMonthly: 5000,
      maxChannels: 1,
      maxSeats: 2,
      maxTokens: 10000
    },
    {
      id: "growth",
      name: "Growth Plan",
      priceMonthly: 15000,
      maxChannels: 5,
      maxSeats: 5,
      maxTokens: 50000
    },
    {
      id: "premium",
      name: "Premium Plan",
      priceMonthly: 50000,
      maxChannels: 99,
      maxSeats: 99,
      maxTokens: 200000
    }
  ]);
  const [quotas, setQuotas] = useState({
    chatbotUsedTokens: 7412,
    chatbotMaxTokens: 10000,
    whatsappUsedMessages: 22504,
    whatsappMaxMessages: 50000,
    usedSeats: 3,
    maxSeats: 5,
    credits: 1000
  });

  const loadBillingData = async () => {
    try {
      const [planRes, plansRes, quotasRes, invoicesRes] = await Promise.all([
        axiosInstance.get("/api/admin/billing/plan"),
        axiosInstance.get("/api/admin/billing/plans"),
        axiosInstance.get(ENDPOINTS.clientAdmin.billingQuotas),
        axiosInstance.get(ENDPOINTS.clientAdmin.billingInvoices)
      ]);

      const planMap = {
        "STARTER_PLAN": "Starter Plan",
        "GROWTH_PLAN": "Growth Plan",
        "PREMIUM_PLAN": "Premium Plan",
        "Starter Plan": "Starter Plan",
        "Growth Plan": "Growth Plan",
        "Premium Plan": "Premium Plan"
      };
      setCurrentPlan(planMap[planRes.data.currentPlan] || "Starter Plan");
      if (plansRes.data && plansRes.data.length > 0) {
        setPlans(plansRes.data);
      }
      setQuotas(quotasRes.data);

      const formattedInvoices = invoicesRes.data.map((inv) => ({
        id: inv.id,
        invoiceNo: inv.invoiceNo,
        date: inv.date.split("T")[0],
        amount: inv.amount,
        status: inv.status,
        plan: inv.plan
      }));
      setInvoices(formattedInvoices);
    } catch (err) {
      console.error("Failed to load billing data:", err);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadBillingData();

    const handleBillingUpdate = () => {
      loadBillingData();
    };

    window.addEventListener("billingPlanUpdated", handleBillingUpdate);
    return () => {
      window.removeEventListener("billingPlanUpdated", handleBillingUpdate);
    };
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "credits" || tabParam === "history") {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleUpgradePlan = async (planName) => {
    try {
      const res = await axiosInstance.post("/api/admin/billing/checkout-session", {
        planName,
        billingPeriod
      });
      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        throw new Error("Checkout session url is missing.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to initiate payment session");
    }
  };

  if (!mounted) {
    return (
      <DashboardWrapper>
        <div className="space-y-6 animate-pulse p-6">
          <div className="space-y-2">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded-xl w-64" />
            <div className="h-4 bg-slate-200 dark:bg-slate-800/80 rounded-lg w-96" />
          </div>
          <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full max-w-lg" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            ))}
          </div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      <div className="space-y-6">

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
              Subscription & Billing Workspace <CreditCard className="h-6 w-6 text-primary animate-pulse" />
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Select retainer plan tiers, review monthly platform usage metrics, and download invoice logs.
            </p>
          </div>
        </div>

        {/* Real-time quotas indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Quota 1 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold">
              <span>AI Chatbot Quota</span>
              <span className="text-primary font-black">
                {Math.round((quotas.chatbotUsedTokens / quotas.chatbotMaxTokens) * 100)}% Used
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100">
                <span>{quotas.chatbotUsedTokens.toLocaleString()} Tokens</span>
                <span className="text-slate-400">/ {quotas.chatbotMaxTokens.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full" style={{ width: `${(quotas.chatbotUsedTokens / quotas.chatbotMaxTokens) * 100}%` }} />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Gemini Pro API query call limit resets in 12 days.</p>
          </div>

          {/* Quota 2 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold">
              <span>WhatsApp Deliveries</span>
              <span className="text-emerald-500 font-black">
                {Math.round((quotas.whatsappUsedMessages / quotas.whatsappMaxMessages) * 100)}% Used
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100">
                <span>{quotas.whatsappUsedMessages.toLocaleString()} Messages</span>
                <span className="text-slate-400">/ {quotas.whatsappMaxMessages.toLocaleString()}</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${(quotas.whatsappUsedMessages / quotas.whatsappMaxMessages) * 100}%` }} />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Meta Business Cloud messaging delivery counts.</p>
          </div>

          {/* Quota 3 */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold">
              <span>Assigned Team Users</span>
              <span className="text-indigo-500 font-black">
                {Math.round((quotas.usedSeats / quotas.maxSeats) * 100)}% Used
              </span>
            </div>
            <div className="mt-3 space-y-1">
              <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-slate-100">
                <span>{quotas.usedSeats} representatives</span>
                <span className="text-slate-400">/ {quotas.maxSeats} Seats</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${(quotas.usedSeats / quotas.maxSeats) * 100}%` }} />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Active representative accounts for sales routing.</p>
          </div>
        </div>

        {/* Tab switch bar and Annual switch */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold max-w-md overflow-x-auto">
            <button
              onClick={() => setActiveTab("plans")}
              className={`px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition shrink-0 ${activeTab === "plans"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Plans Grid
            </button>
            <button
              onClick={() => setActiveTab("credits")}
              className={`px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition shrink-0 ${activeTab === "credits"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Buy Credits
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-2 rounded-xl flex items-center justify-center gap-1.5 transition shrink-0 ${activeTab === "history"
                ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow"
                : "text-slate-500 hover:text-slate-700"
                }`}
            >
              Invoices History
            </button>
          </div>

          {activeTab === "plans" && (
            <div className="flex items-center gap-2 text-xs font-bold bg-slate-150/40 p-1 border rounded-xl">
              <button
                onClick={() => setBillingPeriod("monthly")}
                className={`px-3 py-1.5 rounded-lg transition ${billingPeriod === "monthly" ? "bg-white dark:bg-slate-850 shadow" : "text-slate-400"}`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingPeriod("annually")}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${billingPeriod === "annually" ? "bg-white dark:bg-slate-850 shadow" : "text-slate-400"}`}
              >
                Annually (Save 20%) <span className="text-[8px] px-1 bg-purple-500 text-white rounded">Glow</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab content rendering */}
        {activeTab === "credits" && (
          <div className="space-y-6 pt-3 animate-fade-in">
            {/* Credit balance banner */}
            <div className="bg-gradient-to-r from-teal-500/10 to-emerald-500/10 border border-teal-500/20 p-6 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="h-11 w-11 bg-teal-500/20 text-teal-650 rounded-xl flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-teal-650" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 uppercase tracking-wider">Audit & Enrichment Credits</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Credits are consumed when running Website SEO audits (5), GMB audits (3), Social Media audits (5), and Lead Enrichment queries (1-2).</p>
                </div>
              </div>
              <div className="flex items-center gap-4 border-l border-slate-200/50 dark:border-slate-800 pl-6 shrink-0 md:min-w-[150px]">
                <div>
                  <p className="text-3xl font-black text-slate-900 dark:text-slate-100">{quotas.credits !== undefined ? quotas.credits.toLocaleString() : "1,000"}</p>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Available Credits</span>
                </div>
              </div>
            </div>

            {/* Credit packages grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {[
                {
                  name: "100 Credits Pack",
                  credits: 100,
                  price: 1000,
                  desc: "Ideal for running quick local business and on-page SEO reports.",
                  features: ["100 Audits / Lookup credits", "100% full RAG analysis access", "Valid for all audit types", "Credits never expire"]
                },
                {
                  name: "500 Credits Pack",
                  credits: 500,
                  price: 4000,
                  desc: "Best for growing businesses doing regular lead enrichment batches.",
                  features: ["500 Audits / Lookup credits", "Save 20% compared to base price", "Priority queue indexing speed", "Credits never expire"],
                  popular: true
                },
                {
                  name: "1,500 Credits Pack",
                  credits: 1500,
                  price: 10000,
                  desc: "Designed for high volume sales agencies crawling bulk domains daily.",
                  features: ["1500 Audits / Lookup credits", "Save 33% (best value tier)", "Dedicated concurrent lookup queue", "Credits never expire"]
                }
              ].map((pack) => (
                <div
                  key={pack.name}
                  className={`relative flex flex-col justify-between gap-5 p-6 rounded-3xl border transition bg-white dark:bg-slate-900 ${
                    pack.popular
                      ? "border-teal-500 shadow-2xl scale-102 ring-2 ring-teal-500/10"
                      : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                  }`}
                >
                  {pack.popular && (
                    <span className="absolute top-[-10px] right-6 px-3 py-0.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white text-[9px] uppercase font-black tracking-widest rounded-full flex items-center gap-1 shadow-md">
                      <Sparkles className="h-3 w-3" /> Best Seller
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md font-bold uppercase">One-time pack</span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{pack.name}</h3>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-semibold min-h-[36px]">{pack.desc}</p>

                    <div className="flex items-baseline gap-1 pt-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-slate-100">₹{pack.price.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 font-bold">/ one-time</span>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs font-semibold">
                      <span className="text-slate-400 uppercase text-[9px] font-bold block mb-1">Pack Features:</span>
                      {pack.features.map((feat, idx) => (
                        <div key={idx} className="flex gap-2 items-start text-slate-600 dark:text-slate-300">
                          <Check className="h-4.5 w-4.5 text-teal-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUpgradePlan(pack.name)}
                    className="w-full py-2.5 rounded-xl font-black text-xs uppercase bg-gradient-to-r from-teal-500 to-emerald-500 hover:scale-102 hover:shadow-xl text-white shadow-md transition tracking-wider"
                  >
                    Purchase Credits
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "plans" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-3">
            {plans.map((p) => {
              const active = currentPlan === p.name;
              const { badge, description, popular, features } = getPlanUIDetails(p);
              const price = billingPeriod === "monthly" ? p.priceMonthly : Math.round(p.priceMonthly * 12 * 0.8);
              return (
                <div
                  key={p.name}
                  className={`relative flex flex-col justify-between gap-5 p-6 rounded-3xl border transition select-none bg-white dark:bg-slate-900 ${active
                    ? "border-primary shadow-2xl scale-102 ring-2 ring-primary/20"
                    : "border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700"
                    }`}
                >
                  {popular && (
                    <span className="absolute top-[-10px] right-6 px-3 py-0.5 bg-gradient-to-r from-primary to-gray-500 text-white text-[9px] uppercase font-black tracking-widest rounded-full flex items-center gap-1 shadow-md">
                      <Sparkles className="h-3 w-3" /> Most Popular
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md font-bold uppercase">{badge}</span>
                      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{p.name}</h3>
                    </div>

                    <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed font-semibold min-h-[36px]">{description}</p>

                    <div className="flex items-baseline gap-1 pt-2">
                      <span className="text-3xl font-black text-slate-900 dark:text-slate-100">₹{price.toLocaleString()}</span>
                      <span className="text-xs text-slate-400 font-bold">/ {billingPeriod === "monthly" ? "month" : "year"}</span>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5 text-xs font-semibold">
                      <span className="text-slate-400 uppercase text-[9px] font-bold block mb-1">Key Tier Benefits:</span>
                      {features.map((feat, idx) => (
                        <div key={idx} className="flex gap-2 items-start text-slate-600 dark:text-slate-300">
                          <Check className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!active) {
                        handleUpgradePlan(p.name);
                      }
                    }}
                    className={`w-full py-2.5 rounded-xl font-black text-xs uppercase transition tracking-wider ${active
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300 cursor-default"
                      : "bg-gradient-to-r from-primary to-gray-500 hover:scale-102 hover:shadow-xl text-white shadow-md shadow-primary/10"
                      }`}
                  >
                    {active ? "Active Subscription" : "Upgrade Workspace Tier"}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "history" && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-fade-in">
            <h3 className="text-sm font-black uppercase text-slate-900 dark:text-slate-50 tracking-wide mb-4">
              Receipt Invoice History Logs
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-bold">
                    <th className="pb-3 pr-2">Invoice Number</th>
                    <th className="pb-3 pr-2">Billing Date</th>
                    <th className="pb-3 pr-2">Plan Details</th>
                    <th className="pb-3 pr-2">Total Amount</th>
                    <th className="pb-3 pr-2">Status</th>
                    <th className="pb-3 text-right">Download Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 group">
                      <td className="py-4 font-bold text-slate-900 dark:text-slate-100">{inv.invoiceNo}</td>
                      <td className="py-4 text-slate-500 dark:text-slate-400 font-semibold">{inv.date}</td>
                      <td className="py-4 text-slate-700 dark:text-slate-350 font-semibold">{inv.plan}</td>
                      <td className="py-4 font-bold text-slate-900 dark:text-slate-100">{inv.amount}</td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600">
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => toast.info(`Downloading invoice receipt file ${inv.invoiceNo}...`)}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 transition inline-flex items-center gap-1 font-bold"
                        >
                          <Download className="h-3.5 w-3.5" /> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
}
