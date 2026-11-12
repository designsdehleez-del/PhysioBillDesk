-- ==============================================================================
-- PHYSIOBILLDESK: PRODUCTION DATABASE & RLS UNBLOCK SCRIPT
-- Run this in the Supabase SQL Editor (https://supabase.com/dashboard/project/wciqtvqxvhrcgbkopqsk/sql)
--
-- Why is this needed?
-- The Next.js frontend connects via the public Anon client without Supabase Auth JWTs.
-- Restricting policies to 'TO authenticated' blocked all clinic queries (centres, doctors,
-- patients, visits, expenses, feedback) with 0 rows or Postgres RLS error 42501.
-- This script safely grants operational access to 'anon, authenticated'.
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

CREATE TABLE IF NOT EXISTS public.patient_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number text,
  patient_uid text,
  patient_name text,
  patient_phone text,
  doctor_name text,
  centre_name text,
  rating integer,
  treatment_rating integer,
  hygiene_rating integer,
  staff_rating integer,
  wait_time_rating integer,
  comments text,
  improvement_areas text[],
  recommend_score integer,
  answers jsonb,
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

-- 2. Drop restrictive policies
DROP POLICY IF EXISTS centres_read ON public.centres;
DROP POLICY IF EXISTS centres_admin_write ON public.centres;
DROP POLICY IF EXISTS centres_all ON public.centres;

DROP POLICY IF EXISTS services_read ON public.services;
DROP POLICY IF EXISTS services_admin_write ON public.services;
DROP POLICY IF EXISTS services_all ON public.services;

DROP POLICY IF EXISTS doctors_read ON public.doctors;
DROP POLICY IF EXISTS doctors_admin_write ON public.doctors;
DROP POLICY IF EXISTS doctors_all ON public.doctors;

DROP POLICY IF EXISTS physiotherapists_read ON public.physiotherapists;
DROP POLICY IF EXISTS physiotherapists_admin_write ON public.physiotherapists;
DROP POLICY IF EXISTS physiotherapists_all ON public.physiotherapists;

DROP POLICY IF EXISTS discount_presets_read ON public.discount_presets;
DROP POLICY IF EXISTS discount_presets_admin_write ON public.discount_presets;
DROP POLICY IF EXISTS discount_presets_all ON public.discount_presets;

DROP POLICY IF EXISTS package_presets_read ON public.package_presets;
DROP POLICY IF EXISTS package_presets_admin_write ON public.package_presets;
DROP POLICY IF EXISTS package_presets_all ON public.package_presets;

DROP POLICY IF EXISTS patients_select ON public.patients;
DROP POLICY IF EXISTS patients_insert ON public.patients;
DROP POLICY IF EXISTS patients_update ON public.patients;
DROP POLICY IF EXISTS patients_admin_delete ON public.patients;
DROP POLICY IF EXISTS patients_all ON public.patients;

DROP POLICY IF EXISTS visits_select ON public.visits;
DROP POLICY IF EXISTS visits_insert ON public.visits;
DROP POLICY IF EXISTS visits_update ON public.visits;
DROP POLICY IF EXISTS visits_delete ON public.visits;
DROP POLICY IF EXISTS visits_all ON public.visits;

DROP POLICY IF EXISTS visit_services_all ON public.visit_services;
DROP POLICY IF EXISTS patient_package_credits_all ON public.patient_package_credits;
DROP POLICY IF EXISTS uid_counters_authenticated ON public.uid_counters;
DROP POLICY IF EXISTS uid_counters_all ON public.uid_counters;

DROP POLICY IF EXISTS clinic_expenses_select ON public.clinic_expenses;
DROP POLICY IF EXISTS clinic_expenses_insert ON public.clinic_expenses;
DROP POLICY IF EXISTS clinic_expenses_update ON public.clinic_expenses;
DROP POLICY IF EXISTS clinic_expenses_delete ON public.clinic_expenses;
DROP POLICY IF EXISTS "Allow public read clinic_expenses" ON public.clinic_expenses;
DROP POLICY IF EXISTS "Allow public insert clinic_expenses" ON public.clinic_expenses;
DROP POLICY IF EXISTS "Allow public update clinic_expenses" ON public.clinic_expenses;
DROP POLICY IF EXISTS "Allow public delete clinic_expenses" ON public.clinic_expenses;

DROP POLICY IF EXISTS patient_feedback_anon_insert ON public.patient_feedback;
DROP POLICY IF EXISTS patient_feedback_staff_select ON public.patient_feedback;
DROP POLICY IF EXISTS patient_feedback_all ON public.patient_feedback;

DROP POLICY IF EXISTS audit_logs_insert ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_admin_select ON public.audit_logs;
DROP POLICY IF EXISTS audit_logs_all ON public.audit_logs;

-- 3. Enable RLS on all tables
ALTER TABLE public.centres ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.physiotherapists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_package_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uid_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 4. Apply clean, working policies for anon + authenticated

-- Reference Tables (Centres, Services, Doctors, Physiotherapists, Presets)
CREATE POLICY centres_read ON public.centres FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY centres_write ON public.centres FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY services_read ON public.services FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY services_write ON public.services FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY doctors_read ON public.doctors FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY doctors_write ON public.doctors FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY physiotherapists_read ON public.physiotherapists FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY physiotherapists_write ON public.physiotherapists FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

CREATE POLICY discount_presets_all ON public.discount_presets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY package_presets_all ON public.package_presets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Patients
CREATE POLICY patients_all ON public.patients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Visits & Billing
CREATE POLICY visits_all ON public.visits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY visit_services_all ON public.visit_services FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY patient_package_credits_all ON public.patient_package_credits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY uid_counters_all ON public.uid_counters FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Expenses
CREATE POLICY clinic_expenses_all ON public.clinic_expenses FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Patient Feedback (both submission from patient phone and viewing from clinic dashboard)
CREATE POLICY patient_feedback_all ON public.patient_feedback FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Audit Logs
CREATE POLICY audit_logs_all ON public.audit_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. Storage Buckets & Policies
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('expense-receipts', 'expense-receipts', true),
  ('broadcast-media', 'broadcast-media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS storage_upload_expense_receipts ON storage.objects;
DROP POLICY IF EXISTS storage_read_expense_receipts ON storage.objects;
DROP POLICY IF EXISTS storage_delete_expense_receipts ON storage.objects;
DROP POLICY IF EXISTS storage_read_broadcast_media ON storage.objects;
DROP POLICY IF EXISTS storage_upload_broadcast_media ON storage.objects;
DROP POLICY IF EXISTS "Public read expense-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public upload expense-receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public read broadcast-media" ON storage.objects;
DROP POLICY IF EXISTS "Public upload broadcast-media" ON storage.objects;

CREATE POLICY "Public read expense-receipts" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'expense-receipts');

CREATE POLICY "Public upload expense-receipts" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'expense-receipts');

CREATE POLICY "Public read broadcast-media" ON storage.objects
  FOR SELECT TO anon, authenticated USING (bucket_id = 'broadcast-media');

CREATE POLICY "Public upload broadcast-media" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'broadcast-media');
