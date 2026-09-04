"use client";

import React from "react";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import ClientAdminDashboard from "@/components/dashboard/client-admin/ClientAdminDashboard";

export default function ClientAdminDashboardPage() {
  return (
    <DashboardWrapper>
      <ClientAdminDashboard />
    </DashboardWrapper>
  );
}
