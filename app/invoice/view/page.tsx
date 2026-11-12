'use client'

import React, { useEffect, useState, use } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Printer, Download, ArrowLeft, Star, CheckCircle2, ShieldCheck, Phone, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getVisits, StoredVisit } from '@/lib/data-store'
import { useClinicBranding } from '@/lib/settings-store'
import { formatCurrency, formatDate } from '@/lib/utils'
import { getFeedbackUrl } from '@/lib/whatsapp'

export default function PublicInvoiceViewPage({ searchParams }: { searchParams: Promise<{ bid?: string; uid?: string; print?: string }> }) {
  const resolvedParams = use(searchParams)
  const bid = resolvedParams.bid
  const uid = resolvedParams.uid
  const autoPrint = resolvedParams.print === 'true'

  const router = useRouter()
  const { branding } = useClinicBranding()
  const [visit, setVisit] = useState<StoredVisit | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const all = await getVisits()
        const match = all.find(v => (bid && v.bill_number === bid) || (uid && v.patient_uid === uid))
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
  }, [bid, uid])

  useEffect(() => {
    if (!loading && visit && autoPrint) {
      setTimeout(() => {
        window.print()
      }, 500)
    }
  }, [loading, visit, autoPrint])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-6">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-600">Generating Official Digital Invoice...</p>
      </div>
    )
  }

  if (!visit) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-1">Invoice Record Not Found</h2>
          <p className="text-xs text-slate-500 mb-6">
            The requested invoice (Ref: {bid || uid || 'N/A'}) could not be located or may have been archived.
          </p>
          <Button onClick={() => router.push('/')} variant="outline" className="text-xs rounded-xl">
            Go to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-100/80 py-6 sm:py-10 px-3 sm:px-6 print:bg-white print:p-0">
      {/* Top Floating Action Bar */}
      <div className="max-w-3xl mx-auto mb-4 print:hidden flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 gap-1 text-[11px] font-bold py-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Digital Invoice
          </Badge>
          <span className="text-xs font-mono font-bold text-slate-600">{visit.bill_number}</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl shadow-xs gap-1.5 flex-1 sm:flex-initial"
          >
            <Download className="w-3.5 h-3.5" /> Download Official PDF
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open(getFeedbackUrl(visit), '_blank')}
            className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs h-9 px-3.5 rounded-xl gap-1.5 flex-1 sm:flex-initial"
          >
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Rate Experience
          </Button>
        </div>
      </div>

      {/* Main Printable Invoice Card */}
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-200 p-6 sm:p-10 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
          <div>
            {branding.logoUrl ? (
              <img src={branding.logoUrl} alt={branding.clinicName || 'PhysioNautics'} className="h-12 max-w-[200px] object-contain mb-2" />
            ) : (
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{branding.clinicName || 'PhysioNautics'}</h1>
            )}
            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">{branding.tagline || 'Physiotherapy & Pain Rehabilitation Centre'}</p>
            <div className="text-[11px] text-slate-500 mt-2 space-y-0.5 leading-relaxed">
              <p className="font-semibold text-slate-700">{visit.centre_name || branding.clinicName || 'PhysioNautics Clinic'}</p>
              <p>{visit.centre_address || branding.address}</p>
              <p>Phone: {visit.centre_phone || branding.phone} | GSTIN: {branding.gstin || '07AAAAA0000A1Z5'}</p>
            </div>
          </div>

          <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-2xl w-full sm:w-auto border sm:border-none">
            <span className="inline-block bg-blue-600 text-white font-mono font-bold text-xs px-3 py-1 rounded-lg">
              {visit.bill_number}
            </span>
            <div className="text-xs text-slate-600 mt-2 space-y-0.5">
              <p>Billing Date: <strong className="text-slate-900">{formatDate(visit.visit_date)}</strong></p>
              <p>Payment Mode: <strong className="text-emerald-700">{visit.payment_mode} (Paid)</strong></p>
            </div>
          </div>
        </div>

        {/* Patient & Doctor Particulars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-b border-slate-200 text-xs">
          <div className="bg-slate-50/70 p-4 rounded-2xl space-y-1.5 border border-slate-100">
            <h3 className="font-bold text-blue-900 uppercase tracking-wider text-[10px]">Patient Particulars</h3>
            <p className="text-sm font-bold text-slate-900">{visit.patient_name}</p>
            <p className="text-slate-600 font-mono">UID: {visit.patient_uid}</p>
            <p className="text-slate-600">Mobile: {visit.patient_phone || '—'}</p>
            {visit.patient_age && <p className="text-slate-500">{visit.patient_age} Yrs • {visit.patient_gender}</p>}
          </div>

          <div className="bg-slate-50/70 p-4 rounded-2xl space-y-1.5 border border-slate-100">
            <h3 className="font-bold text-purple-900 uppercase tracking-wider text-[10px]">Consultation & Care Team</h3>
            <p className="text-slate-700"><span className="text-slate-400">Primary Doctor:</span> <strong className="text-slate-900">{visit.primary_doctor_name || visit.doctor_name || 'Dr. Clinical Consultant'}</strong></p>
            <p className="text-slate-700"><span className="text-slate-400">Attending Physio:</span> <strong className="text-slate-900">{visit.physiotherapist_name || 'Physiotherapy Specialist'}</strong></p>
            <p className="text-slate-700"><span className="text-slate-400">Facility:</span> {visit.centre_name || 'New Friends Colony, New Delhi'}</p>
          </div>
        </div>

        {/* Services & Procedures Table */}
        <div className="py-6">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Itemized Procedures & Consultations</h3>
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase text-[10px] tracking-wider text-left border-y border-slate-200">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Clinical Service / Procedure</th>
                <th className="py-2.5 px-3 text-center">Qty</th>
                <th className="py-2.5 px-3 text-right">Rate</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(visit.items || []).map((it, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-3 text-slate-400 font-mono">{idx + 1}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900">{it.service_name}</td>
                  <td className="py-3 px-3 text-center text-slate-600 font-mono">{it.quantity}</td>
                  <td className="py-3 px-3 text-right text-slate-600 font-mono">{formatCurrency(it.price)}</td>
                  <td className="py-3 px-3 text-right font-bold text-slate-900 font-mono">{formatCurrency(it.price * it.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals & Net Amount */}
        <div className="flex justify-end pt-4 border-t border-slate-200">
          <div className="w-full sm:w-72 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal:</span>
              <span className="font-mono font-semibold">{formatCurrency(visit.subtotal || 0)}</span>
            </div>
            {visit.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Discount Applied:</span>
                <span className="font-mono">-{formatCurrency(visit.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-blue-900 border-t-2 border-blue-600 pt-2 mt-2">
              <span>Net Total Paid:</span>
              <span className="font-mono">{formatCurrency(visit.total || 0)}</span>
            </div>
            <p className="text-[10px] text-right text-slate-400 font-medium">Payment Received via {visit.payment_mode}</p>
          </div>
        </div>

        {/* Feedback Callout Banner */}
        <div className="mt-8 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between text-xs text-emerald-900 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-base">⭐</span>
            <div>
              <p className="font-bold">We value your recovery & experience!</p>
              <p className="text-[11px] text-emerald-700">Please take 30 seconds to rate your session with our clinical team.</p>
            </div>
          </div>
          <Button
            onClick={() => window.open(getFeedbackUrl(visit), '_blank')}
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shrink-0"
          >
            Leave Feedback →
          </Button>
        </div>

        {/* Footer & Signature Line */}
        <div className="mt-10 pt-6 border-t border-dashed border-slate-300 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-[11px] text-slate-500">
          <div>
            <p className="font-bold text-slate-800">{branding.invoiceFooterNote || 'Thank you for trusting PhysioNautics!'}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Computer-generated official receipt for patient UID {visit.patient_uid}.<br />
              Valid for consultation records, corporate health claims, and medical reimbursements.
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="w-36 border-b border-slate-400 mb-1" />
            <p className="font-bold text-slate-800">Authorized Signatory</p>
            <p className="text-[10px] text-slate-400">PhysioNautics Clinical Desk</p>
          </div>
        </div>
      </div>
    </div>
  )
}
