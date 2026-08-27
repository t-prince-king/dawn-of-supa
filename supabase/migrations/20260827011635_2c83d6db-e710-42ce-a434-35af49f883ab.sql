DROP POLICY IF EXISTS "Anyone can view available listings" ON public.listings;
CREATE POLICY "Anyone can view listings still up for grabs"
ON public.listings
FOR SELECT
TO anon, authenticated
USING (
  (status <> 'taken' AND expires_at > now())
  OR auth.uid() = user_id
);