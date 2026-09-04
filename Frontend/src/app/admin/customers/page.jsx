"use client";

import React, { useState, useEffect } from "react";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import { toast } from "react-toastify";
import { Users, Plus, Download, Sparkles, Building, Mail, Phone } from "lucide-react";
import { useGetCustomersQuery } from "@/store/api/customersApi";
import { DataTable } from "@/components/ui/DataTable";

export default function CustomersPage() {
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data, isLoading } = useGetCustomersQuery(
    { page, limit: 10, search: search || undefined },
    { skip: !mounted }
  );

  const customers = data?.data?.items || [];
  const pagination = data?.data?.pagination;

  const columns = [
    {
      header: "Customer Name",
      cell: (customer) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center text-sm uppercase border border-purple-500/20">
            {customer.name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-slate-100">{customer.name}</span>
            {customer.companyName && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Building className="w-3 h-3 text-slate-500" /> {customer.companyName}
              </span>
            )}
          </div>
        </div>
      )
    },
    {
      header: "Contact Info",
      cell: (customer) => (
        <div className="flex flex-col text-xs text-slate-300 gap-0.5">
          <span className="flex items-center gap-1.5"><Phone className="w-3 h-3 text-slate-400" /> {customer.phone}</span>
          {customer.email && <span className="flex items-center gap-1.5 text-slate-400"><Mail className="w-3 h-3 text-slate-400" /> {customer.email}</span>}
        </div>
      )
    },
    {
      header: "Converted Lead Source",
      cell: (customer) => (
        <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
          {customer.lead?.source || "Direct Customer"}
        </span>
      )
    },
    {
      header: "Linked Deals",
      cell: (customer) => (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="font-bold text-indigo-400">{customer.deals?.length || 0} deals</span>
        </div>
      )
    },
    {
      header: "Account Created",
      cell: (customer) => (
        <span className="text-xs text-slate-400">
          {new Date(customer.createdAt).toLocaleDateString()}
        </span>
      )
    }
  ];

  if (!mounted) return null;

  return (
    <DashboardWrapper>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              Customer Accounts <Users className="h-5 w-5 text-purple-400" />
            </h1>
            <p className="text-sm text-slate-400">
              View converted accounts, linked deal revenue history, and multi-tenant customer records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/customers/export`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              <Download className="h-4 w-4" /> Export CSV
            </a>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={customers}
          isLoading={isLoading}
          pagination={pagination}
          onPageChange={(p) => setPage(p)}
          searchValue={search}
          onSearchChange={(s) => {
            setSearch(s);
            setPage(1);
          }}
          searchPlaceholder="Search customers by name, company, email..."
          emptyMessage="No customer accounts found."
        />
      </div>
    </DashboardWrapper>
  );
}
