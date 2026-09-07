import { useEffect, useRef } from "react";
import { ADS_CONFIG, adsReady } from "@/lib/ads-config";
import { useAds } from "@/lib/ads-store";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Format = "banner" | "feed" | "box";

export function AdSlot({ format, className }: { format: Format; className?: string }) {
  const consent = useAds((s) => s.consent);
  const live = adsReady() && consent === "all";
  const slot = ADS_CONFIG.slots[format];
  const pushed = useRef(false);

  useEffect(() => {
    if (!live || !slot || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* network / blocker */
    }
  }, [live, slot]);

  if (consent === "none") return null;

  const tall = format === "feed";

  return (
    <aside
      aria-label="Pubblicità"
      className={cn(
        "overflow-hidden rounded-md border border-border bg-raised",
        tall ? "min-h-40" : "min-h-20",
        className,
      )}
    >
      <p className="border-b border-border px-3 py-1.5 text-xs tracking-[0.16em] text-subtle uppercase">
        Pubblicità
      </p>
      {live && slot ? (
        <ins
          className={cn("adsbygoogle block w-full", tall ? "min-h-72" : "min-h-24")}
          data-ad-client={ADS_CONFIG.client}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <Preview tall={tall} waitingConsent={consent !== "all"} />
      )}
    </aside>
  );
}

function Preview({ tall, waitingConsent }: { tall: boolean; waitingConsent: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-4 text-center",
        tall ? "min-h-36 py-8" : "min-h-16 py-4",
      )}
    >
      <p className="text-sm text-muted">
        {waitingConsent
          ? "Lo spazio si attiva se accetti gli annunci."
          : "Qui comparirà un annuncio."}
      </p>
      {waitingConsent ? null : (
        <p className="text-xs text-subtle">Per ora è vuoto: non è un inserzionista reale.</p>
      )}
    </div>
  );
}
