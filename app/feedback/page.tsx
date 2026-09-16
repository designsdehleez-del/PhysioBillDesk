'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Star,
  Stethoscope,
  Heart,
  CheckCircle2,
  Building2,
  Receipt,
  FileText,
  User,
  Send,
  Sparkles,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { savePatientFeedback, getActiveFeedbackTemplate } from '@/lib/data-store'
import { useClinicBranding } from '@/lib/settings-store'
import type { FeedbackFormTemplate, FormField } from '@/lib/supabase/types'

function FeedbackFormContent() {
  const { branding } = useClinicBranding()
  const searchParams = useSearchParams()
  const billNumber = searchParams.get('bid') || ''
  const patientUid = searchParams.get('uid') || ''
  const patientNameParam = searchParams.get('name') || ''
  const patientPhoneParam = searchParams.get('phone') || ''
  const doctorNameParam = searchParams.get('doc') || ''
  const centreNameParam = searchParams.get('centre') || ''
  const servicesParam = searchParams.get('services') || ''

  const [template, setTemplate] = useState<FeedbackFormTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [patientName, setPatientName] = useState(patientNameParam)
  const [formAnswers, setFormAnswers] = useState<Record<string, any>>({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (patientNameParam) setPatientName(patientNameParam)
  }, [patientNameParam])

  useEffect(() => {
    async function loadTemplate() {
      try {
        const tmpl = await getActiveFeedbackTemplate()
        setTemplate(tmpl)
        // Initialize default answers
        const initial: Record<string, any> = {}
        tmpl.fields.forEach(f => {
          if (f.type === 'star_rating') initial[f.id] = 5
          else if (f.type === 'linear_scale') initial[f.id] = f.max_scale ? Math.round(f.max_scale / 2) : 8
          else if (f.type === 'checkbox') initial[f.id] = []
          else if (f.type === 'nps') initial[f.id] = 10
          else initial[f.id] = ''
        })
        setFormAnswers(initial)
      } catch (err) {
        console.error('Error loading template:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTemplate()
  }, [])

  const handleAnswerChange = (fieldId: string, value: any) => {
    setFormAnswers(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleCheckboxToggle = (fieldId: string, option: string) => {
    setFormAnswers(prev => {
      const current: string[] = Array.isArray(prev[fieldId]) ? prev[fieldId] : []
      const updated = current.includes(option)
        ? current.filter(item => item !== option)
        : [...current, option]
      return { ...prev, [fieldId]: updated }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientName.trim()) return

    setSubmitting(true)
    try {
      // Compute core ratings if available in answers
      let overallRating = 5
      let hygieneRating = 5
      let treatmentRating = 5
      let staffRating = 5
      let remarksText = ''

      if (template) {
        template.fields.forEach(f => {
          const ans = formAnswers[f.id]
          if (f.category === 'doctor' && f.type === 'star_rating' && typeof ans === 'number') overallRating = ans
          if (f.category === 'facility' && f.type === 'star_rating' && typeof ans === 'number') hygieneRating = ans
          if (f.category === 'treatment' && f.type === 'star_rating' && typeof ans === 'number') treatmentRating = ans
          if (f.category === 'general' && f.type === 'star_rating' && typeof ans === 'number') staffRating = ans
          if (f.type === 'textarea' && typeof ans === 'string') remarksText = ans
        })
      }

      await savePatientFeedback({
        bill_number: billNumber || undefined,
        patient_uid: patientUid || undefined,
        patient_name: patientName.trim(),
        patient_phone: patientPhoneParam || undefined,
        doctor_name: doctorNameParam || undefined,
        centre_name: centreNameParam || 'New Friends Colony, New Delhi',
        services_rendered: servicesParam || undefined,
        rating: overallRating,
        treatment_rating: treatmentRating,
        hygiene_rating: hygieneRating,
        staff_rating: staffRating,
        comments: remarksText || undefined,
        custom_answers: formAnswers,
      })
      setSubmitted(true)
    } catch (err) {
      console.error('Error submitting feedback:', err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-lg shadow-xl border-gray-200 bg-white text-center p-8">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-700">Loading Clinical Feedback Form...</p>
        </div>
      </Card>
    )
  }

  if (submitted) {
    return (
      <Card className="w-full max-w-lg shadow-2xl border-emerald-200 bg-white text-center">
        <CardContent className="p-8 space-y-5">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <Badge className="bg-emerald-600 text-white font-semibold">Feedback Received!</Badge>
            <h1 className="text-2xl font-extrabold text-gray-900">Thank You, {patientName}!</h1>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Your feedback has been credited directly to your treating doctor and clinical care team.
            </p>
          </div>

          <div className="bg-teal-50/80 rounded-2xl p-4 border border-teal-100 text-xs text-left space-y-1.5">
            <p className="font-bold text-teal-950 flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-teal-700" />
              {branding.clinicName || 'Physionautics Physical Therapy'}
            </p>
            {doctorNameParam && (
              <p className="text-gray-800">
                <span className="font-semibold text-teal-900">Treating Doctor:</span> Dr. {doctorNameParam}
              </p>
            )}
            {centreNameParam && (
              <p className="text-gray-800">
                <span className="font-semibold text-teal-900">Clinic Branch:</span> {centreNameParam}
              </p>
            )}
            {billNumber && (
              <p className="text-gray-800 font-mono">
                <span className="font-semibold font-sans text-teal-900">Invoice Ref:</span> {billNumber}
              </p>
            )}
          </div>

          <div className="pt-2">
            <p className="text-xs text-gray-500 italic flex items-center justify-center gap-1">
              <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" /> Wishing you active mobility and pain-free wellness!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-xl shadow-2xl border-gray-200 bg-white">
      {/* Header Banner with Doctor & Invoice Details */}
      <CardHeader className="text-center space-y-3 pb-4 pt-6 bg-linear-to-b from-teal-50/90 via-emerald-50/40 to-white border-b rounded-t-xl">
        <div className="flex justify-center">
          {branding.logoUrl ? (
            <div className="h-14 px-4 py-2 rounded-2xl bg-white border border-gray-200 shadow-md flex items-center justify-center">
              <img src={branding.logoUrl} alt={branding.clinicName || 'PhysioNautics'} className="max-h-10 max-w-[220px] object-contain" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-teal-700 flex items-center justify-center shadow-lg shadow-teal-700/25">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        <div>
          <CardTitle className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            {template?.title || 'Patient Session & Treatment Feedback'}
          </CardTitle>
          <CardDescription className="text-xs text-gray-600 mt-1">
            {template?.description || 'Help us ensure the highest standard of physical therapy and doctor care.'}
          </CardDescription>
        </div>

        {/* Doctor / Centre / Invoice Attribution Chips */}
        {(doctorNameParam || centreNameParam || billNumber || servicesParam) && (
          <div className="flex flex-wrap gap-1.5 justify-center pt-1 text-xs max-w-full">
            {doctorNameParam && (
              <Badge variant="outline" className="bg-white text-teal-900 border-teal-300 font-semibold gap-1 shadow-xs">
                <Stethoscope className="h-3 w-3 text-teal-600 shrink-0" /> Dr. {doctorNameParam}
              </Badge>
            )}
            {centreNameParam && (
              <Badge variant="outline" className="bg-white text-gray-700 border-gray-300 gap-1 shadow-xs">
                <Building2 className="h-3 w-3 text-blue-600 shrink-0" /> {centreNameParam}
              </Badge>
            )}
            {billNumber && (
              <Badge variant="outline" className="bg-white font-mono text-amber-800 border-amber-300 shadow-xs">
                <Receipt className="h-3 w-3 text-amber-600 mr-1 shrink-0" /> {billNumber}
              </Badge>
            )}
            {servicesParam && (
              servicesParam.split(',').map((svc, idx) => (
                <Badge key={idx} variant="outline" className="bg-white text-purple-800 border-purple-200 shadow-xs max-w-full whitespace-normal text-left">
                  <FileText className="h-3 w-3 text-purple-600 mr-1 shrink-0 inline" /> {svc.trim()}
                </Badge>
              ))
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient Name */}
          <div className="space-y-1.5 bg-gray-50 p-3 rounded-xl border border-gray-100">
            <Label htmlFor="patientName" className="text-xs font-bold text-gray-800">
              Patient Name *
            </Label>
            <Input
              id="patientName"
              type="text"
              required
              className="bg-white text-sm"
              placeholder="e.g. Rahul Verma"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
            />
          </div>

          {/* Dynamic AI Questions from Active Template */}
          {template?.fields.map((field, idx) => (
            <div key={field.id} className="space-y-2 bg-gray-50/70 p-4 rounded-xl border border-gray-100">
              <div className="space-y-0.5">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-gray-900">
                    {idx + 1}. {field.title} {field.required && <span className="text-red-500">*</span>}
                  </span>
                  {field.type === 'star_rating' && (
                    <span className="text-xs font-bold text-amber-600">
                      {formAnswers[field.id] || 5} / 5
                    </span>
                  )}
                  {field.type === 'linear_scale' && (
                    <span className="text-xs font-bold text-teal-700">
                      Score: {formAnswers[field.id] || 5} / {field.max_scale || 10}
                    </span>
                  )}
                </div>
                {field.description && (
                  <p className="text-xs text-gray-500">{field.description}</p>
                )}
              </div>

              {/* ⭐ Star Rating */}
              {field.type === 'star_rating' && (
                <div className="flex gap-2 pt-1">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                      onClick={() => handleAnswerChange(field.id, star)}
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          star <= (formAnswers[field.id] || 5)
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* 📏 Linear Scale (1-10) */}
              {field.type === 'linear_scale' && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                    <span>{field.min_label || '1 (Low / Discomfort)'}</span>
                    <span>{field.max_label || '10 (High / Complete Relief)'}</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: (field.max_scale || 10) - (field.min_scale || 1) + 1 }, (_, i) => (field.min_scale || 1) + i).map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleAnswerChange(field.id, num)}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          formAnswers[field.id] === num
                            ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-teal-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 🔘 Multiple Choice */}
              {field.type === 'multiple_choice' && (
                <div className="space-y-2 pt-1">
                  {field.options?.map((opt, oIdx) => (
                    <label
                      key={oIdx}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                        formAnswers[field.id] === opt
                          ? 'bg-teal-50/80 border-teal-400 text-teal-950 font-semibold'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={field.id}
                        required={field.required}
                        checked={formAnswers[field.id] === opt}
                        onChange={() => handleAnswerChange(field.id, opt)}
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* ☑️ Checkboxes */}
              {field.type === 'checkbox' && (
                <div className="space-y-2 pt-1">
                  {field.options?.map((opt, oIdx) => {
                    const isChecked = Array.isArray(formAnswers[field.id]) && formAnswers[field.id].includes(opt)
                    return (
                      <label
                        key={oIdx}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs font-medium cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-teal-50/80 border-teal-400 text-teal-950 font-semibold'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleCheckboxToggle(field.id, opt)}
                          className="rounded text-teal-600 focus:ring-teal-500"
                        />
                        <span>{opt}</span>
                      </label>
                    )
                  })}
                </div>
              )}

              {/* 🔟 NPS (0-10) */}
              {field.type === 'nps' && (
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                    <span>0 (Not Likely)</span>
                    <span>10 (Extremely Likely)</span>
                  </div>
                  <div className="flex gap-1 overflow-x-auto pb-1">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleAnswerChange(field.id, num)}
                        className={`flex-1 min-w-[28px] py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          formAnswers[field.id] === num
                            ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-teal-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 📝 Paragraph / Textarea */}
              {field.type === 'textarea' && (
                <textarea
                  rows={3}
                  required={field.required}
                  value={formAnswers[field.id] || ''}
                  onChange={e => handleAnswerChange(field.id, e.target.value)}
                  placeholder="Type your clinical care notes or feedback here..."
                  className="w-full p-2.5 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              )}

              {/* 💬 Short Text */}
              {field.type === 'text' && (
                <Input
                  type="text"
                  required={field.required}
                  value={formAnswers[field.id] || ''}
                  onChange={e => handleAnswerChange(field.id, e.target.value)}
                  placeholder="Short response..."
                  className="bg-white text-xs h-9"
                />
              )}
            </div>
          ))}

          <Button
            type="submit"
            disabled={submitting || !patientName.trim()}
            className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold h-12 shadow-lg shadow-teal-900/20 gap-2 text-sm mt-4 cursor-pointer"
          >
            {submitting ? (
              <>Submitting Feedback...</>
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit Feedback to Dr. {doctorNameParam || 'Care Team'}
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-teal-50/80 via-slate-50 to-emerald-100 flex items-center justify-center p-4">
      <Suspense fallback={<div className="p-8 text-center text-sm font-medium">Loading feedback form...</div>}>
        <FeedbackFormContent />
      </Suspense>
    </div>
  )
}

