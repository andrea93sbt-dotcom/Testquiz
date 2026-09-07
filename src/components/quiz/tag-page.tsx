import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { moviesForTag } from "@/data/movies";
import type { Movie, Platform } from "@/data/types";
import { useQuiz } from "@/lib/store";
import { AppBar } from "@/components/quiz/app-bar";
import { AdSlot } from "@/components/ads/ad-slot";
import { Availability, Poster, Tags, useFilmMeta } from "@/components/quiz/film-card";
import { LegalFooter } from "@/components/legal/legal-footer";

const PAGE = 36;

export function TagPage({ tag }: { tag: string }) {
  const owned = useQuiz((s) => s.platforms);
  const found = useMemo(() => moviesForTag(decodeURIComponent(tag)), [tag]);
  const [shown, setShown] = useState(PAGE);
  const list = found.movies.slice(0, shown);

  return (
    <main id="contenuto" className="mx-auto min-h-dvh max-w-xl px-4 py-8 sm:px-8">
      <AppBar />
      <p className="text-xs font-medium tracking-[0.18em] text-ticket uppercase">
        {found.movies.length.toLocaleString("it-IT")} film di questo tipo
      </p>
      <h1 className="mt-3 font-display text-4xl italic leading-tight text-fg">{found.label}</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Altri film così. I primi sono quelli più vicini al tuo gusto.
      </p>
      <Link to="/" className="mt-4 inline-flex min-h-11 items-center text-sm text-ticket underline-offset-2 hover:underline">
        Torna all'inizio
      </Link>
      <AdSlot format="banner" className="mt-8" />
      {list.length === 0 ? (
        <p className="mt-10 text-muted">Nessun film di questo tipo.</p>
      ) : (
        <ol className="mt-10 divide-y divide-border border-y border-border">
          {list.map((movie, i) => (
            <li key={movie.id} className="py-6">
              <TagRow movie={movie} index={i + 1} owned={owned} />
            </li>
          ))}
        </ol>
      )}
      {shown < found.movies.length ? (
        <button
          type="button"
          className="mt-6 min-h-12 w-full rounded-md border border-border-strong bg-raised text-sm font-medium text-fg"
          onClick={() => setShown((n) => n + PAGE)}
        >
          Mostra altri ({(found.movies.length - shown).toLocaleString("it-IT")})
        </button>
      ) : null}
      <div className="mt-12">
        <LegalFooter />
      </div>
    </main>
  );
}

function TagRow({ movie, index, owned }: { movie: Movie; index: number; owned: Platform[] }) {
  const meta = useFilmMeta(movie);
  return (
    <div className="flex gap-4">
      <Poster movie={movie} meta={meta} size="row" />
      <div className="min-w-0 flex-1">
        <h2 className="font-display text-xl italic text-fg">
          <span className="mr-3 font-mono text-xs not-italic text-subtle">{index}</span>
          {movie.title}
        </h2>
        <p className="mt-1 text-sm text-subtle">
          {movie.year} · {movie.runtime} min
          {movie.director ? ` · ${movie.director}` : ""}
          {movie.originalTitle && movie.originalTitle !== movie.title ? ` · ${movie.originalTitle}` : ""}
        </p>
        <Tags movie={movie} compact />
        <Availability movie={movie} owned={owned} />
      </div>
    </div>
  );
}
