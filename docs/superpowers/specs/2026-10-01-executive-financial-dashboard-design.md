# Executive Financial Dashboard & Role-Adaptive Command Hub Design

**Date**: 2026-10-01  
**Status**: Approved  

---

## 1. Executive Summary

PhysioBilldesk requires a clean, role-adaptive command architecture that guarantees:
- **Master Admin (`role: 'admin'`)**: Always sees the full **Executive Financial & Clinical Intelligence Dashboard** on `/` and `/dashboard`. This includes Gross Revenue, Operational Expenses, Net Profit / Margin %, CSAT Ratings, Clinic Branch dropdown selector (*All Branches, NFC, Vasant Vihar, Gurugram*), Timeframe pills (**Today**, **7 Days**, **30 Days**, **All Time**), and the **Doctor-Wise Leaderboard** (*Revenue, Patients Treated, Avg Ticket Size, CSAT Ratings & Verbatim Feedback*).
- **Clinic Reception (`role: 'clinic_reception'`)**: Sees a streamlined front-desk operational desk (patient counts, registration, billing counter, expense logging for their clinic branch) with **zero** network P&L or doctor revenue leaderboards.
- **Attending Doctor (`role: 'doctor'`)**: Sees a dedicated clinical portal (assigned primary patients, consultation logs, mark attendance, expense logging) with **zero** network P&L or peer revenue leaderboards.

---

## 2. Component & File Architecture

```
app/
├── (auth)/page.tsx                  --> Root route `/`. Renders ExecutiveFinancialDashboard for Admin,
│                                       ReceptionDeskView for Reception, DoctorPortalView for Doctor.
├── (app)/dashboard/page.tsx          --> `/dashboard` route. Renders ExecutiveFinancialDashboard for Admin,
│                                       ReceptionDeskView for Reception, DoctorPortalView for Doctor.
components/
├── dashboard/
│   ├── executive-financial-dashboard.tsx  --> Full Admin Financial Dashboard with filters & leaderboard.
│   ├── reception-desk-view.tsx            --> Streamlined reception desk view.
│   ├── doctor-portal-view.tsx             --> Streamlined doctor clinical desk view.
│   └── expense-logging-modal.tsx          --> Shared expense logging modal.
└── layout/
    └── top-header-nav.tsx                 --> Header navigation linking Financials & KPIs to /dashboard.
```

---

## 3. Data & State Management

### 3.1 Master Admin View Data Pipeline
- **Visits Data**: `getVisits()` -> filtered by `selectedFilterCentre` (all vs specific clinic) and `selectedTimeframe` (`today`, `7days`, `30days`, `all`).
- **Expenses Data**: `getExpenses()` -> filtered by `selectedFilterCentre` and `selectedTimeframe`.
- **Gross Revenue**: `sum(filteredVisits.total)`.
- **Operational Expenses**: `sum(filteredExpenses.amount)`.
- **Net Profit**: `Gross Revenue - Operational Expenses`.
- **Net Margin %**: `(Net Profit / Gross Revenue) * 100`.
- **Doctor Stats**:
  - Map over all doctors.
  - Calculate total revenue tagged to doctor (`primary_doctor_id` or `doctor_id`).
  - Calculate patient visit count, avg ticket size (`revenue / count`).
  - Calculate avg CSAT rating from feedback matching doctor name.
  - Rank doctors by revenue descending (`#1`, `#2`, ...).

### 3.2 Resilience & Null-Safety
All string operations (`.toLowerCase()`, `.replace()`, `.includes()`) are guarded against null/undefined properties (`doc?.name`, `c?.name`, `v?.centre_name`, `e?.centre_name`) to prevent runtime crashes.

---

## 4. Verification & Testing Criteria

1. **Build Check**: `npm run build` must compile with 0 TypeScript/Turbopack errors.
2. **Admin Verification**: Login as Admin (`admin@physionautics.com`) -> Verify `/` and `/dashboard` display the full Financial Dashboard with timeframe pills (**Today**, **7D**, **30D**, **All Time**), clinic dropdown, and Doctor Leaderboard.
3. **Reception Verification**: Login as Reception (`nfc@physionautics.com`) -> Verify front-desk operational view displays without financial P&L.
4. **Doctor Verification**: Login as Doctor (`dr.sarah@physionautics.com`) -> Verify doctor portal view displays without financial P&L.
