import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, Truck, BarChart3, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <span className="text-2xl font-bold text-primary">Distronergy</span>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Distribution Made Simple
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
          Order, track, and manage deliveries across your supply chain.
          Connect customers, suppliers, and drivers on one platform.
        </p>
        <div className="mt-10 flex justify-center gap-4">
          <Button size="lg" asChild>
            <Link href="/register">Start Ordering</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/register?role=SUPPLIER">Become a Supplier</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-muted/50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">
            Everything you need
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Package,
                title: "Easy Ordering",
                desc: "Place orders with a few clicks. Track in real-time.",
              },
              {
                icon: Truck,
                title: "Fast Delivery",
                desc: "GPS-tracked drivers ensure timely delivery.",
              },
              {
                icon: BarChart3,
                title: "Analytics",
                desc: "Monitor sales, orders, and performance metrics.",
              },
              {
                icon: Shield,
                title: "Secure Payments",
                desc: "Escrow-backed transactions protect all parties.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-lg border bg-card p-6">
                <f.icon className="mb-4 h-8 w-8 text-primary" />
                <h3 className="mb-2 font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Distronergy. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
