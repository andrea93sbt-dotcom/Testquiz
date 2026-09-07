import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL } from "@/lib/legal";

export const Route = createFileRoute("/accessibilita")({
  component: A11yPage,
  head: () => ({ meta: [{ title: "Accessibilità · Platea" }] }),
});

function A11yPage() {
  return (
    <LegalPage title="Dichiarazione di accessibilità">
      <p>
        Platea è progettata in linea con i principi della Direttiva (UE)
        2019/882 (European Accessibility Act) e delle WCAG 2.2 livello AA, per
        quanto applicabile a un questionario web.
      </p>
      <h2>Cosa c'è</h2>
      <ul>
        <li>Lingua della pagina dichiarata (italiano).</li>
        <li>Contrasto alto su fondo scuro, un solo accento.</li>
        <li>Aree cliccabili di almeno 44px, navigazione da tastiera.</li>
        <li>Stati di focus visibili; rispetto di «prefers-reduced-motion».</li>
        <li>Dialog di consenso con titolo e alternative testuali.</li>
        <li>Possibilità di saltare domande e di usare l'app senza annunci.</li>
      </ul>
      <h2>Limiti noti</h2>
      <p>
        Il questionario è lungo: offriamo salvataggio locale e uscita anticipata
        dopo venti risposte. I siti di terzi aperti dai link (JustWatch,
        piattaforme) hanno la loro accessibilità, fuori dal nostro controllo.
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
