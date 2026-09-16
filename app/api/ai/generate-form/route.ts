import { NextResponse } from 'next/server'
import { generateFeedbackFormWithAI } from '@/lib/ai-form-builder'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { prompt } = body
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const template = await generateFeedbackFormWithAI({ prompt })
    return NextResponse.json({ success: true, template })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Failed to generate form' }, { status: 500 })
  }
}
