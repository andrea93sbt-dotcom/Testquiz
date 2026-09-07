import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { LegalFooter } from "@/components/legal/legal-footer";
import { QuoteScatter } from "@/components/quiz/quote-scatter";
import { PLATFORM_META } from "@/data/types";
import { LEGAL } from "@/lib/legal";
import { useLegal } from "@/lib/legal-store";
import { useAds } from "@/lib/ads-store";
import { useQuiz } from "@/lib/store";

export function Intro() {
  const start = useQuiz((s) => s.start);
  const answers = useQuiz((s) => s.answers);
  const platforms = useQuiz((s) => s.platforms);
  const goTo = useQuiz((s) => s.goTo);
  const ageOk = useLegal((s) => s.ageOk);
  const confirmAge = useLegal((s) => s.confirmAge);
  const consent = useAds((s) => s.consent);
  const [hydrated, setHydrated] = useState(false);
  const hasProgress = Object.keys(answers).length > 0;
  const platformLine =
    platforms.length > 0
      ? platforms.map((p) => PLATFORM_META[p].label).join(" · ")
      : null;

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
    <div className="relative min-h-dvh">
      <QuoteScatter variant="intro" />
      <main
        id="contenuto"
        className="relative z-10 mx-auto flex min-h-dvh max-w-xl flex-col px-5 py-12 sm:px-8 sm:py-16"
      >

      <header className="rise-in max-w-lg">
        <p className="text-xs font-medium tracking-[0.28em] text-ticket uppercase">Platea</p>
        <h1 className="mt-5 font-display text-5xl italic leading-[1.02] text-fg md:text-6xl">
          100 domande.
        </h1>
        {platformLine ? (
          <p className="mt-4 text-sm text-muted">{platformLine}</p>
        ) : null}
      </header>

      <section className="mt-10 flex flex-col gap-5">
        <label className="flex items-start gap-3 text-sm text-muted">
          <input
            type="checkbox"
            className="mt-1 size-4 shrink-0 accent-accent"
            checked={hydrated && ageOk}
            onChange={(e) => {
              if (e.target.checked) confirmAge();
            }}
          />
          <span>Ho almeno {LEGAL.ageMin} anni.</span>
        </label>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            onClick={start}
            disabled={!hydrated || !ageOk || consent !== "all"}
            className="min-h-14 w-full sm:w-auto"
          >
            {platformLine ? "Piattaforme" : "Inizia"}
          </Button>
          {hasProgress ? (
            <Button
              variant="secondary"
              size="lg"
              className="min-h-14 w-full sm:w-auto"
              disabled={!hydrated || !ageOk || consent !== "all"}
              onClick={() => goTo(0)}
            >
              Riprendi
            </Button>
          ) : null}
        </div>
      </section>

      <div className="mt-14 flex flex-col gap-8">
        <AdSlot format="banner" />
        <AdSlot format="box" />
      </div>

      <div className="mt-auto pt-12">
        <LegalFooter />
      </div>
    </main>
    </div>
  );
}
