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
  const [userId, setUserId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Loads this one item plus its photo link.
  useEffect(() => {
    async function load() {
      const found = await getListing(id);
      setListing(found);
      if (found) {
        const urls = await getPhotoUrls([found.photo_url]);
        setPhotoUrl(urls[found.photo_url]);
      }
      const { data } = await supabase.auth.getSession();
      setUserId(data.session?.user.id ?? null);
      setLoading(false);
    }
    load();
  }, [id]);

  // Poster closes their own listing.
  async function markTaken() {
    if (!listing || busy) return;
    setBusy(true);
    try {
      await markListingTaken(listing.id);
      setListing({ ...listing, status: "taken", pending_until: null });
      toast.success("Marked as taken.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update it.");
    }
    setBusy(false);
  }

  // Someone says they're on their way — short hold only.
  async function holdPickup() {
    if (!listing || busy) return;
    setBusy(true);
    try {
      await holdListingForPickup(listing.id);
      const until = new Date(Date.now() + PICKUP_HOLD_MINUTES * 60 * 1000).toISOString();
      setListing({ ...listing, status: "pending", pending_until: until });
      toast.success(`Held for ${PICKUP_HOLD_MINUTES} minutes.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not hold it.");
    }
    setBusy(false);
  }

  const CategoryIcon = getCategoryIcon(listing?.category ?? "Other");
  const state = listing ? getListingState(listing) : null;
  const isOwner = Boolean(listing && userId && listing.user_id === userId);


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

            <div className="mt-2 flex items-center gap-2">
              <span className="text-xl font-bold text-primary">{formatPrice(listing)}</span>
              <Badge variant="secondary">{state}</Badge>
            </div>

            {listing.description && (
              <p className="mt-2 text-sm text-muted-foreground">{listing.description}</p>
            )}

            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {state === "Expired"
                ? "This listing has expired."
                : `${formatTimeLeft(listing.expires_at)} · expires ${new Date(
                    listing.expires_at,
                  ).toLocaleString()}`}
            </p>

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

            {isOwner ? (
              state !== "Taken" && (
                <Button
                  className="mt-3 w-full"
                  size="lg"
                  variant="outline"
                  onClick={markTaken}
                  disabled={busy}
                >
                  Mark as taken
                </Button>
              )
            ) : (
              state === "Available" && (
                <Button
                  className="mt-3 w-full"
                  size="lg"
                  variant="outline"
                  onClick={holdPickup}
                  disabled={busy}
                >
                  I'm on my way (holds {PICKUP_HOLD_MINUTES} min)
                </Button>
              )
            )}

          </div>
        )}
      </main>
    </div>
  );
}
