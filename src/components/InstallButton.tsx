// A visible "Install ScrapSpot" button.
// On Android/Chrome we use the browser's own install prompt.
// On iPhone/iPad Safari there is no prompt, so we show short instructions.
import { useEffect, useState } from "react";
import { Download, Share, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// The browser event is not in TypeScript's standard types, so we describe it here.
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function InstallButton() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Already running as an installed app? Then hide the button.
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    const handler = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    const installedHandler = () => setInstalled(true);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  if (installed) return null;

  // Uses the real install dialog when the browser offers one, otherwise explains the steps.
  async function install() {
    if (installEvent) {
      await installEvent.prompt();
      setInstallEvent(null);
      return;
    }
    setShowIosHelp(true);
  }

  return (
    <>
      <Button variant="secondary" size="lg" className="w-full" onClick={install}>
        <Download className="h-5 w-5" />
        Install ScrapSpot
      </Button>

      <Dialog open={showIosHelp} onOpenChange={setShowIosHelp}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add ScrapSpot to your home screen</DialogTitle>
            <DialogDescription>
              On iPhone and iPad, Safari adds apps from the Share menu.
            </DialogDescription>
          </DialogHeader>
          <ol className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Share className="h-4 w-4 shrink-0 text-primary" />
              1. Open ScrapSpot in Safari and tap the Share button.
            </li>
            <li className="flex items-center gap-2">
              <Plus className="h-4 w-4 shrink-0 text-primary" />
              2. Choose “Add to Home Screen”.
            </li>
            <li className="flex items-center gap-2">
              <Download className="h-4 w-4 shrink-0 text-primary" />
              3. Tap “Add”. ScrapSpot now opens like an app.
            </li>
          </ol>
        </DialogContent>
      </Dialog>
    </>
  );
}
