import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, ArrowRight, DollarSign, Building, Loader2, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import { useConvertLeadMutation } from "../../store/api/leadsApi";

const convertSchema = z.object({
  dealTitle: z
    .string()
    .min(1, "Deal title is required")
    .min(2, "Deal title must be at least 2 characters")
    .max(120, "Deal title cannot exceed 120 characters"),
  dealValue: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
      z.number({ invalid_type_error: "Deal value must be a valid number" })
        .min(0, "Deal value must be $0 or greater")
    ),
  dealProbability: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined || isNaN(Number(val)) ? undefined : Number(val)),
      z.number({ invalid_type_error: "Probability must be a valid number" })
        .min(0, "Probability must be between 0% and 100%")
        .max(100, "Probability must be between 0% and 100%")
    ),
  dealStage: z.enum(["QUALIFICATION", "DISCOVERY", "PROPOSAL", "NEGOTIATION", "WON", "LOST"], {
    errorMap: () => ({ message: "Please select a valid stage" })
  }),
  companyName: z
    .string()
    .min(1, "Company Account Name is required")
    .min(2, "Company Account Name must be at least 2 characters")
    .max(120, "Company Account Name cannot exceed 120 characters"),
  notes: z.string().max(500, "Notes cannot exceed 500 characters").optional()
});

export function ConvertLeadModal({ lead, isOpen, onClose, onSuccess }) {
  const [convertLead, { isLoading, error }] = useConvertLeadMutation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(convertSchema),
    defaultValues: {
      dealTitle: lead ? `Deal - ${lead.name || ""}` : "",
      dealValue: 10000,
      dealProbability: 50,
      dealStage: "QUALIFICATION",
      companyName: lead?.name || "",
      notes: lead?.notes || ""
    }
  });

  useEffect(() => {
    if (lead && isOpen) {
      reset({
        dealTitle: `Deal - ${lead.name || ""}`,
        dealValue: 10000,
        dealProbability: 50,
        dealStage: "QUALIFICATION",
        companyName: lead.name || "",
        notes: lead.notes || ""
      });
    }
  }, [lead, isOpen, reset]);

  if (!isOpen || !mounted) return null;

  const onSubmit = async (data) => {
    try {
      await convertLead({
        id: lead.id || lead._id,
        ...data
      }).unwrap();

      toast.success(`Lead "${lead?.name}" converted successfully! Customer account & Deal created.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.data?.error?.message || err?.data?.error || "Failed to convert lead. Please check validation requirements.");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
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
            <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error?.data?.error?.message || error?.data?.error || "Failed to convert lead. Please try again."}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Deal Title <span className="text-rose-400">*</span></span>
              {errors.dealTitle && (
                <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.dealTitle.message}
                </span>
              )}
            </label>
            <input
              type="text"
              {...register("dealTitle")}
              placeholder="e.g. Enterprise Deal"
              className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm transition-all focus:outline-none ${
                errors.dealTitle
                  ? "border-rose-500/60 text-rose-200 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10"
                  : "border-slate-800 text-slate-100 focus:ring-2 focus:ring-indigo-500/50"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Deal Value ($) <span className="text-rose-400">*</span></span>
                {errors.dealValue && (
                  <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" /> {errors.dealValue.message}
                  </span>
                )}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="number"
                  step="any"
                  {...register("dealValue", { valueAsNumber: true })}
                  placeholder="10000"
                  className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-lg text-sm transition-all focus:outline-none ${
                    errors.dealValue
                      ? "border-rose-500/60 text-rose-200 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10"
                      : "border-slate-800 text-slate-100 focus:ring-2 focus:ring-indigo-500/50"
                  }`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Probability (%) <span className="text-rose-400">*</span></span>
                {errors.dealProbability && (
                  <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" /> {errors.dealProbability.message}
                  </span>
                )}
              </label>
              <input
                type="number"
                min="0"
                max="100"
                {...register("dealProbability", { valueAsNumber: true })}
                placeholder="50"
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm transition-all focus:outline-none ${
                  errors.dealProbability
                    ? "border-rose-500/60 text-rose-200 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10"
                    : "border-slate-800 text-slate-100 focus:ring-2 focus:ring-indigo-500/50"
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Initial Stage</span>
                {errors.dealStage && (
                  <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" /> {errors.dealStage.message}
                  </span>
                )}
              </label>
              <select
                {...register("dealStage")}
                className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm transition-all focus:outline-none ${
                  errors.dealStage
                    ? "border-rose-500/60 text-rose-200 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10"
                    : "border-slate-800 text-slate-100 focus:ring-2 focus:ring-indigo-500/50"
                }`}
              >
                <option value="QUALIFICATION">Qualification</option>
                <option value="DISCOVERY">Discovery</option>
                <option value="PROPOSAL">Proposal</option>
                <option value="NEGOTIATION">Negotiation</option>
                <option value="WON">Won</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>Company Account Name <span className="text-rose-400">*</span></span>
                {errors.companyName && (
                  <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" /> {errors.companyName.message}
                  </span>
                )}
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  {...register("companyName")}
                  placeholder="e.g. Acme Corp"
                  className={`w-full pl-9 pr-3 py-2 bg-slate-950 border rounded-lg text-sm transition-all focus:outline-none ${
                    errors.companyName
                      ? "border-rose-500/60 text-rose-200 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10"
                      : "border-slate-800 text-slate-100 focus:ring-2 focus:ring-indigo-500/50"
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
              <span>Conversion Notes</span>
              {errors.notes && (
                <span className="text-[11px] font-medium text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-rose-400 shrink-0" /> {errors.notes.message}
                </span>
              )}
            </label>
            <textarea
              rows={2}
              {...register("notes")}
              placeholder="Add key background notes for sales handover..."
              className={`w-full px-3 py-2 bg-slate-950 border rounded-lg text-sm transition-all focus:outline-none ${
                errors.notes
                  ? "border-rose-500/60 text-rose-200 focus:ring-2 focus:ring-rose-500/30 bg-rose-950/10"
                  : "border-slate-800 text-slate-100 focus:ring-2 focus:ring-indigo-500/50"
              }`}
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
    </div>,
    document.body
  );
}
