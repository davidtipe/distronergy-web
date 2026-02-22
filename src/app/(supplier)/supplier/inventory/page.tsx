"use client";

import useSWR from "swr";
import { api, ApiRequestError } from "@/lib/api";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { toast } from "sonner";

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

interface PricingForm {
  pricePerLiter: number;
}

interface ServiceAreaForm {
  latitude: number;
  longitude: number;
  radiusKm: number;
}

export default function InventoryPage() {
  const { data: profile, mutate } = useSWR("/suppliers/me", fetcher);

  const pricingForm = useForm<PricingForm>();

  const serviceAreaForm = useForm<ServiceAreaForm>();

  async function onUpdatePricing(data: PricingForm) {
    try {
      await api.put("/suppliers/me/pricing", data);
      toast.success("Pricing updated");
      mutate();
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Failed to update pricing");
    }
  }

  async function onUpdateServiceArea(data: ServiceAreaForm) {
    try {
      await api.put("/suppliers/me/service-area", data);
      toast.success("Service area updated");
      mutate();
    } catch (err) {
      toast.error(err instanceof ApiRequestError ? err.message : "Failed to update service area");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">Inventory & Pricing</h1>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
          <CardDescription>Set your price per liter of fuel</CardDescription>
        </CardHeader>
        <form onSubmit={pricingForm.handleSubmit(onUpdatePricing)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pricePerLiter">Price per Liter (NGN)</Label>
              <Input
                id="pricePerLiter"
                type="number"
                step="0.01"
                placeholder="e.g. 650"
                {...pricingForm.register("pricePerLiter")}
              />
              {pricingForm.formState.errors.pricePerLiter && (
                <p className="text-sm text-destructive">
                  {pricingForm.formState.errors.pricePerLiter.message}
                </p>
              )}
            </div>
            <Button type="submit" disabled={pricingForm.formState.isSubmitting}>
              {pricingForm.formState.isSubmitting ? "Updating..." : "Update Pricing"}
            </Button>
          </CardContent>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Service Area</CardTitle>
          <CardDescription>
            Define the center and radius of your delivery area
          </CardDescription>
        </CardHeader>
        <form onSubmit={serviceAreaForm.handleSubmit(onUpdateServiceArea)}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="e.g. 6.5244"
                  {...serviceAreaForm.register("latitude")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="e.g. 3.3792"
                  {...serviceAreaForm.register("longitude")}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="radiusKm">Radius (km)</Label>
              <Input
                id="radiusKm"
                type="number"
                placeholder="e.g. 50"
                {...serviceAreaForm.register("radiusKm")}
              />
            </div>
            <Button type="submit" disabled={serviceAreaForm.formState.isSubmitting}>
              {serviceAreaForm.formState.isSubmitting ? "Updating..." : "Update Service Area"}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
