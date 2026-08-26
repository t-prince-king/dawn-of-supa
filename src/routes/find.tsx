// Find nearby items: map + list with a distance filter.
import { createFileRoute } from "@tanstack/react-router";
import { Suspense, lazy, useEffect, useMemo, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { getAvailableListings, getPhotoUrls, type Listing } from "@/lib/listings";
import { calculateDistance, getUserLocation, type Coordinates } from "@/lib/location";
import { Header } from "@/components/Header";
import { ItemCard } from "@/components/ItemCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Leaflet only works in the browser, so we load the map lazily.
const ListingMap = lazy(() => import("@/components/ListingMap"));

const DISTANCES = [1, 5, 10, 25];

export const Route = createFileRoute("/find")({
  head: () => ({
    meta: [
      { title: "Find items near you — ScrapSpot" },
      {
        name: "description",
        content: "Browse free reusable items on a map near you and filter by distance.",
      },
      { property: "og:title", content: "Find items near you — ScrapSpot" },
      {
        property: "og:description",
        content: "Map-based discovery of free reusable items within 1 to 25 miles.",
      },
    ],
  }),
  component: FindPage,
});

function FindPage() {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [maxMiles, setMaxMiles] = useState(10);
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);

  // Asks for the location, then loads the listings and their photos.
  async function start() {
    setLoading(true);
    setLocationError(null);
    try {
      const position = await getUserLocation();
      setCoords(position);
      const items = await getAvailableListings();
      setListings(items);
      setPhotoUrls(await getPhotoUrls(items.map((item) => item.photo_url)));
    } catch (error) {
      setLocationError(error instanceof Error ? error.message : "Something went wrong.");
    }
    setLoading(false);
  }

  useEffect(() => {
    start();
  }, []);

  // Keeps only the items inside the chosen distance, closest first.
  const nearby = useMemo(() => {
    if (!coords) return [];
    return listings
      .map((listing) => ({
        listing,
        miles: calculateDistance(coords, {
          latitude: listing.latitude,
          longitude: listing.longitude,
        }),
      }))
      .filter((entry) => entry.miles <= maxMiles)
      .sort((a, b) => a.miles - b.miles);
  }, [coords, listings, maxMiles]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground">Find something</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Items near you, closest first. Pins are approximate.
        </p>

        {/* Distance filter */}
        <div className="mt-4 flex gap-2">
          {DISTANCES.map((miles) => (
            <Button
              key={miles}
              size="sm"
              variant={maxMiles === miles ? "default" : "outline"}
              onClick={() => setMaxMiles(miles)}
            >
              {miles} mi
            </Button>
          ))}
        </div>

        {loading && (
          <p className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Finding items near you…
          </p>
        )}

        {locationError && (
          <Card className="mt-6 p-5 text-center">
            <MapPin className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">{locationError}</p>
            <Button className="mt-4" onClick={start}>
              Try again
            </Button>
          </Card>
        )}

        {coords && !loading && (
          <>
            <div className="mt-4">
              <Suspense
                fallback={<div className="h-[320px] w-full animate-pulse rounded-xl bg-muted" />}
              >
                <ListingMap
                  userLocation={coords}
                  listings={nearby.map((entry) => entry.listing)}
                  selectedId={selectedId}
                  onMarkerClick={setSelectedId}
                />
              </Suspense>
            </div>

            <div className="mt-5 grid gap-3">
              {nearby.length === 0 ? (
                <Card className="p-6 text-center text-sm text-muted-foreground">
                  Nothing within {maxMiles} miles yet. Try a bigger distance.
                </Card>
              ) : (
                nearby.map((entry) => (
                  <ItemCard
                    key={entry.listing.id}
                    listing={entry.listing}
                    photoUrl={photoUrls[entry.listing.photo_url]}
                    distanceMiles={entry.miles}
                  />
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
