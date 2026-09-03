import {
  computeOpportunityScore,
  formatDuration,
  resolveContactWindow,
  STATUS_META,
  type ContactType,
  type CountryTimeProfile,
} from "@/lib/timeIntel";
import type { Lead } from "@/lib/demoLeads";
import { FlagImg } from "@/components/CountrySelect";

type Props = {
  lead: Lead;
  leadProfile: CountryTimeProfile;
  userProfile: CountryTimeProfile;
  contactType: ContactType;
  clockView: "lead" | "user" | "both";
  now: Date;
  onDelete?: (() => void) | undefined;
};

function scoreTone(score: number) {
  if (score >= 75) return "text-status-high border-status-high/40 bg-status-high/10";
  if (score >= 50) return "text-status-mid border-status-mid/40 bg-status-mid/10";
  if (score >= 30) return "text-status-low border-status-low/40 bg-status-low/10";
  return "text-status-off border-border bg-muted/40";
}

function readableScoreLabel(score: number, status: string) {
  if (status === "fora") return "Fora do horário de contato";
  if (score >= 75) return "Ótimo momento para contatar";
  if (score >= 50) return "Atividade moderada";
  if (score >= 30) return "Momento menos favorável";
  return "Baixa atividade";
}

export function LeadCard({ lead, leadProfile, userProfile, contactType, clockView, now, onDelete }: Props) {
  const resolved = resolveContactWindow(userProfile, leadProfile, contactType, now);
  const score = computeOpportunityScore({ leadProfile, resolved, contactType, niche: lead.niche, responseRate: lead.response_rate });
  const status = STATUS_META[resolved.status];
  const isFallback = leadProfile.country_code === "DEFAULT";
  const readableLabel = readableScoreLabel(score.score, resolved.status);

  return (
    <article className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-ring/60">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-card-foreground">{lead.name}</h3>
          <p className="truncate text-sm text-muted-foreground">{lead.company} · {lead.niche}</p>
        </div>
        <div className={`shrink-0 max-w-[210px] rounded-lg border px-3 py-2 ${scoreTone(score.score)}`}>
          <div className="text-sm font-semibold leading-tight">{readableLabel}</div>
          <div className="mt-1 text-[11px] leading-snug opacity-80">{resolved.statusReason}</div>
        </div>
      </header>

      <div className="mt-4 flex items-center gap-2 text-sm">
        <FlagImg code={lead.country_code} name={leadProfile.country_name} size={20} />
        <span className="text-card-foreground">{leadProfile.country_name}</span>
        {isFallback && <span className="rounded border border-border px-1.5 py-0.5 text-[10px] uppercase text-muted-foreground">confiança baixa</span>}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
        {(clockView === "lead" || clockView === "both") && <div><div className="text-xs text-muted-foreground">Hora do lead</div><div className="font-sans text-lg text-card-foreground">{resolved.leadTimeLabel}</div></div>}
        {(clockView === "user" || clockView === "both") && <div><div className="text-xs text-muted-foreground">Sua hora</div><div className="font-sans text-lg text-card-foreground">{resolved.userTimeLabel}</div></div>}
      </div>

      <p className={`mt-3 text-sm font-medium ${status.className}`}>{status.dot} {status.label}</p>
      <p className="text-xs text-muted-foreground">{resolved.statusReason}</p>

      <dl className="mt-4 space-y-1.5 border-t border-border pt-3 text-xs">
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Melhor janela estimada</dt><dd className="font-sans text-card-foreground">{resolved.nextWindow ? `${resolved.nextWindow.start.slice(0, 5)}–${resolved.nextWindow.end.slice(0, 5)}${resolved.nextWindowIsTomorrow ? " (próx. dia útil)" : ""}` : "sem janela estimada"}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">No seu fuso</dt><dd className="font-sans text-card-foreground">{resolved.nextWindowUserLabel ?? "—"}</dd></div>
        <div className="flex justify-between gap-2"><dt className="text-muted-foreground">Tempo até a janela</dt><dd className="font-sans text-card-foreground">{resolved.minutesUntilNextWindow === null ? "—" : formatDuration(resolved.minutesUntilNextWindow)}</dd></div>
      </dl>

      {(lead.website || lead.email || lead.phone || lead.linkedin) && (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
          {lead.website && <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-card-foreground hover:border-ring/60"><span className="emoji" aria-hidden>🌐</span> Site</a>}
          {lead.phone && <><a href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`} className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-card-foreground hover:border-ring/60"><span className="emoji" aria-hidden>📞</span> Ligar</a><a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded border border-status-high/40 bg-status-high/10 px-2 py-1 text-[11px] text-status-high hover:border-status-high/70"><span className="emoji" aria-hidden>💬</span> WhatsApp</a></>}
          {lead.email && <a href={`mailto:${lead.email}`} className="inline-flex max-w-full items-center gap-1 truncate rounded border border-border px-2 py-1 text-[11px] text-card-foreground hover:border-ring/60"><span className="emoji" aria-hidden>✉️</span> {lead.email}</a>}
          {lead.linkedin && <a href={lead.linkedin.startsWith("http") ? lead.linkedin : `https://${lead.linkedin}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded border border-border px-2 py-1 text-[11px] text-card-foreground hover:border-ring/60">in LinkedIn</a>}
        </div>
      )}

      {onDelete && <div className="mt-3 flex justify-end"><button type="button" onClick={onDelete} aria-label={`Remover lead ${lead.name}`} className="shrink-0 rounded border border-border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground hover:border-destructive/50 hover:text-destructive">remover</button></div>}
    </article>
  );
}
