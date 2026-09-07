import { lookupTmdb, tmdbKey, type Offer } from "./tmdb";

export type FilmPayload = {
  poster: string | null;
  plot: string | null;
  overview: string | null;
  offers: Offer[];
  watchLink: string | null;
  source: "tmdb" | "none";
};

export async function lookupFilm(movie: {
  title: string;
  year: number;
  originalTitle?: string;
}): Promise<FilmPayload> {
  const tmdb = await lookupTmdb({
    title: movie.title,
    year: movie.year,
    originalTitle: movie.originalTitle,
    key: tmdbKey(),
  });
  if (!tmdb) {
    return {
      poster: null,
      plot: null,
      overview: null,
      offers: [],
      watchLink: null,
      source: "none",
    };
  }
  return {
    poster: tmdb.poster,
    plot: tmdb.overview,
    overview: tmdb.overview,
    offers: tmdb.offers,
    watchLink: tmdb.watchLink,
    source: "tmdb",
  };
}
