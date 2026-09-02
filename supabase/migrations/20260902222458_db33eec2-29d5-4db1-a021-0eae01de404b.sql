ALTER TABLE public.listings
  ADD COLUMN IF NOT EXISTS is_free boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS price numeric(10,2);

ALTER TABLE public.listings
  ADD CONSTRAINT listings_price_required_when_for_sale
  CHECK (is_free OR (price IS NOT NULL AND price > 0));