import { useEffect, useMemo, useRef, useState } from "react";
import { movieById, pickSeenTrios } from "@/data/movies";
import type { Movie, SeenVerdict } from "@/data/types";
import { useQuiz } from "@/lib/store";
import { AppBar } from "@/components/quiz/app-bar";
import { Tags } from "@/components/quiz/film-card";
import { Poster, useFilmMeta } from "@/components/quiz/film-card";
import { blip, unlockAudio } from "@/game/sfx";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ZONES: { id: SeenVerdict; title: string; hint: string }[] = [
  { id: "like", title: "TV", hint: "L'ho visto e mi è piaciuto" },
  { id: "unseen", title: "Tavolo", hint: "Non l'ho visto" },
  { id: "dislike", title: "Cestino", hint: "L'ho visto e non mi è piaciuto" },
];

const SPRITE: Record<SeenVerdict, string> = {
  like: "0 0",
  unseen: "-64px 0",
  dislike: "0 -64px",
};

export function SeenView() {
  const round = useQuiz((s) => s.seenRound);
  const trios = useQuiz((s) => s.seenTrios);
  const verdicts = useQuiz((s) => s.seenVerdicts);
  const placeSeen = useQuiz((s) => s.placeSeen);
  const unplaceSeen = useQuiz((s) => s.unplaceSeen);
  const nextSeenRound = useQuiz((s) => s.nextSeenRound);

  useEffect(() => {
    if (trios.length === 0) {
      useQuiz.setState({ seenTrios: pickSeenTrios(), seenRound: 0 });
    }
  }, [trios.length]);

  const ids = trios[round] ?? [];
  const movies = useMemo(
    () => ids.map((id) => movieById(id)).filter((m): m is Movie => Boolean(m)),
    [ids],
  );

  const placed = movies.filter((m) => verdicts[m.id]).length;
  const allIn = movies.length > 0 && placed === movies.length;

  return (
    <main id="contenuto" className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 py-4 sm:px-6 sm:py-6">
      <AppBar />
      <p className="text-sm text-muted">
        Turno {Math.min(round + 1, 10)} di 10
      </p>
      <h1 className="mt-2 font-display text-3xl italic text-fg">Hai già visto questi film?</h1>
      <p className="mt-2 text-base leading-relaxed text-muted">
        Tre titoli. Trascinali, oppure tocca il film e poi dove va: TV se ti è
        piaciuto, tavolo se non l'hai visto, cestino se non ti è piaciuto.
      </p>
      <SortBoard
        key={round}
        movies={movies}
        verdicts={verdicts}
        onPlace={(id, v) => {
          unlockAudio();
          blip(v === "like" ? "ok" : v === "dislike" ? "skip" : "swipe");
          placeSeen(id, v);
        }}
        onUnplace={unplaceSeen}
      />
      <p className="mt-3 text-sm text-subtle">
        {allIn ? "Ok, tutti e tre." : `${placed} di ${movies.length} a posto`}
      </p>
      {allIn ? (
        <Button size="lg" className="mt-4 min-h-12" onClick={nextSeenRound}>
          {round >= 9 ? "Vedi i consigli" : "Prossimo turno"}
        </Button>
      ) : null}
    </main>
  );
}

function SortBoard({
  movies,
  verdicts,
  onPlace,
  onUnplace,
}: {
  movies: Movie[];
  verdicts: Record<string, SeenVerdict>;
  onPlace: (id: string, v: SeenVerdict) => void;
  onUnplace: (id: string) => void;
}) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const dragRef = useRef<{
    id: string;
    ox: number;
    oy: number;
  } | null>(null);
  const [ghost, setGhost] = useState<{ id: string; x: number; y: number } | null>(null);

  const hand = movies.filter((m) => !verdicts[m.id]);

  const hitZone = (clientX: number, clientY: number): SeenVerdict | null => {
    const root = boardRef.current;
    if (!root) return null;
    const nodes = root.querySelectorAll<HTMLElement>("[data-zone]");
    for (const node of nodes) {
      const r = node.getBoundingClientRect();
      if (clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom) {
        return node.dataset.zone as SeenVerdict;
      }
    }
    return null;
  };

  return (
    <div ref={boardRef} className="mt-5 flex flex-1 flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {ZONES.map((z) => (
          <DropZone
            key={z.id}
            zone={z}
            hot={picked !== null}
            movies={movies.filter((m) => verdicts[m.id] === z.id)}
            onClick={() => {
              if (!picked) return;
              onPlace(picked, z.id);
              setPicked(null);
            }}
            onReturn={onUnplace}
          />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {hand.map((movie) => (
          <FilmChip
            key={movie.id}
            movie={movie}
            selected={picked === movie.id}
            hidden={ghost?.id === movie.id}
            onPointerDown={(e) => {
              unlockAudio();
              const el = e.currentTarget;
              try {
                el.setPointerCapture(e.pointerId);
              } catch {
                /* */
              }
              setPicked(movie.id);
              dragRef.current = { id: movie.id, ox: 56, oy: 40 };
              setGhost({ id: movie.id, x: e.clientX, y: e.clientY });
            }}
            onPointerMove={(e) => {
              if (dragRef.current?.id !== movie.id) return;
              setGhost({ id: movie.id, x: e.clientX, y: e.clientY });
            }}
            onPointerUp={(e) => {
              if (dragRef.current?.id !== movie.id) return;
              const zone = hitZone(e.clientX, e.clientY);
              dragRef.current = null;
              setGhost(null);
              if (zone) {
                onPlace(movie.id, zone);
                setPicked(null);
              }
            }}
          />
        ))}
        {hand.length === 0 ? (
          <p className="col-span-3 py-4 text-center text-sm text-muted">Ok, tutti e tre.</p>
        ) : null}
      </div>
      {ghost ? (
        <div
          className="pointer-events-none fixed z-40 w-28 rounded-md border border-accent bg-surface p-2 opacity-90 shadow-lg"
          style={{ left: ghost.x - 56, top: ghost.y - 40 }}
        >
          <p className="line-clamp-2 text-xs text-fg">
            {movies.find((m) => m.id === ghost.id)?.title}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function DropZone({
  zone,
  hot,
  movies,
  onClick,
  onReturn,
}: {
  zone: (typeof ZONES)[number];
  hot: boolean;
  movies: Movie[];
  onClick: () => void;
  onReturn: (id: string) => void;
}) {
  return (
    <div
      data-zone={zone.id}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        "min-h-40 rounded-md border px-2 py-3 text-left",
        hot ? "border-accent bg-raised" : "border-border bg-surface",
      )}
    >
      <span
        className="mx-auto mb-2 block size-16"
        style={{
          backgroundImage: "url(/sprites/room.png)",
          backgroundRepeat: "no-repeat",
          backgroundSize: "128px 128px",
          backgroundPosition: SPRITE[zone.id],
          imageRendering: "pixelated",
        }}
        aria-hidden
      />
      <p className="text-center text-sm font-medium text-fg">{zone.title}</p>
      <p className="mt-1 text-center text-xs leading-snug text-muted">{zone.hint}</p>
      <ul className="mt-2 space-y-1">
        {movies.map((m) => (
          <li key={m.id}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReturn(m.id);
              }}
              className="block w-full truncate rounded-sm bg-raised px-1.5 py-1 text-left text-xs text-fg"
            >
              {m.title}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FilmChip({
  movie,
  selected,
  hidden,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: {
  movie: Movie;
  selected: boolean;
  hidden: boolean;
  onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerMove: (e: React.PointerEvent<HTMLButtonElement>) => void;
  onPointerUp: (e: React.PointerEvent<HTMLButtonElement>) => void;
}) {
  const meta = useFilmMeta(movie);
  return (
    <button
      type="button"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={cn(
        "touch-none rounded-md border bg-surface p-2 text-left",
        selected ? "border-accent" : "border-border",
        hidden ? "opacity-40" : "",
      )}
    >
      <Poster movie={movie} meta={meta} size="row" />
      <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-fg">{movie.title}</p>
      <p className="mt-0.5 text-xs text-subtle">
        {movie.year}
        {movie.director ? ` · ${movie.director}` : ""}
      </p>
      <Tags movie={movie} compact linked={false} />
    </button>
  );
}
