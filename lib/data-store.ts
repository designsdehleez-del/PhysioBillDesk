import { createClient } from '@/lib/supabase/client'
import type { Centre, Doctor, Patient, Service, DiscountPreset } from '@/lib/supabase/types'
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
  try {
    const supabase = createClient()
    const { data } = await supabase.from('centres').select('*').order('name')
    if (data && data.length > 0) {
      localStorage.setItem('physio_centres_cache_v2', JSON.stringify(data))
      return data as unknown as Centre[]
    }
  } catch (_) {}

  const cached = localStorage.getItem('physio_centres_cache_v2')
  if (cached) {
    try {
      const parsed: Centre[] = JSON.parse(cached)
      if (parsed.length > 0) return parsed
    } catch (_) {}
  }
  localStorage.setItem('physio_centres_cache_v2', JSON.stringify(DEFAULT_CENTRES))
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

  localStorage.setItem('physio_centres_cache', JSON.stringify(updated))

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
  let list: Doctor[] = DEFAULT_DOCTORS
  try {
    const supabase = createClient()
    let q = supabase.from('doctors').select('*').order('name')
    if (centreId && centreId !== 'all') q = q.eq('centre_id', centreId)
    const { data } = await q
    if (data && data.length > 0) {
      localStorage.setItem('physio_doctors_cache', JSON.stringify(data))
      return data as unknown as Doctor[]
    }
  } catch (_) {}

  const cached = localStorage.getItem('physio_doctors_cache')
  if (cached) {
    try { list = JSON.parse(cached) } catch (_) {}
  } else {
    localStorage.setItem('physio_doctors_cache', JSON.stringify(DEFAULT_DOCTORS))
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

  localStorage.setItem('physio_doctors_cache', JSON.stringify(updated))
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
  let list: Patient[] = []
  try {
    const supabase = createClient()
    let q = supabase.from('patients').select('*').order('created_at', { ascending: false })
    if (query?.trim()) {
      q = q.or(`uid.ilike.%${query}%,full_name.ilike.%${query}%,phone.ilike.%${query}%`)
    }
    const { data } = await q.limit(200)
    if (data && data.length > 0) {
      localStorage.setItem('physio_patients_cache', JSON.stringify(data))
      return data as unknown as Patient[]
    }
  } catch (_) {}

  const cached = localStorage.getItem('physio_patients_cache')
  if (cached) {
    try { list = JSON.parse(cached) } catch (_) {}
  }

  if (query?.trim()) {
    const lower = query.toLowerCase().trim()
    return list.filter(p => 
      p.full_name.toLowerCase().includes(lower) ||
      p.uid.toLowerCase().includes(lower) ||
      p.phone.includes(lower)
    )
  }
  return list
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
    bill_number: 'INV-202609-0001',
    patient_id: 'pat-1',
    patient_uid: 'CLN-202609-0001',
    patient_name: 'Rahul Verma',
    patient_phone: '+91 98765 11111',
    patient_age: 38,
    patient_gender: 'Male',
    patient_address: 'Flat 402, Green Meadows, New Delhi',
    doctor_id: 'doc-101',
    doctor_name: 'Dr. Sarah Jenkins',
    doctor_specialization: 'Orthopedic Physiotherapy',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    centre_name: 'New Friends Colony, New Delhi',
    centre_address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
    centre_phone: '08383936905',
    items: [
      { service_name: 'Consultation', price: 500, quantity: 1, total: 500 },
      { service_name: 'Physiotherapy Session (45 min)', price: 800, quantity: 1, total: 800 },
      { service_name: 'Dry Needling Therapy', price: 600, quantity: 1, total: 600 },
    ],
    subtotal: 1900,
    discount: 200,
    discount_preset_name: 'Privilege Member (₹200)',
    total: 1700,
    payment_mode: 'UPI',
    payment_status: 'Paid',
    notes: 'Lower lumbar mobilization session completed.',
    visit_date: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'vis-102',
    bill_number: 'INV-202609-0002',
    patient_id: 'pat-2',
    patient_uid: 'CLN-202609-0002',
    patient_name: 'Ananya Sharma',
    patient_phone: '+91 98765 22222',
    patient_age: 29,
    patient_gender: 'Female',
    patient_address: '12 Poorvi Marg, Vasant Vihar',
    doctor_id: 'doc-201',
    doctor_name: 'Dr. Emily Watson',
    doctor_specialization: 'Neuro Physiotherapy',
    centre_id: 'c2222222-2222-2222-2222-222222222222',
    centre_name: 'Vasant Vihar, New Delhi',
    centre_address: '86 Basement, Poorvi Marg, Indian Air Lines & Air India Estate, Vasant Vihar, New Delhi, Delhi 110057',
    centre_phone: '08700264533',
    items: [
      { service_name: 'Consultation', price: 500, quantity: 1, total: 500 },
      { service_name: 'Cupping Therapy', price: 700, quantity: 1, total: 700 },
    ],
    subtotal: 1200,
    discount: 120,
    discount_preset_name: 'Welcome 10% Discount',
    total: 1080,
    payment_mode: 'Card',
    payment_status: 'Paid',
    notes: 'Upper trapezius tension release.',
    visit_date: new Date().toISOString().split('T')[0],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
]

export async function getVisits(centreId?: string, query?: string): Promise<StoredVisit[]> {
  let list: StoredVisit[] = []
  try {
    const supabase = createClient()
    let q = supabase.from('visits').select('*, visit_services(*), patients(*)').order('created_at', { ascending: false })
    if (centreId && centreId !== 'all') {
      q = q.eq('centre_id', centreId)
    }
    const { data } = await q
    if (data && data.length > 0) {
      const mapped: StoredVisit[] = data.map((v: any) => ({
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

      localStorage.setItem('physio_visits_cache', JSON.stringify(mapped))
      return filterVisits(mapped, centreId, query)
    }
  } catch (_) {}

  const cached = localStorage.getItem('physio_visits_cache')
  if (cached) {
    try {
      list = JSON.parse(cached)
    } catch (_) {}
  } else {
    list = DEFAULT_VISITS
    localStorage.setItem('physio_visits_cache', JSON.stringify(DEFAULT_VISITS))
  }

  return filterVisits(list, centreId, query)
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

  const updated = [newVisit, ...current]
  localStorage.setItem('physio_visits_cache', JSON.stringify(updated))

  try {
    const supabase = createClient()
    const { data: vRecord, error } = await supabase.from('visits').insert({
      bill_number: newVisit.bill_number,
      patient_id: newVisit.patient_id,
      subtotal: newVisit.subtotal,
      discount: newVisit.discount,
      total: newVisit.total,
      payment_mode: newVisit.payment_mode === 'Bank Transfer' ? 'UPI' : newVisit.payment_mode,
      visit_date: newVisit.visit_date,
      centre_id: newVisit.centre_id,
      doctor_id: newVisit.doctor_id,
      doctor_name: newVisit.doctor_name,
      centre_name: newVisit.centre_name,
    }).select('id').single()

    if (vRecord && !error) {
      await supabase.from('visit_services').insert(
        newVisit.items.map(i => ({
          visit_id: vRecord.id,
          service_id: i.service_id || null,
          service_name: i.service_name,
          price: i.price,
          quantity: i.quantity,
        }))
      )
    }
  } catch (_) {}

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