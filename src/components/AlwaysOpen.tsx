// Small badge reminding people the board never closes.
import { Clock } from "lucide-react";

export function AlwaysOpen() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
      <Clock className="h-3.5 w-3.5" />
      Open 24/7 — post anytime
    </span>
  );
}
