REVOKE ALL ON FUNCTION public.purge_stale_leads() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.purge_stale_leads() TO service_role;