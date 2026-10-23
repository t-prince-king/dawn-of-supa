CREATE TABLE public.terms_acceptances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tos_version TEXT NOT NULL,
  privacy_version TEXT NOT NULL,
  accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tos_version, privacy_version)
);

GRANT SELECT, INSERT ON public.terms_acceptances TO authenticated;
GRANT ALL ON public.terms_acceptances TO service_role;

ALTER TABLE public.terms_acceptances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own terms acceptance"
ON public.terms_acceptances
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can record their own terms acceptance"
ON public.terms_acceptances
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);