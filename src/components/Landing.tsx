import { Link } from "@tanstack/react-router";
import landingBg from "@/assets/landing-bg.png.asset.json";

const FEATURES = [
  {
    tag: "01",
    title: "Janela ideal",
    text: "Melhor horário estimado por país, com fuso do lead e o seu lado a lado.",
  },
  {
    tag: "02",
    title: "Score de oportunidade",
    text: "0–100 combinando horário comercial, picos de atividade e tipo de contato.",
  },
  {
    tag: "03",
    title: "Prospecção com IA",
    text: "Captação por nicho e país, com peneira automática de sites fora do ar.",
  },
];

export function Landing() {
  return (
    <main className="relative flex h-screen flex-col overflow-hidden bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cover bg-center opacity-60"
        style={{ backgroundImage: `url(${landingBg.url})` }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/30"
      />
      <header className="relative flex items-center justify-between border-b border-border px-5 py-3 sm:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-muted-foreground">
          LeadFinder<span className="text-foreground"> AI</span>
        </p>
        <div className="flex items-center gap-2">
          <Link
            to="/comparador"
            className="hidden rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent sm:inline-flex"
          >
            Comparador
          </Link>
          <Link
            to="/auth"
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:opacity-90"
          >
            Entrar
          </Link>
        </div>
      </header>

      <div className="relative grid min-h-0 flex-1 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="flex min-h-0 flex-col justify-center gap-5 px-5 py-6 sm:px-8">
          <span className="w-fit rounded-full border border-border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            inteligência de horário
          </span>
          <h1 className="text-[clamp(1.9rem,4.4vw,3.4rem)] font-bold leading-[1.05] tracking-tight">
            Fale com cada lead
            <br />
            na hora em que ele
            <span className="text-muted-foreground"> realmente responde.</span>
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground">
            O LeadFinder AI cruza fuso horário, horário comercial e picos de atividade por país para
            estimar a melhor janela de contato — e capta leads por nicho automaticamente.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/auth"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Criar conta grátis
            </Link>
            <Link
              to="/comparador"
              className="rounded-md border border-border px-4 py-2 text-sm hover:bg-accent"
            >
              Ver comparador de horários
            </Link>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            leads privados por conta · estimativas probabilísticas
          </p>
        </section>

        <section className="hidden min-h-0 flex-col justify-center gap-3 border-l border-border bg-card/70 px-6 py-6 backdrop-blur-sm lg:flex">
          {FEATURES.map((f) => (
            <article key={f.tag} className="rounded-lg border border-border bg-background p-4">
              <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground">{f.tag}</p>
              <h2 className="mt-1 text-sm font-semibold">{f.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{f.text}</p>
            </article>
          ))}
          <div className="mt-1 grid grid-cols-3 gap-2 text-center">
            {[
              ["18", "países"],
              ["24h", "grade horária"],
              ["12h", "cache de leads"],
            ].map(([n, l]) => (
              <div key={l} className="rounded-lg border border-border p-3">
                <p className="text-lg font-bold">{n}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                  {l}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
