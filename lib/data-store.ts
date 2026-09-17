import { createClient } from '@/lib/supabase/client'
import type { Centre, Doctor, Patient, Service, DiscountPreset, PackagePreset, PatientPackageCredit, PatientFeedback, FeedbackFormTemplate, FormField } from '@/lib/supabase/types'
import * as XLSX from 'xlsx'

const DEFAULT_CENTRES: Centre[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'New Friends Colony, New Delhi',
    address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
    phone: '08383936905',
    email: 'nfc@physionautics.com',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Vasant Vihar, New Delhi',
    address: '86 Basement, Poorvi Marg, Indian Air Lines & Air India Estate, Vasant Vihar, New Delhi, Delhi 110057',
    phone: '08700264533',
    email: 'vasantvihar@physionautics.com',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'Gurugram – DLF Phase 1',
    address: 'C2/17, Arjun Marg, DLF Phase 1, Gurugram, Haryana – 122002',
    phone: '+91 92171 83736',
    email: 'gurugram@physionautics.com',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: 'doc-101',
    name: 'Dr. Sarah Jenkins',
    specialization: 'Orthopedic Physiotherapy',
    phone: '+91 98111 00001',
    email: 'sarah@physionautics.com',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'doc-102',
    name: 'Dr. Rajesh Sharma',
    specialization: 'Sports Rehabilitation',
    phone: '+91 98111 00002',
    email: 'rajesh@physionautics.com',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'doc-201',
    name: 'Dr. Emily Watson',
    specialization: 'Neuro Physiotherapy',
    phone: '+91 98111 00003',
    email: 'emily@physionautics.com',
    centre_id: 'c2222222-2222-2222-2222-222222222222',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'doc-202',
    name: 'Dr. Michael Chang',
    specialization: 'Spine & Posture Specialist',
    phone: '+91 98111 00004',
    email: 'michael@physionautics.com',
    centre_id: 'c2222222-2222-2222-2222-222222222222',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'doc-301',
    name: 'Dr. Priya Nair',
    specialization: 'Cardiorespiratory Rehab',
    phone: '+91 98111 00005',
    email: 'priya@physionautics.com',
    centre_id: 'c3333333-3333-3333-3333-333333333333',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'doc-302',
    name: 'Dr. David Kim',
    specialization: 'Pediatric Physiotherapy',
    phone: '+91 98111 00006',
    email: 'david@physionautics.com',
    centre_id: 'c3333333-3333-3333-3333-333333333333',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export const DEFAULT_SERVICES: Service[] = [
  { id: 'svc-1', name: 'Initial Consultation & Assessment', price: 600, created_at: '', updated_at: '' },
  { id: 'svc-2', name: 'Follow-up Consultation & Review', price: 400, created_at: '', updated_at: '' },
  { id: 'svc-3', name: 'Standard Physiotherapy Session (45 min)', price: 800, created_at: '', updated_at: '' },
  { id: 'svc-4', name: 'Manual Therapy & Joint Mobilization', price: 900, created_at: '', updated_at: '' },
  { id: 'svc-5', name: 'Electrotherapy (IFT / TENS / Ultrasound)', price: 500, created_at: '', updated_at: '' },
  { id: 'svc-6', name: 'Spine Decompression & Mechanical Traction', price: 950, created_at: '', updated_at: '' },
  { id: 'svc-7', name: 'Dry Needling Therapy (Trigger Point Release)', price: 750, created_at: '', updated_at: '' },
  { id: 'svc-8', name: 'Cupping & Myofascial Release Therapy', price: 700, created_at: '', updated_at: '' },
  { id: 'svc-9', name: 'Sports Injury Rehabilitation & Conditioning', price: 1200, created_at: '', updated_at: '' },
  { id: 'svc-10', name: 'Post-Operative Orthopedic Rehab (ACL/Knee/Hip)', price: 1100, created_at: '', updated_at: '' },
  { id: 'svc-11', name: 'Neurological Rehabilitation Session', price: 1300, created_at: '', updated_at: '' },
  { id: 'svc-12', name: 'Kinesiology Taping & Strapping', price: 450, created_at: '', updated_at: '' },
  { id: 'svc-13', name: 'Stroke & Paralysis Functional Rehab', price: 1500, created_at: '', updated_at: '' },
  { id: 'svc-14', name: 'Ergonomic Evaluation & Posture Correction', price: 850, created_at: '', updated_at: '' },
  { id: 'svc-15', name: 'High-Power Laser Therapy (Class 4)', price: 1000, created_at: '', updated_at: '' },
  { id: 'svc-16', name: 'Chest Physiotherapy & Postural Drainage', price: 750, created_at: '', updated_at: '' },
  { id: 'svc-17', name: 'Pediatric Physiotherapy & Motor Skills', price: 1000, created_at: '', updated_at: '' },
  { id: 'svc-18', name: 'Full Body Wellness & Recovery Package', price: 2500, created_at: '', updated_at: '' },
  { id: 'svc-19', name: '5-Session Pain Relief & Recovery Bundle', price: 3600, created_at: '', updated_at: '' },
  { id: 'svc-20', name: '10-Session Comprehensive Rehab Bundle', price: 6800, created_at: '', updated_at: '' },
  { id: 'svc-21', name: '20-Session Spine & Neuro Extended Rehab', price: 12500, created_at: '', updated_at: '' },
]

// ================= SERVICES =================
export async function getServices(): Promise<Service[]> {
  try {
    const supabase = createClient()
    const { data } = await supabase.from('services').select('*').order('name')
    if (data && data.length > 0) {
      localStorage.setItem('physio_services_cache_v2', JSON.stringify(data))
      return data as unknown as Service[]
    }
  } catch (_) {}

  const cached = localStorage.getItem('physio_services_cache_v2')
  if (cached) {
    try {
      const parsed: Service[] = JSON.parse(cached)
      if (parsed.length > 0) return parsed
    } catch (_) {}
  }
  localStorage.setItem('physio_services_cache_v2', JSON.stringify(DEFAULT_SERVICES))
  return DEFAULT_SERVICES
}

export async function saveService(s: { id?: string; name: string; price: number }): Promise<Service> {
  const current = await getServices()
  let updated: Service[]
  let savedService: Service

  if (s.id) {
    savedService = {
      ...current.find(item => item.id === s.id)!,
      name: s.name.trim(),
      price: s.price,
      updated_at: new Date().toISOString(),
    } as Service
    updated = current.map(item => item.id === s.id ? savedService : item)
  } else {
    savedService = {
      id: `svc-${Date.now()}`,
      name: s.name.trim(),
      price: s.price,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    updated = [...current, savedService]
  }

  localStorage.setItem('physio_services_cache_v2', JSON.stringify(updated))

  try {
    const supabase = createClient()
    if (s.id) {
      await supabase.from('services').update({ name: savedService.name, price: savedService.price }).eq('id', s.id)
    } else {
      await supabase.from('services').insert({ name: savedService.name, price: savedService.price })
    }
  } catch (_) {}

  return savedService
}

export async function deleteService(id: string): Promise<void> {
  const current = await getServices()
  const updated = current.filter(s => s.id !== id)
  localStorage.setItem('physio_services_cache_v2', JSON.stringify(updated))
  try {
    await createClient().from('services').delete().eq('id', id)
  } catch (_) {}
}

export async function resetDefaultServices(): Promise<Service[]> {
  localStorage.setItem('physio_services_cache_v2', JSON.stringify(DEFAULT_SERVICES))
  return DEFAULT_SERVICES
}

// ================= CENTRES =================
export async function getCentres(): Promise<Centre[]> {
  const CACHE_KEY = 'physio_centres_cache_v5'
  try {
    const supabase = createClient()
    const { data } = await supabase.from('centres').select('*').order('name')
    if (data && data.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      return data as unknown as Centre[]
    }
  } catch (_) {}

  const cached = localStorage.getItem(CACHE_KEY)
  if (cached) {
    try {
      const parsed: Centre[] = JSON.parse(cached)
      if (parsed.length >= 3 && parsed.some(c => c.name.includes('Friends') || c.name.includes('Vasant') || c.name.includes('Gurugram'))) {
        return parsed
      }
    } catch (_) {}
  }
  localStorage.setItem(CACHE_KEY, JSON.stringify(DEFAULT_CENTRES))
  return DEFAULT_CENTRES
}

export async function saveCentre(c: Partial<Centre>): Promise<Centre> {
  const current = await getCentres()
  let updated: Centre[]
  let savedCentre: Centre

  if (c.id) {
    savedCentre = {
      ...current.find(item => item.id === c.id)!,
      ...c,
      updated_at: new Date().toISOString(),
    } as Centre
    updated = current.map(item => item.id === c.id ? savedCentre : item)
  } else {
    savedCentre = {
      id: `centre-${Date.now()}`,
      name: c.name || 'New Clinic Centre',
      address: c.address || null,
      phone: c.phone || null,
      email: c.email || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    updated = [...current, savedCentre]
  }

  localStorage.setItem('physio_centres_cache_v5', JSON.stringify(updated))

  try {
    const supabase = createClient()
    if (c.id) {
      await supabase.from('centres').update({
        name: savedCentre.name,
        address: savedCentre.address,
        phone: savedCentre.phone,
        email: savedCentre.email,
        is_active: savedCentre.is_active,
      }).eq('id', c.id)
    } else {
      await supabase.from('centres').insert({
        name: savedCentre.name,
        address: savedCentre.address,
        phone: savedCentre.phone,
        email: savedCentre.email,
        is_active: true,
      })
    }
  } catch (_) {}

  return savedCentre
}

export async function toggleCentreActive(id: string): Promise<void> {
  const current = await getCentres()
  const updated = current.map(c => c.id === id ? { ...c, is_active: !c.is_active } : c)
  localStorage.setItem('physio_centres_cache', JSON.stringify(updated))
  try {
    const found = updated.find(c => c.id === id)
    if (found) {
      await createClient().from('centres').update({ is_active: found.is_active }).eq('id', id)
    }
  } catch (_) {}
}

export async function deleteCentre(id: string): Promise<void> {
  const current = await getCentres()
  const updated = current.filter(c => c.id !== id)
  localStorage.setItem('physio_centres_cache', JSON.stringify(updated))
  try {
    await createClient().from('centres').delete().eq('id', id)
  } catch (_) {}
}

// ================= DOCTORS =================
export async function getDoctors(centreId?: string): Promise<Doctor[]> {
  const CACHE_KEY = 'physio_doctors_cache_v5'
  let list: Doctor[] = DEFAULT_DOCTORS
  try {
    const supabase = createClient()
    let q = supabase.from('doctors').select('*').order('name')
    if (centreId && centreId !== 'all') q = q.eq('centre_id', centreId)
    const { data } = await q
    if (data && data.length > 0) {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      return data as unknown as Doctor[]
    }
  } catch (_) {}

  const cached = localStorage.getItem(CACHE_KEY)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed) && parsed.length >= 6) list = parsed
    } catch (_) {}
  }
  if (list.length < 6) {
    list = DEFAULT_DOCTORS
    localStorage.setItem(CACHE_KEY, JSON.stringify(DEFAULT_DOCTORS))
  }

  if (centreId && centreId !== 'all') {
    return list.filter(d => d.centre_id === centreId)
  }
  return list
}

export async function saveDoctor(d: Partial<Doctor>): Promise<Doctor> {
  const current = await getDoctors()
  let updated: Doctor[]
  let savedDoc: Doctor

  if (d.id) {
    savedDoc = {
      ...current.find(item => item.id === d.id)!,
      ...d,
      updated_at: new Date().toISOString(),
    } as Doctor
    updated = current.map(item => item.id === d.id ? savedDoc : item)
  } else {
    savedDoc = {
      id: `doc-${Date.now()}`,
      name: d.name || 'Dr. New Doctor',
      specialization: d.specialization || null,
      phone: d.phone || null,
      email: d.email || null,
      centre_id: d.centre_id || null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    updated = [...current, savedDoc]
  }

  localStorage.setItem('physio_doctors_cache_v5', JSON.stringify(updated))
  try {
    const supabase = createClient()
    if (d.id) {
      await supabase.from('doctors').update({
        name: savedDoc.name,
        specialization: savedDoc.specialization,
        phone: savedDoc.phone,
        email: savedDoc.email,
        centre_id: savedDoc.centre_id,
        is_active: savedDoc.is_active,
      }).eq('id', d.id)
    } else {
      await supabase.from('doctors').insert({
        name: savedDoc.name,
        specialization: savedDoc.specialization,
        phone: savedDoc.phone,
        email: savedDoc.email,
        centre_id: savedDoc.centre_id,
        is_active: true,
      })
    }
  } catch (_) {}

  return savedDoc
}

export async function bulkImportDoctors(doctors: Partial<Doctor>[]): Promise<number> {
  const current = await getDoctors()
  const newDocs: Doctor[] = doctors.map((d, index) => ({
    id: `doc-imp-${Date.now()}-${index}`,
    name: d.name || 'Dr. Unknown',
    specialization: d.specialization || 'Physiotherapist',
    phone: d.phone || null,
    email: d.email || null,
    centre_id: d.centre_id || null,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  const combined = [...current, ...newDocs]
  localStorage.setItem('physio_doctors_cache', JSON.stringify(combined))

  try {
    const supabase = createClient()
    await supabase.from('doctors').insert(newDocs.map(d => ({
      name: d.name,
      specialization: d.specialization,
      phone: d.phone,
      email: d.email,
      centre_id: d.centre_id,
      is_active: true,
    })))
  } catch (_) {}

  return newDocs.length
}

export async function deleteDoctor(id: string): Promise<void> {
  const current = await getDoctors()
  const updated = current.filter(d => d.id !== id)
  localStorage.setItem('physio_doctors_cache', JSON.stringify(updated))
  try {
    await createClient().from('doctors').delete().eq('id', id)
  } catch (_) {}
}

export async function toggleDoctorActive(id: string): Promise<void> {
  const current = await getDoctors()
  const updated = current.map(d => d.id === id ? { ...d, is_active: !d.is_active } : d)
  localStorage.setItem('physio_doctors_cache', JSON.stringify(updated))
  try {
    const found = updated.find(d => d.id === id)
    if (found) {
      await createClient().from('doctors').update({ is_active: found.is_active }).eq('id', id)
    }
  } catch (_) {}
}

// ================= PATIENTS =================
export async function getPatients(query?: string): Promise<Patient[]> {
  const CACHE_KEY = 'physio_patients_cache_v5'
  
  // 1. Get cached patients first
  let cachedPatients: Patient[] = []
  const cachedRaw = localStorage.getItem(CACHE_KEY) || localStorage.getItem('physio_patients_cache')
  if (cachedRaw) {
    try {
      const parsed = JSON.parse(cachedRaw)
      if (Array.isArray(parsed)) cachedPatients = parsed
    } catch (_) {}
  }
  if (cachedPatients.length === 0) {
    cachedPatients = DEMO_PATIENTS
  }

  let dbPatients: Patient[] = []
  try {
    const supabase = createClient()
    let q = supabase.from('patients').select('*').order('created_at', { ascending: false })
    const { data } = await q.limit(300)
    if (data && data.length > 0) {
      dbPatients = data as unknown as Patient[]
    }
  } catch (_) {}

  // Merge DB patients with cached patients (deduplicating by ID and UID, preferring newest)
  const map = new Map<string, Patient>()
  
  // Add cached first
  cachedPatients.forEach(p => {
    if (p.id) map.set(p.id, p)
    if (p.uid) map.set(p.uid, p)
  })

  // Merge DB patients over cached
  dbPatients.forEach(p => {
    if (p.id) map.set(p.id, p)
    if (p.uid) map.set(p.uid, p)
  })

  const mergedList = Array.from(new Set(map.values())).sort((a, b) => {
    const da = new Date(a.created_at || 0).getTime()
    const db = new Date(b.created_at || 0).getTime()
    return db - da
  })

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(mergedList))
    localStorage.setItem('physio_patients_cache', JSON.stringify(mergedList))
  } catch (_) {}

  if (query?.trim()) {
    const lower = query.toLowerCase().trim()
    return mergedList.filter(p => 
      p.full_name.toLowerCase().includes(lower) ||
      p.uid.toLowerCase().includes(lower) ||
      p.phone.includes(lower)
    )
  }

  return mergedList
}

export async function bulkImportPatients(patients: Partial<Patient>[]): Promise<number> {
  const current = await getPatients()
  const now = new Date()
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`

  const newPatients: Patient[] = patients.map((p, idx) => ({
    id: `pat-imp-${Date.now()}-${idx}`,
    uid: `CLN-${yyyymm}-${String(current.length + idx + 1).padStart(4, '0')}`,
    full_name: p.full_name || 'Patient',
    age: p.age || 30,
    gender: (p.gender as any) || 'Male',
    phone: p.phone || '9999999999',
    email: p.email || null,
    address: p.address || null,
    blood_group: (p.blood_group as any) || null,
    medical_notes: p.medical_notes || 'Bulk imported via Excel',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }))

  const combined = [...newPatients, ...current]
  localStorage.setItem('physio_patients_cache', JSON.stringify(combined))

  try {
    const supabase = createClient()
    await supabase.from('patients').insert(newPatients.map(p => ({
      uid: p.uid,
      full_name: p.full_name,
      age: p.age,
      gender: p.gender,
      phone: p.phone,
      email: p.email,
      address: p.address,
      blood_group: p.blood_group,
      medical_notes: p.medical_notes,
    })))
  } catch (_) {}

  return newPatients.length
}

export function exportPatientsToExcel(patients: Patient[]) {
  const exportData = patients.map(p => ({
    'Patient UID': p.uid,
    'Full Name': p.full_name,
    'Age': p.age,
    'Gender': p.gender,
    'Phone': p.phone,
    'Email': p.email || '',
    'Address': p.address || '',
    'Blood Group': p.blood_group || '',
    'Medical Notes': p.medical_notes || '',
    'Registered Date': p.created_at ? new Date(p.created_at).toLocaleDateString() : '',
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Patients')
  XLSX.writeFile(wb, `Physionautics_Patients_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export async function registerPatient(input: {
  full_name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  phone: string
  email?: string | null
  address?: string | null
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-' | null
  medical_notes?: string | null
}): Promise<{ id: string; uid: string }> {
  const current = await getPatients()
  const now = new Date()
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const fallbackUid = `CLN-${yyyymm}-${String(current.length + 1).padStart(4, '0')}`
  const fallbackId = `pat-${Date.now()}`

  let finalId = fallbackId
  let finalUid = fallbackUid

  try {
    const supabase = createClient()
    const { data: generatedUid, error: uidErr } = await supabase.rpc('generate_patient_uid')
    const uidToUse = (!uidErr && generatedUid) ? generatedUid : fallbackUid

    const { data, error } = await supabase.from('patients').insert({
      uid: uidToUse,
      full_name: input.full_name.trim(),
      age: Number(input.age),
      gender: input.gender,
      phone: input.phone.trim(),
      email: input.email || null,
      address: input.address || null,
      blood_group: input.blood_group || null,
      medical_notes: input.medical_notes || null,
    }).select('id, uid').single()

    if (!error && data) {
      finalId = data.id
      finalUid = data.uid
    }
  } catch (err) {
    console.warn('Supabase patient insert failed, using resilient local storage fallback:', err)
  }

  const newPatient: Patient = {
    id: finalId,
    uid: finalUid,
    full_name: input.full_name.trim(),
    age: Number(input.age),
    gender: input.gender,
    phone: input.phone.trim(),
    email: input.email || null,
    address: input.address || null,
    blood_group: input.blood_group || null,
    medical_notes: input.medical_notes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const updatedList = [newPatient, ...current.filter(p => p.id !== finalId && p.uid !== finalUid)]
  try {
    localStorage.setItem('physio_patients_cache_v5', JSON.stringify(updatedList))
    localStorage.setItem('physio_patients_cache', JSON.stringify(updatedList))
  } catch (_) {}

  return { id: finalId, uid: finalUid }
}

// ================= VISITS & BILLING DATA =================
export interface BillLineItem {
  id?: string
  service_id?: string
  service_name: string
  price: number
  quantity: number
  total: number
}

export interface StoredVisit {
  id: string
  bill_number: string
  patient_id: string
  patient_uid: string
  patient_name: string
  patient_phone: string
  patient_age?: number
  patient_gender?: string
  patient_address?: string
  doctor_id?: string | null
  doctor_name?: string | null
  doctor_specialization?: string | null
  centre_id?: string | null
  centre_name?: string | null
  centre_address?: string | null
  centre_phone?: string | null
  items: BillLineItem[]
  subtotal: number
  discount: number
  discount_preset_name?: string
  total: number
  payment_mode: 'Cash' | 'Card' | 'UPI' | 'Insurance' | 'Bank Transfer'
  payment_status: 'Paid' | 'Pending'
  notes?: string
  visit_date: string
  created_at: string
}

const DEFAULT_VISITS: StoredVisit[] = [
  {
    id: 'vis-101',
    bill_number: 'INV-202608-0014',
    patient_id: 'pat-101',
    patient_uid: 'CLN-202609-0001',
    patient_name: 'Rahul Verma',
    patient_phone: '+91 98765 11111',
    patient_age: 38,
    patient_gender: 'Male',
    patient_address: 'Flat 402, Green Meadows, New Friends Colony, New Delhi',
    doctor_id: 'doc-101',
    doctor_name: 'Dr. Sarah Jenkins',
    doctor_specialization: 'Orthopedic Physiotherapy',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    centre_name: 'New Friends Colony, New Delhi',
    centre_address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
    centre_phone: '08383936905',
    items: [
      { service_name: 'Initial Consultation & Assessment', price: 600, quantity: 1, total: 600 },
      { service_name: 'Post-Operative Orthopedic Rehab (ACL/Knee/Hip)', price: 1100, quantity: 1, total: 1100 },
    ],
    subtotal: 1700,
    discount: 170,
    discount_preset_name: 'Welcome 10% Discount',
    total: 1530,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'Initial post-ACL reconstruction evaluation. Active flexion 70 deg, significant quadriceps inhibition.',
    visit_date: new Date(Date.now() - 86400000 * 42).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 42).toISOString(),
  },
  {
    id: 'vis-102',
    bill_number: 'INV-202608-0038',
    patient_id: 'pat-101',
    patient_uid: 'CLN-202609-0001',
    patient_name: 'Rahul Verma',
    patient_phone: '+91 98765 11111',
    patient_age: 38,
    patient_gender: 'Male',
    patient_address: 'Flat 402, Green Meadows, New Friends Colony, New Delhi',
    doctor_id: 'doc-102',
    doctor_name: 'Dr. Rajesh Sharma',
    doctor_specialization: 'Sports Rehabilitation',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    centre_name: 'New Friends Colony, New Delhi',
    centre_address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
    centre_phone: '08383936905',
    items: [
      { service_name: 'Standard Physiotherapy Session (45 min)', price: 800, quantity: 1, total: 800 },
      { service_name: 'Electrotherapy (IFT / TENS / Ultrasound)', price: 500, quantity: 1, total: 500 },
    ],
    subtotal: 1300,
    discount: 100,
    discount_preset_name: 'Privilege Member (₹100)',
    total: 1200,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'Flexion achieved 95 deg. Isometric quad sets and straight leg raises with minimal discomfort.',
    visit_date: new Date(Date.now() - 86400000 * 28).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 28).toISOString(),
  },
  {
    id: 'vis-103',
    bill_number: 'INV-202609-0005',
    patient_id: 'pat-101',
    patient_uid: 'CLN-202609-0001',
    patient_name: 'Rahul Verma',
    patient_phone: '+91 98765 11111',
    patient_age: 38,
    patient_gender: 'Male',
    patient_address: 'Flat 402, Green Meadows, New Friends Colony, New Delhi',
    doctor_id: 'doc-301',
    doctor_name: 'Dr. Priya Nair',
    doctor_specialization: 'Cardiorespiratory Rehab',
    centre_id: 'c3333333-3333-3333-3333-333333333333',
    centre_name: 'Gurugram – DLF Phase 1',
    centre_address: 'C2/17, Arjun Marg, DLF Phase 1, Gurugram, Haryana – 122002',
    centre_phone: '+91 92171 83736',
    items: [
      { service_name: 'Sports Injury Rehabilitation & Conditioning', price: 1200, quantity: 1, total: 1200 },
      { service_name: 'Dry Needling Therapy (Trigger Point Release)', price: 750, quantity: 1, total: 750 },
    ],
    subtotal: 1950,
    discount: 200,
    discount_preset_name: 'Corporate Desk Discount',
    total: 1750,
    payment_mode: 'Card',
    payment_status: 'Paid',
    notes: 'Cross-centre treatment visit at Gurugram clinic. ROM 115 deg, progression to agility drills.',
    visit_date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'vis-104',
    bill_number: 'INV-202608-0021',
    patient_id: 'pat-102',
    patient_uid: 'CLN-202609-0002',
    patient_name: 'Ananya Sharma',
    patient_phone: '+91 98765 22222',
    patient_age: 29,
    patient_gender: 'Female',
    patient_address: '12 Poorvi Marg, Vasant Vihar, New Delhi - 110057',
    doctor_id: 'doc-201',
    doctor_name: 'Dr. Emily Watson',
    doctor_specialization: 'Neuro Physiotherapy',
    centre_id: 'c2222222-2222-2222-2222-222222222222',
    centre_name: 'Vasant Vihar, New Delhi',
    centre_address: '86 Basement, Poorvi Marg, Indian Air Lines & Air India Estate, Vasant Vihar, New Delhi, Delhi 110057',
    centre_phone: '08700264533',
    items: [
      { service_name: 'Initial Consultation & Assessment', price: 600, quantity: 1, total: 600 },
      { service_name: 'Spine Decompression & Mechanical Traction', price: 950, quantity: 1, total: 950 },
    ],
    subtotal: 1550,
    discount: 155,
    discount_preset_name: 'Welcome 10% Discount',
    total: 1395,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'Severe C5-C6 cervical radicular pain. 6kg intermittent traction administered with noticeable relief.',
    visit_date: new Date(Date.now() - 86400000 * 26).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 26).toISOString(),
  },
  {
    id: 'vis-105',
    bill_number: 'INV-202609-0001',
    patient_id: 'pat-102',
    patient_uid: 'CLN-202609-0002',
    patient_name: 'Ananya Sharma',
    patient_phone: '+91 98765 22222',
    patient_age: 29,
    patient_gender: 'Female',
    patient_address: '12 Poorvi Marg, Vasant Vihar, New Delhi - 110057',
    doctor_id: 'doc-202',
    doctor_name: 'Dr. Michael Chang',
    doctor_specialization: 'Spine & Posture Specialist',
    centre_id: 'c2222222-2222-2222-2222-222222222222',
    centre_name: 'Vasant Vihar, New Delhi',
    centre_address: '86 Basement, Poorvi Marg, Indian Air Lines & Air India Estate, Vasant Vihar, New Delhi, Delhi 110057',
    centre_phone: '08700264533',
    items: [
      { service_name: 'Manual Therapy & Joint Mobilization', price: 900, quantity: 1, total: 900 },
      { service_name: 'Cupping & Myofascial Release Therapy', price: 700, quantity: 1, total: 700 },
    ],
    subtotal: 1600,
    discount: 100,
    discount_preset_name: 'Staff Loyalty Discount',
    total: 1500,
    payment_mode: 'Cash',
    payment_status: 'Paid',
    notes: 'C-spine Grade II mobilization and upper trapezius myofascial release.',
    visit_date: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'vis-106',
    bill_number: 'INV-202609-0012',
    patient_id: 'pat-102',
    patient_uid: 'CLN-202609-0002',
    patient_name: 'Ananya Sharma',
    patient_phone: '+91 98765 22222',
    patient_age: 29,
    patient_gender: 'Female',
    patient_address: '12 Poorvi Marg, Vasant Vihar, New Delhi - 110057',
    doctor_id: 'doc-101',
    doctor_name: 'Dr. Sarah Jenkins',
    doctor_specialization: 'Orthopedic Physiotherapy',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    centre_name: 'New Friends Colony, New Delhi',
    centre_address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
    centre_phone: '08383936905',
    items: [
      { service_name: 'Follow-up Consultation & Review', price: 400, quantity: 1, total: 400 },
      { service_name: 'Standard Physiotherapy Session (45 min)', price: 800, quantity: 1, total: 800 },
    ],
    subtotal: 1200,
    discount: 120,
    discount_preset_name: 'Privilege 10%',
    total: 1080,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'Follow-up visit at New Friends Colony clinic. Cervical pain visual analog score down to 2/10.',
    visit_date: new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'vis-107',
    bill_number: 'INV-202608-0029',
    patient_id: 'pat-103',
    patient_uid: 'CLN-202609-0003',
    patient_name: 'Vikram Malhotra',
    patient_phone: '+91 98210 98765',
    patient_age: 54,
    patient_gender: 'Male',
    patient_address: 'Villa 45, Phase 1, DLF City, Gurugram - 122002',
    doctor_id: 'doc-301',
    doctor_name: 'Dr. Priya Nair',
    doctor_specialization: 'Cardiorespiratory Rehab',
    centre_id: 'c3333333-3333-3333-3333-333333333333',
    centre_name: 'Gurugram – DLF Phase 1',
    centre_address: 'C2/17, Arjun Marg, DLF Phase 1, Gurugram, Haryana – 122002',
    centre_phone: '+91 92171 83736',
    items: [
      { service_name: 'Initial Consultation & Assessment', price: 600, quantity: 1, total: 600 },
      { service_name: 'Manual Therapy & Joint Mobilization', price: 900, quantity: 1, total: 900 },
      { service_name: 'Dry Needling Therapy (Trigger Point Release)', price: 750, quantity: 1, total: 750 },
    ],
    subtotal: 2250,
    discount: 250,
    discount_preset_name: 'Senior Citizen Discount',
    total: 2000,
    payment_mode: 'Card',
    payment_status: 'Paid',
    notes: 'Frozen shoulder right GH joint. Marked capsular stiffness. Grade II glide provided.',
    visit_date: new Date(Date.now() - 86400000 * 24).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 24).toISOString(),
  },
  {
    id: 'vis-108',
    bill_number: 'INV-202609-0008',
    patient_id: 'pat-103',
    patient_uid: 'CLN-202609-0003',
    patient_name: 'Vikram Malhotra',
    patient_phone: '+91 98210 98765',
    patient_age: 54,
    patient_gender: 'Male',
    patient_address: 'Villa 45, Phase 1, DLF City, Gurugram - 122002',
    doctor_id: 'doc-302',
    doctor_name: 'Dr. David Kim',
    doctor_specialization: 'Pediatric Physiotherapy',
    centre_id: 'c3333333-3333-3333-3333-333333333333',
    centre_name: 'Gurugram – DLF Phase 1',
    centre_address: 'C2/17, Arjun Marg, DLF Phase 1, Gurugram, Haryana – 122002',
    centre_phone: '+91 92171 83736',
    items: [
      { service_name: 'Standard Physiotherapy Session (45 min)', price: 800, quantity: 1, total: 800 },
      { service_name: 'Electrotherapy (IFT / TENS / Ultrasound)', price: 500, quantity: 1, total: 500 },
      { service_name: 'Kinesiology Taping & Strapping', price: 450, quantity: 1, total: 450 },
    ],
    subtotal: 1750,
    discount: 150,
    discount_preset_name: 'Loyalty Privilege',
    total: 1600,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'Inferior & posterior glide mobilizations. Abduction improved to 105 deg.',
    visit_date: new Date(Date.now() - 86400000 * 8).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: 'vis-109',
    bill_number: 'INV-202609-0003',
    patient_id: 'pat-104',
    patient_uid: 'CLN-202609-0004',
    patient_name: 'Priya Sundaram',
    patient_phone: '+91 99100 87654',
    patient_age: 42,
    patient_gender: 'Female',
    patient_address: 'C-14, Maharani Bagh, New Delhi',
    doctor_id: 'doc-101',
    doctor_name: 'Dr. Sarah Jenkins',
    doctor_specialization: 'Orthopedic Physiotherapy',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    centre_name: 'New Friends Colony, New Delhi',
    centre_address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
    centre_phone: '08383936905',
    items: [
      { service_name: 'Initial Consultation & Assessment', price: 600, quantity: 1, total: 600 },
      { service_name: 'Spine Decompression & Mechanical Traction', price: 950, quantity: 1, total: 950 },
    ],
    subtotal: 1550,
    discount: 150,
    discount_preset_name: 'Clinic Community Offer',
    total: 1400,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'L4-L5 spondylolisthesis evaluation. Directional preference core stabilization initiated.',
    visit_date: new Date(Date.now() - 86400000 * 18).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
  },
  {
    id: 'vis-110',
    bill_number: 'INV-202609-0010',
    patient_id: 'pat-104',
    patient_uid: 'CLN-202609-0004',
    patient_name: 'Priya Sundaram',
    patient_phone: '+91 99100 87654',
    patient_age: 42,
    patient_gender: 'Female',
    patient_address: 'C-14, Maharani Bagh, New Delhi',
    doctor_id: 'doc-201',
    doctor_name: 'Dr. Emily Watson',
    doctor_specialization: 'Neuro Physiotherapy',
    centre_id: 'c2222222-2222-2222-2222-222222222222',
    centre_name: 'Vasant Vihar, New Delhi',
    centre_address: '86 Basement, Poorvi Marg, Indian Air Lines & Air India Estate, Vasant Vihar, New Delhi, Delhi 110057',
    centre_phone: '08700264533',
    items: [
      { service_name: 'Follow-up Consultation & Review', price: 400, quantity: 1, total: 400 },
      { service_name: 'Electrotherapy (IFT / TENS / Ultrasound)', price: 500, quantity: 1, total: 500 },
    ],
    subtotal: 900,
    discount: 0,
    total: 900,
    payment_mode: 'Cash',
    payment_status: 'Paid',
    notes: 'Cross-branch review in Vasant Vihar. Sciatica resolved, dynamic isometric core exercises prescribed.',
    visit_date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 'vis-111',
    bill_number: 'INV-202608-0019',
    patient_id: 'pat-105',
    patient_uid: 'CLN-202609-0005',
    patient_name: 'Rajesh Khanna',
    patient_phone: '+91 98188 11223',
    patient_age: 61,
    patient_gender: 'Male',
    patient_address: 'B-72, Greater Kailash 1, New Delhi',
    doctor_id: 'doc-102',
    doctor_name: 'Dr. Rajesh Sharma',
    doctor_specialization: 'Sports Rehabilitation',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    centre_name: 'New Friends Colony, New Delhi',
    centre_address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
    centre_phone: '08383936905',
    items: [
      { service_name: 'Initial Consultation & Assessment', price: 600, quantity: 1, total: 600 },
      { service_name: 'Standard Physiotherapy Session (45 min)', price: 800, quantity: 1, total: 800 },
      { service_name: 'Electrotherapy (IFT / TENS / Ultrasound)', price: 500, quantity: 1, total: 500 },
    ],
    subtotal: 1900,
    discount: 200,
    discount_preset_name: 'Senior Citizen Discount',
    total: 1700,
    payment_mode: 'Cash',
    payment_status: 'Paid',
    notes: 'Bilateral knee osteoarthritis. High joint load. Shortwave diathermy and quad activation.',
    visit_date: new Date(Date.now() - 86400000 * 32).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 32).toISOString(),
  },
  {
    id: 'vis-112',
    bill_number: 'INV-202609-0004',
    patient_id: 'pat-105',
    patient_uid: 'CLN-202609-0005',
    patient_name: 'Rajesh Khanna',
    patient_phone: '+91 98188 11223',
    patient_age: 61,
    patient_gender: 'Male',
    patient_address: 'B-72, Greater Kailash 1, New Delhi',
    doctor_id: 'doc-102',
    doctor_name: 'Dr. Rajesh Sharma',
    doctor_specialization: 'Sports Rehabilitation',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    centre_name: 'New Friends Colony, New Delhi',
    centre_address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
    centre_phone: '08383936905',
    items: [
      { service_name: 'Post-Operative Orthopedic Rehab (ACL/Knee/Hip)', price: 1100, quantity: 1, total: 1100 },
      { service_name: 'Manual Therapy & Joint Mobilization', price: 900, quantity: 1, total: 900 },
    ],
    subtotal: 2000,
    discount: 200,
    discount_preset_name: 'Senior Citizen Privilege',
    total: 1800,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'VMO biofeedback training and gait retraining with viscoelastic knee supports.',
    visit_date: new Date(Date.now() - 86400000 * 16).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 16).toISOString(),
  },
  {
    id: 'vis-113',
    bill_number: 'INV-202609-0006',
    patient_id: 'pat-106',
    patient_uid: 'CLN-202609-0006',
    patient_name: 'Meera Nair',
    patient_phone: '+91 97112 34567',
    patient_age: 33,
    patient_gender: 'Female',
    patient_address: 'House 89, Sushant Lok Phase 1, Gurugram',
    doctor_id: 'doc-301',
    doctor_name: 'Dr. Priya Nair',
    doctor_specialization: 'Cardiorespiratory Rehab',
    centre_id: 'c3333333-3333-3333-3333-333333333333',
    centre_name: 'Gurugram – DLF Phase 1',
    centre_address: 'C2/17, Arjun Marg, DLF Phase 1, Gurugram, Haryana – 122002',
    centre_phone: '+91 92171 83736',
    items: [
      { service_name: 'Initial Consultation & Assessment', price: 600, quantity: 1, total: 600 },
      { service_name: 'Neurological Rehabilitation Session', price: 1300, quantity: 1, total: 1300 },
    ],
    subtotal: 1900,
    discount: 190,
    discount_preset_name: 'Welcome 10% Discount',
    total: 1710,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'Post-partum rectus diastasis (2.5 finger gap). Transverse abdominis ultrasound recruitment.',
    visit_date: new Date(Date.now() - 86400000 * 16).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 16).toISOString(),
  },
  {
    id: 'vis-114',
    bill_number: 'INV-202609-0011',
    patient_id: 'pat-106',
    patient_uid: 'CLN-202609-0006',
    patient_name: 'Meera Nair',
    patient_phone: '+91 97112 34567',
    patient_age: 33,
    patient_gender: 'Female',
    patient_address: 'House 89, Sushant Lok Phase 1, Gurugram',
    doctor_id: 'doc-301',
    doctor_name: 'Dr. Priya Nair',
    doctor_specialization: 'Cardiorespiratory Rehab',
    centre_id: 'c3333333-3333-3333-3333-333333333333',
    centre_name: 'Gurugram – DLF Phase 1',
    centre_address: 'C2/17, Arjun Marg, DLF Phase 1, Gurugram, Haryana – 122002',
    centre_phone: '+91 92171 83736',
    items: [
      { service_name: 'Follow-up Consultation & Review', price: 400, quantity: 1, total: 400 },
      { service_name: 'Standard Physiotherapy Session (45 min)', price: 800, quantity: 1, total: 800 },
    ],
    subtotal: 1200,
    discount: 100,
    discount_preset_name: 'Loyalty Discount',
    total: 1100,
    payment_mode: 'Card',
    payment_status: 'Paid',
    notes: 'Diastasis gap reduced to 1.5 finger gap. Core stamina and functional endurance significantly higher.',
    visit_date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 'vis-115',
    bill_number: 'INV-202609-0007',
    patient_id: 'pat-107',
    patient_uid: 'CLN-202609-0007',
    patient_name: 'Rohan Mehta',
    patient_phone: '+91 99998 87766',
    patient_age: 24,
    patient_gender: 'Male',
    patient_address: 'D-55, Defence Colony, New Delhi',
    doctor_id: 'doc-102',
    doctor_name: 'Dr. Rajesh Sharma',
    doctor_specialization: 'Sports Rehabilitation',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    centre_name: 'New Friends Colony, New Delhi',
    centre_address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
    centre_phone: '08383936905',
    items: [
      { service_name: 'Initial Consultation & Assessment', price: 600, quantity: 1, total: 600 },
      { service_name: 'Sports Injury Rehabilitation & Conditioning', price: 1200, quantity: 1, total: 1200 },
      { service_name: 'Kinesiology Taping & Strapping', price: 450, quantity: 1, total: 450 },
    ],
    subtotal: 2250,
    discount: 250,
    discount_preset_name: 'Athlete Support Discount',
    total: 2000,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'Grade 2 ATFL right ankle sprain. Cryotherapy & lymphatic drainage taping applied.',
    visit_date: new Date(Date.now() - 86400000 * 10).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'vis-116',
    bill_number: 'INV-202609-0013',
    patient_id: 'pat-107',
    patient_uid: 'CLN-202609-0007',
    patient_name: 'Rohan Mehta',
    patient_phone: '+91 99998 87766',
    patient_age: 24,
    patient_gender: 'Male',
    patient_address: 'D-55, Defence Colony, New Delhi',
    doctor_id: 'doc-102',
    doctor_name: 'Dr. Rajesh Sharma',
    doctor_specialization: 'Sports Rehabilitation',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    centre_name: 'New Friends Colony, New Delhi',
    centre_address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
    centre_phone: '08383936905',
    items: [
      { service_name: 'Sports Injury Rehabilitation & Conditioning', price: 1200, quantity: 1, total: 1200 },
    ],
    subtotal: 1200,
    discount: 100,
    discount_preset_name: 'Loyalty Discount',
    total: 1100,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'Single leg stance stability test passed with zero lateral translation. Cleared for light jogging.',
    visit_date: new Date(Date.now() - 86400000 * 2).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'vis-117',
    bill_number: 'INV-202608-0027',
    patient_id: 'pat-108',
    patient_uid: 'CLN-202609-0008',
    patient_name: 'Sunita Gupta',
    patient_phone: '+91 98114 45566',
    patient_age: 68,
    patient_gender: 'Female',
    patient_address: '24 Anand Lok, New Delhi',
    doctor_id: 'doc-201',
    doctor_name: 'Dr. Emily Watson',
    doctor_specialization: 'Neuro Physiotherapy',
    centre_id: 'c2222222-2222-2222-2222-222222222222',
    centre_name: 'Vasant Vihar, New Delhi',
    centre_address: '86 Basement, Poorvi Marg, Indian Air Lines & Air India Estate, Vasant Vihar, New Delhi, Delhi 110057',
    centre_phone: '08700264533',
    items: [
      { service_name: 'Stroke & Paralysis Functional Rehab', price: 1500, quantity: 1, total: 1500 },
      { service_name: 'Neurological Rehabilitation Session', price: 1300, quantity: 1, total: 1300 },
    ],
    subtotal: 2800,
    discount: 300,
    discount_preset_name: 'Senior Citizen Package',
    total: 2500,
    payment_mode: 'Card',
    payment_status: 'Paid',
    notes: 'Post-stroke hemiparesis. Bobath neuro-developmental facilitation for upper limb motor recovery.',
    visit_date: new Date(Date.now() - 86400000 * 25).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: 'vis-118',
    bill_number: 'INV-202609-0009',
    patient_id: 'pat-108',
    patient_uid: 'CLN-202609-0008',
    patient_name: 'Sunita Gupta',
    patient_phone: '+91 98114 45566',
    patient_age: 68,
    patient_gender: 'Female',
    patient_address: '24 Anand Lok, New Delhi',
    doctor_id: 'doc-202',
    doctor_name: 'Dr. Michael Chang',
    doctor_specialization: 'Spine & Posture Specialist',
    centre_id: 'c2222222-2222-2222-2222-222222222222',
    centre_name: 'Vasant Vihar, New Delhi',
    centre_address: '86 Basement, Poorvi Marg, Indian Air Lines & Air India Estate, Vasant Vihar, New Delhi, Delhi 110057',
    centre_phone: '08700264533',
    items: [
      { service_name: 'Neurological Rehabilitation Session', price: 1300, quantity: 1, total: 1300 },
      { service_name: 'Manual Therapy & Joint Mobilization', price: 900, quantity: 1, total: 900 },
    ],
    subtotal: 2200,
    discount: 200,
    discount_preset_name: 'Senior Citizen Discount',
    total: 2000,
    payment_mode: 'Cash',
    payment_status: 'Paid',
    notes: 'Sit-to-stand transfers achieved independently. Quadripod cane gait stability verified.',
    visit_date: new Date(Date.now() - 86400000 * 9).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
  },
  {
    id: 'vis-119',
    bill_number: 'INV-202608-0033',
    patient_id: 'pat-109',
    patient_uid: 'CLN-202609-0009',
    patient_name: 'Amit Chawla',
    patient_phone: '+91 98711 22334',
    patient_age: 47,
    patient_gender: 'Male',
    patient_address: 'Tower 3, Nirvana Country, Sector 50, Gurugram',
    doctor_id: 'doc-302',
    doctor_name: 'Dr. David Kim',
    doctor_specialization: 'Pediatric Physiotherapy',
    centre_id: 'c3333333-3333-3333-3333-333333333333',
    centre_name: 'Gurugram – DLF Phase 1',
    centre_address: 'C2/17, Arjun Marg, DLF Phase 1, Gurugram, Haryana – 122002',
    centre_phone: '+91 92171 83736',
    items: [
      { service_name: 'Initial Consultation & Assessment', price: 600, quantity: 1, total: 600 },
      { service_name: 'Dry Needling Therapy (Trigger Point Release)', price: 750, quantity: 1, total: 750 },
      { service_name: 'Cupping & Myofascial Release Therapy', price: 700, quantity: 1, total: 700 },
    ],
    subtotal: 2050,
    discount: 200,
    discount_preset_name: 'Corporate Desk Discount',
    total: 1850,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'Tennis elbow right forearm. Trigger points in ECRB and extensor digitorum deactivated.',
    visit_date: new Date(Date.now() - 86400000 * 20).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
  },
  {
    id: 'vis-120',
    bill_number: 'INV-202609-0002',
    patient_id: 'pat-110',
    patient_uid: 'CLN-202609-0010',
    patient_name: 'Dr. Kavita Rao',
    patient_phone: '+91 98200 33445',
    patient_age: 52,
    patient_gender: 'Female',
    patient_address: '18 Shanti Niketan, New Delhi',
    doctor_id: 'doc-201',
    doctor_name: 'Dr. Emily Watson',
    doctor_specialization: 'Neuro Physiotherapy',
    centre_id: 'c2222222-2222-2222-2222-222222222222',
    centre_name: 'Vasant Vihar, New Delhi',
    centre_address: '86 Basement, Poorvi Marg, Indian Air Lines & Air India Estate, Vasant Vihar, New Delhi, Delhi 110057',
    centre_phone: '08700264533',
    items: [
      { service_name: 'Initial Consultation & Assessment', price: 600, quantity: 1, total: 600 },
      { service_name: 'Manual Therapy & Joint Mobilization', price: 900, quantity: 1, total: 900 },
    ],
    subtotal: 1500,
    discount: 150,
    discount_preset_name: 'Doctor Referral Privilege',
    total: 1350,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'Thoracic outlet syndrome. First rib mobilization and scalene trigger point deactivation.',
    visit_date: new Date(Date.now() - 86400000 * 14).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
  },
  {
    id: 'vis-121',
    bill_number: 'INV-202609-0014',
    patient_id: 'pat-110',
    patient_uid: 'CLN-202609-0010',
    patient_name: 'Dr. Kavita Rao',
    patient_phone: '+91 98200 33445',
    patient_age: 52,
    patient_gender: 'Female',
    patient_address: '18 Shanti Niketan, New Delhi',
    doctor_id: 'doc-101',
    doctor_name: 'Dr. Sarah Jenkins',
    doctor_specialization: 'Orthopedic Physiotherapy',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    centre_name: 'New Friends Colony, New Delhi',
    centre_address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
    centre_phone: '08383936905',
    items: [
      { service_name: 'Follow-up Consultation & Review', price: 400, quantity: 1, total: 400 },
      { service_name: 'Standard Physiotherapy Session (45 min)', price: 800, quantity: 1, total: 800 },
    ],
    subtotal: 1200,
    discount: 100,
    discount_preset_name: 'Doctor Privilege',
    total: 1100,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'Cross-centre follow-up in NFC clinic. Bilateral finger numbness completely subsided.',
    visit_date: new Date(Date.now() - 86400000 * 1).toISOString().split('T')[0],
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
]

export async function getVisits(centreId?: string, query?: string): Promise<StoredVisit[]> {
  const CACHE_KEY = 'physio_visits_cache_v7'
  
  // 1. Read local cache first
  let cachedVisits: StoredVisit[] = []
  const cachedRaw = localStorage.getItem(CACHE_KEY) || localStorage.getItem('physio_visits_cache')
  if (cachedRaw) {
    try {
      const parsed = JSON.parse(cachedRaw)
      if (Array.isArray(parsed)) cachedVisits = parsed
    } catch (_) {}
  }
  if (cachedVisits.length === 0) {
    cachedVisits = DEFAULT_VISITS
  }

  let dbVisits: StoredVisit[] = []
  try {
    const supabase = createClient()
    let q = supabase.from('visits').select('*, visit_services(*), patients(*)').order('created_at', { ascending: false })
    if (centreId && centreId !== 'all') {
      q = q.eq('centre_id', centreId)
    }
    const { data } = await q
    if (data && data.length > 0) {
      dbVisits = data.map((v: any) => ({
        id: v.id,
        bill_number: v.bill_number,
        patient_id: v.patient_id,
        patient_uid: v.patients?.uid || 'CLN-PATIENT',
        patient_name: v.patients?.full_name || 'Patient',
        patient_phone: v.patients?.phone || '',
        patient_age: v.patients?.age,
        patient_gender: v.patients?.gender,
        patient_address: v.patients?.address || '',
        doctor_id: v.doctor_id,
        doctor_name: v.doctor_name,
        doctor_specialization: '',
        centre_id: v.centre_id,
        centre_name: v.centre_name,
        centre_address: '',
        centre_phone: '',
        items: (v.visit_services || []).map((s: any) => ({
          id: s.id,
          service_id: s.service_id,
          service_name: s.service_name,
          price: Number(s.price) || 0,
          quantity: Number(s.quantity) || 1,
          total: (Number(s.price) || 0) * (Number(s.quantity) || 1),
        })),
        subtotal: Number(v.subtotal) || 0,
        discount: Number(v.discount) || 0,
        total: Number(v.total) || 0,
        payment_mode: (v.payment_mode as any) || 'Cash',
        payment_status: 'Paid',
        visit_date: v.visit_date,
        created_at: v.created_at,
      }))
    }
  } catch (_) {}

  // Merge DB visits with cached visits (deduplicating by ID and bill_number)
  const map = new Map<string, StoredVisit>()
  
  // Cached first
  cachedVisits.forEach(v => {
    if (v.id) map.set(v.id, v)
    if (v.bill_number) map.set(v.bill_number, v)
  })

  // Supabase DB visits over cached
  dbVisits.forEach(v => {
    if (v.id) map.set(v.id, v)
    if (v.bill_number) map.set(v.bill_number, v)
  })

  const mergedList = Array.from(new Set(map.values())).sort((a, b) => {
    const da = new Date(a.created_at || a.visit_date || 0).getTime()
    const db = new Date(b.created_at || b.visit_date || 0).getTime()
    return db - da
  })

  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(mergedList))
    localStorage.setItem('physio_visits_cache', JSON.stringify(mergedList))
  } catch (_) {}

  return filterVisits(mergedList, centreId, query)
}

function filterVisits(list: StoredVisit[], centreId?: string, query?: string): StoredVisit[] {
  let res = list
  if (centreId && centreId !== 'all') {
    res = res.filter(v => v.centre_id === centreId || v.centre_name?.toLowerCase().includes(centreId.toLowerCase()))
  }
  if (query?.trim()) {
    const q = query.toLowerCase().trim()
    res = res.filter(v =>
      v.bill_number.toLowerCase().includes(q) ||
      v.patient_name.toLowerCase().includes(q) ||
      v.patient_uid.toLowerCase().includes(q) ||
      v.patient_phone.includes(q) ||
      (v.doctor_name && v.doctor_name.toLowerCase().includes(q)) ||
      (v.centre_name && v.centre_name.toLowerCase().includes(q))
    )
  }
  return res
}

export async function saveVisit(
  visitData: {
    patient: Patient
    doctor?: Doctor | null
    centre?: Centre | null
    items: BillLineItem[]
    subtotal: number
    discount: number
    discountPresetName?: string
    total: number
    paymentMode: 'Cash' | 'Card' | 'UPI' | 'Insurance' | 'Bank Transfer'
    notes?: string
  }
): Promise<StoredVisit> {
  const current = await getVisits()
  const now = new Date()
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
  const billNumber = `INV-${yyyymm}-${String(current.length + 1).padStart(4, '0')}`

  const newVisit: StoredVisit = {
    id: `vis-${Date.now()}`,
    bill_number: billNumber,
    patient_id: visitData.patient.id,
    patient_uid: visitData.patient.uid,
    patient_name: visitData.patient.full_name,
    patient_phone: visitData.patient.phone,
    patient_age: visitData.patient.age,
    patient_gender: visitData.patient.gender,
    patient_address: visitData.patient.address || undefined,
    doctor_id: visitData.doctor?.id || null,
    doctor_name: visitData.doctor?.name || null,
    doctor_specialization: visitData.doctor?.specialization || null,
    centre_id: visitData.centre?.id || null,
    centre_name: visitData.centre?.name || null,
    centre_address: visitData.centre?.address || null,
    centre_phone: visitData.centre?.phone || null,
    items: visitData.items,
    subtotal: visitData.subtotal,
    discount: visitData.discount,
    discount_preset_name: visitData.discountPresetName,
    total: visitData.total,
    payment_mode: visitData.paymentMode,
    payment_status: 'Paid',
    notes: visitData.notes,
    visit_date: now.toISOString().split('T')[0],
    created_at: now.toISOString(),
  }

  const updated = [newVisit, ...current.filter(v => v.id !== newVisit.id && v.bill_number !== newVisit.bill_number)]
  try {
    localStorage.setItem('physio_visits_cache_v7', JSON.stringify(updated))
    localStorage.setItem('physio_visits_cache', JSON.stringify(updated))
  } catch (_) {}

  try {
    const supabase = createClient()
    
    // Resolve UUID for Supabase FK if patient was created locally
    let realPatientId = visitData.patient.id
    if (!realPatientId || realPatientId.startsWith('pat-')) {
      const { data: foundP } = await supabase.from('patients').select('id').eq('uid', visitData.patient.uid).single()
      if (foundP) {
        realPatientId = foundP.id
      }
    }

    // Only attempt insert if we have a valid UUID for patient_id (or if UUID format)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(realPatientId)
    
    if (isUuid) {
      const { data: vRecord, error } = await supabase.from('visits').insert({
        bill_number: newVisit.bill_number,
        patient_id: realPatientId,
        subtotal: newVisit.subtotal,
        discount: newVisit.discount,
        total: newVisit.total,
        payment_mode: newVisit.payment_mode === 'Bank Transfer' ? 'UPI' : newVisit.payment_mode,
        visit_date: newVisit.visit_date,
        centre_id: (newVisit.centre_id && isUuid) ? newVisit.centre_id : null,
        doctor_id: (newVisit.doctor_id && isUuid) ? newVisit.doctor_id : null,
        doctor_name: newVisit.doctor_name,
        centre_name: newVisit.centre_name,
      }).select('id').single()

      if (vRecord && !error) {
        await supabase.from('visit_services').insert(
          newVisit.items.map(i => ({
            visit_id: vRecord.id,
            service_id: (i.service_id && isUuid) ? i.service_id : null,
            service_name: i.service_name,
            price: i.price,
            quantity: i.quantity,
          }))
        )
      }
    }
  } catch (err) {
    console.warn('Supabase visit save skipped due to offline/UUID fallback:', err)
  }

  return newVisit
}

export function exportBillsToExcel(visits: StoredVisit[]) {
  const exportData = visits.map((v, idx) => ({
    'Sr No': idx + 1,
    'Invoice Number': v.bill_number,
    'Date': v.visit_date,
    'Patient UID': v.patient_uid,
    'Patient Name': v.patient_name,
    'Patient Phone': v.patient_phone,
    'Patient Age / Gender': `${v.patient_age || ''} / ${v.patient_gender || ''}`,
    'Consulting Doctor': v.doctor_name ? `Dr. ${v.doctor_name}` : 'Not Specified',
    'Clinic Centre': v.centre_name || 'New Friends Colony, New Delhi',
    'Services Breakdown': v.items.map(i => `${i.service_name} (x${i.quantity} @ ₹${i.price})`).join('; '),
    'Subtotal (INR)': v.subtotal,
    'Discount (INR)': v.discount,
    'Net Total (INR)': v.total,
    'Payment Mode': v.payment_mode,
    'Payment Status': v.payment_status,
  }))

  const ws = XLSX.utils.json_to_sheet(exportData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Billing_Ledger')
  XLSX.writeFile(wb, `Physionautics_Billing_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`)
}

export function exportSingleBillToExcel(v: StoredVisit) {
  const meta = [
    ['PHYSIONAUTICS CLINIC - PATIENT INVOICE & RECEIPT'],
    ['Branch / Centre:', v.centre_name || 'Physionautics Main Centre'],
    ['Centre Address:', v.centre_address || 'Clinic Reception'],
    ['Centre Phone:', v.centre_phone || ''],
    [],
    ['Invoice Number:', v.bill_number, 'Invoice Date:', v.visit_date],
    ['Patient UID:', v.patient_uid, 'Payment Mode:', v.payment_mode],
    ['Patient Name:', v.patient_name, 'Payment Status:', v.payment_status],
    ['Patient Phone:', v.patient_phone, 'Doctor:', v.doctor_name ? `Dr. ${v.doctor_name}` : 'Consultant'],
    ['Age / Gender:', `${v.patient_age || ''} / ${v.patient_gender || ''}`, 'Specialization:', v.doctor_specialization || 'Physiotherapist'],
    [],
    ['ITEMIZED CHARGES BREAKDOWN'],
    ['S.No', 'Service / Procedure Description', 'Rate (INR)', 'Qty', 'Line Total (INR)'],
  ]

  const itemsRows = v.items.map((i, idx) => [
    idx + 1,
    i.service_name,
    i.price,
    i.quantity,
    i.price * i.quantity,
  ])

  const totals = [
    [],
    ['', '', '', 'Subtotal (INR):', v.subtotal],
    ['', '', '', 'Discount Applied (INR):', v.discount],
    ['', '', '', 'GRAND TOTAL (INR):', v.total],
    [],
    ['Notes / Instructions:', v.notes || 'Thank you for choosing Physionautics. Get well soon!'],
    ['Authorized Signatory:', 'Physionautics Billing Desk'],
  ]

  const fullSheetData = [...meta, ...itemsRows, ...totals]
  const ws = XLSX.utils.aoa_to_sheet(fullSheetData)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Invoice')
  XLSX.writeFile(wb, `Invoice_${v.bill_number}_${v.patient_uid}.xlsx`)
}

// ================= PACKAGES & PATIENT CREDITS =================
export const DEFAULT_PACKAGES: PackagePreset[] = [
  {
    id: 'pkg-1',
    name: '5-Session Pain Relief & Recovery Pack',
    description: 'Includes 5 manual therapy & electrotherapy sessions with home exercise protocol.',
    total_sessions: 5,
    price: 3600,
    validity_days: 60,
    is_active: true,
  },
  {
    id: 'pkg-2',
    name: '10-Session Comprehensive Rehab Bundle',
    description: '10 structured sessions with doctor reviews, dry needling, and joint mobilization.',
    total_sessions: 10,
    price: 6800,
    validity_days: 90,
    is_active: true,
  },
  {
    id: 'pkg-3',
    name: '20-Session Spine & Neuro Extended Rehab',
    description: 'Ideal for stroke, paralysis, or severe spinal disc rehabilitation.',
    total_sessions: 20,
    price: 12500,
    validity_days: 180,
    is_active: true,
  },
  {
    id: 'pkg-4',
    name: 'Post-Operative Orthopedic 8-Pack',
    description: 'ACL, knee replacement, or shoulder post-surgery mobilization.',
    total_sessions: 8,
    price: 7200,
    validity_days: 90,
    is_active: true,
  },
  {
    id: 'pkg-5',
    name: 'Elderly Care & Gait Training 6-Pack',
    description: 'Fall prevention, balance retraining, and geriatric strengthening.',
    total_sessions: 6,
    price: 4200,
    validity_days: 60,
    is_active: true,
  },
]

export const DEFAULT_PATIENT_CREDITS: PatientPackageCredit[] = [
  {
    id: 'cred-1',
    patient_id: 'pat-1',
    patient_uid: 'CLN-202609-0001',
    patient_name: 'Rahul Verma',
    patient_phone: '+91 98765 11111',
    package_id: 'pkg-2',
    package_name: '10-Session Comprehensive Rehab Bundle',
    total_sessions: 10,
    remaining_sessions: 7,
    used_sessions: 3,
    price_paid: 6800,
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    centre_name: 'New Friends Colony, New Delhi',
    purchased_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    expires_at: new Date(Date.now() + 86400000 * 83).toISOString(),
    status: 'Active',
  },
]

export async function getPackages(): Promise<PackagePreset[]> {
  const cached = localStorage.getItem('physio_packages_cache')
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (parsed.length > 0) return parsed
    } catch (_) {}
  }
  localStorage.setItem('physio_packages_cache', JSON.stringify(DEFAULT_PACKAGES))
  return DEFAULT_PACKAGES
}

export async function savePackage(pkg: Partial<PackagePreset>): Promise<PackagePreset> {
  const current = await getPackages()
  let updated: PackagePreset[]
  let saved: PackagePreset

  if (pkg.id) {
    saved = { ...current.find(p => p.id === pkg.id)!, ...pkg } as PackagePreset
    updated = current.map(p => p.id === pkg.id ? saved : p)
  } else {
    saved = {
      id: `pkg-${Date.now()}`,
      name: pkg.name || 'Custom Package',
      description: pkg.description || '',
      total_sessions: Number(pkg.total_sessions) || 5,
      price: Number(pkg.price) || 3000,
      validity_days: Number(pkg.validity_days) || 60,
      is_active: true,
      created_at: new Date().toISOString(),
    }
    updated = [...current, saved]
  }
  localStorage.setItem('physio_packages_cache', JSON.stringify(updated))
  return saved
}

export async function deletePackage(id: string): Promise<void> {
  const current = await getPackages()
  const updated = current.filter(p => p.id !== id)
  localStorage.setItem('physio_packages_cache', JSON.stringify(updated))
}

export async function getPatientCredits(patientId?: string): Promise<PatientPackageCredit[]> {
  let list: PatientPackageCredit[] = []
  const cached = localStorage.getItem('physio_patient_credits_cache')
  if (cached) {
    try { list = JSON.parse(cached) } catch (_) {}
  } else {
    list = DEFAULT_PATIENT_CREDITS
    localStorage.setItem('physio_patient_credits_cache', JSON.stringify(DEFAULT_PATIENT_CREDITS))
  }

  if (patientId) {
    return list.filter(c => c.patient_id === patientId || c.patient_uid === patientId)
  }
  return list
}

export async function purchasePatientPackage(data: {
  patient: Patient
  packagePreset: PackagePreset
  centre?: Centre | null
  paymentMode: string
}): Promise<PatientPackageCredit> {
  const current = await getPatientCredits()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + (data.packagePreset.validity_days || 60) * 86400000)

  const newCredit: PatientPackageCredit = {
    id: `cred-${Date.now()}`,
    patient_id: data.patient.id,
    patient_uid: data.patient.uid,
    patient_name: data.patient.full_name,
    patient_phone: data.patient.phone,
    package_id: data.packagePreset.id,
    package_name: data.packagePreset.name,
    total_sessions: data.packagePreset.total_sessions,
    remaining_sessions: data.packagePreset.total_sessions,
    used_sessions: 0,
    price_paid: data.packagePreset.price,
    centre_id: data.centre?.id || null,
    centre_name: data.centre?.name || null,
    purchased_at: now.toISOString(),
    expires_at: expiresAt.toISOString(),
    status: 'Active',
  }

  const updated = [newCredit, ...current]
  localStorage.setItem('physio_patient_credits_cache', JSON.stringify(updated))
  return newCredit
}

export async function redeemPackageSession(creditId: string): Promise<{ success: boolean; remaining: number }> {
  const current = await getPatientCredits()
  let remaining = 0
  const updated = current.map(c => {
    if (c.id === creditId && c.remaining_sessions > 0) {
      const nextRemaining = c.remaining_sessions - 1
      const nextUsed = c.used_sessions + 1
      remaining = nextRemaining
      return {
        ...c,
        remaining_sessions: nextRemaining,
        used_sessions: nextUsed,
        status: nextRemaining <= 0 ? 'Exhausted' as const : 'Active' as const,
      }
    }
    return c
  })

  localStorage.setItem('physio_patient_credits_cache', JSON.stringify(updated))
  return { success: true, remaining }
}

// ================= PATIENT FEEDBACK =================
export const DEFAULT_FEEDBACK: PatientFeedback[] = [
  {
    id: 'fb-1',
    bill_number: 'INV-202609-0001',
    patient_uid: 'CLN-202609-0001',
    patient_name: 'Rahul Verma',
    patient_phone: '+91 98765 11111',
    doctor_name: 'Dr. Sarah Jenkins',
    centre_name: 'New Friends Colony, New Delhi',
    rating: 5,
    hygiene_rating: 5,
    treatment_rating: 5,
    staff_rating: 5,
    comments: 'Great lower back pain relief after dry needling. Very clean clinic and polite staff!',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'fb-2',
    bill_number: 'INV-202609-0002',
    patient_uid: 'CLN-202609-0002',
    patient_name: 'Ananya Sharma',
    patient_phone: '+91 98765 22222',
    doctor_name: 'Dr. Emily Watson',
    centre_name: 'Vasant Vihar, New Delhi',
    rating: 5,
    hygiene_rating: 5,
    treatment_rating: 5,
    staff_rating: 5,
    comments: 'My neck stiffness feels much lighter after cupping therapy. Highly recommended!',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
]

// ================= DYNAMIC FORM TEMPLATES (GOOGLE FORMS STYLE) =================

export const DEFAULT_FEEDBACK_TEMPLATES: FeedbackFormTemplate[] = [
  {
    id: 'tmpl-clinical-comprehensive',
    title: 'Physiotherapy Clinical Experience & Treatment Assessment',
    description: 'Help us ensure the highest standards of physical rehabilitation and doctor care.',
    is_active: true,
    show_doctor_badge: true,
    show_invoice_badge: true,
    show_centre_badge: true,
    show_procedures_badge: true,
    accent_color: '#0d9488',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    fields: [
      {
        id: 'q-doctor-care',
        type: 'star_rating',
        title: 'Doctor Attentiveness & Treatment Explanation',
        description: 'Did your physiotherapist listen to your symptoms and explain the therapy clearly?',
        required: true,
        category: 'doctor',
      },
      {
        id: 'q-pain-relief',
        type: 'linear_scale',
        title: 'Pain Reduction & Mobility Improvement (1 = Minimal, 10 = Maximum Relief)',
        description: 'Rate your physical improvement after today’s therapy session.',
        required: true,
        min_scale: 1,
        max_scale: 10,
        min_label: '1 (Little change)',
        max_label: '10 (Significant relief)',
        category: 'treatment',
      },
      {
        id: 'q-hygiene',
        type: 'star_rating',
        title: 'Clinic Cleanliness & Equipment Sanitization',
        description: 'How satisfied are you with the treatment bay, bed linen, and modality hygiene?',
        required: true,
        category: 'facility',
      },
      {
        id: 'q-staff-courtesy',
        type: 'star_rating',
        title: 'Reception & Front-Desk Staff Cordiality',
        description: 'Speed of billing, appointment scheduling, and polite assistance.',
        required: true,
        category: 'general',
      },
      {
        id: 'q-waiting-time',
        type: 'multiple_choice',
        title: 'How would you rate your waiting time before seeing the doctor?',
        required: false,
        options: ['Directly attended without wait (0-5 mins)', 'Short acceptable wait (5-15 mins)', 'Moderate wait (15-30 mins)', 'Long wait (> 30 mins)'],
        category: 'facility',
      },
      {
        id: 'q-improvement-areas',
        type: 'checkbox',
        title: 'Areas where you felt the most improvement today:',
        required: false,
        options: ['Pain Relief & Stiffness', 'Range of Motion & Flexibility', 'Spine / Joint Alignment', 'Muscle Strength & Posture', 'Exercise Confidence'],
        category: 'treatment',
      },
      {
        id: 'q-nps',
        type: 'nps',
        title: 'How likely are you to recommend Physionautics to friends and family?',
        description: '0 = Not Likely, 10 = Extremely Likely',
        required: true,
        min_scale: 0,
        max_scale: 10,
        category: 'general',
      },
      {
        id: 'q-remarks',
        type: 'textarea',
        title: 'Personal Remarks for Your Doctor & Care Team',
        description: 'Any specific feedback or praise for your treating therapist?',
        required: false,
        category: 'doctor',
      },
    ],
  },
  {
    id: 'tmpl-sports-postop',
    title: 'Post-Operative & Sports Rehab Progress Tracker',
    description: 'Targeted survey evaluating recovery milestones, modality comfort, and strength progression.',
    is_active: false,
    show_doctor_badge: true,
    show_invoice_badge: true,
    show_centre_badge: true,
    show_procedures_badge: true,
    accent_color: '#2563eb',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    fields: [
      {
        id: 'q-sport-guidance',
        type: 'star_rating',
        title: 'Doctor Rehabilitation Protocol & Precision',
        description: 'Quality of exercise biomechanics correction and home exercise guidance.',
        required: true,
        category: 'doctor',
      },
      {
        id: 'q-sport-pain-score',
        type: 'linear_scale',
        title: 'Post-Therapy Joint Comfort Level',
        required: true,
        min_scale: 1,
        max_scale: 10,
        min_label: '1 (Severe Discomfort)',
        max_label: '10 (Complete Comfort)',
        category: 'treatment',
      },
      {
        id: 'q-sport-modality',
        type: 'checkbox',
        title: 'Which treatment modalities provided the best comfort?',
        required: false,
        options: ['Class 4 High-Power Laser', 'Joint Mobilization / Manual Therapy', 'Dry Needling & Cupping', 'Mechanical Spine Traction', 'Therapeutic Exercise'],
        category: 'treatment',
      },
      {
        id: 'q-sport-comments',
        type: 'textarea',
        title: 'Doctor Notes & Home Workout Experience',
        required: false,
        category: 'doctor',
      },
    ],
  },
]

export async function getFeedbackTemplates(): Promise<FeedbackFormTemplate[]> {
  const CACHE_KEY = 'physio_feedback_templates_v2'
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      } catch (_) {}
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(DEFAULT_FEEDBACK_TEMPLATES))
  }
  return DEFAULT_FEEDBACK_TEMPLATES
}

export async function getActiveFeedbackTemplate(): Promise<FeedbackFormTemplate> {
  const templates = await getFeedbackTemplates()
  return templates.find(t => t.is_active) || templates[0] || DEFAULT_FEEDBACK_TEMPLATES[0]
}

export async function saveFeedbackTemplate(tmpl: Partial<FeedbackFormTemplate>): Promise<FeedbackFormTemplate> {
  const current = await getFeedbackTemplates()
  let updated: FeedbackFormTemplate[]
  let saved: FeedbackFormTemplate

  if (tmpl.id && current.some(t => t.id === tmpl.id)) {
    // If setting active, deactivate others
    if (tmpl.is_active) {
      current.forEach(t => { t.is_active = false })
    }
    saved = {
      ...current.find(t => t.id === tmpl.id)!,
      ...tmpl,
      updated_at: new Date().toISOString(),
    } as FeedbackFormTemplate
    updated = current.map(t => (t.id === tmpl.id ? saved : t))
  } else {
    if (tmpl.is_active) {
      current.forEach(t => { t.is_active = false })
    }
    saved = {
      id: `tmpl-${Date.now()}`,
      title: tmpl.title || 'Untitled Feedback Form',
      description: tmpl.description || 'Patient satisfaction and clinical survey.',
      is_active: tmpl.is_active ?? true,
      show_doctor_badge: tmpl.show_doctor_badge ?? true,
      show_invoice_badge: tmpl.show_invoice_badge ?? true,
      show_centre_badge: tmpl.show_centre_badge ?? true,
      show_procedures_badge: tmpl.show_procedures_badge ?? true,
      accent_color: tmpl.accent_color || '#0d9488',
      fields: tmpl.fields || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    updated = [saved, ...current]
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('physio_feedback_templates_v2', JSON.stringify(updated))
  }
  return saved
}

export async function deleteFeedbackTemplate(id: string): Promise<void> {
  const current = await getFeedbackTemplates()
  const updated = current.filter(t => t.id !== id)
  if (updated.length > 0 && !updated.some(t => t.is_active)) {
    updated[0].is_active = true
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('physio_feedback_templates_v2', JSON.stringify(updated))
  }
}

export async function getPatientFeedback(): Promise<PatientFeedback[]> {
  const supabase = createClient()
  try {
    const { data, error } = await supabase
      .from('patient_feedback')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error && data && data.length > 0) {
      return data as PatientFeedback[]
    }
  } catch (_) {}

  const CACHE_KEY = 'physio_feedback_cache_v6'
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length >= 6) return parsed
      } catch (_) {}
    }
    localStorage.setItem(CACHE_KEY, JSON.stringify(DEMO_FEEDBACK))
  }
  return DEMO_FEEDBACK
}

export async function savePatientFeedback(fb: Omit<PatientFeedback, 'id' | 'created_at'>): Promise<PatientFeedback> {
  const newFb: PatientFeedback = {
    id: `fb-${Date.now()}`,
    ...fb,
    created_at: new Date().toISOString(),
  }

  // Write to Supabase table
  try {
    const supabase = createClient()
    await supabase.from('patient_feedback').insert([{
      bill_number: fb.bill_number,
      patient_uid: fb.patient_uid,
      patient_name: fb.patient_name,
      patient_phone: fb.patient_phone,
      doctor_name: fb.doctor_name,
      centre_name: fb.centre_name,
      rating: fb.rating || 5,
      hygiene_rating: fb.hygiene_rating || 5,
      treatment_rating: fb.treatment_rating || 5,
      staff_rating: fb.staff_rating || 5,
      comments: fb.comments || (fb.custom_answers ? JSON.stringify(fb.custom_answers) : null),
    }])
  } catch (err) {
    console.warn('Could not save feedback to Supabase, saving locally:', err)
  }

  // Update local cache
  if (typeof window !== 'undefined') {
    const current = await getPatientFeedback()
    const updated = [newFb, ...current]
    localStorage.setItem('physio_feedback_cache_v6', JSON.stringify(updated))
  }
  return newFb
}

export async function getDoctorSatisfactionMetrics(): Promise<{
  doctor_name: string
  avg_rating: number
  total_reviews: number
  hygiene_score: number
  treatment_score: number
  staff_score: number
  centre_name?: string
  recent_comments: string[]
}[]> {
  const feedbacks = await getPatientFeedback()
  const doctors = await getDoctors()
  
  const map = new Map<string, {
    doctor_name: string
    ratings: number[]
    hygiene: number[]
    treatment: number[]
    staff: number[]
    centre_name?: string
    comments: string[]
  }>()

  // Initialize with known doctors
  doctors.forEach(doc => {
    map.set(doc.name, {
      doctor_name: doc.name,
      ratings: [],
      hygiene: [],
      treatment: [],
      staff: [],
      centre_name: (doc as any).centre_name || 'Assigned Clinic',
      comments: [],
    })
  })

  // Map feedbacks
  feedbacks.forEach(fb => {
    const docName = fb.doctor_name || 'Unassigned / General'
    if (!map.has(docName)) {
      map.set(docName, {
        doctor_name: docName,
        ratings: [],
        hygiene: [],
        treatment: [],
        staff: [],
        centre_name: fb.centre_name,
        comments: [],
      })
    }
    const entry = map.get(docName)!
    if (fb.rating) entry.ratings.push(fb.rating)
    if (fb.hygiene_rating) entry.hygiene.push(fb.hygiene_rating)
    if (fb.treatment_rating) entry.treatment.push(fb.treatment_rating)
    if (fb.staff_rating) entry.staff.push(fb.staff_rating)
    if (fb.comments) entry.comments.push(fb.comments)
  })

  const avg = (arr: number[]) => (arr.length ? Number((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1)) : 5.0)

  return Array.from(map.values()).map(item => ({
    doctor_name: item.doctor_name,
    avg_rating: avg(item.ratings),
    total_reviews: item.ratings.length,
    hygiene_score: avg(item.hygiene),
    treatment_score: avg(item.treatment),
    staff_score: avg(item.staff),
    centre_name: item.centre_name,
    recent_comments: item.comments.slice(0, 5),
  }))
}


// ================= RICH DEMO DATASETS & DATA MANAGEMENT =================

export const DEMO_PATIENTS: Patient[] = [
  {
    id: 'pat-101',
    uid: 'CLN-202609-0001',
    full_name: 'Rahul Verma',
    age: 38,
    gender: 'Male',
    phone: '9876511111',
    email: 'rahul.verma@example.com',
    address: 'D-42, South Extension Part 2, New Delhi',
    blood_group: 'B+',
    medical_notes: 'L4-L5 Lumbar Disc Bulge with Sciatica. Radiating pain to left leg.',
    created_at: new Date(Date.now() - 86400000 * 50).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-102',
    uid: 'CLN-202609-0002',
    full_name: 'Ananya Sharma',
    age: 29,
    gender: 'Female',
    phone: '9876522222',
    email: 'ananya.s@example.com',
    address: 'Flat 304, Poorvi Enclave, Vasant Vihar, New Delhi',
    blood_group: 'O+',
    medical_notes: 'Cervical Spondylosis & Postural Tech Neck. Severe upper trapezius spasms.',
    created_at: new Date(Date.now() - 86400000 * 49).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-103',
    uid: 'CLN-202609-0003',
    full_name: 'Rajesh Singhania',
    age: 54,
    gender: 'Male',
    phone: '9876533333',
    email: 'rajesh.singhania@example.com',
    address: 'Villa 18, Arjun Marg, DLF Phase 1, Gurugram',
    blood_group: 'A+',
    medical_notes: 'Post-operative Total Knee Arthroplasty (Right Knee). Week 4 rehabilitation.',
    created_at: new Date(Date.now() - 86400000 * 48).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-104',
    uid: 'CLN-202609-0004',
    full_name: 'Meera Krishnan',
    age: 46,
    gender: 'Female',
    phone: '9876544444',
    email: 'meera.k@example.com',
    address: 'A-12, Friends Colony West, New Delhi',
    blood_group: 'AB+',
    medical_notes: 'Adhesive Capsulitis (Frozen Shoulder Left). Limited abduction & external rotation.',
    created_at: new Date(Date.now() - 86400000 * 47).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-105',
    uid: 'CLN-202609-0005',
    full_name: 'Kabir Oberoi',
    age: 24,
    gender: 'Male',
    phone: '9876555555',
    email: 'kabir.oberoi@example.com',
    address: 'Tower 4, Golf Course Road, DLF Phase 5, Gurugram',
    blood_group: 'O-',
    medical_notes: 'Sports Injury: Left ACL Reconstruction + Meniscal Repair (Football injury).',
    created_at: new Date(Date.now() - 86400000 * 46).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-106',
    uid: 'CLN-202609-0006',
    full_name: 'Sunita Agarwal',
    age: 63,
    gender: 'Female',
    phone: '9876566666',
    email: 'sunita.agarwal@example.com',
    address: '88 Basement, Poorvi Marg, Vasant Vihar, New Delhi',
    blood_group: 'B+',
    medical_notes: 'Bilateral Knee Osteoarthritis (Grade 3). Requires quadriceps strengthening & balance drills.',
    created_at: new Date(Date.now() - 86400000 * 45).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-107',
    uid: 'CLN-202609-0007',
    full_name: 'Siddharth Roy',
    age: 34,
    gender: 'Male',
    phone: '9876577777',
    email: 'siddharth.roy@example.com',
    address: 'C-55, Nizamuddin East, New Delhi',
    blood_group: 'A-',
    medical_notes: 'Chronic Sacroiliac Joint Dysfunction and piriformis tightness.',
    created_at: new Date(Date.now() - 86400000 * 44).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-108',
    uid: 'CLN-202609-0008',
    full_name: 'Pooja Mehta',
    age: 31,
    gender: 'Female',
    phone: '9876588888',
    email: 'pooja.mehta@example.com',
    address: 'House 71, Sector 28, Gurugram',
    blood_group: 'O+',
    medical_notes: 'Lateral Epicondylitis (Tennis Elbow Right). High-power laser therapy recommended.',
    created_at: new Date(Date.now() - 86400000 * 43).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-109',
    uid: 'CLN-202609-0009',
    full_name: 'Amitav Sen',
    age: 72,
    gender: 'Male',
    phone: '9876599999',
    email: 'amitav.sen@example.com',
    address: 'C-22, Vasant Marg, Vasant Vihar, New Delhi',
    blood_group: 'B+',
    medical_notes: 'Post-Ischemic Stroke Left Hemiparesis. Gait re-education & upper limb neuromuscular facilitation.',
    created_at: new Date(Date.now() - 86400000 * 42).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-110',
    uid: 'CLN-202609-0010',
    full_name: 'Divya Saxena',
    age: 37,
    gender: 'Female',
    phone: '9871112345',
    email: 'divya.saxena@example.com',
    address: 'E-14, CV Raman Marg, New Friends Colony, New Delhi',
    blood_group: 'AB-',
    medical_notes: 'Thoracic Kyphoscoliosis & chronic upper back pain due to desk work posture.',
    created_at: new Date(Date.now() - 86400000 * 41).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-111',
    uid: 'CLN-202609-0011',
    full_name: 'Vikram Malhotra',
    age: 45,
    gender: 'Male',
    phone: '9810011223',
    email: 'vikram.m@example.com',
    address: 'B-102, Greater Kailash 1, New Delhi',
    blood_group: 'O+',
    medical_notes: 'Supraspinatus Tendinopathy & Subacromial Impingement in right shoulder.',
    created_at: new Date(Date.now() - 86400000 * 40).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-112',
    uid: 'CLN-202609-0012',
    full_name: 'Ritu Chaudhary',
    age: 52,
    gender: 'Female',
    phone: '9810022334',
    email: 'ritu.c@example.com',
    address: 'H-401, Uniworld City, Sector 30, Gurugram',
    blood_group: 'A+',
    medical_notes: 'Plantar Fasciitis (Bilateral) with morning heel pain & calcaneal spur.',
    created_at: new Date(Date.now() - 86400000 * 39).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-113',
    uid: 'CLN-202609-0013',
    full_name: 'Arjun Kapoor',
    age: 27,
    gender: 'Male',
    phone: '9810033445',
    email: 'arjun.k@example.com',
    address: 'Flat 12B, Shanti Niketan, New Delhi',
    blood_group: 'B-',
    medical_notes: 'Hamstring Grade 2 Strain during sprinting. Eccentric strengthening protocol.',
    created_at: new Date(Date.now() - 86400000 * 38).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-114',
    uid: 'CLN-202609-0014',
    full_name: 'Neelam Kapoor',
    age: 68,
    gender: 'Female',
    phone: '9810044556',
    email: 'neelam.k@example.com',
    address: 'C-78, Defence Colony, New Delhi',
    blood_group: 'O+',
    medical_notes: 'Parkinsons Disease stage 2 - balance impairment, postural instability, and freezing gait.',
    created_at: new Date(Date.now() - 86400000 * 37).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-115',
    uid: 'CLN-202609-0015',
    full_name: 'Tarun Bhardwaj',
    age: 41,
    gender: 'Male',
    phone: '9810055667',
    email: 'tarun.b@example.com',
    address: 'K-9, Green Park Main, New Delhi',
    blood_group: 'A-',
    medical_notes: 'Ankylosing Spondylitis with reduced spinal mobility and morning stiffness.',
    created_at: new Date(Date.now() - 86400000 * 36).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-116',
    uid: 'CLN-202609-0016',
    full_name: 'Shweta Tiwari',
    age: 33,
    gender: 'Female',
    phone: '9810066778',
    email: 'shweta.t@example.com',
    address: 'Plot 45, Sushant Lok Phase 1, Gurugram',
    blood_group: 'AB+',
    medical_notes: 'Post-partum Diastasis Recti (3cm gap) and core weakness.',
    created_at: new Date(Date.now() - 86400000 * 35).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-117',
    uid: 'CLN-202609-0017',
    full_name: 'Manish Chawla',
    age: 50,
    gender: 'Male',
    phone: '9810077889',
    email: 'manish.c@example.com',
    address: 'House 34, Maharani Bagh, New Delhi',
    blood_group: 'B+',
    medical_notes: 'Carpal Tunnel Syndrome (Right Hand) with numbness in thumb and index finger.',
    created_at: new Date(Date.now() - 86400000 * 34).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-118',
    uid: 'CLN-202609-0018',
    full_name: 'Kavita Joshi',
    age: 58,
    gender: 'Female',
    phone: '9810088990',
    email: 'kavita.j@example.com',
    address: 'Tower C, The Palms, South City 1, Gurugram',
    blood_group: 'O+',
    medical_notes: 'Cervicogenic Headache accompanied by vestibular dizziness.',
    created_at: new Date(Date.now() - 86400000 * 33).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-119',
    uid: 'CLN-202609-0019',
    full_name: 'Rohan Deshmukh',
    age: 22,
    gender: 'Male',
    phone: '9810099001',
    email: 'rohan.d@example.com',
    address: 'Hostel Block 4, IIT Delhi Campus, Hauz Khas',
    blood_group: 'A+',
    medical_notes: 'Ankle Inversion Sprain (ATFL partial tear) from basketball match.',
    created_at: new Date(Date.now() - 86400000 * 32).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-120',
    uid: 'CLN-202609-0020',
    full_name: 'Alka Bhattacharya',
    age: 65,
    gender: 'Female',
    phone: '9811100112',
    email: 'alka.b@example.com',
    address: 'Flat 502, Golf View Apts, Saket, New Delhi',
    blood_group: 'B-',
    medical_notes: 'Total Hip Replacement (Left) - Post-surgical week 6 gait training and hip abductor rehab.',
    created_at: new Date(Date.now() - 86400000 * 31).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-121',
    uid: 'CLN-202609-0021',
    full_name: 'Gaurav Kulkarni',
    age: 36,
    gender: 'Male',
    phone: '9811111223',
    email: 'gaurav.k@example.com',
    address: 'M-14, Hauz Khas Enclave, New Delhi',
    blood_group: 'O-',
    medical_notes: 'De Quervain Tenosynovitis (Right Wrist) from repetitive smartphone/mouse use.',
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-122',
    uid: 'CLN-202609-0022',
    full_name: 'Deepa Nambiar',
    age: 49,
    gender: 'Female',
    phone: '9811122334',
    email: 'deepa.n@example.com',
    address: 'Plot 112, Nirvana Country, Sector 50, Gurugram',
    blood_group: 'AB-',
    medical_notes: 'Patellofemoral Pain Syndrome (Runners Knee) in left knee.',
    created_at: new Date(Date.now() - 86400000 * 29).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-123',
    uid: 'CLN-202609-0023',
    full_name: 'Nitin Rastogi',
    age: 43,
    gender: 'Male',
    phone: '9811133445',
    email: 'nitin.r@example.com',
    address: 'C-19, Panchsheel Park, New Delhi',
    blood_group: 'A+',
    medical_notes: 'C5-C6 Cervical Radiculopathy radiating tingling sensation to right forearm.',
    created_at: new Date(Date.now() - 86400000 * 28).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-124',
    uid: 'CLN-202609-0024',
    full_name: 'Sangeeta Pillai',
    age: 61,
    gender: 'Female',
    phone: '9811144556',
    email: 'sangeeta.p@example.com',
    address: 'House 89, Sector 15 Part 2, Gurugram',
    blood_group: 'B+',
    medical_notes: 'Bilateral Lumbar Canal Stenosis with neurogenic claudication at 150m walking.',
    created_at: new Date(Date.now() - 86400000 * 27).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-125',
    uid: 'CLN-202609-0025',
    full_name: 'Aakash Gupta',
    age: 26,
    gender: 'Male',
    phone: '9811155667',
    email: 'aakash.g@example.com',
    address: 'G-12, Lajpat Nagar 3, New Delhi',
    blood_group: 'O+',
    medical_notes: 'Gym injury: Pectoralis Major muscle strain and anterior shoulder soreness.',
    created_at: new Date(Date.now() - 86400000 * 26).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-126',
    uid: 'CLN-202609-0026',
    full_name: 'Pallavi Sen',
    age: 39,
    gender: 'Female',
    phone: '9811166778',
    email: 'pallavi.sen@example.com',
    address: 'Villa 42, Heritage City, MG Road, Gurugram',
    blood_group: 'A-',
    medical_notes: 'Myofascial Pain Syndrome with active trigger points across rhomboids.',
    created_at: new Date(Date.now() - 86400000 * 25).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-127',
    uid: 'CLN-202609-0027',
    full_name: 'Harish Chandra',
    age: 67,
    gender: 'Male',
    phone: '9811177889',
    email: 'harish.c@example.com',
    address: 'D-88, Gulmohar Park, New Delhi',
    blood_group: 'AB+',
    medical_notes: 'Peripheral Neuropathy lower limbs with sensory ataxia and balance instability.',
    created_at: new Date(Date.now() - 86400000 * 24).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-128',
    uid: 'CLN-202609-0028',
    full_name: 'Simran Walia',
    age: 28,
    gender: 'Female',
    phone: '9811188990',
    email: 'simran.w@example.com',
    address: 'Tower 2, Belaire, Golf Course Road, Gurugram',
    blood_group: 'O+',
    medical_notes: 'Post-arthroscopy Meniscal Repair right knee. Week 2 isometric protocol.',
    created_at: new Date(Date.now() - 86400000 * 23).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-129',
    uid: 'CLN-202609-0029',
    full_name: 'Karan Mehra',
    age: 35,
    gender: 'Male',
    phone: '9811199001',
    email: 'karan.m@example.com',
    address: 'S-214, Greater Kailash 2, New Delhi',
    blood_group: 'B+',
    medical_notes: 'Achilles Tendinopathy (Insertional) right heel from marathon training.',
    created_at: new Date(Date.now() - 86400000 * 22).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-130',
    uid: 'CLN-202609-0030',
    full_name: 'Geeta Goswami',
    age: 56,
    gender: 'Female',
    phone: '9812200112',
    email: 'geeta.g@example.com',
    address: 'House 5, Sarvapriya Vihar, New Delhi',
    blood_group: 'A+',
    medical_notes: 'Post-mastectomy Lymphoedema right upper limb. Manual lymphatic drainage.',
    created_at: new Date(Date.now() - 86400000 * 21).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-131',
    uid: 'CLN-202609-0031',
    full_name: 'Pradeep Goel',
    age: 48,
    gender: 'Male',
    phone: '9812211223',
    email: 'pradeep.g@example.com',
    address: 'Plot 88, Sector 43, Golf Course Ext, Gurugram',
    blood_group: 'O-',
    medical_notes: 'L5-S1 Spondylolisthesis (Grade 1) with lumbar instability & hamstring tightness.',
    created_at: new Date(Date.now() - 86400000 * 20).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-132',
    uid: 'CLN-202609-0032',
    full_name: 'Sneha Reddy',
    age: 30,
    gender: 'Female',
    phone: '9812222334',
    email: 'sneha.r@example.com',
    address: 'Flat 101, Anand Lok, New Delhi',
    blood_group: 'B-',
    medical_notes: 'Temporomandibular Joint (TMJ) dysfunction with jaw clicking and masticatory spasm.',
    created_at: new Date(Date.now() - 86400000 * 19).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-133',
    uid: 'CLN-202609-0033',
    full_name: 'Yuvraj Bhatia',
    age: 19,
    gender: 'Male',
    phone: '9812233445',
    email: 'yuvraj.b@example.com',
    address: 'B-6, Safdarjung Enclave, New Delhi',
    blood_group: 'AB+',
    medical_notes: 'Recurrent Glenohumeral Anterior Shoulder Dislocation - rotator cuff strengthening.',
    created_at: new Date(Date.now() - 86400000 * 18).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-134',
    uid: 'CLN-202609-0034',
    full_name: 'Madhu Srivastava',
    age: 64,
    gender: 'Female',
    phone: '9812244556',
    email: 'madhu.s@example.com',
    address: 'House 120, Sector 14, Gurugram',
    blood_group: 'O+',
    medical_notes: 'Osteoporotic Vertebral Compression Fracture (T12) - conservative postural care.',
    created_at: new Date(Date.now() - 86400000 * 17).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-135',
    uid: 'CLN-202609-0035',
    full_name: 'Ashwin Nair',
    age: 44,
    gender: 'Male',
    phone: '9812255667',
    email: 'ashwin.n@example.com',
    address: 'C-303, Som Vihar, RK Puram, New Delhi',
    blood_group: 'A+',
    medical_notes: 'Thoracic Outlet Syndrome with right arm paraesthesia and vascular heaviness.',
    created_at: new Date(Date.now() - 86400000 * 16).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-136',
    uid: 'CLN-202609-0036',
    full_name: 'Bhavna Kapoor',
    age: 51,
    gender: 'Female',
    phone: '9812266778',
    email: 'bhavna.k@example.com',
    address: 'Villa 9, DLF Phase 2, Gurugram',
    blood_group: 'B+',
    medical_notes: 'Greater Trochanteric Pain Syndrome (Gluteal tendinopathy left hip).',
    created_at: new Date(Date.now() - 86400000 * 15).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-137',
    uid: 'CLN-202609-0037',
    full_name: 'Devendra Chauhan',
    age: 70,
    gender: 'Male',
    phone: '9812277889',
    email: 'devendra.c@example.com',
    address: 'E-33, Vasant Marg, Vasant Vihar, New Delhi',
    blood_group: 'O+',
    medical_notes: 'Post-CABG Cardiac Rehabilitation phase 2. Aerobic conditioning and telemetry.',
    created_at: new Date(Date.now() - 86400000 * 14).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-138',
    uid: 'CLN-202609-0038',
    full_name: 'Isha Singhal',
    age: 25,
    gender: 'Female',
    phone: '9812288990',
    email: 'isha.s@example.com',
    address: 'Flat 7B, Sukhdev Vihar, New Delhi',
    blood_group: 'A-',
    medical_notes: 'Medial Tibial Stress Syndrome (Shin Splints) from half-marathon running.',
    created_at: new Date(Date.now() - 86400000 * 13).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-139',
    uid: 'CLN-202609-0039',
    full_name: 'Rajat Bajaj',
    age: 38,
    gender: 'Male',
    phone: '9812299001',
    email: 'rajat.b@example.com',
    address: 'House 56, Sector 56, Gurugram',
    blood_group: 'AB-',
    medical_notes: 'Medial Epicondylitis (Golfers Elbow Right) with wrist flexor tendinosis.',
    created_at: new Date(Date.now() - 86400000 * 12).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-140',
    uid: 'CLN-202609-0040',
    full_name: 'Zoya Khan',
    age: 32,
    gender: 'Female',
    phone: '9813300112',
    email: 'zoya.k@example.com',
    address: 'A-210, Jamia Nagar, Okhla, New Delhi',
    blood_group: 'B+',
    medical_notes: 'Fibromyalgia - generalized widespread muscular tenderness, dry needling prescribed.',
    created_at: new Date(Date.now() - 86400000 * 11).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-141',
    uid: 'CLN-202609-0041',
    full_name: 'Suresh Menon',
    age: 60,
    gender: 'Male',
    phone: '9813311223',
    email: 'suresh.m@example.com',
    address: 'B-72, Mayfair Gardens, Hauz Khas, New Delhi',
    blood_group: 'O+',
    medical_notes: 'Bilateral Primary Hip Osteoarthritis with restricted internal rotation.',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-142',
    uid: 'CLN-202609-0042',
    full_name: 'Tanvi Mathur',
    age: 23,
    gender: 'Female',
    phone: '9813322334',
    email: 'tanvi.m@example.com',
    address: 'Tower 8, Central Park 2, Sohna Road, Gurugram',
    blood_group: 'A+',
    medical_notes: 'Post-Bells Palsy Facial Palsy (Right) - neuromuscular electrical stimulation.',
    created_at: new Date(Date.now() - 86400000 * 9).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-143',
    uid: 'CLN-202609-0043',
    full_name: 'Harpreet Singh',
    age: 47,
    gender: 'Male',
    phone: '9813333445',
    email: 'harpreet.s@example.com',
    address: 'Plot 14, Westend Colony, Rao Tula Ram Marg, New Delhi',
    blood_group: 'B+',
    medical_notes: 'Lumbar Facet Arthropathy and chronic low back stiffness.',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-144',
    uid: 'CLN-202609-0044',
    full_name: 'Rashmi Nanda',
    age: 55,
    gender: 'Female',
    phone: '9813344556',
    email: 'rashmi.n@example.com',
    address: 'House 204, Sector 17, Gurugram',
    blood_group: 'O-',
    medical_notes: 'Post-Colles Fracture (Right Wrist) 8 weeks post-cast removal. Joint stiffness.',
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-145',
    uid: 'CLN-202609-0045',
    full_name: 'Aditya Swaminathan',
    age: 31,
    gender: 'Male',
    phone: '9813355667',
    email: 'aditya.s@example.com',
    address: 'Flat 402, Tara Apts, Alaknanda, New Delhi',
    blood_group: 'AB+',
    medical_notes: 'Iliotibial (IT) Band Friction Syndrome in right lateral knee.',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-146',
    uid: 'CLN-202609-0046',
    full_name: 'Preeti Aggarwal',
    age: 42,
    gender: 'Female',
    phone: '9813366778',
    email: 'preeti.a@example.com',
    address: 'House 16, Block E, Masjid Moth, Greater Kailash 3',
    blood_group: 'A-',
    medical_notes: 'Cervical Spondylotic Myelopathy (Early) with brisk reflexes and balance training.',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-147',
    uid: 'CLN-202609-0047',
    full_name: 'Naveen Jindal',
    age: 53,
    gender: 'Male',
    phone: '9813377889',
    email: 'naveen.j@example.com',
    address: 'Villa 6, Laburnum, Sushant Lok A Block, Gurugram',
    blood_group: 'B+',
    medical_notes: 'Chronic Calcaneal Spur & Plantar Fascial Thickening left foot.',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-148',
    uid: 'CLN-202609-0048',
    full_name: 'Kavita Dasgupta',
    age: 66,
    gender: 'Female',
    phone: '9813388990',
    email: 'kavita.d@example.com',
    address: 'B-14, Maharani Bagh, New Delhi',
    blood_group: 'O+',
    medical_notes: 'Multiple Sclerosis - fatigue management, energy conservation and spasticity relief.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-149',
    uid: 'CLN-202609-0049',
    full_name: 'Samar Pratap Singh',
    age: 21,
    gender: 'Male',
    phone: '9813399001',
    email: 'samar.s@example.com',
    address: 'House 88, Sector 4, R.K. Puram, New Delhi',
    blood_group: 'A+',
    medical_notes: 'Quadriceps Contusion & Hematoma from martial arts sparring.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'pat-150',
    uid: 'CLN-202609-0050',
    full_name: 'Dr. Ananya Mukherjee',
    age: 46,
    gender: 'Female',
    phone: '9814400112',
    email: 'ananya.m@example.com',
    address: 'Flat 801, Beverly Park 1, MG Road, Gurugram',
    blood_group: 'AB+',
    medical_notes: 'Post-COVID Deconditioning and Restrictive Lung Pattern. Incentive spirometry & pulmonary rehab.',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export function generateDemoVisits(): StoredVisit[] {
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const d1 = new Date(now.getTime() - 86400000 * 1).toISOString().split('T')[0]
  const d2 = new Date(now.getTime() - 86400000 * 2).toISOString().split('T')[0]
  const d3 = new Date(now.getTime() - 86400000 * 3).toISOString().split('T')[0]
  const d4 = new Date(now.getTime() - 86400000 * 4).toISOString().split('T')[0]
  const d5 = new Date(now.getTime() - 86400000 * 5).toISOString().split('T')[0]
  const d6 = new Date(now.getTime() - 86400000 * 6).toISOString().split('T')[0]
  const d7 = new Date(now.getTime() - 86400000 * 7).toISOString().split('T')[0]
  const d8 = new Date(now.getTime() - 86400000 * 8).toISOString().split('T')[0]
  const d10 = new Date(now.getTime() - 86400000 * 10).toISOString().split('T')[0]

  return [
    // === TODAY'S VISITS (ALL CENTRES & DOCTORS) ===
    {
      id: 'vis-demo-1',
      bill_number: 'INV-202609-0001',
      patient_id: 'pat-101',
      patient_uid: 'CLN-202609-0001',
      patient_name: 'Rahul Verma',
      patient_phone: '9876511111',
      patient_age: 38,
      patient_gender: 'Male',
      doctor_id: 'doc-101',
      doctor_name: 'Dr. Sarah Jenkins',
      doctor_specialization: 'Orthopedic Physiotherapy',
      centre_id: 'c1111111-1111-1111-1111-111111111111',
      centre_name: 'New Friends Colony, New Delhi',
      centre_address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
      centre_phone: '08383936905',
      items: [
        { service_name: 'Initial Consultation & Assessment', price: 600, quantity: 1, total: 600 },
        { service_name: 'Dry Needling Therapy (Trigger Point Release)', price: 750, quantity: 1, total: 750 },
        { service_name: 'Spine Decompression & Mechanical Traction', price: 950, quantity: 1, total: 950 },
      ],
      subtotal: 2300,
      discount: 200,
      discount_preset_name: 'Special Care Discount (₹200)',
      total: 2100,
      payment_mode: 'UPI',
      payment_status: 'Paid',
      notes: 'Significant spasm reduction after lumbar dry needling. Ice pack applied post-session.',
      visit_date: todayStr,
      created_at: new Date(now.getTime() - 3600000 * 5).toISOString(),
    },
    {
      id: 'vis-demo-2',
      bill_number: 'INV-202609-0002',
      patient_id: 'pat-102',
      patient_uid: 'CLN-202609-0002',
      patient_name: 'Ananya Sharma',
      patient_phone: '9876522222',
      patient_age: 29,
      patient_gender: 'Female',
      doctor_id: 'doc-201',
      doctor_name: 'Dr. Emily Watson',
      doctor_specialization: 'Neuro Physiotherapy',
      centre_id: 'c2222222-2222-2222-2222-222222222222',
      centre_name: 'Vasant Vihar, New Delhi',
      centre_address: '86 Basement, Poorvi Marg, Vasant Vihar, New Delhi – 110057',
      centre_phone: '08700264533',
      items: [
        { service_name: 'Manual Therapy & Joint Mobilization', price: 900, quantity: 1, total: 900 },
        { service_name: 'Cupping & Myofascial Release Therapy', price: 700, quantity: 1, total: 700 },
      ],
      subtotal: 1600,
      discount: 160,
      discount_preset_name: 'Welcome 10% Off',
      total: 1440,
      payment_mode: 'Card',
      payment_status: 'Paid',
      notes: 'Suboccipital release and cervical postural alignment exercises demonstrated.',
      visit_date: todayStr,
      created_at: new Date(now.getTime() - 3600000 * 3).toISOString(),
    },
    {
      id: 'vis-demo-3',
      bill_number: 'INV-202609-0003',
      patient_id: 'pat-103',
      patient_uid: 'CLN-202609-0003',
      patient_name: 'Rajesh Singhania',
      patient_phone: '9876533333',
      patient_age: 54,
      patient_gender: 'Male',
      doctor_id: 'doc-301',
      doctor_name: 'Dr. Priya Nair',
      doctor_specialization: 'Cardiorespiratory Rehab',
      centre_id: 'c3333333-3333-3333-3333-333333333333',
      centre_name: 'Gurugram – DLF Phase 1',
      centre_address: 'C2/17, Arjun Marg, DLF Phase 1, Gurugram, Haryana – 122002',
      centre_phone: '+91 92171 83736',
      items: [
        { service_name: '10-Session Comprehensive Rehab Bundle', price: 6800, quantity: 1, total: 6800 },
      ],
      subtotal: 6800,
      discount: 300,
      discount_preset_name: 'Corporate Privilege (₹300)',
      total: 6500,
      payment_mode: 'UPI',
      payment_status: 'Paid',
      notes: 'Enrolled in 10-session knee arthroplasty recovery protocol. Session 1 completed.',
      visit_date: todayStr,
      created_at: new Date(now.getTime() - 3600000 * 2).toISOString(),
    },
    {
      id: 'vis-demo-4',
      bill_number: 'INV-202609-0004',
      patient_id: 'pat-105',
      patient_uid: 'CLN-202609-0005',
      patient_name: 'Kabir Oberoi',
      patient_phone: '9876555555',
      patient_age: 24,
      patient_gender: 'Male',
      doctor_id: 'doc-102',
      doctor_name: 'Dr. Rajesh Sharma',
      doctor_specialization: 'Sports Rehabilitation',
      centre_id: 'c1111111-1111-1111-1111-111111111111',
      centre_name: 'New Friends Colony, New Delhi',
      centre_address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
      centre_phone: '08383936905',
      items: [
        { service_name: 'Sports Injury Rehabilitation & Conditioning', price: 1200, quantity: 1, total: 1200 },
        { service_name: 'High-Power Laser Therapy (Class 4)', price: 1000, quantity: 1, total: 1000 },
      ],
      subtotal: 2200,
      discount: 0,
      total: 2200,
      payment_mode: 'Card',
      payment_status: 'Paid',
      notes: 'Proprioceptive single-leg balance and laser therapy on patellar tendon.',
      visit_date: todayStr,
      created_at: new Date(now.getTime() - 3600000 * 1).toISOString(),
    },
    {
      id: 'vis-demo-5',
      bill_number: 'INV-202609-0005',
      patient_id: 'pat-107',
      patient_uid: 'CLN-202609-0007',
      patient_name: 'Siddharth Roy',
      patient_phone: '9876577777',
      patient_age: 34,
      patient_gender: 'Male',
      doctor_id: 'doc-202',
      doctor_name: 'Dr. Michael Chang',
      doctor_specialization: 'Spine & Posture Specialist',
      centre_id: 'c2222222-2222-2222-2222-222222222222',
      centre_name: 'Vasant Vihar, New Delhi',
      centre_address: '86 Basement, Poorvi Marg, Vasant Vihar, New Delhi – 110057',
      centre_phone: '08700264533',
      items: [
        { service_name: 'Spine Decompression & Mechanical Traction', price: 950, quantity: 2, total: 1900 },
        { service_name: 'Ergonomic Evaluation & Posture Correction', price: 850, quantity: 1, total: 850 },
      ],
      subtotal: 2750,
      discount: 250,
      discount_preset_name: 'Spine Care Package Discount',
      total: 2500,
      payment_mode: 'UPI',
      payment_status: 'Paid',
      notes: 'Lumbar traction with spinal realignment protocol by Dr. Chang.',
      visit_date: todayStr,
      created_at: new Date(now.getTime() - 3600000 * 4).toISOString(),
    },
    {
      id: 'vis-demo-6',
      bill_number: 'INV-202609-0006',
      patient_id: 'pat-108',
      patient_uid: 'CLN-202609-0008',
      patient_name: 'Pooja Mehta',
      patient_phone: '9876588888',
      patient_age: 31,
      patient_gender: 'Female',
      doctor_id: 'doc-302',
      doctor_name: 'Dr. David Kim',
      doctor_specialization: 'Pediatric Physiotherapy',
      centre_id: 'c3333333-3333-3333-3333-333333333333',
      centre_name: 'Gurugram – DLF Phase 1',
      centre_address: 'C2/17, Arjun Marg, DLF Phase 1, Gurugram, Haryana – 122002',
      centre_phone: '+91 92171 83736',
      items: [
        { service_name: 'Pediatric Physiotherapy & Motor Skills', price: 1000, quantity: 2, total: 2000 },
        { service_name: 'Kinesiology Taping & Strapping', price: 450, quantity: 1, total: 450 },
      ],
      subtotal: 2450,
      discount: 200,
      total: 2250,
      payment_mode: 'Card',
      payment_status: 'Paid',
      notes: 'Motor milestones developmental therapy and stabilizing taping.',
      visit_date: todayStr,
      created_at: new Date(now.getTime() - 3600000 * 2).toISOString(),
    },

    // === PAST DAYS: DR. SARAH JENKINS (NFC) ===
    {
      id: 'vis-demo-7',
      bill_number: 'INV-202609-0007',
      patient_id: 'pat-104',
      patient_uid: 'CLN-202609-0004',
      patient_name: 'Meera Krishnan',
      patient_phone: '9876544444',
      patient_age: 46,
      patient_gender: 'Female',
      doctor_id: 'doc-101',
      doctor_name: 'Dr. Sarah Jenkins',
      doctor_specialization: 'Orthopedic Physiotherapy',
      centre_id: 'c1111111-1111-1111-1111-111111111111',
      centre_name: 'New Friends Colony, New Delhi',
      items: [
        { service_name: '5-Session Pain Relief & Recovery Bundle', price: 3600, quantity: 1, total: 3600 },
      ],
      subtotal: 3600,
      discount: 200,
      total: 3400,
      payment_mode: 'UPI',
      payment_status: 'Paid',
      notes: 'Frozen shoulder mobilization package booked.',
      visit_date: d1,
      created_at: new Date(now.getTime() - 86400000 * 1).toISOString(),
    },
    {
      id: 'vis-demo-8',
      bill_number: 'INV-202609-0008',
      patient_id: 'pat-110',
      patient_uid: 'CLN-202609-0010',
      patient_name: 'Divya Saxena',
      patient_phone: '9871112345',
      patient_age: 37,
      patient_gender: 'Female',
      doctor_id: 'doc-101',
      doctor_name: 'Dr. Sarah Jenkins',
      doctor_specialization: 'Orthopedic Physiotherapy',
      centre_id: 'c1111111-1111-1111-1111-111111111111',
      centre_name: 'New Friends Colony, New Delhi',
      items: [
        { service_name: 'Ergonomic Evaluation & Posture Correction', price: 850, quantity: 1, total: 850 },
        { service_name: 'Manual Therapy & Joint Mobilization', price: 900, quantity: 1, total: 900 },
      ],
      subtotal: 1750,
      discount: 200,
      total: 1550,
      payment_mode: 'Card',
      payment_status: 'Paid',
      notes: 'Thoracic mobilization and ergonomic chair lumbar support recommendation.',
      visit_date: d3,
      created_at: new Date(now.getTime() - 86400000 * 3).toISOString(),
    },
    {
      id: 'vis-demo-9',
      bill_number: 'INV-202609-0009',
      patient_id: 'pat-101',
      patient_uid: 'CLN-202609-0001',
      patient_name: 'Rahul Verma',
      patient_phone: '9876511111',
      doctor_id: 'doc-101',
      doctor_name: 'Dr. Sarah Jenkins',
      doctor_specialization: 'Orthopedic Physiotherapy',
      centre_id: 'c1111111-1111-1111-1111-111111111111',
      centre_name: 'New Friends Colony, New Delhi',
      items: [
        { service_name: 'Standard Physiotherapy Session (45 min)', price: 800, quantity: 1, total: 800 },
        { service_name: 'Electrotherapy (IFT / TENS / Ultrasound)', price: 500, quantity: 1, total: 500 },
      ],
      subtotal: 1300,
      discount: 100,
      total: 1200,
      payment_mode: 'UPI',
      payment_status: 'Paid',
      notes: 'Core stabilization and bridging exercises performed with good control.',
      visit_date: d4,
      created_at: new Date(now.getTime() - 86400000 * 4).toISOString(),
    },

    // === PAST DAYS: DR. RAJESH SHARMA (NFC) ===
    {
      id: 'vis-demo-10',
      bill_number: 'INV-202609-0010',
      patient_id: 'pat-105',
      patient_uid: 'CLN-202609-0005',
      patient_name: 'Kabir Oberoi',
      patient_phone: '9876555555',
      patient_age: 24,
      patient_gender: 'Male',
      doctor_id: 'doc-102',
      doctor_name: 'Dr. Rajesh Sharma',
      doctor_specialization: 'Sports Rehabilitation',
      centre_id: 'c1111111-1111-1111-1111-111111111111',
      centre_name: 'New Friends Colony, New Delhi',
      items: [
        { service_name: '5-Session Pain Relief & Recovery Bundle', price: 3600, quantity: 1, total: 3600 },
        { service_name: 'High-Power Laser Therapy (Class 4)', price: 1000, quantity: 1, total: 1000 },
      ],
      subtotal: 4600,
      discount: 400,
      total: 4200,
      payment_mode: 'UPI',
      payment_status: 'Paid',
      notes: 'ACL return-to-sport agility and rotational conditioning drills.',
      visit_date: d2,
      created_at: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
    {
      id: 'vis-demo-11',
      bill_number: 'INV-202609-0011',
      patient_id: 'pat-103',
      patient_uid: 'CLN-202609-0003',
      patient_name: 'Rajesh Singhania',
      patient_phone: '9876533333',
      doctor_id: 'doc-102',
      doctor_name: 'Dr. Rajesh Sharma',
      doctor_specialization: 'Sports Rehabilitation',
      centre_id: 'c1111111-1111-1111-1111-111111111111',
      centre_name: 'New Friends Colony, New Delhi',
      items: [
        { service_name: 'Post-Operative Orthopedic Rehab (ACL/Knee/Hip)', price: 1100, quantity: 2, total: 2200 },
        { service_name: 'Kinesiology Taping & Strapping', price: 450, quantity: 1, total: 450 },
      ],
      subtotal: 2650,
      discount: 250,
      total: 2400,
      payment_mode: 'Card',
      payment_status: 'Paid',
      notes: 'Quadriceps activation and knee flexor progressive loading.',
      visit_date: d5,
      created_at: new Date(now.getTime() - 86400000 * 5).toISOString(),
    },

    // === PAST DAYS: DR. EMILY WATSON (VASANT VIHAR) ===
    {
      id: 'vis-demo-12',
      bill_number: 'INV-202609-0012',
      patient_id: 'pat-106',
      patient_uid: 'CLN-202609-0006',
      patient_name: 'Sunita Agarwal',
      patient_phone: '9876566666',
      patient_age: 63,
      patient_gender: 'Female',
      doctor_id: 'doc-201',
      doctor_name: 'Dr. Emily Watson',
      doctor_specialization: 'Neuro Physiotherapy',
      centre_id: 'c2222222-2222-2222-2222-222222222222',
      centre_name: 'Vasant Vihar, New Delhi',
      items: [
        { service_name: 'Standard Physiotherapy Session (45 min)', price: 800, quantity: 1, total: 800 },
        { service_name: 'Electrotherapy (IFT / TENS / Ultrasound)', price: 500, quantity: 1, total: 500 },
      ],
      subtotal: 1300,
      discount: 100,
      total: 1200,
      payment_mode: 'Cash',
      payment_status: 'Paid',
      notes: 'Knee joint IFT therapy & isometric quadriceps strengthening.',
      visit_date: d1,
      created_at: new Date(now.getTime() - 86400000 * 1).toISOString(),
    },
    {
      id: 'vis-demo-13',
      bill_number: 'INV-202609-0013',
      patient_id: 'pat-109',
      patient_uid: 'CLN-202609-0009',
      patient_name: 'Amitav Sen',
      patient_phone: '9876599999',
      patient_age: 72,
      patient_gender: 'Male',
      doctor_id: 'doc-201',
      doctor_name: 'Dr. Emily Watson',
      doctor_specialization: 'Neuro Physiotherapy',
      centre_id: 'c2222222-2222-2222-2222-222222222222',
      centre_name: 'Vasant Vihar, New Delhi',
      items: [
        { service_name: 'Stroke & Paralysis Functional Rehab', price: 1500, quantity: 2, total: 3000 },
        { service_name: 'Neurological Rehabilitation Session', price: 1300, quantity: 1, total: 1300 },
      ],
      subtotal: 4300,
      discount: 300,
      total: 4000,
      payment_mode: 'Insurance',
      payment_status: 'Paid',
      notes: 'Post-stroke hemiparesis gait training and upper extremity fine motor coordination.',
      visit_date: d3,
      created_at: new Date(now.getTime() - 86400000 * 3).toISOString(),
    },
    {
      id: 'vis-demo-14',
      bill_number: 'INV-202609-0014',
      patient_id: 'pat-102',
      patient_uid: 'CLN-202609-0002',
      patient_name: 'Ananya Sharma',
      patient_phone: '9876522222',
      doctor_id: 'doc-201',
      doctor_name: 'Dr. Emily Watson',
      doctor_specialization: 'Neuro Physiotherapy',
      centre_id: 'c2222222-2222-2222-2222-222222222222',
      centre_name: 'Vasant Vihar, New Delhi',
      items: [
        { service_name: 'Initial Consultation & Assessment', price: 600, quantity: 1, total: 600 },
        { service_name: 'High-Power Laser Therapy (Class 4)', price: 1000, quantity: 1, total: 1000 },
      ],
      subtotal: 1600,
      discount: 100,
      total: 1500,
      payment_mode: 'Card',
      payment_status: 'Paid',
      notes: 'Initial cervical consultation with class 4 laser on trigger bands.',
      visit_date: d6,
      created_at: new Date(now.getTime() - 86400000 * 6).toISOString(),
    },

    // === PAST DAYS: DR. MICHAEL CHANG (VASANT VIHAR) ===
    {
      id: 'vis-demo-15',
      bill_number: 'INV-202609-0015',
      patient_id: 'pat-107',
      patient_uid: 'CLN-202609-0007',
      patient_name: 'Siddharth Roy',
      patient_phone: '9876577777',
      patient_age: 34,
      patient_gender: 'Male',
      doctor_id: 'doc-202',
      doctor_name: 'Dr. Michael Chang',
      doctor_specialization: 'Spine & Posture Specialist',
      centre_id: 'c2222222-2222-2222-2222-222222222222',
      centre_name: 'Vasant Vihar, New Delhi',
      items: [
        { service_name: '20-Session Spine & Neuro Extended Rehab', price: 12500, quantity: 1, total: 12500 },
      ],
      subtotal: 12500,
      discount: 1000,
      discount_preset_name: 'Executive Rehab Package (₹1000)',
      total: 11500,
      payment_mode: 'UPI',
      payment_status: 'Paid',
      notes: '20-session disc decompression and postural rehabilitation protocol enrolled.',
      visit_date: d2,
      created_at: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
    {
      id: 'vis-demo-16',
      bill_number: 'INV-202609-0016',
      patient_id: 'pat-110',
      patient_uid: 'CLN-202609-0010',
      patient_name: 'Divya Saxena',
      patient_phone: '9871112345',
      doctor_id: 'doc-202',
      doctor_name: 'Dr. Michael Chang',
      doctor_specialization: 'Spine & Posture Specialist',
      centre_id: 'c2222222-2222-2222-2222-222222222222',
      centre_name: 'Vasant Vihar, New Delhi',
      items: [
        { service_name: 'Spine Decompression & Mechanical Traction', price: 950, quantity: 1, total: 950 },
        { service_name: 'Manual Therapy & Joint Mobilization', price: 900, quantity: 1, total: 900 },
      ],
      subtotal: 1850,
      discount: 150,
      total: 1700,
      payment_mode: 'Card',
      payment_status: 'Paid',
      notes: 'Cervicothoracic mobilization with gentle mechanical traction.',
      visit_date: d4,
      created_at: new Date(now.getTime() - 86400000 * 4).toISOString(),
    },

    // === PAST DAYS: DR. PRIYA NAIR (GURUGRAM) ===
    {
      id: 'vis-demo-17',
      bill_number: 'INV-202609-0017',
      patient_id: 'pat-108',
      patient_uid: 'CLN-202609-0008',
      patient_name: 'Pooja Mehta',
      patient_phone: '9876588888',
      patient_age: 31,
      patient_gender: 'Female',
      doctor_id: 'doc-301',
      doctor_name: 'Dr. Priya Nair',
      doctor_specialization: 'Cardiorespiratory Rehab',
      centre_id: 'c3333333-3333-3333-3333-333333333333',
      centre_name: 'Gurugram – DLF Phase 1',
      items: [
        { service_name: 'High-Power Laser Therapy (Class 4)', price: 1000, quantity: 1, total: 1000 },
        { service_name: 'Kinesiology Taping & Strapping', price: 450, quantity: 1, total: 450 },
      ],
      subtotal: 1450,
      discount: 0,
      total: 1450,
      payment_mode: 'UPI',
      payment_status: 'Paid',
      notes: 'Laser therapy on extensor carpi radialis brevis tendon with inhibitory taping.',
      visit_date: d2,
      created_at: new Date(now.getTime() - 86400000 * 2).toISOString(),
    },
    {
      id: 'vis-demo-18',
      bill_number: 'INV-202609-0018',
      patient_id: 'pat-104',
      patient_uid: 'CLN-202609-0004',
      patient_name: 'Meera Krishnan',
      patient_phone: '9876544444',
      doctor_id: 'doc-301',
      doctor_name: 'Dr. Priya Nair',
      doctor_specialization: 'Cardiorespiratory Rehab',
      centre_id: 'c3333333-3333-3333-3333-333333333333',
      centre_name: 'Gurugram – DLF Phase 1',
      items: [
        { service_name: 'Chest Physiotherapy & Postural Drainage', price: 750, quantity: 2, total: 1500 },
        { service_name: 'Full Body Wellness & Recovery Package', price: 2500, quantity: 1, total: 2500 },
      ],
      subtotal: 4000,
      discount: 300,
      total: 3700,
      payment_mode: 'UPI',
      payment_status: 'Paid',
      notes: 'Breathing re-education and thoracic capacity expansion exercises.',
      visit_date: d5,
      created_at: new Date(now.getTime() - 86400000 * 5).toISOString(),
    },
    {
      id: 'vis-demo-19',
      bill_number: 'INV-202609-0019',
      patient_id: 'pat-103',
      patient_uid: 'CLN-202609-0003',
      patient_name: 'Rajesh Singhania',
      patient_phone: '9876533333',
      doctor_id: 'doc-301',
      doctor_name: 'Dr. Priya Nair',
      doctor_specialization: 'Cardiorespiratory Rehab',
      centre_id: 'c3333333-3333-3333-3333-333333333333',
      centre_name: 'Gurugram – DLF Phase 1',
      items: [
        { service_name: 'Manual Therapy & Joint Mobilization', price: 900, quantity: 2, total: 1800 },
        { service_name: 'Dry Needling Therapy (Trigger Point Release)', price: 750, quantity: 1, total: 750 },
      ],
      subtotal: 2550,
      discount: 150,
      total: 2400,
      payment_mode: 'Card',
      payment_status: 'Paid',
      notes: 'Patellofemoral joint glide and vastus medialis trigger release.',
      visit_date: d7,
      created_at: new Date(now.getTime() - 86400000 * 7).toISOString(),
    },

    // === PAST DAYS: DR. DAVID KIM (GURUGRAM) ===
    {
      id: 'vis-demo-20',
      bill_number: 'INV-202609-0020',
      patient_id: 'pat-108',
      patient_uid: 'CLN-202609-0008',
      patient_name: 'Pooja Mehta',
      patient_phone: '9876588888',
      patient_age: 31,
      patient_gender: 'Female',
      doctor_id: 'doc-302',
      doctor_name: 'Dr. David Kim',
      doctor_specialization: 'Pediatric Physiotherapy',
      centre_id: 'c3333333-3333-3333-3333-333333333333',
      centre_name: 'Gurugram – DLF Phase 1',
      items: [
        { service_name: '5-Session Pain Relief & Recovery Bundle', price: 3600, quantity: 1, total: 3600 },
      ],
      subtotal: 3600,
      discount: 300,
      total: 3300,
      payment_mode: 'UPI',
      payment_status: 'Paid',
      notes: 'Pediatric gross motor coordination and balance retraining 5-pack.',
      visit_date: d4,
      created_at: new Date(now.getTime() - 86400000 * 4).toISOString(),
    },
    {
      id: 'vis-demo-21',
      bill_number: 'INV-202609-0021',
      patient_id: 'pat-105',
      patient_uid: 'CLN-202609-0005',
      patient_name: 'Kabir Oberoi',
      patient_phone: '9876555555',
      doctor_id: 'doc-302',
      doctor_name: 'Dr. David Kim',
      doctor_specialization: 'Pediatric Physiotherapy',
      centre_id: 'c3333333-3333-3333-3333-333333333333',
      centre_name: 'Gurugram – DLF Phase 1',
      items: [
        { service_name: 'Pediatric Physiotherapy & Motor Skills', price: 1000, quantity: 1, total: 1000 },
        { service_name: 'Manual Therapy & Joint Mobilization', price: 900, quantity: 1, total: 900 },
      ],
      subtotal: 1900,
      discount: 100,
      total: 1800,
      payment_mode: 'Card',
      payment_status: 'Paid',
      notes: 'Youth sports biomechanics and jumping landing alignment.',
      visit_date: d6,
      created_at: new Date(now.getTime() - 86400000 * 6).toISOString(),
    },
    {
      id: 'vis-demo-22',
      bill_number: 'INV-202609-0022',
      patient_id: 'pat-101',
      patient_uid: 'CLN-202609-0001',
      patient_name: 'Rahul Verma',
      patient_phone: '9876511111',
      doctor_id: 'doc-302',
      doctor_name: 'Dr. David Kim',
      doctor_specialization: 'Pediatric Physiotherapy',
      centre_id: 'c3333333-3333-3333-3333-333333333333',
      centre_name: 'Gurugram – DLF Phase 1',
      items: [
        { service_name: 'Standard Physiotherapy Session (45 min)', price: 800, quantity: 2, total: 1600 },
      ],
      subtotal: 1600,
      discount: 100,
      total: 1500,
      payment_mode: 'Cash',
      payment_status: 'Paid',
      notes: 'Gait assessment and functional rehabilitation review.',
      visit_date: d8,
      created_at: new Date(now.getTime() - 86400000 * 8).toISOString(),
    },
  ]
}

export const DEMO_FEEDBACK: PatientFeedback[] = [
  {
    id: 'fb-demo-1',
    bill_number: 'INV-202609-0001',
    patient_uid: 'CLN-202609-0001',
    patient_name: 'Rahul Verma',
    patient_phone: '9876511111',
    doctor_name: 'Dr. Sarah Jenkins',
    centre_name: 'New Friends Colony, New Delhi',
    rating: 5,
    hygiene_rating: 5,
    treatment_rating: 5,
    staff_rating: 5,
    comments: 'Outstanding relief from lower back pain in just 3 sessions with Dr. Sarah Jenkins. Dry needling was super effective!',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'fb-demo-2',
    bill_number: 'INV-202609-0002',
    patient_uid: 'CLN-202609-0002',
    patient_name: 'Ananya Sharma',
    patient_phone: '9876522222',
    doctor_name: 'Dr. Emily Watson',
    centre_name: 'Vasant Vihar, New Delhi',
    rating: 5,
    hygiene_rating: 5,
    treatment_rating: 5,
    staff_rating: 5,
    comments: 'Dr. Emily Watson helped me recover full neck flexibility. Very clean, tranquil clinic in Vasant Vihar!',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'fb-demo-3',
    bill_number: 'INV-202609-0003',
    patient_uid: 'CLN-202609-0003',
    patient_name: 'Rajesh Singhania',
    patient_phone: '9876533333',
    doctor_name: 'Dr. Priya Nair',
    centre_name: 'Gurugram – DLF Phase 1',
    rating: 5,
    hygiene_rating: 5,
    treatment_rating: 5,
    staff_rating: 5,
    comments: 'World-class knee rehabilitation facility in DLF Phase 1. Dr. Priya is exceptionally caring, patient and knowledgeable.',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'fb-demo-4',
    bill_number: 'INV-202609-0004',
    patient_uid: 'CLN-202609-0005',
    patient_name: 'Kabir Oberoi',
    patient_phone: '9876555555',
    doctor_name: 'Dr. Rajesh Sharma',
    centre_name: 'New Friends Colony, New Delhi',
    rating: 5,
    hygiene_rating: 5,
    treatment_rating: 5,
    staff_rating: 5,
    comments: 'Dr. Rajesh Sharma’s sports drills got me back on the football pitch after my ACL tear. 10/10 recommendation!',
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'fb-demo-5',
    bill_number: 'INV-202609-0006',
    patient_uid: 'CLN-202609-0006',
    patient_name: 'Sunita Agarwal',
    patient_phone: '9876566666',
    doctor_name: 'Dr. Emily Watson',
    centre_name: 'Vasant Vihar, New Delhi',
    rating: 5,
    hygiene_rating: 5,
    treatment_rating: 5,
    staff_rating: 5,
    comments: 'Very gentle and effective physiotherapy for my knee osteoarthritis. I can now climb stairs without hesitation.',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'fb-demo-6',
    bill_number: 'INV-202609-0010',
    patient_uid: 'CLN-202609-0010',
    patient_name: 'Divya Saxena',
    patient_phone: '9871112345',
    doctor_name: 'Dr. Sarah Jenkins',
    centre_name: 'New Friends Colony, New Delhi',
    rating: 4,
    hygiene_rating: 5,
    treatment_rating: 4,
    staff_rating: 5,
    comments: 'Great ergonomic advice and posture release. Clinic ambience is very peaceful.',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'fb-demo-7',
    bill_number: 'INV-202609-0015',
    patient_uid: 'CLN-202609-0007',
    patient_name: 'Siddharth Roy',
    patient_phone: '9876577777',
    doctor_name: 'Dr. Michael Chang',
    centre_name: 'Vasant Vihar, New Delhi',
    rating: 5,
    hygiene_rating: 5,
    treatment_rating: 5,
    staff_rating: 5,
    comments: 'Dr. Michael Chang is an expert with spinal decompression. My chronic back stiffness has vanished!',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'fb-demo-8',
    bill_number: 'INV-202609-0020',
    patient_uid: 'CLN-202609-0008',
    patient_name: 'Pooja Mehta',
    patient_phone: '9876588888',
    doctor_name: 'Dr. David Kim',
    centre_name: 'Gurugram – DLF Phase 1',
    rating: 5,
    hygiene_rating: 5,
    treatment_rating: 5,
    staff_rating: 5,
    comments: 'Dr. David Kim was remarkably patient and kind during our pediatric motor sessions. Superb progress!',
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
]

export async function seedDemoData(): Promise<{ patients: number; visits: number; feedback: number }> {
  localStorage.setItem('physio_patients_cache_v5', JSON.stringify(DEMO_PATIENTS))
  localStorage.setItem('physio_visits_cache_v7', JSON.stringify(DEFAULT_VISITS))
  localStorage.setItem('physio_feedback_cache_v6', JSON.stringify(DEMO_FEEDBACK))

  return {
    patients: DEMO_PATIENTS.length,
    visits: DEFAULT_VISITS.length,
    feedback: DEMO_FEEDBACK.length,
  }
}

export async function clearDemoData(): Promise<void> {
  const currentPatients = await getPatients()
  const currentVisits = await getVisits()
  const currentFeedback = await getPatientFeedback()

  const nonDemoPatients = currentPatients.filter(p => !p.id.startsWith('pat-') && !p.id.startsWith('pat-demo'))
  const nonDemoVisits = currentVisits.filter(v => !v.id.startsWith('vis-') && !v.id.startsWith('vis-demo'))
  const nonDemoFeedback = currentFeedback.filter(f => !f.id.startsWith('fb-') && !f.id.startsWith('fb-demo'))

  localStorage.setItem('physio_patients_cache_v5', JSON.stringify(nonDemoPatients))
  localStorage.setItem('physio_visits_cache_v7', JSON.stringify(nonDemoVisits))
  localStorage.setItem('physio_feedback_cache_v6', JSON.stringify(nonDemoFeedback))
}

export async function resetToCleanSlate(): Promise<void> {
  localStorage.setItem('physio_patients_cache_v5', JSON.stringify([]))
  localStorage.setItem('physio_visits_cache_v7', JSON.stringify([]))
  localStorage.setItem('physio_feedback_cache_v6', JSON.stringify([]))
}

export async function exportFullDatabaseBackup() {
  const [patients, visits, feedback, centres, doctors, services] = await Promise.all([
    getPatients(),
    getVisits(),
    getPatientFeedback(),
    getCentres(),
    getDoctors(),
    getServices(),
  ])

  const wb = XLSX.utils.book_new()

  // Sheet 1: Patients
  const wsPatients = XLSX.utils.json_to_sheet(patients.map(p => ({
    'UID': p.uid,
    'Name': p.full_name,
    'Age': p.age,
    'Gender': p.gender,
    'Phone': p.phone,
    'Email': p.email || '',
    'Address': p.address || '',
    'Blood Group': p.blood_group || '',
    'Medical Notes': p.medical_notes || '',
    'Registered Date': p.created_at,
  })))
  XLSX.utils.book_append_sheet(wb, wsPatients, 'Patients')

  // Sheet 2: Billing Ledger
  const wsVisits = XLSX.utils.json_to_sheet(visits.map(v => ({
    'Bill Number': v.bill_number,
    'Date': v.visit_date,
    'Patient UID': v.patient_uid,
    'Patient Name': v.patient_name,
    'Phone': v.patient_phone,
    'Centre': v.centre_name,
    'Doctor': v.doctor_name ? `Dr. ${v.doctor_name}` : '',
    'Services Breakdown': v.items?.map(i => `${i.service_name} (x${i.quantity} @ ₹${i.price})`).join('; '),
    'Subtotal': v.subtotal,
    'Discount': v.discount,
    'Total Paid': v.total,
    'Payment Mode': v.payment_mode,
    'Notes': v.notes || '',
  })))
  XLSX.utils.book_append_sheet(wb, wsVisits, 'Billing_Ledger')

  // Sheet 3: Feedback
  const wsFeedback = XLSX.utils.json_to_sheet(feedback.map(f => ({
    'Patient Name': f.patient_name,
    'Patient UID': f.patient_uid,
    'Overall Rating (1-5)': f.rating,
    'Treatment Rating': f.treatment_rating,
    'Hygiene Rating': f.hygiene_rating,
    'Staff Rating': f.staff_rating,
    'Comments / Review': f.comments || '',
    'Doctor': f.doctor_name,
    'Centre': f.centre_name,
    'Date': f.created_at,
  })))
  XLSX.utils.book_append_sheet(wb, wsFeedback, 'Patient_Feedback')

  // Sheet 4: Centres
  const wsCentres = XLSX.utils.json_to_sheet(centres)
  XLSX.utils.book_append_sheet(wb, wsCentres, 'Centres')

  // Sheet 5: Doctors
  const wsDoctors = XLSX.utils.json_to_sheet(doctors)
  XLSX.utils.book_append_sheet(wb, wsDoctors, 'Doctors')

  // Sheet 6: Services
  const wsServices = XLSX.utils.json_to_sheet(services)
  XLSX.utils.book_append_sheet(wb, wsServices, 'Services')

  XLSX.writeFile(wb, `Physionautics_Complete_Backup_${new Date().toISOString().split('T')[0]}.xlsx`)
}