'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X, Plus, Minus, CheckCircle, Printer } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/auth-context'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Patient, Service, Centre, Doctor, DiscountPreset } from '@/lib/supabase/types'

interface BillItem { service: Service; quantity: number }
interface SuccessData { billNumber: string; total: number; paymentMode: string; doctorName: string | null; centreName: string | null; patientName: string; visitId: string }

export default function BillingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preselectedId = searchParams.get('patientId')
  const { profile } = useAuth()

  const [patients, setPatients] = useState<Patient[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [discountPresets, setDiscountPresets] = useState<DiscountPreset[]>([])

  const [patientQuery, setPatientQuery] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [selectedCentreId, setSelectedCentreId] = useState('')
  const [selectedDoctorId, setSelectedDoctorId] = useState('')
  const [billItems, setBillItems] = useState<BillItem[]>([])
  const [discountPresetId, setDiscountPresetId] = useState('')
  const [customDiscount, setCustomDiscount] = useState('')
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Card' | 'UPI' | 'Insurance'>('Cash')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<SuccessData | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: sv }, { data: cn }, { data: dc }, { data: dp }] = await Promise.all([
        supabase.from('services').select('*').order('name'),
        supabase.from('centres').select('*').eq('is_active', true).order('name'),
        supabase.from('doctors').select('*').eq('is_active', true).order('name'),
        supabase.from('discount_presets').select('*').eq('is_active', true).order('label'),
      ])
      const cList = (cn as unknown as Centre[]) ?? []
      setServices((sv as unknown as Service[]) ?? [])
      setCentres(cList)
      setDoctors((dc as unknown as Doctor[]) ?? [])
      setDiscountPresets((dp as unknown as DiscountPreset[]) ?? [])

      // If user is a centre staff, lock or match their centre
      if (profile?.role === 'centre_staff') {
        const matched = cList.find(c => c.name.toLowerCase().includes(profile.name.toLowerCase().split(' ')[0]) || (profile.centreName && c.name.includes(profile.centreName)))
        if (matched) setSelectedCentreId(matched.id)
        else if (profile.centreId) setSelectedCentreId(profile.centreId)
      }
    }
    load()
  }, [profile])

  useEffect(() => {
    if (preselectedId) {
      createClient().from('patients').select('*').eq('id', preselectedId).single()
        .then(({ data }) => { if (data) setSelectedPatient(data as unknown as Patient) })
    }
  }, [preselectedId])

  const searchPatients = useCallback(async (q: string) => {
    if (!q.trim()) { setPatients([]); return }
    const supabase = createClient()
    const { data } = await supabase.from('patients').select('*').or(`uid.ilike.%${q}%,full_name.ilike.%${q}%,phone.ilike.%${q}%`).limit(8)
    setPatients(data ?? [])
  }, [])

  useEffect(() => { const t = setTimeout(() => searchPatients(patientQuery), 300); return () => clearTimeout(t) }, [patientQuery, searchPatients])

  const filteredDoctors = selectedCentreId ? doctors.filter(d => d.centre_id === selectedCentreId) : doctors
  const addService = (svc: Service) => {
    setBillItems(prev => {
      const ex = prev.find(i => i.service.id === svc.id)
      if (ex) return prev.map(i => i.service.id === svc.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { service: svc, quantity: 1 }]
    })
  }
  const updateQty = (id: string, delta: number) => {
    setBillItems(prev => prev.map(i => i.service.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i).filter(i => i.quantity > 0))
  }
  const removeItem = (id: string) => setBillItems(prev => prev.filter(i => i.service.id !== id))

  const subtotal = billItems.reduce((s, i) => s + i.service.price * i.quantity, 0)
  const getDiscount = () => {
    if (discountPresetId) {
      const p = discountPresets.find(d => d.id === discountPresetId)
      if (p) return p.type === 'percentage' ? (subtotal * Math.min(p.value, 100)) / 100 : p.value
    }
    return Number(customDiscount) || 0
  }
  const discount = getDiscount()
  const total = Math.max(0, subtotal - discount)

  const selectedCentre = centres.find(c => c.id === selectedCentreId)
  const selectedDoctor = doctors.find(d => d.id === selectedDoctorId)

  const generateBill = async () => {
    if (!selectedPatient || billItems.length === 0) return
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: billNum } = await supabase.rpc('generate_bill_number')
      const { data: visit, error } = await supabase.from('visits').insert({
        bill_number: billNum!, patient_id: selectedPatient.id, subtotal, discount, total,
        payment_mode: paymentMode, visit_date: new Date().toISOString().split('T')[0],
        centre_id: selectedCentreId || null, doctor_id: selectedDoctorId || null,
        doctor_name: selectedDoctor?.name ?? null, centre_name: selectedCentre?.name ?? null,
      }).select('id').single()
      if (error) throw error
      await supabase.from('visit_services').insert(billItems.map(i => ({
        visit_id: visit.id, service_id: i.service.id, service_name: i.service.name, price: i.service.price, quantity: i.quantity,
      })))
      setSuccess({ billNumber: billNum!, total, paymentMode, doctorName: selectedDoctor?.name ?? null, centreName: selectedCentre?.name ?? null, patientName: selectedPatient.full_name, visitId: visit.id })
    } catch (err: unknown) { console.error(err) } finally { setLoading(false) }
  }

  const printBill = () => {
    if (!success || !selectedPatient) return
    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!DOCTYPE html><html><head><title>${success.billNumber}</title><style>body{font-family:sans-serif;max-width:400px;margin:2rem auto;font-size:13px}h2{text-align:center;margin:0}p{margin:2px 0}table{width:100%;border-collapse:collapse;margin:8px 0}th,td{padding:4px;text-align:left;border-bottom:1px solid #ddd}th{font-weight:600}.total{font-weight:bold;font-size:15px}.footer{text-align:center;margin-top:12px;color:#666;font-size:11px}@media print{@page{margin:1in}}</style></head><body>
    <h2>${success.centreName ?? 'Physionautics'}</h2><p style="text-align:center;color:#666;font-size:11px">Clinic Management System</p>
    <hr/><p><strong>Bill No:</strong> ${success.billNumber}</p><p><strong>Date:</strong> ${formatDate(new Date().toISOString())}</p><hr/>
    <p><strong>Patient:</strong> ${selectedPatient.full_name} (${selectedPatient.uid})</p>
    <p><strong>Age/Gender:</strong> ${selectedPatient.age} / ${selectedPatient.gender}</p>
    <p><strong>Phone:</strong> ${selectedPatient.phone}</p>
    ${success.doctorName ? `<p><strong>Doctor:</strong> Dr. ${success.doctorName}</p>` : ''}
    <table><tr><th>Sr</th><th>Service</th><th>Amount</th></tr>
    ${billItems.map((i,idx) => `<tr><td>${idx+1}</td><td>${i.service.name}${i.quantity>1?` x${i.quantity}`:''}</td><td>${formatCurrency(i.service.price*i.quantity)}</td></tr>`).join('')}
    </table>
    <p>Subtotal: ${formatCurrency(subtotal)}</p>${discount>0?`<p>Discount: - ${formatCurrency(discount)}</p>`:''}
    <p class="total">TOTAL: ${formatCurrency(total)}</p><p>Payment: ${success.paymentMode}</p>
    <p class="footer">Thank you. Get well soon!</p></body></html>`)
    w.document.close(); w.print()
  }

  if (success) return (
    <div className="p-6 max-w-lg mx-auto mt-12 text-center space-y-4">
      <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
      <h2 className="text-xl font-bold">Bill Generated!</h2>
      <p className="text-muted-foreground">Bill Number: <span className="font-mono font-semibold text-blue-600">{success.billNumber}</span></p>
      <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1 text-left">
        <div className="flex justify-between"><span>Patient</span><span className="font-medium">{success.patientName}</span></div>
        {success.doctorName && <div className="flex justify-between"><span>Doctor</span><span className="font-medium">Dr. {success.doctorName}</span></div>}
        {success.centreName && <div className="flex justify-between"><span>Centre</span><span className="font-medium">{success.centreName}</span></div>}
        <div className="flex justify-between"><span>Payment</span><span className="font-medium">{success.paymentMode}</span></div>
        <div className="flex justify-between font-bold text-base border-t pt-1"><span>Total</span><span>{formatCurrency(success.total)}</span></div>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={printBill}><Printer className="h-4 w-4 mr-2" />Print Bill</Button>
        <Button variant="outline" onClick={() => { setSuccess(null); setSelectedPatient(null); setBillItems([]); setSelectedCentreId(''); setSelectedDoctorId(''); setDiscountPresetId(''); setCustomDiscount(''); setPaymentMode('Cash') }}>New Bill</Button>
        <Button variant="ghost" onClick={() => router.push('/patients')}>Patient List</Button>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">New Bill</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Patient + Visit Details */}
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Select Patient</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {selectedPatient ? (
                <div className="flex items-start justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">{selectedPatient.full_name}</p>
                    <p className="text-xs font-mono text-blue-600">{selectedPatient.uid}</p>
                    <p className="text-xs text-muted-foreground">{selectedPatient.phone} · {selectedPatient.age} yrs · {selectedPatient.gender}</p>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => setSelectedPatient(null)}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" placeholder="Search by UID, name, or phone…" value={patientQuery} onChange={e => setPatientQuery(e.target.value)} />
                  </div>
                  {patients.length > 0 && (
                    <div className="border rounded-lg divide-y shadow-sm">
                      {patients.map(p => (
                        <button key={p.id} className="w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors" onClick={() => { setSelectedPatient(p); setPatientQuery(''); setPatients([]) }}>
                          <p className="text-sm font-medium">{p.full_name}</p>
                          <p className="text-xs text-muted-foreground">{p.uid} · {p.phone}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Visit Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Centre</Label>
                <Select value={selectedCentreId} onValueChange={(v: string | null) => { setSelectedCentreId(v ?? ''); setSelectedDoctorId('') }}>
                  <SelectTrigger><SelectValue placeholder="Select centre (optional)" /></SelectTrigger>
                  <SelectContent>
                    {centres.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Doctor</Label>
                <Select value={selectedDoctorId} onValueChange={(v: string | null) => setSelectedDoctorId(v ?? '')}>
                  <SelectTrigger><SelectValue placeholder="Select doctor (optional)" /></SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.map(d => <SelectItem key={d.id} value={d.id}>{d.name}{d.specialization ? ` - ${d.specialization}` : ''}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Add Services</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {services.map(s => (
                  <button key={s.id} onClick={() => addService(s)} className="text-left p-2 rounded-lg border hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                    <p className="text-xs font-medium text-gray-900 group-hover:text-blue-700">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(s.price)}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Bill Summary */}
        <div className="space-y-4">
          {billItems.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Bill Summary</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {billItems.map(item => (
                    <div key={item.service.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.service.name}</p>
                        <p className="text-xs text-muted-foreground">{formatCurrency(item.service.price)} each</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQty(item.service.id, -1)}><Minus className="h-3 w-3" /></Button>
                        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                        <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQty(item.service.id, 1)}><Plus className="h-3 w-3" /></Button>
                      </div>
                      <span className="text-sm font-semibold w-20 text-right">{formatCurrency(item.service.price * item.quantity)}</span>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground" onClick={() => removeItem(item.service.id)}><X className="h-3 w-3" /></Button>
                    </div>
                  ))}
                </div>

                <div className="space-y-2 border-t pt-3">
                  <Label>Discount</Label>
                  <Select value={discountPresetId} onValueChange={(v: string | null) => { setDiscountPresetId(v ?? ''); setCustomDiscount('') }}>
                    <SelectTrigger><SelectValue placeholder="Apply preset (optional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No preset</SelectItem>
                      {discountPresets.map(d => <SelectItem key={d.id} value={d.id}>{d.label} ({d.type === 'percentage' ? `${d.value}%` : formatCurrency(d.value)})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {!discountPresetId || discountPresetId === 'none' ? (
                    <Input type="number" min="0" placeholder="Or enter custom amount" value={customDiscount} onChange={e => setCustomDiscount(e.target.value)} />
                  ) : null}
                </div>

                <div className="space-y-1">
                  <Label>Payment Mode</Label>
                  <Select value={paymentMode} onValueChange={(v: string | null) => setPaymentMode((v as typeof paymentMode) || 'Cash')}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['Cash','Card','UPI','Insurance'].map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  {discount > 0 && <div className="flex justify-between text-red-600"><span>Discount</span><span>- {formatCurrency(discount)}</span></div>}
                  <div className="flex justify-between font-bold text-lg text-gray-900 border-t pt-1"><span>Total</span><span>{formatCurrency(total)}</span></div>
                </div>

                <Button className="w-full" disabled={!selectedPatient || loading} onClick={generateBill}>
                  {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" /> : null}
                  Generate Bill
                </Button>
                {!selectedPatient && <p className="text-xs text-center text-muted-foreground">Please select a patient first</p>}
              </CardContent>
            </Card>
          )}
          {billItems.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-sm">Add services from the left panel to build a bill</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}