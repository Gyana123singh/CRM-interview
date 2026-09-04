"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, CreditCard, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function UpgradeCompanyPlanModal({
  isOpen,
  onClose,
  onUpgrade,
  company,
  plans = []
}) {
  const [selectedPlan, setSelectedPlan] = useState("");
  const [reference, setReference] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && company) {
      setSelectedPlan(company.plan || "");
      setReference("");
    }
  }, [isOpen, company]);

  if (!isOpen || !company || !mounted) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlan) {
      toast.warning("Please select a plan to upgrade.");
      return;
    }

    setLoading(true);
    try {
      await onUpgrade(company.id, selectedPlan, reference);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-orange-500" /> Manual Plan Upgrade
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs font-semibold">
          <div className="space-y-1 bg-slate-50 dark:bg-slate-950/30 p-3.5 border border-slate-100 dark:border-slate-800/50 rounded-xl leading-normal">
            <div className="flex justify-between items-center text-slate-400">
              <span className="uppercase text-[9px] font-bold tracking-wider">Company</span>
              <span className="font-bold text-slate-700 dark:text-slate-200">{company.name}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400 mt-2">
              <span className="uppercase text-[9px] font-bold tracking-wider">Current Plan</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {company.plan || "None"}
              </span>
            </div>
          </div>

          {/* New Plan Dropdown */}
          <div className="space-y-1">
            <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
              Select Upgraded Tier <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPlan}
              onChange={(e) => setSelectedPlan(e.target.value)}
              required
              className="w-full px-3 py-2.5 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/20 outline-none cursor-pointer font-bold"
            >
              <option value="" disabled>Choose plan...</option>
              {plans.map((p) => (
                <option key={p.id} value={p.name}>{p.name} (₹{p.priceMonthly?.toLocaleString()}/mo)</option>
              ))}
            </select>
          </div>

          {/* Payment Reference Memo */}
          <div className="space-y-1">
            <label className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px]">
              Payment Reference / Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Paid cash hand-to-hand / Bank Tx #12345"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              className="w-full px-3 py-2 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-orange-500/20 outline-none font-bold"
            />
          </div>

          <p className="flex items-center gap-1 text-[10px] text-slate-400 mt-2 font-semibold">
            <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0" />
            Plan updates propagate to the tenant instantly.
          </p>

          {/* Footer Actions */}
          <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:scale-102 hover:shadow-lg text-white rounded-xl font-bold shadow-md transition flex items-center justify-center gap-1.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Upgrading...
                </>
              ) : (
                "Apply Upgrade"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
