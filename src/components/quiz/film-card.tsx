import { useEffect, useState } from "react";
import { loadFilmMeta, type FilmMeta } from "@/lib/film-meta";
import type { Movie, Platform } from "@/data/types";
import { PLATFORM_META } from "@/data/types";
import { cn } from "@/lib/utils";

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
        "shrink-0 overflow-hidden rounded-md bg-raised shadow-[0_14px_28px_rgba(20,0,24,0.45)] ring-2 ring-paper/80",
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
        <div
          className="flex aspect-[2/3] w-full items-center justify-center bg-[repeating-linear-gradient(-12deg,var(--color-raised),var(--color-raised)_8px,var(--color-surface)_8px,var(--color-surface)_16px)] px-2 text-center"
          aria-hidden
        >
          <span className="font-display text-sm italic leading-tight text-paper">
            {movie.title}
          </span>
        </div>
      )}
    </figure>
  );
}

export function Availability({
  meta,
  owned,
  compact,
}: {
  meta: FilmMeta | null;
  owned: Platform[];
  compact?: boolean;
}) {
  const stream = (meta?.offers ?? []).filter(
    (o) => o.type === "flatrate" || o.type === "free" || o.type === "ads",
  );
  const rent = (meta?.offers ?? []).filter((o) => o.type === "rent" || o.type === "buy");
  if (!meta) {
    return <p className="mt-3 text-xs text-subtle">Cerco dove si vede in Italia…</p>;
  }
  if (!stream.length && !rent.length) {
    return (
      <p className="mt-3 text-xs text-subtle">
        In Italia non risulta in abbonamento in questo momento.
      </p>
    );
  }

  const mine = new Set(owned);
  return (
    <div className="mt-3 space-y-2">
      {stream.length ? (
        <ul className="flex flex-wrap gap-2">
          {stream.map((o) => {
            const yours = o.platform ? mine.has(o.platform) : false;
            const href = o.platform ? PLATFORM_META[o.platform].search("") : meta.watchLink;
            return (
              <li key={`${o.type}-${o.name}`}>
                <a
                  href={href || meta.watchLink || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-sm border px-2.5 text-xs font-medium",
                    yours
                      ? "border-ok bg-ok/15 text-fg"
                      : "border-border bg-raised text-muted",
                  )}
                >
                  {o.logo ? (
                    <img src={o.logo} alt="" width={18} height={18} className="size-4 rounded-sm" />
                  ) : null}
                  {o.name}
                  {yours ? <span className="text-[10px] tracking-wide text-ok uppercase">Tuo</span> : null}
                </a>
              </li>
            );
          })}
        </ul>
      ) : null}
      {!compact && rent.length ? (
        <p className="text-[11px] text-subtle">
          Noleggio/acquisto: {rent.map((o) => o.name).filter((n, i, a) => a.indexOf(n) === i).join(" · ")}
        </p>
      ) : null}
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
          {open ? "Riduci" : compact ? "Trama" : "Trama completa"}
        </button>
      ) : null}
      <p className="mt-2 text-[11px] text-subtle">
        {meta?.source === "tmdb" ? (
          <>
            Locandina, trama e disponibilità da{" "}
            <a
              href="https://www.themoviedb.org/"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-2 hover:underline"
            >
              TMDB
            </a>
            . Non affiliato a TMDB.
          </>
        ) : wiki ? (
          <>
            Locandina e trama da{" "}
            <a href={wiki} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
              Wikipedia
            </a>
            , CC BY-SA.
          </>
        ) : null}
      </p>
    </div>
  );
}
