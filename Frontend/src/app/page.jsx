"use client";

import React from "react";
import { useSelector } from "react-redux";
import DashboardWrapper from "@/components/shared/DashboardWrapper";
import ClientAdminDashboard from "@/components/dashboard/admin/ClientAdminDashboard";
import TeamDashboard from "@/components/dashboard/team/TeamDashboard";
import LoginPage from "./auth/login/page";

export default function HomePage() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const activeRole = useSelector((state) => state.auth.activeRole);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderDashboard = () => {
    switch (activeRole) {
      case "admin":
      case "sales-manager":
        return <ClientAdminDashboard />;
      case "sales-executive":
      case "team":
        return <TeamDashboard />;
      default:
        return <ClientAdminDashboard />;
    }
  };

  return <DashboardWrapper>{renderDashboard()}</DashboardWrapper>;
}
