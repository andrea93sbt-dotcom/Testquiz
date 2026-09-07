import { useEffect, useState, type ReactNode } from "react";
import { LEGAL } from "@/lib/legal";
import { useAds } from "@/lib/ads-store";
import { useLegal } from "@/lib/legal-store";

export function MustConsent({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const consent = useAds((s) => s.consent);
  const ageOk = useLegal((s) => s.ageOk);
  const setAge = useLegal((s) => s.setAge);

  useEffect(() => {
    const done = () => {
      if (useAds.persist.hasHydrated() && useLegal.persist.hasHydrated()) {
        setReady(true);
      }
    };
    const a = useAds.persist.onFinishHydration(done);
    const b = useLegal.persist.onFinishHydration(done);
    done();
    return () => {
      a();
      b();
    };
  }, []);

  if (!ready) return <div className="min-h-dvh bg-bg" />;
  if (consent !== "all" || !ageOk) {
    return (
      <main id="contenuto" className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 py-10">
        <p className="text-xs font-medium tracking-[0.22em] text-ticket uppercase">Platea</p>
        <h1 className="mt-3 font-display text-4xl italic text-fg">Prima gli annunci.</h1>
        <p className="mt-4 text-base leading-relaxed text-muted">
          Questa pagina fa parte del quiz. Accetta gli annunci dal banner e conferma
          l'età.
        </p>
        <label className="mt-6 flex items-start gap-3 text-sm leading-relaxed text-muted">
          <input
            type="checkbox"
            className="mt-1 size-4 shrink-0 accent-accent"
            checked={ageOk}
            onChange={(e) => setAge(e.target.checked)}
          />
          <span>Ho almeno {LEGAL.ageMin} anni.</span>
        </label>
      </main>
    );
  }
  return children;
}
