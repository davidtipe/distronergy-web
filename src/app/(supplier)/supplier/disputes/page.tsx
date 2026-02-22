"use client";

import useSWR from "swr";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/formatters";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

interface Dispute {
  id: string;
  orderId: string;
  reason: string;
  status: string;
  createdAt: string;
}

export default function DisputesPage() {
  const { data, isLoading } = useSWR<{ disputes: Dispute[] }>(
    "/disputes",
    fetcher
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Disputes</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : !data?.disputes?.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No disputes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.disputes.map((dispute) => (
            <Card key={dispute.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        Order #{dispute.orderId.slice(0, 8)}
                      </span>
                      <StatusBadge status={dispute.status} />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {dispute.reason}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(dispute.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
