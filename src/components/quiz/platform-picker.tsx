import { PLATFORM_META, PLATFORMS, type Platform } from "@/data/types";
import { cn } from "@/lib/utils";
import { blip, unlockAudio } from "@/game/sfx";

export function PlatformPicker({
  selected,
  onToggle,
}: {
  selected: Platform[];
  onToggle: (platform: Platform) => void;
}) {
  return (
    <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {PLATFORMS.map((id) => {
        const on = selected.includes(id);
        return (
          <li key={id}>
            <button
              type="button"
              aria-pressed={on}
              onClick={() => {
                unlockAudio();
                blip(on ? "skip" : "ok");
                onToggle(id);
              }}
              className={cn(
                "flex min-h-14 w-full items-center justify-between gap-3 pixel-chip px-4 py-3 text-left transition-transform duration-150 ease-out",
                "hover:border-border-strong active:scale-[0.99]",
                on ? "border-accent bg-raised" : "border-border bg-surface",
              )}
            >
              <span className="text-[0.95rem] text-fg">{PLATFORM_META[id].label}</span>
              <span
                className={cn(
                  "font-pixel text-[9px]",
                  on ? "text-accent" : "text-subtle",
                )}
              >
                {on ? "ON" : "OFF"}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
