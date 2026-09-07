import { create } from "zustand";
import { persist } from "zustand/middleware";
import { QUESTIONS } from "@/data/questions";
import { pickSeenTrios } from "@/data/movies";
import type { AnswerMap, Platform, SeenVerdict } from "@/data/types";
import { optionIdsForPlatforms, platformsFromOptionIds } from "@/lib/platforms";

export type Mode = "quiz" | "seen";
export type Phase = "intro" | "platforms" | "quiz" | "seen" | "results";

type PersistSlice = {
  phase: Phase;
  mode: Mode;
  index: number;
  answers: AnswerMap;
  platforms: Platform[];
  platformsReturn: "quiz" | "seen" | "results";
  seenRound: number;
  seenTrios: string[][];
  seenVerdicts: Record<string, SeenVerdict>;
};

type State = PersistSlice & {
  start: () => void;
  startSeen: () => void;
  confirmPlatforms: () => void;
  setPlatforms: (platforms: Platform[]) => void;
  togglePlatform: (platform: Platform) => void;
  setAnswer: (questionId: number, optionIds: string[]) => void;
  next: () => void;
  prev: () => void;
  skip: () => void;
  goTo: (index: number) => void;
  finish: () => void;
  reset: () => void;
  editPlatforms: () => void;
  home: () => void;
  resume: () => void;
  placeSeen: (movieId: string, verdict: SeenVerdict) => void;
  unplaceSeen: (movieId: string) => void;
  nextSeenRound: () => void;
};

const empty: PersistSlice = {
  phase: "intro",
  mode: "quiz",
  index: 0,
  answers: {},
  platforms: [],
  platformsReturn: "quiz",
  seenRound: 0,
  seenTrios: [],
  seenVerdicts: {},
};

function clampIndex(n: unknown) {
  const i = Number(n);
  if (!Number.isFinite(i) || i < 0) return 0;
  return Math.min(Math.floor(i), QUESTIONS.length - 1);
}

export const useQuiz = create<State>()(
  persist(
    (set, get) => ({
      ...empty,
      start: () =>
        set({
          phase: "platforms",
          mode: "quiz",
          platformsReturn: "quiz",
          index: 0,
        }),
      startSeen: () =>
        set({
          phase: "platforms",
          mode: "seen",
          platformsReturn: "seen",
          seenRound: 0,
          seenTrios: pickSeenTrios(),
          seenVerdicts: {},
        }),
      confirmPlatforms: () => set({ phase: get().platformsReturn }),
      setPlatforms: (platforms) =>
        set({
          platforms,
          answers: { ...get().answers, 81: optionIdsForPlatforms(platforms) },
        }),
      togglePlatform: (platform) => {
        const current = get().platforms;
        const next = current.includes(platform)
          ? current.filter((p) => p !== platform)
          : [...current, platform];
        get().setPlatforms(next);
      },
      setAnswer: (questionId, optionIds) => {
        const nextAnswers = { ...get().answers, [questionId]: optionIds };
        if (questionId === 81) {
          set({
            answers: nextAnswers,
            platforms: platformsFromOptionIds(optionIds),
          });
          return;
        }
        set({ answers: nextAnswers });
      },
      next: () => {
        const { index } = get();
        if (index >= QUESTIONS.length - 1) {
          set({ phase: "results" });
          return;
        }
        set({ index: index + 1 });
      },
      prev: () => set({ index: Math.max(0, get().index - 1) }),
      skip: () => get().next(),
      goTo: (index) =>
        set({
          index: clampIndex(index),
          phase: "quiz",
          mode: "quiz",
        }),
      finish: () => set({ phase: "results" }),
      reset: () => set({ ...empty }),
      editPlatforms: () => set({ phase: "platforms", platformsReturn: "results" }),
      home: () => set({ phase: "intro" }),
      resume: () => {
        const s = get();
        if (s.mode === "seen") {
          const trios = s.seenTrios.length ? s.seenTrios : pickSeenTrios();
          set({
            seenTrios: trios,
            phase: s.seenRound >= trios.length ? "results" : "seen",
          });
          return;
        }
        if (s.index >= QUESTIONS.length) {
          set({ phase: "results" });
          return;
        }
        set({ phase: "quiz", index: clampIndex(s.index) });
      },
      placeSeen: (movieId, verdict) =>
        set({ seenVerdicts: { ...get().seenVerdicts, [movieId]: verdict } }),
      unplaceSeen: (movieId) => {
        const next = { ...get().seenVerdicts };
        delete next[movieId];
        set({ seenVerdicts: next });
      },
      nextSeenRound: () => {
        const { seenRound, seenTrios } = get();
        if (seenRound >= seenTrios.length - 1) {
          set({ phase: "results" });
          return;
        }
        set({ seenRound: seenRound + 1 });
      },
    }),
    {
      name: "platea-quiz",
      skipHydration: true,
      version: 4,
      partialize: (s): PersistSlice => ({
        phase: s.phase,
        mode: s.mode,
        index: s.index,
        answers: s.answers,
        platforms: s.platforms,
        platformsReturn: s.platformsReturn,
        seenRound: s.seenRound,
        seenTrios: s.seenTrios,
        seenVerdicts: s.seenVerdicts,
      }),
      migrate: (persisted) => {
        const p = (persisted ?? {}) as Partial<PersistSlice>;
        const index = clampIndex(p.index);
        let phase: Phase = p.phase ?? "intro";
        if (phase !== "intro" && phase !== "platforms" && phase !== "quiz" && phase !== "seen" && phase !== "results") {
          phase = "intro";
        }
        if (phase === "quiz" && (Number(p.index) || 0) >= QUESTIONS.length) phase = "results";
        const seenTrios = Array.isArray(p.seenTrios) ? p.seenTrios.filter((t) => Array.isArray(t)) : [];
        let seenRound = Math.max(0, Number(p.seenRound) || 0);
        if (phase === "seen" && seenTrios.length === 0) phase = "intro";
        if (phase === "seen" && seenRound >= seenTrios.length) phase = "results";
        return {
          ...empty,
          ...p,
          index,
          phase,
          mode: p.mode === "seen" ? "seen" : "quiz",
          seenRound,
          seenTrios,
          seenVerdicts: p.seenVerdicts && typeof p.seenVerdicts === "object" ? p.seenVerdicts : {},
        };
      },
    },
  ),
);
