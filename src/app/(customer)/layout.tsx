"use client";

import { DashboardShell } from "@/components/layouts/dashboard-shell";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="CUSTOMER">{children}</DashboardShell>;
}
