-- Revoke direct execution of internal functions from public/signed-in roles.
-- Triggers still run them internally; this only blocks direct API calls.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated, public;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM anon, authenticated, public;
-- has_role must stay callable by signed-in users (it powers the admin policies),
-- but anonymous visitors don't need it.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, public;