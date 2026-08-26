// Post an item: photo → category → location → done.
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Camera, MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { CATEGORIES } from "@/lib/categories";
import { createListing, uploadItemPhoto } from "@/lib/listings";
import { fuzzLocation, getUserLocation, type Coordinates } from "@/lib/location";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/post")({
  head: () => ({
    meta: [
      { title: "Post an item — ScrapSpot" },
      {
        name: "description",
        content: "Give away reusable items in seconds: add a photo, pick a category, share your area.",
      },
      { property: "og:title", content: "Post an item — ScrapSpot" },
      {
        property: "og:description",
        content: "Add a photo and category so neighbours can salvage your item.",
      },
    ],
  }),
  component: PostPage,
});

function PostPage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [checkingUser, setCheckingUser] = useState(true);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState(CATEGORIES[0]?.name ?? "Other");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Who is signed in?
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
      setCheckingUser(false);
    });
  }, []);

  // Shows a small preview of the chosen photo.
  function choosePhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0] ?? null;
    setFile(chosen);
    setPreviewUrl(chosen ? URL.createObjectURL(chosen) : null);
  }

  // Asks the browser for the user's location.
  async function useMyLocation() {
    setLocating(true);
    try {
      setCoords(await getUserLocation());
      toast.success("Location added (blurred for your privacy).");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not get your location.");
    }
    setLocating(false);
  }

  // Uploads the photo, then saves the listing.
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!userId) return;
    if (!file) {
      toast.error("Please add a photo of the item.");
      return;
    }
    if (!coords) {
      toast.error("Please share your location so people can find it.");
      return;
    }

    setSaving(true);
    try {
      const photoPath = await uploadItemPhoto(file, userId);
      const safeCoords = fuzzLocation(coords);
      await createListing({
        user_id: userId,
        photo_url: photoPath,
        category,
        description: description.trim(),
        latitude: safeCoords.latitude,
        longitude: safeCoords.longitude,
      });
      toast.success("Posted! Someone nearby can now save it.");
      navigate({ to: "/find" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    }
    setSaving(false);
  }

  if (checkingUser) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <p className="p-8 text-center text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  // Not signed in yet → ask them to sign in first.
  if (!userId) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground">Sign in to post</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A free account keeps listings trustworthy. It takes a few seconds.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/auth">Sign in or create account</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-md px-4 py-8">
        <h1 className="text-2xl font-bold text-foreground">Post something</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Three quick steps and it's live on the map.
        </p>

        <form onSubmit={submit} className="mt-6 grid gap-5">
          {/* 1. Photo */}
          <Card className="p-4">
            <Label htmlFor="photo" className="text-sm font-semibold">
              1. Add a photo
            </Label>
            <input
              id="photo"
              type="file"
              accept="image/*"
              capture="environment"
              onChange={choosePhoto}
              className="mt-2 block w-full text-sm text-muted-foreground"
            />
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Your item"
                className="mt-3 h-40 w-full rounded-lg object-cover"
              />
            ) : (
              <div className="mt-3 flex h-40 items-center justify-center rounded-lg bg-muted">
                <Camera className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </Card>

          {/* 2. Category + description */}
          <Card className="p-4">
            <p className="text-sm font-semibold text-foreground">2. What is it?</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {CATEGORIES.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setCategory(item.name)}
                  className={`flex items-center gap-2 rounded-lg border p-2 text-left text-sm transition-colors ${
                    category === item.name
                      ? "border-primary bg-secondary font-semibold text-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  <item.icon className="h-4 w-4 shrink-0 text-primary" />
                  {item.name}
                </button>
              ))}
            </div>

            <Label htmlFor="description" className="mt-4 block text-sm">
              Short description (optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Old oak table, needs a sand but solid."
              maxLength={200}
              className="mt-1.5"
            />
          </Card>

          {/* 3. Location */}
          <Card className="p-4">
            <p className="text-sm font-semibold text-foreground">3. Where is it?</p>
            <p className="mt-1 text-xs text-muted-foreground">
              We shift the pin randomly by up to half a mile — your exact address is never saved.
            </p>
            <Button
              type="button"
              variant={coords ? "secondary" : "outline"}
              className="mt-3 w-full"
              onClick={useMyLocation}
              disabled={locating}
            >
              {locating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              {coords ? "Location added" : "Use my current location"}
            </Button>
          </Card>

          <Button type="submit" size="lg" disabled={saving}>
            {saving ? "Posting…" : "Post item"}
          </Button>
        </form>
      </main>
    </div>
  );
}
