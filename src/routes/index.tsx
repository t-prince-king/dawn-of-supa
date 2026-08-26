// Home page: the two big buttons that start the whole experience.
import { createFileRoute, Link } from "@tanstack/react-router";
import { PackagePlus, Search, MapPin, ShieldCheck, Leaf } from "lucide-react";
import { Header } from "@/components/Header";
import { InstallPrompt } from "@/components/InstallPrompt";
import { PremiumSection } from "@/components/PremiumSection";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ScrapSpot — Find What's Worth Saving" },
      {
        name: "description",
        content:
          "Post unwanted reusable items with a photo and location so neighbours can salvage them. Free, map-based and privacy-friendly.",
      },
      { property: "og:title", content: "ScrapSpot — Find What's Worth Saving" },
      {
        property: "og:description",
        content: "Post reusable items near you, or find free items worth saving on a map.",
      },
    ],
  }),
  component: Home,
});

const STEPS = [
  { icon: PackagePlus, title: "Post something", text: "Snap a photo, pick a category." },
  { icon: MapPin, title: "Share the area", text: "We blur your exact spot for privacy." },
  { icon: Search, title: "Someone saves it", text: "Nearby people see it on the map." },
];

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto max-w-3xl px-4 pb-16">
        {/* Hero */}
        <section className="py-10 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
            <Leaf className="h-3.5 w-3.5 text-primary" />
            Keep good stuff out of landfill
          </span>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-foreground">
            ScrapSpot
          </h1>
          <p className="mt-2 text-lg font-medium text-muted-foreground">
            Find What's Worth Saving.
          </p>

          <div className="mt-8 grid gap-3">
            <Button size="lg" className="h-16 text-base font-bold" asChild>
              <Link to="/post">
                <PackagePlus className="h-6 w-6" />
                I HAVE SOMETHING
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 text-base font-bold" asChild>
              <Link to="/find">
                <Search className="h-6 w-6" />
                FIND SOMETHING
              </Link>
            </Button>
          </div>
        </section>

        {/* How it works */}
        <section className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((step) => (
            <Card key={step.title} className="p-4">
              <step.icon className="h-6 w-6 text-primary" />
              <h2 className="mt-2 text-sm font-semibold text-foreground">{step.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
            </Card>
          ))}
        </section>

        <Card className="mt-3 flex flex-row items-center gap-3 p-4">
          <ShieldCheck className="h-6 w-6 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground">
            Your exact address is never saved. Locations are randomly shifted by up to half a
            mile before anyone sees them.
          </p>
        </Card>

        <div className="mt-8">
          <PremiumSection />
        </div>
      </main>

      <InstallPrompt />
    </div>
  );
}
