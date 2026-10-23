// The 18+ / terms checkbox, plus a consent prompt for signed-in users who
// have not accepted the current terms yet.
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { recordTermsAcceptance } from "@/lib/terms";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// One unchecked-by-default checkbox with clickable legal links. The links
// open in a new tab so the form keeps everything the user typed.
export function TermsCheckbox({
  checked,
  onChange,
  id = "terms-accept",
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-2 text-sm text-muted-foreground">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-0.5 h-4 w-4 shrink-0 accent-primary"
      />
      <span>
        I confirm that I am 18 years or older and agree to the{" "}
        <Link to="/terms" target="_blank" className="font-medium text-foreground underline">
          Terms of Service
        </Link>{" "}
        and acknowledge the{" "}
        <Link to="/privacy" target="_blank" className="font-medium text-foreground underline">
          Privacy Policy
        </Link>
        .
      </span>
    </label>
  );
}

// Shown to signed-in users who have not accepted the current terms yet
// (for example accounts created before this requirement existed).
export function ConsentPrompt({ userId, onAccepted }: { userId: string; onAccepted: () => void }) {
  const [checked, setChecked] = useState(false);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    if (!checked) {
      toast.error("Please check the box to confirm you are 18 or older and accept the terms.");
      return;
    }
    setBusy(true);
    const error = await recordTermsAcceptance(userId);
    setBusy(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Thanks! You're all set.");
    onAccepted();
  }

  return (
    <Card className="mx-auto mt-10 max-w-md p-5">
      <h2 className="text-lg font-bold text-foreground">One quick thing</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Before you continue, please confirm your age and accept our updated terms.
      </p>
      <div className="mt-4">
        <TermsCheckbox checked={checked} onChange={setChecked} id="terms-accept-gate" />
      </div>
      <Button className="mt-4 w-full" onClick={confirm} disabled={busy}>
        {busy ? "Saving…" : "Continue"}
      </Button>
    </Card>
  );
}
