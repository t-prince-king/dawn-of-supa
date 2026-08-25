// Everything related to the user's location lives here.

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Gets the user's current location from their device.
// The browser will ask the user for permission the first time.
export function getUserLocation(): Promise<Coordinates> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Your device does not support location."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => reject(new Error("Location permission was denied.")),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  });
}

// Calculates the distance in miles between the user and an item
// using the haversine formula (distance on a sphere).
export function calculateDistance(
  from: Coordinates,
  to: Coordinates,
): number {
  const earthRadiusMiles = 3958.8;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLng = toRadians(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) *
      Math.cos(toRadians(to.latitude)) *
      Math.sin(deltaLng / 2) ** 2;

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
}

// Formats a distance nicely, e.g. "1.4 mi" or "850 ft".
export function formatDistance(miles: number): string {
  if (miles < 0.1) {
    const feet = Math.round(miles * 5280);
    return `${feet} ft`;
  }
  return `${miles.toFixed(1)} mi`;
}

// PRIVACY: shifts a coordinate by up to ~0.5 mile in a random direction.
// We save the shifted location (never the exact one) so a poster's
// exact home address is never stored or shown publicly.
export function fuzzLocation(coords: Coordinates): Coordinates {
  const maxOffsetDegrees = 0.007; // roughly 0.5 mile
  const randomOffset = () => (Math.random() * 2 - 1) * maxOffsetDegrees;
  return {
    latitude: coords.latitude + randomOffset(),
    longitude: coords.longitude + randomOffset(),
  };
}
