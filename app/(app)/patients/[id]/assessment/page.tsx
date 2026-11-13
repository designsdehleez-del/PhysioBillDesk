'use client'

import { useState, useEffect, use } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Stethoscope, Activity, CheckCircle2, ArrowLeft, Printer, Share2, 
  MessageCircle, CreditCard, Sparkles, FileText, User, Calendar, Tag, Shield, Save,
  Plus, TrendingDown, Clock, History, ChevronRight, Download
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useClinicBranding } from '@/lib/settings-store'
import { getPatients, saveAssessment, getAssessments } from '@/lib/data-store'
import { getAssessmentPdfUrl } from '@/lib/whatsapp'
import type { Patient, ClinicalAssessment } from '@/lib/supabase/types'

export default function PatientAssessmentPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const patientId = resolvedParams.id
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { profile } = useAuth()
  const { branding } = useClinicBranding()

  const initialType = searchParams.get('type') === 'neurotherapy' ? 'neurotherapy' : 'physiotherapy'
  const [assessmentType, setAssessmentType] = useState<'physiotherapy' | 'neurotherapy'>(initialType)

  const [patient, setPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [allAssessments, setAllAssessments] = useState<ClinicalAssessment[]>([])
  const [savedAssessment, setSavedAssessment] = useState<ClinicalAssessment | null>(null)
  const [viewMode, setViewMode] = useState<'report' | 'form'>('report')

  // Date-wise Assessment Meta
  const [assessmentDate, setAssessmentDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [assessmentStage, setAssessmentStage] = useState<string>('Baseline / Initial Evaluation')

  // Form State
  const [vasScore, setVasScore] = useState<number>(6)
  const [formData, setFormData] = useState<Record<string, any>>({
    // Presenting Complaint
    main_problem: '',
    onset_date: new Date().toISOString().split('T')[0],
    cause: '',
    pain_description: 'Sharp & Aching',
    aggravating_factors: '',
    relieving_factors: '',
    previous_treatment: '',

    // Neuro Complaint
    diagnosis_condition: '',
    mode_of_onset: 'Stroke / Trauma',
    presenting_symptoms: '',
    main_concerns: '',
    has_pain: 'Yes',
    pain_location: '',

    // Medical History
    medical_history_checks: [] as string[],
    medical_history_others: '',
    current_medications: '',
    allergies: '',
    history_of_falls: 'No',
    fall_frequency: '',
    assistive_devices_used: 'No',
    assistive_device_type: '',

    // Functional Assessment
    activity_limitations: '',
    work_status: 'Working',
    type_of_work: '',
    hobbies_sports: '',
    mobility_status: 'Independent',
    adls_status: 'Independent',
    sitting_balance: 'Good',
    standing_balance: 'Good',
    transfers_status: 'Independent',
    gait_type: 'Normal',
    communication_status: 'Normal',
    cognition_status: 'Intact',

    // Physical Exam
    posture_observation: '',
    rom_findings: '',
    mmt_findings: '',
    palpation_findings: '',
    special_tests: '',
    gait_analysis: '',
    muscle_tone: 'Normal',
    ashworth_scale: '',
    sensation_status: 'Intact',
    reflexes_status: 'Normal',
    coordination_findings: '',

    // Diagnosis & Treatment
    clinical_diagnosis: '',
    short_term_goals: '',
    long_term_goals: '',
    treatment_modalities: [] as string[],
    treatment_others: '',

    // Signatures
    physio_name: profile?.name || 'Dr. Clinical Specialist',
    patient_consent: true,
  })

  useEffect(() => {
    async function loadData() {
      try {
        const patients = await getPatients()
        const found = patients.find(p => p.id === patientId || p.uid === patientId)
        if (found) {
          setPatient(found)
          if (found.initial_complaint) {
            setFormData(prev => ({ ...prev, main_problem: prev.main_problem || found.initial_complaint! }))
          }
        }

        const existing = await getAssessments(patientId)
        setAllAssessments(existing)

        const requestedId = searchParams.get('assessmentId')
        const mode = searchParams.get('mode')

        if (mode === 'new' || existing.length === 0) {
          setViewMode('form')
          setSavedAssessment(null)
          setAssessmentDate(new Date().toISOString().split('T')[0])
          setAssessmentStage(existing.length === 0 ? 'Baseline / Initial Evaluation' : `Re-assessment (Session ${existing.length + 1})`)
        } else if (requestedId) {
          const matched = existing.find(a => a.id === requestedId) || existing[0]
          setSavedAssessment(matched)
          setViewMode('report')
          if (matched.data) setFormData(prev => ({ ...prev, ...matched.data }))
          if (matched.vas_score !== undefined && matched.vas_score !== null) setVasScore(Number(matched.vas_score))
          if (matched.type) setAssessmentType(matched.type)
          if (matched.assessment_date) setAssessmentDate(matched.assessment_date)
        } else {
          // Default to viewing latest assessment report
          const latest = existing[0]
          setSavedAssessment(latest)
          setViewMode('report')
          if (latest.data) setFormData(prev => ({ ...prev, ...latest.data }))
          if (latest.vas_score !== undefined && latest.vas_score !== null) setVasScore(Number(latest.vas_score))
          if (latest.type) setAssessmentType(latest.type)
          if (latest.assessment_date) setAssessmentDate(latest.assessment_date)
        }
      } catch (err) {
        console.error('Failed to load patient for assessment:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [patientId, searchParams])

  const setField = (key: string, val: any) => {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  const toggleCheck = (arrayKey: string, item: string) => {
    const list: string[] = formData[arrayKey] || []
    if (list.includes(item)) {
      setField(arrayKey, list.filter(i => i !== item))
    } else {
      setField(arrayKey, [...list, item])
    }
  }

  const handleStartNewAssessment = () => {
    setViewMode('form')
    setSavedAssessment(null)
    setAssessmentDate(new Date().toISOString().split('T')[0])
    setAssessmentStage(allAssessments.length === 0 ? 'Baseline / Initial Evaluation' : `Re-assessment (Session ${allAssessments.length + 1})`)
    setVasScore(5)
  }

  const handleSelectHistoricalAssessment = (ass: ClinicalAssessment) => {
    setSavedAssessment(ass)
    setViewMode('report')
    setVasScore(Number(ass.vas_score ?? 5))
    setAssessmentType(ass.type)
    if (ass.assessment_date) setAssessmentDate(ass.assessment_date)
    if (ass.data) setFormData(prev => ({ ...prev, ...ass.data }))
  }

  const handleSaveAssessment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!patient) return

    setSaving(true)
    try {
      // NOTE: We deliberately do NOT pass an id so saveAssessment creates a fresh, immutable
      // record for this assessment date without overwriting any prior assessment!
      const record = await saveAssessment({
        patient_id: patient.id,
        patient_uid: patient.uid,
        type: assessmentType,
        assessment_date: assessmentDate || new Date().toISOString().split('T')[0],
        doctor_id: profile?.id || null,
        doctor_name: profile?.name || formData.physio_name || 'Physiotherapist',
        vas_score: Number(vasScore),
        data: {
          ...formData,
          assessment_stage: assessmentStage,
          patient_name: patient.full_name,
          patient_phone: patient.phone,
          patient_age: patient.age,
          patient_gender: patient.gender,
          centre_name: (patient as any).centre_name || 'New Friends Colony, New Delhi',
        },
      })

      const refreshed = await getAssessments(patientId)
      setAllAssessments(refreshed)
      setSavedAssessment(record)
      setViewMode('report')

      toast({
        title: 'New Clinical Assessment Saved!',
        description: `Assessment logged for ${record.assessment_date}. Total assessments: ${refreshed.length}.`,
      })
    } catch (err) {
      toast({
        title: 'Error Saving Assessment',
        description: 'Failed to record clinical assessment.',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleWhatsAppShare = () => {
    if (!patient || !savedAssessment) return
    const stage = savedAssessment.data?.assessment_stage ? ` (${savedAssessment.data.assessment_stage})` : ''
    const assessmentUrl = getAssessmentPdfUrl(savedAssessment, patient)
    const vasVal = savedAssessment.vas_score !== null && savedAssessment.vas_score !== undefined ? `${savedAssessment.vas_score}/10` : 'N/A'
    const diagnosis = savedAssessment.data?.clinical_diagnosis || formData.clinical_diagnosis || 'Clinical evaluation recorded'
    const doctor = savedAssessment.doctor_name || (patient as any).primary_doctor_name || 'Dr. Clinical Specialist'
    const typeLabel = savedAssessment.type === 'physiotherapy' ? 'Physiotherapy Assessment' : 'Neurotherapy Assessment'

    const message = `*PHYSIONAUTICS CLINIC - CLINICAL ASSESSMENT REPORT*
----------------------------------------
*Patient:* ${patient.full_name} (${patient.uid})
*Type:* ${typeLabel}${stage}
*Date:* ${savedAssessment.assessment_date}
*Treating Doctor:* ${doctor}

*CLINICAL SUMMARY:*
* VAS Pain Score: ${vasVal}
* Diagnosis: ${diagnosis}

*VIEW & DOWNLOAD OFFICIAL PDF REPORT:*
${assessmentUrl}
----------------------------------------
Thank you for choosing Physionautics!
Contact: 08383936905`

    const phone = patient.phone.replace(/[^0-9]/g, '')
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
  }

  if (loading) {
    return (
      <div className="p-16 flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <p className="text-xs text-muted-foreground font-medium">Loading clinical assessment studio...</p>
      </div>
    )
  }

  if (!patient) {
    return (
      <div className="p-12 text-center space-y-3 max-w-md mx-auto">
        <p className="text-sm font-bold text-slate-700">Patient not found.</p>
        <Button onClick={() => router.push('/patients')} variant="outline" className="text-xs rounded-xl">
          Return to Patient Directory
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Breadcrumb & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link href={`/patients/${patient.id}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-bold mb-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Patient Profile
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Clinical Assessment Studio
          </h1>
          <p className="text-xs text-slate-500">
            Patient: <span className="font-bold text-slate-800">{patient.full_name}</span> ({patient.uid}) • {patient.age} Yrs • {patient.gender}
          </p>
        </div>

        {/* Assessment Type Toggle */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => setAssessmentType('physiotherapy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              assessmentType === 'physiotherapy' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🩺 Physiotherapy
          </button>
          <button
            type="button"
            onClick={() => setAssessmentType('neurotherapy')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              assessmentType === 'neurotherapy' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🧠 Neurotherapy
          </button>
        </div>
      </div>

      {/* Patient Assessment Journey & Date Selector */}
      {allAssessments.length > 0 && (
        <Card className="border-blue-200/80 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-3.5 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-blue-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
                {allAssessments.length}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                    Patient Assessment Journey
                  </h3>
                  <Badge variant="outline" className="text-[10px] bg-white text-blue-700 border-blue-300 font-bold">
                    {allAssessments.length} Total Assessment{allAssessments.length > 1 ? 's' : ''} Logged
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {allAssessments.length > 1 ? (
                    <>
                      Pain Trajectory: Initial <span className="font-bold text-rose-600">{allAssessments[allAssessments.length - 1].vas_score ?? 'N/A'}/10</span> ➔ Current <span className="font-bold text-emerald-600">{allAssessments[0].vas_score ?? 'N/A'}/10</span>
                      {allAssessments[allAssessments.length - 1].vas_score != null && allAssessments[0].vas_score != null && allAssessments[allAssessments.length - 1].vas_score! > allAssessments[0].vas_score! && (
                        <span className="ml-1.5 font-bold text-emerald-700">
                          ({Math.round(((allAssessments[allAssessments.length - 1].vas_score! - allAssessments[0].vas_score!) / allAssessments[allAssessments.length - 1].vas_score!) * 100)}% Pain Reduction)
                        </span>
                      )}
                    </>
                  ) : (
                    `Baseline initial evaluation recorded on ${allAssessments[0].assessment_date}`
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start md:self-center">
              <Button
                type="button"
                onClick={handleStartNewAssessment}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> + Log New Assessment
              </Button>
            </div>
          </div>

          {/* Date-wise Assessment Switcher Pills */}
          <div className="p-2.5 sm:px-4 flex items-center gap-2 overflow-x-auto scrollbar-none bg-white/70">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-600" /> Date-Wise Reports:
            </span>
            {allAssessments.map((ass, idx) => {
              const isSelected = viewMode === 'report' && savedAssessment?.id === ass.id
              const stageLabel = ass.data?.assessment_stage || (idx === allAssessments.length - 1 ? 'Baseline' : `Session ${allAssessments.length - idx}`)
              return (
                <button
                  key={ass.id}
                  type="button"
                  onClick={() => handleSelectHistoricalAssessment(ass)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-1.5 border ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs ring-2 ring-blue-500/30'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <span className="font-mono font-bold">{ass.assessment_date}</span>
                  <Badge className={`text-[9px] px-1 py-0 h-4 border-none font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {stageLabel}
                  </Badge>
                  <span className={`text-[10px] font-bold ${
                    isSelected ? 'text-amber-300' : 'text-rose-600'
                  }`}>
                    VAS {ass.vas_score ?? 'N/A'}/10
                  </span>
                </button>
              )
            })}
          </div>
        </Card>
      )}

      {/* If In Report Mode: Show Branded Report Preview */}
      {viewMode === 'report' && savedAssessment ? (
        <Card className="border-slate-200 shadow-xl rounded-3xl bg-white overflow-hidden print:shadow-none print:border-none">
          {/* Branded Print Header */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-blue-800/80">
            <div className="flex items-center gap-4">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt="Logo" className="h-12 max-w-[180px] object-contain bg-white/10 p-1.5 rounded-xl border border-white/20" />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md">
                  P
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                    Clinical Assessment Report
                  </Badge>
                  {savedAssessment.data?.assessment_stage && (
                    <Badge className="bg-purple-500/30 text-purple-200 border border-purple-400/30 text-[10px] font-bold px-2 py-0.5">
                      {savedAssessment.data.assessment_stage}
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-black text-white">{branding.clinicName || 'PHYSIONAUTICS PAIN REHABILITATION'}</h2>
                <p className="text-xs text-blue-200/80">{branding.tagline || 'Specialized Orthopedic, Spine & Neuro Rehabilitation'}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <Button 
                onClick={() => window.open(`${getAssessmentPdfUrl(savedAssessment, patient)}&print=true`, '_blank')} 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-bold gap-1.5 h-9 rounded-xl"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF
              </Button>
              <Button onClick={handleWhatsAppShare} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 h-9 rounded-xl shadow-sm">
                <MessageCircle className="w-3.5 h-3.5" /> Share PDF on WhatsApp
              </Button>
              <Button onClick={() => router.push(`/billing?patientId=${patient.id}`)} className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold gap-1.5 h-9 rounded-xl shadow-sm">
                <CreditCard className="w-3.5 h-3.5" /> Proceed to Billing
              </Button>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Patient Header Block */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Patient Name & UID</span>
                <span className="font-bold text-slate-900 text-sm block">{patient.full_name}</span>
                <span className="font-mono text-blue-600 font-bold">{patient.uid}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Age / Gender / Blood</span>
                <span className="font-semibold text-slate-800">{patient.age} Yrs • {patient.gender}</span>
                <span className="block text-slate-500">{patient.blood_group || 'Blood Group N/A'}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Assessment Date & Type</span>
                <span className="font-semibold text-slate-800 font-mono text-sm">{savedAssessment.assessment_date}</span>
                <span className="block font-bold text-purple-700 capitalize">{savedAssessment.type}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Consulting Specialist</span>
                <span className="font-bold text-slate-900">{savedAssessment.doctor_name || 'Dr. Clinical Specialist'}</span>
                <span className="block text-[11px] text-emerald-700 font-semibold">VAS Score: {savedAssessment.vas_score ?? 'N/A'}/10</span>
              </div>
            </div>

            {/* Assessment Details Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Box 1: Complaint & History */}
              <div className="p-4 border border-slate-200 rounded-2xl space-y-2 bg-white">
                <h3 className="font-extrabold text-blue-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b pb-1.5">
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Presenting Complaint & History
                </h3>
                <div>
                  <span className="font-bold text-slate-700">Main Complaint / Concern:</span>
                  <p className="text-slate-800 font-medium">{formData.main_problem || formData.diagnosis_condition || 'Not specified'}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Pain Description & Intensity:</span>
                  <p className="text-slate-800">{formData.pain_description || 'N/A'} (VAS Scale: {savedAssessment.vas_score ?? 'N/A'}/10)</p>
                </div>
                {formData.medical_history_checks?.length > 0 && (
                  <div>
                    <span className="font-bold text-slate-700">Medical History Conditions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.medical_history_checks.map((c: string) => (
                        <Badge key={c} variant="secondary" className="bg-slate-100 text-slate-700 text-[10px]">{c}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Box 2: Physical Exam & Diagnosis */}
              <div className="p-4 border border-slate-200 rounded-2xl space-y-2 bg-white">
                <h3 className="font-extrabold text-purple-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b pb-1.5">
                  <Activity className="w-3.5 h-3.5 text-purple-600" /> Physical Exam & Diagnosis
                </h3>
                <div>
                  <span className="font-bold text-slate-700">Clinical Diagnosis:</span>
                  <p className="text-slate-900 font-black text-sm">{formData.clinical_diagnosis || 'Clinical evaluation completed'}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Range of Motion (ROM) & MMT:</span>
                  <p className="text-slate-800">{formData.rom_findings || 'Normal limits'} | {formData.mmt_findings || 'N/A'}</p>
                </div>
                <div>
                  <span className="font-bold text-slate-700">Postural Findings:</span>
                  <p className="text-slate-800">{formData.posture_observation || 'Within functional limits'}</p>
                </div>
              </div>

              {/* Box 3: Treatment Plan & Modalities */}
              <div className="md:col-span-2 p-4 border border-slate-200 rounded-2xl space-y-2 bg-slate-50/50">
                <h3 className="font-extrabold text-emerald-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b pb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Prescribed Treatment Plan & Modalities
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="font-bold text-slate-700">Short-Term & Long-Term Rehabilitation Goals:</span>
                    <p className="text-slate-800">{formData.short_term_goals || 'Pain reduction & functional ROM restoration.'}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-700">Selected Treatment Modalities:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.treatment_modalities?.map((m: string) => (
                        <Badge key={m} className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] font-bold">{m}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Signature Line */}
            <div className="pt-6 border-t flex items-center justify-between text-xs text-slate-500">
              <div>
                <p className="font-bold text-slate-800">Physionautics Pain Rehabilitation Desk</p>
                <p className="text-[10px]">Verified Digital Assessment Document</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 font-mono">Dr. {formData.physio_name}</p>
                <p className="text-[10px]">Consulting Specialist Signature</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-3 pt-4 border-t print:hidden">
              <div className="flex items-center gap-2">
                <Button 
                  onClick={handleStartNewAssessment} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Log New Assessment
                </Button>
                <Button 
                  onClick={() => setViewMode('form')} 
                  variant="outline" 
                  className="text-xs text-slate-700 h-9 rounded-xl border-slate-300"
                >
                  Edit Answers
                </Button>
              </div>
              <Button onClick={() => router.push(`/billing?patientId=${patient.id}`)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-md gap-2">
                <CreditCard className="w-4 h-4" /> Create Invoice / Bill Now
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Assessment Form Input View */
        <Card className="border-slate-200 shadow-sm rounded-3xl bg-white">
          <CardHeader className="pb-4 border-b bg-slate-50/60">
            <div className="flex items-center justify-between">
              <div>
                <Badge className={assessmentType === 'physiotherapy' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                  {assessmentType === 'physiotherapy' ? '🩺 Physiotherapy Assessment' : '🧠 Neurotherapy Assessment'}
                </Badge>
                <CardTitle className="text-lg font-black text-slate-900 mt-1">
                  Complete Clinical Examination Form
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Record complaint details, medical history, physical exam findings, and treatment goals.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSaveAssessment} className="space-y-6 text-xs">
              
              {/* Assessment Session Meta: Date & Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl">
                <div className="space-y-1">
                  <Label className="font-bold text-blue-950 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" /> Assessment Date *
                  </Label>
                  <Input 
                    type="date" 
                    value={assessmentDate} 
                    onChange={e => setAssessmentDate(e.target.value)} 
                    className="h-10 text-xs rounded-xl bg-white font-medium text-slate-900"
                    required
                  />
                  <p className="text-[10px] text-slate-500">Every assessment is logged under this date into patient history.</p>
                </div>

                <div className="space-y-1">
                  <Label className="font-bold text-blue-950 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-blue-600" /> Assessment Stage / Purpose
                  </Label>
                  <select
                    value={assessmentStage}
                    onChange={e => setAssessmentStage(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded-xl border border-input bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Baseline / Initial Evaluation">Baseline / Initial Evaluation (Day 1)</option>
                    <option value="Interim Progress Check">Interim Progress Check (Session 3–5)</option>
                    <option value="Mid-treatment Re-assessment">Mid-treatment Re-assessment (Session 6–10)</option>
                    <option value="Discharge / Final Evaluation">Discharge / Final Evaluation</option>
                    <option value="Routine Follow-up Review">Routine Follow-up Review</option>
                  </select>
                  <p className="text-[10px] text-slate-500">Categorizes this report in the patient recovery timeline.</p>
                </div>
              </div>

              {/* Section 1: Presenting Complaint & VAS Pain Scale */}
              <div className="space-y-3">
                <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                  1. Presenting Complaint & Pain Score (VAS 0–10)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2 space-y-1">
                    <Label className="font-bold text-slate-700">Main Problem / Area of Concern *</Label>
                    <Input 
                      value={formData.main_problem} 
                      onChange={e => setField('main_problem', e.target.value)} 
                      placeholder="e.g. Cervical radiculopathy, lumbar disc herniation, post-stroke hemiparesis..." 
                      className="h-10 text-xs rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Onset Date / When started</Label>
                    <Input 
                      type="date" 
                      value={formData.onset_date} 
                      onChange={e => setField('onset_date', e.target.value)} 
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Visual Analog Pain Score (VAS 0–10)</Label>
                    <div className="flex items-center gap-3 bg-slate-50 p-2 border rounded-xl">
                      <input 
                        type="range" 
                        min={0} 
                        max={10} 
                        value={vasScore} 
                        onChange={e => setVasScore(Number(e.target.value))} 
                        className="w-full accent-blue-600"
                      />
                      <span className="font-black text-base text-blue-900 w-8 text-center">{vasScore}/10</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Pain Character / Description</Label>
                    <Input 
                      value={formData.pain_description} 
                      onChange={e => setField('pain_description', e.target.value)} 
                      placeholder="e.g. Sharp, Dull, Throbbing, Burning, Aching..." 
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Aggravating & Relieving Factors</Label>
                    <Input 
                      value={formData.aggravating_factors} 
                      onChange={e => setField('aggravating_factors', e.target.value)} 
                      placeholder="e.g. Worse on bending, relieved by rest & heat pack..." 
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Medical History Checkboxes */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                  2. Medical History & Pre-existing Conditions
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    'Diabetes', 'High Blood Pressure', 'Heart Condition', 
                    'Osteoporosis', 'Asthma/Breathing Issues', 'Epilepsy', 
                    'Recent Surgery', 'Fractures', 'Neurological Conditions', 'Cancer'
                  ].map(cond => (
                    <label key={cond} className="flex items-center gap-2 p-2 bg-slate-50 border rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={(formData.medical_history_checks || []).includes(cond)}
                        onChange={() => toggleCheck('medical_history_checks', cond)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-xs font-semibold text-slate-800">{cond}</span>
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Current Medications</Label>
                    <Input 
                      value={formData.current_medications} 
                      onChange={e => setField('current_medications', e.target.value)} 
                      placeholder="e.g. Muscle relaxants, NSAIDs..." 
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Known Allergies</Label>
                    <Input 
                      value={formData.allergies} 
                      onChange={e => setField('allergies', e.target.value)} 
                      placeholder="e.g. Latex allergy, NSAID sensitivity..." 
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Physical Examination & Range of Motion */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                  3. Physical Examination Findings (ROM & MMT)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Posture & Observation</Label>
                    <Input 
                      value={formData.posture_observation} 
                      onChange={e => setField('posture_observation', e.target.value)} 
                      placeholder="e.g. Forward head posture, antalgic pelvic tilt..." 
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Range of Motion (ROM)</Label>
                    <Input 
                      value={formData.rom_findings} 
                      onChange={e => setField('rom_findings', e.target.value)} 
                      placeholder="e.g. Cervical flexion restricted 30%, lumbar rotation painful..." 
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Muscle Strength Testing (MMT)</Label>
                    <Input 
                      value={formData.mmt_findings} 
                      onChange={e => setField('mmt_findings', e.target.value)} 
                      placeholder="e.g. Quadriceps Grade 4/5, Deltoid 3+/5..." 
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Special Tests & Palpation</Label>
                    <Input 
                      value={formData.special_tests} 
                      onChange={e => setField('special_tests', e.target.value)} 
                      placeholder="e.g. SLR Positive at 45 deg, Spurling test positive..." 
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Clinical Diagnosis & Treatment Goals */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                  4. Clinical Impression & Prescribed Modalities
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Clinical Diagnosis *</Label>
                    <Textarea 
                      value={formData.clinical_diagnosis} 
                      onChange={e => setField('clinical_diagnosis', e.target.value)} 
                      placeholder="e.g. L4-L5 Lumbar Disc Radiculopathy with Piriformis Tightness..." 
                      className="text-xs min-h-[60px] rounded-xl"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="font-bold text-slate-700">Short-Term & Long-Term Goals</Label>
                    <Input 
                      value={formData.short_term_goals} 
                      onChange={e => setField('short_term_goals', e.target.value)} 
                      placeholder="e.g. Reduce VAS pain score from 7 to 3 within 6 sessions..." 
                      className="h-10 text-xs rounded-xl"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="font-bold text-slate-700">Proposed Treatment Modalities</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(assessmentType === 'physiotherapy' ? [
                        'Manual Therapy', 'Electrotherapy', 'Exercise Therapy',
                        'Postural Training', 'Gait Training', 'Ergonomic Advice'
                      ] : [
                        'NDT (Neurodevelopmental)', 'PNF Techniques', 'Balance Training',
                        'Gait Retraining', 'Cognitive Rehab', 'Caregiver Education'
                      ]).map(mod => (
                        <label key={mod} className="flex items-center gap-2 p-2 bg-emerald-50/50 border border-emerald-200/80 rounded-xl cursor-pointer hover:bg-emerald-100/50 transition-colors">
                          <input 
                            type="checkbox" 
                            checked={(formData.treatment_modalities || []).includes(mod)}
                            onChange={() => toggleCheck('treatment_modalities', mod)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-xs font-bold text-emerald-950">{mod}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
                {allAssessments.length > 0 ? (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    onClick={() => {
                      setSavedAssessment(allAssessments[0])
                      setViewMode('report')
                    }} 
                    className="h-10 rounded-xl text-xs text-slate-600 gap-1 w-full sm:w-auto"
                  >
                    ← Back to Existing Reports ({allAssessments.length})
                  </Button>
                ) : (
                  <div />
                )}
                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <Button type="button" variant="outline" onClick={() => router.back()} className="h-11 rounded-xl text-xs">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 px-6 rounded-xl shadow-md gap-2">
                    <Save className="w-4 h-4" /> Save Clinical Assessment & Generate Report
                  </Button>
                </div>
              </div>

            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
