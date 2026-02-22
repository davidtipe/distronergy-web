"use client";

import { useState } from "react";
import useSWR from "swr";
import { api, ApiRequestError } from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { Plus, Wallet, ArrowDownLeft, ArrowUpRight } from "lucide-react";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

interface WalletBalance {
  balance: number;
  availableBalance: number;
  currency: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  gateway: string;
  reference: string;
  status: string;
  createdAt: string;
}

interface TransactionsResponse {
  data: Transaction[];
  pagination: { limit: number; offset: number; hasMore: boolean };
}

interface FundForm {
  amount: number;
}

export default function WalletPage() {
  const [fundOpen, setFundOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: balance, isLoading: balanceLoading } = useSWR<WalletBalance>(
    "/wallet/balance",
    fetcher
  );

  const { data: txData, isLoading: txLoading } = useSWR<Transaction[]>(
    "/wallet/transactions",
    fetcher
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors: formErrors, isSubmitting },
  } = useForm<FundForm>();

  async function onFund(data: FundForm) {
    setError(null);
    try {
      const res = await api.post<{ authorizationUrl: string }>("/wallet/fund", data);
      window.location.href = res.data.authorizationUrl;
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Failed to initiate funding");
      }
    }
  }

  const transactions = txData || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Wallet</h1>
        <Dialog open={fundOpen} onOpenChange={setFundOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Fund Wallet
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit(onFund)}>
              <DialogHeader>
                <DialogTitle>Fund Wallet</DialogTitle>
                <DialogDescription>
                  Enter the amount to add to your wallet
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (NGN)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="e.g. 50000"
                    {...register("amount")}
                  />
                  {formErrors.amount && (
                    <p className="text-sm text-destructive">
                      {formErrors.amount.message}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Processing..." : "Proceed to Payment"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Balance card */}
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Available Balance</p>
            {balanceLoading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            ) : (
              <p className="text-3xl font-bold">
                {formatCurrency(Number(balance?.availableBalance || 0))}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {txLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : !transactions.length ? (
            <p className="py-8 text-center text-muted-foreground">
              No transactions yet
            </p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${
                        tx.type === "FUNDING"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      {tx.type === "FUNDING" ? (
                        <ArrowDownLeft className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {tx.type.replace(/_/g, " ")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-medium ${
                        tx.type === "FUNDING"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.type === "FUNDING" ? "+" : "-"}
                      {formatCurrency(Number(tx.amount))}
                    </p>
                    <StatusBadge status={tx.status} />
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
