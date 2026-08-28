/**
 * Núcleo de inteligência de horário de contato.
 * Nenhum horário é hardcoded aqui: tudo vem de country_time_profiles.
 * Cálculos de fuso usam IANA timezone (DST correto), nunca offset fixo.
 */

export type Window = { start: string; end: string };

export type CountryTimeProfile = {
  country_code: string;
  country_name: string;
  timezone: string;
  utc_offset: string | null;
  business_hours_start: string;
  business_hours_end: string;
  working_days: number[];
  lunch_start: string | null;
  lunch_end: string | null;
  peak_hours: Window[];
  best_call_hours: Window[];
  best_whatsapp_hours: Window[];
  best_email_hours: Window[];
  best_contact_days: number[];
  holidays: string[];
  cultural_notes: string | null;
  data_confidence: "alta" | "media" | "baixa" | string;
};

export type ContactType = "call" | "whatsapp" | "email";
export type ActivityStatus = "alta" | "moderada" | "baixa" | "fora";

export const STATUS_META: Record<
  ActivityStatus,
  { dot: string; label: string; className: string }
> = {
  alta: { dot: "🟢", label: "Alta probabilidade de atividade", className: "text-status-high" },
  moderada: { dot: "🟡", label: "Atividade moderada estimada", className: "text-status-mid" },
  baixa: { dot: "🔴", label: "Baixa probabilidade de atividade", className: "text-status-low" },
  fora: { dot: "⚫", label: "Fora da janela recomendada", className: "text-status-off" },
};

/* ---------------- tempo ---------------- */

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.slice(0, 5).split(":").map(Number);
  return h * 60 + (m || 0);
}

export function fromMinutes(mins: number): string {
  const m = ((mins % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

export type ZonedParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0 = domingo
  minutesOfDay: number;
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getZonedParts(date: Date, timeZone: string): ZonedParts {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
  });
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]));
  const hour = Number(parts.hour) % 24;
  const minute = Number(parts.minute);
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour,
    minute,
    weekday: WEEKDAYS.indexOf(String(parts.weekday)),
    minutesOfDay: hour * 60 + minute,
  };
}

/** Converte uma hora "de parede" de um fuso em instante UTC (com DST). */
export function zonedWallToDate(
  timeZone: string,
  y: number,
  mo: number,
  d: number,
  minutesOfDay: number,
): Date {
  const target = Date.UTC(y, mo - 1, d, Math.floor(minutesOfDay / 60), minutesOfDay % 60);
  let guess = new Date(target);
  for (let i = 0; i < 3; i++) {
    const p = getZonedParts(guess, timeZone);
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
    const diff = target - asUtc;
    if (diff === 0) break;
    guess = new Date(guess.getTime() + diff);
  }
  return guess;
}

function inWindow(mins: number, w: Window): boolean {
  return mins >= toMinutes(w.start) && mins < toMinutes(w.end);
}

function inAnyWindow(mins: number, ws: Window[] | null | undefined): boolean {
  return (ws || []).some((w) => inWindow(mins, w));
}

export function windowsFor(profile: CountryTimeProfile, type: ContactType): Window[] {
  const map = {
    call: profile.best_call_hours,
    whatsapp: profile.best_whatsapp_hours,
    email: profile.best_email_hours,
  } as const;
  const ws = map[type];
  return ws && ws.length ? ws : profile.peak_hours || [];
}

function isHolidayToday(profile: CountryTimeProfile, p: ZonedParts): boolean {
  const key = `${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
  return (profile.holidays || []).includes(key);
}

/* ---------------- janela de contato ---------------- */

export type ResolvedWindow = {
  lead: ZonedParts;
  user: ZonedParts;
  leadTimeLabel: string;
  userTimeLabel: string;
  status: ActivityStatus;
  statusReason: string;
  isHoliday: boolean;
  isWorkingDay: boolean;
  nextWindow: Window | null;
  nextWindowIsTomorrow: boolean;
  nextWindowUserLabel: string | null;
  minutesUntilNextWindow: number | null;
  inWindowNow: boolean;
};

export function resolveContactWindow(
  userProfile: CountryTimeProfile,
  leadProfile: CountryTimeProfile,
  contactType: ContactType = "call",
  now: Date = new Date(),
): ResolvedWindow {
  const lead = getZonedParts(now, leadProfile.timezone);
  const user = getZonedParts(now, userProfile.timezone);

  const bizStart = toMinutes(leadProfile.business_hours_start);
  const bizEnd = toMinutes(leadProfile.business_hours_end);
  const mins = lead.minutesOfDay;

  const isWorkingDay = (leadProfile.working_days || []).includes(lead.weekday);
  const isHoliday = isHolidayToday(leadProfile, lead);
  const inBusiness = isWorkingDay && !isHoliday && mins >= bizStart && mins < bizEnd;
  const inLunch =
    leadProfile.lunch_start && leadProfile.lunch_end
      ? inWindow(mins, { start: leadProfile.lunch_start, end: leadProfile.lunch_end })
      : false;
  const inPeak = inBusiness && inAnyWindow(mins, leadProfile.peak_hours);
  const inChannel = inBusiness && inAnyWindow(mins, windowsFor(leadProfile, contactType));

  let status: ActivityStatus = "fora";
  let statusReason = "Fora do expediente local estimado";
  if (!isWorkingDay) {
    status = "fora";
    statusReason = "Dia não útil no país do lead";
  } else if (isHoliday) {
    status = "fora";
    statusReason = "Feriado local estimado";
  } else if (inPeak && inChannel) {
    status = "alta";
    statusReason = "Dentro da janela de pico e do canal escolhido";
  } else if (inPeak || inChannel) {
    status = "moderada";
    statusReason = "Dentro de uma janela recomendada";
  } else if (inBusiness && !inLunch) {
    status = "moderada";
    statusReason = "Horário comercial, fora do pico estimado";
  } else if (inBusiness && inLunch) {
    status = "baixa";
    statusReason = "Horário de almoço local";
  }

  // próxima janela ideal (hoje, senão próximo dia útil)
  const channelWindows = [...windowsFor(leadProfile, contactType)].sort(
    (a, b) => toMinutes(a.start) - toMinutes(b.start),
  );
  let nextWindow: Window | null = null;
  let nextWindowIsTomorrow = false;
  let dayOffset = 0;

  if (isWorkingDay && !isHoliday) {
    nextWindow = channelWindows.find((w) => toMinutes(w.end) > mins) ?? null;
  }
  if (!nextWindow && channelWindows.length) {
    for (let i = 1; i <= 7; i++) {
      const probe = new Date(now.getTime() + i * 86400000);
      const p = getZonedParts(probe, leadProfile.timezone);
      if ((leadProfile.working_days || []).includes(p.weekday) && !isHolidayToday(leadProfile, p)) {
        nextWindow = channelWindows[0];
        nextWindowIsTomorrow = true;
        dayOffset = i;
        break;
      }
    }
  }

  let nextWindowUserLabel: string | null = null;
  let minutesUntilNextWindow: number | null = null;

  if (nextWindow) {
    const base = new Date(now.getTime() + dayOffset * 86400000);
    const bp = getZonedParts(base, leadProfile.timezone);
    const startDate = zonedWallToDate(
      leadProfile.timezone,
      bp.year,
      bp.month,
      bp.day,
      toMinutes(nextWindow.start),
    );
    const endDate = zonedWallToDate(
      leadProfile.timezone,
      bp.year,
      bp.month,
      bp.day,
      toMinutes(nextWindow.end),
    );
    const us = getZonedParts(startDate, userProfile.timezone);
    const ue = getZonedParts(endDate, userProfile.timezone);
    nextWindowUserLabel = `${fromMinutes(us.minutesOfDay)}–${fromMinutes(ue.minutesOfDay)}`;
    minutesUntilNextWindow = Math.max(0, Math.round((startDate.getTime() - now.getTime()) / 60000));
  }

  return {
    lead,
    user,
    leadTimeLabel: fromMinutes(lead.minutesOfDay),
    userTimeLabel: fromMinutes(user.minutesOfDay),
    status,
    statusReason,
    isHoliday,
    isWorkingDay,
    nextWindow,
    nextWindowIsTomorrow,
    nextWindowUserLabel,
    minutesUntilNextWindow,
    inWindowNow: inChannel,
  };
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "agora";
  const d = Math.floor(minutes / 1440);
  const h = Math.floor((minutes % 1440) / 60);
  const m = minutes % 60;
  if (d > 0) return `${d}d ${h}h`;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min`;
}

/* ---------------- score de oportunidade ---------------- */

export type ScoreFactor = { key: string; label: string; weight: number; value: number };
export type OpportunityScore = {
  score: number;
  label: string;
  topFactor: string;
  factors: ScoreFactor[];
};

const FAVORABLE_NICHES = ["saas", "tecnologia", "agência", "agencia", "e-commerce", "serviços", "servicos"];

export function computeOpportunityScore(params: {
  leadProfile: CountryTimeProfile;
  resolved: ResolvedWindow;
  contactType: ContactType;
  niche?: string | null;
  responseRate?: number | null; // 0..1
}): OpportunityScore {
  const { leadProfile, resolved, contactType, niche, responseRate } = params;
  const mins = resolved.lead.minutesOfDay;
  const inBusiness =
    resolved.isWorkingDay &&
    !resolved.isHoliday &&
    mins >= toMinutes(leadProfile.business_hours_start) &&
    mins < toMinutes(leadProfile.business_hours_end);

  const factors: ScoreFactor[] = [
    { key: "business", label: "Horário comercial local", weight: 20, value: inBusiness ? 1 : 0 },
    {
      key: "peak",
      label: "Janela de pico de atividade",
      weight: 25,
      value: inBusiness && inAnyWindow(mins, leadProfile.peak_hours) ? 1 : 0,
    },
    {
      key: "weekday",
      label: "Dia da semana favorável",
      weight: 10,
      value: (leadProfile.best_contact_days || []).includes(resolved.lead.weekday)
        ? 1
        : resolved.isWorkingDay
          ? 0.5
          : 0,
    },
    { key: "holiday", label: "Sem feriado local", weight: 10, value: resolved.isHoliday ? 0 : 1 },
    {
      key: "channel",
      label: "Canal casa com a melhor janela",
      weight: 15,
      value: inBusiness && inAnyWindow(mins, windowsFor(leadProfile, contactType)) ? 1 : 0,
    },
  ];

  if (niche) {
    factors.push({
      key: "niche",
      label: "Nicho da empresa",
      weight: 10,
      value: FAVORABLE_NICHES.some((n) => niche.toLowerCase().includes(n)) ? 1 : 0.5,
    });
  }
  if (typeof responseRate === "number") {
    factors.push({
      key: "history",
      label: "Histórico de resposta",
      weight: 10,
      value: Math.max(0, Math.min(1, responseRate)),
    });
  }

  // Redistribui peso proporcionalmente quando faltam dados (nunca zera o score).
  const totalWeight = factors.reduce((s, f) => s + f.weight, 0);
  const scale = 100 / totalWeight;
  const score = Math.round(factors.reduce((s, f) => s + f.value * f.weight * scale, 0));

  const top = [...factors].sort((a, b) => b.value * b.weight - a.value * a.weight)[0];
  const label =
    score >= 75
      ? "Janela estimada muito favorável"
      : score >= 50
        ? "Janela estimada favorável"
        : score >= 30
          ? "Janela estimada fraca"
          : "Fora da janela recomendada";

  return { score, label, topFactor: top ? top.label : "—", factors };
}

/* ---------------- bandeiras ---------------- */

export function flagEmoji(code: string): string {
  if (!code || code.length !== 2 || code === "DE".slice(0, 0)) return "🏳️";
  if (!/^[A-Z]{2}$/.test(code)) return "🏳️";
  return String.fromCodePoint(...[...code].map((c) => 0x1f1e6 + c.charCodeAt(0) - 65));
}
