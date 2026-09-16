import type { FormField, FeedbackFormTemplate } from '@/lib/supabase/types'

export interface AIGenerateFormRequest {
  prompt: string
  targetSpecialty?: string
  numQuestions?: number
  includeDoctorMetrics?: boolean
  includePainScale?: boolean
}

// Preset intelligent domain templates for fast instant AI generation
const PRESET_TOPICS: Record<string, FormField[]> = {
  orthopedic: [
    {
      id: 'f-ortho-doc',
      type: 'star_rating',
      title: 'Doctor Joint Examination & Biomechanical Clarity',
      description: 'Did the orthopedic physiotherapist clearly explain your joint alignment and therapy plan?',
      required: true,
      category: 'doctor',
    },
    {
      id: 'f-ortho-pain',
      type: 'linear_scale',
      title: 'Post-Therapy Joint Pain & Stiffness Relief (1-10)',
      description: '1 = Minimal change, 10 = Substantial pain reduction and joint lightness.',
      required: true,
      min_scale: 1,
      max_scale: 10,
      min_label: '1 (High Stiffness)',
      max_label: '10 (Fluid Joint Motion)',
      category: 'treatment',
    },
    {
      id: 'f-ortho-modalities',
      type: 'checkbox',
      title: 'Therapy modalities that provided the most noticeable relief:',
      required: false,
      options: ['Joint Mobilization & Manual Glides', 'Class 4 Laser Therapy', 'Dry Needling / Cupping', 'Mechanical Spine Traction', 'Therapeutic Exercise'],
      category: 'treatment',
    },
    {
      id: 'f-ortho-home',
      type: 'multiple_choice',
      title: 'Were you given clear home exercise & posture guidelines?',
      required: true,
      options: ['Yes, demonstrated thoroughly with reps/sets', 'Yes, explained verbally', 'No home guidance provided'],
      category: 'doctor',
    },
    {
      id: 'f-ortho-nps',
      type: 'nps',
      title: 'How likely are you to recommend our Ortho team to others?',
      required: true,
      min_scale: 0,
      max_scale: 10,
      category: 'general',
    },
  ],
  sports: [
    {
      id: 'f-sports-doc',
      type: 'star_rating',
      title: 'Sports Physio Assessment & Athletic Functional Testing',
      description: 'Doctor understanding of your sport-specific injury and return-to-play goals.',
      required: true,
      category: 'doctor',
    },
    {
      id: 'f-sports-strength',
      type: 'linear_scale',
      title: 'Functional Stability & Strength Confidence (1-10)',
      required: true,
      min_scale: 1,
      max_scale: 10,
      min_label: '1 (Hesitant / Weak)',
      max_label: '10 (Ready & Empowered)',
      category: 'treatment',
    },
    {
      id: 'f-sports-milestones',
      type: 'checkbox',
      title: 'Sports recovery milestones improved during today’s session:',
      required: false,
      options: ['Agility & Cutting drills', 'Explosive Loading & Jumps', 'Sprint Acceleration & Deceleration', 'Muscular Endurance', 'Flexibility & Kinetic Chain Balance'],
      category: 'treatment',
    },
    {
      id: 'f-sports-remarks',
      type: 'textarea',
      title: 'Feedback for Your Sports Physiotherapist',
      required: false,
      category: 'doctor',
    },
  ],
  neuro: [
    {
      id: 'f-neuro-patience',
      type: 'star_rating',
      title: 'Doctor Patience, Empathy & Neurological Guidance',
      description: 'Care, attention to gait safety, and balance encouragement.',
      required: true,
      category: 'doctor',
    },
    {
      id: 'f-neuro-balance',
      type: 'linear_scale',
      title: 'Balance & Motor Coordination Confidence (1-10)',
      required: true,
      min_scale: 1,
      max_scale: 10,
      min_label: '1 (Unsteady)',
      max_label: '10 (Very Stable)',
      category: 'treatment',
    },
    {
      id: 'f-neuro-fatigue',
      type: 'multiple_choice',
      title: 'How was your fatigue level managed during rehabilitation?',
      required: true,
      options: ['Perfect balance of challenge & rest intervals', 'A bit too exhausting', 'Too easy / Wanted more intensity'],
      category: 'treatment',
    },
  ],
  clinic_hygiene: [
    {
      id: 'f-gen-doc-care',
      type: 'star_rating',
      title: 'Doctor Professionalism & Treatment Attention',
      required: true,
      category: 'doctor',
    },
    {
      id: 'f-gen-hygiene',
      type: 'star_rating',
      title: 'Clinic Cleanliness, Linen Freshness & Sanitation',
      required: true,
      category: 'facility',
    },
    {
      id: 'f-gen-frontdesk',
      type: 'star_rating',
      title: 'Front-Desk Billing, Greeting & Reception Speed',
      required: true,
      category: 'general',
    },
    {
      id: 'f-gen-nps',
      type: 'nps',
      title: 'Overall Physionautics Net Promoter Score (NPS)',
      required: true,
      min_scale: 0,
      max_scale: 10,
      category: 'general',
    },
    {
      id: 'f-gen-comments',
      type: 'textarea',
      title: 'Additional Comments or Doctor Commendations',
      required: false,
      category: 'general',
    },
  ]
}

export async function generateFeedbackFormWithAI(req: AIGenerateFormRequest): Promise<Partial<FeedbackFormTemplate>> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY

  if (apiKey) {
    try {
      const systemInstruction = `You are a clinical physiotherapy feedback form architect for PhysioNautics. 
Given a doctor's prompt or clinical goal, generate a structured feedback form JSON.
Return ONLY valid JSON matching this exact structure:
{
  "title": "Short title",
  "description": "Brief description for patient",
  "accent_color": "#0d9488",
  "fields": [
    {
      "id": "unique-string",
      "type": "star_rating | linear_scale | multiple_choice | checkbox | textarea | nps",
      "title": "Question text",
      "description": "Optional subtext",
      "required": true,
      "category": "doctor | treatment | facility | general",
      "options": ["Option 1", "Option 2"],
      "min_scale": 1,
      "max_scale": 10,
      "min_label": "Low",
      "max_label": "High"
    }
  ]
}`

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemInstruction}\n\nUser Request: ${req.prompt}` }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
          },
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          const parsed = JSON.parse(text)
          if (parsed && Array.isArray(parsed.fields) && parsed.fields.length > 0) {
            return {
              title: parsed.title || 'AI Clinical Patient Experience Form',
              description: parsed.description || `Generated AI survey aligned with: "${req.prompt}"`,
              is_active: false,
              show_doctor_badge: true,
              show_invoice_badge: true,
              show_centre_badge: true,
              show_procedures_badge: true,
              accent_color: parsed.accent_color || '#0d9488',
              fields: parsed.fields,
            }
          }
        }
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out, using fallback heuristics:', err)
    }
  }

  // Fallback intelligent domain template engine
  const promptLower = req.prompt.toLowerCase()
  
  let selectedCategory: 'orthopedic' | 'sports' | 'neuro' | 'clinic_hygiene' = 'clinic_hygiene'
  if (promptLower.includes('sport') || promptLower.includes('athlete') || promptLower.includes('acl') || promptLower.includes('runner')) {
    selectedCategory = 'sports'
  } else if (promptLower.includes('ortho') || promptLower.includes('spine') || promptLower.includes('knee') || promptLower.includes('joint') || promptLower.includes('back') || promptLower.includes('surgery') || promptLower.includes('post-op')) {
    selectedCategory = 'orthopedic'
  } else if (promptLower.includes('neuro') || promptLower.includes('stroke') || promptLower.includes('paralysis') || promptLower.includes('parkinson') || promptLower.includes('balance')) {
    selectedCategory = 'neuro'
  }

  const baseFields = PRESET_TOPICS[selectedCategory] || PRESET_TOPICS.clinic_hygiene

  // Custom synthesized fields based on user keywords
  const dynamicFields: FormField[] = [...baseFields]

  if (promptLower.includes('wait') || promptLower.includes('time') || promptLower.includes('punctual')) {
    dynamicFields.push({
      id: 'f-dyn-wait',
      type: 'multiple_choice',
      title: 'Doctor Punctuality & Consultation Start Time',
      required: false,
      options: ['Seen immediately on schedule', 'Waited under 10 mins', 'Waited 10-25 mins', 'Significant delay'],
      category: 'facility',
    })
  }

  if (promptLower.includes('price') || promptLower.includes('cost') || promptLower.includes('billing') || promptLower.includes('package')) {
    dynamicFields.push({
      id: 'f-dyn-value',
      type: 'star_rating',
      title: 'Value for Money & Package Transparent Pricing',
      required: true,
      category: 'general',
    })
  }

  if (promptLower.includes('laser') || promptLower.includes('modality') || promptLower.includes('machine')) {
    dynamicFields.push({
      id: 'f-dyn-modality',
      type: 'linear_scale',
      title: 'Electrotherapy / Laser Modality Comfort (1-10)',
      required: false,
      min_scale: 1,
      max_scale: 10,
      min_label: '1 (Uncomfortable)',
      max_label: '10 (Soothing & Effective)',
      category: 'treatment',
    })
  }

  const titleWords = req.prompt.split(' ').slice(0, 7).join(' ')
  const cleanTitle = titleWords.length > 5 ? `${titleWords.charAt(0).toUpperCase() + titleWords.slice(1)}` : 'AI Clinical Patient Experience Form'

  return {
    title: cleanTitle,
    description: `Generated AI survey aligned with your clinical prompt: "${req.prompt}". Attributed directly to invoice and treating doctor.`,
    is_active: false,
    show_doctor_badge: true,
    show_invoice_badge: true,
    show_centre_badge: true,
    show_procedures_badge: true,
    accent_color: selectedCategory === 'sports' ? '#2563eb' : selectedCategory === 'orthopedic' ? '#0d9488' : '#7c3aed',
    fields: dynamicFields,
  }
}


