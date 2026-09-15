-- ============================================================
-- Physionautics Clinic Management System - Supabase Schema
-- Run this entire file in your Supabase SQL editor
-- ============================================================

-- 1. uid_counters
CREATE TABLE IF NOT EXISTS public.uid_counters (
  id               int  PRIMARY KEY DEFAULT 1,
  patient_counter  int  NOT NULL DEFAULT 0,
  bill_counter     int  NOT NULL DEFAULT 0,
  counter_month    text NOT NULL DEFAULT to_char(now(), 'YYYYMM'),
  CONSTRAINT single_row CHECK (id = 1)
);
INSERT INTO public.uid_counters (id, patient_counter, bill_counter, counter_month)
VALUES (1, 0, 0, to_char(now(), 'YYYYMM'))
ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.uid_counters ENABLE ROW LEVEL SECURITY;
CREATE POLICY uid_counters_select ON public.uid_counters FOR SELECT TO authenticated USING (true);
CREATE POLICY uid_counters_insert ON public.uid_counters FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY uid_counters_update ON public.uid_counters FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY uid_counters_delete ON public.uid_counters FOR DELETE TO authenticated USING (true);

-- 2. centres
CREATE TABLE IF NOT EXISTS public.centres (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  address    text,
  phone      text,
  email      text,
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.centres ENABLE ROW LEVEL SECURITY;
CREATE POLICY centres_select ON public.centres FOR SELECT TO authenticated USING (true);
CREATE POLICY centres_insert ON public.centres FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY centres_update ON public.centres FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY centres_delete ON public.centres FOR DELETE TO authenticated USING (true);

-- 3. doctors
CREATE TABLE IF NOT EXISTS public.doctors (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  specialization  text,
  phone           text,
  email           text,
  centre_id       uuid        REFERENCES public.centres(id) ON DELETE SET NULL,
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY doctors_select ON public.doctors FOR SELECT TO authenticated USING (true);
CREATE POLICY doctors_insert ON public.doctors FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY doctors_update ON public.doctors FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY doctors_delete ON public.doctors FOR DELETE TO authenticated USING (true);

-- 4. patients
CREATE TABLE IF NOT EXISTS public.patients (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  uid           text        UNIQUE NOT NULL,
  full_name     text        NOT NULL,
  age           int         NOT NULL CHECK (age >= 0 AND age <= 150),
  gender        text        NOT NULL CHECK (gender IN ('Male','Female','Other')),
  phone         text        NOT NULL,
  email         text,
  address       text,
  blood_group   text        CHECK (blood_group IN ('A+','A-','B+','B-','O+','O-','AB+','AB-')),
  medical_notes text,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY patients_select ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY patients_insert ON public.patients FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY patients_update ON public.patients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY patients_delete ON public.patients FOR DELETE TO authenticated USING (true);

-- 5. services
CREATE TABLE IF NOT EXISTS public.services (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  price      numeric     NOT NULL CHECK (price >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY services_select ON public.services FOR SELECT TO authenticated USING (true);
CREATE POLICY services_insert ON public.services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY services_update ON public.services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY services_delete ON public.services FOR DELETE TO authenticated USING (true);

INSERT INTO public.services (name, price) VALUES
  ('Consultation',500),('Blood Test (CBC)',300),('Blood Test (Lipid Profile)',800),
  ('X-Ray',600),('ECG',400),('Dressing',200),('Injection',150),
  ('Follow-up Visit',200),('Full Body Checkup',2500)
ON CONFLICT DO NOTHING;

-- 6. discount_presets
CREATE TABLE IF NOT EXISTS public.discount_presets (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  label      text        NOT NULL,
  type       text        NOT NULL CHECK (type IN ('percentage','fixed')),
  value      numeric     NOT NULL CHECK (value >= 0),
  is_active  boolean     NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.discount_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY discount_presets_select ON public.discount_presets FOR SELECT TO authenticated USING (true);
CREATE POLICY discount_presets_insert ON public.discount_presets FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY discount_presets_update ON public.discount_presets FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY discount_presets_delete ON public.discount_presets FOR DELETE TO authenticated USING (true);

-- 7. visits
CREATE TABLE IF NOT EXISTS public.visits (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number  text        UNIQUE NOT NULL,
  patient_id   uuid        NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  subtotal     numeric     NOT NULL DEFAULT 0,
  discount     numeric     NOT NULL DEFAULT 0,
  total        numeric     NOT NULL DEFAULT 0,
  payment_mode text        NOT NULL CHECK (payment_mode IN ('Cash','Card','UPI','Insurance')),
  visit_date   date        NOT NULL DEFAULT CURRENT_DATE,
  centre_id    uuid        REFERENCES public.centres(id) ON DELETE SET NULL,
  doctor_id    uuid        REFERENCES public.doctors(id) ON DELETE SET NULL,
  doctor_name  text,
  centre_name  text,
  created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY visits_select ON public.visits FOR SELECT TO authenticated USING (true);
CREATE POLICY visits_insert ON public.visits FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY visits_update ON public.visits FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY visits_delete ON public.visits FOR DELETE TO authenticated USING (true);

-- 8. visit_services
CREATE TABLE IF NOT EXISTS public.visit_services (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id     uuid        NOT NULL REFERENCES public.visits(id) ON DELETE CASCADE,
  service_id   uuid        REFERENCES public.services(id),
  service_name text        NOT NULL,
  price        numeric     NOT NULL,
  quantity     int         NOT NULL DEFAULT 1,
  created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.visit_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY visit_services_select ON public.visit_services FOR SELECT TO authenticated USING (true);
CREATE POLICY visit_services_insert ON public.visit_services FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY visit_services_update ON public.visit_services FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY visit_services_delete ON public.visit_services FOR DELETE TO authenticated USING (true);

-- 9. staff_users (Clinic Logins & Staff)
CREATE TABLE IF NOT EXISTS public.staff_users (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    text        NOT NULL,
  email        text        UNIQUE NOT NULL,
  password     text        NOT NULL,
  centre_id    uuid        REFERENCES public.centres(id) ON DELETE SET NULL,
  centre_name  text,
  role         text        NOT NULL CHECK (role IN ('admin', 'centre_staff')) DEFAULT 'centre_staff',
  is_active    boolean     NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.staff_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_users_select ON public.staff_users FOR SELECT TO authenticated USING (true);
CREATE POLICY staff_users_insert ON public.staff_users FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY staff_users_update ON public.staff_users FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY staff_users_delete ON public.staff_users FOR DELETE TO authenticated USING (true);

-- generate_patient_uid()
CREATE OR REPLACE FUNCTION public.generate_patient_uid()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_month   text := to_char(now(), 'YYYYMM');
  v_counter int;
BEGIN
  UPDATE public.uid_counters SET
    patient_counter = CASE WHEN counter_month = v_month THEN patient_counter + 1 ELSE 1 END,
    bill_counter    = CASE WHEN counter_month = v_month THEN bill_counter ELSE 0 END,
    counter_month   = v_month
  WHERE id = 1 RETURNING patient_counter INTO v_counter;
  RETURN 'CLN-' || v_month || '-' || lpad(v_counter::text, 4, '0');
END; $$;
GRANT EXECUTE ON FUNCTION public.generate_patient_uid() TO authenticated;

-- generate_bill_number()
CREATE OR REPLACE FUNCTION public.generate_bill_number()
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_month   text := to_char(now(), 'YYYYMM');
  v_counter int;
BEGIN
  UPDATE public.uid_counters SET
    bill_counter    = CASE WHEN counter_month = v_month THEN bill_counter + 1 ELSE 1 END,
    patient_counter = CASE WHEN counter_month = v_month THEN patient_counter ELSE 0 END,
    counter_month   = v_month
  WHERE id = 1 RETURNING bill_counter INTO v_counter;
  RETURN 'INV-' || v_month || '-' || lpad(v_counter::text, 4, '0');
END; $$;
GRANT EXECUTE ON FUNCTION public.generate_bill_number() TO authenticated;

-- Seed 3 Clinic Centres
INSERT INTO public.centres (id, name, address, phone, email, is_active)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', 'New Friends Colony, New Delhi', 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025', '08383936905', 'nfc@physionautics.com', true),
  ('c2222222-2222-2222-2222-222222222222', 'Vasant Vihar, New Delhi', '86 Basement, Poorvi Marg, Indian Air Lines & Air India Estate, Vasant Vihar, New Delhi, Delhi 110057', '08700264533', 'vasantvihar@physionautics.com', true),
  ('c3333333-3333-3333-3333-333333333333', 'Gurugram – DLF Phase 1', 'C2/17, Arjun Marg, DLF Phase 1, Gurugram, Haryana – 122002', '+91 92171 83736', 'gurugram@physionautics.com', true)
ON CONFLICT (id) DO NOTHING;

-- Seed Sample Doctors per Centre
INSERT INTO public.doctors (name, specialization, phone, email, centre_id, is_active)
VALUES
  ('Dr. Sarah Jenkins', 'Orthopedic Physiotherapy', '+91 98111 00001', 'sarah@physionautics.com', 'c1111111-1111-1111-1111-111111111111', true),
  ('Dr. Rajesh Sharma', 'Sports Rehabilitation', '+91 98111 00002', 'rajesh@physionautics.com', 'c1111111-1111-1111-1111-111111111111', true),
  ('Dr. Emily Watson', 'Neuro Physiotherapy', '+91 98111 00003', 'emily@physionautics.com', 'c2222222-2222-2222-2222-222222222222', true),
  ('Dr. Michael Chang', 'Spine & Posture Specialist', '+91 98111 00004', 'michael@physionautics.com', 'c2222222-2222-2222-2222-222222222222', true),
  ('Dr. Priya Nair', 'Cardiorespiratory Rehab', '+91 98111 00005', 'priya@physionautics.com', 'c3333333-3333-3333-3333-333333333333', true),
  ('Dr. David Kim', 'Pediatric Physiotherapy', '+91 98111 00006', 'david@physionautics.com', 'c3333333-3333-3333-3333-333333333333', true)
ON CONFLICT DO NOTHING;

-- Seed Sample Discount Presets
INSERT INTO public.discount_presets (label, type, value, is_active)
VALUES
  ('Senior Citizen (15%)', 'percentage', 15, true),
  ('Staff / Referral (20%)', 'percentage', 20, true),
  ('Special Privilege (₹200 OFF)', 'fixed', 200, true),
  ('First Visit Complimentary (₹500 OFF)', 'fixed', 500, true)
ON CONFLICT DO NOTHING;

