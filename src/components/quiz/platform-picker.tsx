import { Check } from "lucide-react";
import { PLATFORM_META, PLATFORMS, type Platform } from "@/data/types";
import { cn } from "@/lib/utils";

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
              onClick={() => onToggle(id)}
              className={cn(
                "flex min-h-14 w-full items-center justify-between gap-3 rounded-md border px-4 py-3 text-left transition-[border-color,background-color,transform] duration-150 ease-out",
                "hover:border-border-strong hover:bg-raised active:scale-[0.99]",
                on ? "border-accent bg-raised" : "border-border bg-surface",
              )}
            >
              <span className="text-[0.95rem] text-fg">{PLATFORM_META[id].label}</span>
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-sm border",
                  on
                    ? "border-accent bg-accent text-accent-fg"
                    : "border-border-strong text-transparent",
                )}
              >
                <Check className="size-3.5" strokeWidth={2.2} />
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
