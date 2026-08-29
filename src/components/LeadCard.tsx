import {
  computeOpportunityScore,
  flagEmoji,
  formatDuration,
  resolveContactWindow,
  STATUS_META,
  type ContactType,
  type CountryTimeProfile,
} from "@/lib/timeIntel";
import type { Lead } from "@/lib/demoLeads";

type Props = {
  lead: Lead;
  leadProfile: CountryTimeProfile;
  userProfile: CountryTimeProfile;
  contactType: ContactType;
  clockView: "lead" | "user" | "both";
  now: Date;
  onDelete?: () => void;
};


function scoreTone(score: number) {
  if (score >= 75) return "text-status-high border-status-high/40 bg-status-high/10";
  if (score >= 50) return "text-status-mid border-status-mid/40 bg-status-mid/10";
  if (score >= 30) return "text-status-low border-status-low/40 bg-status-low/10";
  return "text-status-off border-border bg-muted/40";
}

export function LeadCard({
  lead,
  leadProfile,
  userProfile,
  contactType,
  clockView,
  now,
}: Props) {
  const resolved = resolveContactWindow(userProfile, leadProfile, contactType, now);
  const score = computeOpportunityScore({
    leadProfile,
    resolved,
    contactType,
    niche: lead.niche,
    responseRate: lead.response_rate,
  });
  const status = STATUS_META[resolved.status];
  const isFallback = leadProfile.country_code === "DEFAULT";

  return (
    <article className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-ring/60">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-card-foreground">{lead.name}</h3>
          <p className="truncate text-sm text-muted-foreground">
            {lead.company} · {lead.niche}
          </p>
        </div>
        <div
          className={`shrink-0 rounded-lg border px-3 py-1.5 text-right ${scoreTone(score.score)}`}
        >
          <div className="text-lg font-bold leading-none">{score.score}</div>
          <div className="text-[10px] uppercase tracking-wide opacity-80">/100</div>
        </div>
      </header>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <span className="text-lg" aria-hidden>
          {flagEmoji(lead.country_code)}
        </span>
        <span className="text-card-foreground">{leadProfile.country_name}</span>
        {isFallback && (
          <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">
            confiança baixa
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        {(clockView === "lead" || clockView === "both") && (
          <div>
            <div className="text-xs text-muted-foreground">Hora do lead</div>
            <div className="font-mono text-lg text-card-foreground">{resolved.leadTimeLabel}</div>
          </div>
        )}
        {(clockView === "user" || clockView === "both") && (
          <div>
            <div className="text-xs text-muted-foreground">Sua hora</div>
            <div className="font-mono text-lg text-card-foreground">{resolved.userTimeLabel}</div>
          </div>
        )}
      </div>

      <p className={`mt-3 text-sm font-medium ${status.className}`}>
        {status.dot} {status.label}
      </p>
      <p className="text-xs text-muted-foreground">{resolved.statusReason}</p>

      <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Melhor janela estimada</dt>
          <dd className="font-mono text-card-foreground">
            {resolved.nextWindow
              ? `${resolved.nextWindow.start.slice(0, 5)}–${resolved.nextWindow.end.slice(0, 5)}${
                  resolved.nextWindowIsTomorrow ? " (próx. dia útil)" : ""
                }`
              : "sem janela estimada"}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">No seu fuso</dt>
          <dd className="font-mono text-card-foreground">{resolved.nextWindowUserLabel ?? "—"}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Tempo até a janela</dt>
          <dd className="font-mono text-card-foreground">
            {resolved.minutesUntilNextWindow === null
              ? "—"
              : formatDuration(resolved.minutesUntilNextWindow)}
          </dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-muted-foreground">Fator de maior peso</dt>
          <dd className="text-right text-card-foreground">{score.topFactor}</dd>
        </div>
      </dl>

      <p className="mt-3 text-xs text-muted-foreground">{score.label}</p>
    </article>
  );
}
