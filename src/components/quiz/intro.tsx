import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { AdSlot } from "@/components/ads/ad-slot";
import { LegalFooter } from "@/components/legal/legal-footer";
import { PLATFORM_META } from "@/data/types";
import { CATALOG_SIZE } from "@/data/movies";
import { LEGAL } from "@/lib/legal";
import { useLegal } from "@/lib/legal-store";
import { useAds } from "@/lib/ads-store";
import { useQuiz } from "@/lib/store";
import { blip, unlockAudio } from "@/game/sfx";

export function Intro() {
  const start = useQuiz((s) => s.start);
  const startSeen = useQuiz((s) => s.startSeen);
  const answers = useQuiz((s) => s.answers);
  const platforms = useQuiz((s) => s.platforms);
  const resume = useQuiz((s) => s.resume);
  const ageOk = useLegal((s) => s.ageOk);
  const setAge = useLegal((s) => s.setAge);
  const consent = useAds((s) => s.consent);
  const seenTrios = useQuiz((s) => s.seenTrios);
  const [hydrated, setHydrated] = useState(false);
  const hasProgress = Object.keys(answers).length > 0 || seenTrios.length > 0;
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
    <div className="relative min-h-dvh overflow-hidden bg-bg">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: "url(/sprites/sky.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <main
        id="contenuto"
        className="relative z-10 mx-auto flex min-h-dvh max-w-xl flex-col px-5 py-10 sm:px-8"
      >
        <header className="rise-in rounded-md border border-border bg-surface/95 p-5">
          <p className="text-xs font-medium tracking-[0.22em] text-ticket uppercase">Platea</p>
          <h1 className="mt-3 font-display text-4xl italic leading-tight text-fg sm:text-5xl">
            Cosa vedi stasera.
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted">
            Due modi per profilare il gusto: cento domande in una piazza a quattro
            cinema, oppure dieci turni con tre film da mettere sulla TV, sul tavolo
            o nel cestino. {CATALOG_SIZE.toLocaleString("it-IT")} titoli, con i
            generi del catalogo.
          </p>
          {platformLine ? <p className="mt-3 text-sm text-fg">{platformLine}</p> : null}
        </header>

        <section className="mt-8 flex flex-col gap-5">
          <label className="flex items-start gap-3 text-sm leading-relaxed text-muted">
            <input
              type="checkbox"
              className="mt-1 size-4 shrink-0 accent-accent"
              checked={hydrated && ageOk}
              onChange={(e) => setAge(e.target.checked)}
            />
            <span>Ho almeno {LEGAL.ageMin} anni.</span>
          </label>
          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              disabled={!canPlay}
              className="min-h-14 w-full"
              onClick={() => {
                unlockAudio();
                blip("start");
                start();
              }}
            >
              100 domande
            </Button>
            <Button
              variant="secondary"
              size="lg"
              disabled={!canPlay}
              className="min-h-14 w-full"
              onClick={() => {
                unlockAudio();
                blip("start");
                startSeen();
              }}
            >
              Li hai visti? · 10 turni
            </Button>
            {hasProgress ? (
              <Button
                variant="ghost"
                size="lg"
                className="min-h-12 w-full"
                disabled={!canPlay}
                onClick={() => resume()}
              >
                Continua
              </Button>
            ) : null}
          </div>
          <p className="text-sm leading-relaxed text-subtle">
            PC: frecce o WASD. Telefono: swipe, oppure tocca la risposta. Poi
            cammini verso quella sala.
          </p>
        </section>

        <div className="mt-10">
          <AdSlot format="banner" />
        </div>
        <div className="mt-auto pt-10">
          <LegalFooter />
        </div>
      </main>
    </div>
  );
}
