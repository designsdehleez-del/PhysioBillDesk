'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Printer, Receipt, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils'
import type { Patient, VisitWithServices } from '@/lib/supabase/types'

import { PrintableInvoiceModal } from '@/components/billing/printable-invoice-modal'
import { StoredVisit } from '@/lib/data-store'

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [patient, setPatient] = useState<Patient | null>(null)
  const [visits, setVisits] = useState<VisitWithServices[]>([])
  const [loading, setLoading] = useState(true)
  const [modalVisit, setModalVisit] = useState<StoredVisit | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const [{ data: p }, { data: v }] = await Promise.all([
        supabase.from('patients').select('*').eq('id', id).single(),
        supabase.from('visits').select('*, visit_services(*), patients(full_name,uid,age,gender,phone)').eq('patient_id', id).order('visit_date', { ascending: false }),
      ])
      setPatient(p); setVisits((v as VisitWithServices[]) ?? []); setLoading(false)
    }
    load()
  }, [id])

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
  if (!patient) return <div className="p-6 text-center text-muted-foreground">Patient not found</div>

  const infoRows = [
    ['Patient ID', patient.uid], ['Full Name', patient.full_name], ['Age', `${patient.age} years`],
    ['Gender', patient.gender], ['Blood Group', patient.blood_group ?? 'N/A'],
    ['Phone', patient.phone], ['Email', patient.email ?? 'N/A'], ['Address', patient.address ?? 'N/A'],
    ['Registered', formatDateTime(patient.created_at)],
  ]

  const openPrintModal = (v: VisitWithServices) => {
    const converted: StoredVisit = {
      id: v.id,
      bill_number: v.bill_number,
      patient_id: patient.id,
      patient_uid: patient.uid,
      patient_name: patient.full_name,
      patient_phone: patient.phone,
      patient_age: patient.age,
      patient_gender: patient.gender,
      patient_address: patient.address || undefined,
      doctor_id: v.doctor_id,
      doctor_name: v.doctor_name,
      doctor_specialization: null,
      centre_id: v.centre_id,
      centre_name: v.centre_name,
      centre_address: null,
      centre_phone: null,
      items: (v.visit_services || []).map(s => ({
        id: s.id,
        service_id: s.service_id,
        service_name: s.service_name,
        price: Number(s.price) || 0,
        quantity: Number(s.quantity) || 1,
        total: (Number(s.price) || 0) * (Number(s.quantity) || 1),
      })),
      subtotal: Number(v.subtotal) || 0,
      discount: Number(v.discount) || 0,
      total: Number(v.total) || 0,
      payment_mode: (v.payment_mode as any) || 'Cash',
      payment_status: 'Paid',
      visit_date: v.visit_date,
      created_at: v.created_at,
    }
    setModalVisit(converted)
    setModalOpen(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{patient.full_name}</h1>
            <p className="text-sm text-muted-foreground font-mono">{patient.uid}</p>
          </div>
        </div>
        <Button onClick={() => router.push(`/billing?patientId=${patient.id}`)}><Receipt className="h-4 w-4 mr-2" />New Bill</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><User className="h-4 w-4" />Patient Info</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {infoRows.map(([label, val]) => (
              <div key={label} className="flex justify-between text-sm gap-2">
                <span className="text-muted-foreground flex-shrink-0">{label}</span>
                <span className="font-medium text-right text-gray-900 break-all">{val}</span>
              </div>
            ))}
            {patient.medical_notes && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground mb-1">Medical Notes</p>
                <p className="text-sm text-gray-900 whitespace-pre-wrap">{patient.medical_notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-semibold text-gray-900">Visit History ({visits.length})</h2>
          {visits.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                No visits yet
                <br />
                <Button className="mt-4" size="sm" onClick={() => router.push(`/billing?patientId=${patient.id}`)}>Create First Bill</Button>
              </CardContent>
            </Card>
          ) : visits.map(v => (
            <Card key={v.id}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3 gap-2 flex-wrap">
                  <div>
                    <p className="font-mono text-sm font-semibold text-blue-600">{v.bill_number}</p>
                    <p className="text-xs text-muted-foreground">{formatDate(v.visit_date)}</p>
                    {v.doctor_name && <p className="text-xs text-muted-foreground">Dr. {v.doctor_name}{v.centre_name ? ` - ${v.centre_name}` : ''}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{v.payment_mode}</Badge>
                    <Button size="sm" variant="outline" className="no-print" onClick={() => openPrintModal(v)}>
                      <Printer className="h-3 w-3 mr-1" />Print
                    </Button>
                  </div>
                </div>
                <table className="w-full text-xs mb-3">
                  <thead><tr className="text-left text-muted-foreground border-b"><th className="pb-1">Service</th><th className="pb-1 text-center">Qty</th><th className="pb-1 text-right">Amount</th></tr></thead>
                  <tbody>{v.visit_services?.map(s => (
                    <tr key={s.id} className="border-b last:border-0">
                      <td className="py-1">{s.service_name}</td>
                      <td className="py-1 text-center">{s.quantity}</td>
                      <td className="py-1 text-right">{formatCurrency(s.price * s.quantity)}</td>
                    </tr>
                  ))}</tbody>
                </table>
                <div className="text-sm space-y-1 text-right">
                  <div className="flex justify-between text-muted-foreground"><span>Subtotal</span><span>{formatCurrency(v.subtotal)}</span></div>
                  {v.discount > 0 && <div className="flex justify-between text-red-600"><span>Discount</span><span>- {formatCurrency(v.discount)}</span></div>}
                  <div className="flex justify-between font-bold text-base text-gray-900 border-t pt-1"><span>Total</span><span>{formatCurrency(v.total)}</span></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <PrintableInvoiceModal
        visit={modalVisit}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </div>
  )
}