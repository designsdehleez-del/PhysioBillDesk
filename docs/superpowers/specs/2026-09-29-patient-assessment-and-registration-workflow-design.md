# Patient Registration & Clinical Assessment Workflow Design Spec

**Date**: September 29, 2026  
**Target Feature**: Streamlined Patient Registration, Physiotherapy & Neurotherapy Assessment Forms, Branded Report Generator & WhatsApp Sharing  
**Repository**: `PhysioBilldesk` (`d:\PhysioBilldesk`)  

---

## 1. Overview & Vision

Streamline the clinic onboarding and treatment pipeline into a seamless 3-step clinical workflow:
1. **Shortened Patient Registration**: Captures patient demographics, referral information, and a single-line initial complaint/discomfort.
2. **Clinical Assessment (Physiotherapy or Neurotherapy)**: In-depth clinical evaluation form containing medical history, functional evaluation, physical exam, diagnosis, VAS pain score, and treatment plan.
3. **Branded Report & Sharing + Bill Generation**: Generates a professional assessment report with the clinic logo, direct WhatsApp patient sharing, PDF printing, and a 1-click transition to invoice creation (`/billing`).

---

## 2. Step-by-Step Functional Specifications

### 2.1 Step 1: Streamlined Registration (`/patients/register`)
- **Demographics**: Full Name, DOB / Age, Gender, Phone Number, Email, Address, Emergency Contact Name & Phone.
- **Referral Information**:
  - `Referred By`: Dropdown (`Self`, `Doctor`, `Walk-in`, `Patient/Friend`, `Other`).
  - If `Doctor` / `Other`: Doctor Name, Clinic/Hospital Name, Contact Number.
- **Initial Concern**: Single-line text input (`Main Complaint / Discomfort`).

### 2.2 Step 2: Assessment Selector & Clinical Forms
After registering (or from `/patients/[id]`), practitioner chooses:

#### A. Physiotherapy Assessment (`/patients/[id]/assessment/physio`)
1. **Presenting Complaint**: Main Problem/Area of Concern, Onset Date/Time, Cause, Pain Description (Sharp/Dull/Throbbing), VAS Pain Score (0–10), Aggravating & Relieving Factors, Previous Treatments.
2. **Medical History**: Multi-select checkboxes (Diabetes, High BP, Heart Condition, Osteoporosis, Asthma, Epilepsy, Recent Surgery, Fractures, Neurological, Cancer, Others), Current Medications, Allergies.
3. **Functional Assessment**: Daily Activity Limitations, Work Status (Working, Not Working, Sick Leave, Retired), Type of Work, Hobbies/Sports.
4. **Physical Examination**: Posture Observation, Range of Motion (ROM), Muscle Strength Testing (MMT), Palpation Findings, Special Tests, Gait Analysis.
5. **Clinical Impression & Diagnosis**.
6. **Treatment Plan**: Short-Term & Long-Term Goals, Modalities (Manual Therapy, Electrotherapy, Exercise Therapy, Postural Training, Gait Training, Ergonomic Advice, Others), Practitioner Signature & Consent.

#### B. Neurotherapy Assessment (`/patients/[id]/assessment/neuro`)
1. **Presenting Complaint**: Diagnosis/Condition, Onset Date, Mode of Onset (Stroke, Trauma, Infection), Symptoms, Main Concerns, Pain Presence & Location, VAS Pain Score (0–10).
2. **Medical History**: Past Medical History, Current Medications, Allergies, History of Falls (Yes/No & Frequency), Assistive Devices Used (Yes/No & Type).
3. **Functional Assessment**: Mobility Status (Independent, Assistance, Wheelchair, Bedridden), ADLs, Sitting & Standing Balance (Good/Fair/Poor), Transfers (Independent, Assisted, Dependent), Gait (Normal, Ataxic, Hemiplegic, Spastic, Other), Communication, Cognition.
4. **Physical Examination**: Muscle Tone (Normal, Hypotonic, Hypertonic, Spastic, Rigid), Modified Ashworth Scale, MMT, ROM, Sensation, Reflexes, Coordination, Postural Assessment.
5. **Clinical Impression & Diagnosis**.
6. **Treatment Plan**: Short-Term & Long-Term Goals, Proposed Treatments (NDT, PNF, Balance Training, Gait Training, Strengthening, Stretching, Cognitive, Assistive Device Training, Caregiver Education, Others), Practitioner Signature & Consent.

### 2.3 Step 3: Branded Assessment Report & Sharing
- **Logo & Branding**: Features clinic logo from settings, clinic name, address, phone, patient UID, date, and practitioner details.
- **WhatsApp Share Button**: Generates pre-formatted WhatsApp message with assessment summary and digital report link.
- **Print / Export PDF**: Clean print-friendly CSS.
- **Proceed to Bill Generation**: Button navigating to `/billing?patientId=...` pre-populated with patient demographics and consulting doctor.

---

## 3. Data Schema Extensions

- **`Patient` Schema**:
  - `referral_source`: `'Self' | 'Doctor' | 'Walk-in' | 'Patient/Friend' | 'Other'`
  - `referral_doctor_name?: string`
  - `referral_clinic_name?: string`
  - `referral_contact?: string`
  - `initial_complaint?: string`

- **`ClinicalAssessment` Schema**:
  - `id`: `string`
  - `patient_id`: `string`
  - `patient_uid`: `string`
  - `type`: `'physiotherapy' | 'neurotherapy'`
  - `assessment_date`: `string`
  - `doctor_id?: string`
  - `doctor_name?: string`
  - `vas_score?: number`
  - `data`: `Record<string, any>` (JSON object holding form field answers)
  - `created_at`: `string`
