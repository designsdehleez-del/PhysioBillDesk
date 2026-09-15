'use client'

import React, { useEffect, useState } from 'react'
import {
  Ticket, Plus, Pencil, Trash2, UserPlus, Search, CheckCircle2,
  Calendar, CreditCard, Sparkles, Building2, User, Clock, AlertCircle,
  FileSpreadsheet, ShieldCheck
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import type { PackagePreset, PatientPackageCredit, Patient, Centre } from '@/lib/supabase/types'
import {
  getPackages, savePackage, deletePackage,
  getPatientCredits, purchasePatientPackage,
  getPatients, getCentres
} from '@/lib/data-store'
import { useToast } from '@/components/ui/use-toast'

export default function PackagesPage() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [activeTab, setActiveTab] = useState<'wallet' | 'catalog'>('wallet')
  const [packages, setPackages] = useState<PackagePreset[]>([])
  const [credits, setCredits] = useState<PatientPackageCredit[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Package Modal State
  const [pkgDialogOpen, setPkgDialogOpen] = useState(false)
  const [editingPkg, setEditingPkg] = useState<PackagePreset | null>(null)
  const [pkgName, setPkgName] = useState('')
  const [pkgDesc, setPkgDesc] = useState('')
  const [pkgSessions, setPkgSessions] = useState('10')
  const [pkgPrice, setPkgPrice] = useState('6800')
  const [pkgValidity, setPkgValidity] = useState('90')
  const [pkgSaving, setPkgSaving] = useState(false)
  const [deletePkgId, setDeletePkgId] = useState<string | null>(null)

  // Issue Package Modal State
  const [issueDialogOpen, setIssueDialogOpen] = useState(false)
  const [selectedPatientId, setSelectedPatientId] = useState('')
  const [selectedPkgId, setSelectedPkgId] = useState('')
  const [selectedCentreId, setSelectedCentreId] = useState('')
  const [paymentMode, setPaymentMode] = useState('UPI')
  const [issueSaving, setIssueSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const [pkgList, credList, patList, cenList] = await Promise.all([
      getPackages(),
      getPatientCredits(),
      getPatients(),
      getCentres(),
    ])
    setPackages(pkgList)
    setCredits(credList)
    setPatients(patList)
    setCentres(cenList.filter(c => c.is_active))
    if (cenList.length > 0 && !selectedCentreId) setSelectedCentreId(cenList[0].id)
    if (pkgList.length > 0 && !selectedPkgId) setSelectedPkgId(pkgList[0].id)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  // Package CRUD
  const handleOpenAddPkg = () => {
    setEditingPkg(null)
    setPkgName('')
    setPkgDesc('')
    setPkgSessions('10')
    setPkgPrice('6800')
    setPkgValidity('90')
    setPkgDialogOpen(true)
  }

  const handleOpenEditPkg = (p: PackagePreset) => {
    setEditingPkg(p)
    setPkgName(p.name)
    setPkgDesc(p.description || '')
    setPkgSessions(String(p.total_sessions))
    setPkgPrice(String(p.price))
    setPkgValidity(String(p.validity_days || 60))
    setPkgDialogOpen(true)
  }

  const handleSavePkg = async () => {
    if (!pkgName.trim() || !pkgPrice || Number(pkgPrice) <= 0 || !pkgSessions || Number(pkgSessions) <= 0) {
      toast({ title: 'Please fill in all package details correctly', variant: 'destructive' })
      return
    }
    setPkgSaving(true)
    await savePackage({
      id: editingPkg ? editingPkg.id : undefined,
      name: pkgName.trim(),
      description: pkgDesc.trim() || undefined,
      total_sessions: Number(pkgSessions),
      price: Number(pkgPrice),
      validity_days: Number(pkgValidity) || 60,
    })
    toast({ title: editingPkg ? 'Package updated' : 'New package created' })
    setPkgSaving(false)
    setPkgDialogOpen(false)
    loadData()
  }

  const handleDeletePkg = async () => {
    if (!deletePkgId) return
    await deletePackage(deletePkgId)
    toast({ title: 'Package removed', variant: 'destructive' })
    setDeletePkgId(null)
    loadData()
  }

  // Issue Package to Patient
  const handleOpenIssue = () => {
    setSelectedPatientId(patients[0]?.id || '')
    setSelectedPkgId(packages[0]?.id || '')
    setIssueDialogOpen(true)
  }

  const handleIssuePackage = async () => {
    const pat = patients.find(p => p.id === selectedPatientId)
    const pkg = packages.find(p => p.id === selectedPkgId)
    const cen = centres.find(c => c.id === selectedCentreId)
    if (!pat || !pkg) {
      toast({ title: 'Please select patient and package', variant: 'destructive' })
      return
    }

    setIssueSaving(true)
    await purchasePatientPackage({
      patient: pat,
      packagePreset: pkg,
      centre: cen,
      paymentMode,
    })
    toast({ title: `Issued ${pkg.name} to ${pat.full_name} (${pkg.total_sessions} Sessions)` })
    setIssueSaving(false)
    setIssueDialogOpen(false)
    loadData()
  }

  const filteredCredits = credits.filter(c =>
    c.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.patient_uid.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.package_name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalActiveCredits = credits.filter(c => c.status === 'Active').reduce((a, b) => a + b.remaining_sessions, 0)
  const totalPackageRevenue = credits.reduce((a, b) => a + b.price_paid, 0)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-purple-50/60 border border-purple-200 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-600 text-white">Treatment Packages & Wallet</Badge>
            <span className="text-xs text-purple-900 font-semibold">{credits.length} Enrolled Patients</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Multi-Session Plans & Credits</h1>
          <p className="text-xs text-muted-foreground">
            Manage advance session packages, track patient remaining credits, and 1-click billing redemptions
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5 border-purple-300 text-purple-700 hover:bg-purple-100"
            onClick={handleOpenAddPkg}
          >
            <Plus className="h-3.5 w-3.5" /> New Package Plan
          </Button>
          <Button
            size="sm"
            onClick={handleOpenIssue}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs gap-1.5 shadow-sm"
          >
            <Ticket className="h-3.5 w-3.5" /> Issue Package to Patient
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="shadow-xs border">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Available Plans</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{packages.length}</p>
            </div>
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg">
              <Ticket className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Total Package Value</p>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">{formatCurrency(totalPackageRevenue)}</p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Active Balances</p>
              <p className="text-xl font-bold text-blue-700 mt-0.5">{totalActiveCredits} Sessions</p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <Sparkles className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs border">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase">Active Wallets</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">{credits.filter(c => c.status === 'Active').length}</p>
            </div>
            <div className="p-2.5 bg-orange-50 text-orange-600 rounded-lg">
              <User className="h-4 w-4" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          size="sm"
          variant={activeTab === 'wallet' ? 'default' : 'ghost'}
          className={activeTab === 'wallet' ? 'bg-purple-600 text-white' : 'text-gray-700 text-xs'}
          onClick={() => setActiveTab('wallet')}
        >
          💳 Patient Session Wallets ({credits.length})
        </Button>
        <Button
          size="sm"
          variant={activeTab === 'catalog' ? 'default' : 'ghost'}
          className={activeTab === 'catalog' ? 'bg-purple-600 text-white' : 'text-gray-700 text-xs'}
          onClick={() => setActiveTab('catalog')}
        >
          📦 Package Catalog & Plans ({packages.length})
        </Button>
      </div>

      {/* ================= TAB 1: PATIENT CREDITS WALLET ================= */}
      {activeTab === 'wallet' && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 bg-white text-xs"
              placeholder="Search by patient name, UID, or package name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
                </div>
              ) : filteredCredits.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Ticket className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="text-sm">No patient package wallets found.</p>
                  <Button className="mt-3 bg-purple-600 text-white" size="sm" onClick={handleOpenIssue}>
                    Issue First Package
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-left text-xs font-semibold text-muted-foreground">
                        <th className="px-4 py-3">Patient</th>
                        <th className="px-4 py-3">Package Plan</th>
                        <th className="px-4 py-3">Sessions Balance</th>
                        <th className="px-4 py-3">Amount Paid</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Purchased / Expiry</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredCredits.map(c => {
                        const percentLeft = Math.round((c.remaining_sessions / c.total_sessions) * 100)
                        return (
                          <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-semibold text-gray-900">{c.patient_name}</p>
                              <p className="text-xs text-muted-foreground font-mono">{c.patient_uid}</p>
                            </td>
                            <td className="px-4 py-3">
                              <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                                {c.package_name}
                              </Badge>
                              {c.centre_name && (
                                <p className="text-[11px] text-muted-foreground mt-0.5">{c.centre_name}</p>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="space-y-1 max-w-[160px]">
                                <div className="flex justify-between text-xs font-bold">
                                  <span className="text-purple-700">{c.remaining_sessions} Left</span>
                                  <span className="text-muted-foreground font-normal">{c.used_sessions} / {c.total_sessions} Used</span>
                                </div>
                                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all ${
                                      c.remaining_sessions === 0
                                        ? 'bg-gray-400'
                                        : c.remaining_sessions <= 2
                                        ? 'bg-amber-500'
                                        : 'bg-purple-600'
                                    }`}
                                    style={{ width: `${percentLeft}%` }}
                                  />
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-bold text-gray-900">
                              {formatCurrency(c.price_paid)}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                className={
                                  c.status === 'Active'
                                    ? 'bg-emerald-600 text-white'
                                    : c.status === 'Exhausted'
                                    ? 'bg-gray-200 text-gray-800'
                                    : 'bg-red-100 text-red-700'
                                }
                              >
                                {c.status}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-xs text-muted-foreground">
                              <p>Bought: {formatDate(c.purchased_at)}</p>
                              {c.expires_at && <p className="text-[11px] text-amber-700">Exp: {formatDate(c.expires_at)}</p>}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ================= TAB 2: PACKAGE CATALOG ================= */}
      {activeTab === 'catalog' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(p => {
            const effectivePerSession = Math.round(p.price / p.total_sessions)
            return (
              <Card key={p.id} className="border hover:border-purple-300 transition-all shadow-xs relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-0 right-0 bg-purple-600 text-white px-3 py-0.5 rounded-bl-lg text-[11px] font-bold">
                  {p.total_sessions} Sessions
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold text-gray-900 pr-16">{p.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2 mt-1">
                    {p.description || 'Prepaid bundle with priority appointment scheduling.'}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-purple-900">{formatCurrency(p.price)}</span>
                    <span className="text-xs text-muted-foreground">({formatCurrency(effectivePerSession)} / session)</span>
                  </div>

                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>Validity: <b>{p.validity_days || 60} Days</b> from purchase</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t text-xs">
                    <Button
                      size="xs"
                      variant="outline"
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                      onClick={() => handleOpenEditPkg(p)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" /> Edit Plan
                    </Button>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="text-destructive hover:bg-red-50"
                      onClick={() => setDeletePkgId(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add / Edit Package Dialog */}
      <Dialog open={pkgDialogOpen} onOpenChange={setPkgDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingPkg ? 'Edit Package Plan' : 'Create New Package Plan'}</DialogTitle>
            <DialogDescription className="text-xs">
              Configure session count, bundle price, and validity duration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Package Plan Name *</Label>
              <Input
                placeholder="e.g. 10-Session Spine Rehab Pack"
                value={pkgName}
                onChange={e => setPkgName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label>Description / Inclusions</Label>
              <Input
                placeholder="e.g. Includes posture rehab & mobilization"
                value={pkgDesc}
                onChange={e => setPkgDesc(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label>Sessions *</Label>
                <Input
                  type="number"
                  min="1"
                  value={pkgSessions}
                  onChange={e => setPkgSessions(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Price (₹) *</Label>
                <Input
                  type="number"
                  min="0"
                  step="100"
                  value={pkgPrice}
                  onChange={e => setPkgPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Validity (Days)</Label>
                <Input
                  type="number"
                  min="1"
                  value={pkgValidity}
                  onChange={e => setPkgValidity(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPkgDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSavePkg} disabled={pkgSaving} className="bg-purple-600 hover:bg-purple-700 text-white">
              {pkgSaving ? 'Saving…' : editingPkg ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Package to Patient Dialog */}
      <Dialog open={issueDialogOpen} onOpenChange={setIssueDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issue Package to Patient</DialogTitle>
            <DialogDescription className="text-xs">
              Assign a prepaid multi-session package to a registered patient.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Select Patient *</Label>
              <Select value={selectedPatientId} onValueChange={(v: string | null) => setSelectedPatientId(v ?? '')}>
                <SelectTrigger className="text-xs bg-white">
                  <SelectValue placeholder="Select Patient" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {patients.map(p => (
                    <SelectItem key={p.id} value={p.id} className="text-xs">
                      {p.full_name} ({p.uid}) - {p.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Select Package Plan *</Label>
              <Select value={selectedPkgId} onValueChange={(v: string | null) => setSelectedPkgId(v ?? '')}>
                <SelectTrigger className="text-xs bg-white">
                  <SelectValue placeholder="Select Package Plan" />
                </SelectTrigger>
                <SelectContent>
                  {packages.map(pkg => (
                    <SelectItem key={pkg.id} value={pkg.id} className="text-xs">
                      {pkg.name} ({pkg.total_sessions} Sessions · {formatCurrency(pkg.price)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Clinic Branch *</Label>
              <Select value={selectedCentreId} onValueChange={(v: string | null) => setSelectedCentreId(v ?? '')}>
                <SelectTrigger className="text-xs bg-white">
                  <SelectValue placeholder="Select Clinic Branch" />
                </SelectTrigger>
                <SelectContent>
                  {centres.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Payment Mode *</Label>
              <Select value={paymentMode} onValueChange={(v: string | null) => setPaymentMode(v ?? 'UPI')}>
                <SelectTrigger className="text-xs bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['UPI', 'Card', 'Cash', 'Bank Transfer'].map(m => (
                    <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIssueDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleIssuePackage} disabled={issueSaving} className="bg-purple-600 hover:bg-purple-700 text-white">
              {issueSaving ? 'Issuing…' : 'Issue & Activate Credits'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePkgId} onOpenChange={() => setDeletePkgId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Package Plan?</AlertDialogTitle>
            <AlertDialogDescription>
              This package will be removed from the catalog. Existing purchased patient balances will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePkg} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
