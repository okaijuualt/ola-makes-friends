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
  created_at: string;
};

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
