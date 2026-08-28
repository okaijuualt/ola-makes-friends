import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { prospectLeads, deleteLead } from "@/lib/prospect.functions";
import { leadsQueryOptions, runsQueryOptions } from "@/lib/leads";
import { profilesQueryOptions, pickProfile } from "@/lib/profiles";
import { flagEmoji } from "@/lib/timeIntel";

export const Route = createFileRoute("/captacao")({
  head: () => ({
    meta: [
      { title: "Captação de leads — LeadFinder AI" },
      {
        name: "description",
        content:
          "Busque leads automaticamente por nicho e país com IA, salve na sua base e veja a melhor janela de contato de cada um.",
      },
      { property: "og:title", content: "Captação de leads — LeadFinder AI" },
      {
        property: "og:description",
        content: "Prospecção automática por nicho e país, com leads salvos na sua base.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Captacao,
});

const NICHE_SUGGESTIONS = ["Agência de marketing", "SaaS B2B", "E-commerce", "Clínica odontológica", "Logística", "Consultoria financeira"];

function Captacao() {
  const qc = useQueryClient();
  const { data: profiles = [] } = useQuery(profilesQueryOptions);
  const { data: leads = [], isLoading } = useQuery(leadsQueryOptions);
  const { data: runs = [] } = useQuery(runsQueryOptions);

  const [niche, setNiche] = useState("");
  const [countries, setCountries] = useState<string[]>(["BR"]);
  const [quantity, setQuantity] = useState(10);
  const [extra, setExtra] = useState("");

  const runProspect = useServerFn(prospectLeads);
  const removeLead = useServerFn(deleteLead);

  const prospect = useMutation({
    mutationFn: () => runProspect({ data: { niche, countries, quantity, extra } }),
    onSuccess: (res) => {
      toast.success(`${res.inserted} leads captados`);
      void qc.invalidateQueries({ queryKey: ["leads"] });
      void qc.invalidateQueries({ queryKey: ["prospect_runs"] });
    },
    onError: (e: Error) => toast.error(e.message || "Falha na captação"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => removeLead({ data: { id } }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["leads"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const selectable = profiles.filter((p) => p.country_code !== "DEFAULT");

  function toggleCountry(code: string) {
    setCountries((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  }

  return (
    <main className="mx-auto max-w-6xl px-5 py-10">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">LeadFinder AI</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Captação de leads</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Prospecção automática por nicho e país. Os resultados são estimativas geradas por IA —
          confirme os contatos antes de abordar.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex rounded-md border border-border px-3 py-1.5 text-sm hover:bg-accent"
        >
          ← Voltar ao painel de horários
        </Link>
      </header>

      <section className="mb-10 space-y-4 rounded-xl border border-border bg-card p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-sm sm:col-span-2">
            <span className="mb-1 block text-xs text-muted-foreground">Nicho / segmento</span>
            <input
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ex.: agências de tráfego pago"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs text-muted-foreground">Quantidade</span>
            <input
              type="number"
              min={1}
              max={25}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          {NICHE_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setNiche(s)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:bg-accent"
            >
              {s}
            </button>
          ))}
        </div>

        <div>
          <span className="mb-2 block text-xs text-muted-foreground">Países</span>
          <div className="flex flex-wrap gap-2">
            {selectable.map((p) => {
              const on = countries.includes(p.country_code);
              return (
                <button
                  key={p.country_code}
                  type="button"
                  onClick={() => toggleCountry(p.country_code)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {flagEmoji(p.country_code)} {p.country_code}
                </button>
              );
            })}
          </div>
        </div>

        <label className="block text-sm">
          <span className="mb-1 block text-xs text-muted-foreground">Critérios extra (opcional)</span>
          <input
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            placeholder="Ex.: empresas com 10 a 50 funcionários, foco em B2B"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </label>

        <button
          type="button"
          disabled={prospect.isPending || niche.trim().length < 2 || countries.length === 0}
          onClick={() => prospect.mutate()}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {prospect.isPending ? "Buscando leads…" : "Buscar leads"}
        </button>
      </section>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">Base captada ({leads.length})</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando…</p>
        ) : leads.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nenhum lead captado ainda. Faça a primeira busca acima.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Lead</th>
                  <th className="px-3 py-2">Empresa</th>
                  <th className="px-3 py-2">País</th>
                  <th className="px-3 py-2">Contato</th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => {
                  const profile = pickProfile(profiles, l.country_code);
                  return (
                    <tr key={l.id} className="border-t border-border/60">
                      <td className="px-3 py-2">
                        <div className="font-medium">{l.name}</div>
                        <div className="text-xs text-muted-foreground">{l.role ?? l.niche}</div>
                      </td>
                      <td className="px-3 py-2">
                        <div>{l.company}</div>
                        {l.website ? (
                          <a
                            href={l.website.startsWith("http") ? l.website : `https://${l.website}`}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="text-xs text-primary hover:underline"
                          >
                            {l.website}
                          </a>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {flagEmoji(l.country_code)} {l.city ?? profile?.country_name ?? l.country_code}
                      </td>
                      <td className="px-3 py-2 text-xs">
                        <div>{l.email ?? "—"}</div>
                        <div className="text-muted-foreground">{l.phone ?? ""}</div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => remove.mutate(l.id)}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          remover
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {runs.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Últimas buscas</h2>
          <ul className="space-y-2 text-sm">
            {runs.map((r) => (
              <li key={r.id} className="rounded-lg border border-border px-3 py-2">
                <span className="font-medium">{r.niche}</span>{" "}
                <span className="text-muted-foreground">
                  · {r.country_codes.join(", ")} · {r.found}/{r.requested} leads ·{" "}
                  {new Date(r.created_at).toLocaleString("pt-BR")}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
