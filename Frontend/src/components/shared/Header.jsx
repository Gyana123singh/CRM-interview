"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { logout, toggleMobileSidebar, setActiveRole } from "@/store/slices/authSlice";
import { useGetNotificationsQuery, useMarkNotificationAsReadMutation, useMarkAllNotificationsAsReadMutation } from "@/store/api/notificationsApi";
import { Menu, Moon, Sun, Bell, Search, ShieldAlert, MonitorPlay, Check, X, CheckCheck } from "lucide-react";
import { toast } from "react-toastify";

export default function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const activeRole = useSelector((state) => state.auth.activeRole);
  const user = useSelector((state) => state.auth.user);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [showNotifications, setShowNotifications] = React.useState(false);

  const { data: notificationsData } = useGetNotificationsQuery(undefined, { pollingInterval: 15000 });
  const [markRead] = useMarkNotificationAsReadMutation();
  const [markAllRead] = useMarkAllNotificationsAsReadMutation();

  const notifications = notificationsData?.data?.notifications || [];
  const unreadCount = notificationsData?.data?.unreadCount || 0;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleRoleChange = (role) => {
    dispatch(setActiveRole(role));
    toast.info(`Switched sandbox role view to [${role.replace("-", " ").toUpperCase()}]`);
  };

  return (
    <header className="sticky top-0 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between px-6 z-20">
      {/* Mobile Hamburger menu */}
      <button
        onClick={() => dispatch(toggleMobileSidebar())}
        suppressHydrationWarning
        className="p-2 -ml-2 mr-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 lg:hidden transition"
        title="Toggle Menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Left Search */}
      <div className="flex items-center gap-3 w-96 relative max-sm:hidden">
        <Search className="absolute left-3 h-4 w-4 text-slate-400" />
        <input
          type="text"
          suppressHydrationWarning
          placeholder="Global search leads, deals, customers, activities..."
          className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-6">
        {/* Dynamic Role Quick-Switcher Sandbox Panel (Admin Only) */}
        {(user?.role === "admin" || user?.role === "client-admin" || user?.role === "super-admin") && (
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] uppercase font-bold text-slate-400 px-2 flex items-center gap-1">
              <MonitorPlay className="h-3 w-3 text-primary" /> Role:
            </span>
            {[
              { key: "admin", label: "Admin" },
              { key: "sales-manager", label: "Sales Mgr" },
              { key: "sales-executive", label: "Sales Exec" }
            ].map((r) => (
              <button
                key={r.key}
                onClick={() => handleRoleChange(r.key)}
                suppressHydrationWarning
                className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase transition ${
                  activeRole === r.key
                    ? "bg-gradient-to-r from-primary to-gray-500 text-white shadow-md shadow-purple-600/10"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          suppressHydrationWarning
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
          aria-label="Toggle theme"
        >
          {mounted && theme === "dark" ? <Sun className="h-4.5 w-4.5 text-amber-400" /> : <Moon className="h-4.5 w-4.5 text-slate-600" />}
        </button>

        {/* Notifications Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            suppressHydrationWarning
            className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition"
          >
            <Bell className="h-4.5 w-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 h-4 min-w-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-12 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-40 p-4 space-y-3 animate-fade-in">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-200">CRM Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllRead()}
                      className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1"
                    >
                      <CheckCheck className="h-3 w-3" /> Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 text-center py-4 text-xs font-medium">No recent notifications</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`p-2.5 rounded-xl border transition cursor-pointer ${
                          n.isRead
                            ? "bg-slate-50/50 dark:bg-slate-950/20 border-slate-100 dark:border-slate-800 text-slate-500"
                            : "bg-primary/5 border-primary/20 text-slate-900 dark:text-slate-100 font-medium"
                        }`}
                      >
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase text-primary mb-0.5">
                          <span>{n.title}</span>
                          <span className="text-slate-400">{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-xs leading-tight">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Company Title */}
        <div className="flex flex-col text-right">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {(!user?.companyName || user?.companyName === "Infotattva Business Solutions" || user?.companyName === "Infotattva Portal") ? "CRM Sales Management System" : user.companyName}
          </span>
          <span className="text-[10px] text-slate-400 capitalize font-medium">
            {activeRole === "client-admin" || activeRole === "admin" || activeRole === "super-admin" ? "Admin" : activeRole}
          </span>
        </div>
      </div>
    </header>
  );
}
