"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, ArrowRight, DollarSign, Building, FileText, Loader2 } from "lucide-react";
import { useConvertLeadMutation } from "../../store/api/leadsApi";

const convertSchema = z.object({
  dealTitle: z.string().min(2, "Deal title must be at least 2 characters"),
  dealValue: z.number().min(0, "Value must be positive"),
  dealProbability: z.number().min(0).max(100, "Probability must be 0-100"),
  dealStage: z.enum(["QUALIFICATION", "DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"]),
  companyName: z.string().optional(),
  notes: z.string().optional()
});

export function ConvertLeadModal({ lead, isOpen, onClose, onSuccess }) {
  const [convertLead, { isLoading, error }] = useConvertLeadMutation();

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      dealTitle: `Deal - ${lead?.name || ""}`,
      dealValue: 10000,
      dealProbability: 50,
      dealStage: "QUALIFICATION",
      companyName: lead?.name || "",
      notes: lead?.notes || ""
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    try {
      await convertLead({
        id: lead.id,
        ...data
      }).unwrap();

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Lead conversion failed:", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <ArrowRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Convert Lead to Customer</h3>
              <p className="text-xs text-slate-400">Creates a Customer record & initial Deal in pipeline</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
              {error?.data?.error?.message || "Failed to convert lead. Please try again."}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Deal Title *</label>
            <input
              type="text"
              {...register("dealTitle")}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            {errors.dealTitle && <p className="mt-1 text-xs text-rose-400">{errors.dealTitle.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Deal Value ($) *</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  {...register("dealValue", { valueAsNumber: true })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              {errors.dealValue && <p className="mt-1 text-xs text-rose-400">{errors.dealValue.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Probability (%)</label>
              <input
                type="number"
                {...register("dealProbability", { valueAsNumber: true })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              {errors.dealProbability && (
                <p className="mt-1 text-xs text-rose-400">{errors.dealProbability.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Initial Stage</label>
              <select
                {...register("dealStage")}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              >
                <option value="QUALIFICATION">Qualification</option>
                <option value="DISCOVERY">Discovery</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="WON">Won</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Company Account Name</label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  {...register("companyName")}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Conversion Notes</label>
            <textarea
              rows={2}
              {...register("notes")}
              placeholder="Add key background notes for sales handover..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-all shadow-lg shadow-indigo-600/20"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Execute Transactional Conversion
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
