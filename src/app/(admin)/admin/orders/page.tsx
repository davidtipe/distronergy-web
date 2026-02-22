"use client";

import { useState } from "react";
import useSWR from "swr";
import { api } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/shared/status-badge";

const STATUSES = [
  "ALL", "DRAFT", "PLACED", "MATCHING", "MATCHED", "ACCEPTED",
  "DISPATCHED", "IN_TRANSIT", "DELIVERED", "COMPLETED", "CANCELLED",
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
  pagination: { page: number; limit: number; total: number; pages: number };
}

export default function AdminOrdersPage() {
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status !== "ALL") params.set("status", status);

  const { data, isLoading } = useSWR<OrdersResponse>(
    `/admin/orders?${params}`,
    fetcher
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">All Orders</h1>

      <div className="flex gap-4">
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s === "ALL" ? "All Statuses" : s.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!data?.orders?.length ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-mono text-sm">
                          {order.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          {Number(order.quantityLiters).toLocaleString()}L
                        </TableCell>
                        <TableCell>
                          {formatCurrency(Number(order.quotedTotalPrice))}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={order.status} />
                        </TableCell>
                        <TableCell className="text-sm">{order.orderType}</TableCell>
                        <TableCell className="text-sm">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              {data?.pagination && data.pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 border-t p-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {page} of {data.pagination.pages} ({data.pagination.total} total)
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
