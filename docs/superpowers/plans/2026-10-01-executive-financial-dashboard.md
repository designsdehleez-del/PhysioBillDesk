# Executive Financial Dashboard & Role-Adaptive Command Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a unified, role-adaptive command architecture where Master Admin always sees the complete Executive Financial Dashboard (with clinic/date filters and doctor leaderboard) on both `/` and `/dashboard`, while Reception and Doctor accounts see clean, streamlined operational views.

**Architecture:** We use a shared component `components/dashboard/executive-financial-dashboard.tsx` that encapsulates all null-safe financial metrics, clinic/timeframe filters, doctor performance leaderboards, CSAT review ratings, and expense breakdowns. This component is rendered on both `app/(auth)/page.tsx` (for `role === 'admin'`) and `app/(app)/dashboard/page.tsx` (for `role === 'admin'`). Reception and Doctor roles render dedicated operational components without financial P&L.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Motion (Framer).

---

### Task 1: Shared Executive Financial Dashboard Component

**Files:**
- Create: `components/dashboard/executive-financial-dashboard.tsx`
- Test: Next.js production build (`npm run build`)

- [ ] **Step 1: Verify null-safety and filter state in `ExecutiveFinancialDashboard`**

Ensure `components/dashboard/executive-financial-dashboard.tsx` safely processes all array filters for visits, expenses, and doctor stats without throwing `TypeError`.

- [ ] **Step 2: Verify `ExecutiveFinancialDashboard` exports correctly**

```tsx
import { ExecutiveFinancialDashboard } from '@/components/dashboard/executive-financial-dashboard'
```

- [ ] **Step 3: Run build to verify TypeScript & Turbopack compilation**

Run: `npm run build`
Expected: `✓ Compiled successfully` with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add components/dashboard/executive-financial-dashboard.tsx
git commit -m "feat(dashboard): create shared ExecutiveFinancialDashboard component"
```

---

### Task 2: Integrate Executive Financial Dashboard into Admin Home Route (`/`)

**Files:**
- Modify: `app/(auth)/page.tsx`

- [ ] **Step 1: Import `ExecutiveFinancialDashboard` in `app/(auth)/page.tsx`**

```tsx
import { ExecutiveFinancialDashboard } from '@/components/dashboard/executive-financial-dashboard'
```

- [ ] **Step 2: Render `ExecutiveFinancialDashboard` for Admin in `app/(auth)/page.tsx`**

```tsx
{isAdmin ? (
  <ExecutiveFinancialDashboard />
) : (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Reception / Doctor Streamlined View */}
  </div>
)}
```

- [ ] **Step 3: Verify build passes cleanly**

Run: `npm run build`
Expected: `✓ Compiled successfully` with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add app/\(auth\)/page.tsx
git commit -m "feat(auth): render ExecutiveFinancialDashboard for Admin on home command route"
```

---

### Task 3: Integrate Executive Financial Dashboard into Dashboard Route (`/dashboard`)

**Files:**
- Modify: `app/(app)/dashboard/page.tsx`
- Modify: `components/layout/top-header-nav.tsx`

- [ ] **Step 1: Update `DashboardPage` in `app/(app)/dashboard/page.tsx` to render `ExecutiveFinancialDashboard` for Admin**

```tsx
export default function DashboardPage() {
  const { profile } = useAuth()
  const isAdmin = !profile || profile?.role === 'admin' || (profile?.role !== 'clinic_reception' && profile?.role !== 'doctor')

  if (profile?.role === 'clinic_reception') {
    return <ReceptionDeskView />
  }

  if (profile?.role === 'doctor') {
    return <DoctorPortalView />
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <ExecutiveFinancialDashboard />
    </div>
  )
}
```

- [ ] **Step 2: Verify `top-header-nav.tsx` routes "Financials & KPIs" to `/dashboard`**

```tsx
{ label: 'Financials & KPIs', href: '/dashboard', icon: LayoutDashboard, desc: 'Real-time revenue & CSAT' }
```

- [ ] **Step 3: Verify production build**

Run: `npm run build`
Expected: `✓ Compiled successfully` with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add app/\(app\)/dashboard/page.tsx components/layout/top-header-nav.tsx
git commit -m "fix(dashboard): link top nav to /dashboard and render ExecutiveFinancialDashboard"
```

---

### Task 4: Push Fix Live to Main Branch

**Files:**
- All modified files

- [ ] **Step 1: Run production build check**

Run: `npm run build`
Expected: Exit code 0.

- [ ] **Step 2: Commit and push to origin main**

```bash
git add .
git commit -m "fix(dashboard): resolve admin financial dashboard visibility and null safety"
git push origin main
```
