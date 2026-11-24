import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Patient } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = Number(searchParams.get('limit')) || 300

    const supabase = createAdminClient()
    let dbQuery = supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (query.trim()) {
      const q = query.trim()
      dbQuery = dbQuery.or(`full_name.ilike.%${q}%,uid.ilike.%${q}%,phone.ilike.%${q}%`)
    }

    const { data, error } = await dbQuery

    if (error) {
      console.error('Failed to fetch patients from Supabase:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    })
  } catch (err: any) {
    console.error('API /api/patients GET error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      uid,
      full_name,
      age,
      gender,
      phone,
      email,
      address,
      blood_group,
      medical_notes,
      primary_doctor_id,
      physiotherapist_id,
    } = body

    if (!full_name || !phone) {
      return NextResponse.json(
        { success: false, error: 'Patient full name and phone number are required.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const patientTable = supabase.from('patients') as any

    // 1. Generate or resolve unique clinical UID if not provided
    let finalUid = uid
    if (!finalUid) {
      try {
        const { data: generated } = await supabase.rpc('generate_patient_uid')
        if (generated) finalUid = generated
      } catch (_) {}
    }
    if (!finalUid) {
      const now = new Date()
      const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`
      const rand = Math.floor(1000 + Math.random() * 9000)
      finalUid = `CLN-${yyyymm}-${rand}`
    }

    // 2. Check if patient already exists by UID, phone, or id (UUID)
    let existingRecord: any = null
    const isIdUuid = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    if (isIdUuid) {
      const { data: byId } = await patientTable.select('*').eq('id', id).limit(1)
      if (byId && byId.length > 0) existingRecord = byId[0]
    }

    if (!existingRecord && finalUid) {
      const { data: byUid } = await patientTable.select('*').eq('uid', finalUid).limit(1)
      if (byUid && byUid.length > 0) existingRecord = byUid[0]
    }

    // Check doctor/physio UUID validity
    const isDocUuid = primary_doctor_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(primary_doctor_id)
    const isPhysioUuid = physiotherapist_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(physiotherapist_id)

    const payload: Record<string, any> = {
      uid: finalUid,
      full_name: full_name.trim(),
      age: Number(age) || 0,
      gender: gender || 'Other',
      phone: phone.trim(),
      email: email ? email.trim() : null,
      address: address ? address.trim() : null,
      blood_group: blood_group || null,
      medical_notes: medical_notes ? medical_notes.trim() : null,
      primary_doctor_id: isDocUuid ? primary_doctor_id : null,
      physiotherapist_id: isPhysioUuid ? physiotherapist_id : null,
      updated_at: new Date().toISOString(),
    }

    let savedPatient: any = null

    if (existingRecord) {
      const { data: updateData, error: updateErr } = await patientTable
        .update(payload)
        .eq('id', existingRecord.id)
        .select()

      if (updateErr) {
        console.error('Failed to update patient in Supabase:', updateErr)
        throw updateErr
      }
      savedPatient = updateData && updateData.length > 0 ? updateData[0] : { ...existingRecord, ...payload }
    } else {
      const newId = isIdUuid ? id : crypto.randomUUID()
      const { data: insertData, error: insertErr } = await patientTable
        .insert({
          ...payload,
          id: newId,
          created_at: new Date().toISOString(),
        })
        .select()

      if (insertErr) {
        console.error('Failed to insert patient in Supabase:', insertErr)
        throw insertErr
      }
      savedPatient = insertData && insertData.length > 0 ? insertData[0] : { ...payload, id: newId }
    }

    return NextResponse.json({
      success: true,
      patient: savedPatient,
    })
  } catch (err: any) {
    console.error('API /api/patients POST error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Failed to save patient in Supabase.' }, { status: 500 })
  }
}
