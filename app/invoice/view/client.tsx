'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Printer, Download, ArrowLeft, Star, CheckCircle2, ShieldCheck, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getVisits, StoredVisit } from '@/lib/data-store'
import { useClinicBranding } from '@/lib/settings-store'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getFeedbackUrl, decodeReportPayload, type InvoicePayload } from '@/lib/whatsapp'

export default function PublicInvoiceViewClient({
  resolvedParams,
}: {
  resolvedParams: { bid?: string; uid?: string; d?: string; print?: string }
}) {
  const bid = resolvedParams.bid
  const uid = resolvedParams.uid
  const dataToken = resolvedParams.d
  const autoPrint = resolvedParams.print === 'true'

  const router = useRouter()
  const { branding } = useClinicBranding()
  const [visit, setVisit] = useState<StoredVisit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // 1. If self-contained data token is in URL, decode immediately
        if (dataToken) {
          const decoded = decodeReportPayload<InvoicePayload>(dataToken)
          if (decoded) {
            const reconstructedVisit: StoredVisit = {
              id: decoded.bid || bid || 'inv-view',
              bill_number: decoded.bid || bid || 'INV-DIGITAL',
              patient_id: decoded.uid || uid || '',
              patient_uid: decoded.uid || uid || 'CLN-PATIENT',
              patient_name: decoded.name || 'Valued Patient',
              patient_phone: decoded.phone || '',
              patient_age: decoded.age ?? undefined,
              patient_gender: decoded.gender ?? undefined,
              doctor_name: decoded.doctor || 'Dr. Clinical Specialist',
              primary_doctor_name: decoded.doctor || 'Dr. Clinical Specialist',
              physiotherapist_name: decoded.physio || null,
              centre_name: decoded.centre || 'New Friends Colony, New Delhi',
              items: (decoded.items || []).map((it, idx) => ({
                id: `item-${idx}`,
                service_id: `svc-${idx}`,
                service_name: it.name,
                price: Number(it.price) || 0,
                quantity: Number(it.qty) || 1,
                total: (Number(it.price) || 0) * (Number(it.qty) || 1),
              })),
              subtotal: Number(decoded.subtotal) || 0,
              discount: Number(decoded.discount) || 0,
              total: Number(decoded.total) || 0,
              payment_mode: (decoded.mode as any) || 'UPI',
              payment_status: 'Paid',
              visit_date: decoded.date || new Date().toISOString().split('T')[0],
              created_at: decoded.date || new Date().toISOString(),
              notes: decoded.notes || '',
            }
            setVisit(reconstructedVisit)
            setLoading(false)
            return
          }
        }

        // 2. Fall back to local visits
        let match: StoredVisit | null = null
        try {
          const all = await getVisits()
          const localMatch = all.find(v => (bid && v.bill_number === bid) || (uid && v.patient_uid === uid))
          if (localMatch) match = localMatch
        } catch (_) {}

        // 3. Fall back to cloud /api/invoice fetch
        if (!match && (bid || uid)) {
          try {
            const apiRes = await fetch(`/api/invoice?${new URLSearchParams({ ...(bid ? { bid } : {}), ...(uid ? { uid } : {}) }).toString()}`, { cache: 'no-store' })
            if (apiRes.ok) {
              const json = await apiRes.json()
              if (json.success && json.data) {
                match = json.data
              }
            }
          } catch (apiErr) {
            console.warn('Failed to fetch from /api/invoice:', apiErr)
          }
        }

        if (match) {
          setVisit(match)
        }
      } catch (err) {
        console.error('Failed to load invoice:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [bid, uid, dataToken])

  useEffect(() => {
    if (!loading && visit && autoPrint) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [loading, visit, autoPrint])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Retrieving official digital invoice...</p>
        </div>
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg border p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto text-xl font-bold">!</div>
          <h2 className="text-xl font-bold text-slate-900">Invoice Record Not Found</h2>
          <p className="text-sm text-slate-600">
            We could not find an invoice matching <strong>{bid || uid || 'the provided link'}</strong>. Please contact the clinic desk for an updated link.
          </p>
          <div className="pt-2">
            <Button onClick={() => router.push('/billing')} variant="outline" className="w-full">
              Go to Billing Desk
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const feedbackUrl = getFeedbackUrl(visit)

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-3 sm:px-6 print:p-0 print:bg-white font-sans text-slate-900">
      {/* Top Action Bar (hidden in print) */}
      <div className="max-w-3xl mx-auto mb-4 flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-slate-600 gap-1.5">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <div className="flex items-center gap-2">
          {feedbackUrl && (
            <Button 
              size="sm" 
              variant="outline" 
              className="text-amber-700 border-amber-300 hover:bg-amber-50 gap-1.5"
              onClick={() => window.open(feedbackUrl, '_blank')}
            >
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> Rate Treatment
            </Button>
          )}
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 shadow-sm" onClick={() => window.print()}>
            <Printer className="w-4 h-4" /> Print / Save PDF
          </Button>
        </div>
      </div>

      {/* Main Invoice Document Canvas */}
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md border print:border-none print:shadow-none overflow-hidden">
        {/* Clinic Header Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 print:bg-none print:text-slate-900 print:p-0 print:border-b-2 print:border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {branding.clinicName || 'PhysioNautics'}
                </span>
                <Badge className="bg-emerald-500/90 text-white text-[10px] tracking-wider uppercase border-none px-2 py-0.5">
                  Verified Digital Bill
                </Badge>
              </div>
              <p className="text-blue-100 print:text-slate-600 text-xs sm:text-sm font-medium">
                {branding.tagline || 'Specialized Physiotherapy, Pain Rehabilitation & Sports Medicine'}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-blue-200 print:text-slate-500 pt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-300 print:text-slate-600" />
                  {visit.centre_name || branding.address}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-300 print:text-slate-600" />
                  {branding.phone || '+91 83839 36905'}
                </span>
              </div>
            </div>

            <div className="sm:text-right bg-blue-950/40 print:bg-transparent rounded-lg p-3 print:p-0 border border-blue-400/20 print:border-none self-stretch sm:self-auto">
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-300 print:text-slate-500 block">TAX INVOICE</span>
              <p className="font-mono text-lg font-bold text-white print:text-slate-900">{visit.bill_number}</p>
              <p className="text-xs text-blue-200 print:text-slate-600 font-mono mt-0.5">Date: {formatDate(visit.visit_date)}</p>
            </div>
          </div>
        </div>

        {/* Patient & Doctor Meta Grid */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Billed To (Patient)</span>
              <p className="font-bold text-slate-900 text-base">{visit.patient_name}</p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 font-mono">
                <span>UID: {visit.patient_uid}</span>
                {visit.patient_age && <span>• Age: {visit.patient_age}</span>}
                {visit.patient_gender && <span>• Sex: {visit.patient_gender}</span>}
              </div>
              {visit.patient_phone && (
                <p className="text-xs text-slate-500 font-mono">Mobile: {visit.patient_phone}</p>
              )}
            </div>

            <div className="space-y-1 sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Clinical Attendants</span>
              <p className="font-semibold text-slate-800 text-sm">
                Primary Specialist: {visit.primary_doctor_name || visit.doctor_name || 'Dr. Clinical Specialist'}
              </p>
              {visit.physiotherapist_name && (
                <p className="text-xs text-slate-600">Attending Physio: {visit.physiotherapist_name}</p>
              )}
              <div className="pt-1">
                <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 text-xs gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Payment Status: {visit.payment_status || 'Paid'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Itemized Services Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Rendered Clinical Services & Treatments</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b text-slate-600 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">#</th>
                    <th className="py-2.5 px-4">Procedure / Package Description</th>
                    <th className="py-2.5 px-4 text-center">Qty</th>
                    <th className="py-2.5 px-4 text-right">Unit Rate</th>
                    <th className="py-2.5 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-800">
                  {(visit.items || []).map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 text-slate-400 text-xs font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{item.service_name}</td>
                      <td className="py-2.5 px-4 text-center font-mono text-xs">{item.quantity}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-xs">{formatCurrency(item.price)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals & Calculations */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pt-2">
            <div className="space-y-2 max-w-sm">
              {visit.notes && (
                <div className="bg-slate-50 border rounded-lg p-3 text-xs text-slate-700">
                  <span className="font-bold text-slate-900 block mb-0.5">Clinical Remarks & Care Advice:</span>
                  {visit.notes}
                </div>
              )}
              <div className="text-[11px] text-slate-400 space-y-0.5 font-mono">
                <p>Payment Mode: <strong className="text-slate-700">{visit.payment_mode || 'Cash'}</strong></p>
                <p>Computer generated invoice, requires no physical signature.</p>
              </div>
            </div>

            <div className="w-full sm:w-64 space-y-2 bg-slate-50 p-4 rounded-lg border">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-medium">{formatCurrency(visit.subtotal)}</span>
              </div>
              {visit.discount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-medium">
                  <span>Authorized Discount:</span>
                  <span className="font-mono">- {formatCurrency(visit.discount)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between text-base font-extrabold text-slate-900">
                <span>Total Amount:</span>
                <span className="font-mono text-blue-700">{formatCurrency(visit.total)}</span>
              </div>
            </div>
          </div>

          {/* Digital Sign-off & Compliance Footer */}
          <div className="border-t pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left text-xs text-slate-500">
            <div className="flex items-center gap-2 text-emerald-700 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Official Record of PhysioNautics Healthcare Pvt. Ltd.</span>
            </div>
            <p className="text-[11px] font-mono text-slate-400">
              Generated: {new Date(visit.created_at || Date.now()).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
