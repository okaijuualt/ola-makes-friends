ALTER TABLE public.leads ADD COLUMN IF NOT EXISTS last_used_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.prospect_runs ADD COLUMN IF NOT EXISTS last_used_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS leads_last_used_at_idx ON public.leads (last_used_at);
CREATE INDEX IF NOT EXISTS prospect_runs_last_used_at_idx ON public.prospect_runs (last_used_at);

CREATE OR REPLACE FUNCTION public.purge_stale_leads()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  removed integer;
BEGIN
  DELETE FROM public.leads WHERE last_used_at < now() - interval '12 hours';
  GET DIAGNOSTICS removed = ROW_COUNT;
  DELETE FROM public.prospect_runs WHERE last_used_at < now() - interval '12 hours';
  RETURN removed;
END;
$$;

REVOKE ALL ON FUNCTION public.purge_stale_leads() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purge_stale_leads() TO service_role;

CREATE OR REPLACE FUNCTION public.touch_leads(_ids uuid[])
RETURNS void
LANGUAGE sql
SECURITY INVOKER
SET search_path = public
AS $$
  UPDATE public.leads
     SET last_used_at = now()
   WHERE id = ANY(_ids) AND user_id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION public.touch_leads(uuid[]) TO authenticated;

CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.unschedule('purge-stale-leads') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'purge-stale-leads');
SELECT cron.schedule('purge-stale-leads', '*/15 * * * *', $$SELECT public.purge_stale_leads();$$);