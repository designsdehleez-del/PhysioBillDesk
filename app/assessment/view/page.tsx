'use client'

import React, { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, Download, ShieldCheck, HeartPulse, Activity, User, Calendar, Stethoscope, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getAssessments, getAssessmentById, getPatients, saveAssessment } from '@/lib/data-store'
import type { ClinicalAssessment, Patient } from '@/lib/supabase/types'
import { useClinicBranding } from '@/lib/settings-store'
import { formatDate } from '@/lib/utils'
import { decodeReportPayload, type AssessmentPayload } from '@/lib/whatsapp'

export default function PublicAssessmentViewPage({ searchParams }: { searchParams: Promise<{ aid?: string; uid?: string; d?: string; print?: string }> }) {
  const resolvedParams = use(searchParams)
  const aid = resolvedParams.aid
  const uid = resolvedParams.uid
  const dataToken = resolvedParams.d
  const autoPrint = resolvedParams.print === 'true'

  const router = useRouter()
  const { branding } = useClinicBranding()
  const [assessment, setAssessment] = useState<ClinicalAssessment | null>(null)
  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // 1. If self-contained data token is in URL, decode immediately
        if (dataToken) {
          const decoded = decodeReportPayload<AssessmentPayload>(dataToken)
          if (decoded) {
            const reconstructedAss: ClinicalAssessment = {
              id: decoded.id || aid || 'ass-view',
              patient_id: decoded.uid || uid || '',
              patient_uid: decoded.uid || uid || 'CLN-PATIENT',
              type: decoded.type || 'physiotherapy',
              assessment_date: decoded.date || new Date().toISOString().split('T')[0],
              doctor_name: decoded.doctor_name || 'Dr. Clinical Specialist',
              vas_score: decoded.vas_score !== undefined && decoded.vas_score !== null ? Number(decoded.vas_score) : null,
              data: decoded.data || {},
              created_at: decoded.date || new Date().toISOString(),
            }
            const reconstructedPat: any = {
              id: decoded.uid || uid || '',
              uid: decoded.uid || uid || 'CLN-PATIENT',
              full_name: decoded.patient_name || 'Valued Patient',
              phone: decoded.patient_phone || '',
              age: decoded.patient_age || 0,
              gender: (decoded.patient_gender as any) || 'Other',
              email: null,
              address: null,
              blood_group: null,
              medical_notes: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              centre_name: decoded.centre_name,
              physiotherapist_name: decoded.physiotherapist_name,
              primary_doctor_name: decoded.doctor_name,
            }
            setAssessment(reconstructedAss)
            setPatient(reconstructedPat)
            // Persist locally on this device as well
            saveAssessment(reconstructedAss).catch(() => {})
            setLoading(false)
            return
          }
        }

        // 2. Fall back to local and database lookup
        let match: ClinicalAssessment | null = null
        if (aid) {
          match = await getAssessmentById(aid)
        }
        if (!match && uid) {
          const list = await getAssessments(uid)
          if (list.length > 0) match = list[0]
        }

        // 3. Fall back to /api/assessment direct fetch
        if (!match && (aid || uid)) {
          try {
            const apiRes = await fetch(`/api/assessment?${new URLSearchParams({ ...(aid ? { aid } : {}), ...(uid ? { uid } : {}) }).toString()}`, { cache: 'no-store' })
            if (apiRes.ok) {
              const json = await apiRes.json()
              if (json.success && Array.isArray(json.data) && json.data.length > 0) {
                match = json.data[0]
              }
            }
          } catch (_) {}
        }

        if (match) {
          setAssessment(match)
          let matchedPatient: any = null
          try {
            const allPatients = await getPatients()
            matchedPatient = allPatients.find(p => p.id === match?.patient_id || p.uid === match?.patient_uid)
          } catch (_) {}

          if (matchedPatient) {
            setPatient(matchedPatient)
          } else {
            // Reconstruct patient details from assessment metadata
            const assData = match.data || {}
            setPatient({
              id: match.patient_id || uid || 'CLN-PATIENT',
              uid: match.patient_uid || uid || 'CLN-PATIENT',
              full_name: assData.patient_name || assData.full_name || 'Valued Patient',
              phone: assData.patient_phone || assData.phone || '',
              age: assData.patient_age || assData.age || 0,
              gender: assData.patient_gender || assData.gender || 'Other',
              email: null,
              address: null,
              blood_group: null,
              medical_notes: null,
              created_at: match.created_at || new Date().toISOString(),
              updated_at: match.created_at || new Date().toISOString(),
              centre_name: assData.centre_name || 'New Friends Colony, New Delhi',
              physiotherapist_name: assData.physiotherapist_name || null,
              primary_doctor_name: match.doctor_name || assData.doctor_name || 'Dr. Clinical Specialist',
            } as any)
          }
        }
      } catch (err) {
        console.error('Failed to load assessment report:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [aid, uid, dataToken])

  useEffect(() => {
    if (!loading && assessment && autoPrint) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [loading, assessment, autoPrint])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Generating Official Clinical Report...</p>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Assessment Report Not Found</h2>
          <p className="text-xs text-slate-500 mb-4">
            The requested assessment report (Ref: {aid || uid || 'N/A'}) was not found in this browser's session.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 text-left mb-6 space-y-1">
            <p className="font-semibold">💡 What to do:</p>
            <p>• If you received this link via WhatsApp, please tap the newly generated <strong>Share PDF on WhatsApp</strong> link from the clinic desk.</p>
            <p>• If you are clinic staff, you can view and export this report directly from the <strong className="text-slate-900">Patient Profile & Assessment Studio</strong>.</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Button onClick={() => router.push('/')} variant="outline" className="text-xs rounded-xl">
              Go to Home
            </Button>
            <Button onClick={() => router.push('/patients')} className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-xl">
              Patient Directory
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const d = assessment.data || {}
  const vas = assessment.vas_score !== null && assessment.vas_score !== undefined ? Number(assessment.vas_score) : null
  const stage = d.assessment_stage || 'Clinical Session Assessment'
  const isNeuro = assessment.type === 'neurotherapy'

  const vasColor = vas === null ? 'bg-slate-100 text-slate-700' :
    vas <= 3 ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
    vas <= 6 ? 'bg-amber-100 text-amber-800 border-amber-300' :
    'bg-rose-100 text-rose-800 border-rose-300'

  return (
    <div className="min-h-screen bg-slate-100/80 py-6 sm:py-10 px-3 sm:px-6 print:bg-white print:p-0">
      {/* Top Floating Action Bar */}
      <div className="max-w-3xl mx-auto mb-4 print:hidden flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-[11px] font-bold py-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Clinical Assessment
          </Badge>
          <span className="text-xs font-mono font-bold text-slate-600">{assessment.id}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs gap-1.5 flex-1 sm:flex-initial"
          >
            <Download className="w-3.5 h-3.5" /> Download Official PDF Report
          </Button>
        </div>
      </div>

      {/* Main Printable Document Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 print:shadow-none print:border-none print:p-0">
        {/* Header with Letterhead */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
          <div>
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.clinicName || 'PhysioNautics'} className="h-12 max-w-[200px] object-contain mb-2" />
            ) : (
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{branding.clinicName || 'PhysioNautics'}</h1>
            )}
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{branding.tagline || 'Physiotherapy & Pain Rehabilitation Centre'}</p>
            <div className="text-[11px] text-slate-500 mt-2 space-y-0.5 leading-relaxed">
              <p className="font-semibold text-slate-700">{(patient as any)?.centre_name || branding.clinicName || 'PhysioNautics Healthcare'}</p>
              <p>{branding.address || 'CV Raman Marg, New Friends Colony, New Delhi – 110025'}</p>
              <p>Phone: {branding.phone || '08383936905'} | Reg. No: {branding.gstin || 'MED-DEL-2026-9812'}</p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl w-full sm:w-auto border sm:border-none">
            <span className="inline-block bg-blue-600 text-white font-semibold uppercase tracking-wider text-[11px] px-3 py-1 rounded-lg">
              {isNeuro ? 'Neurotherapy Assessment' : 'Physiotherapy Assessment'}
            </span>
            <div className="text-xs text-slate-600 mt-2 space-y-0.5">
              <p>Report Date: <strong className="text-slate-900">{formatDate(assessment.assessment_date)}</strong></p>
              <p>Stage: <strong className="text-blue-700">{stage}</strong></p>
            </div>
          </div>
        </div>

        {/* Patient Particulars & Attending Team */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
          <div className="bg-slate-50/70 p-4 rounded-2xl space-y-1.5 border border-slate-100">
            <h3 className="font-bold text-blue-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" /> Patient Particulars
            </h3>
            <p className="text-sm font-bold text-slate-900">{patient?.full_name || assessment.patient_uid}</p>
            <p className="text-slate-600 font-mono">UID: {assessment.patient_uid}</p>
            {patient?.phone && <p className="text-slate-600">Mobile: {patient.phone}</p>}
            {patient?.age && <p className="text-slate-500">{patient.age} Yrs • {patient.gender}</p>}
          </div>

          <div className="bg-slate-50/70 p-4 rounded-2xl space-y-1.5 border border-slate-100">
            <h3 className="font-bold text-purple-900 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-purple-600" /> Clinical Team & Facility
            </h3>
            <p className="text-slate-700">
              <span className="text-slate-400">Attending Specialist:</span>{' '}
              <strong className="text-slate-900">{assessment.doctor_name || (patient as any)?.primary_doctor_name || 'Dr. Clinical Specialist'}</strong>
            </p>
            {(patient as any)?.physiotherapist_name && (
              <p className="text-slate-700">
                <span className="text-slate-400">Assigned Physio:</span>{' '}
                <strong className="text-slate-900">{(patient as any).physiotherapist_name}</strong>
              </p>
            )}
            <p className="text-slate-700">
              <span className="text-slate-400">Facility:</span>{' '}
              {(patient as any)?.centre_name || 'PhysioNautics Healthcare Centre'}
            </p>
          </div>
        </div>

        {/* VAS Pain Assessment & Intensity */}
        <div className="py-5 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500" /> Visual Analog Scale (VAS) Pain Score
            </h3>
            {vas !== null && (
              <span className={`px-3 py-1 rounded-xl text-xs font-black border ${vasColor}`}>
                Current VAS: {vas} / 10 ({vas <= 3 ? 'Mild Pain' : vas <= 6 ? 'Moderate Pain' : 'Severe Pain'})
              </span>
            )}
          </div>

          {/* VAS Meter Visual Bar */}
          <div className="bg-slate-100 rounded-2xl p-4 border border-slate-200/80">
            <div className="grid grid-cols-11 gap-1 text-center font-mono font-bold text-[10px]">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(score => {
                const isSelected = vas === score
                const bg = score <= 3 ? 'bg-emerald-500' : score <= 6 ? 'bg-amber-500' : 'bg-rose-500'
                return (
                  <div key={score} className="flex flex-col items-center">
                    <div
                      className={`w-full h-8 rounded-lg flex items-center justify-center transition-all ${
                        isSelected
                          ? `${bg} text-white font-black ring-2 ring-blue-600 scale-105 shadow-md`
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      {score}
                    </div>
                    <span className="text-[9px] text-slate-400 mt-1">
                      {score === 0 ? 'No Pain' : score === 5 ? 'Moderate' : score === 10 ? 'Severe' : ''}
                    </span>
                  </div>
                )
              })}
            </div>

            {(d.pain_description || d.pain_location || d.aggravating_factors) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700">
                {d.pain_description && (
                  <p><span className="font-semibold text-slate-500">Pain Character:</span> {d.pain_description}</p>
                )}
                {d.pain_location && (
                  <p><span className="font-semibold text-slate-500">Location:</span> {d.pain_location}</p>
                )}
                {d.aggravating_factors && (
                  <p><span className="font-semibold text-slate-500">Aggravating Factors:</span> {d.aggravating_factors}</p>
                )}
                {d.relieving_factors && (
                  <p><span className="font-semibold text-slate-500">Relieving Factors:</span> {d.relieving_factors}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Clinical Presentation & Chief Complaints */}
        <div className="py-5 border-b border-slate-200 space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-600" /> Chief Complaints & History of Illness
            </h3>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5">
              <p className="text-slate-900 font-semibold text-sm">
                {d.main_problem || d.presenting_symptoms || 'Presenting complaints recorded at clinical examination.'}
              </p>
              {d.onset_date && <p className="text-slate-500">Onset Date: {d.onset_date}</p>}
              {d.cause && <p className="text-slate-600"><span className="text-slate-400">Mechanism of Onset:</span> {d.cause}</p>}
              {d.activity_limitations && <p className="text-slate-600"><span className="text-slate-400">Activity Limitations:</span> {d.activity_limitations}</p>}
            </div>
          </div>

          {/* Physical & Functional Examination Findings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {d.posture_observation && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Posture & Gait Observation</h4>
                <p className="text-slate-800">{d.posture_observation}</p>
              </div>
            )}
            {d.rom_findings && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Range of Motion (ROM)</h4>
                <p className="text-slate-800">{d.rom_findings}</p>
              </div>
            )}
            {d.mmt_findings && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Manual Muscle Testing (MMT)</h4>
                <p className="text-slate-800">{d.mmt_findings}</p>
              </div>
            )}
            {d.special_tests && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Special Clinical Tests</h4>
                <p className="text-slate-800">{d.special_tests}</p>
              </div>
            )}
            {isNeuro && d.ashworth_scale && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Modified Ashworth Scale (Spasticity)</h4>
                <p className="text-slate-800">{d.ashworth_scale}</p>
              </div>
            )}
            {isNeuro && (d.sitting_balance || d.standing_balance) && (
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Balance & Coordination</h4>
                <p className="text-slate-800">Sitting: {d.sitting_balance || 'Normal'} • Standing: {d.standing_balance || 'Normal'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Diagnosis & Rehabilitation Plan */}
        <div className="py-5 border-b border-slate-200 space-y-4 text-xs">
          <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200/80">
            <h3 className="font-bold text-blue-900 uppercase tracking-wider text-[10px] mb-1">Clinical Diagnosis</h3>
            <p className="text-base font-black text-blue-950">
              {d.clinical_diagnosis || d.diagnosis_condition || 'Clinical evaluation completed.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Short-Term Rehabilitation Goals</h4>
              <p className="text-slate-800">{d.short_term_goals || 'Reduce acute pain and restore functional movement patterns.'}</p>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-1">Long-Term Rehabilitation Goals</h4>
              <p className="text-slate-800">{d.long_term_goals || 'Full recovery, spinal strengthening, and prevention of recurrence.'}</p>
            </div>
          </div>

          {Array.isArray(d.treatment_modalities) && d.treatment_modalities.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-700 uppercase tracking-wider text-[10px] mb-2">Prescribed Treatment Modalities</h4>
              <div className="flex flex-wrap gap-1.5">
                {d.treatment_modalities.map((m: string, i: number) => (
                  <Badge key={i} variant="outline" className="bg-white border-blue-200 text-blue-800 text-xs px-2.5 py-0.5 font-semibold">
                    ✓ {m}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer & Signature Line */}
        <div className="mt-8 pt-6 border-t border-dashed border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-[11px] text-slate-500">
          <div>
            <p className="font-bold text-slate-800">{branding.invoiceFooterNote || 'Thank you for trusting PhysioNautics!'}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Verified clinical assessment document for patient UID {assessment.patient_uid}.<br />
              Generated electronically under clinical protocols. Confidential patient health record.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="w-40 border-b border-slate-400 mb-1" />
            <p className="font-bold text-slate-800">{assessment.doctor_name || 'Dr. Clinical Specialist'}</p>
            <p className="text-[10px] text-slate-400">Consultant Physiotherapist / PhysioNautics</p>
          </div>
        </div>
      </div>
    </div>
  )
}
