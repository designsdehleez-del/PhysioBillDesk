'use client'
import { useEffect, useState, useCallback } from 'react'
import { Pencil, Trash2, Plus, UserCog, Upload, Download, Building2, Search, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { getDoctors, saveDoctor, deleteDoctor, toggleDoctorActive, bulkImportDoctors, getCentres, getVisits, getPatientFeedback, type StoredVisit } from '@/lib/data-store'
import { ExcelImporter, type ColumnDefinition } from '@/components/import/excel-importer'
import type { Doctor, Centre, PatientFeedback } from '@/lib/supabase/types'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { formatCurrency } from '@/lib/utils'

interface DoctorRow extends Doctor { 
  centreName?: string | null
  revenue?: number
  visitCount?: number
  avgRating?: string
}

const DOCTOR_IMPORT_COLUMNS: ColumnDefinition[] = [
  { key: 'name', label: 'Doctor Name', required: true, example: 'Dr. Ananya Roy' },
  { key: 'specialization', label: 'Specialization', required: true, example: 'Sports Rehabilitation' },
  { key: 'phone', label: 'Phone', required: false, example: '+91 98123 45678' },
  { key: 'email', label: 'Email', required: false, example: 'ananya@physionautics.com' },
  { key: 'centre_name', label: 'Centre Name', required: false, example: 'New Friends Colony, New Delhi' },
]

export default function DoctorsPage() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [doctors, setDoctors] = useState<DoctorRow[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [centreFilter, setCentreFilter] = useState('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', specialization: '', phone: '', email: '', centre_id: '' })

  const staffCentreId = profile?.centreId || (
    profile?.email === 'nfc@physionautics.com' ? 'c1111111-1111-1111-1111-111111111111' :
    profile?.email === 'vasantvihar@physionautics.com' ? 'c2222222-2222-2222-2222-222222222222' :
    profile?.email === 'gurugram@physionautics.com' ? 'c3333333-3333-3333-3333-333333333333' : null
  )

  const load = useCallback(async () => {
    setLoading(true)
    const effectiveFilter = !isAdmin && staffCentreId ? staffCentreId : centreFilter
    const [cList, dList, vList, fbList] = await Promise.all([
      getCentres(),
      getDoctors(effectiveFilter),
      getVisits(),
      getPatientFeedback(),
    ])
    setCentres(cList)

    const cMap = new Map(cList.map(c => [c.id, c.name]))
    setDoctors(dList.map(d => {
      const docRawName = d.name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
      const docVisits = vList.filter(v => {
        if (v.doctor_id && v.doctor_id === d.id) return true
        if (v.doctor_name) {
          const vDocName = v.doctor_name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
          return vDocName.includes(docRawName) || docRawName.includes(vDocName)
        }
        return false
      })
      const revenue = docVisits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)

      const docFeedbacks = fbList.filter(f => {
        if (!f.doctor_name) return false
        const fDocName = f.doctor_name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
        return fDocName.includes(docRawName) || docRawName.includes(fDocName)
      })
      const avgRating = docFeedbacks.length > 0 
        ? (docFeedbacks.reduce((s, f) => s + f.rating, 0) / docFeedbacks.length).toFixed(1)
        : '5.0'

      return {
        ...d,
        centreName: d.centre_id ? cMap.get(d.centre_id) ?? null : null,
        revenue,
        visitCount: docVisits.length,
        avgRating,
      }
    }))
    setLoading(false)
  }, [centreFilter, isAdmin, staffCentreId])

  useEffect(() => { load() }, [load])

  const visibleDoctors = !isAdmin && staffCentreId
    ? doctors.filter(d => d.centre_id === staffCentreId || (profile?.centreName && d.centreName === profile.centreName))
    : doctors

  const filteredDoctors = visibleDoctors.filter(d => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return d.name.toLowerCase().includes(q) || (d.specialization?.toLowerCase().includes(q))
  })

  const totalDoctorRevenue = doctors.reduce((sum, d) => sum + (d.revenue || 0), 0)
  const totalDoctorVisits = doctors.reduce((sum, d) => sum + (d.visitCount || 0), 0)

  const openAdd = () => {
    setEditing(null)
    setForm({ name: '', specialization: '', phone: '', email: '', centre_id: centres[0]?.id ?? '' })
    setDialogOpen(true)
  }

  const openEdit = (d: Doctor) => {
    setEditing(d)
    setForm({ name: d.name, specialization: d.specialization ?? '', phone: d.phone ?? '', email: d.email ?? '', centre_id: d.centre_id ?? '' })
    setDialogOpen(true)
  }

  const save = async () => {
    if (!form.name.trim() || !form.specialization.trim()) {
      toast({ title: 'Name and Specialization are required', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      await saveDoctor({
        ...(editing ? { id: editing.id } : {}),
        name: form.name.trim(),
        specialization: form.specialization.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        centre_id: form.centre_id || null,
      })
      toast({ title: editing ? 'Doctor updated' : 'Doctor created' })
      setDialogOpen(false)
      load()
    } catch (err: unknown) {
      toast({ title: 'Failed to save doctor', description: err instanceof Error ? err.message : 'Unknown error', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (d: Doctor) => {
    await toggleDoctorActive(d.id)
    toast({ title: `Doctor marked as ${!d.is_active ? 'active' : 'inactive'}` })
    load()
  }

  const doDelete = async () => {
    if (!deleteId) return
    await deleteDoctor(deleteId)
    toast({ title: 'Doctor deleted' })
    setDeleteId(null)
    load()
  }

  const handleBulkImport = async (rows: Record<string, any>[]) => {
    const validDoctors: Partial<Doctor>[] = rows.map(r => {
      let matchedCentreId: string | null = null
      if (r.centre_name) {
        const found = centres.find(c => c.name.toLowerCase().includes(String(r.centre_name).toLowerCase().trim()))
        if (found) matchedCentreId = found.id
      }
      return {
        name: String(r.name || '').trim(),
        specialization: String(r.specialization || '').trim(),
        phone: r.phone ? String(r.phone).trim() : null,
        email: r.email ? String(r.email).trim() : null,
        centre_id: matchedCentreId || centres[0]?.id || null,
      }
    }).filter(d => d.name && d.specialization)

    if (validDoctors.length === 0) {
      toast({ title: 'No valid doctor rows found to import', variant: 'destructive' })
      return
    }

    const count = await bulkImportDoctors(validDoctors)
    toast({ title: `Successfully imported and tagged ${count} doctors` })
    load()
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900">Doctor Directory & Tagging</h1>
            <Badge className="bg-purple-600 text-white text-xs">{isAdmin ? 'Admin View' : 'Clinic Desk'}</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">Manage doctor profiles and assign them to specific clinic centres</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1.5" onClick={() => setImportOpen(true)}>
            <Download className="h-4 w-4" /> 📥 Import Excel / CSV
          </Button>
          <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5">
            <Plus className="h-4 w-4" /> Add Doctor
          </Button>
        </div>
      </div>

      {/* Admin Quick Performance Metric Cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border shadow-xs bg-gradient-to-br from-white to-blue-50/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Total Doctors</p>
                <p className="text-2xl font-extrabold text-blue-950">{doctors.length}</p>
                <p className="text-[10px] text-blue-700 font-medium">Across {centres.length} branches</p>
              </div>
              <div className="p-2.5 bg-blue-600 text-white rounded-xl">
                <UserCog className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs bg-gradient-to-br from-white to-emerald-50/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Doctor-Attributed Revenue</p>
                <p className="text-2xl font-extrabold text-emerald-950">{formatCurrency(totalDoctorRevenue)}</p>
                <p className="text-[10px] text-emerald-700 font-medium">{totalDoctorVisits} billed consultations</p>
              </div>
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                <Building2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs bg-gradient-to-br from-white to-purple-50/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase text-muted-foreground">Top Consultant Earner</p>
                <p className="text-base font-extrabold text-purple-950 truncate max-w-[180px]">
                  {doctors.slice().sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0]?.name || '—'}
                </p>
                <p className="text-[10px] text-purple-700 font-bold">
                  {formatCurrency(doctors.slice().sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0]?.revenue || 0)}
                </p>
              </div>
              <div className="p-2.5 bg-purple-600 text-white rounded-xl">
                <Badge className="bg-white text-purple-900 text-xs font-extrabold">👑 #1</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search doctors by name or specialization…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={centreFilter} onValueChange={(v: string | null) => setCentreFilter(v ?? 'all')}>
              <SelectTrigger className="w-56 bg-white"><SelectValue placeholder="All Centres" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Centres ({doctors.length})</SelectItem>
                {centres.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctor List Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Loading doctors…</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No doctors found. Click &quot;Add Doctor&quot; or import from Excel.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-left text-xs font-semibold text-muted-foreground">
                    <th className="px-4 py-3">Doctor Name</th>
                    <th className="px-4 py-3">Specialization</th>
                    <th className="px-4 py-3">Clinic Centre</th>
                    {isAdmin && <th className="px-4 py-3 text-right">Revenue Generated</th>}
                    <th className="px-4 py-3 text-center">CSAT</th>
                    <th className="px-4 py-3 hidden md:table-cell">Contact Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredDoctors.map(d => (
                    <tr key={d.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900">{d.name}</td>
                      <td className="px-4 py-3 text-gray-700">{d.specialization ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/60 font-medium flex items-center gap-1 w-fit">
                          <Building2 className="h-3 w-3" /> {d.centreName ?? 'New Friends Colony, New Delhi'}
                        </Badge>
                      </td>
                      {isAdmin && (
                        <td className="px-4 py-3 text-right">
                          <span className="font-extrabold text-emerald-700 block">{formatCurrency(d.revenue || 0)}</span>
                          <span className="text-[10px] text-muted-foreground block">{d.visitCount || 0} visits</span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-bold">
                          ⭐ {d.avgRating}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{d.phone ?? '—'}</td>
                      <td className="px-4 py-3">
                        <Switch checked={d.is_active} onCheckedChange={() => toggleActive(d)} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(d)} title="Edit Doctor">
                          <Pencil className="h-4 w-4 text-gray-600" />
                        </Button>
                        {isAdmin && (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(d.id)} title="Delete Doctor">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Doctor Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Doctor Profile' : 'Add New Doctor'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Doctor Full Name *</Label>
              <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Dr. Rajesh Sharma" />
            </div>
            <div className="space-y-1">
              <Label>Specialization *</Label>
              <Input value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} placeholder="e.g. Spine Rehabilitation" />
            </div>
            <div className="space-y-1">
              <Label>Tagged Clinic Centre *</Label>
              <Select value={form.centre_id} onValueChange={(v: string | null) => setForm(p => ({ ...p, centre_id: v ?? '' }))}>
                <SelectTrigger><SelectValue placeholder="Select centre" /></SelectTrigger>
                <SelectContent>
                  {centres.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Contact Phone</Label>
              <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98111 00000" />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="doctor@physionautics.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Saving…' : editing ? 'Update Doctor' : 'Save Doctor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Excel Bulk Importer Modal */}
      <ExcelImporter
        open={importOpen}
        onOpenChange={setImportOpen}
        title="Import Doctors via Excel / CSV"
        description="Download the template below, enter your doctor profiles with clinic names, and upload for automatic branch tagging."
        templateFileName="Doctors_Import"
        columns={DOCTOR_IMPORT_COLUMNS}
        sampleRows={[
          { name: 'Dr. Neha Verma', specialization: 'Pediatric Physiotherapy', phone: '+91 98765 00001', email: 'neha@physio.com', centre_name: 'New Friends Colony, New Delhi' },
          { name: 'Dr. Arjun Kapoor', specialization: 'Sports Medicine & Rehab', phone: '+91 98765 00002', email: 'arjun@physio.com', centre_name: 'Vasant Vihar, New Delhi' },
          { name: 'Dr. Priya Nair', specialization: 'Cardiorespiratory Rehab', phone: '+91 98765 00003', email: 'priya@physio.com', centre_name: 'Gurugram – DLF Phase 1' },
        ]}
        onImport={handleBulkImport}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Doctor?</AlertDialogTitle>
            <AlertDialogDescription>This will remove the doctor from clinic billing and scheduling.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}