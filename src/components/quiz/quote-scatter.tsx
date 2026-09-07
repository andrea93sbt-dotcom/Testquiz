const SETS = {
  intro: [
    {
      line: "Alla tua salute, tesoro.",
      film: "Casablanca",
      src: "/quotes/casablanca.jpg",
      place: "right-5 top-8 -rotate-8",
    },
    {
      line: "Che la forza sia con te.",
      film: "Guerre Stellari",
      src: "/quotes/force.jpg",
      place: "left-5 top-36 rotate-6",
    },
    {
      line: "Un'offerta che non potrà rifiutare.",
      film: "Il Padrino",
      src: "/quotes/padrino.jpg",
      place: "right-8 top-[48%] rotate-4",
    },
    {
      line: "Tu parli con me?",
      film: "Taxi Driver",
      src: "/quotes/taxi.jpg",
      place: "left-8 top-[62%] -rotate-5",
    },
  ],
  rest: [
    {
      line: "La vita è una scatola di cioccolatini.",
      film: "Forrest Gump",
      src: "/quotes/gump.jpg",
      place: "right-6 top-12 rotate-6",
    },
    {
      line: "Houston, abbiamo un problema.",
      film: "Apollo 13",
      src: "/quotes/houston.jpg",
      place: "left-5 top-40 -rotate-7",
    },
    {
      line: "Non c'è alcun cucchiaio.",
      film: "Matrix",
      src: "/quotes/matrix.jpg",
      place: "right-8 top-[52%] -rotate-4",
    },
    {
      line: "Nessuno è perfetto.",
      film: "A qualcuno piace caldo",
      src: "/quotes/sala.jpg",
      place: "left-8 top-[68%] rotate-3",
    },
    {
      line: "Royale with cheese.",
      film: "Pulp Fiction",
      src: "/quotes/diner.jpg",
      place: "right-5 top-56 rotate-5",
    },
    {
      line: "Ecco Johnny!",
      film: "Shining",
      src: "/quotes/corridoio.jpg",
      place: "left-6 top-20 -rotate-6",
    },
  ],
} as const;

export function QuoteScatter({ variant = "intro" }: { variant?: keyof typeof SETS }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 hidden overflow-hidden lg:block" aria-hidden>
      {SETS[variant].map((q) => (
        <figure
          key={q.film}
          className={`quote-card absolute w-28 rounded-sm p-1 ${q.place}`}
        >
          <span className="mb-1 block h-1.5 w-full rounded-[1px] bg-ticket" />
          <img
            src={q.src}
            alt=""
            width={112}
            height={112}
            className="aspect-square w-full rounded-[2px] object-cover"
          />
          <figcaption className="mt-1 px-0.5 pb-0.5">
            <p className="font-display text-[11px] leading-tight text-paper-fg italic">
              “{q.line}”
            </p>
            <p className="mt-0.5 text-[8px] tracking-wide text-ticket uppercase">{q.film}</p>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
