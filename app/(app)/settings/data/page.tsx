'use client'
import { useState, useEffect } from 'react'
import { 
  Database, Sparkles, Trash2, Download, RefreshCw, 
  CheckCircle2, AlertTriangle, ShieldCheck, Users, Receipt, 
  Star, Building2, UserCog, Stethoscope, ArrowRight, FileSpreadsheet
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  getPatients, 
  getVisits, 
  getPatientFeedback, 
  getCentres, 
  getDoctors, 
  getServices,
  seedDemoData, 
  clearDemoData, 
  resetToCleanSlate, 
  exportFullDatabaseBackup 
} from '@/lib/data-store'

export default function DataManagementPage() {
  const [patientCount, setPatientCount] = useState(0)
  const [visitCount, setVisitCount] = useState(0)
  const [feedbackCount, setFeedbackCount] = useState(0)
  const [centreCount, setCentreCount] = useState(0)
  const [doctorCount, setDoctorCount] = useState(0)
  const [serviceCount, setServiceCount] = useState(0)

  const [actionLoading, setActionLoading] = useState(false)
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'warn'; message: string } | null>(null)

  const loadCounts = async () => {
    const [p, v, f, c, d, s] = await Promise.all([
      getPatients(),
      getVisits(),
      getPatientFeedback(),
      getCentres(),
      getDoctors(),
      getServices(),
    ])
    setPatientCount(p.length)
    setVisitCount(v.length)
    setFeedbackCount(f.length)
    setCentreCount(c.length)
    setDoctorCount(d.length)
    setServiceCount(s.length)
  }

  useEffect(() => {
    loadCounts()
  }, [])

  const handleSeed = async () => {
    setActionLoading(true)
    setActionNotice(null)
    try {
      const res = await seedDemoData()
      await loadCounts()
      setActionNotice({
        type: 'success',
        message: `Successfully populated ${res.patients} demo patients, ${res.visits} multi-clinic bills, and ${res.feedback} patient reviews!`,
      })
    } catch (err: any) {
      setActionNotice({ type: 'warn', message: 'Failed to populate demo data: ' + err.message })
    } finally {
      setActionLoading(false)
    }
  }

  const handleClearDemo = async () => {
    if (!confirm('Are you sure you want to remove demo records? Any real records created will be preserved.')) return
    setActionLoading(true)
    setActionNotice(null)
    try {
      await clearDemoData()
      await loadCounts()
      setActionNotice({
        type: 'success',
        message: 'Demo records successfully removed from active database.',
      })
    } catch (err: any) {
      setActionNotice({ type: 'warn', message: 'Error clearing demo records: ' + err.message })
    } finally {
      setActionLoading(false)
    }
  }

  const handleResetAll = async () => {
    if (!confirm('CAUTION: This will wipe all patient, billing, and feedback records to a completely fresh state. Are you sure?')) return
    setActionLoading(true)
    setActionNotice(null)
    try {
      await resetToCleanSlate()
      await loadCounts()
      setActionNotice({
        type: 'success',
        message: 'System database successfully reset to a clean production state!',
      })
    } catch (err: any) {
      setActionNotice({ type: 'warn', message: 'Error resetting database: ' + err.message })
    } finally {
      setActionLoading(false)
    }
  }

  const handleExportBackup = async () => {
    setActionLoading(true)
    try {
      await exportFullDatabaseBackup()
      setActionNotice({
        type: 'success',
        message: 'Complete multi-sheet Excel backup downloaded to your computer!',
      })
    } catch (err: any) {
      setActionNotice({ type: 'warn', message: 'Export failed: ' + err.message })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-purple-50/80 border border-purple-200 p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-600 text-white font-medium gap-1">
              <Database className="h-3 w-3" /> System Governance
            </Badge>
            <span className="text-xs text-purple-900 font-semibold">Data Operations & Backup</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Database Management & Demo Tools</h1>
          <p className="text-xs text-muted-foreground">
            Populate rich clinical demo data to preview dashboard analytics, backup records to Excel, or reset to a clean production slate.
          </p>
        </div>

        <Button
          variant="outline"
          className="bg-white border-purple-300 text-purple-800 hover:bg-purple-100 gap-1.5 text-xs h-9 shadow-xs"
          onClick={handleExportBackup}
          disabled={actionLoading}
        >
          <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export Full System Backup (.xlsx)
        </Button>
      </div>

      {/* Notice Alert */}
      {actionNotice && (
        <div className={`p-4 rounded-xl border text-xs flex items-center gap-2.5 animate-fadeIn ${
          actionNotice.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-950 font-medium' : 'bg-amber-50 border-amber-200 text-amber-950 font-medium'
        }`}>
          {actionNotice.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          )}
          <span>{actionNotice.message}</span>
        </div>
      )}

      {/* Live Record Counts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="border shadow-2xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Users className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Patients</p>
              <p className="text-lg font-extrabold text-gray-900">{patientCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><Receipt className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Invoices</p>
              <p className="text-lg font-extrabold text-gray-900">{visitCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><Star className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Reviews</p>
              <p className="text-lg font-extrabold text-gray-900">{feedbackCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Building2 className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Centres</p>
              <p className="text-lg font-extrabold text-gray-900">{centreCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg"><UserCog className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Doctors</p>
              <p className="text-lg font-extrabold text-gray-900">{doctorCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-2xs">
          <CardContent className="p-3.5 flex items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg"><Stethoscope className="h-4 w-4" /></div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Services</p>
              <p className="text-lg font-extrabold text-gray-900">{serviceCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Seed Demo Data Card */}
        <Card className="shadow-sm border border-emerald-200 bg-gradient-to-b from-white to-emerald-50/20 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-900">Populate Demo Data</CardTitle>
                <CardDescription className="text-xs">Instant clinical analytics showcase</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 text-xs text-muted-foreground">
            <p className="leading-relaxed">
              Populates <strong>10 realistic physiotherapy patients</strong>, <strong>14 multi-centre billed invoices</strong> spanning the last 7 days across New Friends Colony, Vasant Vihar, and Gurugram, and <strong>6 authentic 5-star patient reviews</strong>.
            </p>
            <ul className="space-y-1 text-gray-700 font-medium list-disc list-inside text-[11px]">
              <li>Brings revenue trendline and charts to life</li>
              <li>Populates payment modes & top procedures</li>
              <li>Safe to test and can be deleted anytime</li>
            </ul>
          </CardContent>
          <div className="p-4 pt-0">
            <Button
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm h-9"
              onClick={handleSeed}
              disabled={actionLoading}
            >
              <Sparkles className="h-4 w-4" /> Populate Demo Data
            </Button>
          </div>
        </Card>

        {/* 2. Delete Demo Data Card */}
        <Card className="shadow-sm border border-amber-200 bg-gradient-to-b from-white to-amber-50/20 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-900">Purge Demo Records</CardTitle>
                <CardDescription className="text-xs">Keep real patient entries intact</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 text-xs text-muted-foreground">
            <p className="leading-relaxed">
              Deletes all demo-generated patient, billing, and review records while <strong>preserving any real clinical data</strong> entered by your reception team.
            </p>
            <p className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200 font-medium">
              💡 Use this once you are done evaluating dashboards and want to start entering real clinic patients.
            </p>
          </CardContent>
          <div className="p-4 pt-0">
            <Button
              variant="outline"
              className="w-full border-amber-300 text-amber-800 hover:bg-amber-100 font-bold text-xs gap-1.5 h-9"
              onClick={handleClearDemo}
              disabled={actionLoading}
            >
              <Trash2 className="h-4 w-4" /> Delete Demo Records
            </Button>
          </div>
        </Card>

        {/* 3. Clean Production Slate */}
        <Card className="shadow-sm border border-red-200 bg-gradient-to-b from-white to-red-50/20 flex flex-col justify-between">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 text-red-700 rounded-lg">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm font-bold text-gray-900">Reset to Clean Slate</CardTitle>
                <CardDescription className="text-xs">Blank database for clinic launch</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 flex-1 text-xs text-muted-foreground">
            <p className="leading-relaxed">
              Completely clears all patient directory records, invoices, and review logs. Centres, doctors, and services catalogs will remain safely preserved.
            </p>
            <p className="text-[11px] text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-200 font-medium">
              ⚠️ Permanent action. We recommend downloading an Excel backup before resetting.
            </p>
          </CardContent>
          <div className="p-4 pt-0">
            <Button
              variant="destructive"
              className="w-full font-bold text-xs gap-1.5 h-9 shadow-xs"
              onClick={handleResetAll}
              disabled={actionLoading}
            >
              <RefreshCw className="h-4 w-4" /> Reset Database to Empty
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
