# Roles, Physiotherapist Staffing, Invoicing & Doctor Revenue Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update system roles (Admin, Clinic Reception, Doctor), introduce Physiotherapist staff management, assign Primary Doctor & Physiotherapist on patients and invoices, provide Doctor Tagged Revenue dashboards, and mask financial totals for Clinic Reception.

**Architecture:** Extend Supabase schema types and local data store with Physiotherapist entities, update AuthContext for `admin`, `clinic_reception`, and `doctor` roles, update patient/invoice components to handle primary doctor and physiotherapist selections, build scoped revenue dashboards for doctors, and implement financial masking for reception.

**Tech Stack:** Next.js 15 (App Router), TypeScript, React 19, Tailwind CSS, Lucide Icons, Supabase JS client.

---

### Task 1: Update Supabase Types (`lib/supabase/types.ts`)

**Files:**
- Modify: `lib/supabase/types.ts:1-200`

- [ ] **Step 1: Add Physiotherapist Interface and Update Patient & Visit Interfaces**
Add `Physiotherapist` type to `lib/supabase/types.ts`:
```ts
export interface Physiotherapist {
  id: string
  name: string
  phone: string | null
  email: string | null
  qualification: string | null
  centre_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
```
Update `Patient` interface:
```ts
export interface Patient {
  id: string
  uid: string
  full_name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  phone: string
  email: string | null
  address: string | null
  blood_group: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-' | null
  medical_notes: string | null
  primary_doctor_id?: string | null
  physiotherapist_id?: string | null
  created_at: string
  updated_at: string
}
```
Update `Visit` interface:
```ts
export interface Visit {
  id: string
  bill_number: string
  patient_id: string
  subtotal: number
  discount: number
  total: number
  payment_mode: 'Cash' | 'Card' | 'UPI' | 'Insurance'
  visit_date: string
  centre_id: string | null
  doctor_id: string | null
  doctor_name: string | null
  primary_doctor_id?: string | null
  primary_doctor_name?: string | null
  physiotherapist_id?: string | null
  physiotherapist_name?: string | null
  centre_name: string | null
  created_at: string
}
```

- [ ] **Step 2: Verify type definitions compile**
Run: `npx tsc --noEmit`
Expected: Output showing no type errors in `lib/supabase/types.ts`.

- [ ] **Step 3: Commit**
```bash
git add lib/supabase/types.ts
git commit -m "feat(schema): add physiotherapist type and extend patient and visit types"
```

---

### Task 2: Data Store & Seed Data (`lib/data-store.ts`)

**Files:**
- Modify: `lib/data-store.ts`

- [ ] **Step 1: Add Default Physiotherapists Seed Data and Storage Functions**
Add `DEFAULT_PHYSIOTHERAPISTS: Physiotherapist[]`:
```ts
const DEFAULT_PHYSIOTHERAPISTS: Physiotherapist[] = [
  {
    id: 'phy-101',
    name: 'PT Ananya Sen',
    phone: '+91 98222 11101',
    email: 'ananya@physionautics.com',
    qualification: 'BPT, MPT (Kinesiotherapy)',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'phy-102',
    name: 'PT Vikram Verma',
    phone: '+91 98222 11102',
    email: 'vikram@physionautics.com',
    qualification: 'BPT, Cert. Dry Needling',
    centre_id: 'c2222222-2222-2222-2222-222222222222',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]
```
Add getter and adder helper functions:
`getPhysiotherapists(centreId?: string): Promise<Physiotherapist[]>`
`addPhysiotherapist(physio: Omit<Physiotherapist, 'id' | 'created_at' | 'updated_at'>): Promise<Physiotherapist>`

- [ ] **Step 2: Ensure Patient & Visit helper functions preserve `primary_doctor_id` & `physiotherapist_id`**
Update `addPatient`, `updatePatient`, `addVisit`, `getVisits` in `lib/data-store.ts` to copy and handle `primary_doctor_id`, `primary_doctor_name`, `physiotherapist_id`, and `physiotherapist_name`.

- [ ] **Step 3: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
```bash
git add lib/data-store.ts
git commit -m "feat(store): add physiotherapists seed data and store methods for primary doctor & physio"
```

---

### Task 3: Auth Context Roles & Preset Accounts (`contexts/auth-context.tsx`)

**Files:**
- Modify: `contexts/auth-context.tsx`

- [ ] **Step 1: Update Roles Union and Demo Accounts**
Update `UserRole`:
```ts
export type UserRole = 'admin' | 'clinic_reception' | 'doctor'
```
Update `PRESET_ACCOUNTS`:
- `admin@physionautics.com` (role: `'admin'`)
- `nfc@physionautics.com` (role: `'clinic_reception'`, centreId: `c111...`)
- `vasantvihar@physionautics.com` (role: `'clinic_reception'`, centreId: `c222...`)
- `gurugram@physionautics.com` (role: `'clinic_reception'`, centreId: `c333...`)
- `dr.sarah@physionautics.com` (role: `'doctor'`, doctorId: `'doc-101'`, doctorName: `'Dr. Sarah Jenkins'`, centreId: `c111...`)
- `dr.rajesh@physionautics.com` (role: `'doctor'`, doctorId: `'doc-102'`, doctorName: `'Dr. Rajesh Sharma'`, centreId: `c111...`)

- [ ] **Step 2: Update `loginAsRole` switcher handler**
Support role types `'admin'`, `'reception_nfc'`, `'reception_vasant'`, `'doctor_sarah'`, `'doctor_rajesh'` in quick toggle.

- [ ] **Step 3: Verify TypeScript compilation**
Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 4: Commit**
```bash
git add contexts/auth-context.tsx
git commit -m "feat(auth): update user roles to admin, clinic_reception, and doctor with doctor credentials"
```

---

### Task 4: Patient Registration & Profile (`app/(app)/patients/register/page.tsx`, `components/patients/patient-profile-view.tsx`)

**Files:**
- Modify: `app/(app)/patients/register/page.tsx`
- Modify: `components/patients/patient-profile-view.tsx`

- [ ] **Step 1: Add Primary Doctor & Physiotherapist dropdowns to Registration Page**
In `app/(app)/patients/register/page.tsx`:
- Fetch active doctors and physiotherapists using `getDoctors()` and `getPhysiotherapists()`.
- Add `<Select>` dropdowns for "Primary Doctor" and "Attending Physiotherapist".
- Include selected `primary_doctor_id` and `physiotherapist_id` when submitting `addPatient(...)`.

- [ ] **Step 2: Display Primary Doctor & Physiotherapist on Patient Profile**
In `components/patients/patient-profile-view.tsx`:
- Render Primary Doctor name (with doctor badge) and Attending Physiotherapist name under patient bio metadata card.

- [ ] **Step 3: Verify build**
Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add app/\(app\)/patients/register/page.tsx components/patients/patient-profile-view.tsx
git commit -m "feat(patients): add primary doctor and physiotherapist selection in registration & profile"
```

---

### Task 5: Bill Generation / Invoice Builder (`app/(app)/billing/page.tsx`)

**Files:**
- Modify: `app/(app)/billing/page.tsx`

- [ ] **Step 1: Pre-fill Primary Doctor & Physiotherapist when patient selected**
In `app/(app)/billing/page.tsx`:
- Add state for `primaryDoctorId`, `primaryDoctorName`, `physiotherapistId`, and `physiotherapistName`.
- When a patient is selected from the dropdown:
  - Find doctor matching `patient.primary_doctor_id` and set `primaryDoctorId` & `primaryDoctorName`.
  - Find physiotherapist matching `patient.physiotherapist_id` and set `physiotherapistId` & `physiotherapistName`.
- Provide override `<Select>` inputs for both Primary Doctor and Physiotherapist on the billing form.

- [ ] **Step 2: Save primary doctor & physio on visit creation**
Pass `primary_doctor_id`, `primary_doctor_name`, `physiotherapist_id`, `physiotherapist_name` into `addVisit(...)`.

- [ ] **Step 3: Verify build**
Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add app/\(app\)/billing/page.tsx
git commit -m "feat(billing): auto pre-fill primary doctor and physio on invoice creation with override"
```

---

### Task 6: PDF / Printable Invoice & WhatsApp Payload (`components/billing/printable-invoice-modal.tsx`, `components/billing/whatsapp-share-modal.tsx`)

**Files:**
- Modify: `components/billing/printable-invoice-modal.tsx`
- Modify: `components/billing/whatsapp-share-modal.tsx`

- [ ] **Step 1: Render Doctor & Physio in Invoice Modal & Printable PDF**
In `printable-invoice-modal.tsx`:
- Add header metadata lines:
  - **Primary Doctor**: `visit.primary_doctor_name || visit.doctor_name || 'N/A'`
  - **Attending Physiotherapist**: `visit.physiotherapist_name || 'N/A'`

- [ ] **Step 2: Include Doctor & Physio in WhatsApp receipt text**
In `whatsapp-share-modal.tsx`:
- Format WhatsApp receipt template:
  `*Primary Doctor:* ${visit.primary_doctor_name || 'N/A'}`
  `*Attending Physio:* ${visit.physiotherapist_name || 'N/A'}`

- [ ] **Step 3: Verify build**
Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add components/billing/printable-invoice-modal.tsx components/billing/whatsapp-share-modal.tsx
git commit -m "feat(invoice): include primary doctor and physiotherapist on printed PDF and WhatsApp receipt"
```

---

### Task 7: Doctor Portal & Tagged Revenue Dashboard (`app/(app)/dashboard/page.tsx`, `components/dashboard/financial-tracking-view.tsx`)

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`
- Modify: `components/dashboard/financial-tracking-view.tsx`

- [ ] **Step 1: Implement Doctor Portal view in `dashboard/page.tsx`**
When `profile.role === 'doctor'`:
- Filter visits where `visit.primary_doctor_id === profile.doctorId` (or `visit.doctor_id === profile.doctorId`).
- Calculate **My Tagged Revenue**: $\sum \text{visit.total}$.
- Display:
  - **My Tagged Revenue Card** (Month, YTD, Total).
  - **My Patients List** (patients registered with `primary_doctor_id === profile.doctorId`).
  - **Recent Clinical Invoices Table**.

- [ ] **Step 2: Add Doctor filter to central Financial Tracking View**
In `financial-tracking-view.tsx` (for Admin view):
- Add a "Filter by Primary Doctor" dropdown to allow Admin to inspect tagged revenue per doctor across clinics.

- [ ] **Step 3: Verify build**
Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add app/\(app\)/dashboard/page.tsx components/dashboard/financial-tracking-view.tsx
git commit -m "feat(dashboard): build doctor portal with tagged revenue metrics and admin doctor revenue filter"
```

---

### Task 8: Reception Role Financial Masking & Navigation (`components/layout/sidebar.tsx`, `components/layout/top-header-nav.tsx`)

**Files:**
- Modify: `components/layout/sidebar.tsx`
- Modify: `components/layout/top-header-nav.tsx`
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Mask Total Revenue for `clinic_reception` on Dashboard**
When `profile.role === 'clinic_reception'`:
- Hide total network revenue cards and financial growth charts.
- Render operational reception cards:
  - **Patients Registered Today**
  - **Bills Generated Today**
  - **Expenses Logged Today**
- Render quick action buttons: `[New Patient]`, `[Create Bill]`, `[Log Expense]`, `[WhatsApp]`.

- [ ] **Step 2: Update Sidebar Navigation Links per Role**
In `sidebar.tsx` & `top-header-nav.tsx`:
- **Admin**: All navigation links visible.
- **Clinic Reception**: Patients, Billing, Expenses, WhatsApp. (Hide Master Financials & Master Analytics).
- **Doctor**: My Dashboard, My Patients, My Invoices.

- [ ] **Step 3: Verify build**
Run: `npx tsc --noEmit`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add components/layout/sidebar.tsx components/layout/top-header-nav.tsx app/\(app\)/dashboard/page.tsx
git commit -m "feat(reception): mask total revenue cards for reception staff and update role-based navigation"
```

---

### Task 9: End-to-End Build & Verification

**Files:** None (Build & Execution Verification)

- [ ] **Step 1: Run TypeScript compiler check**
Run: `npx tsc --noEmit`
Expected: PASS with 0 errors.

- [ ] **Step 2: Run Next.js build**
Run: `npm run build`
Expected: PASS (compiled successfully with 0 errors).

- [ ] **Step 3: Commit final verification tag**
```bash
git commit --allow-empty -m "chore: verify build clean for roles and doctor revenue update"
```
