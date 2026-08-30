-- Purge previously shared (unscoped) data
DELETE FROM public.leads;
DELETE FROM public.prospect_runs;

ALTER TABLE public.leads ADD COLUMN user_id uuid NOT NULL;
ALTER TABLE public.prospect_runs ADD COLUMN user_id uuid NOT NULL;

CREATE INDEX leads_user_id_idx ON public.leads (user_id);
CREATE INDEX prospect_runs_user_id_idx ON public.prospect_runs (user_id);

DROP POLICY IF EXISTS "Leads sao publicos para leitura" ON public.leads;
DROP POLICY IF EXISTS "Buscas sao publicas para leitura" ON public.prospect_runs;

REVOKE ALL ON public.leads FROM anon;
REVOKE ALL ON public.prospect_runs FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.prospect_runs TO authenticated;
GRANT ALL ON public.leads TO service_role;
GRANT ALL ON public.prospect_runs TO service_role;

CREATE POLICY "Usuarios gerenciam seus proprios leads"
  ON public.leads FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuarios gerenciam suas proprias buscas"
  ON public.prospect_runs FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);