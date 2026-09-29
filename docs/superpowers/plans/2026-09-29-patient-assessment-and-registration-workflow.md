# Patient Registration & Clinical Assessment Workflow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Streamline Patient Registration with referral details, create Physiotherapy and Neurotherapy Assessment forms, generate branded assessment reports with clinic logo and WhatsApp sharing, and connect assessment to billing.

**Architecture:** Extend data types & storage helpers in `lib/data-store.ts` and `lib/supabase/types.ts`, update `app/(app)/patients/register/page.tsx` for fast registration, build assessment form and report component in `app/(app)/patients/[id]/assessment/page.tsx`, and add "Proceed to Billing" action.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Lucide React icons, localStorage data store.

---

### Task 1: Extend Data Types and Storage Store for Assessment Data & Referrals

**Files:**
- Modify: `lib/supabase/types.ts`
- Modify: `lib/data-store.ts`

- [ ] **Step 1: Extend Patient interface and add ClinicalAssessment type**

In `lib/supabase/types.ts`:
- Add `referral_source`, `referral_doctor_name`, `referral_clinic_name`, `referral_contact`, `initial_complaint` to `Patient`.
- Add `ClinicalAssessment` interface.

```typescript
export interface ClinicalAssessment {
  id: string
  patient_id: string
  patient_uid: string
  type: 'physiotherapy' | 'neurotherapy'
  assessment_date: string
  doctor_id?: string
  doctor_name?: string
  vas_score?: number
  data: Record<string, any>
  created_at: string
}
```

- [ ] **Step 2: Add assessment helper functions in data-store**

In `lib/data-store.ts`:
- Add `saveAssessment(assessment: Partial<ClinicalAssessment>): Promise<ClinicalAssessment>`
- Add `getAssessments(patientId?: string): Promise<ClinicalAssessment[]>`

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add lib/supabase/types.ts lib/data-store.ts
git commit -m "feat(store): add ClinicalAssessment types and storage helpers"
```

---

### Task 2: Streamline Patient Registration Form with Referral & Initial Complaint

**Files:**
- Modify: `app/(app)/patients/register/page.tsx`

- [ ] **Step 1: Update Registration Form Fields**

In `app/(app)/patients/register/page.tsx`:
- Include Referral Source dropdown (`Self`, `Doctor`, `Walk-in`, `Patient/Friend`, `Other`).
- Show doctor/clinic/contact fields if `Doctor` or `Other` selected.
- Add single-line `Main Complaint / Discomfort` text input.
- Save referral fields and initial complaint to patient object.
- Upon saving, provide options: **"Start Physiotherapy Assessment"**, **"Start Neurotherapy Assessment"**, or **"Generate Bill Directly"**.

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 3: Commit**

```bash
git add app/\(app\)/patients/register/page.tsx
git commit -m "feat(patients): update registration form with referral source and complaint input"
```

---

### Task 3: Build Physiotherapy & Neurotherapy Assessment Forms, Branded Report & Sharing

**Files:**
- Create: `app/(app)/patients/[id]/assessment/page.tsx`
- Modify: `app/(app)/patients/[id]/page.tsx`

- [ ] **Step 1: Build Assessment Page Component**

Create `app/(app)/patients/[id]/assessment/page.tsx` with:
- Assessment Type Selector (`Physiotherapy` vs `Neurotherapy`).
- Full form tabs/sections for:
  1. Presenting Complaint & Pain (with VAS 0-10 score)
  2. Medical History
  3. Functional Assessment
  4. Physical Examination
  5. Diagnosis & Treatment Plan
- Save handler saving to `saveAssessment`.

- [ ] **Step 2: Build Branded Report View with Logo & WhatsApp Sharing**

When an assessment is saved or viewed:
- Render branded report header featuring `branding.logoUrl`, clinic name, address, patient UID, date, and doctor details.
- Add **"Share via WhatsApp"** button (formats summary and opens `https://wa.me/?text=...`).
- Add **"Print / Download PDF"** button.
- Add **"Proceed to Bill Generation"** button (`router.push('/billing?patientId=...')`).

- [ ] **Step 3: Add Assessment Link on Patient Profile Page**

In `app/(app)/patients/[id]/page.tsx`, add an "Assessments" section showing previous assessment reports and a button to launch new assessment.

- [ ] **Step 4: Run TypeScript check & Build verification**

Run: `npx tsc --noEmit`
Run: `npm run build`
Expected: Both exit with code 0.

- [ ] **Step 5: Commit**

```bash
git add app/\(app\)/patients/\[id\]/assessment/page.tsx app/\(app\)/patients/\[id\]/page.tsx
git commit -m "feat(assessment): add physio and neuro assessment forms with branded report and whatsapp sharing"
```
