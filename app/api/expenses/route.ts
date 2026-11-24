import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ClinicExpense } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const centreId = searchParams.get('centreId')
    const limit = Number(searchParams.get('limit')) || 200

    const supabase = createAdminClient()
    let query = supabase
      .from('clinic_expenses')
      .select('*')
      .order('expense_date', { ascending: false })
      .limit(limit)

    if (centreId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(centreId)) {
      query = query.eq('centre_id', centreId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch expenses from Supabase:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || [] })
  } catch (err: any) {
    console.error('API /api/expenses GET error:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      expense_date,
      category,
      description,
      amount,
      centre_id,
      centre_name,
      logged_by_name,
      payment_method,
      receipt_url,
    } = body

    if (!description || !amount) {
      return NextResponse.json({ success: false, error: 'Description and amount are required.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const table = supabase.from('clinic_expenses') as any

    const isCentreUuid = centre_id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(centre_id)
    const finalId = id || `exp-${Date.now()}`

    const payload = {
      id: finalId,
      expense_date: expense_date || new Date().toISOString().split('T')[0],
      category: category || 'Other',
      description: description.trim(),
      amount: Number(amount) || 0,
      centre_id: isCentreUuid ? centre_id : null,
      centre_name: centre_name || null,
      logged_by_name: logged_by_name || null,
      payment_method: payment_method || 'UPI',
      receipt_url: receipt_url || null,
    }

    // Check if exists
    const { data: existing } = await table.select('id').eq('id', finalId).limit(1)
    let saved: any = null

    if (existing && existing.length > 0) {
      const { data: updateData, error: updateErr } = await table
        .update(payload)
        .eq('id', finalId)
        .select()

      if (updateErr) throw updateErr
      saved = updateData && updateData.length > 0 ? updateData[0] : payload
    } else {
      const { data: insertData, error: insertErr } = await table
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        .select()

      if (insertErr) throw insertErr
      saved = insertData && insertData.length > 0 ? insertData[0] : payload
    }

    return NextResponse.json({ success: true, expense: saved })
  } catch (err: any) {
    console.error('API /api/expenses POST error:', err)
    return NextResponse.json({ success: false, error: err.message || 'Failed to save expense in Supabase.' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'Expense ID is required.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { error } = await supabase.from('clinic_expenses').delete().eq('id', id)

    if (error) {
      console.error('Failed to delete expense:', error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, id })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
