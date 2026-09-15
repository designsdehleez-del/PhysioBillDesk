'use client'
import React, { useEffect, useState, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Search, X, Plus, Minus, CheckCircle, Printer, Download,
  Receipt, UserPlus, Filter, FileSpreadsheet, Eye, User,
  Building2, Stethoscope, Tag, CreditCard, RefreshCw, MessageCircle, Ticket, Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/auth-context'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Patient, Service, Centre, Doctor, DiscountPreset } from '@/lib/supabase/types'
import {
  getCentres, getDoctors, getPatients, getServices,
  getVisits, saveVisit, exportBillsToExcel, exportSingleBillToExcel,
  StoredVisit, BillLineItem
} from '@/lib/data-store'
import { openWhatsAppInvoice } from '@/lib/whatsapp'
import { PrintableInvoiceModal } from '@/components/billing/printable-invoice-modal'
import { WhatsAppShareModal } from '@/components/billing/whatsapp-share-modal'

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedId = searchParams.get('patientId')
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [activeTab, setActiveTab] = useState<'create' | 'ledger'>('create')

  // Data states
  const [patients, setPatients] = useState<Patient[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [discountPresets, setDiscountPresets] = useState<DiscountPreset[]>([])
  const [visits, setVisits] = useState<StoredVisit[]>([])

  // Generator form states
  const [patientQuery, setPatientQuery] = useState('')
  const [searchedPatients, setSearchedPatients] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedCentreId, setSelectedCentreId] = useState('')
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [billItems, setBillItems] = useState<BillLineItem[]>([])
  const [discountPresetId, setDiscountPresetId] = useState('')
  const [customDiscount, setCustomDiscount] = useState('')
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Card' | 'UPI' | 'Insurance' | 'Bank Transfer'>('Cash')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [recentSavedVisit, setRecentSavedVisit] = useState<StoredVisit | null>(null)

  // Custom line item input
  const [customServiceName, setCustomServiceName] = useState('')
  const [customServicePrice, setCustomServicePrice] = useState('')

  // Ledger filters
  const [ledgerSearch, setLedgerSearch] = useState('')
  const [ledgerCentreFilter, setLedgerCentreFilter] = useState('all')

  // Printable modal state
  const [printModalVisit, setPrintModalVisit] = useState<StoredVisit | null>(null)
  const [printModalOpen, setPrintModalOpen] = useState(false)

  // WhatsApp share modal state
  const [whatsAppModalVisit, setWhatsAppModalVisit] = useState<StoredVisit | null>(null)
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    const [cList, dList, pList, vList, sList] = await Promise.all([
      getCentres(),
      getDoctors(),
      getPatients(),
      getVisits(),
      getServices(),
    ])

    const activeCentres = cList.filter(c => c.is_active)
    setCentres(activeCentres)
    setDoctors(dList.filter(d => d.is_active))
    setPatients(pList)
    setVisits(vList)
    setServices(sList)

    setDiscountPresets([
      { id: 'dp-1', label: 'Welcome 10% Discount', type: 'percentage', value: 10, is_active: true, created_at: '' },
      { id: 'dp-2', label: 'Senior Citizen (15%)', type: 'percentage', value: 15, is_active: true, created_at: '' },
      { id: 'dp-3', label: 'Package Waiver (₹200 Off)', type: 'fixed', value: 200, is_active: true, created_at: '' },
      { id: 'dp-4', label: 'Staff / Referral (20%)', type: 'percentage', value: 20, is_active: true, created_at: '' },
    ])

    // Set branch for centre staff
    if (profile?.role === 'centre_staff') {
      const matched = activeCentres.find(
        c => c.name.toLowerCase().includes(profile.name.toLowerCase().split(' ')[0]) ||
             (profile.centreName && c.name.includes(profile.centreName))
      )
      if (matched) setSelectedCentreId(matched.id)
      else if (activeCentres.length > 0) setSelectedCentreId(activeCentres[0].id)
    } else if (activeCentres.length > 0 && !selectedCentreId) {
      setSelectedCentreId(activeCentres[0].id)
    }
  }, [profile, selectedCentreId])

  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {
    if (preselectedId && patients.length > 0) {
      const match = patients.find(p => p.id === preselectedId || p.uid === preselectedId)
      if (match) setSelectedPatient(match)
    }
  }, [preselectedId, patients])

  // Patient search handler
  const handleSearchPatient = (q: string) => {
    setPatientQuery(q)
    if (!q.trim()) {
      setSearchedPatients([])
      return
    }
    const lower = q.toLowerCase().trim()
    const matches = patients.filter(
      p => p.full_name.toLowerCase().includes(lower) ||
           p.uid.toLowerCase().includes(lower) ||
           p.phone.includes(lower)
    ).slice(0, 6)
    setSearchedPatients(matches)
  }

  // Doctor list filtered by selected centre
  const filteredDoctors = selectedCentreId
    ? doctors.filter(d => !d.centre_id || d.centre_id === selectedCentreId)
    : doctors

  // Service item management
  const addServiceItem = (svc: Service) => {
    setBillItems(prev => {
      const ex = prev.find(i => i.service_id === svc.id)
      if (ex) {
        return prev.map(i => i.service_id === svc.id ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.price } : i)
      }
      return [...prev, { service_id: svc.id, service_name: svc.name, price: svc.price, quantity: 1, total: svc.price }]
    })
  }

  const addCustomService = () => {
    if (!customServiceName.trim() || !customServicePrice || Number(customServicePrice) <= 0) return
    const price = Number(customServicePrice)
    setBillItems(prev => [
      ...prev,
      {
        service_id: `custom-${Date.now()}`,
        service_name: customServiceName.trim(),
        price,
        quantity: 1,
        total: price,
      }
    ])
    setCustomServiceName('')
    setCustomServicePrice('')
  }

  const updateItemQty = (index: number, delta: number) => {
    setBillItems(prev => {
      const copy = [...prev]
      const item = copy[index]
      const newQty = item.quantity + delta
      if (newQty <= 0) {
        return copy.filter((_, idx) => idx !== index)
      }
      copy[index] = { ...item, quantity: newQty, total: newQty * item.price }
      return copy
    })
  }

  const removeItem = (index: number) => {
    setBillItems(prev => prev.filter((_, idx) => idx !== index))
  }

  // Calculate totals
  const subtotal = billItems.reduce((s, i) => s + i.price * i.quantity, 0)
  const selectedPreset = discountPresets.find(d => d.id === discountPresetId)

  const getDiscount = () => {
    if (selectedPreset) {
      return selectedPreset.type === 'percentage'
        ? (subtotal * Math.min(selectedPreset.value, 100)) / 100
        : Math.min(selectedPreset.value, subtotal)
    }
    return Math.min(Number(customDiscount) || 0, subtotal)
  }

  const discount = Math.round(getDiscount())
  const total = Math.max(0, subtotal - discount)

  const selectedCentre = centres.find(c => c.id === selectedCentreId)
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId)

  // Save bill
  const handleGenerateBill = async () => {
    if (!selectedPatient || billItems.length === 0) return
    setLoading(true)
    try {
      const saved = await saveVisit({
        patient: selectedPatient,
        doctor: selectedDoctor,
        centre: selectedCentre,
        items: billItems,
        subtotal,
        discount,
        discountPresetName: selectedPreset?.label,
        total,
        paymentMode,
        notes: notes.trim() || undefined,
      })

      setRecentSavedVisit(saved)
      const freshVisits = await getVisits()
      setVisits(freshVisits)
    } catch (err) {
      console.error('Failed to generate bill:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setRecentSavedVisit(null)
    setSelectedPatient(null)
    setBillItems([])
    setDiscountPresetId('')
    setCustomDiscount('')
    setPaymentMode('Cash')
    setNotes('')
    setPatientQuery('')
  }

  // Filtered ledger visits
  const filteredLedgerVisits = visits.filter(v => {
    const matchesCentre = ledgerCentreFilter === 'all' || v.centre_id === ledgerCentreFilter || v.centre_name?.toLowerCase().includes(ledgerCentreFilter.toLowerCase())
    if (!matchesCentre) return false
    if (!ledgerSearch.trim()) return true
    const q = ledgerSearch.toLowerCase().trim()
    return (
      v.bill_number.toLowerCase().includes(q) ||
      v.patient_name.toLowerCase().includes(q) ||
      v.patient_uid.toLowerCase().includes(q) ||
      v.patient_phone.includes(q) ||
      (v.doctor_name && v.doctor_name.toLowerCase().includes(q))
    )
  })

  const totalLedgerRevenue = filteredLedgerVisits.reduce((s, v) => s + v.total, 0)
  const totalLedgerDiscount = filteredLedgerVisits.reduce((s, v) => s + v.discount, 0)

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Structured Billing & Invoices</h1>
            <Badge className={isAdmin ? "bg-purple-600" : "bg-blue-600"}>
              {isAdmin ? "Admin Access" : (profile?.centreName || "Clinic Desk")}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Create itemized bills, print clinic receipts, and export structured Excel ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-gray-100 p-1 rounded-lg flex gap-1 border">
            <Button
              size="sm"
              variant={activeTab === 'create' ? 'default' : 'ghost'}
              className={activeTab === 'create' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 text-xs'}
              onClick={() => setActiveTab('create')}
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create New Bill
            </Button>
            <Button
              size="sm"
              variant={activeTab === 'ledger' ? 'default' : 'ghost'}
              className={activeTab === 'ledger' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 text-xs'}
              onClick={() => setActiveTab('ledger')}
            >
              <Receipt className="h-3.5 w-3.5 mr-1.5" /> Invoices & Ledger ({visits.length})
            </Button>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            onClick={() => exportBillsToExcel(filteredLedgerVisits)}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Export Excel
          </Button>
        </div>
      </div>

      {/* ================= TAB 1: GENERATE NEW BILL ================= */}
      {activeTab === 'create' && (
        <>
          {recentSavedVisit ? (
            <Card className="max-w-xl mx-auto border-emerald-200 bg-emerald-50/40 shadow-md">
              <CardContent className="p-6 text-center space-y-4">
                <CheckCircle className="h-16 w-16 text-emerald-600 mx-auto animate-bounce" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Invoice Generated & Stored!</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Invoice Number: <span className="font-mono font-bold text-blue-700 text-sm">{recentSavedVisit.bill_number}</span>
                  </p>
                </div>

                {/* Bill Summary Preview Box */}
                <div className="bg-white rounded-xl p-4 border text-left text-xs space-y-2 shadow-sm">
                  <div className="flex justify-between border-b pb-1.5">
                    <span className="text-muted-foreground">Patient UID:</span>
                    <span className="font-mono font-bold text-blue-700">{recentSavedVisit.patient_uid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Patient Name:</span>
                    <span className="font-semibold text-gray-900">{recentSavedVisit.patient_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Doctor:</span>
                    <span>{recentSavedVisit.doctor_name ? `Dr. ${recentSavedVisit.doctor_name}` : 'Consultant'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Centre / Branch:</span>
                    <span>{recentSavedVisit.centre_name || 'New Friends Colony, New Delhi'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Charges Itemized:</span>
                    <span className="font-medium">{recentSavedVisit.items.length} service(s)</span>
                  </div>
                  <div className="flex justify-between border-t pt-1.5 text-sm font-bold text-emerald-700">
                    <span>Total Net Paid:</span>
                    <span>{formatCurrency(recentSavedVisit.total)} ({recentSavedVisit.payment_mode})</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm"
                    onClick={() => {
                      setWhatsAppModalVisit(recentSavedVisit)
                      setWhatsAppModalOpen(true)
                    }}
                  >
                    <MessageCircle className="h-4 w-4" /> Share on WhatsApp
                  </Button>
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
                    onClick={() => {
                      setPrintModalVisit(recentSavedVisit)
                      setPrintModalOpen(true)
                    }}
                  >
                    <Printer className="h-4 w-4" /> Print Tax Invoice
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                    onClick={() => exportSingleBillToExcel(recentSavedVisit)}
                  >
                    <Download className="h-4 w-4 text-emerald-600" /> Download Excel Invoice
                  </Button>
                  <Button variant="ghost" onClick={resetForm}>
                    ➕ Create Another Bill
                  </Button>
                  <Button variant="ghost" onClick={() => setActiveTab('ledger')}>
                    📑 View All Invoices
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column (7 cols): Patient, Doctor, Services */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Patient Selector */}
                <Card className="shadow-sm border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4 text-blue-600" /> Step 1: Select Patient
                      </span>
                      <Link href="/patients/register">
                        <Button size="xs" variant="ghost" className="text-xs text-blue-600 hover:text-blue-800 gap-1 h-7">
                          <UserPlus className="h-3 w-3" /> New Patient
                        </Button>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedPatient ? (
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-900 text-sm">{selectedPatient.full_name}</p>
                              <Badge className="bg-blue-600 font-mono text-[10px]">{selectedPatient.uid}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {selectedPatient.phone} · {selectedPatient.age} yrs · {selectedPatient.gender}
                              {selectedPatient.blood_group ? ` · Blood: ${selectedPatient.blood_group}` : ''}
                            </p>
                            {selectedPatient.medical_notes && (
                              <p className="text-[11px] text-blue-800 italic bg-white/60 px-2 py-0.5 rounded mt-1 border border-blue-100">
                                Note: {selectedPatient.medical_notes}
                              </p>
                            )}
                          </div>
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-gray-500 hover:text-red-600" onClick={() => setSelectedPatient(null)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            className="pl-9 text-xs"
                            placeholder="Search by Patient UID (e.g. CLN-202609-0001), Name, or Phone..."
                            value={patientQuery}
                            onChange={e => handleSearchPatient(e.target.value)}
                          />
                        </div>
                        {searchedPatients.length > 0 && (
                          <div className="border rounded-xl divide-y shadow-sm bg-white overflow-hidden max-h-56 overflow-y-auto">
                            {searchedPatients.map(p => (
                              <button
                                key={p.id}
                                className="w-full text-left px-3.5 py-2.5 hover:bg-blue-50 transition-colors flex justify-between items-center"
                                onClick={() => {
                                  setSelectedPatient(p)
                                  setPatientQuery('')
                                  setSearchedPatients([])
                                }}
                              >
                                <div>
                                  <p className="text-xs font-bold text-gray-900">{p.full_name}</p>
                                  <p className="text-[11px] text-muted-foreground">{p.phone} · {p.age} yrs · {p.gender}</p>
                                </div>
                                <Badge variant="outline" className="font-mono text-[10px] text-blue-700 bg-blue-50">
                                  {p.uid}
                                </Badge>
                              </button>
                            ))}
                          </div>
                        )}
                        {!patientQuery && (
                          <p className="text-[11px] text-muted-foreground text-center py-1">
                            Type to search patients or choose from recent registrations
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 2. Centre & Doctor Selection */}
                <Card className="shadow-sm border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-purple-600" /> Step 2: Centre & Attending Doctor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Clinic Centre / Branch</Label>
                      <Select
                        value={selectedCentreId}
                        onValueChange={(v: string | null) => {
                          setSelectedCentreId(v ?? '')
                          setSelectedDoctorId('')
                        }}
                      >
                        <SelectTrigger className="text-xs bg-white">
                          <SelectValue placeholder="Select Clinic Branch" />
                        </SelectTrigger>
                        <SelectContent>
                          {centres.map(c => (
                            <SelectItem key={c.id} value={c.id} className="text-xs">
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold">Consulting Doctor</Label>
                      <Select
                        value={selectedDoctorId}
                        onValueChange={(v: string | null) => setSelectedDoctorId(v ?? '')}
                      >
                        <SelectTrigger className="text-xs bg-white">
                          <SelectValue placeholder="Select Attending Doctor" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredDoctors.map(d => (
                            <SelectItem key={d.id} value={d.id} className="text-xs">
                              {d.name} {d.specialization ? `(${d.specialization})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                {/* 3. Add Services & Custom Charges */}
                <Card className="shadow-sm border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <Stethoscope className="h-4 w-4 text-emerald-600" /> Step 3: Add Services & Charges
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Click preset services or type custom clinical procedures
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {services.map(s => (
                        <button
                          key={s.id}
                          onClick={() => addServiceItem(s)}
                          className="text-left p-2.5 rounded-xl border bg-white hover:border-blue-400 hover:bg-blue-50/70 transition-all group flex flex-col justify-between shadow-xs"
                        >
                          <p className="text-xs font-semibold text-gray-900 group-hover:text-blue-700 line-clamp-2 leading-tight">
                            {s.name}
                          </p>
                          <p className="text-xs font-bold text-emerald-700 mt-2">
                            {formatCurrency(s.price)}
                          </p>
                        </button>
                      ))}
                    </div>

                    {/* Custom line item */}
                    <div className="border-t pt-3 space-y-2">
                      <Label className="text-xs font-semibold text-muted-foreground">Add Custom Procedure / Special Fee</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Procedure description..."
                          className="text-xs flex-1"
                          value={customServiceName}
                          onChange={e => setCustomServiceName(e.target.value)}
                        />
                        <Input
                          type="number"
                          placeholder="Price (₹)"
                          className="text-xs w-28"
                          value={customServicePrice}
                          onChange={e => setCustomServicePrice(e.target.value)}
                        />
                        <Button size="sm" variant="outline" className="text-xs gap-1" onClick={addCustomService}>
                          <Plus className="h-3.5 w-3.5" /> Add
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column (5 cols): Structured Bill Ledger & Summary */}
              <div className="lg:col-span-5 space-y-5">
                <Card className="shadow-sm border sticky top-4">
                  <CardHeader className="pb-3 border-b bg-gray-50/60">
                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Receipt className="h-4 w-4 text-blue-600" /> Structured Invoice Breakdown
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {billItems.length} Item(s)
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    {billItems.length === 0 ? (
                      <div className="py-12 text-center text-muted-foreground space-y-2">
                        <Receipt className="h-10 w-10 text-gray-300 mx-auto" />
                        <p className="text-xs font-medium">No services added yet</p>
                        <p className="text-[11px] text-gray-400">Click services on the left to structure your bill</p>
                      </div>
                    ) : (
                      <>
                        {/* Line items table */}
                        <div className="border rounded-xl overflow-hidden divide-y text-xs">
                          {billItems.map((item, idx) => (
                            <div key={idx} className="p-2.5 flex items-center justify-between gap-2 hover:bg-gray-50/80">
                              <div className="min-w-0 flex-1">
                                <p className="font-semibold text-gray-900 truncate">{item.service_name}</p>
                                <p className="text-[11px] text-muted-foreground">{formatCurrency(item.price)} each</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-6 w-6 rounded"
                                  onClick={() => updateItemQty(idx, -1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-5 text-center font-bold text-xs">{item.quantity}</span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-6 w-6 rounded"
                                  onClick={() => updateItemQty(idx, 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                              <div className="w-16 text-right font-bold text-gray-900">
                                {formatCurrency(item.price * item.quantity)}
                              </div>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-6 w-6 text-gray-400 hover:text-red-600"
                                onClick={() => removeItem(idx)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>

                        {/* Discount & Payment Options */}
                        <div className="space-y-3 border-t pt-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                              <Tag className="h-3.5 w-3.5 text-purple-600" /> Apply Discount
                            </Label>
                            <div className="grid grid-cols-2 gap-2">
                              <Select
                                value={discountPresetId}
                                onValueChange={(v: string | null) => {
                                  setDiscountPresetId(v ?? '')
                                  setCustomDiscount('')
                                }}
                              >
                                <SelectTrigger className="text-xs bg-white">
                                  <SelectValue placeholder="Discount Rule" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="none" className="text-xs">No Preset</SelectItem>
                                  {discountPresets.map(d => (
                                    <SelectItem key={d.id} value={d.id} className="text-xs">
                                      {d.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {!discountPresetId || discountPresetId === 'none' ? (
                                <Input
                                  type="number"
                                  placeholder="Custom (₹)"
                                  className="text-xs"
                                  value={customDiscount}
                                  onChange={e => setCustomDiscount(e.target.value)}
                                />
                              ) : null}
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold flex items-center gap-1.5">
                              <CreditCard className="h-3.5 w-3.5 text-blue-600" /> Payment Mode
                            </Label>
                            <Select
                              value={paymentMode}
                              onValueChange={(v: string | null) => setPaymentMode((v as typeof paymentMode) || 'Cash')}
                            >
                              <SelectTrigger className="text-xs bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {['Cash', 'Card', 'UPI', 'Insurance', 'Bank Transfer'].map(m => (
                                  <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Care Notes / Clinical Remarks</Label>
                            <Input
                              placeholder="e.g. Session 1/5 completed, follow up next Monday"
                              className="text-xs"
                              value={notes}
                              onChange={e => setNotes(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Calculated Grand Total */}
                        <div className="bg-gray-50 p-3.5 rounded-xl border space-y-1.5 text-xs">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Subtotal:</span>
                            <span className="font-semibold text-gray-800">{formatCurrency(subtotal)}</span>
                          </div>
                          {discount > 0 && (
                            <div className="flex justify-between text-red-600 font-semibold">
                              <span>Discount:</span>
                              <span>- {formatCurrency(discount)}</span>
                            </div>
                          )}
                          <div className="flex justify-between text-base font-extrabold text-blue-900 border-t pt-2 mt-1">
                            <span>Total Payable:</span>
                            <span>{formatCurrency(total)}</span>
                          </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md h-10"
                          disabled={!selectedPatient || billItems.length === 0 || loading}
                          onClick={handleGenerateBill}
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                          ) : (
                            <Receipt className="h-4 w-4 mr-2" />
                          )}
                          Generate & Save Invoice
                        </Button>

                        {!selectedPatient && (
                          <p className="text-[11px] text-center text-amber-700 font-medium bg-amber-50 py-1 rounded">
                            ⚠️ Please select a patient to proceed
                          </p>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}

      {/* ================= TAB 2: STRUCTURED INVOICES & LEDGER ================= */}
      {activeTab === 'ledger' && (
        <div className="space-y-5">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Total Revenue Billed</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(totalLedgerRevenue)}</p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Across {filteredLedgerVisits.length} invoices</p>
                </div>
                <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl">
                  <CreditCard className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Total Discounts Given</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{formatCurrency(totalLedgerDiscount)}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Preset & Custom rules</p>
                </div>
                <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
                  <Tag className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm border">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase">Total Invoices Stored</p>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">{filteredLedgerVisits.length}</p>
                  <p className="text-[11px] text-blue-600 font-medium mt-0.5">Active database records</p>
                </div>
                <div className="p-3 bg-blue-100 text-blue-700 rounded-xl">
                  <Receipt className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center bg-gray-50 p-3.5 rounded-xl border">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by Bill #, Patient UID, Patient Name, Doctor..."
                className="pl-9 text-xs bg-white"
                value={ledgerSearch}
                onChange={e => setLedgerSearch(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select
                value={ledgerCentreFilter}
                onValueChange={(v: string | null) => setLedgerCentreFilter(v ?? 'all')}
              >
                <SelectTrigger className="w-52 text-xs bg-white">
                  <SelectValue placeholder="All Clinic Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Clinic Centres</SelectItem>
                  {centres.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                size="sm"
                variant="outline"
                className="text-xs gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                onClick={() => exportBillsToExcel(filteredLedgerVisits)}
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" /> Export Ledger (.xlsx)
              </Button>
            </div>
          </div>

          {/* Ledger Table */}
          <Card className="shadow-sm border overflow-hidden">
            <CardContent className="p-0">
              {filteredLedgerVisits.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground space-y-2">
                  <Receipt className="h-10 w-10 text-gray-300 mx-auto" />
                  <p className="text-sm font-semibold">No invoices match your filter</p>
                  <p className="text-xs text-gray-400">Generate a new bill or clear search filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100/70 border-b">
                      <tr className="text-left text-gray-700 font-semibold">
                        <th className="p-3">Bill Number</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Patient UID & Name</th>
                        <th className="p-3">Branch & Doctor</th>
                        <th className="p-3">Services & Charges Breakdown</th>
                        <th className="p-3 text-right">Net Total</th>
                        <th className="p-3 text-center">Payment</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {filteredLedgerVisits.map(v => (
                        <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="p-3 font-mono font-bold text-blue-700">{v.bill_number}</td>
                          <td className="p-3 text-muted-foreground">{formatDate(v.visit_date)}</td>
                          <td className="p-3">
                            <p className="font-semibold text-gray-900">{v.patient_name}</p>
                            <Badge variant="outline" className="font-mono text-[9px] text-blue-700 bg-blue-50 mt-0.5">
                              {v.patient_uid}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <p className="font-medium text-gray-800">{v.centre_name || 'New Friends Colony, New Delhi'}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {v.doctor_name ? `Dr. ${v.doctor_name}` : 'Consultant'}
                            </p>
                          </td>
                          <td className="p-3 max-w-xs">
                            <div className="space-y-0.5">
                              {v.items.map((i, idx) => (
                                <p key={idx} className="text-[11px] text-gray-700 truncate">
                                  • {i.service_name} <span className="text-muted-foreground font-mono">({i.quantity}x @ ₹{i.price})</span>
                                </p>
                              ))}
                            </div>
                          </td>
                          <td className="p-3 text-right font-extrabold text-gray-900">
                            {formatCurrency(v.total)}
                            {v.discount > 0 && (
                              <span className="block text-[10px] text-red-600 font-normal">
                                (-{formatCurrency(v.discount)})
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-center">
                            <Badge variant="outline" className="text-[10px] font-semibold">
                              {v.payment_mode}
                            </Badge>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="xs"
                                variant="outline"
                                className="h-7 px-2 text-[11px] gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => {
                                  setWhatsAppModalVisit(v)
                                  setWhatsAppModalOpen(true)
                                }}
                                title="Preview & Share Invoice on WhatsApp"
                              >
                                <MessageCircle className="h-3 w-3" /> WhatsApp
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                className="h-7 px-2 text-[11px] gap-1 border-blue-200 text-blue-700 hover:bg-blue-50"
                                onClick={() => {
                                  setPrintModalVisit(v)
                                  setPrintModalOpen(true)
                                }}
                              >
                                <Printer className="h-3 w-3" /> Print
                              </Button>
                              <Button
                                size="xs"
                                variant="outline"
                                className="h-7 px-2 text-[11px] gap-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                onClick={() => exportSingleBillToExcel(v)}
                                title="Download Excel Invoice"
                              >
                                <Download className="h-3 w-3" /> Excel
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Printable Invoice Modal Component */}
      <PrintableInvoiceModal
        visit={printModalVisit}
        open={printModalOpen}
        onOpenChange={setPrintModalOpen}
      />

      {/* WhatsApp Share & Prewritten Message Modal */}
      <WhatsAppShareModal
        visit={whatsAppModalVisit}
        open={whatsAppModalOpen}
        onOpenChange={setWhatsAppModalOpen}
      />
    </div>
  )
}