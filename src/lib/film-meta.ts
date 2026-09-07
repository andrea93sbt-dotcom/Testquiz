import type { Movie } from "@/data/types";
import type { Offer } from "@/lib/tmdb";

export type FilmMeta = {
  poster: string | null;
  plot: string | null;
  wikiTitle: string | null;
  wikiLang: "it" | "en" | null;
  overview: string | null;
  offers: Offer[];
  watchLink: string | null;
  source: "tmdb" | "wikipedia" | "none";
};

const mem = new Map<string, FilmMeta>();

export async function loadFilmMeta(movie: Movie): Promise<FilmMeta> {
  const key = movie.id;
  const cached = mem.get(key) ?? readSession(key);
  if (cached) {
    mem.set(key, cached);
    return cached;
  }

  const fromApi = await fromServer(movie);
  const wiki =
    !fromApi.poster || !fromApi.plot ? await wikiLookup(movie) : null;

  const merged: FilmMeta = {
    poster: fromApi.poster ?? wiki?.poster ?? null,
    plot: fromApi.plot ?? wiki?.plot ?? null,
    wikiTitle: wiki?.wikiTitle ?? null,
    wikiLang: wiki?.wikiLang ?? null,
    overview: fromApi.overview,
    offers: fromApi.offers,
    watchLink: fromApi.watchLink,
    source: fromApi.source === "tmdb" ? "tmdb" : wiki?.poster || wiki?.plot ? "wikipedia" : "none",
  };
  mem.set(key, merged);
  writeSession(key, merged);
  return merged;
}

async function fromServer(movie: Movie): Promise<{
  poster: string | null;
  plot: string | null;
  overview: string | null;
  offers: Offer[];
  watchLink: string | null;
  source: "tmdb" | "none";
}> {
  const empty = {
    poster: null,
    plot: null,
    overview: null,
    offers: [] as Offer[],
    watchLink: null,
    source: "none" as const,
  };
  try {
    const url = new URL("/api/film", window.location.origin);
    url.searchParams.set("title", movie.title);
    url.searchParams.set("year", String(movie.year));
    if (movie.originalTitle) url.searchParams.set("original", movie.originalTitle);
    const res = await fetch(url.toString());
    if (!res.ok) return empty;
    return (await res.json()) as typeof empty;
  } catch {
    return empty;
  }
}

function readSession(key: string): FilmMeta | null {
  try {
    const raw = sessionStorage.getItem(`platea-film:${key}`);
    return raw ? (JSON.parse(raw) as FilmMeta) : null;
  } catch {
    return null;
  }
}

function writeSession(key: string, meta: FilmMeta) {
  try {
    sessionStorage.setItem(`platea-film:${key}`, JSON.stringify(meta));
  } catch {
    /* quota */
  }
}

async function wikiLookup(movie: Movie): Promise<Pick<FilmMeta, "poster" | "plot" | "wikiTitle" | "wikiLang"> | null> {
  const queries = [
    `${movie.title} ${movie.year} film`,
    movie.originalTitle ? `${movie.originalTitle} ${movie.year} film` : null,
    `${movie.title} film`,
    movie.originalTitle,
  ].filter((q): q is string => Boolean(q));

  for (const lang of ["it", "en"] as const) {
    for (const q of queries) {
      const hit = await wikiPage(lang, q);
      if (hit && (hit.poster || hit.plot)) return hit;
    }
  }
  return null;
}

async function wikiPage(lang: "it" | "en", query: string) {
  const url = new URL(`https://${lang}.wikipedia.org/w/api.php`);
  url.searchParams.set("action", "query");
  url.searchParams.set("format", "json");
  url.searchParams.set("origin", "*");
  url.searchParams.set("generator", "search");
  url.searchParams.set("gsrsearch", query);
  url.searchParams.set("gsrlimit", "1");
  url.searchParams.set("prop", "pageimages|extracts");
  url.searchParams.set("piprop", "thumbnail");
  url.searchParams.set("pithumbsize", "480");
  url.searchParams.set("explaintext", "1");
  url.searchParams.set("exsectionformat", "plain");
  url.searchParams.set("exchars", "4000");

  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as {
      query?: { pages?: Record<string, WikiPage> };
    };
    const page = Object.values(data.query?.pages ?? {})[0];
    if (!page) return null;
    const blob = `${page.title} ${page.extract ?? ""}`.toLowerCase();
    if (!/\b(film|movie|cinema|regist|director|película)\b/.test(blob)) return null;
    return {
      poster: page.thumbnail?.source ?? null,
      plot: takePlot(page.extract ?? "", lang),
      wikiTitle: page.title,
      wikiLang: lang,
    };
  } catch {
    return null;
  }
}

type WikiPage = {
  title: string;
  extract?: string;
  thumbnail?: { source: string };
};

function takePlot(extract: string, lang: "it" | "en"): string | null {
  const heading = lang === "it" ? "(?:Trama|Sinossi|Plot)" : "(?:Plot|Synopsis|Premise)";
  const match = extract.match(
    new RegExp(`(?:^|\\n)${heading}\\n+([\\s\\S]+?)(?:\\n[^\\n]{1,48}\\n|$)`, "i"),
  );
  const raw = (match?.[1] ?? "").replace(/\s+/g, " ").trim();
  if (raw.length < 80) return null;
  return raw;
}
