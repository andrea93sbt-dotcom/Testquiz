/**
 * Google AdSense. Lo slot (id numerico) è opzionale: senza, restano
 * gli Auto ads dell'account. Override su Vercel con VITE_ADSENSE_*.
 */
export const ADS_CONFIG = {
  client: import.meta.env.VITE_ADSENSE_CLIENT || "ca-pub-2155258791610247",
  slots: {
    banner: import.meta.env.VITE_ADSENSE_SLOT_BANNER || "",
    box: import.meta.env.VITE_ADSENSE_SLOT_BOX || "",
    feed: import.meta.env.VITE_ADSENSE_SLOT_FEED || "",
  },
} as const;

export function adsReady() {
  return /^ca-pub-\d+$/.test(ADS_CONFIG.client);
}
