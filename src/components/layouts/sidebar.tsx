"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  User,
  Package,
  Users,
  BarChart3,
  Settings,
  Truck,
  FileText,
  CheckCircle,
  DollarSign,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const NAV_ITEMS: Record<string, NavItem[]> = {
  CUSTOMER: [
    { label: "Dashboard", href: "/customer", icon: LayoutDashboard },
    { label: "New Order", href: "/customer/orders/new", icon: ShoppingCart },
    { label: "My Orders", href: "/customer/orders", icon: Package },
    { label: "Wallet", href: "/customer/wallet", icon: Wallet },
    { label: "Profile", href: "/customer/profile", icon: User },
  ],
  SUPPLIER: [
    { label: "Dashboard", href: "/supplier", icon: LayoutDashboard },
    { label: "Orders", href: "/supplier/orders", icon: Package },
    { label: "Inventory", href: "/supplier/inventory", icon: Package },
    { label: "Payouts", href: "/supplier/payouts", icon: DollarSign },
    { label: "Disputes", href: "/supplier/disputes", icon: AlertTriangle },
    { label: "Profile", href: "/supplier/profile", icon: User },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Orders", href: "/admin/orders", icon: Package },
    { label: "Suppliers", href: "/admin/suppliers", icon: CheckCircle },
    { label: "Finance", href: "/admin/finance", icon: DollarSign },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],
};

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const items = NAV_ITEMS[role] || [];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="text-xl font-bold text-primary">
          Distronergy
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {items.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role.toLowerCase()}` &&
              pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
