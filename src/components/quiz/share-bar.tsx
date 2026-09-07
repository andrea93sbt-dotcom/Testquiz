import { useState } from "react";
import { Check, Copy, ImageDown, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { copyShareUrl, drawSharePng, shareResult, type ShareCard } from "@/lib/share";

export function ShareBar({ card, titles }: { card: ShareCard; titles: string[] }) {
  const [note, setNote] = useState("");

  return (
    <div className="mt-6">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          className="min-h-12"
          onClick={async () => {
            const result = await shareResult(card);
            setNote(result === "copied" ? "Ho copiato testo e link." : result === "shared" ? "Inviato." : "");
          }}
        >
          <Share2 className="size-4" />
          Mandalo a un amico
        </Button>
        <Button
          variant="secondary"
          className="min-h-12"
          onClick={async () => {
            const ok = await copyShareUrl(card);
            setNote(ok ? "Link copiato." : "Non riesco a copiare il link.");
          }}
        >
          <Copy className="size-4" />
          Copia il link
        </Button>
        <Button
          variant="ghost"
          className="min-h-12"
          onClick={async () => {
            try {
              const blob = await drawSharePng(card, titles);
              const href = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = href;
              a.download = "platea.png";
              a.click();
              URL.revokeObjectURL(href);
              setNote("Immagine salvata.");
            } catch {
              setNote("Non sono riuscito a salvare l'immagine.");
            }
          }}
        >
          <ImageDown className="size-4" />
          Salva l'immagine
        </Button>
      </div>
      {note ? (
        <p className="mt-2 flex items-center gap-2 text-sm text-ok">
          <Check className="size-4" />
          {note}
        </p>
      ) : (
        <p className="mt-2 text-sm text-subtle">
          Chi apre il link vede il risultato. Le tue risposte restano solo sul
          tuo telefono.
        </p>
      )}
    </div>
  );
}
