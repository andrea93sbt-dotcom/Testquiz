declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const DENIED = {
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
  analytics_storage: "denied",
  functionality_storage: "granted",
  security_storage: "granted",
} as const;

function gtag(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function bootConsentMode() {
  if (typeof window === "undefined") return;
  if (window.gtag) return;
  window.gtag = gtag;
  window.dataLayer = window.dataLayer || [];
  gtag("consent", "default", { ...DENIED, wait_for_update: 500 });
  gtag("set", "ads_data_redaction", true);
  gtag("set", "url_passthrough", false);
}

export function applyAdvertisingConsent(allowed: boolean) {
  if (typeof window === "undefined" || !window.gtag) return;
  const v = allowed ? "granted" : "denied";
  window.gtag("consent", "update", {
    ad_storage: v,
    ad_user_data: v,
    ad_personalization: v,
    analytics_storage: "denied",
  });
}

export function hasGlobalPrivacyControl() {
  if (typeof navigator === "undefined") return false;
  return Boolean((navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl);
}
