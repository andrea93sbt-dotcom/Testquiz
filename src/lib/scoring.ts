import { CHAPTERS } from "@/data/chapters";
import { MOVIES } from "@/data/movies";
import { QUESTIONS } from "@/data/questions";
import {
  AXES,
  PLATFORM_META,
  type AnswerMap,
  type Axis,
  type Flags,
  type Movie,
  type Platform,
  type Weights,
} from "@/data/types";

export type Profile = {
  vector: Record<Axis, number>;
  flags: Flags;
  answered: number;
};

export type Match = {
  movie: Movie;
  score: number;
  reasons: string[];
  overlap: Platform[];
};

export type SearchRecipe = {
  label: string;
  query: string;
  justwatch: string;
  google: string;
};

export type Archetype = {
  name: string;
  line: string;
};

const AXIS_LABEL: Record<Axis, string> = {
  azione: "azione",
  commedia: "commedia",
  dramma: "dramma",
  thriller: "thriller",
  horror: "horror",
  scifi: "fantascienza",
  romance: "romanticismo",
  crime: "crime",
  fantasy: "fantasy",
  animazione: "animazione",
  documentario: "documentario",
  avventura: "avventura",
  guerra: "guerra",
  mistero: "mistero",
  biografico: "biografico",
  western: "western",
  musical: "musical",
  leggero: "leggerezza",
  oscuro: "tono scuro",
  teso: "tensione",
  malinconico: "malinconia",
  sollevante: "sollevamento",
  strano: "stranezza",
  ironico: "ironia",
  lento: "ritmo lento",
  veloce: "ritmo veloce",
  semplice: "chiarezza",
  complesso: "complessità",
  intimo: "intimità",
  spettacolo: "spettacolo",
  stilizzato: "stile",
  dialoghi: "dialoghi",
  immagini: "immagini",
  classico: "classici",
  moderno: "contemporaneo",
  italiano: "cinema italiano",
  hollywood: "Hollywood",
  europa: "Europa",
  asia: "Asia",
  speranza: "speranza",
  cinico: "disincanto",
  vero: "storie vere",
  famiglia: "famiglia",
  amore: "amore",
  potere: "potere",
  identita: "identità",
  breve: "durata breve",
  lungo: "durata lunga",
};

export function emptyVector(): Record<Axis, number> {
  return Object.fromEntries(AXES.map((a) => [a, 0])) as Record<Axis, number>;
}

export function buildProfile(answers: AnswerMap, subscribed: Platform[] = []): Profile {
  const vector = emptyVector();
  const flags: Flags = {
    platforms: [],
    avoid: [],
    require: [],
  };

  let answered = 0;

  for (const question of QUESTIONS) {
    const picked = answers[question.id];
    if (!picked?.length) continue;
    answered += 1;
    const chapterBoost = question.ch === 1 ? 2.3 : question.ch === 10 ? 1.4 : 1;
    const share = 1 / picked.length;

    for (const optId of picked) {
      const opt = question.opts.find((o) => o.id === optId);
      if (!opt) continue;
      for (const [axis, value] of Object.entries(opt.w) as [Axis, number][]) {
        vector[axis] += value * chapterBoost * share;
      }
      const f = opt.f;
      if (!f) continue;
      if (f.maxMinutes != null) {
        flags.maxMinutes = flags.maxMinutes
          ? Math.min(flags.maxMinutes, f.maxMinutes)
          : f.maxMinutes;
      }
      if (f.minMinutes != null) {
        flags.minMinutes = flags.minMinutes
          ? Math.max(flags.minMinutes, f.minMinutes)
          : f.minMinutes;
      }
      if (f.minYear != null) {
        flags.minYear = flags.minYear ? Math.max(flags.minYear, f.minYear) : f.minYear;
      }
      if (f.maxYear != null) {
        flags.maxYear = flags.maxYear ? Math.min(flags.maxYear, f.maxYear) : f.maxYear;
      }
      if (f.platforms) {
        flags.platforms = [...new Set([...(flags.platforms ?? []), ...f.platforms])];
      }
      if (f.avoid) flags.avoid = [...new Set([...(flags.avoid ?? []), ...f.avoid])];
      if (f.require) flags.require = [...new Set([...(flags.require ?? []), ...f.require])];
      if (f.company) flags.company = f.company;
      if (f.dubbed) flags.dubbed = true;
      if (f.kidsOk) flags.kidsOk = true;
    }
  }

  if (subscribed.length) {
    flags.platforms = [...new Set([...subscribed, ...(flags.platforms ?? [])])];
  }

  return { vector, flags, answered };
}

export function topAxes(vector: Record<Axis, number>, n = 6): { axis: Axis; value: number }[] {
  return AXES.map((axis) => ({ axis, value: vector[axis] }))
    .filter((x) => x.value > 0.8)
    .sort((a, b) => b.value - a.value)
    .slice(0, n);
}

export function pickArchetype(vector: Record<Axis, number>): Archetype {
  const packs: { name: string; line: string; axes: Axis[] }[] = [
    {
      name: "Compagnia sul divano",
      line: "Commedia, ritmo basso.",
      axes: ["commedia", "leggero", "semplice", "sollevante", "breve"],
    },
    {
      name: "Spettatore d'impatto",
      line: "Azione, scala grande.",
      axes: ["azione", "spettacolo", "veloce", "hollywood", "avventura"],
    },
    {
      name: "Volontario al buio",
      line: "Horror, tensione.",
      axes: ["horror", "teso", "oscuro", "thriller"],
    },
    {
      name: "Cinefilo notturno",
      line: "Ritmo lento, tono scuro.",
      axes: ["lento", "malinconico", "intimo", "complesso", "immagini"],
    },
    {
      name: "Architetto di mondi",
      line: "Fantascienza, fantasy.",
      axes: ["scifi", "complesso", "fantasy", "spettacolo"],
    },
    {
      name: "Sentimentale lucido",
      line: "Romance, senza zucchero.",
      axes: ["romance", "amore", "intimo", "malinconico"],
    },
    {
      name: "Realista da sala",
      line: "Dramma italiano.",
      axes: ["italiano", "dramma", "vero", "crime"],
    },
    {
      name: "Cartografo",
      line: "Europa, Asia, sottotitoli.",
      axes: ["asia", "europa", "stilizzato", "complesso"],
    },
    {
      name: "Cronista del sottobosco",
      line: "Crime, potere.",
      axes: ["crime", "cinico", "potere", "thriller", "oscuro"],
    },
    {
      name: "Fiaba adulta",
      line: "Animazione, fantasy.",
      axes: ["animazione", "famiglia", "fantasy", "speranza"],
    },
    {
      name: "Custode della pellicola",
      line: "Classici.",
      axes: ["classico", "hollywood", "italiano"],
    },
    {
      name: "Fuori registro",
      line: "Strano, stilizzato.",
      axes: ["strano", "stilizzato", "ironico", "complesso"],
    },
  ];

  let best = packs[packs.length - 1]!;
  let bestScore = -1;
  for (const pack of packs) {
    const score = pack.axes.reduce((n, axis) => n + (vector[axis] ?? 0), 0);
    if (score > bestScore) {
      best = pack;
      bestScore = score;
    }
  }
  if (bestScore < 6) {
    return { name: "Spettatore onnivoro", line: "Niente etichetta stretta." };
  }
  return { name: best.name, line: best.line };
}

function cosine(a: Record<Axis, number>, b: Weights): number {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const axis of AXES) {
    const av = a[axis];
    const bv = b[axis] ?? 0;
    dot += av * bv;
    na += av * av;
    nb += bv * bv;
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function reasonsFor(movie: Movie, profile: Profile): string[] {
  const shared = topAxes(profile.vector, 8)
    .filter((t) => (movie.v[t.axis] ?? 0) >= 5)
    .slice(0, 3)
    .map((t) => AXIS_LABEL[t.axis]);
  const out: string[] = [];
  if (shared.length) out.push(`Affine per ${shared.join(", ")}`);
  if (profile.flags.maxMinutes && movie.runtime <= profile.flags.maxMinutes) {
    out.push(`Sta nel tempo che hai (${movie.runtime} min)`);
  }
  if (profile.flags.company === "famiglia" && movie.kidsOk) {
    out.push("Adatto a una serata in famiglia");
  }
  const owned = profile.flags.platforms ?? [];
  const on = movie.platforms.filter((p) => owned.includes(p));
  if (on.length) {
    out.push(`Priorità su ${on.map((p) => PLATFORM_META[p].label).join(", ")}`);
  }
  return out.slice(0, 3);
}

export function rankMovies(profile: Profile): Match[] {
  const { vector, flags } = profile;
  const owned = new Set(flags.platforms ?? []);

  return MOVIES.map((movie) => {
    let score = cosine(vector, movie.v) * 100;

    if (flags.maxMinutes && movie.runtime > flags.maxMinutes + 8) score *= 0.42;
    if (flags.minMinutes && movie.runtime < flags.minMinutes - 10) score *= 0.75;
    if (flags.minYear && movie.year < flags.minYear) score *= 0.55;
    if (flags.maxYear && movie.year > flags.maxYear) score *= 0.55;
    if (flags.kidsOk && flags.company === "famiglia" && !movie.kidsOk) score *= 0.25;
    if (flags.company === "famiglia" && (movie.v.horror ?? 0) > 5) score *= 0.2;
    if (flags.avoid) {
      for (const axis of flags.avoid) {
        if ((movie.v[axis] ?? 0) >= 6) score *= 0.28;
      }
    }
    if (flags.require) {
      for (const axis of flags.require) {
        if ((movie.v[axis] ?? 0) < 5) score *= 0.5;
      }
    }

    const overlap = owned.size
      ? movie.platforms.filter((p) => owned.has(p))
      : movie.platforms.slice(0, 3);
    if (owned.size && overlap.length) score *= 1.28 + overlap.length * 0.06;
    if (owned.size && overlap.length === 0) score *= 0.68;

    return {
      movie,
      score,
      reasons: reasonsFor(movie, profile),
      overlap,
    };
  })
    .filter((m) => m.movie.runtime > 40)
    .sort((a, b) => b.score - a.score);
}

export function searchRecipes(profile: Profile, matches: Match[]): SearchRecipe[] {
  const axes = topAxes(profile.vector, 5).map((t) => AXIS_LABEL[t.axis]);
  const first = matches[0]?.movie;
  const q1 = axes.slice(0, 3).join(" ");
  const q2 = first
    ? `${first.title} ${first.year} streaming`
    : "film streaming Italia";
  const q3 = [
    profile.flags.company === "famiglia" ? "film famiglia" : "film",
    axes[0] ?? "da vedere",
    "streaming Italia",
  ].join(" ");

  const make = (label: string, query: string): SearchRecipe => ({
    label,
    query,
    justwatch: `https://www.justwatch.com/it/cerca?q=${encodeURIComponent(query)}`,
    google: `https://www.google.com/search?q=${encodeURIComponent(`${query} dove vederlo streaming`)}`,
  });

  return [
    make("Profilo", q1 || "film streaming"),
    make(first ? first.title : "Titolo", q2),
    make("Piattaforme", q3),
  ];
}

export function movieSearchLinks(movie: Movie, platforms: Platform[]) {
  const q = movie.originalTitle ? `${movie.title} ${movie.originalTitle}` : movie.title;
  const justwatch = `https://www.justwatch.com/it/cerca?q=${encodeURIComponent(movie.title)}`;
  const google = `https://www.google.com/search?q=${encodeURIComponent(`${movie.title} ${movie.year} streaming Italia`)}`;
  const platformLinks = (platforms.length ? platforms : movie.platforms).map((p) => ({
    id: p,
    label: PLATFORM_META[p].label,
    href: PLATFORM_META[p].search(q),
  }));
  return { justwatch, google, platformLinks };
}

export function chapterOf(id: number) {
  const q = QUESTIONS.find((x) => x.id === id);
  return CHAPTERS.find((c) => c.id === q?.ch) ?? CHAPTERS[0];
}

export { AXIS_LABEL };
