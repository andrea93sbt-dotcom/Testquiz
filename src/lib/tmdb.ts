import type { Platform } from "../data/types";

export type Offer = {
  name: string;
  platform: Platform | null;
  logo: string | null;
  type: "flatrate" | "free" | "ads" | "rent" | "buy";
};

export type TmdbHit = {
  poster: string | null;
  overview: string | null;
  offers: Offer[];
  watchLink: string | null;
};

const IMG = "https://image.tmdb.org/t/p";

export function tmdbKey() {
  const vite =
    typeof import.meta !== "undefined"
      ? String(
          (import.meta as { env?: { VITE_TMDB_KEY?: string } }).env?.VITE_TMDB_KEY ?? "",
        )
      : "";
  return (
    process.env.TMDB_API_KEY ||
    process.env.VITE_TMDB_KEY ||
    vite
  ).trim();
}

export async function lookupTmdb(opts: {
  title: string;
  year: number;
  originalTitle?: string;
  key: string;
}): Promise<TmdbHit | null> {
  const { key } = opts;
  if (!key) return null;

  const id = await searchId(opts, key);
  if (!id) return null;

  const [detailsIt, detailsEn, providers] = await Promise.all([
    tmdb(`/movie/${id}`, key, { language: "it-IT" }),
    tmdb(`/movie/${id}`, key, { language: "en-US" }),
    tmdb(`/movie/${id}/watch/providers`, key, {}),
  ]);

  const posterPath = str(detailsIt?.poster_path) || str(detailsEn?.poster_path);
  const overview =
    str(detailsIt?.overview) || str(detailsEn?.overview) || null;
  const it = (providers?.results as Record<string, unknown> | undefined)?.IT as
    | {
        link?: string;
        flatrate?: Provider[];
        free?: Provider[];
        ads?: Provider[];
        rent?: Provider[];
        buy?: Provider[];
      }
    | undefined;

  const offers: Offer[] = [
    ...take(it?.flatrate, "flatrate"),
    ...take(it?.free, "free"),
    ...take(it?.ads, "ads"),
    ...take(it?.rent, "rent"),
    ...take(it?.buy, "buy"),
  ];

  return {
    poster: posterPath ? `${IMG}/w500${posterPath}` : null,
    overview: overview && overview.length > 40 ? overview : null,
    offers,
    watchLink: it?.link ?? null,
  };
}

type Provider = {
  provider_id: number;
  provider_name: string;
  logo_path?: string;
};

function take(list: Provider[] | undefined, type: Offer["type"]): Offer[] {
  if (!list?.length) return [];
  const seen = new Set<string>();
  const out: Offer[] = [];
  for (const p of list) {
    const name = p.provider_name?.trim();
    if (!name || seen.has(name)) continue;
    seen.add(name);
    out.push({
      name,
      platform: mapPlatform(p.provider_id, name),
      logo: p.logo_path ? `${IMG}/w45${p.logo_path}` : null,
      type,
    });
  }
  return out;
}

function mapPlatform(id: number, name: string): Platform | null {
  const n = name.toLowerCase();
  if (id === 8 || n.includes("netflix")) return "netflix";
  if (id === 119 || id === 9 || n.includes("prime")) return "prime";
  if (id === 337 || n.includes("disney")) return "disney";
  if (id === 350 || id === 2 || n.includes("apple")) return "apple";
  if (n === "now" || n.includes("now tv") || n.includes("nowtv")) return "now";
  if (id === 11 || n.includes("mubi")) return "mubi";
  if (n.includes("rai")) return "raiplay";
  if (id === 531 || n.includes("paramount")) return "paramount";
  return null;
}

async function searchId(
  opts: { title: string; year: number; originalTitle?: string },
  key: string,
): Promise<number | null> {
  const queries = [opts.title, opts.originalTitle].filter(
    (q): q is string => Boolean(q),
  );
  for (const q of queries) {
    const data = await tmdb("/search/movie", key, {
      query: q,
      year: String(opts.year),
      include_adult: "false",
      language: "it-IT",
    });
    const results = (data?.results as { id: number; release_date?: string; title?: string }[]) ?? [];
    const exact = results.find((r) => (r.release_date ?? "").startsWith(String(opts.year)));
    if (exact) return exact.id;
    if (results[0]) return results[0].id;
  }
  return null;
}

async function tmdb(
  path: string,
  key: string,
  params: Record<string, string>,
): Promise<Record<string, unknown> | null> {
  const url = new URL(`https://api.themoviedb.org/3${path}`);
  url.searchParams.set("api_key", key);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function str(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v.trim() : null;
}
