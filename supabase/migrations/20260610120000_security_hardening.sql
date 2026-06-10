-- Security hardening
--
-- 1. Billing bypass: "Users can update their own subscription" let the client
--    write pitches_used / emails_used to any value (e.g. reset to 0 for
--    unlimited usage). Replace direct client writes with SECURITY DEFINER
--    functions that only ever increment by 1, atomically. Plan/limit changes
--    are made by the check-subscription edge function using the service role,
--    which bypasses RLS, so no user UPDATE policy is needed.
DROP POLICY IF EXISTS "Users can update their own subscription" ON public.subscriptions;

CREATE OR REPLACE FUNCTION public.increment_pitch_usage()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.subscriptions
  SET pitches_used = pitches_used + 1
  WHERE user_id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.increment_email_usage()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.subscriptions
  SET emails_used = emails_used + 1
  WHERE user_id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.increment_pitch_usage() FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.increment_email_usage() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.increment_pitch_usage() TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_email_usage() TO authenticated;

-- 2. Defense in depth: usage counters can never go negative.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscriptions_usage_nonneg') THEN
    UPDATE public.subscriptions SET pitches_used = 0 WHERE pitches_used < 0;
    UPDATE public.subscriptions SET emails_used = 0 WHERE emails_used < 0;
    ALTER TABLE public.subscriptions
      ADD CONSTRAINT subscriptions_usage_nonneg
      CHECK (pitches_used >= 0 AND emails_used >= 0);
  END IF;
EXCEPTION WHEN others THEN
  RAISE NOTICE 'Skipping subscriptions usage check: %', SQLERRM;
END $$;

-- 3. Referential integrity: several user_id columns had no foreign key, so rows
--    were orphaned when a user was deleted. Cascade-delete them with the user.
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'subscriptions', 'leads', 'outreach_emails', 'email_connections',
    'email_templates', 'outreach_settings'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF to_regclass('public.' || t) IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = t || '_user_id_fkey') THEN
      BEGIN
        EXECUTE format(
          'DELETE FROM public.%I x WHERE NOT EXISTS (SELECT 1 FROM auth.users u WHERE u.id = x.user_id)',
          t
        );
        EXECUTE format(
          'ALTER TABLE public.%I ADD CONSTRAINT %I FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE',
          t, t || '_user_id_fkey'
        );
      EXCEPTION WHEN others THEN
        RAISE NOTICE 'Skipping FK on %: %', t, SQLERRM;
      END;
    END IF;
  END LOOP;
END $$;

-- 4. A previous migration seeded a hardcoded admin user_id that only exists in
--    the template author's project. In a buyer's database it is an orphaned row
--    that grants admin to a stranger's UUID if that id is ever registered.
--    Remove it; buyers assign their own admin after signup.
DELETE FROM public.user_roles
WHERE user_id = '95a6d010-4297-4599-a3ef-6ad4eb7470b2'
  AND NOT EXISTS (
    SELECT 1 FROM auth.users u WHERE u.id = '95a6d010-4297-4599-a3ef-6ad4eb7470b2'
  );
