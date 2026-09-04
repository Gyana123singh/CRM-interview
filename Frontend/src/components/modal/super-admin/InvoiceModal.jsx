"use client";

import React from "react";
import { X, FileText, Calendar, Download, Printer } from "lucide-react";

// SmartHR brand logo SVG
function SmartHRLogo() {
  return (
    <div className="flex items-center gap-2">
      <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="17" cy="17" r="17" fill="#FFF3ED" />
        <circle cx="17" cy="17" r="11" fill="none" stroke="#F97316" strokeWidth="2.5" />
        <circle cx="17" cy="17" r="5" fill="#F97316" />
        <path d="M17 6 L17 11" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M17 23 L17 28" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M6 17 L11 17" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M23 17 L28 17" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
      <span className="text-lg font-black tracking-wide">
        Smart<span className="text-orange-500">HR</span>
      </span>
    </div>
  );
}

export default function InvoiceModal({ isOpen, onClose, invoice }) {
  if (!isOpen || !invoice) return null;

  const subtotal = invoice.amount;
  const tax = invoice.tax ?? 0;
  const total = subtotal + tax;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl relative my-8 animate-fade-in">

        {/* Modal Top Action Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Invoice Preview</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition"
            >
              <Printer className="h-3.5 w-3.5" /> Print
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition shadow shadow-orange-500/10"
            >
              <Download className="h-3.5 w-3.5" /> Download
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8 space-y-6 text-sm text-slate-700 dark:text-slate-300" id="invoice-print-area">

          {/* ── Header Row: Logo + Invoice Details ── */}
          <div className="flex items-start justify-between">
            <SmartHRLogo />
            <div className="text-right space-y-1">
              <p className="text-base font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">Invoice</p>
              <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span className="font-bold">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Issue date : <strong className="text-slate-700 dark:text-slate-200">{invoice.issueDate}</strong></span>
              </div>
              <div className="flex items-center justify-end gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                <span>Due date : <strong className="text-slate-700 dark:text-slate-200">{invoice.dueDate}</strong></span>
              </div>
            </div>
          </div>

          {/* ── From / To ── */}
          <div className="grid grid-cols-2 gap-8 pt-2">
            <div className="space-y-1.5">
              <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">Invoice From :</p>
              <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <p className="font-bold text-slate-700 dark:text-slate-200">SmartHR</p>
                <p>367 Hillcrest Lane, Irvine, California, United States</p>
                <p>smarthr@example.com</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">Invoice To :</p>
              <div className="space-y-0.5 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <p className="font-bold text-slate-700 dark:text-slate-200">{invoice.subscriberName}</p>
                <p>{invoice.subscriberAddress}</p>
                <p>{invoice.subscriberEmail}</p>
              </div>
            </div>
          </div>

          {/* ── Plan Table ── */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left px-4 py-3 font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px]">Plan</th>
                  <th className="text-left px-4 py-3 font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px]">Billing Cycle</th>
                  <th className="text-left px-4 py-3 font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px]">Created Date</th>
                  <th className="text-left px-4 py-3 font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px]">Expiring On</th>
                  <th className="text-left px-4 py-3 font-black text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px]">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{invoice.plan}</td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{invoice.billingCycle}</td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{invoice.createdDate}</td>
                  <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{invoice.expiringOn}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-700 dark:text-slate-200">${invoice.amount.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── Payment Info + Totals ── */}
          <div className="flex gap-8">
            {/* Payment Info */}
            <div className="flex-1 space-y-2">
              <p className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">Payment info:</p>
              <div className="space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                <p>{invoice.paymentMethod} - {invoice.paymentLast4 ? `123***********${invoice.paymentLast4}` : "N/A"}</p>
                <p className="flex items-center gap-2">
                  Amount{" "}
                  <span className="font-black text-slate-800 dark:text-slate-100 text-sm">${invoice.amount.toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* Totals */}
            <div className="w-48 space-y-2 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Sub Total</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Tax</span>
                <span className="font-bold text-slate-700 dark:text-slate-200">${tax.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 bg-slate-50 dark:bg-slate-800/40 px-2 rounded-xl">
                <span className="font-black text-slate-800 dark:text-slate-100">Total</span>
                <span className="font-black text-slate-800 dark:text-slate-100">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* ── Terms & Conditions ── */}
          <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/60 dark:bg-slate-800/20">
            <p className="text-xs font-black text-slate-800 dark:text-slate-100 mb-2.5 uppercase tracking-wide">Terms &amp; Conditions:</p>
            <ul className="space-y-1.5 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                All payments must be made according to the agreed schedule. Late payments may incur additional fees.
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0" />
                We are not liable for any indirect, incidental, or consequential damages, including loss of profits, revenue, or data.
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}
