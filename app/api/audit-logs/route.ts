import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get('limit')) || 200
    const category = searchParams.get('category')
    const severity = searchParams.get('severity')

    const supabase = createAdminClient()
    let query = supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (category) {
      query = query.eq('category', category)
    }
    if (severity) {
      query = query.eq('severity', severity)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch audit logs from Supabase:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (err: any) {
    console.error('API /api/audit-logs GET error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      timestamp,
      event_type,
      category,
      severity,
      actor_name,
      actor_email,
      actor_role,
      centre_name,
      resource_id,
      resource_name,
      details,
      metadata,
    } = body

    if (!details || !actor_email) {
      return NextResponse.json({ success: false, error: 'Details and actor_email are required.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const table = supabase.from('audit_logs') as any

    const payload = {
      id: id || `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: timestamp || new Date().toISOString(),
      event_type: event_type || 'SYSTEM_EVENT',
      category: category || 'SYSTEM',
      severity: severity || 'INFO',
      actor_name: actor_name || 'System Actor',
      actor_email: actor_email,
      actor_role: actor_role || 'staff',
      centre_name: centre_name || null,
      resource_id: resource_id || null,
      resource_name: resource_name || null,
      details: details,
      metadata: metadata || null,
    }

    const { data, error } = await table.insert([payload]).select().single()

    if (error) {
      console.error('Failed to log audit event to Supabase:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    console.error('API /api/audit-logs POST error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
