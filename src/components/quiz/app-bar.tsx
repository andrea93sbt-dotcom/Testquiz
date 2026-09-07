import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAds } from "@/lib/ads-store";
import { useQuiz } from "@/lib/store";

export function AppBar() {
  const home = useQuiz((s) => s.home);
  const decline = useAds((s) => s.decline);
  const [askOff, setAskOff] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="min-h-11 px-2" onClick={home}>
          Menu
        </Button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center rounded-md border border-border bg-raised px-3 text-sm text-fg"
          onClick={() => setAskOff((v) => !v)}
          aria-expanded={askOff}
        >
          Annunci on
        </button>
      </div>
      {askOff ? (
        <div className="mt-3 rounded-md border border-border bg-surface p-4">
          <p className="text-sm leading-relaxed text-muted">
            Gli annunci tengono Platea gratis. Se li spegni, il quiz si chiude.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" className="min-h-11" onClick={() => setAskOff(false)}>
              Lascia accesi
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="min-h-11"
              onClick={() => {
                decline();
                home();
              }}
            >
              Spegni
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
