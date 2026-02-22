"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { api, ApiRequestError } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MapPicker } from "@/components/shared/map-picker";

interface QuoteForm {
  locationId: string;
  quantityLiters: number;
  deliveryAddress: string;
  deliveryWindowStart: string;
  deliveryWindowEnd: string;
  orderType: "SCHEDULED" | "EMERGENCY";
}

interface Quote {
  order: {
    id: string;
    quotedPricePerLiter: number;
    quotedTotalPrice: number;
    emergencyPremium: number | null;
    quoteExpiresAt: string;
    status: string;
  };
  expiresAt: string;
  pricing: {
    pricePerLiter: number;
    totalPrice: number;
    emergencyPremium: number | null;
  };
}

function fetcher<T>(path: string) {
  return api.get<T>(path).then((res) => res.data);
}

export default function NewOrderPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | undefined>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [placing, setPlacing] = useState(false);

  const { data: locations } = useSWR<Array<{ id: string; name: string }>>(
    "/locations",
    fetcher
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QuoteForm>({
    defaultValues: { orderType: "SCHEDULED" },
  });

  const orderType = watch("orderType");

  async function onGetQuote(data: QuoteForm) {
    setError(null);
    setQuote(null);
    try {
      const res = await api.post<Quote>("/orders/quotes", {
        ...data,
        deliveryLat: coords?.lat,
        deliveryLng: coords?.lng,
      });
      setQuote(res.data);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Failed to get quote");
      }
    }
  }

  async function onPlaceOrder() {
    if (!quote) return;
    setPlacing(true);
    setError(null);
    try {
      await api.post(`/orders/${quote.order.id}/place`);
      router.push(`/customer/orders/${quote.order.id}`);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Failed to place order");
      }
    } finally {
      setPlacing(false);
    }
  }

  // Set default delivery window (next 4 hours)
  const now = new Date();
  const startDefault = new Date(now.getTime() + 2 * 3600000).toISOString().slice(0, 16);
  const endDefault = new Date(now.getTime() + 6 * 3600000).toISOString().slice(0, 16);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">New Order</h1>

      {!quote ? (
        <Card>
          <CardHeader>
            <CardTitle>Get a Quote</CardTitle>
            <CardDescription>
              Enter delivery details to get a price quote
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onGetQuote)}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label>Location</Label>
                <Select onValueChange={(v) => setValue("locationId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations?.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.locationId && (
                  <p className="text-sm text-destructive">{errors.locationId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select
                  value={orderType}
                  onValueChange={(v) => setValue("orderType", v as "SCHEDULED" | "EMERGENCY")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="EMERGENCY">Emergency (+20% premium)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantityLiters">Quantity (Liters)</Label>
                <Input
                  id="quantityLiters"
                  type="number"
                  placeholder="e.g. 1000"
                  {...register("quantityLiters")}
                />
                {errors.quantityLiters && (
                  <p className="text-sm text-destructive">{errors.quantityLiters.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="deliveryAddress">Delivery Address</Label>
                <Textarea
                  id="deliveryAddress"
                  placeholder="Full delivery address"
                  {...register("deliveryAddress")}
                />
                {errors.deliveryAddress && (
                  <p className="text-sm text-destructive">{errors.deliveryAddress.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Delivery Location (click map to pin)</Label>
                <MapPicker
                  value={coords}
                  onChange={(c) => setCoords({ lat: c.lat, lng: c.lng })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryWindowStart">Earliest Delivery</Label>
                  <Input
                    id="deliveryWindowStart"
                    type="datetime-local"
                    defaultValue={startDefault}
                    {...register("deliveryWindowStart")}
                  />
                  {errors.deliveryWindowStart && (
                    <p className="text-sm text-destructive">{errors.deliveryWindowStart.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryWindowEnd">Latest Delivery</Label>
                  <Input
                    id="deliveryWindowEnd"
                    type="datetime-local"
                    defaultValue={endDefault}
                    {...register("deliveryWindowEnd")}
                  />
                  {errors.deliveryWindowEnd && (
                    <p className="text-sm text-destructive">{errors.deliveryWindowEnd.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Getting quote..." : "Get Quote"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Quote Ready</CardTitle>
            <CardDescription>
              Review and confirm your order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price per Liter</span>
                <span className="font-medium">
                  {formatCurrency(Number(quote.pricing.pricePerLiter))}
                </span>
              </div>
              {quote.pricing.emergencyPremium && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Emergency Premium</span>
                  <span className="font-medium text-orange-600">
                    +{formatCurrency(Number(quote.pricing.emergencyPremium))}
                  </span>
                </div>
              )}
              <div className="flex justify-between border-t pt-2">
                <span className="font-semibold">Total</span>
                <span className="text-xl font-bold">
                  {formatCurrency(Number(quote.pricing.totalPrice))}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Quote expires at{" "}
                {new Date(quote.expiresAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setQuote(null)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={onPlaceOrder}
              disabled={placing}
              className="flex-1"
            >
              {placing ? "Placing order..." : "Place Order"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
