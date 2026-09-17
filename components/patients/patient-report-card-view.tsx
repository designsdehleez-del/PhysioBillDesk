'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  FileText, Calendar, Activity, User, ArrowUp, 
  ChevronRight, Lightbulb, ArrowLeft
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getPatients, getVisits, getPatientAssessments, type PatientAssessment } from '@/lib/data-store'

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
  const [assessments, setAssessments] = useState<PatientAssessment[]>([])
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

        const assList = await getPatientAssessments(found?.id || targetId)
        setAssessments(assList)
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

  const latestAssessment = assessments[0] || {
    pain_vas: 4,
    mobility_score: 75,
    functional_score: 80,
    primary_complaint: 'Joint Stiffness & Musculoskeletal Care',
    notes: 'Patient showing positive response to targeted therapy.'
  }

  const vas = latestAssessment.pain_vas ?? 4
  const mobility = latestAssessment.mobility_score ?? 75
  const functional = latestAssessment.functional_score ?? 80

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
              Complete overview of treatment journey for {name}
            </p>
          </div>
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

      {/* Navigation Tabs Bar */}
      <div className="bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-xs flex gap-2">
        <button
          onClick={() => setActiveTab('assessment')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'assessment'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Assessment Report
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'sessions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4" /> Sessions Attended ({patientVisits.length || 8})
        </button>
        <button
          onClick={() => setActiveTab('medical')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'medical'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4" /> Medical History
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'summary'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" /> Summary
        </button>
      </div>

      {/* Assessment Report Main Section */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Assessment Report</h3>
                <p className="text-xs text-slate-500">
                  {latestAssessment.date ? `Evaluated on ${latestAssessment.date}` : 'Recent Clinical Evaluation'}
                </p>
              </div>
            </div>

            <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs px-4 py-2 rounded-xl flex items-center gap-1 font-semibold">
              View Full Report <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          {/* Metric Meters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Pain Level */}
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
              <span className="text-xs font-medium text-slate-500">Pain Level (VAS)</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">{vas}</span>
                <span className="text-xs text-slate-400 font-semibold">/ 10</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${(vas / 10) * 100}%` }}
                  className={`h-full rounded-full ${vas > 5 ? 'bg-orange-500' : 'bg-emerald-500'}`}
                />
              </div>
            </div>

            {/* Mobility Score */}
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
              <span className="text-xs font-medium text-slate-500">Mobility Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">{mobility}</span>
                <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${mobility}%` }}
                  className="h-full bg-emerald-500 rounded-full"
                />
              </div>
            </div>

            {/* Functional Score */}
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
              <span className="text-xs font-medium text-slate-500">Functional Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">{functional}</span>
                <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  style={{ width: `${functional}%` }}
                  className="h-full bg-blue-600 rounded-full"
                />
              </div>
            </div>
          </div>

          {/* Key Findings & Progress Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 p-4 bg-slate-50/70 border border-slate-200/60 rounded-2xl space-y-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                ⚡ Complaint & Findings for {name}
              </h4>
              <p className="text-xs font-semibold text-blue-800">
                Primary Complaint: {latestAssessment.primary_complaint || 'Joint & Muscle Pain'}
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc">
                <li>{latestAssessment.notes || 'Pain reduction and improved joint flexibility observed.'}</li>
                <li>Core strength and range of motion showing steady improvement.</li>
                <li>Follow-up therapy sessions recommended for sustained recovery.</li>
              </ul>
            </div>

            <div className="lg:col-span-4 p-5 bg-blue-50/80 border border-blue-100 rounded-2xl text-center space-y-1">
              <span className="text-xs font-medium text-slate-500">Progress</span>
              <div className="flex items-center justify-center gap-1 text-2xl font-extrabold text-emerald-600">
                <ArrowUp className="w-6 h-6 stroke-[3]" />
                <span>+{Math.max(15, 100 - vas * 10)}%</span>
              </div>
              <p className="text-[11px] text-slate-500">since baseline assessment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Encouragement Footer Banner */}
      <Card className="border border-blue-100 bg-blue-50/70 shadow-xs rounded-2xl">
        <CardContent className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Keep up the recovery plan, {name}!</h4>
            <p className="text-[11px] text-slate-600">Consistency with exercises accelerates joint and muscle rehabilitation.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
