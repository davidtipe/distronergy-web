"use client";

import Link from "next/link";
import useSWR from "swr";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Plus, Package, Wallet, Clock, ShoppingCart } from "lucide-react";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

interface Order {
  id: string;
  quantityLiters: number;
  quotedTotalPrice: number;
  deliveryAddress: string;
  status: string;
  createdAt: string;
}

export default function CustomerDashboard() {
  const { user } = useAuth();

  const { data: walletData } = useSWR<{ balance: number; availableBalance: number }>(
    "/wallet/balance",
    fetcher
  );
  const { data: ordersData } = useSWR<{
    orders: Order[];
    pagination: { total: number };
  }>("/orders?limit=5", fetcher);

  const activeOrders = ordersData?.orders?.filter((o) =>
    ["PLACED", "MATCHING", "MATCHED", "ACCEPTED", "DISPATCHED", "IN_TRANSIT"].includes(o.status)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Welcome back{user?.email ? `, ${user.email.split("@")[0]}` : ""}
        </h1>
        <Button asChild>
          <Link href="/customer/orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeOrders?.length ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wallet Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {walletData ? formatCurrency(Number(walletData.availableBalance)) : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Orders
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {ordersData?.pagination?.total ?? "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Transit
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {ordersData?.orders?.filter((o) => o.status === "IN_TRANSIT").length ?? "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/customer/orders">View all</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!ordersData?.orders?.length ? (
            <p className="text-muted-foreground">No orders yet</p>
          ) : (
            <div className="space-y-3">
              {ordersData.orders.slice(0, 5).map((order) => (
                <Link
                  key={order.id}
                  href={`/customer/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-accent/50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {Number(order.quantityLiters).toLocaleString()}L
                      </span>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(Number(order.quotedTotalPrice))}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
