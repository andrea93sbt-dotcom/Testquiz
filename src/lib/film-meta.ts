import type { Movie } from "@/data/types";

export type FilmMeta = {
  poster: string | null;
  plot: string | null;
  wikiTitle: string | null;
  wikiLang: "it" | "en" | null;
};

const mem = new Map<string, FilmMeta>();

export async function loadFilmMeta(movie: Movie): Promise<FilmMeta> {
  const cached = mem.get(movie.id) ?? readSession(movie.id);
  if (cached) {
    mem.set(movie.id, cached);
    return cached;
  }
  const wiki = await wikiLookup(movie);
  const merged: FilmMeta = wiki ?? {
    poster: null,
    plot: null,
    wikiTitle: null,
    wikiLang: null,
  };
  mem.set(movie.id, merged);
  writeSession(movie.id, merged);
  return merged;
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

async function wikiLookup(movie: Movie): Promise<FilmMeta | null> {
  const queries = [
    `${movie.title} ${movie.year} film`,
    movie.originalTitle ? `${movie.originalTitle} ${movie.year} film` : null,
    `${movie.title} film`,
  ].filter((q): q is string => Boolean(q));
  for (const lang of ["it", "en"] as const) {
    for (const q of queries) {
      const hit = await wikiPage(lang, q);
      if (hit && (hit.poster || hit.plot)) return hit;
    }
  }
  return null;
}

async function wikiPage(lang: "it" | "en", query: string): Promise<FilmMeta | null> {
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
  url.searchParams.set("exchars", "3500");
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return null;
    const data = (await res.json()) as { query?: { pages?: Record<string, WikiPage> } };
    const page = Object.values(data.query?.pages ?? {})[0];
    if (!page) return null;
    const blob = `${page.title} ${page.extract ?? ""}`.toLowerCase();
    if (!/\b(film|movie|cinema|regist|director)\b/.test(blob)) return null;
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

type WikiPage = { title: string; extract?: string; thumbnail?: { source: string } };

function takePlot(extract: string, lang: "it" | "en"): string | null {
  const heading = lang === "it" ? "(?:Trama|Sinossi|Plot)" : "(?:Plot|Synopsis|Premise)";
  const match = extract.match(
    new RegExp(`(?:^|\\n)${heading}\\n+([\\s\\S]+?)(?:\\n[^\\n]{1,48}\\n|$)`, "i"),
  );
  const raw = (match?.[1] ?? "").replace(/\s+/g, " ").trim();
  return raw.length >= 80 ? raw : null;
}
