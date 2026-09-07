import { Button } from "@/components/ui/button";
import { useAds } from "@/lib/ads-store";
import { useQuiz } from "@/lib/store";
import { cn } from "@/lib/utils";

export function AppBar() {
  const home = useQuiz((s) => s.home);
  const consent = useAds((s) => s.consent);
  const accept = useAds((s) => s.accept);
  const decline = useAds((s) => s.decline);
  const adsOn = consent === "all";

  return (
    <div className="mb-8 flex items-center justify-between gap-3">
      <Button variant="ghost" size="sm" className="min-h-11 px-2" onClick={home}>
        Menu
      </Button>
      <button
        type="button"
        role="switch"
        aria-checked={adsOn}
        onClick={() => {
          if (adsOn) {
            decline();
            home();
          } else {
            accept();
          }
        }}
        className="flex min-h-11 items-center gap-2 text-sm text-muted"
      >
        Annunci
        <span
          className={cn(
            "relative h-6 w-10 rounded-full border border-border-strong transition-colors",
            adsOn ? "bg-accent" : "bg-raised",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 size-5 rounded-full bg-fg transition-transform",
              adsOn ? "translate-x-4" : "translate-x-0.5",
            )}
          />
        </span>
      </button>
    </div>
  );
}
