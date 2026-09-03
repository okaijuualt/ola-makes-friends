import { Link } from "@tanstack/react-router";
import { BadgeCheck, Clock, Globe2, ShieldCheck, TrendingUp } from "lucide-react";
import landingBg from "@/assets/landing-bg.png.asset.json";
import worldMap from "@/assets/world-map-dots.png";

const TRUST = [
  { icon: ShieldCheck, title: "Privado e seguro", sub: "Seus dados protegidos" },
  { icon: Globe2, title: "Cobertura global", sub: "Todos os países" },
  { icon: BadgeCheck, title: "Estimativas precisas", sub: "Baseadas em dados reais" },
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
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/40"
      />
      <header className="relative flex items-center justify-between border-b border-border px-5 py-3 sm:px-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-brand text-brand-foreground">
              <Clock className="size-4" />
            </span>
            <p className="text-sm font-semibold tracking-tight">LeadFinder</p>
          </div>
          <nav className="hidden items-center gap-5 text-sm text-muted-foreground sm:flex">
            {["Recursos", "Planos", "Blog"].map((item) => (
              <span key={item} className="cursor-default hover:text-foreground">
                {item}
              </span>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            search={{ mode: "signin" }}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            Entrar
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" }}
            className="rounded-md bg-brand px-3 py-1.5 text-sm font-medium text-brand-foreground hover:opacity-90"
          >
            Criar conta
          </Link>
        </div>
      </header>

      <div className="relative grid min-h-0 flex-1 md:grid-cols-[1.05fr_0.95fr]">
        <section className="flex min-h-0 flex-col justify-center gap-5 px-5 py-6 sm:px-8">
          <h1 className="text-[clamp(1.9rem,4.2vw,3.3rem)] font-bold leading-[1.08] tracking-tight">
            Fale com cada lead
            <br />
            na <span className="text-brand">hora</span> em que ele
            <br />
            realmente responde.
          </h1>
          <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
            Cruzamos fuso horário, horário comercial e picos de atividade por país para encontrar o
            melhor momento de contato — e capturar mais leads automaticamente.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" }}
              className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-brand-foreground hover:opacity-90"
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
          <div className="mt-2 flex flex-wrap gap-x-8 gap-y-4">
            {TRUST.map((t) => (
              <div key={t.title} className="flex items-start gap-2.5">
                <t.icon className="mt-0.5 size-4 text-brand" />
                <div>
                  <p className="text-xs font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">{t.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="relative hidden min-h-0 items-center justify-center px-6 py-6 md:flex">
          <div
            aria-hidden
            className="absolute size-72 rounded-full bg-brand/20 blur-[100px]"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card/80 shadow-2xl backdrop-blur-md">
            <p className="border-b border-border px-5 py-3 text-sm font-medium">
              Melhor horário para contato
            </p>
            <img
              src={worldMap}
              alt="Mapa mundial de cobertura com pontos de atividade"
              width={1280}
              height={640}
              className="h-40 w-full object-cover"
            />
            <div className="grid grid-cols-2 divide-x divide-border border-y border-border">
              <div className="px-5 py-3">
                <p className="text-[11px] text-muted-foreground">Brasil</p>
                <p className="text-sm font-semibold">UTC -03:00</p>
              </div>
              <div className="px-5 py-3">
                <p className="text-[11px] text-muted-foreground">Melhor janela</p>
                <p className="text-lg font-bold leading-tight text-brand">09:00 - 11:00</p>
              </div>
            </div>
            <div className="border-b border-border px-5 py-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-status-high/10 px-2 py-1 text-xs font-medium text-status-high">
                <TrendingUp className="size-3.5" /> Alta probabilidade
              </span>
            </div>
            <div className="grid grid-cols-2 divide-x divide-border">
              {[
                { n: "18", l: "Países", sub: "Cobertura ativa" },
                { n: "24h", l: "Grade horária", sub: "Analisada por país" },
              ].map((s) => (
                <div key={s.l} className="px-5 py-4">
                  <p className="text-2xl font-bold">{s.n}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {s.l}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
