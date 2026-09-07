import { create } from "zustand";
import { persist } from "zustand/middleware";
import { applyAdvertisingConsent, bootConsentMode, hasGlobalPrivacyControl } from "@/lib/consent-mode";

export const CONSENT_VERSION = 2;

export type AdsConsent = "unknown" | "all" | "none";

type AdsState = {
  consent: AdsConsent;
  version: number;
  decidedAt: string | null;
  accept: () => void;
  decline: () => void;
  resetConsent: () => void;
};

function stamp(consent: Exclude<AdsConsent, "unknown">): Pick<AdsState, "consent" | "version" | "decidedAt"> {
  applyAdvertisingConsent(consent === "all");
  return { consent, version: CONSENT_VERSION, decidedAt: new Date().toISOString() };
}

export const useAds = create<AdsState>()(
  persist(
    (set) => ({
      consent: "unknown",
      version: 0,
      decidedAt: null,
      accept: () => set(stamp("all")),
      decline: () => set(stamp("none")),
      resetConsent: () => {
        applyAdvertisingConsent(false);
        set({ consent: "unknown", decidedAt: null });
      },
    }),
    {
      name: "platea-ads",
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        bootConsentMode();
        if (!state) return;
        if (hasGlobalPrivacyControl() && state.consent !== "all") {
          applyAdvertisingConsent(false);
          if (state.consent === "unknown") {
            state.consent = "none";
            state.version = CONSENT_VERSION;
            state.decidedAt = new Date().toISOString();
          }
          return;
        }
        if (state.version < CONSENT_VERSION) {
          state.consent = "unknown";
          state.decidedAt = null;
          applyAdvertisingConsent(false);
          return;
        }
        applyAdvertisingConsent(state.consent === "all");
      },
    },
  ),
);
