'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Pencil, Trash2, Plus, UserCog, Upload, Download, Building2, Search, Filter, User, 
  Award, ShieldCheck, FileText, Phone, Mail, ExternalLink, Image as ImageIcon, HeartHandshake, Sparkles 
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { 
  getDoctors, saveDoctor, deleteDoctor, toggleDoctorActive, bulkImportDoctors, 
  getCentres, getVisits, getPatientFeedback, getPhysiotherapists, savePhysiotherapist, 
  deletePhysiotherapist, togglePhysiotherapistActive, type StoredVisit 
} from '@/lib/data-store'
import { ExcelImporter, type ColumnDefinition } from '@/components/import/excel-importer'
import type { Doctor, Centre, PatientFeedback, Physiotherapist } from '@/lib/supabase/types'
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

  const [activeTab, setActiveTab] = useState<'doctors' | 'physiotherapists'>('doctors')

  const [doctors, setDoctors] = useState<DoctorRow[]>([])
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [allVisits, setAllVisits] = useState<StoredVisit[]>([])
  const [allFeedbacks, setAllFeedbacks] = useState<PatientFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [centreFilter, setCentreFilter] = useState('all')

  // Doctor Dialog & Modals
  const [dialogOpen, setDialogOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [selectedDoctorDetail, setSelectedDoctorDetail] = useState<Doctor | null>(null)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Physiotherapist Dialog & Delete State
  const [physioDialogOpen, setPhysioDialogOpen] = useState(false)
  const [editingPhysio, setEditingPhysio] = useState<Physiotherapist | null>(null)
  const [deletePhysioId, setDeletePhysioId] = useState<string | null>(null)

  const [saving, setSaving] = useState(false)

  // Doctor Form State
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

  // Physiotherapist Form State
  const [physioForm, setPhysioForm] = useState({
    name: '',
    qualification: '',
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
      const [dData, pData, cData, vData, fbData] = await Promise.all([
        getDoctors(),
        getPhysiotherapists(),
        getCentres(),
        getVisits(),
        getPatientFeedback(),
      ])

      setAllVisits(vData)
      setAllFeedbacks(fbData)
      setPhysiotherapists(pData)

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
      console.error('Failed to load doctors & physiotherapists:', err)
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

  const visiblePhysios = !isAdmin && staffCentreId
    ? physiotherapists.filter(p => p.centre_id === staffCentreId)
    : physiotherapists

  const filteredPhysios = visiblePhysios.filter(p => {
    const matchesCentre = centreFilter === 'all' || p.centre_id === centreFilter
    if (!matchesCentre) return false

    if (!search.trim()) return true
    const q = search.toLowerCase()
    return p.name.toLowerCase().includes(q) || (p.qualification?.toLowerCase().includes(q))
  })

  const totalDoctorRevenue = doctors.reduce((sum, d) => sum + (d.revenue || 0), 0)
  const totalDoctorVisits = doctors.reduce((sum, d) => sum + (d.visitCount || 0), 0)

  // Doctor Form Handlers
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
      centre_id: staffCentreId || centres[0]?.id || '' 
    })
    setDialogOpen(true)
  }

  const openEdit = (d: Doctor) => {
    setEditing(d)
    setForm({
      name: d.name,
      specialization: d.specialization || '',
      qualification: d.qualification || '',
      photo_url: d.photo_url || '',
      experience_years: d.experience_years || '',
      registration_number: d.registration_number || '',
      bio: d.bio || '',
      phone: d.phone || '',
      email: d.email || '',
      centre_id: d.centre_id || '',
    })
    setDialogOpen(true)
  }

  const handleSaveDoctor = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
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

  const handleDeleteDoctor = async () => {
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

  // Physiotherapist Form Handlers
  const openAddPhysio = () => {
    setEditingPhysio(null)
    setPhysioForm({
      name: '',
      qualification: 'BPT, MPT',
      phone: '',
      email: '',
      centre_id: staffCentreId || centres[0]?.id || ''
    })
    setPhysioDialogOpen(true)
  }

  const openEditPhysio = (pt: Physiotherapist) => {
    setEditingPhysio(pt)
    setPhysioForm({
      name: pt.name,
      qualification: pt.qualification || '',
      phone: pt.phone || '',
      email: pt.email || '',
      centre_id: pt.centre_id || '',
    })
    setPhysioDialogOpen(true)
  }

  const handleSavePhysio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!physioForm.name.trim()) return
    setSaving(true)
    try {
      await savePhysiotherapist({
        ...(editingPhysio ? { id: editingPhysio.id } : {}),
        name: physioForm.name.trim(),
        qualification: physioForm.qualification.trim() || null,
        phone: physioForm.phone.trim() || null,
        email: physioForm.email.trim() || null,
        centre_id: physioForm.centre_id || null,
        is_active: editingPhysio ? editingPhysio.is_active : true,
      })
      toast({ title: editingPhysio ? 'Physiotherapist profile updated' : 'New Physiotherapist added & tagged to clinic' })
      setPhysioDialogOpen(false)
      load()
    } catch (err: any) {
      toast({ title: 'Failed to save physiotherapist', description: err?.message, variant: 'destructive' })
    }
    setSaving(false)
  }

  const togglePhysioActiveState = async (pt: Physiotherapist) => {
    try {
      await togglePhysiotherapistActive(pt.id)
      toast({ title: `Physiotherapist status updated` })
      load()
    } catch (err: any) {
      toast({ title: 'Failed to update status', description: err?.message, variant: 'destructive' })
    }
  }

  const handleDeletePhysio = async () => {
    if (!deletePhysioId) return
    try {
      await deletePhysiotherapist(deletePhysioId)
      toast({ title: 'Physiotherapist removed' })
      setDeletePhysioId(null)
      load()
    } catch (err: any) {
      toast({ title: 'Failed to delete physiotherapist', description: err?.message, variant: 'destructive' })
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
      
      {/* Doctor Performance Modal */}
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
            <h1 className="text-2xl font-black tracking-tight text-gray-900">Clinical Staff & Doctor Directory</h1>
            <Badge className="bg-purple-600 text-white text-xs font-bold">{isAdmin ? 'Admin View' : 'Clinic Desk'}</Badge>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage senior doctors, attending physiotherapists, qualifications, and clinic branch tagging.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 gap-1.5 text-xs font-semibold" onClick={() => setImportOpen(true)}>
            <Download className="h-4 w-4 text-emerald-600" /> Import Excel
          </Button>
          {activeTab === 'doctors' ? (
            <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> Add Senior Doctor
            </Button>
          ) : (
            <Button onClick={openAddPhysio} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm">
              <Plus className="h-4 w-4" /> Add Physiotherapist
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Switcher: Senior Doctors vs Physiotherapists */}
      <Tabs defaultValue="doctors" value={activeTab} onValueChange={(val: string) => setActiveTab(val as 'doctors' | 'physiotherapists')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
          <TabsList className="bg-slate-100 p-1 rounded-xl">
            <TabsTrigger value="doctors" className="text-xs font-bold px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-900 shadow-xs">
              🩺 Senior Doctors ({doctors.length})
            </TabsTrigger>
            <TabsTrigger value="physiotherapists" className="text-xs font-bold px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-emerald-900 shadow-xs">
              💆 Physiotherapists ({physiotherapists.length})
            </TabsTrigger>
          </TabsList>

          {/* Search & Centre Filters */}
          <div className="flex items-center gap-2">
            <div className="relative w-48 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder={activeTab === 'doctors' ? "Search doctor..." : "Search physiotherapist..."}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs bg-white border-slate-200 rounded-xl"
              />
            </div>
            {isAdmin && (
              <Select value={centreFilter} onValueChange={(val) => setCentreFilter(val || 'all')}>
                <SelectTrigger className="w-44 h-9 text-xs bg-white border-slate-200 rounded-xl">
                  <SelectValue placeholder="All Clinics" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clinics</SelectItem>
                  {centres.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name.split(',')[0]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Tab 1: Senior Doctors Content */}
        <TabsContent value="doctors" className="pt-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading doctor profiles...</div>
          ) : filteredDoctors.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border">
              No doctors found matching filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDoctors.map(doc => (
                <Card key={doc.id} className="border shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden flex flex-col justify-between">
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {doc.photo_url ? (
                          <img src={doc.photo_url} alt={doc.name} className="w-12 h-12 rounded-2xl object-cover border border-slate-200" />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                            {doc.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <button
                            onClick={() => setSelectedDoctorDetail(doc)}
                            className="font-extrabold text-sm text-slate-900 hover:text-blue-600 transition-colors text-left block"
                          >
                            {doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`}
                          </button>
                          <p className="text-xs font-semibold text-blue-700">{doc.specialization || 'Physiotherapy Specialist'}</p>
                          <p className="text-[11px] text-slate-500">{doc.qualification}</p>
                        </div>
                      </div>
                      <Switch
                        checked={doc.is_active}
                        onCheckedChange={() => toggleActive(doc)}
                        className="data-[state=checked]:bg-emerald-600"
                      />
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-500 font-medium">Assigned Branch:</span>
                        <Badge variant="outline" className="bg-white text-slate-800 border-slate-200 text-[10px] font-bold">
                          📍 {doc.centreName || 'All Flagships'}
                        </Badge>
                      </div>
                      {doc.registration_number && (
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Medical Reg #:</span>
                          <span className="font-mono text-slate-700 font-semibold">{doc.registration_number}</span>
                        </div>
                      )}
                      {isAdmin && (
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60">
                          <span className="text-slate-500 font-medium">Tagged Revenue:</span>
                          <span className="font-extrabold text-emerald-700">{formatCurrency(doc.revenue || 0)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1 text-xs">
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-slate-600 hover:text-blue-600 p-0" onClick={() => openEdit(doc)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit Profile
                        </Button>
                      </div>
                      <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-rose-600 hover:bg-rose-50" onClick={() => setDeleteId(doc.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Physiotherapists Content */}
        <TabsContent value="physiotherapists" className="pt-4">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading physiotherapists...</div>
          ) : filteredPhysios.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-slate-50 rounded-2xl border">
              No physiotherapists found. Click "Add Physiotherapist" to register staff and tag them to clinics.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredPhysios.map(pt => {
                const cObj = centres.find(c => c.id === pt.centre_id)
                return (
                  <Card key={pt.id} className="border shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl overflow-hidden flex flex-col justify-between">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-lg border border-emerald-100">
                            {pt.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-extrabold text-sm text-slate-900">{pt.name}</p>
                            <p className="text-xs font-semibold text-emerald-700">{pt.qualification || 'Physiotherapist'}</p>
                          </div>
                        </div>
                        <Switch
                          checked={pt.is_active}
                          onCheckedChange={() => togglePhysioActiveState(pt)}
                          className="data-[state=checked]:bg-emerald-600"
                        />
                      </div>

                      <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 text-xs space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 font-medium">Tagged Clinic:</span>
                          <Badge variant="outline" className="bg-white text-emerald-800 border-emerald-200 text-[10px] font-bold">
                            📍 {cObj ? cObj.name.split(',')[0] : 'All Clinics'}
                          </Badge>
                        </div>
                        {pt.phone && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Phone:</span>
                            <span className="font-mono text-slate-700">{pt.phone}</span>
                          </div>
                        )}
                        {pt.email && (
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500 font-medium">Email:</span>
                            <span className="font-mono text-slate-700 truncate max-w-[150px]">{pt.email}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-slate-600 hover:text-emerald-600 p-0" onClick={() => openEditPhysio(pt)}>
                          <Pencil className="h-3.5 w-3.5 mr-1" /> Edit Profile
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs font-bold text-rose-600 hover:bg-rose-50" onClick={() => setDeletePhysioId(pt.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Doctor Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">
              {editing ? 'Edit Senior Doctor' : 'Add Senior Doctor'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveDoctor} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Doctor Full Name *</Label>
              <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Dr. Sarah Jenkins" required className="h-10 text-xs rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Specialization</Label>
                <Input value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})} placeholder="e.g. Orthopedics" className="h-10 text-xs rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Qualification</Label>
                <Input value={form.qualification} onChange={e => setForm({...form, qualification: e.target.value})} placeholder="e.g. BPT, MPT" className="h-10 text-xs rounded-xl" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Tagged Primary Clinic Centre</Label>
              <Select value={form.centre_id || ''} onValueChange={v => setForm({...form, centre_id: v || ''})}>
                <SelectTrigger className="h-10 text-xs rounded-xl">
                  <SelectValue placeholder="Select Clinic" />
                </SelectTrigger>
                <SelectContent>
                  {centres.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Phone</Label>
                <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="+91 98111 00000" className="h-10 text-xs rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Email</Label>
                <Input value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="doctor@physionautics.com" className="h-10 text-xs rounded-xl" />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="rounded-xl h-10 text-xs">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl h-10 text-xs">
                {saving ? 'Saving...' : editing ? 'Update Doctor' : 'Save Doctor'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Physiotherapist Add/Edit Dialog */}
      <Dialog open={physioDialogOpen} onOpenChange={setPhysioDialogOpen}>
        <DialogContent className="max-w-md bg-white rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">
              {editingPhysio ? 'Edit Physiotherapist' : 'Add Physiotherapist'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSavePhysio} className="space-y-3 py-2 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Physiotherapist Full Name *</Label>
              <Input value={physioForm.name} onChange={e => setPhysioForm({...physioForm, name: e.target.value})} placeholder="e.g. PT Ananya Sen" required className="h-10 text-xs rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Qualification</Label>
              <Input value={physioForm.qualification} onChange={e => setPhysioForm({...physioForm, qualification: e.target.value})} placeholder="e.g. BPT, MPT (Kinesiotherapy)" className="h-10 text-xs rounded-xl" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-bold text-slate-700">Tagged Clinic Centre *</Label>
              <Select value={physioForm.centre_id || ''} onValueChange={v => setPhysioForm({...physioForm, centre_id: v || ''})}>
                <SelectTrigger className="h-10 text-xs rounded-xl">
                  <SelectValue placeholder="Select Clinic" />
                </SelectTrigger>
                <SelectContent>
                  {centres.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Phone</Label>
                <Input value={physioForm.phone} onChange={e => setPhysioForm({...physioForm, phone: e.target.value})} placeholder="+91 98222 00000" className="h-10 text-xs rounded-xl" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-slate-700">Email</Label>
                <Input value={physioForm.email} onChange={e => setPhysioForm({...physioForm, email: e.target.value})} placeholder="physio@physionautics.com" className="h-10 text-xs rounded-xl" />
              </div>
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setPhysioDialogOpen(false)} className="rounded-xl h-10 text-xs">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-10 text-xs">
                {saving ? 'Saving...' : editingPhysio ? 'Update Physiotherapist' : 'Save Physiotherapist'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Doctor Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={open => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent className="bg-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 font-bold">Remove Doctor Profile?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              This will remove the doctor record from the active directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDoctor} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold">
              Remove Doctor
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Physiotherapist Alert */}
      <AlertDialog open={!!deletePhysioId} onOpenChange={open => { if (!open) setDeletePhysioId(null) }}>
        <AlertDialogContent className="bg-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-900 font-bold">Remove Physiotherapist Profile?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600">
              This will remove the physiotherapist record from the active clinic directory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl text-xs">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePhysio} className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold">
              Remove Physiotherapist
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Excel Importer */}
      <ExcelImporter
        open={importOpen}
        onOpenChange={setImportOpen}
        columns={DOCTOR_IMPORT_COLUMNS}
        onImport={handleBulkImport}
        templateFileName="Doctor_Directory_Template.xlsx"
        title="Import Doctor Directory"
        description="Import doctor records from XLSX template"
      />
    </div>
  )
}