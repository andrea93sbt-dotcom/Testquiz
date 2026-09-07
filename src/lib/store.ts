import { create } from "zustand";
import { persist } from "zustand/middleware";
import { QUESTIONS } from "@/data/questions";
import type { AnswerMap, Platform } from "@/data/types";
import { optionIdsForPlatforms, platformsFromOptionIds } from "@/lib/platforms";

export type Phase = "intro" | "platforms" | "quiz" | "results";

type State = {
  phase: Phase;
  index: number;
  answers: AnswerMap;
  platforms: Platform[];
  platformsReturn: "quiz" | "results";
  start: () => void;
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
};

export const useQuiz = create<State>()(
  persist(
    (set, get) => ({
      phase: "intro",
      index: 0,
      answers: {},
      platforms: [],
      platformsReturn: "quiz",
      start: () => set({ phase: "platforms", platformsReturn: "quiz", index: 0 }),
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
      goTo: (index) => set({ index, phase: "quiz" }),
      finish: () => set({ phase: "results" }),
      reset: () => set({ phase: "intro", index: 0, answers: {} }),
      editPlatforms: () => set({ phase: "platforms", platformsReturn: "results" }),
      home: () => set({ phase: "intro" }),
    }),
    { name: "platea-quiz", skipHydration: true },
  ),
);
