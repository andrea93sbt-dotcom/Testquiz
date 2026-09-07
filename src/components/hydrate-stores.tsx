import { useEffect } from "react";
import { useAds } from "@/lib/ads-store";
import { useLegal } from "@/lib/legal-store";
import { useQuiz } from "@/lib/store";

export function HydrateStores() {
  useEffect(() => {
    void useQuiz.persist.rehydrate();
    void useAds.persist.rehydrate();
    void useLegal.persist.rehydrate();
  }, []);
  return null;
}
