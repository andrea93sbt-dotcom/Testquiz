import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Intro } from "@/components/quiz/intro";
import { Platforms } from "@/components/quiz/platforms";
import { QuizView } from "@/components/quiz/quiz-view";
import { Results } from "@/components/quiz/results";
import { useAds } from "@/lib/ads-store";
import { useLegal } from "@/lib/legal-store";
import { useQuiz } from "@/lib/store";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [ready, setReady] = useState(false);
  const phase = useQuiz((s) => s.phase);
  const consent = useAds((s) => s.consent);

  useEffect(() => {
    const done = () => {
      if (
        useQuiz.persist.hasHydrated() &&
        useAds.persist.hasHydrated() &&
        useLegal.persist.hasHydrated()
      ) {
        setReady(true);
      }
    };
    const u1 = useQuiz.persist.onFinishHydration(done);
    const u2 = useAds.persist.onFinishHydration(done);
    const u3 = useLegal.persist.onFinishHydration(done);
    done();
    return () => {
      u1();
      u2();
      u3();
    };
  }, []);

  if (!ready) return <div className="min-h-dvh bg-bg" />;
  if (consent !== "all" || phase === "intro") return <Intro />;
  if (phase === "platforms") return <Platforms />;
  if (phase === "quiz") return <QuizView />;
  return <Results />;
}
