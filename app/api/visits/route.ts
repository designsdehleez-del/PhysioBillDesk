import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { StoredVisit } from '@/lib/data-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const centreId = searchParams.get('centreId')
    const limit = Number(searchParams.get('limit')) || 200

    const supabase = createAdminClient()
    let query = supabase
      .from('visits')
      .select('*, visit_services(*), patients(*)')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (centreId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(centreId)) {
      query = query.eq('centre_id', centreId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch visits from Supabase:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const visits: StoredVisit[] = (data || []).map((row: any) => {
      const patient = row.patients || {}
      return {
        id: row.id,
        bill_number: row.bill_number,
        patient_id: row.patient_id,
        patient_uid: patient.uid || 'CLN-PATIENT',
        patient_name: patient.full_name || 'Valued Patient',
        patient_phone: patient.phone || '',
        patient_age: patient.age || undefined,
        patient_gender: patient.gender || undefined,
        patient_address: patient.address || undefined,
        doctor_id: row.doctor_id,
        doctor_name: row.doctor_name,
        primary_doctor_name: row.doctor_name,
        centre_id: row.centre_id,
        centre_name: row.centre_name || 'New Friends Colony, New Delhi',
        items: (row.visit_services || []).map((vs: any, idx: number) => ({
          id: vs.id || `item-${idx}`,
          service_id: vs.service_id || `svc-${idx}`,
          service_name: vs.service_name,
          price: Number(vs.price) || 0,
          quantity: Number(vs.quantity) || 1,
          total: (Number(vs.price) || 0) * (Number(vs.quantity) || 1),
        })),
        subtotal: Number(row.subtotal) || 0,
        discount: Number(row.discount) || 0,
        total: Number(row.total) || 0,
        payment_mode: row.payment_mode || 'UPI',
        payment_status: 'Paid',
        visit_date: row.visit_date,
        created_at: row.created_at,
      }
    })

    return NextResponse.json({ success: true, data: visits })
  } catch (err: any) {
    console.error('API /api/visits GET error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      patient,
      patient_id,
      patient_uid,
      bill_number,
      items,
      subtotal,
      discount,
      total,
      payment_mode,
      paymentMode,
      visit_date,
      centre_id,
      centre_name,
      doctor_id,
      doctor_name,
      notes,
    } = body

    const supabase = createAdminClient()
    const patientTable = supabase.from('patients') as any
    const visitTable = supabase.from('visits') as any
    const vsTable = supabase.from('visit_services') as any

    // 1. Resolve Patient UUID in Supabase
    let finalPatientId = patient_id || patient?.id
    const isPatientUuid = finalPatientId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(finalPatientId)

    if (!isPatientUuid) {
      // Look up by UID or phone in patients table
      const pUid = patient_uid || patient?.uid
      const pPhone = patient?.phone
      if (pUid) {
        const { data: pByUid } = await patientTable.select('id').eq('uid', pUid).limit(1)
        if (pByUid && pByUid.length > 0) finalPatientId = pByUid[0].id
      }
      if (!finalPatientId && pPhone) {
        const { data: pByPhone } = await patientTable.select('id').eq('phone', pPhone).limit(1)
        if (pByPhone && pByPhone.length > 0) finalPatientId = pByPhone[0].id
      }

      // If still not found, create the patient record in Supabase
      if (!finalPatientId && patient?.full_name) {
        const newPatientId = crypto.randomUUID()
        const { data: insertedP } = await patientTable.insert({
          id: newPatientId,
          uid: pUid || `CLN-${Date.now().toString().slice(-6)}`,
          full_name: patient.full_name,
          age: Number(patient.age) || 0,
          gender: patient.gender || 'Other',
          phone: patient.phone || '9999999999',
          email: patient.email || null,
          address: patient.address || null,
        }).select('id').single()

        if (insertedP) finalPatientId = insertedP.id
      }
    }

    if (!finalPatientId) {
      return NextResponse.json({ success: false, error: 'Could not resolve or create valid patient for visit.' }, { status: 400 })
    }

    // 2. Prepare Visit record
    const visitId = crypto.randomUUID()
    const now = new Date()
    const finalBillNumber = bill_number || `INV-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`
    const isDocUuid = doctor_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(doctor_id)
    const isCentreUuid = centre_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(centre_id)

    const visitPayload = {
      id: visitId,
      bill_number: finalBillNumber,
      patient_id: finalPatientId,
      subtotal: Number(subtotal) || 0,
      discount: Number(discount) || 0,
      total: Number(total) || 0,
      payment_mode: payment_mode || paymentMode || 'UPI',
      visit_date: visit_date || now.toISOString().split('T')[0],
      centre_id: isCentreUuid ? centre_id : null,
      centre_name: centre_name || null,
      doctor_id: isDocUuid ? doctor_id : null,
      doctor_name: doctor_name || null,
      created_at: now.toISOString(),
    }

    const { data: insertedVisit, error: vErr } = await visitTable
      .insert(visitPayload)
      .select()

    if (vErr) {
      console.error('Failed to insert visit in Supabase:', vErr)
      return NextResponse.json({ success: false, error: vErr.message }, { status: 500 })
    }

    // 3. Insert line items into visit_services
    if (items && Array.isArray(items) && items.length > 0) {
      const lineItems = items.map((it: any) => {
        const isSvcUuid = it.service_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(it.service_id)
        return {
          id: crypto.randomUUID(),
          visit_id: visitId,
          service_id: isSvcUuid ? it.service_id : null,
          service_name: it.service_name || it.name || 'Clinical Service',
          price: Number(it.price) || 0,
          quantity: Number(it.quantity || it.qty) || 1,
          created_at: now.toISOString(),
        }
      })

      const { error: vsErr } = await vsTable.insert(lineItems)
      if (vsErr) {
        console.warn('Warning: Some visit_services could not be inserted:', vsErr.message)
      }
    }

    return NextResponse.json({
      success: true,
      visit: {
        ...visitPayload,
        items,
      },
    })
  } catch (err: any) {
    console.error('API /api/visits POST error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Failed to save visit in Supabase.' }, { status: 500 })
  }
}
