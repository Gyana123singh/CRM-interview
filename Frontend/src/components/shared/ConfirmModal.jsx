"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Delete",
  cancelText = "Cancel",
  type = "danger",
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const typeStyles = {
    danger: {
      iconBg: "bg-rose-100 dark:bg-rose-950/40 text-rose-500",
      btnBg: "bg-rose-600 hover:bg-rose-500",
    },
    warning: {
      iconBg: "bg-amber-100 dark:bg-amber-950/40 text-amber-500",
      btnBg: "bg-amber-600 hover:bg-amber-500",
    },
    info: {
      iconBg: "bg-blue-100 dark:bg-blue-950/40 text-blue-500",
      btnBg: "bg-blue-600 hover:bg-blue-500",
    },
  };

  const activeStyle = typeStyles[type];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity" 
        onClick={onCancel}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 z-10 select-none">
        
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${activeStyle.iconBg}`}>
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-1">
            <h2 className="text-sm font-black text-slate-900 dark:text-slate-50">{title}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              {message}
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow transition ${activeStyle.btnBg}`}
          >
            {confirmText}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
}
