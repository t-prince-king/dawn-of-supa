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
}

const PHOTO_BUCKET = "listing-photos";

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
export async function createListing(listing: {
  user_id: string;
  photo_url: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
}): Promise<void> {
  const { error } = await supabase.from("listings").insert(listing);
  if (error) throw new Error("Could not save your listing. Please try again.");
}

// Finds listings near the user's location (all available ones;
// distance filtering happens in the app so it feels instant).
export async function getAvailableListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "available")
    .order("created_at", { ascending: false });

  if (error) throw new Error("Could not load listings.");
  return data as Listing[];
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
