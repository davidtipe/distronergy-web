"use client";

import { useAuth } from "@/lib/auth";
import { formatDate } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email || "Not set"}</p>
              {user.email && (
                <Badge variant={user.emailVerified ? "default" : "secondary"} className="mt-1">
                  {user.emailVerified ? "Verified" : "Unverified"}
                </Badge>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{user.phone || "Not set"}</p>
              {user.phone && (
                <Badge variant={user.phoneVerified ? "default" : "secondary"} className="mt-1">
                  {user.phoneVerified ? "Verified" : "Unverified"}
                </Badge>
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Role</p>
              <p className="font-medium">{user.role}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">{formatDate(user.createdAt)}</p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground">Business ID</p>
            <p className="font-mono text-sm">{user.businessId}</p>
          </div>
          {user.isBusinessAdmin && (
            <Badge>Business Admin</Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => logout()}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
