// The top bar shown on every page: logo, main links, and sign in/out.
import { Link, useNavigate } from "@tanstack/react-router";
import { Recycle, Search, PlusCircle, LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function Header() {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Watches the sign-in state so the header shows the right button.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsSignedIn(Boolean(data.session));
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(Boolean(session));
    });
    return () => subscription.unsubscribe();
  }, []);

  // Signs the user out and sends them back home.
  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-foreground">
          <Recycle className="h-6 w-6 text-primary" />
          <span className="text-lg">ScrapSpot</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/find">
              <Search className="h-4 w-4" />
              <span className="hidden sm:inline">Find Items</span>
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/post">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Post</span>
            </Link>
          </Button>
          {isSignedIn ? (
            <Button variant="ghost" size="sm" onClick={signOut}>
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
          ) : (
            <Button variant="ghost" size="sm" asChild>
              <Link to="/auth">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
