// The map that shows the user's location and nearby item markers.
// This file uses Leaflet, which only works in the browser — pages must
// load it lazily (React.lazy) so the server never tries to render it.
import { MapContainer, TileLayer, Marker, CircleMarker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import type { Coordinates } from "@/lib/location";
import type { Listing } from "@/lib/listings";

// Displays an item marker on the map as a small green dot.
function createItemIcon(isSelected: boolean) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:${isSelected ? 22 : 16}px;
      height:${isSelected ? 22 : 16}px;
      border-radius:9999px;
      background:${isSelected ? "#0284c7" : "#16a34a"};
      border:3px solid white;
      box-shadow:0 1px 4px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  });
}

// Moves the map view whenever the center changes.
function ChangeView({ center }: { center: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    map.setView([center.latitude, center.longitude], map.getZoom());
  }, [center, map]);
  return null;
}

interface ListingMapProps {
  userLocation: Coordinates;
  listings: Listing[];
  selectedId?: string;
  onMarkerClick?: (listingId: string) => void;
  height?: string;
}

export default function ListingMap({
  userLocation,
  listings,
  selectedId,
  onMarkerClick,
  height = "320px",
}: ListingMapProps) {
  const center: [number, number] = [userLocation.latitude, userLocation.longitude];

  return (
    <div style={{ height }} className="w-full overflow-hidden rounded-xl border border-border">
      <MapContainer center={center} zoom={13} className="h-full w-full" scrollWheelZoom>
        {/* Free OpenStreetMap tiles — no API key needed */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={userLocation} />

        {/* The user's approximate location (blue dot) */}
        <CircleMarker
          center={center}
          radius={9}
          pathOptions={{ color: "white", weight: 3, fillColor: "#0284c7", fillOpacity: 1 }}
        />

        {/* One green marker per listing */}
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.latitude, listing.longitude]}
            icon={createItemIcon(listing.id === selectedId)}
            eventHandlers={{ click: () => onMarkerClick?.(listing.id) }}
          />
        ))}
      </MapContainer>
    </div>
  );
}
