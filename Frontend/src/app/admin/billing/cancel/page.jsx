"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export default function PaymentCancelPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <DashboardWrapper>
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center space-y-6">
          
          {/* Cancel Check Icon */}
          <div className="mx-auto h-20 w-20 bg-rose-105 dark:bg-rose-950/40 rounded-full flex items-center justify-center border border-rose-200/30">
            <XCircle className="h-12 w-12 text-rose-500 animate-pulse" />
          </div>

          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wide">
              Payment Cancelled
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold max-w-md mx-auto leading-relaxed">
              Your Stripe payment transaction was aborted. No charges have been deducted from your credit card. You can try upgrading again whenever you are ready.
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center pt-4">
            <button
              onClick={() => router.push("/admin/billing")}
              className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-primary to-gray-500 hover:scale-102 hover:shadow-lg text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="h-4 w-4 animate-spin-slow" /> Retry Checkout Flow
            </button>
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="w-full sm:w-auto px-6 py-2.5 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Dashboard Home
            </button>
          </div>
        </div>
      </div>
    </DashboardWrapper>
  );
}
