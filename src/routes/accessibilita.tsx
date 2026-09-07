import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL } from "@/lib/legal";

export const Route = createFileRoute("/accessibilita")({
  component: A11yPage,
  head: () => ({ meta: [{ title: "Accessibilità · Platea" }] }),
});

function A11yPage() {
  return (
    <LegalPage title="Accessibilità">
      <p>
        Platea è pensata per essere usabile, in linea con i principi della
        Direttiva (UE) 2019/882 e delle WCAG 2.2 livello AA, per quanto
        applicabile a un quiz sul web.
      </p>
      <h2>Cosa c'è</h2>
      <ul>
        <li>Lingua della pagina dichiarata (italiano).</li>
        <li>Contrasto alto su fondo scuro.</li>
        <li>Aree cliccabili di almeno 44px, navigazione da tastiera.</li>
        <li>Stati di focus visibili; rispetto di «prefers-reduced-motion».</li>
        <li>Finestra di consenso con titolo e testo alternativo.</li>
        <li>Puoi saltare le domande. Gli annunci restano accesi per usare l'app.</li>
      </ul>
      <h2>Limiti noti</h2>
      <p>
        Il quiz completo è lungo: puoi salvare in locale e uscire dopo venti
        risposte. I siti di terzi aperti dai link (JustWatch, piattaforme)
        hanno la loro accessibilità, fuori dal nostro controllo.
      </p>
      <h2>Segnalazioni</h2>
      <p>
        {LEGAL.controllerEmail ? (
          <>
            Scrivi a <a href={`mailto:${LEGAL.controllerEmail}`}>{LEGAL.controllerEmail}</a>.
          </>
        ) : (
          <>L'editore deve pubblicare un recapito in questa pagina.</>
        )}{" "}
        In Italia puoi anche rivolgerti all'AgID o all'autorità
        competente in materia di accessibilità.
      </p>
      <p>
        <Link to="/">Torna a Platea</Link>
      </p>
    </LegalPage>
  );
}
