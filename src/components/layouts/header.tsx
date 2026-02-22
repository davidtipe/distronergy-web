"use client";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { type NavItem } from "./sidebar";

// Mobile nav items imported from sidebar config
const NAV_ITEMS: Record<string, NavItem[]> = {
  CUSTOMER: [
    { label: "Dashboard", href: "/customer", icon: Menu },
    { label: "New Order", href: "/customer/orders/new", icon: Menu },
    { label: "My Orders", href: "/customer/orders", icon: Menu },
    { label: "Wallet", href: "/customer/wallet", icon: Menu },
    { label: "Profile", href: "/customer/profile", icon: Menu },
  ],
  SUPPLIER: [
    { label: "Dashboard", href: "/supplier", icon: Menu },
    { label: "Orders", href: "/supplier/orders", icon: Menu },
    { label: "Payouts", href: "/supplier/payouts", icon: Menu },
    { label: "Disputes", href: "/supplier/disputes", icon: Menu },
    { label: "Profile", href: "/supplier/profile", icon: Menu },
  ],
  ADMIN: [
    { label: "Dashboard", href: "/admin", icon: Menu },
    { label: "Users", href: "/admin/users", icon: Menu },
    { label: "Orders", href: "/admin/orders", icon: Menu },
    { label: "Suppliers", href: "/admin/suppliers", icon: Menu },
    { label: "Finance", href: "/admin/finance", icon: Menu },
    { label: "Analytics", href: "/admin/analytics", icon: Menu },
    { label: "Settings", href: "/admin/settings", icon: Menu },
  ],
};

export function Header() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const items = user ? NAV_ITEMS[user.role] || [] : [];
  const initials = user?.email
    ? user.email.slice(0, 2).toUpperCase()
    : user?.phone?.slice(-2) || "??";

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
      {/* Mobile menu */}
      <Sheet>
        <SheetTrigger asChild className="md:hidden">
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex h-16 items-center border-b px-6">
            <Link href="/" className="text-xl font-bold text-primary">
              Distronergy
            </Link>
          </div>
          <nav className="space-y-1 p-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>

      <div className="hidden md:block" />

      {/* User menu */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="hidden text-sm md:inline">
                {user.email || user.phone}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/${user.role.toLowerCase()}/profile`}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
