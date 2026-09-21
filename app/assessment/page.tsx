import { AssessmentWizard } from '@/components/assessment/assessment-wizard'
import { TopHeaderNav } from '@/components/layout/top-header-nav'
import { BottomNav } from '@/components/layout/bottom-nav'

export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-transparent text-slate-900 pb-20 md:pb-8">
      <TopHeaderNav />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        <AssessmentWizard />
      </main>
      <BottomNav />
    </div>
  )
}
