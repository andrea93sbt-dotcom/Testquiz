import { MOVIES, movieById } from "@/data/movies";
import { QUESTIONS } from "@/data/questions";
import {
  AXES,
  PLATFORM_META,
  type AnswerMap,
  type Axis,
  type Flags,
  type Movie,
  type Platform,
  type SeenVerdict,
  type Weights,
} from "@/data/types";

export type Profile = {
  vector: Record<Axis, number>;
  flags: Flags;
  answered: number;
  seen: Record<string, SeenVerdict>;
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
  romance: "storie d'amore",
  crime: "crime",
  fantasy: "fantasy",
  animazione: "animazione",
  documentario: "documentario",
  avventura: "avventura",
  guerra: "guerra",
  mistero: "mistero",
  biografico: "biografie",
  western: "western",
  musical: "musical",
  leggero: "film leggeri",
  oscuro: "film cupi",
  teso: "tensione",
  malinconico: "malinconia",
  sollevante: "film allegri",
  strano: "film strani",
  ironico: "ironia",
  lento: "ritmo lento",
  veloce: "ritmo veloce",
  semplice: "facile da seguire",
  complesso: "film impegnativi",
  intimo: "storie intime",
  spettacolo: "grande spettacolo",
  stilizzato: "stile marcato",
  dialoghi: "dialoghi",
  immagini: "immagini",
  classico: "classici",
  moderno: "film recenti",
  italiano: "cinema italiano",
  hollywood: "Hollywood",
  europa: "Europa",
  asia: "Asia",
  speranza: "finali che rialzano",
  cinico: "film cinici",
  vero: "storie vere",
  famiglia: "famiglia",
  amore: "amore",
  potere: "potere",
  identita: "identità",
  breve: "film corti",
  lungo: "film lunghi",
};

export { AXIS_LABEL };

export function emptyVector(): Record<Axis, number> {
  return Object.fromEntries(AXES.map((a) => [a, 0])) as Record<Axis, number>;
}

export function buildProfile(
  answers: AnswerMap,
  subscribed: Platform[] = [],
  seen: Record<string, SeenVerdict> = {},
): Profile {
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

  for (const [id, verdict] of Object.entries(seen)) {
    const movie = movieById(id);
    if (!movie) continue;
    if (verdict === "unseen") continue;
    answered += 1;
    const scale = verdict === "like" ? 2.4 : -1.6;
    for (const [axis, value] of Object.entries(movie.v) as [Axis, number][]) {
      vector[axis] += value * scale;
    }
    if (verdict === "dislike") {
      const top = Object.entries(movie.v)
        .sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))
        .slice(0, 1)
        .map(([axis]) => axis as Axis);
      flags.avoid = [...new Set([...(flags.avoid ?? []), ...top])];
    }
  }

  if (subscribed.length) {
    flags.platforms = [...new Set([...subscribed, ...(flags.platforms ?? [])])];
  }

  return { vector, flags, answered, seen };
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
      name: "Serata comoda",
      line: "Stasera vuoi un film che ti fa stare bene.",
      axes: ["commedia", "leggero", "semplice", "sollevante", "breve"],
    },
    {
      name: "Voglia di azione",
      line: "Vuoi ritmo, inseguimenti e qualcosa di grande da vedere.",
      axes: ["azione", "spettacolo", "veloce", "hollywood", "avventura"],
    },
    {
      name: "Ti piace il brivido",
      line: "Vuoi un film che ti tiene teso, non rumore a caso.",
      axes: ["horror", "teso", "oscuro", "thriller"],
    },
    {
      name: "Film da lasciare in testa",
      line: "Tempi lunghi, e qualcosa a cui pensare dopo.",
      axes: ["lento", "malinconico", "intimo", "complesso", "immagini"],
    },
    {
      name: "Mondi nuovi",
      line: "Idee e posti che non esistono.",
      axes: ["scifi", "complesso", "fantasy", "spettacolo"],
    },
    {
      name: "Amore, senza troppi zuccheri",
      line: "Una storia d'amore, non un melodramma.",
      axes: ["romance", "amore", "intimo", "malinconico"],
    },
    {
      name: "Storie vere",
      line: "Persone vere, niente costume.",
      axes: ["vero", "biografico", "dramma", "crime"],
    },
    {
      name: "Fuori dal solito",
      line: "Non solo i film che senti nominare sempre.",
      axes: ["europa", "asia", "italiano", "classico"],
    },
  ];
  let best = packs[0]!;
  let bestScore = -1;
  for (const pack of packs) {
    const score = pack.axes.reduce((n, axis) => n + (vector[axis] ?? 0), 0);
    if (score > bestScore) {
      best = pack;
      bestScore = score;
    }
  }
  return { name: best.name, line: best.line };
}

function cosine(a: Record<Axis, number>, b: Weights) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const axis of AXES) {
    const va = a[axis] ?? 0;
    const vb = b[axis] ?? 0;
    dot += va * vb;
    na += va * va;
    nb += vb * vb;
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
  if (shared.length) out.push(`Perché: ${shared.join(", ")}`);
  if (profile.flags.maxMinutes && movie.runtime <= profile.flags.maxMinutes) {
    out.push(`Dura ${movie.runtime} min, come volevi`);
  }
  if (profile.flags.company === "famiglia" && movie.kidsOk) {
    out.push("Va bene in famiglia");
  }
  const owned = profile.flags.platforms ?? [];
  const on = movie.platforms.filter((p) => owned.includes(p));
  if (on.length) {
    out.push(`Da cercare su ${on.map((p) => PLATFORM_META[p].label).join(", ")}`);
  }
  if (movie.tags.length) out.push(movie.tags.slice(0, 3).join(" · "));
  return out.slice(0, 3);
}

export function rankMovies(profile: Profile): Match[] {
  const { vector, flags, seen } = profile;
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
    if (movie.platforms.length && owned.size && overlap.length) {
      score *= 1.28 + overlap.length * 0.06;
    } else if (movie.platforms.length && owned.size && overlap.length === 0) {
      score *= 0.68;
    }

    const verdict = seen[movie.id];
    if (verdict === "dislike") score *= 0.02;
    else if (verdict === "like") score *= 0.42;
    else if (verdict === "unseen") score *= 1.06;

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
  const q2 = first ? `${first.title} ${first.year} streaming` : q1;
  const mk = (label: string, query: string): SearchRecipe => ({
    label,
    query,
    justwatch: `https://www.justwatch.com/it/ricerca?q=${encodeURIComponent(query)}`,
    google: `https://www.google.com/search?q=${encodeURIComponent(query + " film streaming")}`,
  });
  return [
    mk("Cerca film di questo tipo", q1 || "film stasera"),
    mk("Cerca a partire da questo film", q2),
  ];
}

export function movieSearchLinks(movie: Movie, _platforms: Platform[] = []) {
  const q = `${movie.title} ${movie.year}`;
  return {
    justwatch: `https://www.justwatch.com/it/ricerca?q=${encodeURIComponent(q)}`,
    google: `https://www.google.com/search?q=${encodeURIComponent(q + " dove vederlo")}`,
  };
}
