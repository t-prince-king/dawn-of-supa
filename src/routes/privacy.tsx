// Privacy Policy page. PLACEHOLDER: replace the body with real legal text.
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { PRIVACY_POLICY_VERSION } from "@/lib/terms";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — ScrapSpot" },
      { name: "description", content: "How ScrapSpot handles your data." },
      { property: "og:title", content: "Privacy Policy — ScrapSpot" },
      { property: "og:description", content: "How ScrapSpot handles your data." },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
        <p className="mt-1 text-sm text-muted-foreground">Version {PRIVACY_POLICY_VERSION}</p>
        <div className="mt-6 rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Placeholder — not yet legal advice-reviewed text.</p>
          <p className="mt-2">
            The ScrapSpot Privacy Policy has not been written yet. Replace this page with your
            final policy before launch. Until then, the basics of how the app handles data:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Your email and password are handled by the sign-in provider; passwords are never stored in the app database.</li>
            <li>Listings store the photo, category and location you choose to share.</li>
            <li>Listing photos are visible to people browsing listings.</li>
            <li>You can delete your own listings at any time.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
