import { Button } from "@/components/ui/button";
import { PlatformPicker } from "@/components/quiz/platform-picker";
import { LegalFooter } from "@/components/legal/legal-footer";
import { AppBar } from "@/components/quiz/app-bar";
import { PLATFORM_META } from "@/data/types";
import { useQuiz } from "@/lib/store";

export function Platforms() {
  const selected = useQuiz((s) => s.platforms);
  const togglePlatform = useQuiz((s) => s.togglePlatform);
  const confirmPlatforms = useQuiz((s) => s.confirmPlatforms);
  const platformsReturn = useQuiz((s) => s.platformsReturn);
  const count = selected.length;
  const summary =
    count === 0
      ? "Nessun abbonamento"
      : count === 1
        ? PLATFORM_META[selected[0]!].label
        : `${count} piattaforme`;

  return (
    <main id="contenuto" className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-6 sm:px-8 sm:py-10">
      <AppBar />
      <header>
        <p className="font-pixel text-[9px] tracking-[0.22em] text-ticket">BIGLIETTERIA</p>
        <h1 className="mt-4 font-display text-3xl italic leading-tight text-fg md:text-4xl">
          Dove guardi, di solito?
        </h1>
        <p className="mt-4 max-w-lg text-base leading-relaxed text-muted">
          Segna le piattaforme a cui sei abbonato. I film di stasera verranno
          ordinati privilegiando quelle librerie. I cataloghi cambiano: non è
          una garanzia, è una priorità di ricerca.
        </p>
      </header>

      <section className="mt-8 flex-1">
        <PlatformPicker selected={selected} onToggle={togglePlatform} />
        <p className="mt-4 font-pixel text-[8px] text-subtle">{summary}. Puoi saltare.</p>
      </section>

      <footer className="mt-8 flex flex-col gap-2 border-t border-border pt-5 sm:flex-row">
        <Button size="lg" onClick={confirmPlatforms} className="min-h-14 w-full font-pixel text-[11px] sm:w-auto">
          {count > 0 ? "CONTINUA" : "SALTA"}
        </Button>
        {platformsReturn === "results" ? (
          <p className="self-center text-xs text-subtle">
            Tornerai ai risultati, ricalcolati.
          </p>
        ) : null}
      </footer>
      <LegalFooter />
    </main>
  );
}
