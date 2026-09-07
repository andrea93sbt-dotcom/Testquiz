import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LEGAL } from "@/lib/legal";
import { useAds } from "@/lib/ads-store";
import { useLegal } from "@/lib/legal-store";
import { blip, unlockAudio } from "@/game/sfx";

export function ConsentBanner() {
  const [ready, setReady] = useState(false);
  const consent = useAds((s) => s.consent);
  const accept = useAds((s) => s.accept);
  const ageOk = useLegal((s) => s.ageOk);
  const setAge = useLegal((s) => s.setAge);

  useEffect(() => {
    const done = () => {
      if (useAds.persist.hasHydrated() && useLegal.persist.hasHydrated()) setReady(true);
    };
    const a = useAds.persist.onFinishHydration(done);
    const b = useLegal.persist.onFinishHydration(done);
    done();
    return () => {
      a();
      b();
    };
  }, []);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const onLegal =
    pathname === "/privacy" ||
    pathname === "/cookie" ||
    pathname === "/termini" ||
    pathname === "/accessibilita";

  if (!ready || consent === "all" || onLegal) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ads-consent-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-bg/80 p-4 backdrop-blur-sm sm:items-center"
    >
      <div className="w-full max-w-md pixel-panel marquee p-6">
        <p className="font-pixel text-[9px] tracking-[0.2em] text-ticket">INSERT COIN</p>
        <p id="ads-consent-title" className="mt-3 font-display text-2xl italic text-fg">
          Annunci
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Platea è gratuita in cambio degli annunci. Senza consenso AdSense non si
          può usare il questionario.{" "}
          <Link to="/privacy" className="text-fg underline underline-offset-2">
            Privacy
          </Link>
          {" · "}
          <Link to="/cookie" className="text-fg underline underline-offset-2">
            Cookie
          </Link>
        </p>
        <label className="mt-5 flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            className="mt-1 size-4 shrink-0 accent-accent"
            checked={ageOk}
            onChange={(e) => setAge(e.target.checked)}
          />
          <span>Ho almeno {LEGAL.ageMin} anni.</span>
        </label>
        <Button
          size="lg"
          className="mt-5 min-h-14 w-full"
          disabled={!ageOk}
          onClick={() => {
            unlockAudio();
            blip("start");
            accept();
          }}
        >
          ACCETTA
        </Button>
      </div>
    </div>
  );
}
