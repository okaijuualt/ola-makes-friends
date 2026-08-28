CREATE TABLE public.prospect_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  niche text NOT NULL,
  country_codes text[] NOT NULL DEFAULT '{}',
  requested integer NOT NULL DEFAULT 10,
  found integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.leads (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id uuid REFERENCES public.prospect_runs(id) ON DELETE SET NULL,
  name text NOT NULL,
  role text,
  company text NOT NULL,
  website text,
  niche text NOT NULL,
  country_code text NOT NULL,
  city text,
  email text,
  phone text,
  linkedin text,
  response_rate numeric,
  source text NOT NULL DEFAULT 'ai_prospect',
  note text,
  search_query text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX leads_created_at_idx ON public.leads (created_at DESC);
CREATE INDEX leads_country_idx ON public.leads (country_code);

GRANT SELECT ON public.leads TO anon, authenticated;
GRANT ALL ON public.leads TO service_role;
GRANT SELECT ON public.prospect_runs TO anon, authenticated;
GRANT ALL ON public.prospect_runs TO service_role;

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prospect_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leads sao publicos para leitura" ON public.leads FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Buscas sao publicas para leitura" ON public.prospect_runs FOR SELECT TO anon, authenticated USING (true);