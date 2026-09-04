"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const planName = searchParams.get("planName") || "Growth Plan";
  const billingPeriod = searchParams.get("billingPeriod") || "monthly";
  const price = searchParams.get("price") || "15000";
  const sessionId = searchParams.get("session_id") || "INV-MOCK";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const isCreditsPack = planName.toLowerCase().includes("credits");

  return (
    <DashboardWrapper>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
          {/* Top sparkles */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-bl-full pointer-events-none" />
          <div className="absolute top-4 right-4 text-primary animate-pulse">
            <Sparkles className="h-6 w-6" />
          </div>

          {/* Success Check Icon */}
          <div className="mx-auto h-20 w-20 bg-emerald-100 dark:bg-emerald-950/40 rounded-full flex items-center justify-center border border-emerald-200/30">
            <CheckCircle className="h-12 w-12 text-emerald-500 animate-pulse" />
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
              {isCreditsPack ? "Credits Topped Up!" : "Payment Successful!"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-md mx-auto leading-relaxed">
              {isCreditsPack
                ? "Your audit & enrichment credits have been added successfully. All audit lookup queues are active."
                : "Your company workspace plan has been upgraded successfully. All new quotas and agent seat capacities are active."}
            </p>
          </div>

          {/* Transaction Invoice Card */}
          <div className="p-5 bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 rounded-2xl text-left text-xs font-semibold space-y-3">
            <div className="flex justify-between items-center text-slate-400 border-b border-slate-200/50 dark:border-slate-850 pb-2">
              <span className="uppercase text-[9px] tracking-wider">Transaction Id</span>
              <span className="font-mono text-slate-600 dark:text-slate-300">{sessionId}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-slate-400">{isCreditsPack ? "Purchased Package" : "Upgraded Plan"}</span>
              <span className="text-slate-800 dark:text-slate-250 font-bold">{planName}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Billing Type</span>
              <span className="text-slate-800 dark:text-slate-250 capitalize font-bold">
                {isCreditsPack ? "One-time" : billingPeriod}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-400">Amount Paid</span>
              <span className="text-slate-800 dark:text-slate-250 font-bold">₹{Number(price).toLocaleString()}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-4">
            <button
              onClick={() => router.push("/client-admin/billing")}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 hover:shadow-lg text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5"
            >
              Go to Billing <ArrowRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => router.push("/client-admin/dashboard")}
              className="w-full sm:w-auto px-6 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-wider transition"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 font-bold">Loading Payment Info...</div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
