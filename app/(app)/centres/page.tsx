'use client'
import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, Building2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { getCentres, saveCentre, toggleCentreActive, deleteCentre } from '@/lib/data-store'
import type { Centre } from '@/lib/supabase/types'
import { useToast } from '@/components/ui/use-toast'

export default function CentresPage() {
  const { toast } = useToast()
  const [centres, setCentres] = useState<Centre[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Centre | null>(null)
  const [form, setForm] = useState({ name: '', address: '', phone: '', email: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await getCentres()
    setCentres(data)
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm({ name: '', address: '', phone: '', email: '' }); setDialogOpen(true) }
  const openEdit = (c: Centre) => { setEditing(c); setForm({ name: c.name, address: c.address ?? '', phone: c.phone ?? '', email: c.email ?? '' }); setDialogOpen(true) }

  const save = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    await saveCentre({
      id: editing ? editing.id : undefined,
      name: form.name.trim(),
      address: form.address || null,
      phone: form.phone || null,
      email: form.email || null,
    })
    toast({ title: editing ? 'Centre updated successfully' : 'New centre added successfully' })
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  const toggleActive = async (c: Centre) => {
    await toggleCentreActive(c.id)
    toast({ title: `Centre ${!c.is_active ? 'activated' : 'deactivated'}` })
    load()
  }

  const doDelete = async () => {
    if (!deleteId) return
    await deleteCentre(deleteId)
    toast({ title: 'Centre deleted', variant: 'destructive' })
    setDeleteId(null)
    load()
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Centres</h1><p className="text-sm text-muted-foreground">{centres.length} centres</p></div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Centre</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
          : centres.length === 0 ? (
            <div className="text-center py-12"><Building2 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No centres yet</p><Button className="mt-4" onClick={openAdd}>Add First Centre</Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50"><tr className="text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Address</th>
                <th className="px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y">{centres.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.address ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{c.phone ?? '—'}</td>
                  <td className="px-4 py-3"><Switch checked={c.is_active} onCheckedChange={() => toggleActive(c)} /></td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Centre' : 'Add Centre'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1"><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Address</Label><Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
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
          <AlertDialogHeader><AlertDialogTitle>Delete Centre?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}