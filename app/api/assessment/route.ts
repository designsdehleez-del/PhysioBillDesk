import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ClinicalAssessment } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const aid = searchParams.get('aid')
    const uid = searchParams.get('uid')
    const patientId = searchParams.get('patientId')
    const limit = Number(searchParams.get('limit')) || 100

    const supabase = createAdminClient()

    let query = supabase
      .from('audit_logs')
      .select('*')
      .eq('event_type', 'clinical_assessment')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (aid) {
      query = query.eq('resource_id', aid)
    } else if (uid) {
      query = query.eq('resource_name', uid)
    } else if (patientId) {
      query = query.or(`resource_name.eq.${patientId},details.ilike.%${patientId}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching clinical assessments from audit_logs:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const assessments: ClinicalAssessment[] = ((data as any[]) || [])
      .map(row => row.metadata as ClinicalAssessment)
      .filter(ass => ass && (ass.id || ass.assessment_date))

    return NextResponse.json({ success: true, data: assessments })
  } catch (err: any) {
    console.error('API assessment GET error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: Partial<ClinicalAssessment> = await request.json()
    if (!body || (!body.patient_uid && !body.patient_id)) {
      return NextResponse.json(
        { success: false, error: 'Patient identifier (uid or patient_id) is required' },
        { status: 400 }
      )
    }

    const assessmentId = body.id || `ass-${Date.now()}`
    const patientUid = body.patient_uid || 'CLN-PATIENT'
    const assessmentDate = body.assessment_date || new Date().toISOString().split('T')[0]

    const fullAssessment: ClinicalAssessment = {
      id: assessmentId,
      patient_id: body.patient_id || '',
      patient_uid: patientUid,
      type: body.type || 'physiotherapy',
      assessment_date: assessmentDate,
      doctor_id: body.doctor_id || null,
      doctor_name: body.doctor_name || null,
      vas_score: body.vas_score !== undefined && body.vas_score !== null ? Number(body.vas_score) : null,
      data: body.data || {},
      created_at: body.created_at || new Date().toISOString(),
    }

    const supabase = createAdminClient()

    const logRow = {
      id: `ass-log-${assessmentId}`,
      event_type: 'clinical_assessment',
      category: 'clinical',
      severity: 'info',
      actor_name: body.doctor_name || 'Dr. Clinical Specialist',
      actor_email: 'clinical@physionautics.com',
      actor_role: 'doctor',
      centre_name: (body as any).centre_name || 'New Friends Colony, New Delhi',
      resource_id: assessmentId,
      resource_name: patientUid,
      details: `Clinical assessment recorded for patient ${patientUid} on ${assessmentDate} (VAS: ${fullAssessment.vas_score ?? 'N/A'}/10)`,
      metadata: fullAssessment,
    }

    const { error: upsertErr } = await (supabase.from('audit_logs') as any)
      .upsert([logRow], { onConflict: 'id' })

    if (upsertErr) {
      console.error('Failed to persist assessment into audit_logs:', upsertErr)
      return NextResponse.json({ success: false, error: upsertErr.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: fullAssessment })
  } catch (err: any) {
    console.error('API assessment POST error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
