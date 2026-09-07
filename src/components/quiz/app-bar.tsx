import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAds } from "@/lib/ads-store";
import { useQuiz } from "@/lib/store";

export function AppBar() {
  const home = useQuiz((s) => s.home);
  const decline = useAds((s) => s.decline);
  const [askOff, setAskOff] = useState(false);

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="min-h-11 px-2 font-pixel text-[9px]" onClick={home}>
          MENU
        </Button>
        <button
          type="button"
          className="inline-flex min-h-11 items-center pixel-chip px-3 font-pixel text-[8px] text-ok"
          onClick={() => setAskOff((v) => !v)}
          aria-expanded={askOff}
        >
          ADS ON
        </button>
      </div>
      {askOff ? (
        <div className="mt-3 pixel-panel p-4">
          <p className="text-sm leading-relaxed text-muted">
            Gli annunci tengono Platea gratis. Se li spegni, il quiz si chiude.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" className="min-h-11 font-pixel text-[9px]" onClick={() => setAskOff(false)}>
              LASCIA
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="min-h-11 font-pixel text-[9px]"
              onClick={() => {
                decline();
                home();
              }}
            >
              SPEGNI
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
