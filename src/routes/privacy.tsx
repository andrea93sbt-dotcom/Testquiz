import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { LegalPage } from "@/components/legal/legal-page";
import { LEGAL, controllerLabel } from "@/lib/legal";
import { wipeLocalData } from "@/lib/legal-store";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({ meta: [{ title: "Privacy · Platea" }] }),
});

function PrivacyPage() {
  const who = controllerLabel();
  return (
    <LegalPage title="Privacy">
      <p>
        Qui spieghiamo che dati usa Platea, come previsto dagli articoli 13 e
        14 del GDPR e del d.lgs. 196/2003. Platea è un quiz sui film che gira
        nel tuo browser.
      </p>

      <h2>1. Chi è il titolare</h2>
      <p>
        Il titolare è {who}.
        {LEGAL.controllerEmail ? (
          <>
            {" "}
            Recapito:{" "}
            <a href={`mailto:${LEGAL.controllerEmail}`}>{LEGAL.controllerEmail}</a>.
          </>
        ) : (
          <>
            {" "}
            L'editore deve indicare nome, recapito e, se tenuta, la partita
            IVA in questa pagina prima di una pubblicazione commerciale.
          </>
        )}
      </p>

      <h2>2. Che dati restano, e dove</h2>
      <p>
        Non c'è un account. Non mandiamo le tue risposte a un nostro server.
        Restano solo su questo telefono o computer:
      </p>
      <ul>
        <li>le risposte al quiz e le piattaforme che hai segnato;</li>
        <li>la scelta sugli annunci e la conferma dell'età;</li>
        <li>
          se accetti gli annunci, Google può trattare identificatori, IP
          approssimato e dati di navigazione, secondo la sua informativa.
        </li>
        <li>
          nei risultati il browser può chiedere a Wikipedia locandina e trama
          (titolo e anno, non le tue risposte).
        </li>
      </ul>
      <p>
        Non trattiamo dati sulla salute o sull'orientamento. Non profiliamo i
        tuoi gusti fuori da questo dispositivo.
      </p>

      <h2>3. Perché li usiamo</h2>
      <ul>
        <li>
          Per farti il quiz e i consigli (art. 6.1.b GDPR: è il servizio che
          hai chiesto).
        </li>
        <li>
          Per ricordare la tua scelta sugli annunci (art. 6.1.c / 6.1.f GDPR e
          art. 122 del Codice Privacy).
        </li>
        <li>
          Per la pubblicità di terzi, solo se dici di sì (art. 6.1.a GDPR e
          direttiva ePrivacy). Puoi ritirare il consenso in qualsiasi momento,
          con la stessa facilità con cui l'hai dato.
        </li>
      </ul>

      <h2>4. Dati fuori dall'Europa</h2>
      <p>
        Il quiz in sé non manda dati all'estero. Se accetti gli annunci,
        Google LLC (Stati Uniti) può trattare dati. Google aderisce al Data
        Privacy Framework UE-USA e usa clausole contrattuali tipo. Senza
        consenso, lo script di AdSense non viene caricato.
      </p>

      <h2>5. Per quanto tempo</h2>
      <p>
        I dati sul dispositivo restano finché non li cancelli, non pulisci il
        browser o non usi il pulsante sotto. Google conserva i propri dati
        secondo i suoi termini.
      </p>

      <h2>6. I tuoi diritti</h2>
      <p>
        Puoi chiedere accesso, correzione, cancellazione, limitazione,
        opposizione, portabilità, revoca del consenso, e fare reclamo
        all'autorità. Per i dati che stanno solo sul dispositivo, la
        cancellazione è immediata:
      </p>
      <p>
        <Button variant="secondary" className="min-h-11" onClick={wipeLocalData}>
          Cancella i dati su questo dispositivo
        </Button>
      </p>
      <p>
        Reclamo: {LEGAL.supervisory}. Puoi anche rivolgerti all'autorità
        del tuo Paese UE.
      </p>

      <h2>7. Minori</h2>
      <p>
        Il servizio è per chi ha almeno {LEGAL.ageMin} anni (pubblicità
        inclusa). Non è per chi ha meno di 16 anni.
      </p>

      <h2>8. Cookie</h2>
      <p>
        Il dettaglio è nella <Link to="/cookie">pagina sui cookie</Link>.
      </p>
    </LegalPage>
  );
}
