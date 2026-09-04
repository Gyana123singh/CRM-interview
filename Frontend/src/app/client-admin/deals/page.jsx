"use client";

import React, { useState, useEffect } from "react";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import { toast } from "react-toastify";
import {
  Plus,
  Download,
  DollarSign,
  TrendingUp,
  Award,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Loader2,
  Calendar,
  X,
  Calculator
} from "lucide-react";
import {
  useGetDealsQuery,
  useUpdateDealStageMutation,
  useCreateDealMutation
} from "@/store/api/dealsApi";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const STAGES = [
  { key: "QUALIFICATION", title: "Qualification", defaultProb: 20, color: "border-blue-500/40 text-blue-400 bg-blue-500/10" },
  { key: "DISCOVERY", title: "Discovery", defaultProb: 40, color: "border-purple-500/40 text-purple-400 bg-purple-500/10" },
  { key: "PROPOSAL", title: "Proposal", defaultProb: 60, color: "border-amber-500/40 text-amber-400 bg-amber-500/10" },
  { key: "NEGOTIATION", title: "Negotiation", defaultProb: 80, color: "border-indigo-500/40 text-indigo-400 bg-indigo-500/10" },
  { key: "WON", title: "Won", defaultProb: 100, color: "border-emerald-500/40 text-emerald-400 bg-emerald-500/10" },
  { key: "LOST", title: "Lost", defaultProb: 0, color: "border-rose-500/40 text-rose-400 bg-rose-500/10" }
];

const createDealSchema = z.object({
  title: z.string().min(2, "Title is required"),
  dealValue: z.number().min(0, "Value must be >= 0"),
  probability: z.number().min(0).max(100, "Probability must be 0-100"),
  stage: z.enum(["QUALIFICATION", "DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
  expectedClosingDate: z.string().optional(),
  notes: z.string().optional()
});

export default function ClientAdminDealsPage() {
  const [mounted, setMounted] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stageModalDeal, setStageModalDeal] = useState(null);
  const [targetStage, setTargetStage] = useState("QUALIFICATION");
  const [lossReason, setLossReason] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading, refetch } = useGetDealsQuery({}, { skip: !mounted });
  const [updateDealStage, { isLoading: isUpdatingStage }] = useUpdateDealStageMutation();
  const [createDeal, { isLoading: isCreating }] = useCreateDealMutation();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(createDealSchema),
    defaultValues: {
      title: "",
      dealValue: 25000,
      probability: 20,
      stage: "QUALIFICATION",
      expectedClosingDate: "",
      notes: ""
    }
  });

  const watchValue = useWatch({ control, name: "dealValue" }) || 0;
  const watchProb = useWatch({ control, name: "probability" }) || 0;
  const watchStage = useWatch({ control, name: "stage" });

  useEffect(() => {
    const stageObj = STAGES.find((s) => s.key === watchStage);
    if (stageObj) {
      setValue("probability", stageObj.defaultProb);
    }
  }, [watchStage, setValue]);

  const deals = data?.data?.items || [];

  // Summary Metrics
  const totalValue = deals.reduce((acc, d) => acc + (d.dealValue || 0), 0);
  const totalExpectedRevenue = deals.reduce((acc, d) => acc + (d.expectedRevenue || 0), 0);
  const wonDealsValue = deals
    .filter((d) => d.stage && String(d.stage).toUpperCase() === "WON")
    .reduce((acc, d) => acc + (d.dealValue || 0), 0);
  const lostDealsCount = deals.filter(
    (d) => d.stage && String(d.stage).toUpperCase() === "LOST"
  ).length;

  const handleCreateSubmit = async (formData) => {
    try {
      await createDeal(formData).unwrap();
      toast.success(`Deal "${formData.title}" created successfully!`);
      reset();
      setShowCreateModal(false);
      refetch();
    } catch (err) {
      toast.error(err?.data?.error?.message || err?.data?.error || "Failed to create deal");
    }
  };

  const handleStageUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!stageModalDeal) return;

    if (targetStage === "LOST" && !lossReason.trim()) {
      toast.error("Loss reason is strictly required when setting a deal to LOST.");
      return;
    }

    try {
      await updateDealStage({
        id: stageModalDeal.id,
        stage: targetStage,
        lossReason: targetStage === "LOST" ? lossReason : undefined
      }).unwrap();

      toast.success(`Deal stage updated to ${targetStage}`);
      setStageModalDeal(null);
      setLossReason("");
      refetch();
    } catch (err) {
      toast.error(err?.data?.error?.message || err?.data?.error || "Failed to update stage");
    }
  };

  if (!mounted) return null;

  const calculatedExpRev = Math.round(((watchValue * watchProb) / 100) * 100) / 100;

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Deal Pipeline & Revenue Intelligence <Sparkles className="h-5 w-5 text-indigo-400 shrink-0" />
            </h1>
            <p className="text-sm text-slate-400">
              Track sales deals across stages, calculate expected revenue (Deal Value × Probability), enforce stage business rules, and log history.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/deals/export`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 h-10 px-3.5 border border-slate-800 bg-slate-900/80 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition whitespace-nowrap shrink-0"
            >
              <Download className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="whitespace-nowrap">Export CSV</span>
            </a>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-1.5 h-10 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all whitespace-nowrap shrink-0"
            >
              <Plus className="h-4 w-4 shrink-0" />
              <span className="whitespace-nowrap">Create New Deal</span>
            </button>
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Total Pipeline Value</span>
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
            <p className="text-xl font-bold text-white">${totalValue.toLocaleString()}</p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Expected Weighted Revenue</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-xl font-bold text-emerald-400">${totalExpectedRevenue.toLocaleString()}</p>
            <span className="text-[10px] text-slate-500">Auto: Deal Value × Prob %</span>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Won Revenue</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-xl font-bold text-amber-400">${wonDealsValue.toLocaleString()}</p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Lost Deals</span>
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <p className="text-xl font-bold text-rose-400">{lostDealsCount} deals</p>
          </div>
        </div>

        {/* Kanban Board Columns */}
        {isLoading ? (
          <div className="flex items-center justify-center p-12 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading pipeline deals...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 overflow-x-auto pb-4">
            {STAGES.map((col) => {
              const stageDeals = deals.filter(
                (d) => d.stage && String(d.stage).toUpperCase() === col.key.toUpperCase()
              );
              const stageValue = stageDeals.reduce((sum, d) => sum + (d.dealValue || 0), 0);

              return (
                <div
                  key={col.key}
                  className="flex flex-col bg-slate-900/40 border border-slate-800 rounded-xl p-3 min-w-[220px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${col.color}`}>
                        {col.title}
                      </span>
                      <span className="text-xs font-semibold text-slate-400">{stageDeals.length}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-300">${stageValue.toLocaleString()}</span>
                  </div>

                  {/* Cards */}
                  <div className="flex-1 space-y-3 min-h-[300px]">
                    {stageDeals.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-600 border border-dashed border-slate-800/80 rounded-lg">
                        No deals
                      </div>
                    ) : (
                      stageDeals.map((deal) => (
                        <div
                          key={deal.id}
                          className="p-3 bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 rounded-lg space-y-2 transition-all group"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-semibold text-slate-100 leading-snug">{deal.title}</h4>
                            <button
                              onClick={() => {
                                setStageModalDeal(deal);
                                setTargetStage(String(deal.stage).toUpperCase());
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-800 text-slate-400 rounded transition-all"
                              title="Update Stage & Rules"
                            >
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between text-xs text-slate-400">
                            <span className="font-bold text-slate-200">${deal.dealValue?.toLocaleString()}</span>
                            <span className="text-[10px] text-indigo-400">Prob: {deal.probability}%</span>
                          </div>

                          <div className="text-[10px] text-emerald-400 font-medium">
                            Exp Rev: ${Number(deal.expectedRevenue || (deal.dealValue * deal.probability) / 100).toLocaleString()}
                          </div>

                          {deal.expectedClosingDate && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-500 shrink-0" />
                              Close: {new Date(deal.expectedClosingDate).toLocaleDateString()}
                            </div>
                          )}

                          {deal.customer && (
                            <div className="text-[10px] text-slate-400 truncate">
                              Acc: <span className="text-slate-300 font-medium">{deal.customer.name}</span>
                            </div>
                          )}

                          {deal.lossReason && (
                            <div className="text-[10px] text-rose-400 italic bg-rose-500/10 p-1.5 rounded border border-rose-500/20">
                              Reason: {deal.lossReason}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Change Stage Dialog with Rule Enforcement */}
        {stageModalDeal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-semibold">Update Stage for "{stageModalDeal.title}"</h3>
                <button onClick={() => setStageModalDeal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleStageUpdateSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Select Stage Transition *</label>
                  <select
                    value={targetStage}
                    onChange={(e) => setTargetStage(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                  >
                    <option value="QUALIFICATION">Qualification (20% Prob)</option>
                    <option value="DISCOVERY">Discovery (40% Prob)</option>
                    <option value="PROPOSAL">Proposal (60% Prob)</option>
                    <option value="NEGOTIATION">Negotiation (80% Prob)</option>
                    <option value="WON">Won (100% Prob - Close Deal)</option>
                    <option value="LOST">Lost (0% Prob - Require Reason)</option>
                  </select>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calculator className="w-3.5 h-3.5 text-indigo-400" /> Dynamic Expected Revenue Rule:
                  </div>
                  <div className="text-xs font-semibold text-emerald-400">
                    Deal Value (${stageModalDeal.dealValue?.toLocaleString()}) × Prob % = Expected Revenue
                  </div>
                </div>

                {targetStage === "LOST" && (
                  <div>
                    <label className="block text-rose-400 mb-1 font-medium">Loss Reason * (Mandatory Closure Rule)</label>
                    <textarea
                      required
                      rows={3}
                      value={lossReason}
                      onChange={(e) => setLossReason(e.target.value)}
                      placeholder="Specify exact reason for deal loss (e.g. competitor pricing, budget cuts)..."
                      className="w-full px-3 py-2 bg-slate-950 border border-rose-500/40 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setStageModalDeal(null)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingStage}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                  >
                    {isUpdatingStage ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Stage"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Create Deal Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-slate-100">
              <h3 className="text-base font-semibold text-white">Create New Deal</h3>
              <p className="text-xs text-slate-400 mt-1">Register a new sales opportunity into the pipeline.</p>

              <form onSubmit={handleSubmit(handleCreateSubmit)} className="mt-4 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Deal Title *</label>
                  <input
                    type="text"
                    {...register("title")}
                    placeholder="e.g. Enterprise Cloud License Contract"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                  />
                  {errors.title && <p className="mt-1 text-rose-400">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Deal Value ($) *</label>
                    <input
                      type="number"
                      {...register("dealValue", { valueAsNumber: true })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Probability (%) *</label>
                    <input
                      type="number"
                      {...register("probability", { valueAsNumber: true })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-medium">Expected Revenue (Auto):</span>
                  <span className="font-bold text-emerald-400 text-sm">${calculatedExpRev.toLocaleString()}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Pipeline Stage</label>
                    <select
                      {...register("stage")}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                    >
                      <option value="QUALIFICATION">Qualification (20%)</option>
                      <option value="DISCOVERY">Discovery (40%)</option>
                      <option value="PROPOSAL">Proposal (60%)</option>
                      <option value="NEGOTIATION">Negotiation (80%)</option>
                      <option value="WON">Won (100%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Expected Closing Date</label>
                    <input
                      type="date"
                      {...register("expectedClosingDate")}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Notes</label>
                  <textarea
                    rows={2}
                    {...register("notes")}
                    placeholder="Add opportunity details..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold"
                  >
                    Create Deal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardWrapper>
  );
}
