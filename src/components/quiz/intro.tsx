import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { LegalFooter } from "@/components/legal/legal-footer";
import { PLATFORM_META } from "@/data/types";
import type { Option } from "@/data/types";
import { CATALOG_SIZE } from "@/data/movies";
import { LEGAL } from "@/lib/legal";
import { useLegal } from "@/lib/legal-store";
import { useAds } from "@/lib/ads-store";
import { useQuiz } from "@/lib/store";
import { Arena } from "@/game/arena";
import { blip, unlockAudio } from "@/game/sfx";

const DEMO: Option[] = [
  { id: "demo-up", label: "Su · classici", w: {} },
  { id: "demo-down", label: "Giù · novità", w: {} },
  { id: "demo-left", label: "Sx · leggerezza", w: {} },
  { id: "demo-right", label: "Dx · buio", w: {} },
];

export function Intro() {
  const start = useQuiz((s) => s.start);
  const answers = useQuiz((s) => s.answers);
  const platforms = useQuiz((s) => s.platforms);
  const goTo = useQuiz((s) => s.goTo);
  const ageOk = useLegal((s) => s.ageOk);
  const setAge = useLegal((s) => s.setAge);
  const consent = useAds((s) => s.consent);
  const [hydrated, setHydrated] = useState(false);
  const hasProgress = Object.keys(answers).length > 0;
  const platformLine =
    platforms.length > 0
      ? platforms.map((p) => PLATFORM_META[p].label).join(" · ")
      : null;
  const canPlay = hydrated && ageOk && consent === "all";

  useEffect(() => {
    const done = () => {
      if (useLegal.persist.hasHydrated() && useAds.persist.hasHydrated()) {
        setHydrated(true);
      }
    };
    const a = useLegal.persist.onFinishHydration(done);
    const b = useAds.persist.onFinishHydration(done);
    done();
    return () => {
      a();
      b();
    };
  }, []);

  return (
    <div className="relative min-h-dvh scanlines">
      <main
        id="contenuto"
        className="relative z-10 mx-auto flex min-h-dvh max-w-xl flex-col px-4 py-6 sm:px-6"
      >
        <header className="rise-in">
          <p className="font-pixel text-[10px] tracking-[0.28em] text-ticket">PLATEA 16-BIT</p>
          <h1 className="mt-4 font-display text-4xl italic leading-[1.05] text-fg md:text-5xl">
            Quattro cinema.
          </h1>
          <p className="mt-3 max-w-md text-sm text-muted">
            Un omino, quattro sale. Frecce o swipe. {CATALOG_SIZE.toLocaleString("it-IT")} film
            IMDb.
          </p>
          {platformLine ? <p className="mt-2 font-pixel text-[9px] text-ok">{platformLine}</p> : null}
        </header>

        <div className="mt-5 min-h-[22rem] flex-1">
          <Arena
            demo
            question="Prova una sala. Poi premi START."
            options={DEMO}
          />
        </div>

        <section className="mt-5 flex flex-col gap-4">
          <label className="flex items-start gap-3 text-sm text-muted">
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-accent"
              checked={hydrated && ageOk}
              onChange={(e) => setAge(e.target.checked)}
            />
            <span>Ho almeno {LEGAL.ageMin} anni.</span>
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              disabled={!canPlay}
              className="min-h-14 w-full font-pixel text-[11px] sm:w-auto"
              onClick={() => {
                unlockAudio();
                blip("start");
                start();
              }}
            >
              {platformLine ? "SALE" : "START"}
            </Button>
            {hasProgress ? (
              <Button
                variant="secondary"
                size="lg"
                className="min-h-14 w-full font-pixel text-[11px] sm:w-auto"
                disabled={!canPlay}
                onClick={() => goTo(0)}
              >
                CONTINUE
              </Button>
            ) : null}
          </div>
          <p className={canPlay ? "font-pixel blink-start text-[9px] text-accent" : "font-pixel text-[9px] text-subtle"}>
            {canPlay ? "▶ PREMI START" : "Accetta gli annunci per giocare"}
          </p>
        </section>

        <div className="mt-8">
          <AdSlot format="banner" />
        </div>
        <div className="mt-auto pt-8">
          <LegalFooter />
        </div>
      </main>
    </div>
  );
}
