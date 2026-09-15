'use client'
import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, Stethoscope } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency } from '@/lib/utils'
import type { Service } from '@/lib/supabase/types'
import { useToast } from '@/components/ui/use-toast'

export default function ServicesPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<Service | null>(null)
  const [name, setName] = useState(''); const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await createClient().from('services').select('*').order('name')
    setServices(data ?? []); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setName(''); setPrice(''); setDialogOpen(true) }
  const openEdit = (s: Service) => { setEditing(s); setName(s.name); setPrice(String(s.price)); setDialogOpen(true) }

  const save = async () => {
    if (!name.trim() || !price || isNaN(Number(price)) || Number(price) < 0) return
    setSaving(true)
    const supabase = createClient()
    if (editing) {
      await supabase.from('services').update({ name: name.trim(), price: Number(price) }).eq('id', editing.id)
      toast({ title: 'Service updated' })
    } else {
      await supabase.from('services').insert({ name: name.trim(), price: Number(price) })
      toast({ title: 'Service added' })
    }
    setSaving(false); setDialogOpen(false); load()
  }

  const doDelete = async () => {
    if (!deleteId) return
    await createClient().from('services').delete().eq('id', deleteId)
    toast({ title: 'Service deleted', variant: 'destructive' })
    setDeleteId(null); load()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Services</h1><p className="text-sm text-muted-foreground">{services.length} services</p></div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Service</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
          : services.length === 0 ? (
            <div className="text-center py-12"><Stethoscope className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No services yet</p><Button className="mt-4" onClick={openAdd}>Add First Service</Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50"><tr className="text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Service Name</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Price</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y">{services.map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 text-gray-700">{formatCurrency(s.price)}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button size="sm" variant="ghost" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(s.id)}><Trash2 className="h-4 w-4" /></Button>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Service' : 'Add Service'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1"><Label>Service Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Consultation" /></div>
            <div className="space-y-1"><Label>Price (₹)</Label><Input type="number" min="0" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Service?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}