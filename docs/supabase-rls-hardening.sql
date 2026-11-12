-- ==============================================================================
-- PHYSIOBILLDESK: PRODUCTION SECURITY & RLS SCRIPT (CLEAN & SELF-HEALING)
-- ==============================================================================

-- 1. Ensure required tables exist
CREATE TABLE IF NOT EXISTS public.physiotherapists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  specialization text,
  phone text,
  email text,
  centre_id uuid REFERENCES public.centres(id) ON DELETE SET NULL,
  centre_name text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clinic_expenses (
  id text PRIMARY KEY,
  expense_date date NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  centre_id text,
  centre_name text,
  logged_by_name text,
  payment_method text DEFAULT 'UPI',
  receipt_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id text PRIMARY KEY,
  timestamp timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  category text NOT NULL,
  severity text NOT NULL,
  actor_name text NOT NULL,
  actor_email text NOT NULL,
  actor_role text NOT NULL,
  centre_name text,
  resource_id text,
  resource_name text,
  details text NOT NULL,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Helper functions for JWT claims
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT coalesce(
    auth.jwt() -> 'app_metadata' ->> 'role',
    auth.jwt() -> 'user_metadata' ->> 'role',
    'anon'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_auth_centre_id()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT coalesce(
    auth.jwt() -> 'app_metadata' ->> 'centre_id',
    auth.jwt() -> 'user_metadata' ->> 'centre_id',
    null
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT public.get_auth_role() = 'admin';
$$;

-- 3. Clear old permissive policies
DROP POLICY IF EXISTS uid_counters_all ON public.uid_counters;
DROP POLICY IF EXISTS centres_all ON public.centres;
DROP POLICY IF EXISTS doctors_all ON public.doctors;
DROP POLICY IF EXISTS physiotherapists_all ON public.physiotherapists;
DROP POLICY IF EXISTS patients_all ON public.patients;
DROP POLICY IF EXISTS services_all ON public.services;
DROP POLICY IF EXISTS discount_presets_all ON public.discount_presets;
DROP POLICY IF EXISTS package_presets_all ON public.package_presets;
DROP POLICY IF EXISTS visits_all ON public.visits;
DROP POLICY IF EXISTS visit_services_all ON public.visit_services;
DROP POLICY IF EXISTS patient_package_credits_all ON public.patient_package_credits;
DROP POLICY IF EXISTS staff_users_all ON public.staff_users;
DROP POLICY IF EXISTS patient_feedback_all ON public.patient_feedback;
DROP POLICY IF EXISTS audit_logs_all ON public.audit_logs;
DROP POLICY IF EXISTS "Allow public read clinic_expenses" ON public.clinic_expenses;
DROP POLICY IF EXISTS "Allow public insert clinic_expenses" ON public.clinic_expenses;
DROP POLICY IF EXISTS "Allow public update clinic_expenses" ON public.clinic_expenses;
DROP POLICY IF EXISTS "Allow public delete clinic_expenses" ON public.clinic_expenses;
DROP POLICY IF EXISTS "Public read expense-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public upload expense-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public read broadcast-media" ON storage.objects;
DROP POLICY IF EXISTS "Public upload broadcast-media" ON storage.objects;

-- 4. Enable RLS
ALTER TABLE public.uid_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physiotherapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_package_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 5. Policies for reference tables (Centres, Services, Doctors, Physiotherapists)
CREATE POLICY centres_read ON public.centres
  FOR SELECT TO authenticated USING (true);
CREATE POLICY centres_admin_write ON public.centres
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY services_read ON public.services
  FOR SELECT TO authenticated USING (true);
CREATE POLICY services_admin_write ON public.services
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY doctors_read ON public.doctors
  FOR SELECT TO authenticated USING (true);
CREATE POLICY doctors_admin_write ON public.doctors
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY physiotherapists_read ON public.physiotherapists
  FOR SELECT TO authenticated USING (true);
CREATE POLICY physiotherapists_admin_write ON public.physiotherapists
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY discount_presets_read ON public.discount_presets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY discount_presets_admin_write ON public.discount_presets
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY package_presets_read ON public.package_presets
  FOR SELECT TO authenticated USING (true);
CREATE POLICY package_presets_admin_write ON public.package_presets
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 6. Policies for Patients (PHI)
CREATE POLICY patients_select ON public.patients
  FOR SELECT TO authenticated USING (true);
CREATE POLICY patients_insert ON public.patients
  FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY patients_update ON public.patients
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY patients_admin_delete ON public.patients
  FOR DELETE TO authenticated USING (public.is_admin());

-- 7. Policies for Visits & Billing
CREATE POLICY visits_select ON public.visits
  FOR SELECT TO authenticated
  USING (
    public.is_admin() OR 
    centre_id::text = public.get_auth_centre_id() OR
    public.get_auth_centre_id() IS NULL
  );

CREATE POLICY visits_insert ON public.visits
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin() OR 
    centre_id::text = public.get_auth_centre_id() OR
    public.get_auth_centre_id() IS NULL
  );

CREATE POLICY visits_update ON public.visits
  FOR UPDATE TO authenticated
  USING (public.is_admin() OR centre_id::text = public.get_auth_centre_id())
  WITH CHECK (public.is_admin() OR centre_id::text = public.get_auth_centre_id());

CREATE POLICY visits_delete ON public.visits
  FOR DELETE TO authenticated USING (public.is_admin());

CREATE POLICY visit_services_all ON public.visit_services
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY patient_package_credits_all ON public.patient_package_credits
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY uid_counters_authenticated ON public.uid_counters
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Policies for Clinic Expenses
CREATE POLICY clinic_expenses_select ON public.clinic_expenses
  FOR SELECT TO authenticated
  USING (
    public.is_admin() OR 
    centre_id = public.get_auth_centre_id()
  );

CREATE POLICY clinic_expenses_insert ON public.clinic_expenses
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_admin() OR 
    centre_id = public.get_auth_centre_id()
  );

CREATE POLICY clinic_expenses_update ON public.clinic_expenses
  FOR UPDATE TO authenticated
  USING (
    public.is_admin() OR 
    centre_id = public.get_auth_centre_id()
  );

CREATE POLICY clinic_expenses_delete ON public.clinic_expenses
  FOR DELETE TO authenticated USING (public.is_admin());

-- 9. Staff Users & Feedback & Audit Logs
CREATE POLICY staff_users_select ON public.staff_users
  FOR SELECT TO authenticated
  USING (public.is_admin() OR id = auth.uid());

CREATE POLICY staff_users_admin_manage ON public.staff_users
  FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY patient_feedback_anon_insert ON public.patient_feedback
  FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY patient_feedback_staff_select ON public.patient_feedback
  FOR SELECT TO authenticated
  USING (
    public.is_admin() OR 
    centre_name ILIKE '%' || (SELECT name FROM public.centres WHERE id::text = public.get_auth_centre_id()) || '%' OR
    public.get_auth_centre_id() IS NULL
  );

CREATE POLICY audit_logs_insert ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY audit_logs_admin_select ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_admin());

-- 10. Storage Buckets & Policies
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('expense-receipts', 'expense-receipts', false),
  ('broadcast-media', 'broadcast-media', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

CREATE POLICY storage_upload_expense_receipts ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'expense-receipts' AND
    (lower(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'pdf', 'webp'))
  );

CREATE POLICY storage_read_expense_receipts ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'expense-receipts');

CREATE POLICY storage_delete_expense_receipts ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'expense-receipts' AND public.is_admin());

CREATE POLICY storage_read_broadcast_media ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'broadcast-media');

CREATE POLICY storage_upload_broadcast_media ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'broadcast-media' AND public.is_admin());
