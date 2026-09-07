import { questionsFor } from "@/data/questions";
import { CHAPTERS } from "@/data/chapters";
import { optionIdsForPlatforms } from "@/lib/platforms";
import { useQuiz } from "@/lib/store";
import { useEffect } from "react";
import { AppBar } from "@/components/quiz/app-bar";
import { PlazaCanvas } from "@/game/plaza-canvas";
import { AdSlot } from "@/components/ads/ad-slot";

export function QuizView() {
  const index = useQuiz((s) => s.index);
  const mode = useQuiz((s) => s.mode);
  const answers = useQuiz((s) => s.answers);
  const setAnswer = useQuiz((s) => s.setAnswer);
  const platforms = useQuiz((s) => s.platforms);
  const next = useQuiz((s) => s.next);
  const skip = useQuiz((s) => s.skip);
  const finish = useQuiz((s) => s.finish);

  const deck = questionsFor(mode === "short" ? "short" : "quiz");
  const safeIndex = Math.max(0, Math.min(index, deck.length - 1));
  const question = deck[safeIndex];
  const chapter = question ? CHAPTERS.find((c) => c.id === question.ch) : undefined;

  useEffect(() => {
    if (index >= deck.length) finish();
  }, [index, deck.length, finish]);

  useEffect(() => {
    if (!question || question.id !== 81) return;
    if ((answers[81]?.length ?? 0) > 0 || platforms.length === 0) return;
    setAnswer(81, optionIdsForPlatforms(platforms));
  }, [question, answers, platforms, setAnswer]);

  if (!question || !chapter) {
    return (
      <main id="contenuto" className="mx-auto max-w-xl px-4 py-10">
        <p className="text-muted">Il quiz è finito.</p>
      </main>
    );
  }

  const opts = question.opts.slice(0, 4);

  return (
    <div className="relative min-h-dvh bg-bg">
      <main id="contenuto" className="mx-auto flex min-h-dvh max-w-3xl flex-col px-3 py-4 sm:px-6">
        <AppBar />
        <PlazaCanvas
          question={question.q}
          hint={question.hint}
          chapter={`Atto ${chapter.id} · ${chapter.title}`}
          index={safeIndex}
          total={deck.length}
          options={opts}
          onPick={(ids) => {
            setAnswer(question.id, ids);
            if (safeIndex >= deck.length - 1) finish();
            else next();
          }}
          onSkip={() => {
            if (safeIndex >= deck.length - 1) finish();
            else skip();
          }}
        />
        <AdSlot format="banner" className="mt-4" />
      </main>
    </div>
  );
}
