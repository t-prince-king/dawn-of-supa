// Sign in / sign up page (email + password).
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — ScrapSpot" },
      {
        name: "description",
        content: "Sign in or create a free ScrapSpot account to post reusable items near you.",
      },
      { property: "og:title", content: "Sign in — ScrapSpot" },
      { property: "og:description", content: "Create a free account to post items on ScrapSpot." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  // Sends the email + password to the backend.
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      setBusy(false);
      if (error) {
        toast.error(error.message);
        return;
      }
      toast.success("Account created! You're signed in.");
      navigate({ to: "/" });
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back!");
    navigate({ to: "/" });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-bold text-foreground">
          {isSignUp ? "Create your account" : "Sign in"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          You only need an account to post items. Browsing is always free.
        </p>

        <Card className="mt-6 p-5">
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 6 characters"
              />
            </div>
            <Button type="submit" disabled={busy}>
              {busy ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="mt-4 w-full text-sm text-muted-foreground underline"
          >
            {isSignUp ? "I already have an account" : "New here? Create an account"}
          </button>
        </Card>
      </main>
    </div>
  );
}
