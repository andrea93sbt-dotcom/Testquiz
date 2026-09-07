import type { Flags, Question, Weights } from "./types";

type Opt = [string, Weights, Flags?];

function q(
  id: number,
  ch: number,
  prompt: string,
  raw: Opt[],
  extra?: { hint?: string; type?: "single" | "multi" },
): Question {
  return {
    id,
    ch,
    q: prompt,
    hint: extra?.hint,
    type: extra?.type ?? "single",
    opts: raw.map(([label, w, f], i) => ({
      id: `${id}-${i}`,
      label,
      w,
      f,
    })),
  };
}

export const QUESTIONS: Question[] = [
  q(1, 1, "Quanto tempo hai stasera?", [
    ["Un film corto", { breve: 9 }, { maxMinutes: 100 }],
    ["Circa due ore", { breve: 2, lungo: 1 }, { maxMinutes: 140 }],
    ["Una serata intera", { lungo: 7 }],
    ["Il tempo che serve", { lungo: 4, complesso: 2 }],
  ]),
  q(2, 1, "Con chi lo guardi?", [
    ["Da solo", { intimo: 4, complesso: 2 }, { company: "solo" }],
    ["In coppia", { amore: 4, romance: 2 }, { company: "coppia" }],
    ["Con gli amici", { commedia: 3, leggero: 2, spettacolo: 2 }, { company: "amici" }],
    ["In famiglia", { famiglia: 6, animazione: 3, semplice: 3, leggero: 3 }, { company: "famiglia", kidsOk: true }],
  ]),
  q(3, 1, "Come ti senti?", [
    ["Stanco", { semplice: 7, lento: 3, leggero: 3 }],
    ["Tranquillo", { semplice: 2, intimo: 2 }],
    ["Attento", { complesso: 6, teso: 2 }],
    ["Carico", { veloce: 6, spettacolo: 4 }],
  ]),
  q(4, 1, "Che tono vuoi?", [
    ["Un film leggero", { leggero: 8, sollevante: 5, commedia: 3 }],
    ["Qualcosa di serio", { dramma: 6, intimo: 3 }],
    ["Un film teso", { thriller: 5, teso: 7, azione: 2 }],
    ["Un film cupo", { oscuro: 8, teso: 3 }],
  ]),
  q(5, 1, "Che finale vuoi?", [
    ["Un finale felice", { speranza: 8, sollevante: 5, leggero: 2 }],
    ["Un finale amaro", { malinconico: 5, dramma: 3 }],
    ["Un finale aperto", { complesso: 6, mistero: 3 }],
    ["Mi è indifferente", {}],
  ]),

  q(6, 2, "Vuoi una commedia?", [
    ["Risate", { commedia: 8, leggero: 5 }],
    ["Commedia romantica", { commedia: 5, romance: 5, amore: 4, leggero: 3 }],
    ["Commedia nera", { commedia: 4, ironico: 6, oscuro: 3 }],
    ["Niente commedia", {}, { avoid: ["commedia"] }],
  ]),
  q(7, 2, "Vuoi un film d'azione?", [
    ["Azione", { azione: 8, veloce: 5, spettacolo: 5 }],
    ["Avventura", { avventura: 7, spettacolo: 3, azione: 3 }],
    ["Un po' di azione", { azione: 3, avventura: 2 }],
    ["Niente azione", { intimo: 3 }, { avoid: ["azione"] }],
  ]),
  q(8, 2, "Vuoi un dramma?", [
    ["Un dramma", { dramma: 8, intimo: 3 }],
    ["Un dramma intimo", { dramma: 6, intimo: 6, lento: 2 }],
    ["Solo un po'", { dramma: 2, leggero: 2 }],
    ["Niente dramma", {}, { avoid: ["dramma"] }],
  ]),
  q(9, 2, "Vuoi un thriller?", [
    ["Suspense", { thriller: 8, teso: 6 }],
    ["Un mistero", { mistero: 8, thriller: 4, teso: 3 }],
    ["Un giallo", { mistero: 5, crime: 4, thriller: 3 }],
    ["Niente ansia", {}, { avoid: ["thriller", "teso"] }],
  ]),
  q(10, 2, "Vuoi un horror?", [
    ["Paura", { horror: 8, teso: 6, oscuro: 5 }],
    ["Horror di atmosfera", { horror: 5, lento: 3, oscuro: 4 }],
    ["Poco", { horror: 2, teso: 2 }],
    ["Niente horror", {}, { avoid: ["horror"] }],
  ]),

  q(11, 3, "Vuoi una storia d'amore?", [
    ["Romanticismo", { romance: 8, amore: 7, intimo: 3 }],
    ["Una storia di coppia", { amore: 6, dramma: 3, intimo: 4 }],
    ["Come sfondo", { amore: 2 }],
    ["Niente romance", {}, { avoid: ["romance", "amore"] }],
  ]),
  q(12, 3, "Vuoi fantascienza?", [
    ["Altri mondi", { scifi: 8, spettacolo: 4, avventura: 3 }],
    ["Un futuro vicino", { scifi: 6, distopia: 4, identita: 3 }],
    ["Lo spazio", { scifi: 6, avventura: 5, spettacolo: 4 }],
    ["Niente fantascienza", {}, { avoid: ["scifi"] }],
  ]),
  q(13, 3, "Vuoi un film di crime?", [
    ["Gangster", { crime: 8, noir: 3, oscuro: 3 }],
    ["Poliziesco", { crime: 6, thriller: 5, teso: 3 }],
    ["Spionaggio", { spionaggio: 8, thriller: 4, teso: 3 }],
    ["Niente crime", {}, { avoid: ["crime"] }],
  ]),
  q(14, 3, "Vuoi un film d'animazione?", [
    ["Animazione", { animazione: 8, famiglia: 3, sollevante: 2 }],
    ["Animazione per adulti", { animazione: 6, dramma: 3, stilizzato: 3 }],
    ["Per rilassarmi", { animazione: 4, leggero: 4, famiglia: 2 }],
    ["Attori in carne e ossa", {}, { avoid: ["animazione"] }],
  ]),
  q(15, 3, "Vuoi una storia vera?", [
    ["Una biografia", { biografico: 8, vero: 6 }],
    ["Un documentario", { documentario: 8, vero: 7 }],
    ["Ispirato a fatti veri", { vero: 6, dramma: 3, biografico: 3 }],
    ["Una storia inventata", {}, { avoid: ["biografico", "documentario"] }],
  ]),

  q(16, 4, "Vuoi un fantasy?", [
    ["Magia e fiabe", { fantasy: 8, spettacolo: 3, avventura: 3 }],
    ["Un fantasy oscuro", { fantasy: 6, oscuro: 5, stilizzato: 3 }],
    ["Supereroi", { supereroi: 9, azione: 5, spettacolo: 5 }],
    ["Niente fantasy", {}, { avoid: ["fantasy"] }],
  ]),
  q(17, 4, "Vuoi un film di guerra?", [
    ["Un film di guerra", { guerra: 8, oscuro: 3, dramma: 3 }],
    ["La Seconda guerra mondiale", { guerra: 7, storico: 5, vero: 3 }],
    ["Un film storico", { storico: 8, dramma: 4, vero: 4 }],
    ["Niente guerra", {}, { avoid: ["guerra"] }],
  ]),
  q(18, 4, "Vuoi un western?", [
    ["Un western", { western: 9, avventura: 3 }],
    ["Un western italiano", { western: 6, italiano: 5 }],
    ["Poco", { western: 2 }],
    ["Niente western", {}, { avoid: ["western"] }],
  ]),
  q(19, 4, "Vuoi un film sulla musica?", [
    ["Un musical", { musical: 9, sollevante: 3, spettacolo: 3 }],
    ["Un film sulla musica", { musica: 8, dramma: 2 }],
    ["Una colonna sonora forte", { musica: 5, stilizzato: 3 }],
    ["Musica in sottofondo", {}],
  ]),
  q(20, 4, "Vuoi un film di mistero?", [
    ["Un enigma", { mistero: 8, thriller: 3 }],
    ["Un noir", { noir: 8, crime: 4, oscuro: 4 }],
    ["Un colpo di scena", { mistero: 6, thriller: 4 }],
    ["Niente mistero", {}, { avoid: ["mistero"] }],
  ]),

  q(21, 5, "Che ritmo vuoi?", [
    ["Un film lento", { lento: 8, immagini: 4, intimo: 2 }],
    ["Un ritmo normale", { lento: 2, dialoghi: 3, dramma: 2 }],
    ["Un film veloce", { veloce: 8, spettacolo: 3 }],
    ["Parte piano e accelera", { veloce: 4, teso: 3, thriller: 2 }],
  ]),
  q(22, 5, "Che durata preferisci?", [
    ["Un film corto", { breve: 8 }, { maxMinutes: 100 }],
    ["Durata media", { breve: 2 }, { maxMinutes: 140 }],
    ["Un film lungo", { lungo: 7, complesso: 2 }],
    ["Molto lungo", { lungo: 8, spettacolo: 3 }, { minMinutes: 150 }],
  ]),
  q(23, 5, "Vuoi una storia intima?", [
    ["Una storia intima", { intimo: 8, dialoghi: 3, dramma: 2 }],
    ["Volti e dialoghi", { dialoghi: 7, intimo: 4 }],
    ["Grande spettacolo", { spettacolo: 8, azione: 3, hollywood: 3 }],
    ["Un equilibrio", { intimo: 3, spettacolo: 3 }],
  ]),
  q(24, 5, "Quanto può essere difficile?", [
    ["Facile da seguire", { semplice: 8, hollywood: 2 }],
    ["Qualche salto", { complesso: 3, semplice: 2 }],
    ["Un film impegnativo", { complesso: 8, stilizzato: 3 }],
    ["Da rivedere", { complesso: 6, immagini: 3, strano: 2 }],
  ]),
  q(25, 5, "Che immagini vuoi?", [
    ["Colori saturi", { stilizzato: 5, spettacolo: 3 }],
    ["Luce naturale", { vero: 4, intimo: 2, immagini: 2 }],
    ["Toni scuri", { oscuro: 5, stilizzato: 3 }],
    ["Bianco e nero", { classico: 5, stilizzato: 4, immagini: 3 }],
  ]),

  q(26, 6, "Ti interessa la famiglia?", [
    ["La famiglia", { famiglia: 8, dramma: 3, intimo: 2 }],
    ["Una famiglia difficile", { famiglia: 7, dramma: 5, intimo: 3 }],
    ["Crescere", { formazione: 8, identita: 5, famiglia: 3 }],
    ["Non il tema", {}, { avoid: ["famiglia"] }],
  ]),
  q(27, 6, "Ti interessa l'amicizia?", [
    ["L'amicizia", { amicizia: 8, dramma: 2 }],
    ["Due amici", { amicizia: 7, intimo: 3 }],
    ["Una banda", { amicizia: 5, commedia: 3, crime: 2 }],
    ["Non il tema", {}],
  ]),
  q(28, 6, "Ti interessa il potere?", [
    ["Chi comanda", { potere: 8, cinico: 3, vero: 2 }],
    ["Soldi e classi", { potere: 6, vero: 5, dramma: 3 }],
    ["Una satira", { potere: 5, ironico: 6, commedia: 3 }],
    ["Voglio staccare", { avventura: 3, leggero: 2 }, { avoid: ["potere"] }],
  ]),
  q(29, 6, "Ti interessa l'identità?", [
    ["Chi siamo", { identita: 8, intimo: 3, complesso: 2 }],
    ["Maschere", { identita: 6, strano: 3 }],
    ["Storie LGBT", { lgbt: 8, identita: 5, intimo: 2 }],
    ["Non il tema", {}],
  ]),
  q(30, 6, "Ti interessa la giustizia?", [
    ["Un processo", { giudiziario: 8, dramma: 3, mistero: 2 }],
    ["Colpa e pena", { giudiziario: 6, dramma: 4, potere: 3 }],
    ["Vendetta", { vendetta: 8, teso: 4, crime: 3 }],
    ["Non il tema", {}],
  ]),

  q(31, 7, "Vuoi commuoverti?", [
    ["Voglio piangere", { dramma: 6, malinconico: 6, intimo: 3 }],
    ["Un po' di malinconia", { malinconico: 5, lento: 2 }],
    ["Un film che rialza", { speranza: 8, sollevante: 6, leggero: 3 }],
    ["Niente lacrime", { cinico: 3, ironico: 2 }],
  ]),
  q(32, 7, "C'è posto per l'ironia?", [
    ["Tanta ironia", { ironico: 8, commedia: 3 }],
    ["Un po' di ironia", { ironico: 4 }],
    ["Serietà", { dramma: 4 }],
    ["Umorismo nero", { ironico: 7, cinico: 5, oscuro: 3, commedia: 2 }],
  ]),
  q(33, 7, "Vuoi un film strano?", [
    ["Assurdo", { strano: 8, stilizzato: 4 }],
    ["Un pizzico", { strano: 3 }],
    ["Realistico", { vero: 6, intimo: 2 }, { avoid: ["strano"] }],
    ["Sogno e allucinazione", { strano: 7, complesso: 4, stilizzato: 3 }],
  ]),
  q(34, 7, "Che tipo di mondo vuoi?", [
    ["Un film di Natale", { natalizio: 9, famiglia: 4, leggero: 4, sollevante: 3 }],
    ["Una distopia", { distopia: 8, scifi: 4, oscuro: 4 }],
    ["Un viaggio", { avventura: 6, identita: 3 }],
    ["La vita di tutti i giorni", { vero: 5, intimo: 4, dramma: 2 }],
  ]),
  q(35, 7, "Lavoro, scuola o sport?", [
    ["Il lavoro", { vero: 5, dramma: 3, identita: 2 }],
    ["La scuola", { formazione: 6, identita: 4, famiglia: 2 }],
    ["Lo sport", { sport: 9, speranza: 3, dramma: 2 }],
    ["Voglio evadere", { avventura: 4, spettacolo: 3, fantasy: 2 }],
  ]),

  q(36, 8, "Dove è ambientato?", [
    ["In città", { crime: 2, thriller: 2, moderno: 2 }],
    ["In natura", { avventura: 5, immagini: 4, lento: 2 }],
    ["In casa", { intimo: 7, dramma: 3, dialoghi: 3, famiglia: 2 }],
    ["In viaggio", { avventura: 6, identita: 3 }],
  ]),
  q(37, 8, "In che paese?", [
    ["Italia", { italiano: 8 }],
    ["Hollywood", { hollywood: 8, spettacolo: 3 }],
    ["Europa", { europa: 8, complesso: 2, intimo: 2 }],
    ["Asia", { asia: 8, complesso: 2, stilizzato: 2 }],
  ]),
  q(38, 8, "In che anni?", [
    ["Un classico", { classico: 8 }, { maxYear: 1975 }],
    ["Anni Settanta e Ottanta", { classico: 3, hollywood: 2 }, { minYear: 1970, maxYear: 1989 }],
    ["Anni Novanta e Duemila", { moderno: 4, hollywood: 2 }, { minYear: 1990, maxYear: 2010 }],
    ["Un film di adesso", { moderno: 8 }, { minYear: 2015 }],
  ]),
  q(39, 8, "Vuoi il passato storico?", [
    ["Un'epoca lontana", { storico: 7, spettacolo: 3, classico: 2 }],
    ["Il Novecento", { storico: 6, vero: 4, guerra: 2 }],
    ["Il presente", { moderno: 6 }, { minYear: 1995 }],
    ["Mi è indifferente", {}],
  ]),
  q(40, 8, "Che tipo di cinema?", [
    ["Un film da festival", { complesso: 6, europa: 3, stilizzato: 3 }],
    ["Un film noto", { hollywood: 3, semplice: 2 }],
    ["Popcorn", { spettacolo: 6, semplice: 4, hollywood: 4, leggero: 3 }],
    ["Cinema d'autore", { stilizzato: 6, immagini: 5, complesso: 3 }],
  ]),

  q(41, 9, "Come vuoi sentire le voci?", [
    ["Sottotitoli", { europa: 2, asia: 2 }],
    ["Doppiaggio", { hollywood: 3, semplice: 2 }, { dubbed: true }],
    ["Film italiani", { italiano: 8 }],
    ["Mi è indifferente", {}],
  ]),
  q(42, 9, "Quanto può essere intenso?", [
    ["Poco intenso", { leggero: 5 }, { avoid: ["horror", "teso"] }],
    ["Tensione normale", { teso: 3 }],
    ["Molto teso", { teso: 7, thriller: 4, azione: 3 }],
    ["Violenza esplicita", { oscuro: 5, crime: 3, teso: 3 }],
  ]),
  q(43, 9, "Paure improvise?", [
    ["Jump scare", { horror: 6, teso: 5 }],
    ["Solo atmosfera", { horror: 3, lento: 2, oscuro: 3 }],
    ["Niente paura", {}, { avoid: ["horror"] }],
    ["Mi è indifferente", {}],
  ]),
  q(44, 9, "Che tipo di trama vuoi?", [
    ["Lineare", { semplice: 6 }],
    ["Un colpo di scena", { mistero: 6, thriller: 4, teso: 2 }],
    ["Un puzzle", { complesso: 7, mistero: 3, stilizzato: 2 }],
    ["Un finale aperto", { complesso: 5, mistero: 3 }],
  ]),
  q(45, 9, "Cosa vuoi dopo il film?", [
    ["Parlarne", { complesso: 4, mistero: 2, dialoghi: 2 }],
    ["Dormire", { semplice: 4, leggero: 3 }],
    ["Restare da solo", { intimo: 5, malinconico: 2 }],
    ["Rivederlo", { complesso: 5, stilizzato: 2 }],
  ]),

  q(46, 10, "Quante persone al centro?", [
    ["Un protagonista", { intimo: 5, identita: 3 }],
    ["Una coppia", { amore: 4, intimo: 4, dialoghi: 3 }],
    ["Un gruppo", { famiglia: 3, amicizia: 4, crime: 2 }],
    ["Tante voci", { complesso: 3, dramma: 2 }],
  ]),
  q(47, 10, "Che età hanno i personaggi?", [
    ["Giovani", { formazione: 5, identita: 4, speranza: 2, moderno: 2 }],
    ["Adulti", { dramma: 4, identita: 3, vero: 2 }],
    ["Più in là con gli anni", { malinconico: 4, classico: 2, intimo: 3 }],
    ["Più generazioni", { famiglia: 5, dramma: 2 }],
  ]),
  q(48, 10, "Che tipo di personaggi vuoi?", [
    ["Qualcuno da tifare", { speranza: 4, avventura: 2, sollevante: 2 }],
    ["Un cattivo carismatico", { cinico: 4, crime: 3, potere: 3 }],
    ["Persone con i dubbi", { complesso: 4, cinico: 3, oscuro: 2 }],
    ["Senza un cattivo", { intimo: 4, dramma: 2 }],
  ]),
  q(49, 10, "Vuoi un sequel?", [
    ["Un capitolo", { hollywood: 5, spettacolo: 4, azione: 3 }],
    ["Una storia a sé", { intimo: 2, europa: 2 }],
    ["Niente rifacimenti", {}, { avoid: ["hollywood"] }],
    ["Mi è indifferente", {}],
  ]),
  q(50, 10, "Cosa conta di più stasera?", [
    ["L'umore", { intimo: 4, leggero: 2 }],
    ["Il genere", { semplice: 2 }],
    ["Una scoperta", { strano: 3, europa: 2, asia: 2, complesso: 2 }],
    ["La compagnia", { famiglia: 3, semplice: 3, leggero: 2 }],
  ]),
];

export const SHORT_QUESTION_IDS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 21, 22, 23, 26, 31, 37, 38, 42,
] as const;

export function questionsFor(mode: "quiz" | "short"): Question[] {
  if (mode !== "short") return QUESTIONS;
  const byId = new Map(QUESTIONS.map((item) => [item.id, item]));
  return SHORT_QUESTION_IDS.map((id) => byId.get(id)).filter((item): item is Question => Boolean(item));
}

if (QUESTIONS.length !== 50) {
  throw new Error(`Expected 50 questions, got ${QUESTIONS.length}`);
}
if (questionsFor("short").length !== 20) {
  throw new Error(`Expected 20 short questions, got ${questionsFor("short").length}`);
}
if (QUESTIONS.some((item) => item.opts.length !== 4)) {
  throw new Error("Every question needs four answers for the plaza");
}
