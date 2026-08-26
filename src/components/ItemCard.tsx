// One item card in the nearby list: photo, category, description, distance.
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { getCategoryIcon } from "@/lib/categories";
import { formatDistance } from "@/lib/location";
import type { Listing } from "@/lib/listings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ItemCardProps {
  listing: Listing;
  photoUrl?: string | undefined;
  distanceMiles?: number | undefined;
}

export function ItemCard({ listing, photoUrl, distanceMiles }: ItemCardProps) {
  const CategoryIcon = getCategoryIcon(listing.category);

  return (
    <Card className="flex flex-row items-center gap-3 p-3">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={listing.category}
          loading="lazy"
          className="h-20 w-20 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-muted">
          <CategoryIcon className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <CategoryIcon className="h-4 w-4 text-primary" />
          {listing.category}
        </div>
        {listing.description && (
          <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
            {listing.description}
          </p>
        )}
        {distanceMiles !== undefined && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {formatDistance(distanceMiles)} away
          </p>
        )}
      </div>

      <Button size="sm" variant="outline" asChild>
        <Link to="/item/$id" params={{ id: listing.id }}>
          View
        </Link>
      </Button>
    </Card>
  );
}
