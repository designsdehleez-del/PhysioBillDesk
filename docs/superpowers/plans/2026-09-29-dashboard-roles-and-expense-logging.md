# Dashboard Role Simplification, Attendance Restrictions & Expense Logging Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify Doctor and Reception Dashboards to 2 metrics (Total Patients, Total Patients Conducted/Seen), restrict full `/attendance` access to Reception while adding a 1-click "Mark My Attendance" button on Doctor Dashboard, and enable expense logging for both roles.

**Architecture:** Update Next.js role views in `app/(app)/dashboard/page.tsx` for `clinic_reception` and `doctor`, add route guard redirect in `app/(app)/attendance/page.tsx`, and enhance `ExpenseLoggingModal` for robust centre binding and storage updates.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Lucide React icons, localStorage state store.

---

### Task 1: Attendance Page Route Protection for Doctor Role

**Files:**
- Modify: `app/(app)/attendance/page.tsx`

- [ ] **Step 1: Inspect attendance route guard**

Verify `profile?.role` check in `app/(app)/attendance/page.tsx`.

- [ ] **Step 2: Add redirect effect for Doctor role**

In `app/(app)/attendance/page.tsx`, add an effect that checks if `profile?.role === 'doctor'`. If true, trigger `toast` notification ("Doctors can mark attendance directly from their dashboard") and redirect `router.push('/dashboard')`.

```typescript
useEffect(() => {
  if (profile?.role === 'doctor') {
    toast({
      title: 'Attendance Access Restricted',
      description: 'Doctors mark attendance directly from their dashboard.',
    })
    router.push('/dashboard')
  }
}, [profile, router, toast])
```

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/attendance/page.tsx
git commit -m "fix(attendance): restrict doctor role from full attendance page and redirect to dashboard"
```

---

### Task 2: Doctor Dashboard Simplification & "Mark My Attendance" + "Log Expense" Integration

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`

- [ ] **Step 1: Simplify Doctor View to 2 Metric Cards**

In `app/(app)/dashboard/page.tsx`, under `if (profile?.role === 'doctor')`:
- Card 1: **Total Patients** (`myPatients.length`)
- Card 2: **Total Patients Conducted** (`doctorVisits.length` / `primaryTaggedVisits.length`)
- Remove all complex financial charts, doctor rating cards, and cluttered tables.

- [ ] **Step 2: Add "Mark My Attendance" Button and "Log Expense" Modal**

Add a prominent header action bar on Doctor Dashboard with:
1. **Mark My Attendance** button (saves today's attendance for `activeDoctorId` to storage via `saveAttendanceRecord`).
2. **Log Expense** modal trigger (`<ExpenseLoggingModal>`).

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/dashboard/page.tsx
git commit -m "feat(dashboard): simplify doctor view to 2 metrics with mark attendance & log expense actions"
```

---

### Task 3: Reception Dashboard Simplification & Expense Logging Synchronization

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`
- Modify: `components/dashboard/expense-logging-modal.tsx`

- [ ] **Step 1: Simplify Reception View to 2 Metric Cards**

In `app/(app)/dashboard/page.tsx`, under `if (profile?.role === 'clinic_reception')`:
- Card 1: **Total Patients** (`patients.filter(...)` for user's `centreId` or overall)
- Card 2: **Total Patients Conducted** (`filteredVisits.length`)
- Include Quick Actions for **New Patient Registration**, **New Invoice**, **Log Expense**, and **Manage Attendance**.

- [ ] **Step 2: Harden Expense Logging Modal Centre Selection**

In `components/dashboard/expense-logging-modal.tsx`:
- Use `useEffect` to update `selectedCentreId` whenever `userCentreId` or `centres` updates.
- Ensure form submission dispatches custom event `physio-expenses-updated` with newly added record.

- [ ] **Step 3: Run TypeScript check & Build verification**

Run: `npx tsc --noEmit`
Run: `npm run build`
Expected: Both exit with code 0.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/dashboard/page.tsx components/dashboard/expense-logging-modal.tsx
git commit -m "feat(dashboard): simplify reception view to 2 metrics and fix expense modal centre binding"
```
