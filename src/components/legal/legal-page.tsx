import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { LEGAL } from "@/lib/legal";
import { LegalFooter } from "@/components/legal/legal-footer";

export function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main id="contenuto" className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-14">
      <p className="text-xs font-medium tracking-[0.22em] text-muted uppercase">
        <Link to="/" className="hover:text-fg">
          Platea
        </Link>
        {" · "}
        {LEGAL.lastUpdated}
      </p>
      <h1 className="mt-4 font-display text-3xl italic leading-tight text-fg md:text-4xl">
        {title}
      </h1>
      <div className="legal-prose mt-8 space-y-4 text-sm leading-relaxed text-muted [&_a]:text-fg [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-xl [&_h2]:italic [&_h2]:text-fg [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5">
        {children}
      </div>
      <LegalFooter />
    </main>
  );
}
