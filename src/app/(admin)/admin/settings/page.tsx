"use client";

import { useState } from "react";
import { api, ApiRequestError } from "@/lib/api";
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
import { toast } from "sonner";

interface SettingsForm {
  commissionRate: number;
  emergencyPremiumRate: number;
  minOrderLiters: number;
  maxOrderLiters: number;
}

export default function AdminSettingsPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SettingsForm>({
    defaultValues: {
      commissionRate: 5,
      emergencyPremiumRate: 20,
      minOrderLiters: 100,
      maxOrderLiters: 100000,
    },
  });

  async function onSubmit(data: SettingsForm) {
    try {
      await api.put("/admin/settings", data);
      toast.success("Settings updated");
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Failed to update settings");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Platform Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle>Commission & Pricing</CardTitle>
          <CardDescription>
            Configure platform commission rates and order limits
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="commissionRate">Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.1"
                  {...register("commissionRate")}
                />
                {errors.commissionRate && (
                  <p className="text-sm text-destructive">{errors.commissionRate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyPremiumRate">Emergency Premium (%)</Label>
                <Input
                  id="emergencyPremiumRate"
                  type="number"
                  step="0.1"
                  {...register("emergencyPremiumRate")}
                />
                {errors.emergencyPremiumRate && (
                  <p className="text-sm text-destructive">{errors.emergencyPremiumRate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minOrderLiters">Min Order (Liters)</Label>
                <Input
                  id="minOrderLiters"
                  type="number"
                  {...register("minOrderLiters")}
                />
                {errors.minOrderLiters && (
                  <p className="text-sm text-destructive">{errors.minOrderLiters.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOrderLiters">Max Order (Liters)</Label>
                <Input
                  id="maxOrderLiters"
                  type="number"
                  {...register("maxOrderLiters")}
                />
                {errors.maxOrderLiters && (
                  <p className="text-sm text-destructive">{errors.maxOrderLiters.message}</p>
                )}
              </div>
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Settings"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
