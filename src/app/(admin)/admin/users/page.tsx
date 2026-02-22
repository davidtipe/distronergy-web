"use client";

import { useState } from "react";
import useSWR from "swr";
import { api, ApiRequestError } from "@/lib/api";
import { formatDate } from "@/lib/formatters";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Search, UserX, UserCheck } from "lucide-react";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

interface User {
  id: string;
  email: string | null;
  phone: string | null;
  role: string;
  isBusinessAdmin: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
  suspended?: boolean;
}

export default function AdminUsersPage() {
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const params = new URLSearchParams();
  if (roleFilter !== "ALL") params.set("role", roleFilter);
  if (search) params.set("search", search);

  const { data, isLoading, mutate } = useSWR<{ users: User[] }>(
    `/admin/users?${params}`,
    fetcher
  );

  async function handleSuspend(userId: string, suspend: boolean) {
    try {
      await api.post(`/admin/users/${userId}/${suspend ? "suspend" : "activate"}`);
      toast.success(`User ${suspend ? "suspended" : "activated"}`);
      mutate();
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Action failed");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Users</h1>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by email or phone..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Roles</SelectItem>
            <SelectItem value="CUSTOMER">Customer</SelectItem>
            <SelectItem value="SUPPLIER">Supplier</SelectItem>
            <SelectItem value="DRIVER">Driver</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
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
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Verified</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!data?.users?.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.email || user.phone}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {user.id.slice(0, 8)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        {user.emailVerified || user.phoneVerified ? (
                          <Badge variant="default">Verified</Badge>
                        ) : (
                          <Badge variant="secondary">Unverified</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={user.suspended ? "default" : "destructive"}
                          onClick={() => handleSuspend(user.id, !user.suspended)}
                        >
                          {user.suspended ? (
                            <>
                              <UserCheck className="mr-1 h-3 w-3" />
                              Activate
                            </>
                          ) : (
                            <>
                              <UserX className="mr-1 h-3 w-3" />
                              Suspend
                            </>
                          )}
                        </Button>
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
