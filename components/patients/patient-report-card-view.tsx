'use client'

import { useState } from 'react'
import { 
  FileText, Calendar, Activity, User, ArrowUp, 
  ChevronRight, Lightbulb, CheckCircle2, ShieldAlert
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function PatientReportCardView() {
  const [activeTab, setActiveTab] = useState<'assessment' | 'sessions' | 'medical' | 'summary'>('assessment')

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Title Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Patient Report Card
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Complete overview of your treatment journey
        </p>
      </div>

      {/* Patient Header Card */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
              alt="Priya Sharma"
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-slate-900">Priya Sharma</h2>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  Active Patient
                </Badge>
              </div>
              <p className="text-xs font-semibold text-slate-500">Patient ID: PN-10224</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                <span>Age: 32</span>
                <span>•</span>
                <span>Gender: Female</span>
                <span>•</span>
                <span>+91 98765 43210</span>
                <span>•</span>
                <span className="text-blue-600 font-medium">Indira Nagar Clinic</span>
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
          <Calendar className="w-4 h-4" /> Sessions Attended
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
                <p className="text-xs text-slate-500">Last Updated: 12 Apr 2025</p>
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
                <span className="text-2xl font-extrabold text-slate-900">6</span>
                <span className="text-xs text-slate-400 font-semibold">/ 10</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full w-[60%]" />
              </div>
            </div>

            {/* Mobility Score */}
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
              <span className="text-xs font-medium text-slate-500">Mobility Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">68</span>
                <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full w-[68%]" />
              </div>
            </div>

            {/* Functional Score */}
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-3">
              <span className="text-xs font-medium text-slate-500">Functional Score</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-extrabold text-slate-900">72</span>
                <span className="text-xs text-slate-400 font-semibold">/ 100</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[72%]" />
              </div>
            </div>
          </div>

          {/* Key Findings & Progress Box */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 p-4 bg-slate-50/70 border border-slate-200/60 rounded-2xl space-y-2">
              <h4 className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <TargetIcon /> Key Findings
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-600 pl-4 list-disc">
                <li>Reduced pain and improved range of motion in lower back.</li>
                <li>Core strength and flexibility showing progress.</li>
                <li>Still limited in prolonged sitting (&gt; 30 mins) and forward bending.</li>
              </ul>
            </div>

            <div className="lg:col-span-4 p-5 bg-blue-50/80 border border-blue-100 rounded-2xl text-center space-y-1">
              <span className="text-xs font-medium text-slate-500">Progress</span>
              <div className="flex items-center justify-center gap-1 text-2xl font-extrabold text-emerald-600">
                <ArrowUp className="w-6 h-6 stroke-[3]" />
                <span>+28%</span>
              </div>
              <p className="text-[11px] text-slate-500">since first session</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Attended Section */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Sessions Attended</h3>
                <p className="text-xs text-slate-500">Total Sessions: 8 • Last Session: Thu, 17 Apr 2025</p>
              </div>
            </div>

            <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs px-4 py-2 rounded-xl flex items-center gap-1 font-semibold">
              View All Sessions <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-2">
            <div className="md:col-span-7 space-y-2 p-4 bg-slate-50 border border-slate-200/60 rounded-2xl">
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-extrabold text-slate-900">8 / 12</span>
                <span className="text-xs text-slate-500 font-medium">Sessions Completed</span>
              </div>
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[66%]" />
              </div>
            </div>

            <div className="md:col-span-5 p-4 border border-slate-200/60 rounded-2xl flex items-center justify-between bg-white">
              <div>
                <span className="text-[11px] font-medium text-slate-400 block">Next Session</span>
                <span className="text-xs font-bold text-slate-900 block mt-0.5">Thu, 24 Apr 2025</span>
              </div>
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-600" /> Scheduled
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical History Section */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Activity className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Medical History</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-1">
              <span className="text-[11px] font-medium text-slate-400 block">Conditions</span>
              <p className="text-xs font-bold text-slate-800">Knee Pain (Right) • Mild Arthritis</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-1">
              <span className="text-[11px] font-medium text-slate-400 block">Allergies</span>
              <p className="text-xs font-bold text-slate-800">None</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl space-y-1">
              <span className="text-[11px] font-medium text-slate-400 block">Medications</span>
              <p className="text-xs font-bold text-slate-800">Ibuprofen (as needed)</p>
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
            <h4 className="text-xs font-bold text-slate-900">Keep up the good work, Priya!</h4>
            <p className="text-[11px] text-slate-600">Your consistency is helping you recover faster. Stay active and follow your exercise plan.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TargetIcon() {
  return (
    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  )
}
