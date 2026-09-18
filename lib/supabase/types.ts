export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      patients: {
        Row: Patient
        Insert: PatientInsert
        Update: Partial<PatientInsert>
        Relationships: []
      }
      services: {
        Row: Service
        Insert: ServiceInsert
        Update: Partial<ServiceInsert>
        Relationships: []
      }
      visits: {
        Row: Visit
        Insert: VisitInsert
        Update: Partial<VisitInsert>
        Relationships: []
      }
      visit_services: {
        Row: VisitService
        Insert: VisitServiceInsert
        Update: Partial<VisitServiceInsert>
        Relationships: []
      }
      centres: {
        Row: Centre
        Insert: CentreInsert
        Update: Partial<CentreInsert>
        Relationships: []
      }
      doctors: {
        Row: Doctor
        Insert: DoctorInsert
        Update: Partial<DoctorInsert>
        Relationships: []
      }
      discount_presets: {
        Row: DiscountPreset
        Insert: DiscountPresetInsert
        Update: Partial<DiscountPresetInsert>
        Relationships: []
      }
      uid_counters: {
        Row: UidCounter
        Insert: UidCounter
        Update: Partial<UidCounter>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      generate_patient_uid: {
        Args: Record<string, never>
        Returns: string
      }
      generate_bill_number: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

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
  created_at: string
  updated_at: string
}
export type PatientInsert = Omit<Patient, 'id' | 'created_at' | 'updated_at'>

export interface Service {
  id: string
  name: string
  price: number
  created_at: string
  updated_at: string
}
export type ServiceInsert = Omit<Service, 'id' | 'created_at' | 'updated_at'>

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
  centre_name: string | null
  created_at: string
}
export type VisitInsert = Omit<Visit, 'id' | 'created_at'>

export interface VisitService {
  id: string
  visit_id: string
  service_id: string
  service_name: string
  price: number
  quantity: number
  created_at: string
}
export type VisitServiceInsert = Omit<VisitService, 'id' | 'created_at'>

export interface Centre {
  id: string
  name: string
  address: string | null
  phone: string | null
  email: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
export type CentreInsert = Omit<Centre, 'id' | 'created_at' | 'updated_at'>

export interface Doctor {
  id: string
  name: string
  specialization: string | null
  qualification?: string | null
  photo_url?: string | null
  experience_years?: string | null
  registration_number?: string | null
  bio?: string | null
  phone: string | null
  email: string | null
  centre_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}
export type DoctorInsert = Omit<Doctor, 'id' | 'created_at' | 'updated_at'>

export interface DiscountPreset {
  id: string
  label: string
  type: 'percentage' | 'fixed'
  value: number
  is_active: boolean
  created_at: string
}
export type DiscountPresetInsert = Omit<DiscountPreset, 'id' | 'created_at'>

export interface UidCounter {
  id: number
  patient_counter: number
  bill_counter: number
  counter_month: string
}

export interface VisitWithPatient extends Visit {
  patients: Pick<Patient, 'full_name' | 'uid' | 'age' | 'gender' | 'phone'>
}
export interface VisitWithServices extends Visit {
  visit_services: VisitService[]
  patients: Pick<Patient, 'full_name' | 'uid' | 'age' | 'gender' | 'phone'>
}
export interface DoctorWithCentre extends Doctor {
  centres: Pick<Centre, 'name'> | null
}

export interface StaffUser {
  id: string
  full_name: string
  email: string
  password?: string
  centre_id: string | null
  centre_name: string | null
  role: 'admin' | 'centre_staff' | 'doctor'
  doctor_id?: string | null
  doctor_name?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}
export type StaffUserInsert = Omit<StaffUser, 'id' | 'created_at' | 'updated_at'>

export interface PackagePreset {
  id: string
  name: string
  description?: string
  total_sessions: number
  price: number
  validity_days: number
  is_active: boolean
  created_at?: string
}

export interface PatientPackageCredit {
  id: string
  patient_id: string
  patient_uid: string
  patient_name: string
  patient_phone: string
  package_id?: string
  package_name: string
  total_sessions: number
  remaining_sessions: number
  used_sessions: number
  price_paid: number
  centre_id?: string | null
  centre_name?: string | null
  purchased_at: string
  expires_at?: string
  status: 'Active' | 'Exhausted' | 'Expired'
}

export interface PatientFeedback {
  id: string
  bill_number?: string
  patient_uid?: string
  patient_name: string
  patient_phone?: string
  doctor_name?: string
  centre_name?: string
  services_rendered?: string
  rating: number // 1 to 5
  hygiene_rating?: number // 1 to 5
  treatment_rating?: number // 1 to 5
  staff_rating?: number // 1 to 5
  comments?: string
  custom_answers?: Record<string, any>
  created_at: string
}

export type FormFieldType = 
  | 'star_rating'
  | 'linear_scale'
  | 'multiple_choice'
  | 'checkbox'
  | 'text'
  | 'textarea'
  | 'nps'

export interface FormField {
  id: string
  type: FormFieldType
  title: string
  description?: string
  required: boolean
  options?: string[] // For multiple_choice, checkbox
  min_scale?: number // For linear_scale (e.g. 1)
  max_scale?: number // For linear_scale (e.g. 5 or 10)
  min_label?: string // e.g. "Severe Pain" or "Poor"
  max_label?: string // e.g. "No Pain" or "Exceptional"
  category?: 'doctor' | 'treatment' | 'facility' | 'general'
}

export interface FeedbackFormTemplate {
  id: string
  title: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
  fields: FormField[]
  show_doctor_badge: boolean
  show_invoice_badge: boolean
  show_centre_badge: boolean
  show_procedures_badge: boolean
  accent_color?: string
}

export type ExpenseCategory = 
  | 'Staff Salaries'
  | 'Rent & Lease'
  | 'Equipment & Maintenance'
  | 'Medical Supplies'
  | 'Utilities & Bills'
  | 'Marketing & Admin'
  | 'Miscellaneous'

export interface ClinicExpense {
  id: string
  expense_date: string
  category: ExpenseCategory
  description: string
  amount: number
  centre_id?: string | null
  centre_name?: string | null
  logged_by_name?: string
  payment_method?: 'Cash' | 'Bank Transfer' | 'UPI' | 'Card'
  created_at: string
}