'use client'
import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, Tag } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import type { DiscountPreset } from '@/lib/supabase/types'
import { useToast } from '@/components/ui/use-toast'
import { formatCurrency } from '@/lib/utils'

export default function DiscountsPage() {
  const { toast } = useToast()
  const [presets, setPresets] = useState<DiscountPreset[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editing, setEditing] = useState<DiscountPreset | null>(null)
  const [form, setForm] = useState({ label: '', type: 'percentage' as 'percentage' | 'fixed', value: '' })
  const [saving, setSaving] = useState(false)

  const load = async () => {
    const { data } = await createClient().from('discount_presets').select('*').order('label')
    setPresets(data ?? []); setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openAdd = () => { setEditing(null); setForm({ label: '', type: 'percentage', value: '' }); setDialogOpen(true) }
  const openEdit = (d: DiscountPreset) => { setEditing(d); setForm({ label: d.label, type: d.type, value: String(d.value) }); setDialogOpen(true) }

  const save = async () => {
    if (!form.label.trim() || !form.value || isNaN(Number(form.value)) || Number(form.value) < 0) return
    const value = form.type === 'percentage' ? Math.min(Number(form.value), 100) : Number(form.value)
    setSaving(true)
    const supabase = createClient()
    const payload = { label: form.label.trim(), type: form.type, value }
    if (editing) { await supabase.from('discount_presets').update(payload).eq('id', editing.id); toast({ title: 'Preset updated' }) }
    else { await supabase.from('discount_presets').insert({ ...payload, is_active: true }); toast({ title: 'Preset added' }) }
    setSaving(false); setDialogOpen(false); load()
  }

  const toggleActive = async (d: DiscountPreset) => {
    await createClient().from('discount_presets').update({ is_active: !d.is_active }).eq('id', d.id)
    toast({ title: `Preset ${!d.is_active ? 'activated' : 'deactivated'}` }); load()
  }

  const doDelete = async () => {
    if (!deleteId) return
    await createClient().from('discount_presets').delete().eq('id', deleteId)
    toast({ title: 'Preset deleted', variant: 'destructive' }); setDeleteId(null); load()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Discount Presets</h1><p className="text-sm text-muted-foreground">{presets.length} presets</p></div>
        <Button onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Preset</Button>
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
          : presets.length === 0 ? (
            <div className="text-center py-12"><Tag className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No presets yet</p><Button className="mt-4" onClick={openAdd}>Add First Preset</Button>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b bg-gray-50"><tr className="text-left">
                <th className="px-4 py-3 font-medium text-muted-foreground">Label</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Value</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Active</th>
                <th className="px-4 py-3 font-medium text-muted-foreground text-right">Actions</th>
              </tr></thead>
              <tbody className="divide-y">{presets.map(d => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{d.label}</td>
                  <td className="px-4 py-3"><Badge variant={d.type === 'percentage' ? 'default' : 'secondary'}>{d.type === 'percentage' ? '%' : '₹'} {d.type}</Badge></td>
                  <td className="px-4 py-3 text-gray-700">{d.type === 'percentage' ? `${d.value}%` : formatCurrency(d.value)}</td>
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
          <DialogHeader><DialogTitle>{editing ? 'Edit Preset' : 'Add Preset'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1"><Label>Label *</Label><Input value={form.label} onChange={e => setForm(p => ({ ...p, label: e.target.value }))} placeholder="e.g. Staff Discount" /></div>
            <div className="space-y-1"><Label>Type</Label>
              <Select value={form.type} onValueChange={v => setForm(p => ({ ...p, type: v as 'percentage' | 'fixed' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Value {form.type === 'percentage' ? '(max 100%)' : '(₹)'}</Label>
              <Input type="number" min="0" max={form.type === 'percentage' ? 100 : undefined} value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? 'Saving…' : editing ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Preset?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}