import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QUESTIONS } from "@/data/questions";
import { CHAPTERS } from "@/data/chapters";
import { optionIdsForPlatforms } from "@/lib/platforms";
import { useQuiz } from "@/lib/store";
import { cn } from "@/lib/utils";
import { AppBar } from "@/components/quiz/app-bar";

export function QuizView() {
  const index = useQuiz((s) => s.index);
  const answers = useQuiz((s) => s.answers);
  const setAnswer = useQuiz((s) => s.setAnswer);
  const platforms = useQuiz((s) => s.platforms);
  const next = useQuiz((s) => s.next);
  const prev = useQuiz((s) => s.prev);
  const skip = useQuiz((s) => s.skip);
  const finish = useQuiz((s) => s.finish);

  const question = QUESTIONS[index];
  const chapter = CHAPTERS.find((c) => c.id === question.ch)!;
  const selected = answers[question.id] ?? [];
  const isMulti = question.type === "multi";
  const answeredCount = Object.keys(answers).length;
  const [flash, setFlash] = useState(question.id);

  useEffect(() => {
    setFlash(question.id);
  }, [question.id]);

  useEffect(() => {
    if (question.id !== 81) return;
    if ((answers[81]?.length ?? 0) > 0 || platforms.length === 0) return;
    setAnswer(81, optionIdsForPlatforms(platforms));
  }, [question.id, answers, platforms, setAnswer]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        if (isMulti && selected.length) next();
        else if (!isMulti) skip();
      }
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Enter" && isMulti && selected.length) next();
      const n = Number(e.key);
      if (n >= 1 && n <= question.opts.length) {
        const opt = question.opts[n - 1];
        choose(opt.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [question.id, selected.join("|"), isMulti]);

  function choose(id: string) {
    if (isMulti) {
      const nextIds = selected.includes(id)
        ? selected.filter((x) => x !== id)
        : [...selected, id];
      setAnswer(question.id, nextIds);
      return;
    }
    setAnswer(question.id, [id]);
    window.setTimeout(() => next(), 140);
  }

  const pct = ((index + 1) / QUESTIONS.length) * 100;
  const chapterPct = useMemo(() => {
    const inChapter = QUESTIONS.filter((q) => q.ch === chapter.id);
    const pos = inChapter.findIndex((q) => q.id === question.id) + 1;
    return { pos, total: inChapter.length };
  }, [chapter.id, question.id]);

  return (
    <main id="contenuto" className="mx-auto flex min-h-dvh max-w-2xl flex-col px-5 py-8 sm:px-8 sm:py-12">
      <AppBar />
      <header className="flex items-start justify-between gap-4">
        <p className="text-[11px] font-medium tracking-[0.28em] text-ticket uppercase">
          Atto {chapter.id} · {chapter.title}
        </p>
        <p className="font-mono text-xs tabular-nums text-muted">
          {String(index + 1).padStart(3, "0")} / 100
        </p>
      </header>

      <div
        className="mt-5 h-[2px] overflow-hidden rounded-full bg-raised"
        role="progressbar"
        aria-valuenow={index + 1}
        aria-valuemin={1}
        aria-valuemax={100}
        aria-label="Avanzamento"
      >
        <div
          className="h-full bg-accent transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{ width: `${pct}%` }}
        />
      </div>

      <section key={flash} className="rise-in mt-12 flex flex-1 flex-col">
        <p className="text-xs text-subtle">
          {chapterPct.pos}/{chapterPct.total}
          {isMulti ? " · più risposte" : ""}
        </p>
        <h1 className="mt-3 font-display text-xl leading-snug text-fg italic sm:text-2xl">
          {question.q}
        </h1>
        {question.hint ? (
          <p className="mt-3 text-sm text-muted">{question.hint}</p>
        ) : null}

        <ul className="mt-10 flex flex-col gap-3">
          {question.opts.map((opt, i) => {
            const on = selected.includes(opt.id);
            return (
              <li key={opt.id}>
                <button
                  type="button"
                  data-selected={on}
                  onClick={() => choose(opt.id)}
                  className={cn(
                    "flex min-h-14 w-full items-start gap-4 rounded-md border bg-surface px-4 py-3.5 text-left transition-[border-color,background-color,transform] duration-150 ease-out",
                    "hover:border-border-strong hover:bg-raised active:scale-[0.99]",
                    on ? "border-accent bg-raised" : "border-border",
                  )}
                >
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm border border-border-strong font-mono text-[11px] text-muted">
                    {i + 1}
                  </span>
                  <span className="text-[0.95rem] leading-snug text-fg">{opt.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="mt-12 flex flex-wrap items-center gap-2 border-t border-border pt-6">
        <Button variant="ghost" size="sm" onClick={prev} disabled={index === 0} className="min-h-11">
          <ChevronLeft className="size-4" />
          Indietro
        </Button>
        <Button variant="ghost" size="sm" onClick={skip} className="min-h-11">
          Salta
          <ChevronRight className="size-4" />
        </Button>
        {isMulti ? (
          <Button
            size="sm"
            className="ml-auto min-h-11"
            onClick={next}
            disabled={selected.length === 0}
          >
            Continua
          </Button>
        ) : (
          <span className="ml-auto" />
        )}
        {answeredCount >= 20 ? (
          <Button variant="secondary" size="sm" onClick={finish} className="min-h-11">
            Vedi i risultati
          </Button>
        ) : null}
      </footer>
    </main>
  );
}
