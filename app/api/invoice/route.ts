import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { StoredVisit } from '@/lib/data-store'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bid = searchParams.get('bid')
    const uid = searchParams.get('uid')

    if (!bid && !uid) {
      return NextResponse.json({ success: false, error: 'Bill number (bid) or patient UID (uid) is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    let query = supabase
      .from('visits')
      .select('*, visit_services(*), patients(*)')
      .order('created_at', { ascending: false })

    if (bid) {
      query = query.eq('bill_number', bid)
    }

    const { data, error } = await query

    if (error) {
      console.error('API invoice error:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const records = (data as any[]) || []
    if (records.length === 0) {
      return NextResponse.json({ success: false, message: 'Invoice not found' }, { status: 404 })
    }

    // Match candidate
    let match = records[0]
    if (uid && !bid) {
      const byUid = records.find(v => v.patients?.uid === uid || v.patient_id === uid)
      if (byUid) match = byUid
    }

    const stored: StoredVisit = {
      id: match.id,
      bill_number: match.bill_number,
      patient_id: match.patient_id,
      patient_uid: match.patients?.uid || uid || 'CLN-PATIENT',
      patient_name: match.patients?.full_name || 'Valued Patient',
      patient_phone: match.patients?.phone || '',
      patient_age: match.patients?.age || undefined,
      patient_gender: match.patients?.gender || undefined,
      doctor_name: match.doctor_name || '',
      primary_doctor_name: match.primary_doctor_name || match.doctor_name || '',
      physiotherapist_name: match.physiotherapist_name || null,
      centre_name: match.centre_name || 'New Friends Colony, New Delhi',
      items: (match.visit_services || []).map((vs: any, idx: number) => ({
        id: vs.id || `item-${idx}`,
        service_id: vs.service_id || `svc-${idx}`,
        service_name: vs.service_name,
        price: Number(vs.price) || 0,
        quantity: Number(vs.quantity) || 1,
        total: (Number(vs.price) || 0) * (Number(vs.quantity) || 1),
      })),
      subtotal: Number(match.subtotal) || 0,
      discount: Number(match.discount) || 0,
      total: Number(match.total) || 0,
      payment_mode: match.payment_mode || 'UPI',
      payment_status: 'Paid',
      visit_date: match.visit_date,
      created_at: match.created_at,
      notes: (match as any).notes || '',
    }

    return NextResponse.json({ success: true, data: stored })
  } catch (err: any) {
    console.error('API invoice GET error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
