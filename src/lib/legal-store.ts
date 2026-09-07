import { create } from "zustand";
import { persist } from "zustand/middleware";

type LegalState = {
  ageOk: boolean;
  confirmAge: () => void;
};

export const useLegal = create<LegalState>()(
  persist(
    (set) => ({
      ageOk: false,
      confirmAge: () => set({ ageOk: true }),
    }),
    { name: "platea-legal", skipHydration: true },
  ),
);

export function wipeLocalData() {
  try {
    localStorage.removeItem("platea-quiz");
    localStorage.removeItem("platea-ads");
    localStorage.removeItem("platea-legal");
  } catch {
    /* private mode */
  }
  location.assign("/");
}
