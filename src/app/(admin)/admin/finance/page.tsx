"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DollarSign, Landmark, TrendingUp, Wallet } from "lucide-react";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

interface FinanceOverview {
  totalRevenue: number;
  totalEscrow: number;
  totalPayouts: number;
  commissionEarned: number;
}

export default function AdminFinancePage() {
  const { data, isLoading } = useSWR<FinanceOverview>(
    "/admin/analytics/finance",
    fetcher
  );

  const stats = [
    {
      label: "Total Revenue",
      value: data?.totalRevenue,
      icon: TrendingUp,
      color: "text-green-600 bg-green-100",
    },
    {
      label: "Escrow Balance",
      value: data?.totalEscrow,
      icon: Landmark,
      color: "text-blue-600 bg-blue-100",
    },
    {
      label: "Total Payouts",
      value: data?.totalPayouts,
      icon: Wallet,
      color: "text-purple-600 bg-purple-100",
    },
    {
      label: "Commission Earned",
      value: data?.commissionEarned,
      icon: DollarSign,
      color: "text-orange-600 bg-orange-100",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Finance</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full ${stat.color}`}
              >
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {isLoading ? (
                  <div className="h-7 w-24 animate-pulse rounded bg-muted" />
                ) : (
                  <p className="text-xl font-bold">
                    {stat.value != null ? formatCurrency(stat.value) : "—"}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
