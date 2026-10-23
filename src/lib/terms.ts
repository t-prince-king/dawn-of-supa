// Terms of Service / Privacy Policy acceptance: versions, check and record.
import { supabase } from "@/integrations/supabase/client";

// Bump these when the legal documents change; users who accepted an older
// version will be asked to accept again.
export const TERMS_OF_SERVICE_VERSION = "2026-10-23";
export const PRIVACY_POLICY_VERSION = "2026-10-23";

// Has this user accepted the current versions of both documents?
export async function hasAcceptedCurrentTerms(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("terms_acceptances")
    .select("id")
    .eq("user_id", userId)
    .eq("tos_version", TERMS_OF_SERVICE_VERSION)
    .eq("privacy_version", PRIVACY_POLICY_VERSION)
    .maybeSingle();
  if (error) {
    console.error("[terms] could not check acceptance", error);
    return false;
  }
  return Boolean(data);
}

// Saves the user's acceptance. Returns null on success, or a friendly error.
export async function recordTermsAcceptance(userId: string): Promise<string | null> {
  const { error } = await supabase.from("terms_acceptances").insert({
    user_id: userId,
    tos_version: TERMS_OF_SERVICE_VERSION,
    privacy_version: PRIVACY_POLICY_VERSION,
  });
  if (error) {
    // 23505 = already recorded for these versions; that still counts.
    if (error.code === "23505") return null;
    console.error("[terms] could not record acceptance", error);
    return "We couldn't save your acceptance. Please try again.";
  }
  return null;
}
