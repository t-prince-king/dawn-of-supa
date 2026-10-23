// Terms of Service page. PLACEHOLDER: replace the body with real legal text.
import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { TERMS_OF_SERVICE_VERSION } from "@/lib/terms";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — ScrapSpot" },
      { name: "description", content: "The terms that apply when you use ScrapSpot." },
      { property: "og:title", content: "Terms of Service — ScrapSpot" },
      { property: "og:description", content: "The terms that apply when you use ScrapSpot." },
    ],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-2xl font-bold text-foreground">Terms of Service</h1>
        <p className="mt-1 text-sm text-muted-foreground">Version {TERMS_OF_SERVICE_VERSION}</p>
        <div className="mt-6 rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Placeholder — not yet legal advice-reviewed text.</p>
          <p className="mt-2">
            The ScrapSpot Terms of Service have not been written yet. Replace this page with your
            final legal terms before launch. Until then, the key rules of the service are:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>You must be 18 years or older to use ScrapSpot.</li>
            <li>Only post items you own and are allowed to give away or sell.</li>
            <li>Do not post illegal, dangerous or misleading items.</li>
            <li>Arrange pickups politely and at your own risk.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
