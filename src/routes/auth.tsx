// Sign in / sign up page (email + password).
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { hasAcceptedCurrentTerms, recordTermsAcceptance } from "@/lib/terms";
import { Header } from "@/components/Header";
import { TermsCheckbox } from "@/components/TermsConsent";
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
  const [checkEmail, setCheckEmail] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [termsError, setTermsError] = useState("");

  // Signs the user out when acceptance could not be saved, so nobody gets
  // access without a recorded acceptance.
  async function failAndSignOut(message: string) {
    await supabase.auth.signOut();
    setTermsError(message);
  }

  // After a successful sign-in, make sure the current terms are accepted.
  // Returns true when the user may continue.
  async function ensureTermsAccepted(userId: string): Promise<boolean> {
    if (await hasAcceptedCurrentTerms(userId)) return true;
    if (!acceptedTerms) {
      await failAndSignOut(
        "Please tick the box to confirm you are 18 or older and accept the terms, then sign in again.",
      );
      return false;
    }
    const error = await recordTermsAcceptance(userId);
    if (error) {
      await failAndSignOut(error);
      return false;
    }
    return true;
  }

  // Sends the email + password to the backend.
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setTermsError("");

    // New accounts must actively confirm age + terms before we even try.
    if (isSignUp && !acceptedTerms) {
      setTermsError(
        "Please tick the box to confirm you are 18 or older and accept the Terms of Service and Privacy Policy.",
      );
      return;
    }

    setBusy(true);

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin },
      });
      if (error) {
        setBusy(false);
        toast.error(error.message);
        return;
      }
      // With email confirmation on there is no session yet — the user must
      // click the link in their email before they can sign in and post.
      // Their acceptance is recorded when they first sign in.
      if (!data.session) {
        setBusy(false);
        setCheckEmail(true);
        return;
      }
      const userId = data.session.user.id;
      const recordError = await recordTermsAcceptance(userId);
      setBusy(false);
      if (recordError) {
        await failAndSignOut(recordError);
        return;
      }
      toast.success("Account created! You're signed in.");
      navigate({ to: "/" });
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setBusy(false);
      toast.error(error.message);
      return;
    }
    const userId = data.session?.user.id;
    const allowed = userId ? await ensureTermsAccepted(userId) : false;
    setBusy(false);
    if (!allowed) return;
    toast.success("Welcome back!");
    navigate({ to: "/" });
  }

  // Emails a link that opens the "set a new password" page.
  async function sendResetEmail() {
    if (!email) {
      toast.error("Enter your email first, then tap Forgot password.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Password reset email sent. Check your inbox.");
  }

  // Shown right after signing up, while they go and confirm their email.
  if (checkEmail) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-md px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We sent a confirmation link to {email}. Click it to verify your account, then come
            back and sign in to post items.
          </p>
          <Button
            className="mt-6"
            onClick={() => {
              setCheckEmail(false);
              setIsSignUp(false);
              setPassword("");
            }}
          >
            Back to sign in
          </Button>
        </main>
      </div>
    );
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

          {!isSignUp && (
            <button
              type="button"
              onClick={sendResetEmail}
              disabled={busy}
              className="mt-4 w-full text-sm text-muted-foreground underline"
            >
              Forgot password?
            </button>
          )}

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
