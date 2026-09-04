"use client";

import React from "react";
import { ChevronLeft, ChevronRight, Search, Loader2, Database } from "lucide-react";

export function DataTable({
  columns,
  data,
  isLoading = false,
  pagination,
  onPageChange,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search records...",
  actionButton,
  emptyMessage = "No records found."
}) {
  return (
    <div className="w-full space-y-4">
      {/* Header controls: Search input & primary action button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
        {onSearchChange !== undefined && (
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchValue || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>
        )}
        {actionButton && <div className="flex items-center gap-2">{actionButton}</div>}
      </div>

      {/* Main Table / Mobile Card Layout */}
      <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40 backdrop-blur-md shadow-2xl">
        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} className="px-5 py-3.5">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rIdx) => (
                  <tr key={rIdx} className="animate-pulse">
                    {columns.map((_, cIdx) => (
                      <td key={cIdx} className="px-5 py-4">
                        <div className="h-4 bg-slate-800/80 rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Database className="w-8 h-8 text-slate-600 mb-1" />
                      <p className="text-sm font-medium">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row, rIdx) => (
                  <tr
                    key={row.id ? String(row.id) : rIdx}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {columns.map((col, cIdx) => (
                      <td key={cIdx} className="px-5 py-4 font-normal text-slate-200">
                        {col.cell
                          ? col.cell(row)
                          : col.accessorKey
                          ? String(row[col.accessorKey] ?? "-")
                          : "-"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Responsive Cards */}
        <div className="md:hidden divide-y divide-slate-800/60">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="p-4 space-y-3 animate-pulse">
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                <div className="h-3 bg-slate-800/60 rounded w-3/4"></div>
              </div>
            ))
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-slate-500 flex flex-col items-center">
              <Database className="w-8 h-8 text-slate-600 mb-2" />
              <p className="text-sm">{emptyMessage}</p>
            </div>
          ) : (
            data.map((row, rIdx) => (
              <div key={row.id ? String(row.id) : rIdx} className="p-4 space-y-2 bg-slate-900/30">
                {columns.map((col, cIdx) => (
                  <div key={cIdx} className="flex justify-between items-start gap-2 text-xs">
                    <span className="font-medium text-slate-400 uppercase tracking-wider">{col.header}:</span>
                    <span className="text-slate-200 text-right">
                      {col.cell
                        ? col.cell(row)
                        : col.accessorKey
                        ? String(row[col.accessorKey] ?? "-")
                        : "-"}
                    </span>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>

        {/* Server-Side Pagination Bar */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-400">
            <div>
              Showing <span className="font-semibold text-slate-200">{(pagination.page - 1) * pagination.limit + 1}</span> to{" "}
              <span className="font-semibold text-slate-200">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-semibold text-slate-200">{pagination.total}</span> entries
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.page <= 1 || isLoading}
                onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-slate-300">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages || isLoading}
                onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
