export const AXES = [
  "azione",
  "commedia",
  "dramma",
  "thriller",
  "horror",
  "scifi",
  "romance",
  "crime",
  "fantasy",
  "animazione",
  "documentario",
  "avventura",
  "guerra",
  "mistero",
  "biografico",
  "western",
  "musical",
  "leggero",
  "oscuro",
  "teso",
  "malinconico",
  "sollevante",
  "strano",
  "ironico",
  "lento",
  "veloce",
  "semplice",
  "complesso",
  "intimo",
  "spettacolo",
  "stilizzato",
  "dialoghi",
  "immagini",
  "classico",
  "moderno",
  "italiano",
  "hollywood",
  "europa",
  "asia",
  "speranza",
  "cinico",
  "vero",
  "famiglia",
  "amore",
  "potere",
  "identita",
  "breve",
  "lungo",
] as const;

export type Axis = (typeof AXES)[number];

export type Weights = Partial<Record<Axis, number>>;

export const PLATFORMS = [
  "netflix",
  "prime",
  "disney",
  "apple",
  "now",
  "mubi",
  "raiplay",
  "paramount",
] as const;

export type Platform = (typeof PLATFORMS)[number];

export const PLATFORM_META: Record<
  Platform,
  { label: string; search: (q: string) => string }
> = {
  netflix: {
    label: "Netflix",
    search: (q) => `https://www.netflix.com/search?q=${encodeURIComponent(q)}`,
  },
  prime: {
    label: "Prime Video",
    search: (q) =>
      `https://www.primevideo.com/search?phrase=${encodeURIComponent(q)}`,
  },
  disney: {
    label: "Disney+",
    search: (q) => `https://www.disneyplus.com/search/${encodeURIComponent(q)}`,
  },
  apple: {
    label: "Apple TV",
    search: (q) =>
      `https://tv.apple.com/search?term=${encodeURIComponent(q)}`,
  },
  now: {
    label: "NOW",
    search: (q) => `https://www.nowtv.it/search?q=${encodeURIComponent(q)}`,
  },
  mubi: {
    label: "MUBI",
    search: (q) => `https://mubi.com/it/search/${encodeURIComponent(q)}`,
  },
  raiplay: {
    label: "RaiPlay",
    search: (q) =>
      `https://www.raiplay.it/ricerca.html?q=${encodeURIComponent(q)}`,
  },
  paramount: {
    label: "Paramount+",
    search: (q) =>
      `https://www.paramountplus.com/search/?q=${encodeURIComponent(q)}`,
  },
};

export type Flags = {
  maxMinutes?: number;
  minMinutes?: number;
  minYear?: number;
  maxYear?: number;
  platforms?: Platform[];
  avoid?: Axis[];
  require?: Axis[];
  company?: "solo" | "coppia" | "amici" | "famiglia";
  dubbed?: boolean;
  kidsOk?: boolean;
};

export type Option = {
  id: string;
  label: string;
  w: Weights;
  f?: Flags;
};

export type Question = {
  id: number;
  ch: number;
  q: string;
  hint?: string;
  type: "single" | "multi";
  opts: Option[];
};

export type Chapter = {
  id: number;
  title: string;
  subtitle: string;
};

export type SeenVerdict = "like" | "dislike" | "unseen";

export type Movie = {
  id: string;
  title: string;
  originalTitle?: string;
  year: number;
  runtime: number;
  director: string;
  country: string;
  platforms: Platform[];
  synopsis: string;
  v: Weights;
  kidsOk?: boolean;
  tags: string[];
  genres?: string[];
  actors?: string[];
  subjects?: string[];
};

export type AnswerMap = Record<number, string[]>;
