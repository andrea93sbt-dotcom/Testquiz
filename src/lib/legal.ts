/** Dati del titolare: completali prima di una pubblicazione con dominio e AdSense. */
export const LEGAL = {
  appName: "Platea",
  ageMin: 16,
  controllerName: "",
  controllerEmail: "",
  jurisdiction: "Italia",
  lastUpdated: "7 settembre 2026",
  supervisory:
    "Garante per la protezione dei dati personali — Piazza Venezia 11, 00187 Roma — https://www.garanteprivacy.it",
} as const;

export function controllerLabel() {
  return LEGAL.controllerName.trim() || "l'editore che pubblica questa copia di Platea";
}
