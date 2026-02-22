"use client";

import useSWR from "swr";
import { api, ApiRequestError } from "@/lib/api";
import { formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

interface Supplier {
  id: string;
  businessName: string;
  email: string | null;
  phone: string | null;
  kycStatus: string;
  isVerified: boolean;
  createdAt: string;
}

export default function AdminSuppliersPage() {
  const { data, isLoading, mutate } = useSWR<{ suppliers: Supplier[] }>(
    "/admin/suppliers",
    fetcher
  );

  async function handleVerify(supplierId: string, approve: boolean) {
    try {
      await api.post(`/admin/suppliers/${supplierId}/${approve ? "approve" : "reject"}`);
      toast.success(`Supplier ${approve ? "approved" : "rejected"}`);
      mutate();
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Action failed");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Supplier Verification</h1>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data?.suppliers?.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No suppliers found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.suppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <p className="font-medium">{supplier.businessName}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {supplier.id.slice(0, 8)}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        {supplier.email || supplier.phone}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            supplier.isVerified
                              ? "default"
                              : supplier.kycStatus === "PENDING"
                                ? "secondary"
                                : "destructive"
                          }
                        >
                          {supplier.isVerified ? "Verified" : supplier.kycStatus || "Pending"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(supplier.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {!supplier.isVerified && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleVerify(supplier.id, true)}
                            >
                              <Check className="mr-1 h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleVerify(supplier.id, false)}
                            >
                              <X className="mr-1 h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
