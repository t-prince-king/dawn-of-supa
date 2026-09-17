// One item card in the nearby list: photo, category, description, distance.
import { Link } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { getCategoryIcon } from "@/lib/categories";
import { formatDistance } from "@/lib/location";
import {
  formatPrice,
  getListingState,
  getPhotoUrl,
  type Listing,
} from "@/lib/listings";
import { ImageViewer } from "@/components/ImageViewer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ItemCardProps {
  listing: Listing;
  photoUrl?: string | undefined;
  distanceMiles?: number | undefined;
}

export function ItemCard({ listing, photoUrl, distanceMiles }: ItemCardProps) {
  const CategoryIcon = getCategoryIcon(listing.category);
  const [viewerOpen, setViewerOpen] = useState(false);
  // If a viewing link has gone stale, ask for a fresh one once.
  const [freshUrl, setFreshUrl] = useState<string | undefined>(undefined);
  const [retried, setRetried] = useState(false);
  const shownUrl = freshUrl ?? photoUrl;

  async function retryPhoto() {
    if (retried) return;
    setRetried(true);
    const url = await getPhotoUrl(listing.photo_url);
    if (url) setFreshUrl(url);
  }

  return (
    <Card className="flex flex-row items-center gap-3 p-3">
      {shownUrl ? (
        <button
          type="button"
          onClick={() => setViewerOpen(true)}
          aria-label={`Enlarge photo of ${listing.category}`}
          className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted"
        >
          <img
            src={shownUrl}
            alt={listing.category}
            loading="lazy"
            onError={retryPhoto}
            className="h-full w-full object-contain"
          />
        </button>
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
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-bold text-primary">{formatPrice(listing)}</span>
          <Badge variant="secondary" className="text-xs">
            {getListingState(listing)}
          </Badge>
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

      {viewerOpen && photoUrl && (
        <ImageViewer
          src={photoUrl}
          alt={listing.category}
          onClose={() => setViewerOpen(false)}
        />
      )}
    </Card>
  );
}
