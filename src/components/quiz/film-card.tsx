import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Play } from "lucide-react";
import { loadFilmMeta, youtubeEmbedUrl, youtubeSearchUrl, type FilmMeta } from "@/lib/film-meta";
import type { Movie, Platform } from "@/data/types";
import { PLATFORM_META } from "@/data/types";
import { movieSearchLinks } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import { unlockAudio } from "@/game/sfx";

export function useFilmMeta(movie: Movie) {
  const [meta, setMeta] = useState<FilmMeta | null>(null);
  useEffect(() => {
    let live = true;
    loadFilmMeta(movie).then((m) => {
      if (live) setMeta(m);
    });
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie.id]);
  return meta;
}

export function Poster({
  movie,
  meta,
  size,
}: {
  movie: Movie;
  meta: FilmMeta | null;
  size: "hero" | "row";
}) {
  const src = meta?.poster;
  return (
    <figure
      className={cn(
        "shrink-0 overflow-hidden rounded-md bg-raised ring-2 ring-paper/80",
        size === "hero" ? "w-36 sm:w-40" : "w-[4.5rem] sm:w-20",
      )}
    >
      {src ? (
        <img
          src={src}
          alt={`Locandina di ${movie.title}`}
          width={size === "hero" ? 160 : 80}
          height={size === "hero" ? 240 : 120}
          className="aspect-[2/3] w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div className="flex aspect-[2/3] w-full items-center justify-center bg-raised px-2 text-center">
          <span className="font-display text-sm italic leading-tight text-paper">{movie.title}</span>
        </div>
      )}
    </figure>
  );
}

export function Tags({
  movie,
  compact,
  linked = true,
}: {
  movie: Movie;
  compact?: boolean;
  linked?: boolean;
}) {
  const tags = compact ? movie.tags.slice(0, 6) : movie.tags;
  if (!tags.length) return null;
  const chip =
    "inline-flex min-h-10 items-center rounded-sm border border-border bg-raised px-2 py-0.5 text-xs leading-snug text-muted";
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {tags.map((t) => (
        <li key={t}>
          {linked ? (
            <Link
              to="/tag/$tag"
              params={{ tag: t }}
              className={`${chip} transition-colors duration-150 hover:border-accent hover:text-fg`}
            >
              {t}
            </Link>
          ) : (
            <span className={chip}>{t}</span>
          )}
        </li>
      ))}
    </ul>
  );
}

export function Availability({ movie, owned }: { movie: Movie; owned: Platform[] }) {
  const links = movieSearchLinks(movie, owned);
  return (
    <div className="mt-3">
      {owned.length ? (
        <ul className="flex flex-wrap gap-2">
          {owned.map((p) => (
            <li key={p}>
              <a
                href={PLATFORM_META[p].search(movie.title)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center rounded-sm border border-ok/50 bg-ok/15 px-2.5 text-xs font-medium text-fg"
              >
                {PLATFORM_META[p].label}
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <a
        href={links.justwatch}
        target="_blank"
        rel="noreferrer"
        className="mt-2 inline-flex min-h-10 items-center text-xs font-medium text-ticket underline-offset-2 hover:underline"
      >
        Dove si vede adesso
      </a>
    </div>
  );
}

export function Plot({
  movie,
  meta,
  compact,
}: {
  movie: Movie;
  meta: FilmMeta | null;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const plot = meta?.plot;
  const teaser = compact ? movie.synopsis : plot ?? movie.synopsis;
  const shown = open && plot ? plot : teaser;
  const wiki =
    meta?.wikiTitle && meta.wikiLang
      ? `https://${meta.wikiLang}.wikipedia.org/wiki/${encodeURIComponent(meta.wikiTitle.replace(/ /g, "_"))}`
      : null;
  return (
    <div>
      <p
        className={cn(
          "text-sm leading-relaxed text-muted",
          !open && compact && "line-clamp-2",
          !open && !compact && plot && "line-clamp-5",
        )}
      >
        {shown}
      </p>
      {plot && plot !== movie.synopsis ? (
        <button
          type="button"
          className="mt-2 min-h-11 text-left text-xs font-medium text-ticket underline-offset-2 hover:underline"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "Nascondi" : compact ? "Leggi la trama" : "Tutta la trama"}
        </button>
      ) : null}
      {wiki ? (
        <p className="mt-2 text-[11px] text-subtle">
          Locandina e trama da{" "}
          <a href={wiki} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            Wikipedia
          </a>
          , licenza CC BY-SA.
        </p>
      ) : null}
    </div>
  );
}

export function Trailer({ movie, meta }: { movie: Movie; meta: FilmMeta | null }) {
  const [on, setOn] = useState(false);
  const search = youtubeSearchUrl(movie);
  const embed = meta?.trailerId ? youtubeEmbedUrl(meta.trailerId) : null;

  if (!meta) {
    return <p className="mt-5 text-sm text-subtle">Cerco il trailer…</p>;
  }
  if (on && embed) {
    return (
      <div className="mt-5 overflow-hidden rounded-md bg-raised ring-2 ring-paper/80">
        <div className="relative aspect-video">
          <iframe
            title={`Trailer di ${movie.title}`}
            src={`${embed}&autoplay=1`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
        <a
          href={`https://www.youtube.com/watch?v=${meta?.trailerId}`}
          target="_blank"
          rel="noreferrer"
          className="block px-3 py-2 text-xs text-subtle underline-offset-2 hover:text-muted hover:underline"
        >
          Apri su YouTube
        </a>
      </div>
    );
  }

  return (
    <div className="mt-5 flex flex-wrap gap-2">
      {embed ? (
        <button
          type="button"
          onClick={() => {
            unlockAudio();
            setOn(true);
          }}
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg hover:bg-fg"
        >
          <Play className="size-4" />
          Guarda il trailer
        </button>
      ) : (
        <a
          href={search}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-12 items-center gap-2 rounded-md bg-accent px-4 text-sm font-medium text-accent-fg hover:bg-fg"
        >
          <Play className="size-4" />
          Guarda il trailer
        </a>
      )}
    </div>
  );
}
