import { lookupFilm } from "../../../src/lib/film-lookup";

export default async function filmGet(event: { req: { url: string } }) {
  const url = new URL(event.req.url, "http://platea.local");
  const title = url.searchParams.get("title")?.trim() ?? "";
  const year = Number(url.searchParams.get("year") ?? "");
  const original = url.searchParams.get("original")?.trim() || undefined;
  if (!title || !Number.isFinite(year)) {
    return Response.json({ error: "bad request" }, { status: 400 });
  }
  const data = await lookupFilm({ title, year, originalTitle: original });
  return data;
}
