import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Suspense, useEffect, useState } from "react";
import { pickProfile, profilesQueryOptions } from "@/lib/profiles";
import {
  getZonedParts,
  toMinutes,
  zonedWallToDate,
  fromMinutes,
  type CountryTimeProfile,
} from "@/lib/timeIntel";
import { CountrySelect, FlagImg } from "@/components/CountrySelect";

export const Route = createFileRoute("/comparador")({
  head: () => ({
    meta: [
      { title: "Comparador de horários entre países | LeadFinder AI" },
      {
        name: "description",
        content:
          "Compare a timeline de 24h de dois países lado a lado e veja a interseção estimada ideal entre horários comerciais e picos de atividade.",
      },
      { property: "og:title", content: "Comparador de horários entre países" },
      {
        property: "og:description",
        content:
          "Timeline de 24h lado a lado com horário comercial, pico de atividade e a melhor interseção estimada.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(profilesQueryOptions),
  component: ComparadorRoute,
});

const HOURS = Array.from({ length: 24 }, (_, i) => i);

/** Estado de cada hora local (0..23) para um perfil. */
function hourState(profile: CountryTimeProfile, hour: number) {
  const mins = hour * 60 + 30;
  const biz =
    mins >= toMinutes(profile.business_hours_start) && mins < toMinutes(profile.business_hours_end);
  const peak = (profile.peak_hours || []).some(
    (w) => mins >= toMinutes(w.start) && mins < toMinutes(w.end),
  );
  const lunch =
    profile.lunch_start && profile.lunch_end
      ? mins >= toMinutes(profile.lunch_start) && mins < toMinutes(profile.lunch_end)
      : false;
  return { biz, peak, lunch };
}

function cellClass(s: { biz: boolean; peak: boolean; lunch: boolean }) {
  if (s.peak) return "bg-status-high/80";
  if (s.lunch) return "bg-status-mid/50";
  if (s.biz) return "bg-status-high/30";
  return "bg-muted";
}

function Comparador() {
  const { data: profiles } = useSuspenseQuery(profilesQueryOptions);
  const selectable = profiles.filter((p) => p.country_code !== "DEFAULT");
  const [userCode, setUserCode] = useState("BR");
  const [leadCode, setLeadCode] = useState("US");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const user = pickProfile(profiles, userCode)!;
  const lead = pickProfile(profiles, leadCode)!;
  const userNow = getZonedParts(now, user.timezone);
  const leadNow = getZonedParts(now, lead.timezone);

  // Para cada hora local do usuário, qual hora local do lead corresponde.
  const rows = HOURS.map((h) => {
    const abs = zonedWallToDate(user.timezone, userNow.year, userNow.month, userNow.day, h * 60 + 30);
    const lp = getZonedParts(abs, lead.timezone);
    const uState = hourState(user, h);
    const lState = hourState(lead, lp.hour);
    return {
      userHour: h,
      leadHour: lp.hour,
      uState,
      lState,
      ideal: uState.biz && lState.peak && !uState.lunch,
      overlap: uState.biz && lState.biz,
    };
  });

  const idealRows = rows.filter((r) => r.ideal);
  const overlapRows = rows.filter((r) => r.overlap);

  return (
    <main className="mx-auto max-w-5xl px-5 py-10">
      <Link to="/" className="text-sm text-muted-foreground hover:underline">
        ← Voltar ao painel
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">Comparador de horários</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Timeline de 24h dos dois países, alinhada pelo seu fuso. As faixas indicam probabilidade
        estimada de atividade, não garantia de resposta.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {[
          { label: "Seu país", value: userCode, set: setUserCode },
          { label: "País do lead", value: leadCode, set: setLeadCode },
        ].map((sel) => (
          <div key={sel.label} className="text-sm">
            <span className="mb-1 block text-xs text-muted-foreground">{sel.label}</span>
            <CountrySelect value={sel.value} onChange={sel.set} profiles={selectable} />
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <FlagImg code={user.country_code} name={user.country_name} size={16} />
          {user.country_name}: agora{" "}
          <strong className="font-mono text-foreground">{fromMinutes(userNow.minutesOfDay)}</strong>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FlagImg code={lead.country_code} name={lead.country_name} size={16} />
          {lead.country_name}: agora{" "}
          <strong className="font-mono text-foreground">{fromMinutes(leadNow.minutesOfDay)}</strong>
        </span>
        <span>({lead.data_confidence === "baixa" ? "confiança baixa" : `confiança ${lead.data_confidence}`})</span>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card p-4">
        <div className="min-w-[640px] space-y-3">
          <div className="grid grid-cols-24 gap-0.5 text-[10px] text-muted-foreground">
            {rows.map((r) => (
              <div key={r.userHour} className="text-center">
                {r.userHour}
              </div>
            ))}
          </div>

          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <FlagImg code={user.country_code} name={user.country_name} size={16} />
              Você ({user.country_name})
            </div>
            <div className="grid grid-cols-24 gap-0.5">
              {rows.map((r) => (
                <div
                  key={r.userHour}
                  title={`${r.userHour}:00 no seu fuso`}
                  className={`h-7 rounded-sm ${cellClass(r.uState)} ${
                    r.userHour === userNow.hour ? "ring-2 ring-ring" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <FlagImg code={lead.country_code} name={lead.country_name} size={16} />
              Lead ({lead.country_name})
            </div>
            <div className="grid grid-cols-24 gap-0.5">
              {rows.map((r) => (
                <div
                  key={r.userHour}
                  title={`${r.leadHour}:00 no fuso do lead`}
                  className={`h-7 rounded-sm ${cellClass(r.lState)}`}
                />
              ))}
            </div>
            <div className="mt-1 grid grid-cols-24 gap-0.5 text-[10px] text-muted-foreground">
              {rows.map((r) => (
                <div key={r.userHour} className="text-center">
                  {r.leadHour}
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-1 text-xs text-muted-foreground">Interseção estimada ideal</div>
            <div className="grid grid-cols-24 gap-0.5">
              {rows.map((r) => (
                <div
                  key={r.userHour}
                  className={`h-4 rounded-sm ${
                    r.ideal ? "bg-status-high" : r.overlap ? "bg-status-high/25" : "bg-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 rounded-sm bg-status-high" /> pico de atividade
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 rounded-sm bg-status-high/30" /> horário comercial
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 rounded-sm bg-status-mid/50" /> almoço
        </span>
        <span className="flex items-center gap-1.5">
          <i className="inline-block h-3 w-3 rounded-sm bg-muted" /> fora da janela recomendada
        </span>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm">
        <h2 className="font-semibold">Resumo</h2>
        <p className="mt-2 text-muted-foreground">
          {idealRows.length > 0 ? (
            <>
              Melhor janela estimada no seu horário:{" "}
              <strong className="font-mono text-foreground">
                {idealRows[0]!.userHour}:00–{idealRows[idealRows.length - 1]!.userHour + 1}:00
              </strong>{" "}
              (corresponde a {idealRows[0]!.leadHour}:00 no fuso do lead).
            </>
          ) : overlapRows.length > 0 ? (
            <>
              Sem interseção com o pico do lead. Sobreposição comercial estimada:{" "}
              <strong className="font-mono text-foreground">
                {overlapRows[0]!.userHour}:00–{overlapRows[overlapRows.length - 1]!.userHour + 1}:00
              </strong>{" "}
              no seu horário.
            </>
          ) : (
            "Sem sobreposição de horário comercial estimada entre os dois países. Considere contato assíncrono, como e-mail ou mensagem."
          )}
        </p>
        {lead.cultural_notes && (
          <p className="mt-3 text-xs text-muted-foreground">Nota cultural: {lead.cultural_notes}</p>
        )}
      </div>
    </main>
  );
}

function ComparadorRoute() {
  return (
    <Suspense fallback={<div className="p-10 text-sm text-muted-foreground">Carregando…</div>}>
      <Comparador />
    </Suspense>
  );
}
