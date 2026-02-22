"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import { StatusBadge } from "@/components/shared/status-badge";
import { MapPicker } from "@/components/shared/map-picker";
import { ArrowLeft, Download, XCircle } from "lucide-react";
import Link from "next/link";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

interface StatusEntry {
  id: string;
  fromStatus: string | null;
  toStatus: string;
  changedBy: string | null;
  reason: string | null;
  createdAt: string;
}

interface OrderDetail {
  order: {
    id: string;
    quantityLiters: number;
    quotedPricePerLiter: number;
    quotedTotalPrice: number;
    emergencyPremium: number | null;
    deliveryAddress: string;
    deliveryLat: number | null;
    deliveryLng: number | null;
    deliveryWindowStart: string;
    deliveryWindowEnd: string;
    orderType: string;
    status: string;
    createdAt: string;
    statusHistory: StatusEntry[];
  };
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, mutate } = useSWR<OrderDetail>(
    `/orders/${id}`,
    fetcher
  );

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(true);
    setError(null);
    try {
      await api.post(`/orders/${id}/cancel`, { reason: "Cancelled by customer" });
      mutate();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed to cancel");
    } finally {
      setCancelling(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!data?.order) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">Order not found</p>
      </div>
    );
  }

  const order = data.order;
  const canCancel = ["DRAFT", "PLACED", "MATCHING"].includes(order.status);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customer/orders">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            Order #{order.id.slice(0, 8)}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.createdAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Order details */}
      <Card>
        <CardHeader>
          <CardTitle>Order Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-medium">
                {Number(order.quantityLiters).toLocaleString()} Liters
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Type</p>
              <p className="font-medium">{order.orderType}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Price per Liter</p>
              <p className="font-medium">
                {formatCurrency(Number(order.quotedPricePerLiter))}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-xl font-bold">
                {formatCurrency(Number(order.quotedTotalPrice))}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">Delivery Address</p>
            <p className="font-medium">{order.deliveryAddress}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Earliest Delivery</p>
              <p className="font-medium">
                {formatDate(order.deliveryWindowStart)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Latest Delivery</p>
              <p className="font-medium">
                {formatDate(order.deliveryWindowEnd)}
              </p>
            </div>
          </div>

          {order.deliveryLat && order.deliveryLng && (
            <MapPicker
              value={{ lat: Number(order.deliveryLat), lng: Number(order.deliveryLng) }}
              readOnly
              height="200px"
            />
          )}
        </CardContent>
      </Card>

      {/* Status timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Status History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.statusHistory.map((entry, i) => (
              <div key={entry.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="h-3 w-3 rounded-full bg-primary" />
                  {i < order.statusHistory.length - 1 && (
                    <div className="w-px flex-1 bg-border" />
                  )}
                </div>
                <div className="pb-4">
                  <p className="font-medium text-sm">
                    {entry.toStatus.replace(/_/g, " ")}
                  </p>
                  {entry.reason && (
                    <p className="text-sm text-muted-foreground">
                      {entry.reason}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {formatDate(entry.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        {canCancel && (
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelling}
          >
            <XCircle className="mr-2 h-4 w-4" />
            {cancelling ? "Cancelling..." : "Cancel Order"}
          </Button>
        )}
        <Button
          variant="outline"
          onClick={() =>
            window.open(
              `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}/waybill/pdf`,
              "_blank"
            )
          }
        >
          <Download className="mr-2 h-4 w-4" />
          Download Waybill
        </Button>
      </div>
    </div>
  );
}
