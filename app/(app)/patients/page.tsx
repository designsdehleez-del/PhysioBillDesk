'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Search, UserPlus, Users, Upload, Download, ArrowUpRight, 
  Building2, Calendar, Filter, X, RotateCcw, Clock, CheckCircle2 
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { getPatients, getCentres, getVisits, bulkImportPatients, exportPatientsToExcel, type StoredVisit } from '@/lib/data-store'
import { ExcelImporter, type ColumnDefinition } from '@/components/import/excel-importer'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import type { Patient, Centre } from '@/lib/supabase/types'

interface PatientRow extends Patient {
  last_visit?: string
  total_bills?: number
  total_amount?: number
  associated_centre_id?: string | null
  associated_centre_name?: string | null
}

const PATIENT_IMPORT_COLUMNS: ColumnDefinition[] = [
  { key: 'full_name', label: 'Full Name', required: true, example: 'Rohan Mehra' },
  { key: 'age', label: 'Age', required: true, example: 34 },
  { key: 'gender', label: 'Gender', required: true, example: 'Male' },
  { key: 'phone', label: 'Phone', required: true, example: '+91 98765 12345' },
  { key: 'email', label: 'Email', required: false, example: 'rohan@example.com' },
  { key: 'address', label: 'Address', required: false, example: 'Flat 402, Green Park' },
  { key: 'blood_group', label: 'Blood Group', required: false, example: 'O+' },
  { key: 'medical_notes', label: 'Medical Notes', required: false, example: 'Chronic lower back pain' },
]

export default function PatientListPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [allPatients, setAllPatients] = useState<PatientRow[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [visits, setVisits] = useState<StoredVisit[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [importOpen, setImportOpen] = useState(false)

  // Filtering state
  const [selectedCentre, setSelectedCentre] = useState<string>('all')
  const [timeframe, setTimeframe] = useState<'all' | 'today' | '7days' | '30days' | 'this_month' | 'custom'>('all')
  const [dateTarget, setDateTarget] = useState<'created_at' | 'last_visit'>('created_at')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [patientData, centreData, visitData] = await Promise.all([
        getPatients(),
        getCentres(),
        getVisits(),
      ])
      
      setCentres(centreData)
      setVisits(visitData)

      // Map visits to find patient's latest visit & primary clinic
      const patientVisitMap = new Map<string, { lastVisit: string; centreId?: string; centreName?: string; billCount: number; totalAmt: number }>()
      
      visitData.forEach(v => {
        if (!v.patient_id) return
        const existing = patientVisitMap.get(v.patient_id)
        const vDate = v.visit_date || v.created_at || ''
        const vAmt = v.total || 0

        if (!existing) {
          patientVisitMap.set(v.patient_id, {
            lastVisit: vDate,
            centreId: v.centre_id || undefined,
            centreName: v.centre_name || undefined,
            billCount: 1,
            totalAmt: vAmt,
          })
        } else {
          existing.billCount += 1
          existing.totalAmt += vAmt
          if (new Date(vDate) > new Date(existing.lastVisit)) {
            existing.lastVisit = vDate
            if (v.centre_id) existing.centreId = v.centre_id
            if (v.centre_name) existing.centreName = v.centre_name
          }
        }
      })

      const enrichedPatients: PatientRow[] = (patientData as PatientRow[]).map(p => {
        const visitInfo = patientVisitMap.get(p.id) || patientVisitMap.get(p.uid)
        return {
          ...p,
          last_visit: visitInfo?.lastVisit || p.created_at,
          total_bills: visitInfo?.billCount || 0,
          total_amount: visitInfo?.totalAmt || 0,
          associated_centre_id: visitInfo?.centreId || null,
          associated_centre_name: visitInfo?.centreName || null,
        }
      })

      setAllPatients(enrichedPatients)
    } catch (err) {
      console.error('Failed to load patient data:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtered patients calculation
  const filteredPatients = useMemo(() => {
    return allPatients.filter(patient => {
      // 1. Text Search query (UID, Name, Phone)
      if (query.trim()) {
        const lower = query.toLowerCase().trim()
        const matchesQuery = 
          patient.full_name.toLowerCase().includes(lower) ||
          patient.uid.toLowerCase().includes(lower) ||
          patient.phone.includes(lower) ||
          (patient.address && patient.address.toLowerCase().includes(lower))
        if (!matchesQuery) return false
      }

      // 2. Clinic / Centre Filter
      if (selectedCentre !== 'all') {
        const matchesCentre = 
          patient.associated_centre_id === selectedCentre ||
          visits.some(v => v.patient_id === patient.id && v.centre_id === selectedCentre)
        if (!matchesCentre) return false
      }

      // 3. Date Filter
      const targetDateStr = dateTarget === 'last_visit' ? (patient.last_visit || patient.created_at) : patient.created_at
      if (!targetDateStr) return true

      const pDate = new Date(targetDateStr)
      const now = new Date()

      if (timeframe === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        if (pDate < startOfDay) return false
      } else if (timeframe === '7days') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        if (pDate < sevenDaysAgo) return false
      } else if (timeframe === '30days') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        if (pDate < thirtyDaysAgo) return false
      } else if (timeframe === 'this_month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        if (pDate < startOfMonth) return false
      } else if (timeframe === 'custom') {
        if (customStartDate) {
          const start = new Date(customStartDate)
          if (pDate < start) return false
        }
        if (customEndDate) {
          const end = new Date(customEndDate)
          end.setHours(23, 59, 59, 999)
          if (pDate > end) return false
        }
      }

      return true
    })
  }, [allPatients, visits, query, selectedCentre, timeframe, dateTarget, customStartDate, customEndDate])

  const hasActiveFilters = selectedCentre !== 'all' || timeframe !== 'all' || query.trim() !== ''

  const clearFilters = () => {
    setSelectedCentre('all')
    setTimeframe('all')
    setQuery('')
    setCustomStartDate('')
    setCustomEndDate('')
  }

  const handleBulkImport = async (rows: Record<string, any>[]) => {
    const mapped: Partial<Patient>[] = rows.map(r => ({
      full_name: r.full_name || 'Patient',
      age: Number(r.age) || 30,
      gender: (['Male', 'Female', 'Other'].includes(r.gender) ? r.gender : 'Male') as Patient['gender'],
      phone: String(r.phone || '9999999999'),
      email: r.email ? String(r.email) : null,
      address: r.address ? String(r.address) : null,
      blood_group: (r.blood_group as Patient['blood_group']) || null,
      medical_notes: r.medical_notes ? String(r.medical_notes) : 'Imported via Excel spreadsheet',
    }))

    const count = await bulkImportPatients(mapped)
    toast({ title: `Successfully imported ${count} patients with generated UIDs!` })
    loadData()
  }

  const handleExport = () => {
    if (filteredPatients.length === 0) {
      toast({ title: 'No patient records to export', variant: 'destructive' })
      return
    }
    exportPatientsToExcel(filteredPatients)
    toast({ title: `Exported ${filteredPatients.length} patient records to Excel!` })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Patient Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing <span className="font-bold text-slate-800">{filteredPatients.length}</span> of {allPatients.length} registered patients
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2 border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs h-9 rounded-xl" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 text-emerald-600" /> Import Excel / CSV
          </Button>
          <Button variant="outline" className="gap-2 text-xs h-9 rounded-xl" onClick={handleExport}>
            <Download className="h-4 w-4 text-blue-600" /> Export Excel
          </Button>
          <Button onClick={() => router.push('/patients/register')} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 text-xs h-9 rounded-xl">
            <UserPlus className="h-4 w-4" /> Register Patient
          </Button>
        </div>
      </div>

      {/* Structured Filter Controls Bar */}
      <Card className="border-slate-200 shadow-2xs bg-white rounded-2xl overflow-visible relative z-20">
        <CardContent className="p-4 space-y-3">
          
          {/* Top Row: Search + Clinic Filter + Timeframe Filter */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="relative md:col-span-5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9 bg-slate-50 text-xs border-slate-200 rounded-xl h-10 focus-visible:ring-blue-600"
                placeholder="Search by Patient UID, Full Name, Phone..."
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Clinic / Centre Dropdown */}
            <div className="md:col-span-4">
              <Select value={selectedCentre} onValueChange={(val: string | null) => setSelectedCentre(val || 'all')}>
                <SelectTrigger className="bg-slate-50 border-slate-200 text-xs h-10 rounded-xl">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <SelectValue placeholder="All Clinics / Centres" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🏢 All Clinics & Centres</SelectItem>
                  {centres.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      📍 {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Timeframe Dropdown */}
            <div className="md:col-span-3">
              <Select value={timeframe} onValueChange={(val: any) => setTimeframe(val)}>
                <SelectTrigger className="bg-slate-50 border-slate-200 text-xs h-10 rounded-xl">
                  <div className="flex items-center gap-2 truncate">
                    <Calendar className="h-4 w-4 text-indigo-600 shrink-0" />
                    <SelectValue placeholder="All Time" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📅 All Time Records</SelectItem>
                  <SelectItem value="today">⚡ Registered / Visited Today</SelectItem>
                  <SelectItem value="7days">📆 Last 7 Days</SelectItem>
                  <SelectItem value="30days">🗓️ Last 30 Days</SelectItem>
                  <SelectItem value="this_month">📊 This Month</SelectItem>
                  <SelectItem value="custom">🛠️ Custom Date Range...</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* Bottom Filter Controls: Date Field Target Switcher & Custom Range inputs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
            
            {/* Target Date Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Filter By:</span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setDateTarget('created_at')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    dateTarget === 'created_at' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Registration Date
                </button>
                <button
                  type="button"
                  onClick={() => setDateTarget('last_visit')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    dateTarget === 'last_visit' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Last Visit Date
                </button>
              </div>
            </div>

            {/* Custom Date Range Pickers (only shown if custom selected) */}
            {timeframe === 'custom' && (
              <div className="flex items-center gap-2">
                <span className="text-slate-400">From:</span>
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={e => setCustomStartDate(e.target.value)}
                  className="h-8 text-xs bg-slate-50 border-slate-200 rounded-lg w-32"
                />
                <span className="text-slate-400">To:</span>
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={e => setCustomEndDate(e.target.value)}
                  className="h-8 text-xs bg-slate-50 border-slate-200 rounded-lg w-32"
                />
              </div>
            )}

            {/* Active Filter Chips & Clear Button */}
            {hasActiveFilters && (
              <div className="flex items-center gap-2 ml-auto">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                  {filteredPatients.length} Results
                </Badge>
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 text-xs text-slate-500 hover:text-red-600 gap-1 px-2">
                  <RotateCcw className="h-3 w-3" /> Clear Filters
                </Button>
              </div>
            )}

          </div>

        </CardContent>
      </Card>

      {/* Patient Table */}
      <Card className="border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredPatients.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-3">
              <Users className="h-10 w-10 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">No patients match the selected filter criteria</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Try clearing your search query or changing the clinic and timeframe filters.
              </p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters} className="mt-2 text-xs gap-1.5">
                  <RotateCcw className="h-3.5 w-3.5" /> Reset Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr className="text-left font-bold text-slate-600">
                    <th className="px-4 py-3.5">Patient UID</th>
                    <th className="px-4 py-3.5">Full Name</th>
                    <th className="px-4 py-3.5 hidden sm:table-cell">Age / Gender</th>
                    <th className="px-4 py-3.5">Phone</th>
                    <th className="px-4 py-3.5 hidden md:table-cell">Assigned Clinic</th>
                    <th className="px-4 py-3.5 hidden lg:table-cell">Registered Date</th>
                    <th className="px-4 py-3.5 hidden xl:table-cell">Last Visit</th>
                    <th className="px-4 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPatients.map(p => (
                    <tr 
                      key={p.id} 
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors" 
                      onClick={() => router.push(`/patients/${p.id}`)}
                    >
                      <td className="px-4 py-3.5 font-mono text-xs text-blue-600 font-bold">{p.uid}</td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{p.full_name}</td>
                      <td className="px-4 py-3.5 text-slate-600 hidden sm:table-cell">{p.age} yrs · {p.gender}</td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">{p.phone}</td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        {p.associated_centre_name ? (
                          <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200 text-[10px] font-semibold truncate max-w-[180px]">
                            📍 {p.associated_centre_name.split(',')[0]}
                          </Badge>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 hidden lg:table-cell">
                        {p.created_at ? formatDate(p.created_at) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 hidden xl:table-cell">
                        {p.last_visit ? formatDate(p.last_visit) : '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Button size="sm" variant="ghost" className="text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 gap-1 font-semibold">
                          View Details <ArrowUpRight className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Excel Bulk Importer Modal */}
      <ExcelImporter
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Patients via Excel / CSV"
        description="Download the template below, enter your patient records, and upload for instant bulk registration and UID assignment."
        templateFileName="Patients_Import"
        columns={PATIENT_IMPORT_COLUMNS}
        sampleRows={[
          { full_name: 'Amit Sharma', age: 42, gender: 'Male', phone: '+91 98123 00001', email: 'amit@example.com', address: '12 Model Town', blood_group: 'B+', medical_notes: 'Knee ligament strain' },
          { full_name: 'Sunita Patel', age: 29, gender: 'Female', phone: '+91 98123 00002', email: 'sunita@example.com', address: 'B-44 Civil Lines', blood_group: 'O+', medical_notes: 'Cervical spondylosis' },
        ]}
        onImport={handleBulkImport}
      />
    </div>
  )
}