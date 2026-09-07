import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL, controllerLabel } from "@/lib/legal";

export const Route = createFileRoute("/termini")({
  component: TermsPage,
  head: () => ({ meta: [{ title: "Termini · Platea" }] }),
});

function TermsPage() {
  return (
    <LegalPage title="Termini di utilizzo">
      <p>
        Usando Platea accetti questi termini. Se non li accetti, non usare
        l'app. Servizio rivolto a chi ha almeno {LEGAL.ageMin} anni.
      </p>

      <h2>1. Cos'è Platea</h2>
      <p>
        Uno strumento gratuito di suggerimento cinematografico. Non è un
        catalogo ufficiale di Netflix, Prime Video o altre piattaforme. I link
        di ricerca aprono siti di terzi. La disponibilità dei titoli cambia
        senza preavviso.
      </p>

      <h2>2. Editore</h2>
      <p>Il servizio è pubblicato da {controllerLabel()}.</p>

      <h2>3. Proprietà intellettuale</h2>
      <p>
        Marchi, titoli e opere citati appartengono ai rispettivi titolari.
        Platea non rivendica diritti sui film. È lecito citarli per indicarli
        come possibile visione. Non offriamo copie né streaming. Il catalogo
        di 5000 titoli è una selezione dei lungometraggi più votati su IMDb
        (titolo, anno, durata, genere, voto). Locandine e trame, se ci sono,
        arrivano da Wikipedia (CC BY-SA). I link “dove vederlo” aprono
        JustWatch: non è un catalogo ufficiale delle piattaforme.
      </p>

      <h2>4. Pubblicità</h2>
      <p>
        Eventuali annunci sono di terzi, etichettati come tali (Regolamento
        UE 2022/2065, DSA). Non sono una raccomandazione editoriale.
      </p>

      <h2>5. Nessuna garanzia</h2>
      <p>
        I suggerimenti sono statistici e culturali, non un consiglio
        professionale. Nei limiti di legge non rispondiamo di inesattezze del
        catalogo, di interruzioni o di contenuti aperti tramite link esterni
        (JustWatch, Google, piattaforme).
      </p>

      <h2>6. Pratiche commerciali</h2>
      <p>
        Nessun acquisto in-app. Nessun abbonamento a Platea. Non usiamo
        preselezioni occulte sul consenso. I prezzi di terzi, se compaiono in
        un annuncio, sono responsabilità dell'inserzionista.
      </p>

      <h2>7. Legge e foro</h2>
      <p>
        Si applica il diritto {LEGAL.jurisdiction === "Italia" ? "italiano" : LEGAL.jurisdiction} e,
        per i consumatori UE, le norme inderogabili del Paese di residenza
        (Reg. 1215/2012, direttiva 2011/83/UE).
      </p>

      <p>
        <Link to="/privacy">Privacy</Link> · <Link to="/cookie">Cookie</Link>
      </p>
    </LegalPage>
  );
}
