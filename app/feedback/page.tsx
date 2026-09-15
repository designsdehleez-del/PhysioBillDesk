'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Star, Stethoscope, Heart, CheckCircle2, Building2, User, Send } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { savePatientFeedback } from '@/lib/data-store'

function FeedbackFormContent() {
  const searchParams = useSearchParams()
  const billNumber = searchParams.get('bid') || ''
  const patientUid = searchParams.get('uid') || ''
  const patientNameParam = searchParams.get('name') || ''
  const patientPhoneParam = searchParams.get('phone') || ''
  const doctorNameParam = searchParams.get('doc') || ''
  const centreNameParam = searchParams.get('centre') || ''

  const [patientName, setPatientName] = useState(patientNameParam)
  const [overallRating, setOverallRating] = useState(5)
  const [treatmentRating, setTreatmentRating] = useState(5)
  const [hygieneRating, setHygieneRating] = useState(5)
  const [staffRating, setStaffRating] = useState(5)
  const [comments, setComments] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (patientNameParam) setPatientName(patientNameParam)
  }, [patientNameParam])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patientName.trim()) return
    setSubmitting(true)
    try {
      await savePatientFeedback({
        bill_number: billNumber || undefined,
        patient_uid: patientUid || undefined,
        patient_name: patientName.trim(),
        patient_phone: patientPhoneParam || undefined,
        doctor_name: doctorNameParam || undefined,
        centre_name: centreNameParam || 'New Friends Colony, New Delhi',
        rating: overallRating,
        treatment_rating: treatmentRating,
        hygiene_rating: hygieneRating,
        staff_rating: staffRating,
        comments: comments.trim() || undefined,
      })
      setSubmitted(true)
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  const StarRating = ({
    value,
    onChange,
    label,
  }: {
    value: number
    onChange: (v: number) => void
    label: string
  }) => (
    <div className="space-y-1.5 bg-gray-50/70 p-3 rounded-xl border border-gray-100">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-800">{label}</span>
        <span className="text-xs font-bold text-amber-600">{value} / 5</span>
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
            onClick={() => onChange(star)}
          >
            <Star
              className={`h-7 w-7 transition-colors ${
                star <= value
                  ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )

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
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your valuable feedback has been submitted directly to the Physionautics clinical team. We are dedicated to providing you with the highest standard of care!
            </p>
          </div>

          <div className="bg-blue-50/70 rounded-2xl p-4 border border-blue-100 text-xs text-left space-y-1.5">
            <p className="font-bold text-blue-900 flex items-center gap-1.5">
              <Stethoscope className="h-4 w-4 text-blue-600" /> Physionautics Clinic
            </p>
            {centreNameParam && (
              <p className="text-gray-700">
                <span className="font-semibold">Branch:</span> {centreNameParam}
              </p>
            )}
            {doctorNameParam && (
              <p className="text-gray-700">
                <span className="font-semibold">Doctor:</span> Dr. {doctorNameParam}
              </p>
            )}
            {billNumber && (
              <p className="text-gray-700 font-mono">
                <span className="font-semibold font-sans">Invoice:</span> {billNumber}
              </p>
            )}
          </div>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground italic flex items-center justify-center gap-1">
              <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> Wishing you a speedy and active recovery!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-lg shadow-2xl border-border/80 bg-white">
      <CardHeader className="text-center space-y-3 pb-3 pt-6 bg-gradient-to-b from-blue-50/80 to-white border-b rounded-t-xl">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
        </div>
        <div>
          <CardTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">Physionautics</CardTitle>
          <CardDescription className="text-xs font-semibold uppercase tracking-wider text-blue-600 mt-0.5">
            Patient Session Feedback
          </CardDescription>
        </div>
        <p className="text-xs text-gray-600 max-w-sm mx-auto">
          Help us enhance our clinical care by sharing your experience for today&apos;s therapy session.
        </p>

        {(doctorNameParam || centreNameParam || billNumber) && (
          <div className="flex flex-wrap gap-1.5 justify-center pt-1 text-[11px]">
            {centreNameParam && (
              <Badge variant="outline" className="bg-white text-gray-700 border-blue-200 gap-1">
                <Building2 className="h-3 w-3 text-blue-600" /> {centreNameParam}
              </Badge>
            )}
            {doctorNameParam && (
              <Badge variant="outline" className="bg-white text-gray-700 border-purple-200 gap-1">
                <User className="h-3 w-3 text-purple-600" /> Dr. {doctorNameParam}
              </Badge>
            )}
            {billNumber && (
              <Badge variant="outline" className="bg-white font-mono text-blue-700 border-blue-200">
                {billNumber}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="patientName" className="text-xs font-bold text-gray-700">
              Your Name *
            </Label>
            <input
              id="patientName"
              type="text"
              required
              className="w-full h-10 px-3 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Rahul Verma"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
            />
          </div>

          {/* Rating Matrix */}
          <div className="space-y-2.5">
            <StarRating
              label="1. Overall Session Experience"
              value={overallRating}
              onChange={setOverallRating}
            />
            <StarRating
              label="2. Treatment Effectiveness & Pain Relief"
              value={treatmentRating}
              onChange={setTreatmentRating}
            />
            <StarRating
              label="3. Clinic Cleanliness & Hygiene"
              value={hygieneRating}
              onChange={setHygieneRating}
            />
            <StarRating
              label="4. Doctor & Staff Hospitality"
              value={staffRating}
              onChange={setStaffRating}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comments" className="text-xs font-bold text-gray-700 flex items-center justify-between">
              <span>Feedback / Suggestions (Optional)</span>
              <span className="text-[10px] text-muted-foreground font-normal">What did you like the most?</span>
            </Label>
            <textarea
              id="comments"
              rows={3}
              className="w-full p-3 text-xs rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Share how your body feels after the session, or any suggestions for improvement..."
              value={comments}
              onChange={e => setComments(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={submitting || !patientName.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-md gap-2 text-sm mt-2 cursor-pointer"
          >
            {submitting ? (
              <>Submitting…</>
            ) : (
              <>
                <Send className="h-4 w-4" /> Submit Feedback
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-slate-50 to-blue-100 flex items-center justify-center p-4">
      <Suspense fallback={<div className="p-8 text-center text-sm font-medium">Loading feedback form...</div>}>
        <FeedbackFormContent />
      </Suspense>
    </div>
  )
}
