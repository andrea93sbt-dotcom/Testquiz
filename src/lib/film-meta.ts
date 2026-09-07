import type { Movie } from "@/data/types";

export type FilmMeta = {
  poster: string | null;
  plot: string | null;
  wikiTitle: string | null;
  wikiLang: "it" | "en" | null;
  trailerId: string | null;
};

const mem = new Map<string, FilmMeta>();

const emptyMeta = (): FilmMeta => ({
  poster: null,
  plot: null,
  wikiTitle: null,
  wikiLang: null,
  trailerId: null,
});

export async function loadFilmMeta(movie: Movie): Promise<FilmMeta> {
  const cached = mem.get(movie.id) ?? readSession(movie.id);
  if (cached) {
    const full: FilmMeta = { ...emptyMeta(), ...cached };
    if (full.trailerId || cached.trailerId === null) {
      mem.set(movie.id, full);
      return full;
    }
  }
  const [wiki, trailerId] = await Promise.all([wikiLookup(movie), youtubeTrailerId(movie.id)]);
  const merged: FilmMeta = {
    ...(wiki ?? emptyMeta()),
    trailerId,
  };
  mem.set(movie.id, merged);
  writeSession(movie.id, merged);
  return merged;
}

export function youtubeSearchUrl(movie: Movie) {
  const name = movie.originalTitle && movie.originalTitle !== movie.title ? movie.originalTitle : movie.title;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${name} ${movie.year} trailer ufficiale`)}`;
}

export function youtubeEmbedUrl(id: string) {
  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1`;
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
      trailerId: null,
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

type Sparql = {
  results?: { bindings?: Array<{ yt?: { value: string } }> };
};

async function youtubeTrailerId(imdbId: string): Promise<string | null> {
  if (!/^tt\d+$/.test(imdbId)) return null;
  const query = `SELECT ?yt WHERE { ?item wdt:P345 "${imdbId}" . ?item wdt:P1651 ?yt } LIMIT 1`;
  const url = `https://query.wikidata.org/sparql?format=json&query=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/sparql-results+json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as Sparql;
    const raw = data.results?.bindings?.[0]?.yt?.value ?? "";
    const id = raw.match(/(?:v=|youtu\.be\/)?([A-Za-z0-9_-]{11})$/)?.[1] ?? (/^[A-Za-z0-9_-]{11}$/.test(raw) ? raw : null);
    return id;
  } catch {
    return null;
  }
}
