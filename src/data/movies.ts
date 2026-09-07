import catalog from "./imdb-top5000.json";
import type { Movie, Weights } from "./types";

type Row = {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  runtime: number;
  genres: string[];
  director?: string;
  actors?: string[];
  subjects?: string[];
  country?: string;
};

/** Italian labels of the listed IMDb genre field. No invented moods. */
const GENRE_IT: Record<string, string> = {
  Action: "Azione",
  Adventure: "Avventura",
  Animation: "Animazione",
  Biography: "Biografico",
  Comedy: "Commedia",
  Crime: "Crime",
  Documentary: "Documentario",
  Drama: "Drammatico",
  Family: "Famiglia",
  Fantasy: "Fantasy",
  "Film-Noir": "Noir",
  History: "Storico",
  Horror: "Horror",
  Music: "Musica",
  Musical: "Musical",
  Mystery: "Mistero",
  News: "News",
  Romance: "Sentimentale",
  "Sci-Fi": "Fantascienza",
  Sport: "Sport",
  Thriller: "Thriller",
  War: "Guerra",
  Western: "Western",
};

const GENRE_W: Record<string, Weights> = {
  Action: { azione: 8, veloce: 5, spettacolo: 5 },
  Adventure: { avventura: 8, spettacolo: 4 },
  Animation: { animazione: 9, famiglia: 5, sollevante: 3 },
  Biography: { biografico: 8, vero: 6, dramma: 4 },
  Comedy: { commedia: 8, leggero: 5, ironico: 3 },
  Crime: { crime: 8, oscuro: 4, potere: 3 },
  Documentary: { documentario: 9, vero: 8 },
  Drama: { dramma: 8 },
  Family: { famiglia: 8, leggero: 4, speranza: 3 },
  Fantasy: { fantasy: 8, spettacolo: 4 },
  "Film-Noir": { crime: 6, oscuro: 7, classico: 6 },
  History: { biografico: 5, vero: 5, dramma: 4 },
  Horror: { horror: 9, oscuro: 6, teso: 5 },
  Music: { musical: 6 },
  Musical: { musical: 9, sollevante: 3 },
  Mystery: { mistero: 8, teso: 4 },
  News: { documentario: 6, vero: 6 },
  Romance: { romance: 8, amore: 7, intimo: 4 },
  "Sci-Fi": { scifi: 9, immagini: 4 },
  Sport: { dramma: 3, speranza: 3 },
  Thriller: { thriller: 8, teso: 6 },
  War: { guerra: 8, dramma: 4 },
  Western: { western: 9 },
};

function weightsFor(row: Row): Weights {
  const v: Weights = {};
  const add = (w: Weights, scale = 1) => {
    for (const [k, n] of Object.entries(w)) {
      const axis = k as keyof Weights;
      v[axis] = (v[axis] ?? 0) + n * scale;
    }
  };
  for (const g of row.genres) {
    const w = GENRE_W[g];
    if (w) add(w);
  }
  if (row.year < 1975) add({ classico: 7 });
  else if (row.year < 2000) add({ classico: 3, moderno: 2 });
  else if (row.year < 2012) add({ moderno: 5 });
  else add({ moderno: 8 });
  if (row.runtime <= 100) add({ breve: 6 });
  else if (row.runtime >= 140) add({ lungo: 6 });
  return v;
}

function kidsOk(genres: string[]) {
  if (genres.includes("Horror") || genres.includes("Film-Noir")) return false;
  return genres.includes("Family") || genres.includes("Animation");
}

export function tagsFor(row: Row): string[] {
  const tags: string[] = [];
  const add = (raw: string) => {
    const label = raw.trim();
    if (!label) return;
    if (tags.some((t) => t.toLowerCase() === label.toLowerCase())) return;
    tags.push(label);
  };
  for (const g of row.genres) add(GENRE_IT[g] ?? g);
  if (row.director) for (const d of row.director.split(",")) add(d);
  for (const s of row.subjects ?? []) add(s);
  for (const a of row.actors ?? []) add(a);
  if (row.country) for (const c of row.country.split(",")) add(c);
  if (row.year > 1880) add(`Anni ${Math.floor(row.year / 10) * 10}`);
  if (row.runtime >= 180) add("Oltre 3 ore");
  else if (row.runtime > 0 && row.runtime <= 90) add("Meno di 90 min");
  return tags;
}

export const MOVIES: Movie[] = (catalog as Row[]).map((row) => ({
  id: row.id,
  title: row.title,
  originalTitle: row.originalTitle,
  year: row.year,
  runtime: row.runtime,
  director: row.director ?? "",
  country: row.country ?? "",
  platforms: [],
  synopsis: "",
  v: weightsFor(row),
  kidsOk: kidsOk(row.genres),
  tags: tagsFor(row),
  genres: row.genres,
  actors: row.actors,
  subjects: row.subjects,
}));

export const CATALOG_SIZE = MOVIES.length;

const BY_ID = new Map(MOVIES.map((m) => [m.id, m]));

export function movieById(id: string): Movie | undefined {
  return BY_ID.get(id);
}

const TAG_INDEX = new Map<string, { label: string; movies: Movie[] }>();
for (const movie of MOVIES) {
  for (const tag of movie.tags) {
    const key = tag.toLowerCase();
    let bucket = TAG_INDEX.get(key);
    if (!bucket) {
      bucket = { label: tag, movies: [] };
      TAG_INDEX.set(key, bucket);
    }
    bucket.movies.push(movie);
  }
}

export function moviesForTag(raw: string): { label: string; movies: Movie[] } {
  const key = raw.trim().toLowerCase();
  return TAG_INDEX.get(key) ?? { label: raw.trim(), movies: [] };
}

/** 10 rounds × 3 titles, each trio from different listed genres. */
export function pickSeenTrios(seed = Date.now()): string[][] {
  const buckets = new Map<string, Movie[]>();
  for (const movie of MOVIES) {
    const g = movie.genres?.[0] ?? "Drama";
    const list = buckets.get(g);
    if (list) list.push(movie);
    else buckets.set(g, [movie]);
  }
  let rng = seed % 2147483647 || 1;
  const rand = () => {
    rng = (rng * 48271) % 2147483647;
    return rng / 2147483647;
  };
  for (const list of buckets.values()) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      const tmp = list[i]!;
      list[i] = list[j]!;
      list[j] = tmp;
    }
  }
  const genres = [...buckets.keys()].sort(
    (a, b) => (buckets.get(b)?.length ?? 0) - (buckets.get(a)?.length ?? 0),
  );
  const used = new Set<string>();
  const trios: string[][] = [];
  for (let round = 0; round < 10; round++) {
    const ids: string[] = [];
    for (let step = 0; step < genres.length && ids.length < 3; step++) {
      const g = genres[(round + step * 3) % genres.length];
      const next = buckets.get(g)?.find((m) => !used.has(m.id));
      if (!next) continue;
      used.add(next.id);
      ids.push(next.id);
    }
    if (ids.length < 3) {
      for (const movie of MOVIES) {
        if (used.has(movie.id)) continue;
        used.add(movie.id);
        ids.push(movie.id);
        if (ids.length === 3) break;
      }
    }
    trios.push(ids);
  }
  return trios;
}
