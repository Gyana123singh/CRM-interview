"use client";

import React from "react";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import SuperAdminDashboard from "@/components/dashboard/super-admin/SuperAdminDashboard";

export default function SuperAdminDashboardPage() {
  return (
    <DashboardWrapper>
      <SuperAdminDashboard />
    </DashboardWrapper>
  );
}
