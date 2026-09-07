import { create } from "zustand";
import { persist } from "zustand/middleware";

type LegalState = {
  ageOk: boolean;
  confirmAge: () => void;
  setAge: (ok: boolean) => void;
};

export const useLegal = create<LegalState>()(
  persist(
    (set) => ({
      ageOk: false,
      confirmAge: () => set({ ageOk: true }),
      setAge: (ok) => set({ ageOk: ok }),
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
