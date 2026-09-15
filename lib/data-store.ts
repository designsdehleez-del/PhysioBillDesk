import { createClient } from '@/lib/supabase/client'
import type { Centre, Doctor, Patient, Service, DiscountPreset } from '@/lib/supabase/types'
import * as XLSX from 'xlsx'

const DEFAULT_CENTRES: Centre[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    name: 'Downtown Clinic (Centre 1)',
    address: '101 Central Ave, Suite 4',
    phone: '+91 98765 43210',
    email: 'centre1@physionautics.com',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    name: 'Westside Rehab (Centre 2)',
    address: '45 West Park Blvd',
    phone: '+91 98765 43211',
    email: 'centre2@physionautics.com',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    name: 'East Care Centre (Centre 3)',
    address: '88 East Ring Road',
    phone: '+91 98765 43212',
    email: 'centre3@physionautics.com',
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

const DEFAULT_SERVICES: Service[] = [
  { id: 'svc-1', name: 'Consultation', price: 500, created_at: '', updated_at: '' },
  { id: 'svc-2', name: 'Physiotherapy Session (45 min)', price: 800, created_at: '', updated_at: '' },
  { id: 'svc-3', name: 'Dry Needling Therapy', price: 600, created_at: '', updated_at: '' },
  { id: 'svc-4', name: 'Cupping Therapy', price: 700, created_at: '', updated_at: '' },
  { id: 'svc-5', name: 'Spine Traction / Decompression', price: 900, created_at: '', updated_at: '' },
  { id: 'svc-6', name: 'Sports Injury Rehab', price: 1200, created_at: '', updated_at: '' },
  { id: 'svc-7', name: 'Post-Surgery Joint Mobilization', price: 1000, created_at: '', updated_at: '' },
  { id: 'svc-8', name: 'Follow-up Review', price: 300, created_at: '', updated_at: '' },
]

// ================= CENTRES =================
export async function getCentres(): Promise<Centre[]> {
  try {
    const supabase = createClient()
    const { data } = await supabase.from('centres').select('*').order('name')
    if (data && data.length > 0) {
      localStorage.setItem('physio_centres_cache', JSON.stringify(data))
      return data as unknown as Centre[]
    }
  } catch (_) {}

  const cached = localStorage.getItem('physio_centres_cache')
  if (cached) {
    try { return JSON.parse(cached) } catch (_) {}
  }
  localStorage.setItem('physio_centres_cache', JSON.stringify(DEFAULT_CENTRES))
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