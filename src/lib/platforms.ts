import { QUESTIONS } from "@/data/questions";
import { PLATFORMS, type Platform } from "@/data/types";

const question81 = () => QUESTIONS.find((q) => q.id === 81);

export function optionIdsForPlatforms(platforms: Platform[]): string[] {
  const q = question81();
  if (!q) return [];
  const set = new Set(platforms);
  return q.opts
    .filter((o) => o.f?.platforms?.some((p) => set.has(p)))
    .map((o) => o.id);
}

export function platformsFromOptionIds(ids: string[]): Platform[] {
  const q = question81();
  if (!q) return [];
  const found = ids.flatMap((id) => q.opts.find((o) => o.id === id)?.f?.platforms ?? []);
  return PLATFORMS.filter((p) => found.includes(p));
}
