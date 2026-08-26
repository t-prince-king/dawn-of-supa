// Admin dashboard: totals and the ability to remove listings.
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { deleteListing, getAvailableListings, type Listing } from "@/lib/listings";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — ScrapSpot" },
      { name: "description", content: "Moderate ScrapSpot listings and review premium interest." },
      { property: "og:title", content: "Admin dashboard — ScrapSpot" },
      { property: "og:description", content: "Internal moderation tools for ScrapSpot." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [listings, setListings] = useState<Listing[]>([]);
  const [premiumYes, setPremiumYes] = useState(0);
  const [premiumTotal, setPremiumTotal] = useState(0);

  // Checks the signed-in user's role on the server, then loads the data.
  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getSession();
      const userId = data.session?.user.id;
      if (!userId) {
        setChecking(false);
        return;
      }

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin");

      const allowed = Boolean(roles && roles.length > 0);
      setIsAdmin(allowed);

      if (allowed) {
        setListings(await getAvailableListings());
        const { data: answers } = await supabase.from("premium_interest").select("interested");
        setPremiumTotal(answers?.length ?? 0);
        setPremiumYes(answers?.filter((row) => row.interested).length ?? 0);
      }
      setChecking(false);
    }
    load();
  }, []);

  // Removes a listing from the app.
  async function remove(id: string) {
    try {
      await deleteListing(id);
      setListings(listings.filter((listing) => listing.id !== id));
      toast.success("Listing removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove it.");
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <p className="p-8 text-center text-sm text-muted-foreground">Checking access…</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground">Admins only</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This page is for ScrapSpot moderators.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/">Go home</Link>
          </Button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-6">
        <h1 className="text-2xl font-bold text-foreground">Admin dashboard</h1>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Available listings</p>
            <p className="text-2xl font-bold text-foreground">{listings.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Premium answers</p>
            <p className="text-2xl font-bold text-foreground">{premiumTotal}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs text-muted-foreground">Would pay $1/month</p>
            <p className="text-2xl font-bold text-primary">{premiumYes}</p>
          </Card>
        </div>

        <h2 className="mt-8 text-lg font-semibold text-foreground">All listings</h2>
        <div className="mt-3 grid gap-2">
          {listings.length === 0 ? (
            <Card className="p-5 text-center text-sm text-muted-foreground">
              No listings yet.
            </Card>
          ) : (
            listings.map((listing) => (
              <Card key={listing.id} className="flex flex-row items-center gap-3 p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground">{listing.category}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {listing.description || "No description"}
                  </p>
                </div>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/item/$id" params={{ id: listing.id }}>
                    View
                  </Link>
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => remove(listing.id)}
                  aria-label="Delete listing"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
