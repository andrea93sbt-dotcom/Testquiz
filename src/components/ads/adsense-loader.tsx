import { useEffect } from "react";
import { useAds } from "@/lib/ads-store";
import { applyAdvertisingConsent, bootConsentMode } from "@/lib/consent-mode";

export function AdSenseLoader() {
  const consent = useAds((s) => s.consent);

  useEffect(() => {
    bootConsentMode();
    applyAdvertisingConsent(consent === "all");
  }, [consent]);

  return null;
}
