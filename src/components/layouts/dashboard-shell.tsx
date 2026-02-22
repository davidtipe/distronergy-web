"use client";

import { useRequireAuth } from "@/lib/auth";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import type { Role } from "@/lib/types";

interface DashboardShellProps {
  children: React.ReactNode;
  role: Role;
}

export function DashboardShell({ children, role }: DashboardShellProps) {
  const { user, loading } = useRequireAuth([role]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role={role} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
