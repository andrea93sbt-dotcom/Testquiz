import { createFileRoute, Link } from "@tanstack/react-router";
import { movieById } from "@/data/movies";
import { decodeShare } from "@/lib/share";
import { MustConsent } from "@/components/quiz/must-consent";
import { AppBar } from "@/components/quiz/app-bar";
import { AdSlot } from "@/components/ads/ad-slot";
import { Availability, Plot, Poster, Tags, useFilmMeta } from "@/components/quiz/film-card";
import { LegalFooter } from "@/components/legal/legal-footer";
import { Button } from "@/components/ui/button";
import { useQuiz } from "@/lib/store";
import type { Movie, Platform } from "@/data/types";

export const Route = createFileRoute("/condividi")({
  validateSearch: (search: Record<string, unknown>): { p: string } => ({
    p: typeof search.p === "string" ? search.p : "",
  }),
  component: CondividiRoute,
  head: () => ({ meta: [{ title: "Un gusto · Platea" }] }),
});

function CondividiRoute() {
  return (
    <MustConsent>
      <CondividiPage />
    </MustConsent>
  );
}

function CondividiPage() {
  const { p } = Route.useSearch();
  const owned = useQuiz((s) => s.platforms);
  const card = p ? decodeShare(p) : null;
  const movies = card ? card.m.map((id) => movieById(id)).filter((m): m is Movie => Boolean(m)) : [];

  return (
    <main id="contenuto" className="mx-auto min-h-dvh max-w-xl px-4 py-8 sm:px-8">
      <AppBar />
      {!card || movies.length === 0 ? (
        <>
          <h1 className="font-display text-4xl italic text-fg">Link non valido.</h1>
          <p className="mt-3 text-muted">Questo risultato non si apre. Fai il quiz e condividi di nuovo.</p>
          <Button asChild className="mt-6 min-h-12">
            <Link to="/">Vai al quiz</Link>
          </Button>
        </>
      ) : (
        <>
          <p className="text-xs font-medium tracking-[0.18em] text-ticket uppercase">
            Gusto di un amico · {card.n} risposte
          </p>
          <h1 className="mt-4 font-display text-4xl italic leading-tight text-fg">{card.a}</h1>
          <p className="mt-2 text-base text-muted">{card.l}</p>
          <Button asChild className="mt-6 min-h-12">
            <Link to="/">Fai il tuo quiz</Link>
          </Button>
          <AdSlot format="banner" className="mt-10" />
          <ol className="mt-10 divide-y divide-border border-y border-border">
            {movies.map((movie, i) => (
              <li key={movie.id} className="py-6">
                <SharedRow movie={movie} index={i + 1} owned={owned} />
              </li>
            ))}
          </ol>
        </>
      )}
      <div className="mt-12">
        <LegalFooter />
      </div>
    </main>
  );
}

function SharedRow({ movie, index, owned }: { movie: Movie; index: number; owned: Platform[] }) {
  const meta = useFilmMeta(movie);
  return (
    <div className="flex gap-4">
      <Poster movie={movie} meta={meta} size={index === 1 ? "hero" : "row"} />
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-2xl italic text-fg">{movie.title}</h2>
        <p className="mt-1 text-sm text-subtle">
          {movie.year} · {movie.runtime} min
          {movie.director ? ` · ${movie.director}` : ""}
        </p>
        <Tags movie={movie} compact={index > 1} />
        {index === 1 ? (
          <div className="mt-3">
            <Plot movie={movie} meta={meta} compact />
          </div>
        ) : null}
        <Availability movie={movie} owned={owned} />
      </div>
    </div>
  );
}
