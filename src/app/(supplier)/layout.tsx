"use client";

import { DashboardShell } from "@/components/layouts/dashboard-shell";

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="SUPPLIER">{children}</DashboardShell>;
}
