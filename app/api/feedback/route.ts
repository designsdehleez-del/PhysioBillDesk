import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('patient_feedback')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching feedback from Supabase:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (err: any) {
    console.error('API feedback GET error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!body || !body.patient_name) {
      return NextResponse.json({ success: false, error: 'Patient name is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    let commentsText = body.comments || null
    if (!commentsText && body.custom_answers) {
      try {
        commentsText = JSON.stringify(body.custom_answers)
      } catch (_) {}
    }

    const payload = {
      bill_number: body.bill_number || null,
      patient_uid: body.patient_uid || null,
      patient_name: body.patient_name.trim(),
      patient_phone: body.patient_phone || null,
      doctor_name: body.doctor_name || null,
      centre_name: body.centre_name || 'New Friends Colony, New Delhi',
      rating: Number(body.rating) || 5,
      hygiene_rating: body.hygiene_rating ? Number(body.hygiene_rating) : 5,
      treatment_rating: body.treatment_rating ? Number(body.treatment_rating) : 5,
      staff_rating: body.staff_rating ? Number(body.staff_rating) : 5,
      comments: commentsText,
    }

    const { data, error } = await (supabase.from('patient_feedback') as any)
      .insert([payload])
      .select()

    if (error) {
      console.error('Error inserting feedback via Supabase admin:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data?.[0] }, { status: 201 })
  } catch (err: any) {
    console.error('API feedback POST error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
