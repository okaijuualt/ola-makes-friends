import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Suspense, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { profilesQueryOptions, pickProfile } from "@/lib/profiles";
import { leadsQueryOptions, touchLeads } from "@/lib/leads";
import { deleteLead } from "@/lib/prospect.functions";
import { useLeadSession } from "@/lib/leadSession";
import { LeadCard } from "@/components/LeadCard";
import { AuthGate, SignOutButton } from "@/components/AuthGate";
import type { ContactType } from "@/lib/timeIntel";
import { CountrySelect } from "@/components/CountrySelect";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — LeadFinder AI" }, { name: "description", content: "Seu painel de leads e inteligência de horário de contato." }] }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profilesQueryOptions),
  component: DashboardRoute,
});

const CONTACT_LABEL: Record<ContactType, string> = { call: "Ligação", whatsapp: "WhatsApp", email: "E-mail" };

function Dashboard() {
  const qc = useQueryClient();
  const { data: profiles } = useSuspenseQuery(profilesQueryOptions);
  const { data: captured } = useQuery(leadsQueryOptions);
  const [now, setNow] = useState<Date | null>(null);
  const [userCountry, setUserCountry] = useState("BR");
  const [contactType, setContactType] = useState<ContactType>("call");
  const [clockView, setClockView] = useState<"lead" | "user" | "both">("both");

  const session = useLeadSession();
  const removeLead = useServerFn(deleteLead);
  const remove = useMutation({
    mutationFn: (id: string) => removeLead({ data: { id } }),
    onSuccess: () => { toast.success("Lead removido"); void qc.invalidateQueries({ queryKey: ["leads"] }); },
    onError: (e: Error) => toast.error(e.message || "Falha ao remover lead"),
  });

  useEffect(() => { setNow(new Date()); const t = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(t); }, []);

  const userProfile = pickProfile(profiles, userCountry)!;
  const selectable = profiles.filter((p) => p.country_code !== "DEFAULT");
  const storedCount = captured?.length ?? 0;
  const activeCaptured = useMemo(() => session.filterLeads(captured ?? []), [captured, session]);
  const leads = activeCaptured;
  const clockViews = ["lead", "user", "both"] as const;
  const selectedClockIndex = clockViews.indexOf(clockView);

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">LeadFinder AI</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Inteligência de horário e janela de contato</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Estimativas probabilísticas de melhor janela de contato por país. Nenhum horário garante resposta — os dados indicam apenas maior ou menor probabilidade de atividade.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/captacao" className="inline-flex rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90">Captar leads (prospecção) →</Link>
          <Link to="/comparador" className="inline-flex rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent">Abrir comparador de horários →</Link>
          <SignOutButton />
        </div>
      </header>

      <section className="mb-8 grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-3">
        <div className="text-sm"><span className="mb-1 block text-xs text-muted-foreground">Seu país</span><CountrySelect value={userCountry} onChange={setUserCountry} profiles={selectable} /></div>
        <label className="text-sm"><span className="mb-1 block text-xs text-muted-foreground">Tipo de contato</span><select value={contactType} onChange={(e) => setContactType(e.target.value as ContactType)} className="w-full rounded-md border border-input bg-background px-2 py-2 text-sm">{(Object.keys(CONTACT_LABEL) as ContactType[]).map((k) => <option key={k} value={k}>{CONTACT_LABEL[k]}</option>)}</select></label>
        <div className="text-sm">
          <span className="mb-1 block text-xs text-muted-foreground">Exibir horário</span>
          <div className="clock-view-selector relative isolate grid grid-cols-3 overflow-hidden rounded-md border border-input bg-background/45 p-0">
            <span aria-hidden className={`pointer-events-none absolute inset-y-0 left-0 z-0 w-1/3 border bg-primary transition-[transform,border-radius] duration-200 ease-out ${selectedClockIndex === 0 ? "rounded-l-[calc(var(--radius-md)-2px)] border-ring/60" : selectedClockIndex === 2 ? "rounded-r-[calc(var(--radius-md)-2px)] border-ring/60" : "rounded-none border-ring/60"}`} style={{ transform: `translateX(${selectedClockIndex * 100}%)` }} />
            {clockViews.map((v, index) => <button key={v} type="button" onClick={() => setClockView(v)} className={`relative z-10 min-w-0 rounded-none border-0 bg-transparent px-2 py-1.5 text-xs shadow-none transition-colors duration-150 ${index === 0 ? "rounded-l-[calc(var(--radius-md)-2px)] rounded-r-none" : index === 2 ? "rounded-l-none rounded-r-[calc(var(--radius-md)-2px)]" : "rounded-none"} ${selectedClockIndex === index ? "text-primary-foreground" : "text-foreground hover:bg-accent/60"}`}>{v === "lead" ? "Lead" : v === "user" ? "Você" : "Ambos"}</button>)}
          </div>
        </div>
      </section>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="text-sm text-muted-foreground">{leads.length} leads {storedCount > 0 ? "(base captada)" : ""}</div>{session.hydrated && storedCount > 0 && <div className="flex flex-wrap gap-2">{(session.cleared || session.hiddenCount > 0 || !session.resumed) && <button type="button" onClick={() => { session.resumeSession(); void touchLeads((captured ?? []).map((l) => l.id)); }} className="rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent">Retomar última sessão ({storedCount})</button>}{leads.length > 0 && <button type="button" onClick={session.clearSession} className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent">Limpar sessão atual</button>}</div>}</div>

      {session.hydrated && storedCount === 0 ? <section className="rounded-xl border border-border bg-card px-6 py-10 text-center"><h2 className="text-base font-semibold">Seus leads aparecerão aqui</h2><p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Capte empresas para começar a analisar os melhores horários de contato.</p><Link to="/captacao" className="mt-5 inline-flex rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">Captar leads</Link></section> : session.hydrated && leads.length === 0 ? <p className="mb-6 text-sm text-muted-foreground">A sessão atual está vazia. Use “Retomar última sessão” para trazer os leads salvos de volta.</p> : <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{now && leads.map((lead) => { const leadProfile = pickProfile(profiles, lead.country_code)!; return <LeadCard key={lead.id} lead={lead} leadProfile={leadProfile} userProfile={userProfile} contactType={contactType} clockView={clockView} now={now} onDelete={() => remove.mutate(lead.id)} />; })}</div>}
      <p className="mt-10 text-xs text-muted-foreground">Países sem dado específico usam um perfil padrão genérico, sinalizado com confiança baixa.</p>
    </main>
  );
}

function DashboardRoute() { return <AuthGate><Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Carregando…</div>}><Dashboard /></Suspense></AuthGate>; }
