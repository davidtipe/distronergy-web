"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Users, Package, TrendingUp, Truck } from "lucide-react";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

interface DashboardData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeSuppliers: number;
  recentOrders: Array<{ date: string; count: number }>;
}

export default function AdminDashboard() {
  const { data, isLoading } = useSWR<DashboardData>(
    "/admin/analytics/dashboard",
    fetcher
  );

  const stats = [
    { label: "Total Users", value: data?.totalUsers, icon: Users },
    { label: "Total Orders", value: data?.totalOrders, icon: Package },
    {
      label: "Platform Revenue",
      value: data?.totalRevenue != null ? formatCurrency(data.totalRevenue) : undefined,
      icon: TrendingUp,
    },
    { label: "Active Suppliers", value: data?.activeSuppliers, icon: Truck },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-7 w-20 animate-pulse rounded bg-muted" />
              ) : (
                <p className="text-2xl font-bold">
                  {stat.value ?? "—"}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          {data?.recentOrders?.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.recentOrders}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              {isLoading ? "Loading..." : "No data available"}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
