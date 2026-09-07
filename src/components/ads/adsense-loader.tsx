import { useEffect } from "react";
import { ADS_CONFIG, adsReady } from "@/lib/ads-config";
import { useAds } from "@/lib/ads-store";
import { applyAdvertisingConsent, bootConsentMode } from "@/lib/consent-mode";

export function AdSenseLoader() {
  const consent = useAds((s) => s.consent);

  useEffect(() => {
    bootConsentMode();
    applyAdvertisingConsent(consent === "all");
    if (!adsReady() || consent !== "all") return;
    if (document.querySelector("script[data-platea-ads]")) return;
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADS_CONFIG.client}`;
    script.dataset.plateaAds = "1";
    document.head.appendChild(script);
  }, [consent]);

  return null;
}
