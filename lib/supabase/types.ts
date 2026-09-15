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