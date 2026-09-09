// The soft animated glow behind the hero heading. Decoration only.
import { Recycle } from "lucide-react";

export function HeroMedia() {
  return (
    <div aria-hidden className="pointer-events-none relative mx-auto h-32 w-32">
      <span className="scrapspot-orb absolute inset-0 rounded-full bg-primary/20 blur-2xl" />
      <span className="scrapspot-pulse absolute inset-4 rounded-full border-2 border-primary/40" />
      <span className="scrapspot-hero absolute inset-0 flex items-center justify-center">
        <Recycle className="h-14 w-14 text-primary" />
      </span>
    </div>
  );
}
