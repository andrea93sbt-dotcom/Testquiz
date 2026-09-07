import { useEffect, useRef } from "react";
import { ADS_CONFIG, adsReady } from "@/lib/ads-config";
import { useAds } from "@/lib/ads-store";
import { cn } from "@/lib/utils";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type Format = "banner" | "box" | "feed";

const SIZE: Record<Format, { wrap: string; ins: string; preview: string }> = {
  banner: {
    wrap: "min-h-32",
    ins: "min-h-28",
    preview: "min-h-28 py-6",
  },
  box: {
    wrap: "min-h-80",
    ins: "min-h-72",
    preview: "min-h-72 py-12",
  },
  feed: {
    wrap: "min-h-[22rem]",
    ins: "min-h-80",
    preview: "min-h-80 py-14",
  },
};

export function AdSlot({ format, className }: { format: Format; className?: string }) {
  const consent = useAds((s) => s.consent);
  const live = adsReady() && consent === "all";
  const slot = ADS_CONFIG.slots[format];
  const pushed = useRef(false);

  useEffect(() => {
    if (!live || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      /* network / blocker */
    }
  }, [live]);

  if (consent === "none") return null;

  const size = SIZE[format];

  return (
    <aside
      aria-label="Pubblicità"
      className={cn("ad-well overflow-hidden rounded-md", size.wrap, className)}
    >
      <p className="border-b border-border px-3 py-1.5 text-[10px] tracking-[0.2em] text-subtle uppercase">
        Pubblicità
      </p>
      {live ? (
        <ins
          className={cn("adsbygoogle block w-full", size.ins)}
          data-ad-client={ADS_CONFIG.client}
          {...(slot ? { "data-ad-slot": slot } : {})}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div className={cn("flex items-center justify-center px-4 text-center", size.preview)}>
          <p className="text-sm text-muted">Accetta gli annunci per attivarli.</p>
        </div>
      )}
    </aside>
  );
}
