import type { ReactNode } from "react";
import { ArrowUpRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PLATFORM_META, type Movie, type Platform } from "@/data/types";
import {
  AXIS_LABEL,
  buildProfile,
  movieSearchLinks,
  pickArchetype,
  rankMovies,
  searchRecipes,
  topAxes,
} from "@/lib/scoring";
import { useQuiz } from "@/lib/store";
import { AdSlot } from "@/components/ads/ad-slot";
import { LegalFooter } from "@/components/legal/legal-footer";
import { QuoteScatter } from "@/components/quiz/quote-scatter";
import { AppBar } from "@/components/quiz/app-bar";

export function Results() {
  const answers = useQuiz((s) => s.answers);
  const platforms = useQuiz((s) => s.platforms);
  const reset = useQuiz((s) => s.reset);
  const goTo = useQuiz((s) => s.goTo);
  const editPlatforms = useQuiz((s) => s.editPlatforms);

  const profile = buildProfile(answers, platforms);
  const matches = rankMovies(profile).slice(0, 8);
  const tonight = matches[0];
  const archetype = pickArchetype(profile.vector);
  const axes = topAxes(profile.vector, 6);
  const maxAxis = axes[0]?.value || 1;
  const recipes = searchRecipes(profile, matches);
  const owned = platforms.length ? platforms : (profile.flags.platforms ?? []);
  const platformLine =
    owned.length > 0
      ? owned.map((p) => PLATFORM_META[p].label).join(" · ")
      : "Nessun abbonamento";

  return (
    <div className="relative min-h-dvh">
      <QuoteScatter variant="rest" />
      <main id="contenuto" className="relative z-10 mx-auto max-w-xl px-5 py-12 sm:px-8 sm:py-16">
      <AppBar />
      <header className="rise-in">
        <p className="text-xs font-medium tracking-[0.28em] text-ticket uppercase">
          {profile.answered} risposte
        </p>
        <h1 className="mt-4 font-display text-4xl italic leading-[1.08] text-fg md:text-5xl">
          {archetype.name}
        </h1>
        <p className="mt-2 text-base text-muted">{archetype.line}</p>
      </header>

      <section className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg">{platformLine}</p>
        <Button variant="secondary" size="sm" className="min-h-11" onClick={editPlatforms}>
          Piattaforme
        </Button>
      </section>

      <AdSlot format="banner" className="mt-10" />

      <section className="mt-12">
        <ul className="space-y-4">
          {axes.map((a) => (
            <li key={a.axis} className="grid grid-cols-[7.5rem_1fr] items-center gap-3 sm:grid-cols-[9rem_1fr]">
              <span className="text-sm text-muted">{AXIS_LABEL[a.axis]}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-raised">
                <span
                  className="block h-full rounded-full bg-accent"
                  style={{ width: `${Math.max(8, (a.value / maxAxis) * 100)}%` }}
                />
              </span>
            </li>
          ))}
        </ul>
      </section>

      {tonight ? (
        <section className="mt-12 rounded-xl border border-border bg-surface p-6 sm:p-8">
          <h2 className="font-display text-3xl italic leading-tight text-fg">
            {tonight.movie.title}
          </h2>
          <Meta movie={tonight.movie} />
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted">
            {tonight.movie.synopsis}
          </p>
          {tonight.reasons.length ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {tonight.reasons.map((r) => (
                <li
                  key={r}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted"
                >
                  {r}
                </li>
              ))}
            </ul>
          ) : null}
          <SearchRow movie={tonight.movie} platforms={tonight.overlap.length ? tonight.overlap : owned} />
        </section>
      ) : (
        <p className="mt-12 text-muted">Rispondi ad alcune domande.</p>
      )}

      <AdSlot format="feed" className="mt-12" />

      <section className="mt-12">
        <ol className="divide-y divide-border border-y border-border">
          {matches.slice(1).map((m, i) => (
            <li key={m.movie.id} className="py-6">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-xl italic text-fg">
                  <span className="mr-3 font-mono text-xs not-italic text-subtle">
                    {i + 2}
                  </span>
                  {m.movie.title}
                </h3>
                <span className="shrink-0 font-mono text-xs tabular-nums text-subtle">
                  {m.movie.year}
                </span>
              </div>
              <Meta movie={m.movie} />
              <SearchRow movie={m.movie} platforms={m.overlap} compact />
            </li>
          ))}
        </ol>
      </section>

      <AdSlot format="box" className="mt-12" />

      <section className="mt-12">
        <ul className="space-y-4">
          {recipes.map((r) => (
            <li key={r.label}>
              <p className="text-sm text-fg">{r.label}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <OutLink href={r.justwatch}>JustWatch</OutLink>
                <OutLink href={r.google}>Google</OutLink>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <AdSlot format="banner" className="mt-12" />

      <footer className="mt-12 flex flex-col gap-3 sm:flex-row">
        <Button variant="secondary" onClick={() => goTo(0)} className="min-h-12">
          Rifinisci
        </Button>
        <Button variant="ghost" onClick={reset} className="min-h-12">
          <RotateCcw className="size-4" />
          Ricomincia
        </Button>
      </footer>
      <div>
        <LegalFooter />
      </div>
    </main>
    </div>
  );
}

function Meta({ movie }: { movie: Movie }) {
  return (
    <p className="mt-2 text-sm text-subtle">
      {movie.director} · {movie.year} · {movie.runtime} min · {movie.country}
      {movie.originalTitle && movie.originalTitle !== movie.title
        ? ` · ${movie.originalTitle}`
        : ""}
    </p>
  );
}

function SearchRow({
  movie,
  platforms,
  compact,
}: {
  movie: Movie;
  platforms: Platform[];
  compact?: boolean;
}) {
  const links = movieSearchLinks(movie, platforms);
  return (
    <div className={compact ? "mt-3 flex flex-wrap gap-2" : "mt-6 flex flex-wrap gap-2"}>
      <OutLink href={links.justwatch}>Dove vederlo</OutLink>
      <OutLink href={links.google}>Cerca</OutLink>
      {links.platformLinks.slice(0, compact ? 2 : 4).map((p) => (
        <OutLink key={p.id} href={p.href}>
          {p.label}
        </OutLink>
      ))}
    </div>
  );
}

function OutLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex min-h-10 items-center gap-1 rounded-sm border border-border-strong bg-raised px-3 text-xs font-medium text-fg transition-colors duration-150 hover:border-accent"
    >
      {children}
      <ArrowUpRight className="size-3.5 text-muted" />
    </a>
  );
}
