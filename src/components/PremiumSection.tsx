// The $1/month experiment: we ask if people would pay for faster alerts.
// No real payments yet — we only save the answer to test demand.
import { useEffect, useState } from "react";
import { Bell, Search, Filter, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { savePremiumInterest } from "@/lib/listings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const ANSWER_KEY = "scrapspot-premium-answered";

const BENEFITS = [
  { icon: Bell, label: "Nearby item alerts" },
  { icon: Search, label: "Saved searches" },
  { icon: Sparkles, label: "New listing notifications" },
  { icon: Filter, label: "Distance filters" },
];

export function PremiumSection() {
  const [answered, setAnswered] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Remembers if this visitor already answered, and who is signed in.
  useEffect(() => {
    setAnswered(Boolean(localStorage.getItem(ANSWER_KEY)));
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user.id ?? null);
    });
  }, []);

  // Saves the yes/no answer to the database.
  async function answer(interested: boolean) {
    try {
      await savePremiumInterest(interested, userId);
    } catch {
      // Even if saving fails, don't block the user.
    }
    localStorage.setItem(ANSWER_KEY, "yes");
    setAnswered(true);
  }

  return (
    <Card className="p-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-accent-foreground">
        Coming soon
      </p>
      <h2 className="mt-1 text-xl font-bold text-foreground">Find new items faster.</h2>
      <p className="mt-1 text-2xl font-bold text-primary">$1/month</p>

      <ul className="mx-auto mt-4 grid max-w-xs grid-cols-2 gap-2 text-left">
        {BENEFITS.map((benefit) => (
          <li key={benefit.label} className="flex items-center gap-2 text-sm text-muted-foreground">
            <benefit.icon className="h-4 w-4 shrink-0 text-primary" />
            {benefit.label}
          </li>
        ))}
      </ul>

      {answered ? (
        <p className="mt-5 text-sm font-medium text-foreground">
          Thanks for your feedback! 💚
        </p>
      ) : (
        <div className="mt-5">
          <p className="text-sm text-muted-foreground">
            Would you pay $1/month for instant nearby item alerts?
          </p>
          <div className="mt-3 flex justify-center gap-3">
            <Button onClick={() => answer(true)}>Yes, I'm interested</Button>
            <Button variant="outline" onClick={() => answer(false)}>
              Not right now
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
