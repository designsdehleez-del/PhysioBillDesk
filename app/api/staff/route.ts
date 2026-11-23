import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const { data, error } = await (supabase.from('staff_users') as any)
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      const raw = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      console.error('Failed to fetch staff from Supabase:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        debug: {
          rawLength: raw.length,
          rawPrefix: raw.substring(0, 10),
          rawSuffix: raw.substring(Math.max(0, raw.length - 10)),
        }
      }, { status: 500 })
    }

    const mapped = (data || []).map((item: any) => ({
      ...item,
      role: item.role === 'centre_staff' ? 'clinic_reception' : item.role,
    }))

    return NextResponse.json({ success: true, staff: mapped })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, full_name, email, password, centre_id, centre_name, role, is_active } = body

    if (!email || !full_name) {
      return NextResponse.json({ success: false, error: 'Name and email are required.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const staffTable = supabase.from('staff_users') as any

    // Map role for database constraint (allows only 'centre_staff' or 'admin')
    const dbRole = role === 'admin' ? 'admin' : 'centre_staff'

    // Clean email / identifier
    const cleanEmail = email.trim().toLowerCase()

    const payload: Record<string, any> = {
      full_name: full_name.trim(),
      email: cleanEmail,
      centre_id: dbRole === 'admin' ? null : (centre_id || null),
      centre_name: dbRole === 'admin' ? null : (centre_name || null),
      role: dbRole,
      is_active: is_active !== false,
      updated_at: new Date().toISOString(),
    }

    if (password && password.trim()) {
      payload.password = password.trim()
    }

    let result: any
    if (id && id.length > 10 && !id.startsWith('temp-') && !id.startsWith('usr-')) {
      // Update existing UUID
      const { data, error } = await staffTable
        .update(payload)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        // Fallback: match by email
        const { data: emailMatch, error: emailError } = await staffTable
          .update(payload)
          .eq('email', cleanEmail)
          .select()
          .single()

        if (emailError) throw emailError
        result = emailMatch
      } else {
        result = data
      }
    } else {
      // Check if email already exists in staff_users
      const { data: existing } = await staffTable
        .select('id')
        .eq('email', cleanEmail)
        .maybeSingle()

      if (existing?.id) {
        const { data, error } = await staffTable
          .update(payload)
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        result = data
      } else {
        const newId = crypto.randomUUID()
        const { data, error } = await staffTable
          .insert({ ...payload, id: newId })
          .select()
          .single()

        if (error) throw error
        result = data
      }
    }

    const responseStaff = {
      ...result,
      role: result?.role === 'centre_staff' ? (role || 'clinic_reception') : result?.role,
    }

    return NextResponse.json({ success: true, staff: responseStaff })
  } catch (err: any) {
    console.error('Error saving staff user:', err)
    return NextResponse.json({ success: false, error: err.message || 'Failed to save staff login.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Staff ID is required.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await (supabase.from('staff_users') as any)
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
