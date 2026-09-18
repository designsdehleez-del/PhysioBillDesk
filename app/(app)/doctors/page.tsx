'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Pencil, Trash2, Plus, UserCog, Upload, Download, Building2, Search, Filter, User, 
  Award, ShieldCheck, FileText, Phone, Mail, ExternalLink, Image as ImageIcon 
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { DoctorDetailModal } from '@/components/doctors/doctor-detail-modal'
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
  { key: 'qualification', label: 'Qualification', required: false, example: 'BPT, MPT (Sports)' },
  { key: 'phone', label: 'Phone', required: false, example: '+91 98123 45678' },
  { key: 'email', label: 'Email', required: false, example: 'ananya@physionautics.com' },
  { key: 'centre_name', label: 'Centre Name', required: false, example: 'New Friends Colony, New Delhi' },
]

export default function DoctorsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [doctors, setDoctors] = useState<DoctorRow[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [allVisits, setAllVisits] = useState<StoredVisit[]>([])
  const [allFeedbacks, setAllFeedbacks] = useState<PatientFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [centreFilter, setCentreFilter] = useState('all')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState<Doctor | null>(null)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    specialization: '',
    qualification: '',
    photo_url: '',
    experience_years: '',
    registration_number: '',
    bio: '',
    phone: '',
    email: '',
    centre_id: ''
  })

  const staffCentreId = profile?.centreId || (
    profile?.email === 'nfc@physionautics.com' ? 'c1111111-1111-1111-1111-111111111111' :
    profile?.email === 'vasantvihar@physionautics.com' ? 'c2222222-2222-2222-2222-222222222222' :
    profile?.email === 'gurugram@physionautics.com' ? 'c3333333-3333-3333-3333-333333333333' : null
  )

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [dData, cData, vData, fbData] = await Promise.all([
        getDoctors(),
        getCentres(),
        getVisits(),
        getPatientFeedback(),
      ])

      setAllVisits(vData)
      setAllFeedbacks(fbData)

      const docRows: DoctorRow[] = dData.map(d => {
        const c = cData.find(centre => centre.id === d.centre_id)
        const dVisits = vData.filter(v => v.doctor_id === d.id || (v.doctor_name && v.doctor_name.toLowerCase().includes(d.name.toLowerCase())))
        const rev = dVisits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
        
        const dFb = fbData.filter(f => f.doctor_name && f.doctor_name.toLowerCase().includes(d.name.toLowerCase()))
        const avgR = dFb.length > 0 ? (dFb.reduce((s, f) => s + f.rating, 0) / dFb.length).toFixed(1) : '5.0'

        return {
          ...d,
          centreName: c?.name ?? null,
          revenue: rev,
          visitCount: dVisits.length,
          avgRating: avgR,
        }
      })

      setDoctors(docRows)
      setCentres(cData)
    } catch (err) {
      console.error('Failed to load doctors:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const visibleDoctors = !isAdmin && staffCentreId
    ? doctors.filter(d => d.centre_id === staffCentreId || (profile?.centreName && d.centreName === profile.centreName))
    : doctors

  const filteredDoctors = visibleDoctors.filter(d => {
    const matchesCentre = centreFilter === 'all' || d.centre_id === centreFilter
    if (!matchesCentre) return false

    if (!search.trim()) return true
    const q = search.toLowerCase()
    return d.name.toLowerCase().includes(q) || 
           (d.specialization?.toLowerCase().includes(q)) || 
           (d.qualification?.toLowerCase().includes(q))
  })

  const totalDoctorRevenue = doctors.reduce((sum, d) => sum + (d.revenue || 0), 0)
  const totalDoctorVisits = doctors.reduce((sum, d) => sum + (d.visitCount || 0), 0)

  const openAdd = () => {
    setEditing(null)
    setForm({ 
      name: '', 
      specialization: '', 
      qualification: 'BPT, MPT', 
      photo_url: '', 
      experience_years: '5 Years', 
      registration_number: '', 
      bio: '', 
      phone: '', 
      email: '', 
      centre_id: centres[0]?.id ?? '' 
    })
    setDialogOpen(true)
  }

  const openEdit = (d: Doctor) => {
    setEditing(d)
    setForm({ 
      name: d.name, 
      specialization: d.specialization ?? '', 
      qualification: d.qualification ?? '', 
      photo_url: d.photo_url ?? '', 
      experience_years: d.experience_years ?? '', 
      registration_number: d.registration_number ?? '', 
      bio: d.bio ?? '', 
      phone: d.phone ?? '', 
      email: d.email ?? '', 
      centre_id: d.centre_id ?? '' 
    })
    setDialogOpen(true)
  }

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 3 * 1024 * 1024) {
      toast({ title: 'Image file too large', description: 'Please choose an image under 3MB.', variant: 'destructive' })
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      setForm(f => ({ ...f, photo_url: base64 }))
    }
    reader.readAsDataURL(file)
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
        qualification: form.qualification.trim() || null,
        photo_url: form.photo_url || null,
        experience_years: form.experience_years.trim() || null,
        registration_number: form.registration_number.trim() || null,
        bio: form.bio.trim() || null,
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        centre_id: form.centre_id || null,
        is_active: editing ? editing.is_active : true,
      })
      toast({ title: editing ? 'Doctor profile updated' : 'New Doctor added & tagged to clinic centre' })
      setDialogOpen(false)
      load()
    } catch (err: any) {
      toast({ title: 'Failed to save doctor', description: err?.message, variant: 'destructive' })
    }
    setSaving(false)
  }

  const toggleActive = async (d: Doctor) => {
    try {
      await toggleDoctorActive(d.id)
      toast({ title: `Doctor status toggled` })
      load()
    } catch (err: any) {
      toast({ title: 'Failed to update status', description: err?.message, variant: 'destructive' })
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      await deleteDoctor(deleteId)
      toast({ title: 'Doctor removed from directory' })
      setDeleteId(null)
      load()
    } catch (err: any) {
      toast({ title: 'Failed to delete doctor', description: err?.message, variant: 'destructive' })
    }
  }

  const handleBulkImport = async (rows: Record<string, any>[]) => {
    const validDoctors = rows.map(r => {
      const centreNameStr = r.centre_name ? String(r.centre_name).trim().toLowerCase() : ''
      const matchedCentre = centres.find(c => c.name.toLowerCase().includes(centreNameStr) || centreNameStr.includes(c.name.toLowerCase()))
      const matchedCentreId = matchedCentre?.id || null

      return {
        name: String(r.name).trim(),
        specialization: String(r.specialization).trim(),
        qualification: r.qualification ? String(r.qualification).trim() : 'BPT, MPT',
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

  const activeCentreForDetail = centres.find(c => c.id === selectedDoctorDetail?.centre_id)?.name

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Interactive Admin Doctor Profile & Performance Drilldown Modal */}
      <DoctorDetailModal
        doctor={selectedDoctorDetail}
        open={!!selectedDoctorDetail}
        onOpenChange={(open) => { if (!open) setSelectedDoctorDetail(null) }}
        visits={allVisits}
        feedbacks={allFeedbacks}
        centreName={activeCentreForDetail}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Doctor Directory & Qualifications</h1>
            <Badge className="bg-purple-600 text-white text-xs font-bold">{isAdmin ? 'Admin View' : 'Clinic Desk'}</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage qualifications, profile photos, registration details, and clinic branch tagging. Click any doctor name for detailed financials & CSAT.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1.5 text-xs font-semibold" onClick={() => setImportOpen(true)}>
            <Download className="h-4 w-4 text-emerald-600" /> Import Excel
          </Button>
          <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-sm">
            <Plus className="h-4 w-4" /> Add Doctor Profile
          </Button>
        </div>
      </div>

      {/* Admin Quick Performance Metric Cards */}
      {isAdmin && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border shadow-xs bg-gradient-to-br from-white to-blue-50/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-muted-foreground">Total Active Doctors</p>
                <p className="text-2xl font-black text-blue-950">{doctors.length}</p>
                <p className="text-[10px] text-blue-700 font-semibold">Across {centres.length} clinic flagships</p>
              </div>
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-xs">
                <UserCog className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs bg-gradient-to-br from-white to-emerald-50/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-muted-foreground">Consultant Billed Revenue</p>
                <p className="text-2xl font-black text-emerald-950">{formatCurrency(totalDoctorRevenue)}</p>
                <p className="text-[10px] text-emerald-700 font-semibold">{totalDoctorVisits} billed consultations</p>
              </div>
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                <Building2 className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-xs bg-gradient-to-br from-white to-purple-50/50">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase text-muted-foreground">Top Billed Specialist</p>
                <p className="text-base font-black text-purple-950 truncate max-w-[180px]">
                  {doctors.slice().sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0]?.name || '—'}
                </p>
                <p className="text-[10px] text-purple-700 font-bold">
                  {formatCurrency(doctors.slice().sort((a, b) => (b.revenue || 0) - (a.revenue || 0))[0]?.revenue || 0)}
                </p>
              </div>
              <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-xs">
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
            <Input 
              placeholder="Search doctors by name, qualification, or specialization…" 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="pl-9 text-xs" 
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={centreFilter} onValueChange={(v: string | null) => setCentreFilter(v ?? 'all')}>
              <SelectTrigger className="w-56 bg-white text-xs font-semibold"><SelectValue placeholder="All Centres" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Clinic Centres ({doctors.length})</SelectItem>
                {centres.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Doctor List Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground text-xs">Loading doctors directory…</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-xs">
              No doctors found matching search criteria. Click &quot;Add Doctor Profile&quot; or import from Excel.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-left text-[11px] font-bold text-muted-foreground uppercase">
                    <th className="px-4 py-3">Doctor Profile</th>
                    <th className="px-4 py-3">Qualification</th>
                    <th className="px-4 py-3">Specialization</th>
                    <th className="px-4 py-3">Clinic Centre</th>
                    {isAdmin && <th className="px-4 py-3 text-right">Revenue Generated</th>}
                    <th className="px-4 py-3 text-center">CSAT</th>
                    <th className="px-4 py-3 hidden md:table-cell">Contact Phone</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDoctors.map(d => (
                    <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={d.photo_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
                            alt={d.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-2xs"
                          />
                          <div>
                            <button
                              onClick={() => setSelectedDoctorDetail(d)}
                              className="font-black text-slate-900 text-xs hover:text-blue-600 transition-colors text-left flex items-center gap-1 group"
                            >
                              <span>{d.name}</span>
                              <ExternalLink className="w-3 h-3 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                            <span className="text-[10px] text-slate-400 font-mono block">
                              {d.registration_number ? `Reg #: ${d.registration_number}` : (d.experience_years || 'Staff Specialist')}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <Badge className="bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
                          {d.qualification || 'BPT, MPT'}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 text-slate-700 font-medium">
                        {d.specialization ?? 'Physiotherapy Specialist'}
                      </td>

                      <td className="px-4 py-3">
                        <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50/60 font-medium flex items-center gap-1 w-fit text-[10px]">
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

                      <td className="px-4 py-3 text-muted-foreground font-mono hidden md:table-cell">{d.phone ?? '—'}</td>

                      <td className="px-4 py-3">
                        <Switch checked={d.is_active} onCheckedChange={() => toggleActive(d)} />
                      </td>

                      <td className="px-4 py-3 text-right space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => setSelectedDoctorDetail(d)} title="View Doctor Profile & Financials">
                          <User className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(d)} title="Edit Profile">
                          <Pencil className="h-4 w-4 text-slate-600" />
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

      {/* Add / Edit Doctor Profile Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl bg-white rounded-2xl border-slate-200">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-lg font-black text-slate-900">
              {editing ? 'Edit Doctor Profile & Qualifications' : 'Add New Doctor Profile'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2 max-h-[70vh] overflow-y-auto pr-1">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Doctor Profile Photo</Label>
              <div className="flex items-center gap-4">
                <img 
                  src={form.photo_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'} 
                  alt="Doctor Preview" 
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200 shadow-2xs"
                />
                <div className="space-y-1.5 flex-1">
                  <Input
                    value={form.photo_url}
                    onChange={e => setForm(p => ({ ...p, photo_url: e.target.value }))}
                    placeholder="Photo Image URL (https://...)"
                    className="h-8 text-xs font-mono"
                  />
                  <div className="flex items-center gap-2">
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      id="doc-photo-upload" 
                      onChange={handleImageFileUpload}
                    />
                    <label 
                      htmlFor="doc-photo-upload"
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" /> Upload File
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Doctor Full Name *</Label>
                <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Dr. Rajesh Sharma" className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Specialization *</Label>
                <Input value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} placeholder="e.g. Orthopedic Physiotherapy" className="h-9 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Educational Qualification</Label>
                <Input value={form.qualification} onChange={e => setForm(p => ({ ...p, qualification: e.target.value }))} placeholder="e.g. BPT, MPT (Orthopedics)" className="h-9 text-xs" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Experience (Years)</Label>
                <Input value={form.experience_years} onChange={e => setForm(p => ({ ...p, experience_years: e.target.value }))} placeholder="e.g. 10 Years" className="h-9 text-xs" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">DMC Registration #</Label>
                <Input value={form.registration_number} onChange={e => setForm(p => ({ ...p, registration_number: e.target.value }))} placeholder="e.g. DMC/PT/2018/4892" className="h-9 text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Tagged Clinic Centre *</Label>
                <Select value={form.centre_id} onValueChange={(v: string | null) => setForm(p => ({ ...p, centre_id: v ?? '' }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Select centre" /></SelectTrigger>
                  <SelectContent>
                    {centres.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Contact Phone</Label>
                <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 98111 00000" className="h-9 text-xs font-mono" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Email Address</Label>
                <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="doctor@physionautics.com" className="h-9 text-xs" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Clinical Specialty Bio / Summary</Label>
              <Textarea 
                value={form.bio} 
                onChange={e => setForm(p => ({ ...p, bio: e.target.value }))} 
                placeholder="Brief description of clinical expertise, specialized procedures, and patient recovery focus..." 
                className="text-xs min-h-[60px]"
              />
            </div>
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)} className="h-9 text-xs rounded-xl">Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs">
              {saving ? 'Saving Profile…' : editing ? 'Update Doctor Profile' : 'Save Doctor Profile'}
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
          { name: 'Dr. Neha Verma', specialization: 'Pediatric Physiotherapy', qualification: 'BPT, MPT', phone: '+91 98765 00001', email: 'neha@physio.com', centre_name: 'New Friends Colony, New Delhi' },
          { name: 'Dr. Arjun Kapoor', specialization: 'Sports Medicine & Rehab', qualification: 'BPT, MPT (Sports)', phone: '+91 98765 00002', email: 'arjun@physio.com', centre_name: 'Vasant Vihar, New Delhi' },
          { name: 'Dr. Priya Nair', specialization: 'Cardiorespiratory Rehab', qualification: 'BPT, MPT', phone: '+91 98765 00003', email: 'priya@physio.com', centre_name: 'Gurugram – DLF Phase 1' },
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
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}