ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS website_status integer,
  ADD COLUMN IF NOT EXISTS website_checked_at timestamptz;