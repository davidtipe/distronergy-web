"use client";

import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/shared/status-badge";
import { Plus, Search } from "lucide-react";

const ORDER_STATUSES = [
  "ALL",
  "DRAFT",
  "PLACED",
  "MATCHING",
  "MATCHED",
  "ACCEPTED",
  "DISPATCHED",
  "IN_TRANSIT",
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
];

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
  createdAt: string;
}

interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function OrdersPage() {
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ page: String(page), limit: "10" });
  if (status !== "ALL") params.set("status", status);

  const { data, isLoading } = useSWR<OrdersResponse>(
    `/orders?${params}`,
    fetcher
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <Button asChild>
          <Link href="/customer/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : !data?.orders.length ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No orders found</p>
            <Button asChild className="mt-4">
              <Link href="/customer/orders/new">Place your first order</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {data.orders.map((order) => (
            <Link key={order.id} href={`/customer/orders/${order.id}`}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {Number(order.quantityLiters).toLocaleString()}L
                      </span>
                      <StatusBadge status={order.status} />
                      {order.orderType === "EMERGENCY" && (
                        <span className="text-xs font-medium text-orange-600">
                          EMERGENCY
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {order.deliveryAddress}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatCurrency(Number(order.quotedTotalPrice))}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}

          {/* Pagination */}
          {data.pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {data.pagination.pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.pages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
