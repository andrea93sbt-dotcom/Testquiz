import catalog from "./imdb-top5000.json";
import type { Movie, Weights } from "./types";

type Row = {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  runtime: number;
  genres: string[];
  rating: number;
  votes: number;
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
  if (row.rating >= 8) add({ complesso: 3 });
  return v;
}

function kidsOk(genres: string[]) {
  if (genres.includes("Horror") || genres.includes("Film-Noir")) return false;
  return genres.includes("Family") || genres.includes("Animation");
}

export const MOVIES: Movie[] = (catalog as Row[]).map((row) => ({
  id: row.id,
  title: row.title,
  originalTitle: row.originalTitle,
  year: row.year,
  runtime: row.runtime,
  director: "",
  country: "",
  platforms: [],
  synopsis: row.genres.length ? row.genres.join(" · ") : "",
  v: weightsFor(row),
  kidsOk: kidsOk(row.genres),
  rating: row.rating,
  votes: row.votes,
  genres: row.genres,
}));

export const CATALOG_SIZE = MOVIES.length;
