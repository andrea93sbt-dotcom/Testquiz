import { Button } from "@/components/ui/button";
import { PlatformPicker } from "@/components/quiz/platform-picker";
import { AdSlot } from "@/components/ads/ad-slot";
import { LegalFooter } from "@/components/legal/legal-footer";
import { QuoteScatter } from "@/components/quiz/quote-scatter";
import { PLATFORM_META } from "@/data/types";
import { useQuiz } from "@/lib/store";
import { AppBar } from "@/components/quiz/app-bar";

export function Platforms() {
  const selected = useQuiz((s) => s.platforms);
  const togglePlatform = useQuiz((s) => s.togglePlatform);
  const confirmPlatforms = useQuiz((s) => s.confirmPlatforms);
  const platformsReturn = useQuiz((s) => s.platformsReturn);
  const count = selected.length;
  const summary =
    count === 0
      ? "Nessuna"
      : count === 1
        ? PLATFORM_META[selected[0]!].label
        : `${count} piattaforme`;

  return (
    <div className="relative min-h-dvh">
      <QuoteScatter variant="rest" />
      <main
        id="contenuto"
        className="relative z-10 mx-auto flex min-h-dvh max-w-xl flex-col px-5 py-12 sm:px-8 sm:py-16"
      >
      <AppBar />
      <header>
        <p className="text-xs font-medium tracking-[0.28em] text-ticket uppercase">Abbonamenti</p>
        <h1 className="mt-4 font-display text-4xl italic leading-tight text-fg">Dove guardi?</h1>
      </header>

      <section className="mt-10 flex-1">
        <PlatformPicker selected={selected} onToggle={togglePlatform} />
        <p className="mt-5 text-sm text-subtle">{summary}</p>
      </section>

      <AdSlot format="box" className="mt-12" />

      <footer className="mt-8 flex flex-col gap-2 sm:flex-row">
        <Button size="lg" onClick={confirmPlatforms} className="min-h-14 w-full sm:w-auto">
          {count > 0 ? "Continua" : "Salta"}
        </Button>
        {platformsReturn === "results" ? (
          <p className="self-center text-xs text-subtle">I risultati si ricalcolano.</p>
        ) : null}
      </footer>
      <div>
        <LegalFooter />
      </div>
    </main>
    </div>
  );
}
