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
  Drama: { dramma: 8, intimo: 2 },
  Family: { famiglia: 8, leggero: 4, speranza: 3 },
  Fantasy: { fantasy: 8, spettacolo: 4 },
  "Film-Noir": { noir: 8, crime: 6, oscuro: 7, classico: 6 },
  History: { storico: 8, vero: 5, dramma: 4 },
  Horror: { horror: 9, oscuro: 6, teso: 5 },
  Music: { musica: 8 },
  Musical: { musical: 9, musica: 5, sollevante: 3 },
  Mystery: { mistero: 8, teso: 4 },
  News: { documentario: 6, vero: 6 },
  Romance: { romance: 8, amore: 7, intimo: 4 },
  "Sci-Fi": { scifi: 9, immagini: 4 },
  Sport: { sport: 8, speranza: 3, dramma: 2 },
  Thriller: { thriller: 8, teso: 6 },
  War: { guerra: 8, dramma: 4, storico: 3 },
  Western: { western: 9 },
};

const SUBJECT_EXACT: Record<string, Weights> = {
  "commedia drammatica": { commedia: 5, dramma: 5, intimo: 3 },
  "commedia romantica": { commedia: 5, romance: 6, amore: 5, leggero: 3 },
  "film commedia nera": { commedia: 5, ironico: 6, oscuro: 4, cinico: 3 },
  "cinema di guerra": { guerra: 8, oscuro: 3 },
  "seconda guerra mondiale": { guerra: 6, storico: 6 },
  "prima guerra mondiale": { guerra: 6, storico: 5 },
  "film a tematica lgbt": { lgbt: 8, identita: 5, intimo: 2 },
  "cinema di formazione": { formazione: 8, identita: 5 },
  "thriller poliziesco": { thriller: 6, crime: 5 },
  "buddy movie": { amicizia: 7, commedia: 3 },
  "neo-noir": { noir: 8, crime: 5, oscuro: 5 },
  caper: { crime: 6, veloce: 2 },
  vendetta: { vendetta: 8, teso: 3 },
  supereroi: { supereroi: 9, azione: 5, spettacolo: 5, fantasy: 2 },
  "criminalità organizzata": { crime: 7, oscuro: 3 },
  "film di gangster": { crime: 8, noir: 3 },
  "film carcerario": { giudiziario: 6, crime: 3, dramma: 4 },
  "thriller psicologico": { thriller: 6, intimo: 3, complesso: 3 },
  "film distopico": { distopia: 8, scifi: 5, oscuro: 4 },
  "film natalizio": { natalizio: 9, famiglia: 4, leggero: 4, sollevante: 3 },
  "film di spionaggio": { spionaggio: 9, thriller: 4, teso: 3 },
  "famiglia disfunzionale": { famiglia: 8, dramma: 5, intimo: 3 },
  melodramma: { dramma: 6, romance: 4, malinconico: 4 },
  "serial killer": { thriller: 6, horror: 4, teso: 5 },
  "film giudiziario": { giudiziario: 8, dramma: 3, potere: 3 },
  "film di arti marziali": { azione: 7, veloce: 4 },
  "road movie": { avventura: 6, identita: 3, lento: 2 },
  "film epico": { spettacolo: 6, lungo: 4 },
  amicizia: { amicizia: 8 },
  olocausto: { guerra: 5, storico: 6, dramma: 5, oscuro: 4 },
  "amore romantico": { romance: 6, amore: 6 },
  "film parodia": { commedia: 7, ironico: 6, leggero: 3 },
  "film post apocalittico": { distopia: 7, scifi: 5, oscuro: 4 },
  "viaggio nel tempo": { scifi: 6 },
  "film sui fantasmi": { horror: 6 },
  "film catastrofico": { spettacolo: 5, azione: 4 },
  "film sul pugilato": { sport: 8, dramma: 4 },
  "dramma storico": { storico: 7, dramma: 5 },
  "thriller politico": { potere: 6, thriller: 4 },
  "film indipendente": { complesso: 3, intimo: 2 },
  "film d'essai": { complesso: 4, europa: 2, stilizzato: 3 },
  speranza: { speranza: 6, sollevante: 3 },
  corruzione: { potere: 5, crime: 3 },
  "errore giudiziario": { giudiziario: 7, dramma: 4 },
  terrorismo: { teso: 5, thriller: 4 },
};

const SUBJECT_INCLUDES: [string, Weights][] = [
  ["lgbt", { lgbt: 7, identita: 4 }],
  ["western", { western: 7 }],
  ["spionaggio", { spionaggio: 7, thriller: 3 }],
  ["superero", { supereroi: 8, azione: 4, spettacolo: 4 }],
  ["nataliz", { natalizio: 8, famiglia: 3, leggero: 3 }],
  ["distop", { distopia: 7, scifi: 4 }],
  ["cinema di formazione", { formazione: 6, identita: 4 }],
  ["giudiziario", { giudiziario: 6 }],
  ["buddy", { amicizia: 6 }],
  ["noir", { noir: 6, oscuro: 3 }],
  ["gangster", { crime: 6 }],
  ["carcer", { giudiziario: 4, dramma: 3 }],
  ["vendetta", { vendetta: 6 }],
  ["musical", { musical: 6, musica: 4 }],
  ["guerra fredda", { spionaggio: 4, storico: 3, teso: 2 }],
];

const EUROPA = new Set([
  "Regno Unito",
  "Francia",
  "Germania",
  "Spagna",
  "Svezia",
  "Belgio",
  "Danimarca",
  "Norvegia",
  "Irlanda",
  "Polonia",
  "Unione Sovietica",
  "Paesi Bassi",
  "Svizzera",
  "Ungheria",
  "Austria",
  "Russia",
  "Finlandia",
  "Grecia",
  "Lussemburgo",
  "Serbia",
  "Cecoslovacchia",
  "Portogallo",
  "Repubblica Ceca",
  "Romania",
  "Croazia",
]);

const ASIA = new Set([
  "India",
  "Giappone",
  "Corea del Sud",
  "Cina",
  "Hong Kong",
  "Iran",
  "Taiwan",
  "Tailandia",
  "Turchia",
]);

function add(target: Weights, extra: Weights, scale = 1) {
  for (const [key, n] of Object.entries(extra)) {
    const axis = key as keyof Weights;
    target[axis] = (target[axis] ?? 0) + n * scale;
  }
}

function subjectWeights(raw: string): Weights | null {
  const key = raw.trim().toLowerCase();
  if (!key) return null;
  const exact = SUBJECT_EXACT[key];
  if (exact) return exact;
  for (const [needle, w] of SUBJECT_INCLUDES) {
    if (key.includes(needle)) return w;
  }
  return null;
}

function weightsFor(row: Row): Weights {
  const v: Weights = {};
  for (const g of row.genres) {
    const w = GENRE_W[g];
    if (w) add(v, w);
  }
  for (const s of row.subjects ?? []) {
    const w = subjectWeights(s);
    if (w) add(v, w, 0.85);
  }
  if (row.year < 1975) add(v, { classico: 7 });
  else if (row.year < 2000) add(v, { classico: 3, moderno: 2 });
  else if (row.year < 2012) add(v, { moderno: 5 });
  else add(v, { moderno: 8 });

  if (row.runtime > 0 && row.runtime <= 90) add(v, { breve: 8 });
  else if (row.runtime <= 105) add(v, { breve: 6 });
  else if (row.runtime >= 180) add(v, { lungo: 8 });
  else if (row.runtime >= 140) add(v, { lungo: 6 });

  const places = (row.country ?? "")
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
  if (places.includes("Italia")) add(v, { italiano: 8 });
  if (places.includes("Stati Uniti")) add(v, { hollywood: 5 });
  if (places.some((p) => EUROPA.has(p))) add(v, { europa: 5 });
  if (places.some((p) => ASIA.has(p))) add(v, { asia: 5 });

  const genres = row.genres;
  if (genres.includes("Comedy") && !genres.includes("Crime") && !genres.includes("Horror")) {
    add(v, { leggero: 2, sollevante: 2 });
  }
  if (genres.includes("Drama") && !genres.includes("Action") && !genres.includes("Thriller")) {
    add(v, { lento: 2 });
  }
  if (genres.includes("Action") || genres.includes("Adventure")) {
    add(v, { veloce: 2 });
  }
  return v;
}

function kidsOk(genres: string[]) {
  if (genres.includes("Horror") || genres.includes("Film-Noir")) return false;
  return genres.includes("Family") || genres.includes("Animation");
}

export function tagsFor(row: Row): string[] {
  const tags: string[] = [];
  const addTag = (raw: string) => {
    const label = raw.trim();
    if (!label) return;
    if (tags.some((t) => t.toLowerCase() === label.toLowerCase())) return;
    tags.push(label);
  };
  for (const g of row.genres) addTag(GENRE_IT[g] ?? g);
  if (row.director) for (const d of row.director.split(",")) addTag(d);
  for (const s of row.subjects ?? []) addTag(s);
  for (const a of row.actors ?? []) addTag(a);
  if (row.country) for (const c of row.country.split(",")) addTag(c);
  if (row.year > 1880) addTag(`Anni ${Math.floor(row.year / 10) * 10}`);
  if (row.runtime >= 180) addTag("Oltre 3 ore");
  else if (row.runtime > 0 && row.runtime <= 90) addTag("Meno di 90 min");
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
