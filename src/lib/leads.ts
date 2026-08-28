import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CapturedLead = {
  id: string;
  run_id: string | null;
  name: string;
  role: string | null;
  company: string;
  website: string | null;
  niche: string;
  country_code: string;
  city: string | null;
  email: string | null;
  phone: string | null;
  linkedin: string | null;
  response_rate: number | null;
  source: string;
  note: string | null;
  search_query: string | null;
  website_status: number | null;
  website_checked_at: string | null;
  created_at: string;
};

export type SiteHealth = {
  rank: number; // lower = better
  label: string;
  tone: string;
  title: string;
};

export function siteHealth(lead: Pick<CapturedLead, "website" | "website_status">): SiteHealth {
  if (!lead.website)
    return {
      rank: 2,
      label: "sem site",
      tone: "border-border text-muted-foreground",
      title: "Nenhum site informado para este lead",
    };
  const s = lead.website_status;
  if (s === null)
    return {
      rank: 1,
      label: "não verificado",
      tone: "border-border text-muted-foreground",
      title: "Site ainda não verificado",
    };
  if (s >= 200 && s < 400)
    return {
      rank: 0,
      label: "site ok",
      tone: "border-status-high/40 text-status-high bg-status-high/10",
      title: `Site respondeu ${s}`,
    };
  if (s === 0)
    return {
      rank: 4,
      label: "site inacessível",
      tone: "border-status-off/40 text-status-off bg-muted/40",
      title: "Sem resposta (timeout ou domínio inválido)",
    };
  if (s >= 500)
    return {
      rank: 3,
      label: `site fora do ar (${s})`,
      tone: "border-status-low/40 text-status-low bg-status-low/10",
      title: `Erro de servidor ${s} — provavelmente temporário`,
    };
  return {
    rank: 3,
    label: `site com erro (${s})`,
    tone: "border-status-mid/40 text-status-mid bg-status-mid/10",
    title: `Resposta ${s}`,
  };
}


export const leadsQueryOptions = queryOptions({
  queryKey: ["leads"],
  queryFn: async (): Promise<CapturedLead[]> => {
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return (data ?? []) as unknown as CapturedLead[];
  },
});

export type ProspectRun = {
  id: string;
  niche: string;
  country_codes: string[];
  requested: number;
  found: number;
  status: string;
  notes: string | null;
  created_at: string;
};

export const runsQueryOptions = queryOptions({
  queryKey: ["prospect_runs"],
  queryFn: async (): Promise<ProspectRun[]> => {
    const { data, error } = await supabase
      .from("prospect_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) throw error;
    return (data ?? []) as unknown as ProspectRun[];
  },
});
