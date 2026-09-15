'use client'
import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, UserCog } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import type { Doctor, Centre } from '@/lib/supabase/types'
import { useToast } from '@/components/ui/use-toast'

interface DoctorRow extends Doctor { centreName?: string }

export default function DoctorsPage() {
  const { toast } = useToast()
  const [doctors, setDoctors] = useState<DoctorRow[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Doctor | null>(null)
  const [form, setForm] = useState({ name: '', specialization: '', phone: '', email: '', centre_id: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const supabase = createClient()
    const [{ data: d }, { data: c }] = await Promise.all([
      supabase.from('doctors').select('*').order('name'),
      supabase.from('centres').select('*').eq('is_active', true).order('name'),
    ])
    const centreMap = Object.fromEntries((c ?? []).map(x => [x.id, x.name]))
    setDoctors((d ?? []).map(doc => ({ ...doc, centreName: doc.centre_id ? centreMap[doc.centre_id] : undefined })))
    setCentres(c ?? []); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm({ name: '', specialization: '', phone: '', email: '', centre_id: '' }); setDialogOpen(true) }
  const openEdit = (d: Doctor) => { setEditing(d); setForm({ name: d.name, specialization: d.specialization ?? '', phone: d.phone ?? '', email: d.email ?? '', centre_id: d.centre_id ?? '' }); setDialogOpen(true) }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const supabase = createClient()
    const payload = { name: form.name.trim(), specialization: form.specialization || null, phone: form.phone || null, email: form.email || null, centre_id: form.centre_id || null }
    if (editing) { await supabase.from('doctors').update(payload).eq('id', editing.id); toast({ title: 'Doctor updated' }) }
    else { await supabase.from('doctors').insert({ ...payload, is_active: true }); toast({ title: 'Doctor added' }) }
    setSaving(false); setDialogOpen(false); load()
  }

  const toggleActive = async (d: Doctor) => {
    await createClient().from('doctors').update({ is_active: !d.is_active }).eq('id', d.id)
    toast({ title: `Doctor ${!d.is_active ? 'activated' : 'deactivated'}` }); load()
  }

  const doDelete = async () => {
    if (!deleteId) return
    await createClient().from('doctors').delete().eq('id', deleteId)
    toast({ title: 'Doctor deleted', variant: 'destructive' }); setDeleteId(null); load()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Doctors</h1><p className="text-sm text-muted-foreground">{doctors.length} doctors</p></div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Doctor</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
          : doctors.length === 0 ? (
            <div className="text-center py-12"><UserCog className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No doctors yet</p><Button className="mt-4" onClick={openAdd}>Add First Doctor</Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50"><tr className="text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Specialization</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Centre</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y">{doctors.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{d.specialization ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{d.centreName ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{d.phone ?? '—'}</td>
                  <td className="px-4 py-3"><Switch checked={d.is_active} onCheckedChange={() => toggleActive(d)} /></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(d.id)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Doctor' : 'Add Doctor'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Specialization</Label><Input value={form.specialization} onChange={e => setForm(p => ({ ...p, specialization: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Centre</Label>
              <Select value={form.centre_id || 'none'} onValueChange={(v: string | null) => setForm(p => ({ ...p, centre_id: (!v || v === 'none') ? '' : v }))}>
                <SelectTrigger><SelectValue placeholder="Select centre" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {centres.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1"><Label>Phone</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Email</Label><Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Doctor?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}