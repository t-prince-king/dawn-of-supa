// My Listings: everything the signed-in user has posted, grouped by status.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PackagePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  getListingState,
  getMyListings,
  getPhotoUrls,
  type Listing,
  type ListingState,
} from "@/lib/listings";
import { Header } from "@/components/Header";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/my-listings")({
  head: () => ({
    meta: [
      { title: "My listings — ScrapSpot" },
      {
        name: "description",
        content: "See the items you have posted on ScrapSpot and whether they are still available.",
      },
      { property: "og:title", content: "My listings — ScrapSpot" },
      {
        property: "og:description",
        content: "Your posted items, with their current availability.",
      },
    ],
  }),
  component: MyListingsPage,
});

// The groups shown on the page, in order.
const GROUPS: { title: string; states: ListingState[] }[] = [
  { title: "Active", states: ["Available", "Pickup pending"] },
  { title: "Taken", states: ["Taken"] },
  { title: "Expired", states: ["Expired"] },
];

function MyListingsPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  // Loads the signed-in user's own listings plus their photo links.
  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id ?? null;
      setSignedIn(Boolean(userId));
      if (userId) {
        const mine = await getMyListings(userId);
        setListings(mine);
        setPhotoUrls(await getPhotoUrls(mine.map((item) => item.photo_url)));
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground">My listings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everything you have posted.</p>

        {loading && <p className="mt-8 text-center text-sm text-muted-foreground">Loading…</p>}

        {!loading && signedIn === false && (
          <Card className="mt-6 p-6 text-center">
            <p className="text-sm text-muted-foreground">Sign in to see your listings.</p>
            <Button className="mt-4" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          </Card>
        )}

        {!loading && signedIn && listings.length === 0 && (
          <Card className="mt-6 p-6 text-center">
            <p className="text-sm text-muted-foreground">You have not posted anything yet.</p>
            <Button className="mt-4" asChild>
              <Link to="/post">
                <PackagePlus className="h-4 w-4" />
                Post something
              </Link>
            </Button>
          </Card>
        )}

        {!loading &&
          signedIn &&
          listings.length > 0 &&
          GROUPS.map((group) => {
            const items = listings.filter((listing) =>
              group.states.includes(getListingState(listing)),
            );
            if (items.length === 0) return null;
            return (
              <section key={group.title} className="mt-6">
                <h2 className="text-sm font-semibold text-foreground">
                  {group.title} ({items.length})
                </h2>
                <div className="mt-3 grid gap-3">
                  {items.map((listing) => (
                    <ItemCard
                      key={listing.id}
                      listing={listing}
                      photoUrl={photoUrls[listing.photo_url]}
                    />
                  ))}
                </div>
              </section>
            );
          })}
      </main>
    </div>
  );
}
