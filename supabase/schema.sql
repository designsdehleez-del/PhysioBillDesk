-- ============================================================
-- Physionautics Clinic Management System - Supabase Schema
-- Run this entire file in your Supabase SQL editor:
-- https://supabase.com/dashboard/project/_/sql/new
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
DROP POLICY IF EXISTS uid_counters_all ON public.uid_counters;
CREATE POLICY uid_counters_all ON public.uid_counters FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

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
DROP POLICY IF EXISTS centres_all ON public.centres;
CREATE POLICY centres_all ON public.centres FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

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
DROP POLICY IF EXISTS doctors_all ON public.doctors;
CREATE POLICY doctors_all ON public.doctors FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

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
DROP POLICY IF EXISTS patients_all ON public.patients;
CREATE POLICY patients_all ON public.patients FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 5. services
CREATE TABLE IF NOT EXISTS public.services (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  price      numeric     NOT NULL CHECK (price >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS services_all ON public.services;
CREATE POLICY services_all ON public.services FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

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
DROP POLICY IF EXISTS discount_presets_all ON public.discount_presets;
CREATE POLICY discount_presets_all ON public.discount_presets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 7. package_presets
CREATE TABLE IF NOT EXISTS public.package_presets (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text        NOT NULL,
  total_sessions  int         NOT NULL CHECK (total_sessions > 0),
  price           numeric     NOT NULL CHECK (price >= 0),
  discount_pct    numeric     DEFAULT 0,
  validity_days   int         DEFAULT 90,
  is_active       boolean     NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.package_presets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS package_presets_all ON public.package_presets;
CREATE POLICY package_presets_all ON public.package_presets FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 8. visits
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
DROP POLICY IF EXISTS visits_all ON public.visits;
CREATE POLICY visits_all ON public.visits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 9. visit_services
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
DROP POLICY IF EXISTS visit_services_all ON public.visit_services;
CREATE POLICY visit_services_all ON public.visit_services FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 10. patient_package_credits
CREATE TABLE IF NOT EXISTS public.patient_package_credits (
  id                 uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id         uuid        NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  package_id         uuid        REFERENCES public.package_presets(id) ON DELETE SET NULL,
  package_name       text        NOT NULL,
  total_sessions     int         NOT NULL,
  remaining_sessions int         NOT NULL,
  used_sessions      int         NOT NULL DEFAULT 0,
  price_paid         numeric     NOT NULL DEFAULT 0,
  centre_id          uuid        REFERENCES public.centres(id) ON DELETE SET NULL,
  centre_name        text,
  purchased_at       timestamptz NOT NULL DEFAULT now(),
  expires_at         timestamptz,
  status             text        NOT NULL CHECK (status IN ('Active','Exhausted','Expired')) DEFAULT 'Active',
  created_at         timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.patient_package_credits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS patient_package_credits_all ON public.patient_package_credits;
CREATE POLICY patient_package_credits_all ON public.patient_package_credits FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 11. staff_users (Clinic & Admin Logins)
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
DROP POLICY IF EXISTS staff_users_all ON public.staff_users;
CREATE POLICY staff_users_all ON public.staff_users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- 12. patient_feedback
CREATE TABLE IF NOT EXISTS public.patient_feedback (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_number      text,
  patient_uid      text,
  patient_name     text        NOT NULL,
  patient_phone    text,
  doctor_name      text,
  centre_name      text,
  rating           int         NOT NULL CHECK (rating >= 1 AND rating <= 5),
  hygiene_rating   int         CHECK (hygiene_rating >= 1 AND hygiene_rating <= 5),
  treatment_rating int         CHECK (treatment_rating >= 1 AND treatment_rating <= 5),
  staff_rating     int         CHECK (staff_rating >= 1 AND staff_rating <= 5),
  comments         text,
  created_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.patient_feedback ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS patient_feedback_all ON public.patient_feedback;
CREATE POLICY patient_feedback_all ON public.patient_feedback FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- ================= HELPER AUTO-INCREMENT FUNCTIONS =================

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
GRANT EXECUTE ON FUNCTION public.generate_patient_uid() TO anon, authenticated;

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
GRANT EXECUTE ON FUNCTION public.generate_bill_number() TO anon, authenticated;

-- ================= SEED DATA =================

-- 3 Centres
INSERT INTO public.centres (id, name, address, phone, email, is_active)
VALUES 
  ('c1111111-1111-1111-1111-111111111111', 'New Friends Colony, New Delhi', 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025', '08383936905', 'nfc@physionautics.com', true),
  ('c2222222-2222-2222-2222-222222222222', 'Vasant Vihar, New Delhi', '86 Basement, Poorvi Marg, Indian Air Lines & Air India Estate, Vasant Vihar, New Delhi, Delhi 110057', '08700264533', 'vasantvihar@physionautics.com', true),
  ('c3333333-3333-3333-3333-333333333333', 'Gurugram – DLF Phase 1', 'C2/17, Arjun Marg, DLF Phase 1, Gurugram, Haryana – 122002', '+91 92171 83736', 'gurugram@physionautics.com', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, address = EXCLUDED.address, phone = EXCLUDED.phone;

-- Doctors per Centre
INSERT INTO public.doctors (name, specialization, phone, email, centre_id, is_active)
VALUES
  ('Dr. Sarah Jenkins', 'Orthopedic Physiotherapy', '+91 98111 00001', 'sarah@physionautics.com', 'c1111111-1111-1111-1111-111111111111', true),
  ('Dr. Rajesh Sharma', 'Sports Rehabilitation', '+91 98111 00002', 'rajesh@physionautics.com', 'c1111111-1111-1111-1111-111111111111', true),
  ('Dr. Emily Watson', 'Neuro Physiotherapy', '+91 98111 00003', 'emily@physionautics.com', 'c2222222-2222-2222-2222-222222222222', true),
  ('Dr. Michael Chang', 'Spine & Posture Specialist', '+91 98111 00004', 'michael@physionautics.com', 'c2222222-2222-2222-2222-222222222222', true),
  ('Dr. Priya Nair', 'Cardiorespiratory Rehab', '+91 98111 00005', 'priya@physionautics.com', 'c3333333-3333-3333-3333-333333333333', true),
  ('Dr. David Kim', 'Pediatric Physiotherapy', '+91 98111 00006', 'david@physionautics.com', 'c3333333-3333-3333-3333-333333333333', true)
ON CONFLICT DO NOTHING;

-- Discount Presets
INSERT INTO public.discount_presets (label, type, value, is_active)
VALUES
  ('Senior Citizen (15%)', 'percentage', 15, true),
  ('Staff / Referral (20%)', 'percentage', 20, true),
  ('Special Privilege (₹200 OFF)', 'fixed', 200, true),
  ('First Visit Complimentary (₹500 OFF)', 'fixed', 500, true)
ON CONFLICT DO NOTHING;

-- 18 Physiotherapy Services & Procedures
INSERT INTO public.services (name, price)
VALUES
  ('Initial Consultation & Assessment', 600),
  ('Follow-up Consultation & Review', 400),
  ('Standard Physiotherapy Session (45 min)', 800),
  ('Manual Therapy & Joint Mobilization', 900),
  ('Electrotherapy (IFT / TENS / Ultrasound)', 500),
  ('Spine Decompression & Mechanical Traction', 950),
  ('Dry Needling Therapy (Trigger Point Release)', 750),
  ('Cupping & Myofascial Release Therapy', 700),
  ('Sports Injury Rehabilitation & Conditioning', 1200),
  ('Post-Operative Orthopedic Rehab (ACL/Knee/Hip)', 1100),
  ('Neurological Rehabilitation Session', 1300),
  ('Kinesiology Taping & Strapping', 450),
  ('Stroke & Paralysis Functional Rehab', 1500),
  ('Ergonomic Evaluation & Posture Correction', 850),
  ('High-Power Laser Therapy (Class 4)', 1000),
  ('Chest Physiotherapy & Postural Drainage', 750),
  ('Pediatric Physiotherapy & Motor Skills', 1000),
  ('Full Body Wellness & Recovery Package', 2500)
ON CONFLICT DO NOTHING;

-- Package Presets
INSERT INTO public.package_presets (name, total_sessions, price, discount_pct, validity_days, is_active)
VALUES
  ('5-Session Rehab Starter Pack', 5, 3600, 10, 45, true),
  ('10-Session Comprehensive Rehab Bundle', 10, 6800, 15, 90, true),
  ('15-Session Advanced Spine & Posture Plan', 15, 9600, 20, 120, true),
  ('20-Session Post-Surgical Recovery Program', 20, 12000, 25, 180, true)
ON CONFLICT DO NOTHING;

-- Staff & Clinic Users
INSERT INTO public.staff_users (id, full_name, email, password, centre_id, centre_name, role, is_active)
VALUES
  ('a0000000-0000-0000-0000-000000000000', 'Chief Medical Officer (CMO)', 'admin@physionautics.com', 'admin123', NULL, 'All Centres (HQ)', 'admin', true),
  ('a1111111-1111-1111-1111-111111111111', 'Reception Desk - New Friends Colony', 'nfc@physionautics.com', 'nfc123', 'c1111111-1111-1111-1111-111111111111', 'New Friends Colony, New Delhi', 'centre_staff', true),
  ('a2222222-2222-2222-2222-222222222222', 'Reception Desk - Vasant Vihar', 'vv@physionautics.com', 'vv123', 'c2222222-2222-2222-2222-222222222222', 'Vasant Vihar, New Delhi', 'centre_staff', true),
  ('a3333333-3333-3333-3333-333333333333', 'Reception Desk - Gurugram Phase 1', 'ggn@physionautics.com', 'ggn123', 'c3333333-3333-3333-3333-333333333333', 'Gurugram – DLF Phase 1', 'centre_staff', true)
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role;


