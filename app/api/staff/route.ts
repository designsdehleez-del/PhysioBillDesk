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
      console.error('Failed to fetch staff from Supabase:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    const mapped = (data || []).map((item: any) => ({
      ...item,
      role: item.role === 'centre_staff' ? 'clinic_reception' : item.role,
    }))

    return NextResponse.json({
      success: true,
      staff: mapped,
    })
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

    // Clean email / identifier
    const cleanEmail = email.trim().toLowerCase()

    // Map role for database constraint (allows only 'centre_staff' or 'admin')
    const dbRole = role === 'admin' ? 'admin' : 'centre_staff'

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

    let savedRecord: any = null

    // 1. Check if record exists by UUID or Email
    let existingId: string | null = null
    const isUUID = id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

    if (isUUID) {
      const { data: byId } = await staffTable
        .select('*')
        .eq('id', id)
      if (byId && byId.length > 0) {
        existingId = byId[0].id
      }
    }

    if (!existingId) {
      const { data: byEmail } = await staffTable
        .select('*')
        .eq('email', cleanEmail)
      if (byEmail && byEmail.length > 0) {
        existingId = byEmail[0].id
      }
    }

    // Also check branch keyword aliases
    if (!existingId) {
      if (cleanEmail.includes('guru') || cleanEmail.includes('ggn') || cleanEmail.includes('dlf')) {
        const { data: ggnMatch } = await staffTable
          .select('*')
          .or('email.ilike.%ggn%,email.ilike.%guru%')
        if (ggnMatch && ggnMatch.length > 0) existingId = ggnMatch[0].id
      } else if (cleanEmail.includes('vasant') || cleanEmail.includes('vv')) {
        const { data: vvMatch } = await staffTable
          .select('*')
          .or('email.ilike.%vv%,email.ilike.%vasant%')
        if (vvMatch && vvMatch.length > 0) existingId = vvMatch[0].id
      } else if (cleanEmail.includes('nfc') || cleanEmail.includes('friends')) {
        const { data: nfcMatch } = await staffTable
          .select('*')
          .or('email.ilike.%nfc%,email.ilike.%friends%')
        if (nfcMatch && nfcMatch.length > 0) existingId = nfcMatch[0].id
      }
    }

    if (existingId) {
      // Update without .single()
      const { data: updateData, error: updateError } = await staffTable
        .update(payload)
        .eq('id', existingId)
        .select()

      if (updateError) {
        console.error('Update staff error:', updateError)
        throw updateError
      }
      savedRecord = updateData && updateData.length > 0 ? updateData[0] : { ...payload, id: existingId }
    } else {
      // Insert without .single()
      const newId = isUUID ? id : crypto.randomUUID()
      const { data: insertData, error: insertError } = await staffTable
        .insert({ ...payload, id: newId })
        .select()

      if (insertError) {
        console.error('Insert staff error:', insertError)
        throw insertError
      }
      savedRecord = insertData && insertData.length > 0 ? insertData[0] : { ...payload, id: newId }
    }

    const responseStaff = {
      ...savedRecord,
      role: savedRecord?.role === 'centre_staff' ? (role || 'clinic_reception') : savedRecord?.role,
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
    const staffTable = supabase.from('staff_users') as any

    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
      await staffTable.delete().eq('id', id)
    } else {
      await staffTable.delete().eq('email', id.toLowerCase())
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
