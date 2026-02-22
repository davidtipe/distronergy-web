"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { DollarSign } from "lucide-react";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

interface Payout {
  id: string;
  amount: number;
  status: string;
  reference: string;
  createdAt: string;
}

export default function PayoutsPage() {
  const { data: payouts, isLoading } = useSWR<{ payouts: Payout[] }>(
    "/payouts",
    fetcher
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Payouts</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-2xl font-bold">—</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Pending Payout</p>
              <p className="text-2xl font-bold">—</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div>
              <p className="text-sm text-muted-foreground">Last Payout</p>
              <p className="text-2xl font-bold">—</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !payouts?.payouts?.length ? (
            <p className="py-8 text-center text-muted-foreground">
              No payouts yet
            </p>
          ) : (
            <div className="space-y-3">
              {payouts.payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">
                      {formatCurrency(Number(payout.amount))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payout.reference}
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={payout.status} />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDate(payout.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
