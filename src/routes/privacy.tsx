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
    <LegalPage title="Informativa sulla privacy">
      <p>
        Questa informativa è resa ai sensi degli artt. 13 e 14 del Regolamento
        (UE) 2016/679 (GDPR) e del d.lgs. 196/2003. Platea è un questionario di
        gusto cinematografico che gira nel tuo browser.
      </p>

      <h2>1. Titolare del trattamento</h2>
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

      <h2>2. Dati trattati e dove stanno</h2>
      <p>
        Non c'è un account. Non inviamo le tue risposte a un nostro server.
        Restano in <code className="font-mono text-fg">localStorage</code> su
        questo dispositivo:
      </p>
      <ul>
        <li>risposte al questionario e piattaforme che hai segnato;</li>
        <li>scelta sul consenso cookie/annunci e conferma dell'età;</li>
        <li>
          se accetti gli annunci, Google può trattare identificatori, IP
          approssimato e dati di navigazione secondo la sua informativa.
        </li>
      </ul>
      <p>
        Non trattiamo categorie particolari di dati. Non profiliamo i gusti
        cinematografici fuori da questo dispositivo.
      </p>

      <h2>3. Finalità e basi giuridiche</h2>
      <ul>
        <li>
          Erogare il questionario e i suggerimenti (art. 6.1.b GDPR — servizio
          richiesto).
        </li>
        <li>
          Memorizzare la tua scelta di consenso (art. 6.1.c / 6.1.f e art. 122
          Codice Privacy).
        </li>
        <li>
          Pubblicità di terze parti, solo con consenso libero e specifico (art.
          6.1.a GDPR e direttiva ePrivacy). Il consenso è ritirabile in ogni
          momento, con la stessa facilità con cui è stato dato.
        </li>
      </ul>

      <h2>4. Trasferimenti extra-SEE</h2>
      <p>
        Il servizio di base non trasferisce dati. Se accetti gli annunci,
        Google LLC (Stati Uniti) può trattare dati. Google aderisce al Data
        Privacy Framework UE-USA e usa clausole contrattuali tipo. Senza
        consenso, lo script di AdSense non viene caricato.
      </p>

      <h2>5. Conservazione</h2>
      <p>
        I dati locali restano finché non li cancelli, non pulisci il browser o
        non usi il pulsante sotto. Google conserva i propri dati secondo i suoi
        termini.
      </p>

      <h2>6. I tuoi diritti</h2>
      <p>
        Accesso, rettifica, cancellazione, limitazione, opposizione,
        portabilità, revoca del consenso, reclamo all'autorità. Per i dati
        che stanno solo sul dispositivo, la cancellazione è immediata:
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
        Il servizio è pensato per chi ha almeno {LEGAL.ageMin} anni (pubblicità
        inclusa). Non è destinato a chi ha meno di 16 anni.
      </p>

      <h2>8. Cookie</h2>
      <p>
        Dettaglio in <Link to="/cookie">Informativa cookie</Link>.
      </p>
    </LegalPage>
  );
}
