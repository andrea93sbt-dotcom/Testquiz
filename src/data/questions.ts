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
    ["Meno di un'ora e mezza", { breve: 9 }, { maxMinutes: 100 }],
    ["Circa due ore", { breve: 2, lungo: 1 }, { maxMinutes: 140 }],
    ["Posso stare fino a tardi", { lungo: 7 }],
    ["Il tempo non è un problema", { lungo: 4, complesso: 2 }],
  ]),
  q(2, 1, "Con chi lo guardi?", [
    ["Da solo o da sola", { intimo: 4, complesso: 2 }, { company: "solo" }],
    ["In coppia", { amore: 4, romance: 2 }, { company: "coppia" }],
    ["Con gli amici", { commedia: 3, leggero: 2, spettacolo: 2 }, { company: "amici" }],
    ["In famiglia, magari con i bambini", { famiglia: 6, animazione: 3, semplice: 3, leggero: 3 }, { company: "famiglia", kidsOk: true }],
  ]),
  q(3, 1, "Come ti senti?", [
    ["Stanco: voglio un film facile", { semplice: 7, lento: 3, leggero: 3 }],
    ["Normale, aperto a tutto", { semplice: 2, complesso: 2 }],
    ["Carico: voglio stare attento", { complesso: 6, teso: 2 }],
    ["Agitato: qualcosa che mi tiene sveglio", { veloce: 6, spettacolo: 4, strano: 2 }],
  ]),
  q(4, 1, "Cosa vuoi dal film?", [
    ["Una risata", { commedia: 8, leggero: 6, sollevante: 3 }],
    ["Qualcosa che mi arriva", { dramma: 6, malinconico: 6, intimo: 3 }],
    ["Tensione, da non staccare gli occhi", { thriller: 6, teso: 7, azione: 3 }],
    ["Qualcosa a cui pensare dopo", { complesso: 6, mistero: 3, identita: 3 }],
  ]),
  q(5, 1, "Un film chiaro o uno cupo?", [
    ["Chiaro, che sta bene", { leggero: 7, sollevante: 5, speranza: 4 }],
    ["Un po' di entrambi", { dramma: 2, ironico: 2 }],
    ["Cupo, ma bello", { oscuro: 6, cinico: 3, lento: 2 }],
    ["Molto cupo", { oscuro: 8, teso: 4, horror: 2 }],
  ]),
  q(6, 1, "Qualcosa che conosci, o qualcosa di nuovo?", [
    ["Un classico che conosco", { classico: 7, semplice: 2 }],
    ["Famoso, ma non l'ho ancora visto", { hollywood: 3, spettacolo: 2 }],
    ["Poco noto, da scoprire", { europa: 3, complesso: 3, italiano: 2 }],
    ["Non mi importa, purché funzioni", {}],
  ]),
  q(7, 1, "Vuoi la lingua originale?", [
    ["Sì, sempre, con i sottotitoli", { europa: 2, asia: 2, complesso: 1 }],
    ["Va bene, se il film lo merita", { europa: 1 }],
    ["Preferisco il doppiaggio", { hollywood: 3, semplice: 2 }, { dubbed: true }],
    ["Solo film italiani", { italiano: 8 }],
  ]),
  q(8, 1, "Vuoi un film prevedibile o uno che ti sorprende?", [
    ["Prevedibile: so già che tipo è", { semplice: 5, classico: 2 }],
    ["Un po' di sorpresa, niente traumi", { mistero: 3, strano: 2 }],
    ["Qualcosa di diverso dal solito", { strano: 6, complesso: 4 }],
    ["Sorprendimi proprio", { strano: 8, stilizzato: 4 }],
  ]),
  q(9, 1, "Quanto può essere intenso?", [
    ["Poco: niente urla, niente sangue", { leggero: 5 }, { avoid: ["horror", "teso"] }],
    ["Nella media: un po' di tensione va bene", { teso: 3 }],
    ["Tanto: voglio sentire la tensione", { teso: 7, thriller: 4, azione: 3 }],
    ["Tanto, se serve alla storia", { teso: 6, oscuro: 4, complesso: 2 }],
  ]),
  q(10, 1, "La fine deve essere felice?", [
    ["Sì, o almeno che non mi lasci giù", { speranza: 7, sollevante: 5, leggero: 2 }],
    ["Amara va bene, se è onesta", { malinconico: 4, dramma: 3 }],
    ["Può fare male", { oscuro: 4, cinico: 4, dramma: 3 }],
    ["Aperta, da discutere", { complesso: 6, mistero: 3 }],
  ]),

  q(11, 2, "Vuoi un film d'azione?", [
    ["Sì, è quello che cerco", { azione: 8, veloce: 5, spettacolo: 5 }],
    ["Un po', se serve", { azione: 3, avventura: 2 }],
    ["Di solito no", { intimo: 3, dialoghi: 2 }],
    ["No, stasera no", {}, { avoid: ["azione"] }],
  ]),
  q(12, 2, "Vuoi ridere?", [
    ["Sì, voglio ridere", { commedia: 8, leggero: 5, ironico: 3 }],
    ["Sì, ma intelligente, non solo cadute e sberle", { commedia: 5, ironico: 5, dialoghi: 3 }],
    ["Solo se è umorismo nero", { commedia: 3, ironico: 6, oscuro: 3, cinico: 3 }],
    ["Non stasera", {}, { avoid: ["commedia"] }],
  ]),
  q(13, 2, "Un dramma?", [
    ["Sì, lo cerco", { dramma: 8, intimo: 4, complesso: 2 }],
    ["Sì, se i personaggi sono credibili", { dramma: 5, vero: 3, intimo: 3 }],
    ["A piccole dosi", { dramma: 2, leggero: 2 }],
    ["Troppo pesante, ora", {}, { avoid: ["dramma"] }],
  ]),
  q(14, 2, "Thriller e suspense?", [
    ["Sì, voglio stare in ansia", { thriller: 8, teso: 6, mistero: 4 }],
    ["Sì, se è psicologico", { thriller: 5, complesso: 4, intimo: 2 }],
    ["Solo se non è scontato", { thriller: 3, strano: 3 }],
    ["No, troppa ansia", {}, { avoid: ["thriller", "teso"] }],
  ]),
  q(15, 2, "Horror?", [
    ["Sì, anche fisico", { horror: 8, teso: 6, oscuro: 5 }],
    ["Sì, ma di atmosfera, non sangue a fiumi", { horror: 5, lento: 3, stilizzato: 3, oscuro: 4 }],
    ["Solo se c'è un'idea dietro", { horror: 3, complesso: 3, identita: 2 }],
    ["Mai, o quasi", {}, { avoid: ["horror"] }],
  ]),
  q(16, 2, "Fantascienza?", [
    ["Sì, grandi idee e altri mondi", { scifi: 8, complesso: 3, spettacolo: 3 }],
    ["Sì, se parla di noi, oggi", { scifi: 5, identita: 4, intimo: 2 }],
    ["Solo avventura nello spazio", { scifi: 4, avventura: 5, spettacolo: 4 }],
    ["Non fa per me", {}, { avoid: ["scifi"] }],
  ]),
  q(17, 2, "Storie d'amore?", [
    ["Sì, voglio innamorarmi un po'", { romance: 8, amore: 7, intimo: 3 }],
    ["Sì, se non è zuccherosa", { romance: 4, amore: 4, dramma: 2, ironico: 2 }],
    ["Come sottofondo, va bene", { amore: 2 }],
    ["No, stasera no", {}, { avoid: ["romance", "amore"] }],
  ]),
  q(18, 2, "Crime, gangster, poliziesco?", [
    ["Sì, il mondo della malavita", { crime: 8, oscuro: 3, cinico: 3 }],
    ["Sì, se è teso e preciso", { crime: 5, thriller: 4, teso: 3 }],
    ["Solo se i personaggi restano in mente", { crime: 3, dramma: 3 }],
    ["Non fa per me", {}, { avoid: ["crime"] }],
  ]),
  q(19, 2, "Inventato, o qualcosa di vero?", [
    ["Inventato, sempre", {}],
    ["Storie vere, o quasi", { biografico: 6, vero: 7, documentario: 2 }],
    ["Un documentario, se è fatto bene", { documentario: 8, vero: 6 }],
    ["Misto: fatti veri, raccontati come un film", { biografico: 4, vero: 4, dramma: 2 }],
  ]),
  q(20, 2, "Animazione anche per adulti?", [
    ["Sì, è cinema come gli altri", { animazione: 8, stilizzato: 4 }],
    ["Sì, se la storia è da adulti", { animazione: 5, dramma: 2 }],
    ["Solo se è per rilassarmi", { animazione: 3, leggero: 3, famiglia: 2 }],
    ["Preferisco attori in carne e ossa", {}, { avoid: ["animazione"] }],
  ]),

  q(21, 3, "Nel film ci deve essere ironia?", [
    ["Sì, sempre", { ironico: 8, commedia: 3 }],
    ["Ogni tanto, al momento giusto", { ironico: 4 }],
    ["No: voglio serietà", { dramma: 3 }],
    ["Sì, feroce, quasi crudele", { ironico: 7, cinico: 6, oscuro: 3 }],
  ]),
  q(22, 3, "Ti va un film malinconico?", [
    ["Sì, è il mio umore", { malinconico: 8, lento: 4, intimo: 3 }],
    ["Un po', come il sale", { malinconico: 4 }],
    ["No, troppo grigio", { sollevante: 4, leggero: 3 }, { avoid: ["malinconico"] }],
    ["Sì, se c'è anche una luce in fondo", { malinconico: 5, speranza: 5 }],
  ]),
  q(23, 3, "Tensione continua, o pause per respirare?", [
    ["Continua: niente tregua", { teso: 8, veloce: 4, thriller: 3 }],
    ["A onde: sale e scende", { teso: 4, dramma: 2 }],
    ["Poche: voglio rilassarmi", { lento: 6, intimo: 3 }],
    ["Quasi zero: pace", { lento: 5, leggero: 4 }, { avoid: ["teso"] }],
  ]),
  q(24, 3, "Vuoi un film ottimista o uno disilluso?", [
    ["Voglio uscire meglio di come sono entrato", { speranza: 8, sollevante: 6 }],
    ["Realista, senza fare i cinici", { vero: 4, dramma: 2 }],
    ["Il mondo è storto, e va mostrato", { cinico: 7, oscuro: 4 }],
    ["Dipende dalla storia, non dal messaggio", { complesso: 3 }],
  ]),
  q(25, 3, "Ti piacciono i film strani, assurdi?", [
    ["Sì, fatemi uscire dalla realtà", { strano: 8, stilizzato: 4 }],
    ["Un pizzico, non tutto il film", { strano: 3 }],
    ["No: voglio credere a quello che vedo", { vero: 5, intimo: 2 }, { avoid: ["strano"] }],
    ["Sì, se la stranezza ha un senso", { strano: 6, complesso: 4 }],
  ]),
  q(26, 3, "Quanto può essere sentimentale?", [
    ["Tanto: voglio sentire", { amore: 5, famiglia: 3, sollevante: 4, romance: 3 }],
    ["Quanto basta, senza sciroppo", { intimo: 3, dramma: 2 }],
    ["Zero: niente archi di violini", { cinico: 4, ironico: 3 }],
    ["Solo se me lo sono meritato, scena dopo scena", { dramma: 4, intimo: 3 }],
  ]),
  q(27, 3, "Umorismo nero?", [
    ["Il mio preferito", { ironico: 7, cinico: 5, oscuro: 3, commedia: 3 }],
    ["A tratti", { ironico: 3 }],
    ["No, lo trovo facile o crudele", { leggero: 2 }],
    ["Sì, se non ride del dolore altrui", { ironico: 4, dramma: 2 }],
  ]),
  q(28, 3, "Un film che ti tiene compagnia, o uno che ti mette a disagio?", [
    ["Compagnia: come un ospite bravo", { leggero: 4, dialoghi: 3, commedia: 2 }],
    ["Un po' e un po'", {}],
    ["Uno che mi cambia, un po'", { complesso: 5, identita: 4, intimo: 3 }],
    ["Uno che mi mette a disagio, di proposito", { oscuro: 5, strano: 4, teso: 3 }],
  ]),
  q(29, 3, "Ti va di commuoverti?", [
    ["Sì, se arrivano da sole", { dramma: 5, malinconico: 4, intimo: 3 }],
    ["Va bene, ma senza ricatto", { dramma: 3 }],
    ["No: resto a distanza", { cinico: 3, ironico: 2 }],
    ["Le cerco, stasera", { dramma: 6, malinconico: 5, famiglia: 2 }],
  ]),
  q(30, 3, "Vuoi un film da cinema d'autore, o uno che scorre facile?", [
    ["Da cinema d'autore: inquadrature, silenzi", { stilizzato: 6, immagini: 6, complesso: 3 }],
    ["Curato, senza esagerare", { immagini: 3 }],
    ["La storia, non la lezione", { semplice: 5, dialoghi: 3 }],
    ["Deve scorrere facile", { semplice: 7, veloce: 3, hollywood: 2 }],
  ]),

  q(31, 4, "Quante persone al centro?", [
    ["Una: un personaggio, una storia", { intimo: 5, identita: 3 }],
    ["Due: un rapporto", { amore: 4, intimo: 4, dialoghi: 3 }],
    ["Un gruppo, una banda, una famiglia", { famiglia: 4, crime: 2 }],
    ["Tante voci", { complesso: 3, dramma: 2 }],
  ]),
  q(32, 4, "Ti piacciono i personaggi non proprio buoni?", [
    ["Sì, mi interessano quelli con i dubbi", { cinico: 5, crime: 3, oscuro: 3, complesso: 2 }],
    ["A tratti: nessuno è solo buono", { dramma: 3, vero: 2 }],
    ["Preferisco qualcuno da tifare", { speranza: 4, avventura: 2, sollevante: 2 }],
    ["No: voglio capire subito chi ha ragione", { semplice: 3, famiglia: 2 }],
  ]),
  q(33, 4, "Storie di coppia?", [
    ["Sì, innamoramento", { romance: 6, amore: 6, leggero: 2 }],
    ["Sì, crisi, il tempo che passa", { amore: 5, dramma: 5, intimo: 4, malinconico: 2 }],
    ["Come parte di una storia più grande", { amore: 2 }],
    ["Non il centro, stasera", {}, { avoid: ["romance"] }],
  ]),
  q(34, 4, "Famiglia, come tema?", [
    ["Sì, origini e nodi in famiglia", { famiglia: 8, dramma: 4, intimo: 3 }],
    ["Sì, se non è da talk show", { famiglia: 4, ironico: 2 }],
    ["Solo come sfondo", { famiglia: 1 }],
    ["No", {}, { avoid: ["famiglia"] }],
  ]),
  q(35, 4, "Amicizia?", [
    ["Sì, bande, lealtà, tradimenti", { famiglia: 3, commedia: 2, crime: 2 }],
    ["Sì, due persone che si tengono su", { intimo: 5, dramma: 3 }],
    ["Non è importante per me", {}],
    ["Sì, se fa ridere", { commedia: 5, leggero: 3 }],
  ]),
  q(36, 4, "Vuoi una protagonista donna al centro?", [
    ["Sì, la cerco", { identita: 3, dramma: 2 }],
    ["Non è un criterio, ma benvenuta", {}],
    ["Indifferente", {}],
    ["Preferisco storie maschili, stasera", {}],
  ]),
  q(37, 4, "Che età hanno i personaggi?", [
    ["Giovani, che stanno diventando adulti", { identita: 5, speranza: 2, moderno: 2 }],
    ["Adulti, nel mezzo della vita", { dramma: 4, identita: 3, vero: 2 }],
    ["Più in là con gli anni", { malinconico: 4, classico: 2, intimo: 3 }],
    ["Misto: generazioni che si scontrano", { famiglia: 4, dramma: 2 }],
  ]),
  q(38, 4, "Cattivi carismatici?", [
    ["Sì, voglio odiare e ammirare", { cinico: 4, crime: 3, thriller: 2, potere: 3 }],
    ["Sì, ma non da poster", { complesso: 3 }],
    ["Il male come sistema, non un cattivo da film", { potere: 5, vero: 3, dramma: 2 }],
    ["Preferisco conflitti senza un cattivo", { intimo: 3, dramma: 2 }],
  ]),
  q(39, 4, "Biografie, persone realmente esistite?", [
    ["Sì, se c'è un punto di vista", { biografico: 8, vero: 6 }],
    ["Sì, artisti, scienziati, outsider", { biografico: 5, identita: 3 }],
    ["No: voglio una storia inventata", {}, { avoid: ["biografico"] }],
    ["Solo se non è un riassunto da Wikipedia", { biografico: 4, complesso: 2 }],
  ]),
  q(40, 4, "Bambini o adolescenti al centro?", [
    ["Sì, il passare all'età adulta", { identita: 5, famiglia: 2, malinconico: 2 }],
    ["Sì, se non è sdolcinato", { identita: 4, vero: 2 }],
    ["No, stasera adulti", {}],
    ["Sì, e può essere anche per famiglie", { famiglia: 5, animazione: 2, semplice: 2 }, { kidsOk: true }],
  ]),

  q(41, 5, "Città?", [
    ["Sì, strade, notti, rumore", { crime: 3, thriller: 2, moderno: 2, hollywood: 1 }],
    ["Sì, una capitale europea, un'atmosfera", { europa: 4, malinconico: 2, intimo: 2 }],
    ["No: voglio uscire dalla città", { avventura: 3 }],
    ["Roma, Milano, Napoli: città italiane", { italiano: 6 }],
  ]),
  q(42, 5, "Natura, viaggio, strada?", [
    ["Sì, paesaggi che contano per la storia", { avventura: 5, immagini: 4, lento: 2 }],
    ["Sì, un viaggio in macchina", { avventura: 6, identita: 3, hollywood: 2 }],
    ["Solo come pausa visiva", { immagini: 2 }],
    ["No, restiamo al chiuso", { intimo: 4, dialoghi: 3 }],
  ]),
  q(43, 5, "Spazio, futuro, altri mondi?", [
    ["Sì, portatemi via da qui", { scifi: 7, fantasy: 3, spettacolo: 4, avventura: 3 }],
    ["Sì, se resta umano", { scifi: 5, intimo: 3, identita: 3 }],
    ["Fantasy più che scienza", { fantasy: 8, avventura: 4, spettacolo: 3 }],
    ["No, restiamo sulla Terra", {}, { avoid: ["scifi", "fantasy"] }],
  ]),
  q(44, 5, "Passato storico?", [
    ["Sì, epoche lontane", { classico: 3, guerra: 2, spettacolo: 2, complesso: 1 }],
    ["Sì, il Novecento, una memoria ancora vicina", { biografico: 3, vero: 3, guerra: 2, europa: 2 }],
    ["No, voglio contemporaneo", { moderno: 6 }, { minYear: 1995 }],
    ["Indifferente, se la storia tiene", {}],
  ]),
  q(45, 5, "Italia, come luogo e lingua?", [
    ["Sì, la cerco", { italiano: 8 }],
    ["Sì, ma non per forza i classici in bianco e nero", { italiano: 5, moderno: 2 }],
    ["A volte, non è un obbligo", { italiano: 2 }],
    ["Stasera no, voglio altrove", {}, { avoid: ["italiano"] }],
  ]),
  q(46, 5, "Interni, case, stanze?", [
    ["Sì, la casa può essere un campo di battaglia", { intimo: 7, dramma: 4, famiglia: 3, dialoghi: 3 }],
    ["Sì, se è messo in scena con cura", { intimo: 4, stilizzato: 3 }],
    ["No, claustrofobia no", { avventura: 3, spettacolo: 2 }],
    ["Una stanza va bene, se c'è mondo fuori", { intimo: 3, immagini: 2 }],
  ]),
  q(47, 5, "Guerra?", [
    ["Sì, come tragedia, non solo battaglie", { guerra: 8, oscuro: 4, complesso: 3, vero: 3 }],
    ["Sì, se c'è un volto, non solo le truppe", { guerra: 5, intimo: 3, dramma: 3 }],
    ["Solo se non è uno spettacolo di esplosioni", { guerra: 3, cinico: 2 }],
    ["No, stasera", {}, { avoid: ["guerra"] }],
  ]),
  q(48, 5, "Lavoro, scuola, istituzioni?", [
    ["Sì, il lavoro di tutti i giorni", { vero: 5, dramma: 3, identita: 2 }],
    ["Sì, satira del potere", { potere: 5, ironico: 4, cinico: 3 }],
    ["No, voglio evadere dal mio", { avventura: 3, spettacolo: 2, fantasy: 2 }],
    ["A tratti, come sfondo credibile", { vero: 2 }],
  ]),
  q(49, 5, "Mondo magico, fiaba, mito?", [
    ["Sì", { fantasy: 8, spettacolo: 3, animazione: 2 }],
    ["Sì, se è scuro, da bosco", { fantasy: 5, oscuro: 4, stilizzato: 3 }],
    ["No", {}, { avoid: ["fantasy"] }],
    ["Solo se ha ironia, non fate e maghetti", { fantasy: 3, ironico: 4 }],
  ]),
  q(50, 5, "Mare, isole, confini, posti lontani?", [
    ["Sì, luoghi di confine", { avventura: 4, malinconico: 3, immagini: 3 }],
    ["Sì, posti lontani, non da cartolina", { avventura: 3, europa: 2, asia: 2 }],
    ["No, restiamo nel noto", {}],
    ["Italia di provincia, paesi, spiagge", { italiano: 5, intimo: 2 }],
  ]),

  q(51, 6, "Che ritmo vuoi?", [
    ["Lento, che si prende il suo tempo", { lento: 8, immagini: 4, intimo: 2 }],
    ["Normale, come un romanzo", { lento: 3, dialoghi: 3, dramma: 2 }],
    ["Svelto, tagli netti", { veloce: 7, spettacolo: 3 }],
    ["Parte piano, poi corre", { veloce: 4, teso: 3, thriller: 2 }],
  ]),
  q(52, 6, "Dialoghi o immagini?", [
    ["Parole: battute, discorsi, litigi", { dialoghi: 8, intimo: 3, commedia: 2 }],
    ["Immagini: facce, spazi, silenzi", { immagini: 8, lento: 3, stilizzato: 3 }],
    ["Equilibrio", { dialoghi: 3, immagini: 3 }],
    ["Musica e montaggio, più che parole", { immagini: 5, musical: 3, stilizzato: 3 }],
  ]),
  q(53, 6, "Quanto deve durare, in generale?", [
    ["Corto e preciso, sotto i 100 minuti", { breve: 8 }, { maxMinutes: 105 }],
    ["Nella media, 100–130 minuti", { breve: 2 }, { maxMinutes: 140 }],
    ["Lungo, se se lo merita", { lungo: 7, complesso: 3 }],
    ["Più è lungo, meglio è", { lungo: 8, spettacolo: 4, complesso: 2 }, { minMinutes: 140 }],
  ]),
  q(54, 6, "I colori?", [
    ["Saturi, da manifesto", { stilizzato: 5, spettacolo: 3 }],
    ["Naturali, luce vera", { vero: 4, intimo: 2, immagini: 2 }],
    ["Scuri, poco colore", { oscuro: 4, stilizzato: 3 }],
    ["Anche in bianco e nero", { classico: 4, stilizzato: 4, immagini: 3 }],
  ]),
  q(55, 6, "La musica deve essere protagonista?", [
    ["Sì, voglio uscire canticchiando o scosso", { musical: 5, spettacolo: 3 }],
    ["Sì, se è scritta per il film, non una playlist", { stilizzato: 3, immagini: 2 }],
    ["Discreta, al servizio", {}],
    ["Silenzio, o quasi", { intimo: 3, lento: 2, immagini: 2 }],
  ]),
  q(56, 6, "Spettacolo visivo, effetti, scala grande?", [
    ["Sì, voglio il cinema grande", { spettacolo: 8, azione: 3, scifi: 2, hollywood: 3 }],
    ["Sì, se non copre i personaggi", { spettacolo: 4, dramma: 2 }],
    ["No, storie a misura d'uomo", { intimo: 6, semplice: 2 }, { avoid: ["spettacolo"] }],
    ["Recitazione e inquadrature, non effetti digitali", { stilizzato: 6, immagini: 5 }],
  ]),
  q(57, 6, "Storia lineare, o spezzata?", [
    ["Lineare, dall'inizio alla fine", { semplice: 6 }],
    ["Qualche salto, se è chiaro", { complesso: 2 }],
    ["Frammenti, tempi diversi, puzzle", { complesso: 7, mistero: 3, stilizzato: 2 }],
    ["Sogno, loop, realtà che si mescola", { strano: 6, complesso: 5, stilizzato: 4 }],
  ]),
  q(58, 6, "Il colpo di scena?", [
    ["Sì, voglio il colpo di scena", { mistero: 6, thriller: 4, teso: 2 }],
    ["Sì, ma deve reggere se lo rivedo", { mistero: 4, complesso: 3 }],
    ["No: conta di più come finisce la storia", { dramma: 3, intimo: 2 }],
    ["Lo vedo arrivare sempre, quindi non è un criterio", {}],
  ]),
  q(59, 6, "Finale aperto?", [
    ["Sì, da discutere", { complesso: 6, mistero: 3 }],
    ["Sì, se non è pigrizia", { complesso: 3 }],
    ["No: voglio una chiusura", { semplice: 4, speranza: 2 }],
    ["Chiusura amara, ma chiusura", { cinico: 3, dramma: 2 }],
  ]),
  q(60, 6, "Quanto vuoi capire al primo sguardo?", [
    ["Tutto, subito, senza compiti a casa", { semplice: 8, hollywood: 2 }],
    ["Il senso sì, i dettagli possono restare", { semplice: 3, complesso: 2 }],
    ["Voglio che chieda una seconda visione", { complesso: 7, stilizzato: 3 }],
    ["Può restare un po' misterioso, se è bello", { complesso: 5, immagini: 4, strano: 3 }],
  ]),

  q(61, 7, "Giustizia, colpa, processo?", [
    ["Sì", { mistero: 4, crime: 4, thriller: 3, potere: 3, vero: 2 }],
    ["Sì, come domanda su cosa è giusto, non un processo", { dramma: 4, identita: 3, complesso: 2 }],
    ["No", {}],
    ["Sì, se è un enigma da seguire", { mistero: 6, thriller: 4 }],
  ]),
  q(62, 7, "Politica, soldi, chi comanda?", [
    ["Sì, voglio vedere chi comanda", { potere: 8, cinico: 3, vero: 3 }],
    ["Sì, in miniatura: una casa, un ufficio", { potere: 5, intimo: 3, famiglia: 2 }],
    ["No, voglio staccare", { avventura: 3, leggero: 2 }],
    ["Sì, se è satira", { potere: 5, ironico: 5, commedia: 2 }],
  ]),
  q(63, 7, "Identità: chi siamo, le maschere?", [
    ["Il tema che mi tiene sveglio", { identita: 8, complesso: 4, intimo: 3 }],
    ["Sì, se non è una lezione", { identita: 4, dramma: 2 }],
    ["No, troppa psicologia", {}],
    ["Sì, e può essere anche strano", { identita: 6, strano: 4 }],
  ]),
  q(64, 7, "Memoria, tempo che passa, rimpianto?", [
    ["Sì", { malinconico: 6, identita: 4, lento: 3, classico: 2 }],
    ["Sì, se c'è una forma (flashback, diario)", { complesso: 3, identita: 3 }],
    ["No, restiamo nel presente", { moderno: 3, veloce: 2 }],
    ["Sì, e può fare male", { malinconico: 7, dramma: 4 }],
  ]),
  q(65, 7, "Tecnologia, internet, un futuro vicino?", [
    ["Sì, è il mondo di adesso", { scifi: 5, moderno: 5, identita: 2, teso: 2 }],
    ["Sì, se è un futuro credibile e un po' inquietante", { scifi: 4, cinico: 3, potere: 3 }],
    ["No, voglio staccare dagli schermi", {}, { avoid: ["scifi"] }],
    ["Solo come sfondo contemporaneo", { moderno: 3 }],
  ]),
  q(66, 7, "Soldi, classi sociali, chi resta fuori?", [
    ["Sì, è il conflitto vero", { potere: 6, vero: 5, dramma: 3, cinico: 2 }],
    ["Sì, all'italiana: furbi e fessi", { italiano: 4, ironico: 3, commedia: 2 }],
    ["No", {}],
    ["Sì, se non è un comizio", { potere: 4, complesso: 2 }],
  ]),
  q(67, 7, "Fede, sacro, dubbio?", [
    ["Sì, anche senza essere credente", { complesso: 4, identita: 3, lento: 2 }],
    ["Sì, come cultura e rito", { europa: 2, classico: 2 }],
    ["No", {}],
    ["Sì, se è conflitto interiore, non predica", { identita: 4, dramma: 3 }],
  ]),
  q(68, 7, "Arte, teatro, cinema sul cinema?", [
    ["Sì, il mondo dell'arte e del cinema", { identita: 4, stilizzato: 4, biografico: 2, complesso: 2 }],
    ["A tratti", { stilizzato: 2 }],
    ["No, troppo chiuso su se stesso", {}],
    ["Sì, se fa ridere del mondo dello spettacolo", { ironico: 4, commedia: 3 }],
  ]),
  q(69, 7, "Un film politico, chiaro?", [
    ["Sì, voglio che prenda posizione", { potere: 6, vero: 4, cinico: 2 }],
    ["Sì, se passa dalle persone, non dagli slogan", { potere: 4, dramma: 3 }],
    ["No, stasera voglio staccare", {}, { avoid: ["potere"] }],
    ["Satira, non manifesto", { ironico: 5, potere: 3 }],
  ]),
  q(70, 7, "Crescere, diventare qualcuno?", [
    ["Sì", { identita: 6, speranza: 3, famiglia: 2 }],
    ["Sì, anche da adulti", { identita: 5, dramma: 3, vero: 2 }],
    ["No, personaggi già formati", { cinico: 2 }],
    ["Sì, se è amara, non da manuale", { identita: 4, malinconico: 3 }],
  ]),

  q(71, 8, "Classici (prima del 1975)?", [
    ["Sì, la storia del cinema", { classico: 8 }, { maxYear: 1975 }],
    ["Qualcuno, se è vivo ancora oggi", { classico: 4 }],
    ["No, troppa polvere", { moderno: 5 }, { minYear: 1990 }],
    ["Sì, ma parlato o restaurato bene", { classico: 5, italiano: 2 }],
  ]),
  q(72, 8, "Anni Settanta e Ottanta?", [
    ["Il mio territorio", { classico: 3, hollywood: 3 }, { minYear: 1970, maxYear: 1989 }],
    ["Sì, i film americani di quegli anni, o l'horror", { thriller: 2, horror: 2, crime: 2 }],
    ["Poco", { moderno: 3 }],
    ["Sì, l'Italia di quegli anni", { italiano: 5, classico: 2 }],
  ]),
  q(73, 8, "Anni Novanta e Duemila?", [
    ["Sì, la mia adolescenza in sala", { moderno: 4, hollywood: 3 }],
    ["Sì, i film indipendenti americani", { hollywood: 3, ironico: 2, crime: 2 }],
    ["Indifferente", {}],
    ["No, troppo già visto", { classico: 2, moderno: 2 }],
  ]),
  q(74, 8, "Cinema di ora (dal 2018 in poi)?", [
    ["Sì, voglio i film di adesso", { moderno: 8 }, { minYear: 2018 }],
    ["Sì, se non è solo quello che spinge la piattaforma", { moderno: 4, complesso: 2 }],
    ["No, troppa fretta di adesso", { classico: 4 }, { maxYear: 2010 }],
    ["Misto: un nuovo e un classico mi stanno bene", { moderno: 3, classico: 3 }],
  ]),
  q(75, 8, "Hollywood, i film americani grandi?", [
    ["Sì, è il mestiere", { hollywood: 8, spettacolo: 4, semplice: 2 }],
    ["Sì, ma la Hollywood intelligente", { hollywood: 5, complesso: 2, dialoghi: 2 }],
    ["No, troppi sequel e supereroi", {}, { avoid: ["hollywood"] }],
    ["Ogni tanto un film grande, sì", { hollywood: 3, spettacolo: 3 }],
  ]),
  q(76, 8, "Europa (Francia, Nord, Est, Regno Unito…)?", [
    ["Sì, è casa", { europa: 8, complesso: 2, intimo: 2 }],
    ["Sì, certa Francia, certo Nord", { europa: 5, malinconico: 2 }],
    ["A volte", { europa: 2 }],
    ["No, stasera no", {}, { avoid: ["europa"] }],
  ]),
  q(77, 8, "Asia (Corea, Giappone, Cina, Iran…)?", [
    ["Sì, la cerco", { asia: 8, complesso: 2, stilizzato: 2 }],
    ["Sì, Corea e Giappone in particolare", { asia: 6, thriller: 2 }],
    ["Curioso, se mi guidi", { asia: 3 }],
    ["No", {}, { avoid: ["asia"] }],
  ]),
  q(78, 8, "Altrove: America Latina, Africa, Medio Oriente?", [
    ["Sì, apri il mondo", { vero: 4, immagini: 3, complesso: 2 }],
    ["Sì, se c'è un film, non un esempio", { vero: 3, dramma: 2 }],
    ["Non è una priorità", {}],
    ["Italia e Occidente mi bastano", { hollywood: 2, europa: 2, italiano: 2 }],
  ]),
  q(79, 8, "Un regista con uno stile che riconosci subito?", [
    ["Sì, voglio una voce", { stilizzato: 6, complesso: 4, immagini: 3 }],
    ["Sì, ma senza esagerare con lo stile", { stilizzato: 3, dramma: 2 }],
    ["No: lo stile non si deve vedere", { semplice: 5, hollywood: 3 }],
    ["Dipende se lo stile serve la storia", { complesso: 2 }],
  ]),
  q(80, 8, "Festival, o sala piena di popcorn?", [
    ["Festival, sempre", { complesso: 6, europa: 3, stilizzato: 3 }],
    ["Qualcosa in mezzo: lodato, ma vedibile", { complesso: 3, hollywood: 2 }],
    ["Popcorn: è festa", { spettacolo: 6, semplice: 4, hollywood: 4, leggero: 3 }],
    ["Entrambi, in serate diverse — stasera il primo", { complesso: 4, intimo: 2 }],
  ]),

  q(
    81,
    9,
    "Quali piattaforme hai, di solito?",
    [
      ["Netflix", { moderno: 1 }, { platforms: ["netflix"] }],
      ["Prime Video", {}, { platforms: ["prime"] }],
      ["Disney+", { famiglia: 1, spettacolo: 1 }, { platforms: ["disney"] }],
      ["Apple TV", { moderno: 1, intimo: 1 }, { platforms: ["apple"] }],
      ["NOW / Sky", {}, { platforms: ["now"] }],
      ["MUBI", { europa: 3, complesso: 2, stilizzato: 2 }, { platforms: ["mubi"] }],
      ["RaiPlay", { italiano: 3, classico: 1 }, { platforms: ["raiplay"] }],
      ["Paramount+", { hollywood: 2 }, { platforms: ["paramount"] }],
    ],
    { type: "multi", hint: "Se le hai già segnate all'inizio, sono già spuntate. Puoi cambiarle." },
  ),
  q(82, 9, "Sottotitoli o doppiaggio, di solito?", [
    ["Sottotitoli, sempre", { europa: 2, asia: 2 }],
    ["Dipende dalla lingua e dalla stanchezza", {}],
    ["Doppiaggio, se è fatto bene", { hollywood: 2, semplice: 2 }, { dubbed: true }],
    ["Italiano originale: niente da scegliere", { italiano: 4 }],
  ]),
  q(83, 9, "Un film nuovo, o uno già visto?", [
    ["Prima visione, stasera", { moderno: 2 }],
    ["Uno già visto, come una coperta", { classico: 3, semplice: 2 }],
    ["Indifferente", {}],
    ["Prima visione, anche se è un titolo vecchio", { classico: 2 }],
  ]),
  q(84, 9, "Ti basta un film, o stai pensando a una serie?", [
    ["Un film: inizio, fine, stanotte", { breve: 2 }],
    ["Un film lungo va bene, non una serie", { lungo: 2 }],
    ["Preferirei una serie, ma proponimi un film che stia in una sera", { semplice: 2, hollywood: 1 }],
    ["Un film ricco, come una miniserie", { complesso: 4, lungo: 3 }],
  ]),
  q(85, 9, "Quanto conti su voti e recensioni?", [
    ["Molto: toglimi il rumore", { hollywood: 1, semplice: 1 }],
    ["Un po', ma il gusto è mio", {}],
    ["Poco: i voti mi dicono quasi niente", { complesso: 2, strano: 1 }],
    ["Zero: voglio il rischio", { strano: 3, europa: 2 }],
  ]),
  q(86, 9, "Guardi attento, o il film sta in sottofondo?", [
    ["Attento, telefono da un'altra parte", { complesso: 4, intimo: 2, immagini: 2 }],
    ["Attento, ma posso mettere in pausa", { semplice: 1 }],
    ["Mezzo: stasera ho le mani occupate", { semplice: 5, dialoghi: 3, commedia: 2 }],
    ["Sottofondo: voglio compagnia, non impegno", { semplice: 7, leggero: 5, commedia: 3 }],
  ]),
  q(87, 9, "Su che schermo?", [
    ["TV, come in sala", { spettacolo: 4, immagini: 3 }],
    ["Computer, distanza media", {}],
    ["Anche il telefono, se è il momento", { semplice: 3, breve: 2 }],
    ["TV, ma a volume basso, tardi", { intimo: 3, lento: 2 }],
  ]),
  q(88, 9, "Quanto vuoi faticare sul film?", [
    ["Niente: deve arrivarmi", { semplice: 7, hollywood: 2 }],
    ["Un po': salti, tempi, cose da capire", { complesso: 3 }],
    ["Tanto: pazienza, forma, da studiare un po'", { complesso: 8, lento: 4, stilizzato: 3 }],
    ["Tanto, ma solo se c'è emozione, non solo idee", { complesso: 5, intimo: 3, dramma: 2 }],
  ]),
  q(89, 9, "Sequel, universi, capitoli infiniti?", [
    ["Sì, voglio il capitolo", { hollywood: 5, spettacolo: 4, azione: 3, scifi: 2 }],
    ["Sì, se sta in piedi da solo", { hollywood: 3, spettacolo: 2 }],
    ["No: una storia, e basta", { intimo: 2, europa: 2 }],
    ["No, e basta anche con i rifacimenti", {}, { avoid: ["hollywood"] }],
  ]),
  q(90, 9, "Dopo il film, vuoi parlarne?", [
    ["Sì, è metà del piacere", { complesso: 4, mistero: 2, dialoghi: 2 }],
    ["Sì, se c'è qualcuno sveglio", { dramma: 2 }],
    ["No: voglio spegnere e dormire", { semplice: 3, leggero: 2 }],
    ["No: voglio restare da solo con quello che ho visto", { intimo: 4, malinconico: 2 }],
  ]),

  q(91, 10, "Urla improvvise, paure da salto?", [
    ["Sì, anche", { horror: 5, teso: 4 }],
    ["No, li odio", {}, { avoid: ["horror"] }],
    ["Atmosfera sì, paure da luna park no", { horror: 2, lento: 2, oscuro: 3 }],
    ["Indifferente", {}],
  ]),
  q(92, 10, "Violenza esplicita?", [
    ["Tollerata, se serve", { oscuro: 3, crime: 2, teso: 2 }],
    ["No, tagliate", {}, { avoid: ["horror"] }],
    ["Sì, se è sgradevole di proposito, non da videogioco", { cinico: 3, oscuro: 3, complesso: 2 }],
    ["Azione stilizzata sì, realismo crudo no", { azione: 4, spettacolo: 3 }],
  ]),
  q(93, 10, "Storie molto tristi su infanzia e perdita?", [
    ["Posso, se è fatto bene", { dramma: 3, malinconico: 3, famiglia: 2 }],
    ["No, non stasera", {}, { avoid: ["malinconico"] }],
    ["Sì, è un territorio che mi interessa", { dramma: 5, malinconico: 4, identita: 2 }],
    ["Solo se c'è una luce, alla fine", { speranza: 5, famiglia: 3, dramma: 2 }],
  ]),
  q(94, 10, "Film lenti, dove non succede niente?", [
    ["Sì, è proprio quello il punto", { lento: 8, immagini: 4, intimo: 3 }],
    ["Un po', non due ore di corridoio", { lento: 3 }],
    ["No, mi addormento", { veloce: 6, semplice: 3 }, { avoid: ["lento"] }],
    ["Sì, se mi ipnotizza", { lento: 6, stilizzato: 4, immagini: 3 }],
  ]),
  q(95, 10, "Effetti digitali evidenti, facce digitali, mondi di pixel?", [
    ["Sì, è cinema", { spettacolo: 5, scifi: 3, hollywood: 3 }],
    ["Sì, se non è il soggetto", { spettacolo: 2 }],
    ["No, preferisco materia, costumi, luoghi veri", { vero: 4, immagini: 3, classico: 2 }],
    ["No, mi stacca dal film", {}, { avoid: ["spettacolo"] }],
  ]),
  q(96, 10, "Film difficili: salti, tempi lunghi, poca trama?", [
    ["Sì", { complesso: 8, lento: 4, europa: 2 }],
    ["Sì, a dose", { complesso: 4 }],
    ["No", { semplice: 6 }, { avoid: ["complesso"] }],
    ["Sì, se c'è un cuore, non solo la forma", { complesso: 5, intimo: 4, dramma: 2 }],
  ]),
  q(97, 10, "Conta di più la recitazione o come è girato?", [
    ["Tutto: voglio volti", { intimo: 6, dialoghi: 4, dramma: 3 }],
    ["Molto, ma anche come è inquadrato", { intimo: 3, immagini: 3 }],
    ["Come è girato può essere la star", { stilizzato: 5, spettacolo: 3, immagini: 3 }],
    ["Equilibrio: attori e inquadratura", { complesso: 2 }],
  ]),
  q(98, 10, "Vuoi essere spiazzato sul serio?", [
    ["Sì, fuori dalle regole", { strano: 8, complesso: 4 }],
    ["Un po'", { strano: 3 }],
    ["No, voglio un film di genere fatto come si deve", { semplice: 4, hollywood: 2 }],
    ["Sì, ma non per shock gratuito", { strano: 5, complesso: 3, identita: 2 }],
  ]),
  q(99, 10, "Se un film è importante ma ti annoia, vince…", [
    ["L'importanza: cresco", { complesso: 5, classico: 2 }],
    ["Il piacere: spegniamo", { semplice: 5, leggero: 3 }],
    ["Un compromesso: importante e vivo", { complesso: 3, intimo: 3, dramma: 2 }],
    ["Il piacere, sempre, senza sensi di colpa", { semplice: 6, commedia: 2, spettacolo: 2 }],
  ]),
  q(100, 10, "Se stasera potessi scegliere un solo criterio, quale?", [
    ["L'umore: deve coincidere con me, ora", { intimo: 3 }],
    ["Il genere: so cosa voglio", {}],
    ["La scoperta: qualcosa che non avrei cliccato", { strano: 3, europa: 2, asia: 2, complesso: 2 }],
    ["La compagnia: deve funzionare per chi c'è sul divano", { famiglia: 3, semplice: 3, leggero: 2 }],
  ]),
];

export const SHORT_QUESTION_IDS = [
  1, 2, 12, 15, 23, 24, 32, 33, 43, 45, 51, 53, 62, 63, 71, 75, 82, 88, 92, 100,
] as const;

export function questionsFor(mode: "quiz" | "short"): Question[] {
  if (mode !== "short") return QUESTIONS;
  const byId = new Map(QUESTIONS.map((item) => [item.id, item]));
  return SHORT_QUESTION_IDS.map((id) => byId.get(id)).filter((item): item is Question => Boolean(item));
}

if (questionsFor("short").length !== 20) {
  throw new Error(`Expected 20 short questions, got ${questionsFor("short").length}`);
}
