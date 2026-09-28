# Technical Design Specification: Roles, Physiotherapist Staffing, Invoicing & Doctor Tagged Revenue

**Date:** 2026-09-28  
**Status:** Approved  
**Target Application:** PhysioBillDesk  

---

## 1. Executive Summary

This design specification details the architectural changes required to support updated user roles, physiotherapist staffing, patient registration, bill generation, expense logging, and tagged revenue analytics for senior doctors.

The updated access model defines three primary system roles:
1. **Admin**: Complete system access across all clinics, financial analytics, doctor performance, expense tracking, and settings.
2. **Clinic Reception** (formerly `centre_staff`): Dedicated clinic-level operational role for patient registration, bill generation, WhatsApp messaging, and expense logging. Financial summaries and total revenue metrics are strictly masked.
3. **Doctor**: Senior doctor role with dedicated login access scoped to their assigned `doctorId`. Doctors can view their assigned patients and their 100% tagged net invoice revenue where they are designated as the Primary Doctor.

Additionally, **Physiotherapists** are managed as a selectable staff master list per clinic and can be assigned alongside Primary Doctors during patient registration and invoice generation.

---

## 2. System Architecture & Role Permissions

| Feature / Module | Admin | Clinic Reception | Doctor |
| :--- | :---: | :---: | :---: |
| **All Clinics Access** | Yes | Scoped to Clinic | Scoped to Doctor |
| **Patient Registration & List** | Full Access | Full Access | View Assigned Patients |
| **Bill / Invoice Generation** | Full Access | Full Access | View Tagged Invoices |
| **Log Clinic Expenses** | Full Access | Full Access | No |
| **Total Clinic Revenue & Financial Charts** | Full Access | Hidden | Hidden |
| **Doctor Tagged Revenue Dashboard** | Full Access | Hidden | Scoped to own `doctorId` |
| **WhatsApp Receipt Sharing** | Full Access | Full Access | No |
| **Settings & Master Data** | Full Access | Read-only / No | No |

---

## 3. Data Schema & Models

### 3.1 Physiotherapist Master Record (`physiotherapists`)
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

### 3.2 Patient Record Additions (`patients`)
* `primary_doctor_id`: Foreign key reference to `doctors.id` (nullable).
* `physiotherapist_id`: Foreign key reference to `physiotherapists.id` (nullable).

### 3.3 Visit / Invoice Record Additions (`visits`)
* `primary_doctor_id`: Foreign key reference to `doctors.id` (nullable).
* `primary_doctor_name`: Cached name string of Primary Doctor at invoice time.
* `physiotherapist_id`: Foreign key reference to `physiotherapists.id` (nullable).
* `physiotherapist_name`: Cached name string of Physiotherapist at invoice time.

### 3.4 User Profile & Role Definitions (`contexts/auth-context.tsx`)
```ts
export type UserRole = 'admin' | 'clinic_reception' | 'doctor'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  centreId?: string
  centreName?: string
  avatarUrl?: string | null
  phone?: string
  roleTitle?: string
  doctorId?: string | null
  doctorName?: string | null
}
```

---

## 4. Workflows & Features

### 4.1 Patient Registration Flow
1. Staff opens the Patient Registration form.
2. Selecting a clinic populates available active Doctors and Physiotherapists.
3. Staff selects **Primary Doctor** and **Physiotherapist**.
4. Patient is created with `primary_doctor_id` and `physiotherapist_id`.

### 4.2 Invoice Generation Flow
1. Staff selects a registered patient.
2. `Primary Doctor` and `Physiotherapist` automatically pre-fill from the patient's record.
3. Staff can modify either field per invoice if an alternate doctor or physiotherapist conducted the session.
4. Total net bill amount is generated.
5. Printed PDF invoices and WhatsApp messages display both Primary Doctor and Attending Physiotherapist.

### 4.3 Doctor Tagged Revenue Calculation
* **Tagged Revenue Formula**: $\text{Tagged Revenue} = \sum \text{Visit Total Net Amount for visits where } \text{primary\_doctor\_id} = \text{Current Doctor ID}$.
* Doctor dashboard presents:
  * Total Tagged Revenue (YTD, Monthly, Date Range).
  * Total Patient Count & Visit Count under primary supervision.
  * List of assigned patients and invoice breakdown.

### 4.4 Clinic Reception Financial Privacy & Expense Logging
* Total revenue numbers, daily collection cards, and growth charts are removed from the reception view.
* Metric cards display: **Patients Registered Today**, **Invoices Created Today**, **Expenses Logged Today**.
* Expense Logger interface allows entering category, description, date, amount, payment mode, and receipt attachment. Logged expenses feed directly into the central store for Admin auditing.

---

## 5. Verification & Testing Criteria

1. **Role Switcher Testing**: Test logging in as `Admin`, `Clinic Reception`, and `Doctor` via preset accounts.
2. **Patient Registration**: Verify Primary Doctor and Physiotherapist dropdowns save correctly.
3. **Bill Generation**: Confirm auto-filling from patient profile and ability to override. Verify PDF & WhatsApp message output.
4. **Doctor Dashboard**: Confirm Dr. Sarah Jenkins sees only her tagged revenue and patients.
5. **Reception Masking**: Verify revenue cards are absent on Reception login while expense logging remains functional.
