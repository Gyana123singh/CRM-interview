import React from "react";
import Providers from "@/components/shared/Providers";
import "@/styles/globals.css";

export const metadata = {
  title: "Infotattva AI Automation CRM",
  description: "Enterprise AI-powered Lead Management, Customer Communication, & WhatsApp Workflow Automation.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
