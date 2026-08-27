-- Expiration + clearer availability states for listings
ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  ADD COLUMN IF NOT EXISTS pending_until timestamptz;

UPDATE public.listings SET status = 'available' WHERE status NOT IN ('available', 'pending', 'taken');

ALTER TABLE public.listings DROP CONSTRAINT IF EXISTS listings_status_check;
ALTER TABLE public.listings
  ADD CONSTRAINT listings_status_check CHECK (status IN ('available', 'pending', 'taken'));

CREATE INDEX IF NOT EXISTS listings_available_idx ON public.listings (status, expires_at DESC);