import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/legal/legal-page";
import { useAds } from "@/lib/ads-store";

export const Route = createFileRoute("/cookie")({
  component: CookiePage,
  head: () => ({ meta: [{ title: "Cookie · Platea" }] }),
});

function CookiePage() {
  const consent = useAds((s) => s.consent);
  const resetConsent = useAds((s) => s.resetConsent);
  const decidedAt = useAds((s) => s.decidedAt);
  const status =
    consent === "all"
      ? "hai accettato gli annunci"
      : consent === "none"
        ? "hai rifiutato gli annunci"
        : "non hai ancora scelto";

  return (
    <LegalPage title="Informativa sui cookie">
      <p>
        Informativa resa ai sensi dell'art. 122 del d.lgs. 196/2003 e del
        provvedimento del Garante sull'uso dei cookie, in attuazione della
        direttiva ePrivacy. Questa pagina è il registro delle tecnologie di
        tracciamento.
      </p>
      <p>
        Stato attuale: {status}
        {decidedAt ? ` (scelta del ${new Date(decidedAt).toLocaleString("it-IT")})` : ""}.
      </p>
      <p>
        <button type="button" className="text-fg underline underline-offset-2" onClick={resetConsent}>
          Cambia la scelta
        </button>
      </p>

      <h2>Cookie e archivi strettamente necessari</h2>
      <p>Non richiedono consenso. Servono a far funzionare Platea.</p>
      <ul>
        <li>
          <span className="text-fg">platea-quiz</span> — risposte e piattaforme,
          solo su questo browser, durata finché non cancelli.
        </li>
        <li>
          <span className="text-fg">platea-ads</span> — prova della tua scelta
          di consenso (obbligo di accountability GDPR).
        </li>
        <li>
          <span className="text-fg">platea-legal</span> — conferma di età
          minima.
        </li>
      </ul>

      <h2>Pubblicità (facoltativa)</h2>
      <p>
        Solo dopo un sì distinto. Rifiutare ha la stessa evidenza visiva
        dell'accettare. Si carica allora lo script di Google AdSense, che
        può impostare cookie e identificatori propri (anche di profilazione).
        Elenco aggiornato presso Google:{" "}
        <a href="https://policies.google.com/privacy" rel="noreferrer" target="_blank">
          Privacy Policy Google
        </a>
        .
      </p>
      <p>
        Gli spazi sono etichettati «Pubblicità» (trasparenza DSA). Non sono
        inserzioni di Platea: sono di terzi. Il catalogo film non è
        personalizzato da Google.
      </p>

      <h2>Cosa non usiamo</h2>
      <ul>
        <li>Nessuna analitica propria (niente Google Analytics, Meta Pixel, ecc.).</li>
        <li>Nessun cookie di social plugin.</li>
        <li>I font sono ospitati con l'app: nessuna richiesta a Google Fonts.</li>
      </ul>

      <h2>Segnali globali</h2>
      <p>
        Se il browser invia Global Privacy Control, gli annunci restano
        disattivati.
      </p>

      <h2>Altre informative</h2>
      <p>
        <Link to="/privacy">Privacy</Link> · <Link to="/termini">Termini</Link>
      </p>
    </LegalPage>
  );
}
