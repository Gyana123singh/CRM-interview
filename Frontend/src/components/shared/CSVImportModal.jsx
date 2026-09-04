import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, FileText, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useImportLeadsCSVMutation } from "@/store/api/leadsApi";
import { useImportDealsCSVMutation } from "@/store/api/dealsApi";
import { useImportCustomersCSVMutation } from "@/store/api/customersApi";

export default function CSVImportModal({ isOpen, onClose, entityType = "Lead", onSuccess }) {
  const [mounted, setMounted] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [parsedRows, setParsedRows] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [activeTab, setActiveTab] = useState("file"); // 'file' | 'paste'

  const [importLeads, { isLoading: isImportingLeads }] = useImportLeadsCSVMutation();
  const [importDeals, { isLoading: isImportingDeals }] = useImportDealsCSVMutation();
  const [importCustomers, { isLoading: isImportingCustomers }] = useImportCustomersCSVMutation();

  const isLoading = isImportingLeads || isImportingDeals || isImportingCustomers;

  useEffect(() => {
    setMounted(true);
  }, []);

  const parseCSVContent = (text) => {
    if (!text || !text.trim()) {
      setParsedRows([]);
      setHeaders([]);
      return;
    }
    const lines = text.trim().split("\n");
    if (lines.length === 0) return;

    const parsedHeaders = lines[0].split(",").map((h) => h.replace(/["\r]/g, "").trim());
    setHeaders(parsedHeaders);

    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.replace(/["\r]/g, "").trim());
      if (values.length > 0 && values.some((v) => v.length > 0)) {
        const rowObj = {};
        parsedHeaders.forEach((h, idx) => {
          rowObj[h] = values[idx] || "";
        });
        rows.push(rowObj);
      }
    }
    setParsedRows(rows);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result || "";
      setCsvText(text);
      parseCSVContent(text);
    };
    reader.readAsText(file);
  };

  const handleTextChange = (e) => {
    const val = e.target.value;
    setCsvText(val);
    parseCSVContent(val);
  };

  const handleImport = async () => {
    if (!csvText || parsedRows.length === 0) {
      toast.error("Please select or paste a valid CSV dataset first.");
      return;
    }

    try {
      let res;
      if (entityType === "Lead") {
        res = await importLeads({ csvText, items: parsedRows }).unwrap();
      } else if (entityType === "Deal") {
        res = await importDeals({ csvText, items: parsedRows }).unwrap();
      } else if (entityType === "Customer") {
        res = await importCustomers({ csvText, items: parsedRows }).unwrap();
      }

      toast.success(res?.message || `Successfully imported ${parsedRows.length} ${entityType} records!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.data?.error?.message || err?.data?.message || "Failed to import CSV data");
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl my-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Import {entityType}s from CSV / Excel</h3>
              <p className="text-xs text-slate-400">Upload a .csv file or paste raw rows directly</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Option Selector */}
          <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab("file")}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "file"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Upload .CSV File
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("paste")}
              className={`flex-1 py-2 px-4 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "paste"
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Paste CSV / Text
            </button>
          </div>

          {activeTab === "file" ? (
            <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500 rounded-xl p-8 text-center bg-slate-950/40 transition-colors">
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
                id="csv-file-input"
              />
              <label htmlFor="csv-file-input" className="cursor-pointer flex flex-col items-center gap-3">
                <div className="p-4 rounded-full bg-slate-800 text-indigo-400 border border-slate-700">
                  <Upload className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-200">
                    {fileName ? fileName : "Click to select a .csv file"}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supports standard CSV exports from Excel, Google Sheets, or CRMs</p>
                </div>
              </label>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Paste raw CSV data below (with header row):</label>
              <textarea
                rows={6}
                value={csvText}
                onChange={handleTextChange}
                placeholder={
                  entityType === "Lead"
                    ? "Name,Phone,Email,Location,Service Interest,Source,Priority,Status\nJohn Doe,+91 9876543210,john@example.com,Mumbai,Web Development,Website,High,New"
                    : entityType === "Deal"
                    ? "Title,Value,Probability,Expected Revenue,Stage\nEnterprise Plan,50000,75,37500,Negotiation"
                    : "Name,Phone,Email,Company Name,Notes\nAcme Corp,+91 9876543210,contact@acme.com,Acme Systems,Key Client"
                }
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}

          {/* Sample Format Info */}
          <div className="p-3.5 bg-indigo-500/5 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Recommended Column Headers: </span>
              {entityType === "Lead" && <span>Name, Phone, Email, Location, Service Interest, Source, Priority, Status, Notes</span>}
              {entityType === "Deal" && <span>Title, Value, Probability, Expected Revenue, Stage, Notes</span>}
              {entityType === "Customer" && <span>Name, Phone, Email, Company Name, Notes</span>}
            </div>
          </div>

          {/* Preview Section */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Found {parsedRows.length} valid row(s) to import
                </span>
              </div>
              <div className="overflow-x-auto max-h-48 border border-slate-800 rounded-xl bg-slate-950">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-semibold sticky top-0">
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} className="px-3 py-2 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {parsedRows.slice(0, 5).map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        {headers.map((h, i) => (
                          <td key={i} className="px-3 py-2 max-w-[150px] truncate">{row[h] || "-"}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 5 && (
                <p className="text-[11px] text-slate-400 text-right">Showing first 5 of {parsedRows.length} rows</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800 bg-slate-950/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isLoading || parsedRows.length === 0}
            onClick={handleImport}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Import {parsedRows.length} {entityType}(s)
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
