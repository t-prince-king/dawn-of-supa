// The friendly "add to home screen" prompt for phones.
// Browsers fire a "beforeinstallprompt" event when the app is installable;
// we catch it and show our own small card instead.
import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// The browser event is not in TypeScript's standard types, so we describe it here.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

const DISMISS_KEY = "scrapspot-install-dismissed";

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Don't show the prompt again if the user already said "Not Now".
    if (localStorage.getItem(DISMISS_KEY)) return;

    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!installEvent || dismissed) return null;

  // Triggers the browser's real install dialog.
  async function installApp() {
    await installEvent?.prompt();
    setInstallEvent(null);
  }

  // Hides the prompt and remembers the choice.
  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "yes");
    setDismissed(true);
  }

  return (
    <Card className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 p-4 shadow-lg">
      <Download className="h-6 w-6 shrink-0 text-primary" />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground">Want ScrapSpot on your phone?</p>
        <p className="text-xs text-muted-foreground">Install it like an app — no app store needed.</p>
      </div>
      <Button size="sm" onClick={installApp}>
        Install
      </Button>
      <Button size="sm" variant="ghost" onClick={dismiss} aria-label="Not now">
        <X className="h-4 w-4" />
      </Button>
    </Card>
  );
}
