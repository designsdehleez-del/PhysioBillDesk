-- ==============================================================
-- PHYSIONAUTICS: Supabase Schema for Expenses & Storage Buckets
-- Run this in your Supabase Project SQL Editor
-- ==============================================================

-- 1. Create clinic_expenses table
CREATE TABLE IF NOT EXISTS public.clinic_expenses (
  id TEXT PRIMARY KEY,
  expense_date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  centre_id TEXT REFERENCES public.centres(id) ON DELETE SET NULL,
  centre_name TEXT,
  logged_by_name TEXT,
  payment_method TEXT DEFAULT 'UPI',
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.clinic_expenses ENABLE ROW LEVEL SECURITY;

-- Allow read & write access
CREATE POLICY "Allow public read clinic_expenses"
  ON public.clinic_expenses FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert clinic_expenses"
  ON public.clinic_expenses FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update clinic_expenses"
  ON public.clinic_expenses FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete clinic_expenses"
  ON public.clinic_expenses FOR DELETE
  USING (true);

-- 2. Create Storage Buckets for Expense Proofs & Broadcast Media
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('expense-receipts', 'expense-receipts', true),
  ('broadcast-media', 'broadcast-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for expense-receipts
CREATE POLICY "Public read expense-receipts"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'expense-receipts');

CREATE POLICY "Public upload expense-receipts"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'expense-receipts');

-- Storage Policies for broadcast-media
CREATE POLICY "Public read broadcast-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'broadcast-media');

CREATE POLICY "Public upload broadcast-media"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'broadcast-media');
