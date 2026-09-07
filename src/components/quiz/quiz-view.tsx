import { useEffect } from "react";
import { QUESTIONS } from "@/data/questions";
import { CHAPTERS } from "@/data/chapters";
import { optionIdsForPlatforms } from "@/lib/platforms";
import { useQuiz } from "@/lib/store";
import { AppBar } from "@/components/quiz/app-bar";
import { Arena } from "@/game/arena";
import { unlockAudio } from "@/game/sfx";

export function QuizView() {
  const index = useQuiz((s) => s.index);
  const answers = useQuiz((s) => s.answers);
  const setAnswer = useQuiz((s) => s.setAnswer);
  const platforms = useQuiz((s) => s.platforms);
  const next = useQuiz((s) => s.next);
  const skip = useQuiz((s) => s.skip);
  const finish = useQuiz((s) => s.finish);

  const question = QUESTIONS[index];
  const chapter = CHAPTERS.find((c) => c.id === question.ch)!;
  const answeredCount = Object.keys(answers).length;

  useEffect(() => {
    if (question.id !== 81) return;
    if ((answers[81]?.length ?? 0) > 0 || platforms.length === 0) return;
    setAnswer(81, optionIdsForPlatforms(platforms));
  }, [question.id, answers, platforms, setAnswer]);

  const opts = question.opts.slice(0, 4);

  return (
    <main id="contenuto" className="mx-auto flex min-h-dvh max-w-xl flex-col px-3 py-3 sm:px-5 sm:py-5">
      <AppBar />
      <p className="mb-2 font-pixel text-[9px] tracking-widest text-ticket">
        ATTO {chapter.id}/10 · {chapter.title.toUpperCase()}
      </p>
      <Arena
        key={question.id}
        question={question.q}
        hint={question.hint}
        options={opts}
        progress={`${String(index + 1).padStart(3, "0")}/100 · ${answeredCount} ok`}
        onPick={(id) => {
          unlockAudio();
          setAnswer(question.id, [id]);
          if (index >= QUESTIONS.length - 1) finish();
          else next();
        }}
        onSkip={skip}
      />
    </main>
  );
}
