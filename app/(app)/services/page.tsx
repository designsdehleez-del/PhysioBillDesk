'use client'
import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus, Stethoscope, Search, RotateCcw, Sparkles, IndianRupee, Layers } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { formatCurrency } from '@/lib/utils'
import type { Service } from '@/lib/supabase/types'
import { getServices, saveService, deleteService, resetDefaultServices } from '@/lib/data-store'
import { useToast } from '@/components/ui/use-toast'

export default function ServicesPage() {
  const { toast } = useToast()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const data = await getServices()
    setServices(data)
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const openAdd = () => {
    setEditing(null)
    setName('')
    setPrice('')
    setDialogOpen(true)
  }

  const openEdit = (s: Service) => {
    setEditing(s)
    setName(s.name)
    setPrice(String(s.price))
    setDialogOpen(true)
  }

  const save = async () => {
    if (!name.trim() || !price || isNaN(Number(price)) || Number(price) < 0) {
      toast({ title: 'Please enter a valid service name and price', variant: 'destructive' })
      return
    }
    setSaving(true)
    await saveService({
      id: editing ? editing.id : undefined,
      name: name.trim(),
      price: Number(price),
    })
    toast({ title: editing ? 'Service updated successfully' : 'New service added successfully' })
    setSaving(false)
    setDialogOpen(false)
    load()
  }

  const doDelete = async () => {
    if (!deleteId) return
    await deleteService(deleteId)
    toast({ title: 'Service removed', variant: 'destructive' })
    setDeleteId(null)
    load()
  }

  const handleResetDefaults = async () => {
    await resetDefaultServices()
    toast({ title: 'Standard physiotherapy services restored' })
    setResetDialogOpen(false)
    load()
  }

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const avgPrice = services.length > 0 ? Math.round(services.reduce((a, b) => a + b.price, 0) / services.length) : 0
  const minPrice = services.length > 0 ? Math.min(...services.map(s => s.price)) : 0
  const maxPrice = services.length > 0 ? Math.max(...services.map(s => s.price)) : 0

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-blue-50/60 border border-blue-200 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white">Physiotherapy Catalog</Badge>
            <span className="text-xs text-blue-900 font-semibold">{services.length} Total Services</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Services & Clinical Pricing</h1>
          <p className="text-xs text-muted-foreground">
            Manage treatments, procedure fees, and session packages across all clinic branches
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setResetDialogOpen(true)} className="text-xs gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-100">
            <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
          </Button>
          <Button onClick={openAdd} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
            <Plus className="h-4 w-4" /> Add New Service
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="shadow-xs border">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Active Services</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{services.length}</p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Layers className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Average Rate</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(avgPrice)}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <IndianRupee className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Min Service Fee</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(minPrice)}</p>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Max Package Fee</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(maxPrice)}</p>
            </div>
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
              <Stethoscope className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9 bg-white"
          placeholder="Search by treatment name, procedure (e.g. Needling, Traction, Laser, Mobilization)..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Services Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
            </div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Stethoscope className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm">No matching services found.</p>
              <Button className="mt-3" size="sm" onClick={openAdd}>Add This Service</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-left text-xs font-semibold text-muted-foreground">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Service / Clinical Procedure</th>
                    <th className="px-4 py-3">Standard Cost (INR)</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredServices.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        {s.name}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        {formatCurrency(s.price)}
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => openEdit(s)} title="Edit Price / Name">
                          <Pencil className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-red-50" onClick={() => setDeleteId(s.id)} title="Delete Service">
                          <Trash2 className="h-4 w-4" />
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Clinical Service' : 'Add New Clinical Service'}</DialogTitle>
            <DialogDescription className="text-xs">
              Define the service name and the standard price in Rupees. This price will be used in billing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Service / Procedure Name *</Label>
              <Input
                placeholder="e.g. Hydrotherapy & Aquatic Rehab"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label>Standard Price (₹ INR) *</Label>
              <Input
                type="number"
                min="0"
                step="50"
                placeholder="e.g. 750"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
              {saving ? 'Saving…' : editing ? 'Update Service' : 'Save Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Clinical Service?</AlertDialogTitle>
            <AlertDialogDescription>
              This service will be removed from the active catalog. Existing bills will preserve their historical rates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={doDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Defaults Confirmation */}
      <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore Standard Services Catalog?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reload all 18 default clinical physiotherapy procedures and standard rates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetDefaults} className="bg-blue-600 text-white hover:bg-blue-700">
              Restore Presets
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}