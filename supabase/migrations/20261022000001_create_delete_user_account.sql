-- ========================================================================
-- Secure User Account Deletion Function
-- Allows an authenticated user to permanently delete their own account
-- from auth.users, cascading to profiles, daily_metrics, and recommendations.
-- ========================================================================

CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
BEGIN
  -- Get the current authenticated user ID from the JWT
  current_user_id := auth.uid();

  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Delete the user from auth.users
  -- Foreign key ON DELETE CASCADE automatically cleans up:
  -- • public.profiles
  -- • public.daily_metrics
  -- • public.recommendations
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;

-- Grant execution permission strictly to authenticated users
REVOKE ALL ON FUNCTION public.delete_user_account() FROM public;
REVOKE ALL ON FUNCTION public.delete_user_account() FROM anon;
GRANT EXECUTE ON FUNCTION public.delete_user_account() TO authenticated;
