'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, UserPlus, Users, Upload, Download, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getPatients, bulkImportPatients, exportPatientsToExcel } from '@/lib/data-store'
import { ExcelImporter, type ColumnDefinition } from '@/components/import/excel-importer'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import type { Patient } from '@/lib/supabase/types'

interface PatientRow extends Patient {
  last_visit?: string
  total_bills?: number
  total_amount?: number
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
  const [patients, setPatients] = useState<PatientRow[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [importOpen, setImportOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const patientData = await getPatients(query)
    setPatients(patientData as PatientRow[])
    setLoading(false)
  }, [query])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

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
    load()
  }

  const handleExport = () => {
    if (patients.length === 0) {
      toast({ title: 'No patient records to export', variant: 'destructive' })
      return
    }
    exportPatientsToExcel(patients)
    toast({ title: 'Patient directory exported to Excel!' })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Directory</h1>
          <p className="text-sm text-muted-foreground">{patients.length} registered patients</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-2 border-emerald-300 text-emerald-800 hover:bg-emerald-50" onClick={() => setImportOpen(true)}>
            <Upload className="h-4 w-4 text-emerald-600" /> Import Excel / CSV
          </Button>
          <Button variant="outline" className="gap-2" onClick={handleExport}>
            <Download className="h-4 w-4 text-blue-600" /> Export Excel
          </Button>
          <Button onClick={() => router.push('/patients/register')} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <UserPlus className="h-4 w-4" /> Register Patient
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9 bg-white"
          placeholder="Search by Patient UID, Full Name, or Phone number..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No patients found</p>
              <div className="flex justify-center gap-3 mt-4">
                <Button onClick={() => router.push('/patients/register')}>Register First Patient</Button>
                <Button variant="outline" onClick={() => setImportOpen(true)}>Import from Excel</Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left text-xs font-semibold text-muted-foreground">
                    <th className="px-4 py-3">Patient UID</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Age / Gender</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3 hidden md:table-cell">Blood Group</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Registered Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {patients.map(p => (
                    <tr 
                      key={p.id} 
                      className="hover:bg-gray-50/80 cursor-pointer transition-colors" 
                      onClick={() => router.push(`/patients/${p.id}`)}
                    >
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 font-semibold">{p.uid}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.age} yrs · {p.gender}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.phone}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.blood_group ?? '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                        {p.created_at ? formatDate(p.created_at) : '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button size="sm" variant="ghost" className="text-xs text-blue-600 hover:text-blue-800 gap-1">
                          View History <ArrowUpRight className="h-3 w-3" />
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