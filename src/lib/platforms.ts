import { PLATFORMS, type Platform } from "@/data/types";

export function optionIdsForPlatforms(platforms: Platform[]): string[] {
  return PLATFORMS.filter((p) => platforms.includes(p));
}

export function platformsFromOptionIds(ids: string[]): Platform[] {
  const set = new Set(ids);
  return PLATFORMS.filter((p) => set.has(p));
}
