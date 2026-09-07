import { Link } from "@tanstack/react-router";
import { useAds } from "@/lib/ads-store";

const LINKS = [
  { to: "/privacy" as const, label: "Privacy" },
  { to: "/cookie" as const, label: "Cookie" },
  { to: "/termini" as const, label: "Termini" },
  { to: "/accessibilita" as const, label: "Accessibilità" },
];

export function LegalFooter() {
  const consent = useAds((s) => s.consent);
  const resetConsent = useAds((s) => s.resetConsent);

  return (
    <nav
      aria-label="Informazioni legali"
      className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-border pt-5 text-xs text-subtle"
    >
      {LINKS.map((l) => (
        <Link
          key={l.to}
          to={l.to}
          className="min-h-11 inline-flex items-center underline-offset-2 hover:text-muted hover:underline"
        >
          {l.label}
        </Link>
      ))}
      <a
        href="/platea-vercel.zip"
        download="platea-vercel.zip"
        className="min-h-11 inline-flex items-center underline-offset-2 hover:text-muted hover:underline"
      >
        Scarica lo zip
      </a>
    </nav>
  );
}
