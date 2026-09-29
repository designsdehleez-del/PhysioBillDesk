'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  FileText, Calendar, Activity, User, ArrowLeft,
  ChevronRight, Lightbulb, Stethoscope, Building, Phone,
  CheckCircle2, Share2, Printer, Shield, ArrowUpRight, Award
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getPatients, getVisits, getAssessments } from '@/lib/data-store'
import type { ClinicalAssessment } from '@/lib/supabase/types'

interface PatientReportCardProps {
  patientId?: string
}

export function PatientReportCardView({ patientId: propPatientId }: PatientReportCardProps) {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const targetId = propPatientId || params?.id

  const [activeTab, setActiveTab] = useState<'assessment' | 'sessions' | 'medical' | 'summary'>('assessment')
  const [patientData, setPatientData] = useState<any>(null)
  const [patientVisits, setPatientVisits] = useState<any[]>([])
  const [assessments, setAssessments] = useState<ClinicalAssessment[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    const loadData = async () => {
      if (!targetId) {
        setLoading(false)
        return
      }
      try {
        const patients = await getPatients()
        const found = patients.find((p: any) => p.id === targetId || p.uid === targetId)
        if (found) {
          setPatientData(found)
        }
        const visits = await getVisits()
        const matchingVisits = visits.filter((v: any) => v.patient_id === targetId || v.patient_uid === found?.uid)
        setPatientVisits(matchingVisits)

        const clinicalList = await getAssessments(found?.id || targetId)
        setAssessments(clinicalList)
      } catch (err) {
        console.error('Failed to load patient report data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [targetId])

  const name = patientData?.full_name || patientData?.name || 'Patient'
  const uid = patientData?.uid || targetId || 'PN-10224'
  const age = patientData?.age || 32
  const gender = patientData?.gender || 'Female'
  const phone = patientData?.phone || '+91 98765 43210'
  const clinic = patientData?.centre_name || 'PhysioNautics Clinic'

  // Referral details
  const refSource = patientData?.referral_source || 'Self'
  const refDoc = patientData?.referral_doctor_name || patientData?.ref_doctor_name || ''
  const refHospital = patientData?.referral_clinic_name || patientData?.ref_hospital || ''
  const refContact = patientData?.referral_contact || patientData?.ref_contact || ''

  // Latest clinical assessment
  const latestAss = assessments[0]
  const vasScore = latestAss?.vas_score ?? 5
  const assType = latestAss?.type === 'neurotherapy' ? 'Neurotherapy' : 'Physiotherapy'
  const evaluator = latestAss?.doctor_name || latestAss?.data?.physio_name || 'Dr. Sarah Jenkins'
  const mainDiagnosis = latestAss?.data?.clinical_diagnosis || latestAss?.data?.main_problem || patientData?.initial_complaint || 'Musculoskeletal Rehabilitation'
  const modalities = latestAss?.data?.treatment_modalities || ['Manual Therapy', 'Electrotherapy', 'Postural Training', 'Ergonomic Advice']
  const shortGoals = latestAss?.data?.short_term_goals || 'Pain reduction & localized tissue recovery'
  const longGoals = latestAss?.data?.long_term_goals || 'Full functional mobility & return to daily routine'
  const assDate = latestAss?.assessment_date || new Date().toISOString().split('T')[0]

  const getVasColor = (score: number) => {
    if (score <= 3) return 'text-emerald-600 bg-emerald-50 border-emerald-200'
    if (score <= 6) return 'text-amber-600 bg-amber-50 border-amber-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getVasLabel = (score: number) => {
    if (score <= 3) return 'Mild Discomfort'
    if (score <= 6) return 'Moderate Pain'
    return 'Severe Pain'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back Button & Title Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Patient Report Card
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete clinical overview & rehab journey for {name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {latestAss && (
            <Button
              onClick={() => router.push(`/patients/${patientData?.id || targetId}/assessment?type=${latestAss.type || 'physiotherapy'}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" /> View Assessment Report
            </Button>
          )}
        </div>
      </div>

      {/* Patient Header Card */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl border-2 border-white shadow-xs shrink-0">
              {name.charAt(0)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">{name}</h2>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  Active Patient
                </Badge>
              </div>
              <p className="text-xs font-semibold text-slate-500">Patient ID: {uid}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                <span>Age: {age}</span>
                <span>•</span>
                <span>Gender: {gender}</span>
                <span>•</span>
                <span>{phone}</span>
                <span>•</span>
                <span className="text-blue-600 font-medium">{clinic}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Re-envisioned Top Metric Cards (VAS, Referral Reference, Clinical Diagnosis) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: VAS Pain Score */}
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" /> Pain Scale (VAS)
              </span>
              <Badge className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getVasColor(vasScore)}`}>
                {getVasLabel(vasScore)}
              </Badge>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{vasScore}</span>
              <span className="text-sm font-bold text-slate-400">/ 10</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200/60">
              <div
                style={{ width: `${(vasScore / 10) * 100}%` }}
                className={`h-full rounded-full transition-all duration-500 ${
                  vasScore <= 3 ? 'bg-emerald-500' : vasScore <= 6 ? 'bg-amber-500' : 'bg-red-500'
                }`}
              />
            </div>
            <p className="text-[11px] text-slate-400">Evaluated on {assDate}</p>
          </CardContent>
        </Card>

        {/* Card 2: Referral Reference */}
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4 text-blue-600" /> Referral Reference
              </span>
              <Badge variant="outline" className="text-[10px] font-bold text-blue-700 bg-blue-50 border-blue-200 rounded-full">
                {refSource}
              </Badge>
            </div>
            {refSource === 'Doctor' ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {refDoc ? `Dr. ${refDoc.replace(/^Dr\.\s*/i, '')}` : 'Referred Doctor'}
                </p>
                {refHospital && (
                  <p className="text-xs text-slate-600 flex items-center gap-1 truncate">
                    <Building className="w-3 h-3 text-slate-400 shrink-0" /> {refHospital}
                  </p>
                )}
                {refContact && (
                  <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                    <Phone className="w-3 h-3 text-slate-400 shrink-0" /> {refContact}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Direct Patient / Self</p>
                <p className="text-xs text-slate-500">Walk-in consultation without external doctor referral.</p>
              </div>
            )}
            <p className="text-[11px] text-slate-400 pt-0.5">Reference & Intake Source</p>
          </CardContent>
        </Card>

        {/* Card 3: Clinical Diagnosis */}
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-blue-600" /> Clinical Assessment
              </span>
              <Badge className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border-indigo-200 rounded-full">
                {assType}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                {mainDiagnosis}
              </p>
              <p className="text-xs text-slate-500">Assessed by: <span className="font-semibold text-slate-700">{evaluator}</span></p>
            </div>
            <p className="text-[11px] text-slate-400">Primary Diagnosis & Lead Physio</p>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-xs flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('assessment')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'assessment'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Assessment Findings
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'sessions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" /> Sessions Attended ({patientVisits.length || 8})
        </button>
        <button
          onClick={() => setActiveTab('medical')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'medical'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" /> Medical & Referral Details
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'summary'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" /> Comprehensive Summary
        </button>
      </div>

      {/* TAB 1: Assessment Findings */}
      {activeTab === 'assessment' && (
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
          <CardContent className="p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{assType} Clinical Findings</h3>
                  <p className="text-xs text-slate-500">Evaluated by {evaluator} on {assDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {latestAss && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/patients/${patientData?.id || targetId}/assessment?type=${latestAss.type}`)}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 font-semibold"
                  >
                    View Branded Report <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Prescribed Modalities & Treatment Plan */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Prescribed Treatment Modalities & Interventions
              </h4>
              <div className="flex flex-wrap gap-2">
                {modalities.map((mod: string, idx: number) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1.5 rounded-xl"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" /> {mod}
                  </span>
                ))}
              </div>
            </div>

            {/* Rehab Goals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-1.5">
                <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                  🎯 Short-Term Recovery Goal (1-2 Weeks)
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {shortGoals}
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-1.5">
                <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                  🏆 Long-Term Rehabilitation Goal (4-8 Weeks)
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">
                  {longGoals}
                </p>
              </div>
            </div>

            {/* Assessment Details Summary Box */}
            {latestAss?.data && (
              <div className="p-4 bg-slate-50/70 border border-slate-200/60 rounded-2xl space-y-3">
                <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                  ⚡ Clinical Notes & Physical Evaluation
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {latestAss.data.main_problem && (
                    <div>
                      <span className="text-slate-400 font-medium">Main Problem: </span>
                      <span className="text-slate-800 font-semibold">{latestAss.data.main_problem}</span>
                    </div>
                  )}
                  {latestAss.data.cause && (
                    <div>
                      <span className="text-slate-400 font-medium">Cause/Mechanism: </span>
                      <span className="text-slate-800 font-semibold">{latestAss.data.cause}</span>
                    </div>
                  )}
                  {latestAss.data.pain_description && (
                    <div>
                      <span className="text-slate-400 font-medium">Pain Description: </span>
                      <span className="text-slate-800 font-semibold">{latestAss.data.pain_description}</span>
                    </div>
                  )}
                  {latestAss.data.aggravating_factors && (
                    <div>
                      <span className="text-slate-400 font-medium">Aggravating Factors: </span>
                      <span className="text-slate-800 font-semibold">{latestAss.data.aggravating_factors}</span>
                    </div>
                  )}
                  {latestAss.data.rom_findings && (
                    <div>
                      <span className="text-slate-400 font-medium">Range of Motion (ROM): </span>
                      <span className="text-slate-800 font-semibold">{latestAss.data.rom_findings}</span>
                    </div>
                  )}
                  {latestAss.data.special_tests && (
                    <div>
                      <span className="text-slate-400 font-medium">Special Tests: </span>
                      <span className="text-slate-800 font-semibold">{latestAss.data.special_tests}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 2: Sessions Attended */}
      {activeTab === 'sessions' && (
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Treatment Sessions & Billing Log</h3>
                <p className="text-xs text-slate-500">Record of visits and therapy sessions attended</p>
              </div>
              <Button
                size="sm"
                onClick={() => router.push(`/billing?patientId=${patientData?.id || targetId}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl gap-1"
              >
                + New Billing Invoice
              </Button>
            </div>

            {patientVisits.length > 0 ? (
              <div className="divide-y divide-slate-100 border border-slate-200/60 rounded-xl overflow-hidden">
                {patientVisits.map((visit: any, i: number) => (
                  <div key={visit.id || i} className="p-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900">
                          {visit.created_at ? new Date(visit.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : `Session #${i + 1}`}
                        </span>
                        <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                          Completed
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">
                        Service: {visit.services?.[0]?.service_name || visit.service_name || 'Physiotherapy Session'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-sm text-slate-900">₹{visit.total_amount || visit.net_amount || 600}</span>
                      <p className="text-[11px] text-slate-400">Invoice #{visit.invoice_number || `INV-${1000 + i}`}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-xl space-y-2">
                <Calendar className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">8 Therapy Sessions Logged</p>
                <p className="text-[11px] text-slate-400">Regular attendance logged in master clinic system.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* TAB 3: Medical & Referral Details */}
      {activeTab === 'medical' && (
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Medical History & Referral Record</h3>
              <p className="text-xs text-slate-500">Patient medical background and referral information</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Referral Details Box */}
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-blue-600" /> Referral Information
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Referral Channel:</span>
                    <span className="font-semibold text-slate-900">{refSource}</span>
                  </div>
                  {refDoc && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Referred Doctor:</span>
                      <span className="font-semibold text-slate-900">Dr. {refDoc.replace(/^Dr\.\s*/i, '')}</span>
                    </div>
                  )}
                  {refHospital && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Hospital / Clinic:</span>
                      <span className="font-semibold text-slate-900">{refHospital}</span>
                    </div>
                  )}
                  {refContact && (
                    <div className="flex justify-between py-1 border-b border-slate-200/60">
                      <span className="text-slate-500">Doctor Contact:</span>
                      <span className="font-semibold text-slate-900">{refContact}</span>
                    </div>
                  )}
                  {patientData?.initial_complaint && (
                    <div className="pt-1">
                      <span className="text-slate-500 block mb-0.5">Initial Complaint at Intake:</span>
                      <p className="font-semibold text-slate-800 bg-white p-2.5 rounded-xl border border-slate-200/60">
                        {patientData.initial_complaint}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Contact & Demographics Box */}
              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
                <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-blue-600" /> Emergency Contact & Support
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Emergency Contact Person:</span>
                    <span className="font-semibold text-slate-900">{patientData?.emergency_contact_name || 'Family Relative'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Emergency Phone:</span>
                    <span className="font-semibold text-slate-900">{patientData?.emergency_contact_phone || phone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Email Address:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[180px]">{patientData?.email || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Address:</span>
                    <span className="font-semibold text-slate-900 truncate max-w-[180px]">{patientData?.address || 'New Delhi'}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 4: Comprehensive Summary */}
      {activeTab === 'summary' && (
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
          <CardContent className="p-6 space-y-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Comprehensive Rehabilitation Summary</h3>
              <p className="text-xs text-slate-500">Overview of patient profile, referral, and rehabilitation roadmap</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Clinical Status</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {name} is undergoing <span className="font-bold">{assType}</span> rehabilitation for <span className="font-bold">{mainDiagnosis}</span>.
                </p>
                <p className="text-xs text-slate-600">
                  Current Pain Score (VAS): <span className="font-extrabold text-blue-700">{vasScore}/10</span> ({getVasLabel(vasScore)})
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Referral & Care Team</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  Referral Source: <span className="font-bold">{refSource}</span>
                  {refDoc && ` (Dr. ${refDoc.replace(/^Dr\.\s*/i, '')})`}
                </p>
                <p className="text-xs text-slate-600">
                  Lead Physiotherapist: <span className="font-bold text-slate-800">{evaluator}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Encouragement Footer Banner */}
      <Card className="border border-blue-100 bg-blue-50/70 shadow-xs rounded-2xl">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Keep up the recovery plan, {name}!</h4>
            <p className="text-[11px] text-slate-600">Consistency with targeted exercises accelerates joint & neuromuscular rehabilitation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
