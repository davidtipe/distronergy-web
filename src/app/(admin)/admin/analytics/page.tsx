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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

interface AnalyticsData {
  ordersByDay: Array<{ date: string; count: number }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
  ordersByStatus: Record<string, number>;
}

export default function AdminAnalyticsPage() {
  const { data, isLoading } = useSWR<AnalyticsData>(
    "/admin/analytics/overview",
    fetcher
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics</h1>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Orders by day */}
          <Card>
            <CardHeader>
              <CardTitle>Orders Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.ordersByDay?.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data.ordersByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  No data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Revenue by day */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              {data?.revenueByDay?.length ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data.revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis
                      fontSize={12}
                      tickFormatter={(v) => formatCurrency(v)}
                    />
                    <Tooltip formatter={(v) => formatCurrency(Number(v))} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="py-8 text-center text-muted-foreground">
                  No data available
                </p>
              )}
            </CardContent>
          </Card>

          {/* Orders by status */}
          {data?.ordersByStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                  {Object.entries(data.ordersByStatus).map(([status, count]) => (
                    <div
                      key={status}
                      className="rounded-lg border p-3 text-center"
                    >
                      <p className="text-2xl font-bold">{count}</p>
                      <p className="text-xs text-muted-foreground">
                        {status.replace(/_/g, " ")}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
