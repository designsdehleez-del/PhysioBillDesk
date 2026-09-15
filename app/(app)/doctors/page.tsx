'use client'
import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, UserCog, Upload, Building2, Search, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { getDoctors, saveDoctor, deleteDoctor, toggleDoctorActive, bulkImportDoctors, getCentres } from '@/lib/data-store'
import { ExcelImporter, type ColumnDefinition } from '@/components/import/excel-importer'
import type { Doctor, Centre } from '@/lib/supabase/types'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'

interface DoctorRow extends Doctor { centreName?: string }

const DOCTOR_IMPORT_COLUMNS: ColumnDefinition[] = [
  { key: 'name', label: 'Doctor Name', required: true, example: 'Dr. Ananya Roy' },
  { key: 'specialization', label: 'Specialization', required: true, example: 'Sports Rehabilitation' },
  { key: 'phone', label: 'Phone', required: false, example: '+91 98123 45678' },
  { key: 'email', label: 'Email', required: false, example: 'ananya@physionautics.com' },
  { key: 'centre_name', label: 'Centre Name', required: false, example: 'Downtown Clinic (Centre 1)' },
]

export default function DoctorsPage() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [doctors, setDoctors] = useState<DoctorRow[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCentreFilter, setSelectedCentreFilter] = useState<string>('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [form, setForm] = useState({ name: '', specialization: '', phone: '', email: '', centre_id: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const [cList, dList] = await Promise.all([
      getCentres(),
      getDoctors(isAdmin ? (selectedCentreFilter === 'all' ? undefined : selectedCentreFilter) : profile?.centreId),
    ])

    const centreMap = Object.fromEntries(cList.map(x => [x.id, x.name]))
    setCentres(cList)
    setDoctors(dList.map(doc => ({
      ...doc,
      centreName: doc.centre_id ? centreMap[doc.centre_id] : 'All Centres (Visiting)',
    })))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [selectedCentreFilter, profile])

  const openAdd = () => {
    setEditing(null)
    setForm({
      name: '',
      specialization: '',
      phone: '',
      email: '',
      centre_id: (!isAdmin && profile?.centreId) ? profile.centreId : (centres[0]?.id || ''),
    })
    setDialogOpen(true)
  }

  const openEdit = (d: Doctor) => {
    setEditing(d)
    setForm({
      name: d.name,
      specialization: d.specialization ?? '',
      phone: d.phone ?? '',
      email: d.email ?? '',
      centre_id: d.centre_id ?? '',
    })
    setDialogOpen(true)
  }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await saveDoctor({
      id: editing ? editing.id : undefined,
      name: form.name.trim(),
      specialization: form.specialization || null,
      phone: form.phone || null,
      email: form.email || null,
      centre_id: form.centre_id || null,
    })
    toast({ title: editing ? 'Doctor profile updated' : 'New doctor added successfully' })
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  const toggleActive = async (d: Doctor) => {
    await toggleDoctorActive(d.id)
    toast({ title: `Doctor ${!d.is_active ? 'activated' : 'deactivated'}` })
    load()
  }

  const doDelete = async () => {
    if (!deleteId) return
    await deleteDoctor(deleteId)
    toast({ title: 'Doctor removed', variant: 'destructive' })
    setDeleteId(null)
    load()
  }

  const handleBulkImport = async (rows: Record<string, any>[]) => {
    const cList = await getCentres()
    const mappedDoctors: Partial<Doctor>[] = rows.map(r => {
      let matchedCentreId: string | null = null
      if (r.centre_name) {
        const found = cList.find(c => 
          c.name.toLowerCase().includes(String(r.centre_name).toLowerCase().trim()) ||
          String(r.centre_name).toLowerCase().includes(c.name.toLowerCase().trim())
        )
        if (found) matchedCentreId = found.id
      }
      return {
        name: r.name ? (String(r.name).startsWith('Dr.') ? String(r.name) : `Dr. ${r.name}`) : 'Dr. Consultant',
        specialization: r.specialization || 'Physiotherapy Consultant',
        phone: r.phone ? String(r.phone) : null,
        email: r.email ? String(r.email) : null,
        centre_id: matchedCentreId || cList[0]?.id || null,
      }
    })

    const count = await bulkImportDoctors(mappedDoctors)
    toast({ title: `Successfully imported and tagged ${count} doctors to clinic centres!` })
    load()
  }

  const filteredDoctors = doctors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.specialization && d.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (d.centreName && d.centreName.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Doctor Directory</h1>
          <p className="text-sm text-muted-foreground">
            {isAdmin ? 'Manage doctor profiles and branch tagging across all centres' : `Doctors practicing at ${profile?.centreName || 'your centre'}`}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {isAdmin && (
            <Button variant="outline" className="gap-2 border-emerald-300 text-emerald-800 hover:bg-emerald-50" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4 text-emerald-600" /> Import Excel / CSV
            </Button>
          )}
          <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="h-4 w-4" /> Add Doctor
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            className="pl-9 bg-white" 
            placeholder="Search doctors by name, specialization, or clinic..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
          />
        </div>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCentreFilter} onValueChange={(v: string | null) => setSelectedCentreFilter(v ?? 'all')}>
              <SelectTrigger className="w-56 bg-white"><SelectValue placeholder="All Centres" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Centres</SelectItem>
                {centres.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <UserCog className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No doctors found.</p>
              <Button className="mt-4" onClick={openAdd}>Add First Doctor</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left text-xs font-semibold text-muted-foreground">
                    <th className="px-4 py-3">Doctor Name</th>
                    <th className="px-4 py-3">Specialization</th>
                    <th className="px-4 py-3">Tagged Clinic Branch</th>
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
                          <Building2 className="h-3 w-3" /> {d.centreName ?? 'Downtown Clinic (Centre 1)'}
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
          { name: 'Dr. Neha Verma', specialization: 'Pediatric Physiotherapy', phone: '+91 98765 00001', email: 'neha@physio.com', centre_name: 'Downtown Clinic (Centre 1)' },
          { name: 'Dr. Arjun Kapoor', specialization: 'Sports Medicine & Rehab', phone: '+91 98765 00002', email: 'arjun@physio.com', centre_name: 'Westside Rehab (Centre 2)' },
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