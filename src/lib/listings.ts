// Everything that talks to the database and photo storage lives here.
import { supabase } from "@/integrations/supabase/client";

// One listing = one posted item.
export interface Listing {
  id: string;
  user_id: string;
  photo_url: string;
  category: string;
  description: string | null;
  latitude: number;
  longitude: number;
  status: string;
  created_at: string;
  expires_at: string;
  pending_until: string | null;
  is_free: boolean;
  price: number | null;
}

// Shows either "FREE" or the asking price.
export function formatPrice(listing: Listing): string {
  if (listing.is_free || listing.price === null) return "FREE";
  return `$${Number(listing.price).toFixed(2)}`;
}

// Friendly "time left" text, e.g. "2 days left" or "5 hours left".
export function formatTimeLeft(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return "Expired";
  const hours = Math.floor(ms / (60 * 60 * 1000));
  if (hours < 1) return "Less than an hour left";
  if (hours < 48) return `${hours} hour${hours === 1 ? "" : "s"} left`;
  return `${Math.floor(hours / 24)} days left`;
}


const PHOTO_BUCKET = "listing-photos";

// How long a "pickup pending" hold lasts before the item goes back to available.
export const PICKUP_HOLD_MINUTES = 60;

// The four states a listing can be in, as shown to people.
export type ListingState = "Available" | "Pickup pending" | "Taken" | "Expired";

// Works out the real state right now (holds and expiry are time-based).
export function getListingState(listing: Listing): ListingState {
  if (listing.status === "taken") return "Taken";
  if (new Date(listing.expires_at).getTime() <= Date.now()) return "Expired";
  if (
    listing.status === "pending" &&
    listing.pending_until &&
    new Date(listing.pending_until).getTime() > Date.now()
  ) {
    return "Pickup pending";
  }
  return "Available";
}

// How long a poster can keep an item listed.
export const DURATIONS = [
  { label: "Today", hours: 24 },
  { label: "3 days", hours: 72 },
  { label: "7 days", hours: 168 },
];

// Uploads the item's photo and returns its storage path.
// Photos are stored inside a folder named after the user's id.
export async function uploadItemPhoto(
  file: File,
  userId: string,
): Promise<string> {
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) throw new Error("Photo upload failed. Please try again.");
  return path;
}

// Creates a new listing in the database.
// It first checks for an identical listing from the last few minutes, so a
// double tap (or a page that submits twice) can never create two rows.
export async function createListing(listing: {
  user_id: string;
  photo_url: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
  hours: number;
}): Promise<void> {
  const { hours, ...values } = listing;
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

  const { data: recent } = await supabase
    .from("listings")
    .select("id")
    .eq("user_id", values.user_id)
    .eq("category", values.category)
    .eq("latitude", values.latitude)
    .eq("longitude", values.longitude)
    .gte("created_at", fiveMinutesAgo)
    .limit(1);

  if (recent && recent.length > 0) return; // already posted a moment ago

  const expiresAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  const { error } = await supabase
    .from("listings")
    .insert({ ...values, expires_at: expiresAt });
  if (error) throw new Error("Could not save your listing. Please try again.");
}

// Finds listings that are still up for grabs (not taken, not expired).
// Distance filtering happens in the app so it feels instant.
export async function getAvailableListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .neq("status", "taken")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  if (error) throw new Error("Could not load listings.");

  // Safety net: never show the same listing twice.
  const seen = new Set<string>();
  return (data as Listing[]).filter((listing) => {
    if (seen.has(listing.id)) return false;
    seen.add(listing.id);
    return true;
  });
}

// Poster marks their own item as taken (it then leaves the normal results).
export async function markListingTaken(id: string): Promise<void> {
  const { error } = await supabase
    .from("listings")
    .update({ status: "taken", pending_until: null })
    .eq("id", id);
  if (error) throw new Error("Could not update this listing.");
}

// Someone says they are on their way: puts a short hold on the item.
export async function holdListingForPickup(id: string): Promise<void> {
  const until = new Date(Date.now() + PICKUP_HOLD_MINUTES * 60 * 1000).toISOString();
  const { error } = await supabase
    .from("listings")
    .update({ status: "pending", pending_until: until })
    .eq("id", id);
  if (error) throw new Error("Could not hold this item.");
}

// Loads a single listing by its id (for the item details page).
export async function getListing(id: string): Promise<Listing | null> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error("Could not load this item.");
  return data as Listing | null;
}

// Deletes one of the user's own listings (admins can delete any).
export async function deleteListing(id: string): Promise<void> {
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw new Error("Could not delete this listing.");
}

// Photos are stored privately, so we create short-lived signed URLs
// (valid for 1 hour) to display them. Works for one or many photos.
export async function getPhotoUrls(
  paths: string[],
): Promise<Record<string, string>> {
  if (paths.length === 0) return {};

  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrls(paths, 60 * 60);

  if (error) return {};

  const urls: Record<string, string> = {};
  for (const entry of data) {
    if (entry.path && entry.signedUrl) urls[entry.path] = entry.signedUrl;
  }
  return urls;
}

// Saves the answer to the $1/month premium question (demand test only).
export async function savePremiumInterest(
  interested: boolean,
  userId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from("premium_interest")
    .insert({ interested, user_id: userId });

  if (error) throw new Error("Could not save your answer.");
}
