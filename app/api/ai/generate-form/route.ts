import { NextResponse } from 'next/server'
import { generateFeedbackFormWithAI } from '@/lib/ai-form-builder'
import { checkRateLimit } from '@/lib/rate-limiter'

export async function POST(req: Request) {
  try {
    // 1. Identify client IP for rate limiting
    const clientIp = 
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
      req.headers.get('x-real-ip') || 
      '127.0.0.1'

    // 2. Enforce Rate Limiting (Max 10 AI generation calls per 60 seconds per IP)
    const rateLimit = checkRateLimit(clientIp, 10, 60)
    if (!rateLimit.success) {
      return NextResponse.json(
        { 
          error: 'AI request limit reached. Please wait before generating another form.',
          retryAfter: rateLimit.retryAfterSeconds 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds || 60),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetTimeMs),
          }
        }
      )
    }

    // 3. Parse and sanitize input
    const body = await req.json().catch(() => ({}))
    const rawPrompt = body?.prompt

    if (!rawPrompt || typeof rawPrompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required and must be text.' }, { status: 400 })
    }

    const cleanPrompt = rawPrompt
      .replace(/[<>]/g, '') // Strip HTML tags
      .trim()

    if (cleanPrompt.length < 3) {
      return NextResponse.json({ error: 'Prompt must be at least 3 characters long.' }, { status: 400 })
    }

    if (cleanPrompt.length > 1000) {
      return NextResponse.json({ error: 'Prompt cannot exceed 1,000 characters.' }, { status: 400 })
    }

    // 4. Synthesize AI form with domain-aware fallback
    const template = await generateFeedbackFormWithAI({ prompt: cleanPrompt })

    return NextResponse.json(
      { success: true, template },
      {
        headers: {
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetTimeMs),
        }
      }
    )
  } catch (err: any) {
    console.error('AI generate-form error:', err)
    return NextResponse.json({ error: err?.message || 'Failed to generate form' }, { status: 500 })
  }
}
