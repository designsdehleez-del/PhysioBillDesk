# Unified Home Command Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the home screen (`/` in `app/(auth)/page.tsx`) into a role-adaptive Command Hub with 2 metrics per role, direct attendance and expense logging, and redirect `/dashboard` to `/`.

**Architecture:** Update `app/(auth)/page.tsx` for Doctor and Reception roles, add redirect in `app/(app)/dashboard/page.tsx` to `/`, update Top Header Navigation shortcuts, and update `app/(app)/attendance/page.tsx` redirect target to `/`.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS, Lucide React icons, localStorage data store.

---

### Task 1: Redirect `/dashboard` to `/` and Update Navigation Shortcuts

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`
- Modify: `components/layout/top-header-nav.tsx`

- [ ] **Step 1: Redirect `/dashboard` page to `/`**

In `app/(app)/dashboard/page.tsx`, add an effect that calls `router.replace('/')` immediately on render.

```typescript
useEffect(() => {
  router.replace('/')
}, [router])
```

- [ ] **Step 2: Update Top Header Nav link targets**

In `components/layout/top-header-nav.tsx`, update any overview/dashboard links to point to `/`.

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/dashboard/page.tsx components/layout/top-header-nav.tsx
git commit -m "refactor(nav): redirect dashboard to root home page and update nav shortcuts"
```

---

### Task 2: Build Doctor Command Hub on Home Screen (`/`)

**Files:**
- Modify: `app/(auth)/page.tsx`

- [ ] **Step 1: Add Doctor Header Actions & 2 Metric Cards**

In `app/(auth)/page.tsx` under `isDoctor`:
- Header Actions: **Mark My Attendance** (`saveAttendanceRecord`), **Log Expense** (`<ExpenseLoggingModal>`), **Patient Directory** (`/patients`), **Create Bill** (`/billing`).
- Metric Card 1: **Total Patients** (`hubStats.totalPatients` / `myPatients.length`)
- Metric Card 2: **Total Patients Conducted** (`myVisits.length`)

- [ ] **Step 2: Embed Doctor Patient List & Consultation History**

Render clean search and table views for assigned patients and recent consultation invoices.

- [ ] **Step 3: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/page.tsx
git commit -m "feat(home): build doctor command hub on home page with 2 metrics and direct actions"
```

---

### Task 3: Build Reception Desk Command Hub on Home Screen (`/`)

**Files:**
- Modify: `app/(auth)/page.tsx`
- Modify: `app/(app)/attendance/page.tsx`

- [ ] **Step 1: Add Reception Header Actions & 2 Metric Cards**

In `app/(auth)/page.tsx` under `isReception`:
- Header Actions: **Create Invoice** (`/billing`), **Patient Directory** (`/patients`), **Attendance Roster** (`/attendance`), **Log Expense** (`<ExpenseLoggingModal>`).
- Metric Card 1: **Total Patients** (`hubStats.totalPatients`)
- Metric Card 2: **Total Patients Conducted** (`hubStats.todayPatients` / total visits)

- [ ] **Step 2: Update Attendance Guard Redirect to `/`**

In `app/(app)/attendance/page.tsx`, update doctor redirect target from `/dashboard` to `/`.

- [ ] **Step 3: Run TypeScript check & Build verification**

Run: `npx tsc --noEmit`
Run: `npm run build`
Expected: Both exit with code 0.

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/page.tsx app/\(app\)/attendance/page.tsx
git commit -m "feat(home): build reception command hub on home page and update attendance redirect to root"
```
