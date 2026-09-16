// Static hero logo — no animation.
import { Recycle } from "lucide-react";

export function HeroMedia() {
  return (
    <div aria-hidden className="pointer-events-none relative mx-auto flex h-32 w-32 items-center justify-center rounded-full bg-primary/10">
      <Recycle className="h-14 w-14 text-primary" />
    </div>
  );
}
