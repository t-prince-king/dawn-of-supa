// Item details: big photo, description and a Get Directions button.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Navigation, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getCategoryIcon } from "@/lib/categories";
import {
  formatPrice,
  formatTimeLeft,
  getListing,
  getListingState,
  getPhotoUrls,
  holdListingForPickup,
  markListingTaken,
  PICKUP_HOLD_MINUTES,
  type Listing,
} from "@/lib/listings";
import { Header } from "@/components/Header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/item/$id")({
  head: () => ({
    meta: [
      { title: "Item details — ScrapSpot" },
      {
        name: "description",
        content: "See the photo, description and approximate location of a free item on ScrapSpot.",
      },
      { property: "og:title", content: "Item details — ScrapSpot" },
      {
        property: "og:description",
        content: "Photo, description and directions for a free reusable item.",
      },
    ],
  }),
  component: ItemPage,
});

function ItemPage() {
  const { id } = Route.useParams();
  const [listing, setListing] = useState<Listing | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Loads this one item plus its photo link.
  useEffect(() => {
    async function load() {
      const found = await getListing(id);
      setListing(found);
      if (found) {
        const urls = await getPhotoUrls([found.photo_url]);
        setPhotoUrl(urls[found.photo_url]);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const CategoryIcon = getCategoryIcon(listing?.category ?? "Other");

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-md px-4 py-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/find">
            <ArrowLeft className="h-4 w-4" />
            Back to items
          </Link>
        </Button>

        {loading && <p className="mt-8 text-center text-sm text-muted-foreground">Loading…</p>}

        {!loading && !listing && (
          <Card className="mt-6 p-6 text-center text-sm text-muted-foreground">
            This item is no longer available.
          </Card>
        )}

        {listing && (
          <div className="mt-4">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={listing.category}
                className="h-64 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-xl bg-muted">
                <CategoryIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}

            <h1 className="mt-4 flex items-center gap-2 text-2xl font-bold text-foreground">
              <CategoryIcon className="h-6 w-6 text-primary" />
              {listing.category}
            </h1>

            {listing.description && (
              <p className="mt-2 text-sm text-muted-foreground">{listing.description}</p>
            )}

            <p className="mt-4 text-xs text-muted-foreground">
              The pin is approximate (shifted for the poster's privacy). Look around the area when
              you arrive.
            </p>

            <Button className="mt-5 w-full" size="lg" asChild>
              <a
                href={`geo:${listing.latitude},${listing.longitude}`}
                target="_blank"
                rel="noreferrer"
              >
                <Navigation className="h-5 w-5" />
                Get directions
              </a>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
