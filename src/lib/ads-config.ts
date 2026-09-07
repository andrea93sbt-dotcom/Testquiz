export const ADS_CONFIG = {
  client: "ca-pub-2155258791610247",
  slots: {
    banner: "",
    box: "",
    feed: "",
  },
} as const;

export function adsReady() {
  return /^ca-pub-\d+$/.test(ADS_CONFIG.client);
}
