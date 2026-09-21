import { PatientReportCardView } from '@/components/patients/patient-report-card-view'
import { BottomNav } from '@/components/layout/bottom-nav'

export default function PatientReportCardPage() {
  return (
    <div className="min-h-screen bg-transparent text-slate-900 pb-20 md:pb-8">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <PatientReportCardView />
      </main>
      <BottomNav />
    </div>
  )
}
