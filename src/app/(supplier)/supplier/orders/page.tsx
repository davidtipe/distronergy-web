"use client";

import { useState } from "react";
import useSWR from "swr";
import { api, ApiRequestError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/shared/status-badge";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

interface Order {
  id: string;
  quantityLiters: number;
  quotedTotalPrice: number;
  deliveryAddress: string;
  status: string;
  orderType: string;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  createdAt: string;
}

export default function SupplierOrdersPage() {
  const { data: pending, isLoading: pendingLoading, mutate: mutatePending } = useSWR<{ orders: Order[] }>(
    "/suppliers/me/orders/pending",
    fetcher
  );
  const { data: accepted, isLoading: acceptedLoading, mutate: mutateAccepted } = useSWR<{ orders: Order[] }>(
    "/suppliers/me/orders/accepted",
    fetcher
  );

  async function handleAction(orderId: string, action: "accept" | "reject") {
    try {
      await api.post(`/suppliers/me/orders/${orderId}/${action}`);
      toast.success(`Order ${action}ed successfully`);
      mutatePending();
      mutateAccepted();
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : `Failed to ${action} order`);
    }
  }

  async function handleUpdateStatus(orderId: string, status: string) {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success("Status updated");
      mutateAccepted();
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Failed to update status");
    }
  }

  function OrderCard({ order, showActions }: { order: Order; showActions?: boolean }) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {Number(order.quantityLiters).toLocaleString()}L
                </span>
                <StatusBadge status={order.status} />
                {order.orderType === "EMERGENCY" && (
                  <span className="text-xs font-medium text-orange-600">EMERGENCY</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground line-clamp-1">
                {order.deliveryAddress}
              </p>
              <p className="text-xs text-muted-foreground">
                Delivery: {formatDate(order.deliveryWindowStart)} — {formatDate(order.deliveryWindowEnd)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold">
                {formatCurrency(Number(order.quotedTotalPrice))}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(order.createdAt)}
              </p>
            </div>
          </div>
          {showActions && (
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={() => handleAction(order.id, "accept")}
              >
                <Check className="mr-1 h-4 w-4" />
                Accept
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleAction(order.id, "reject")}
              >
                <X className="mr-1 h-4 w-4" />
                Reject
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pending?.orders?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({accepted?.orders?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-3 mt-4">
          {pendingLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !pending?.orders?.length ? (
            <p className="py-8 text-center text-muted-foreground">
              No pending orders
            </p>
          ) : (
            pending.orders.map((order) => (
              <OrderCard key={order.id} order={order} showActions />
            ))
          )}
        </TabsContent>

        <TabsContent value="accepted" className="space-y-3 mt-4">
          {acceptedLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !accepted?.orders?.length ? (
            <p className="py-8 text-center text-muted-foreground">
              No accepted orders
            </p>
          ) : (
            accepted.orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
