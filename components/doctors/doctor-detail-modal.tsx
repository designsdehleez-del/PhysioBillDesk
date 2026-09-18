'use client'

import React, { useState } from 'react'
import { 
  User, Award, Building2, Phone, Mail, FileText, Star, 
  DollarSign, Users, Activity, Receipt, Calendar, Clock, 
  CheckCircle2, X, ChevronRight, ShieldCheck, HeartHandshake, Upload
} from 'lucide-react'
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Doctor, PatientFeedback } from '@/lib/supabase/types'
import type { StoredVisit } from '@/lib/data-store'

interface DoctorDetailModalProps {
  doctor: Doctor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  visits: StoredVisit[]
  feedbacks: PatientFeedback[]
  centreName?: string | null
}

export function DoctorDetailModal({
  doctor,
  open,
  onOpenChange,
  visits,
  feedbacks,
  centreName
}: DoctorDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'patients' | 'reviews'>('patients')

  if (!doctor) return null

  const docRawName = doctor.name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()

  // Filter visits for this doctor
  const docVisits = visits.filter(v => {
    if (v.doctor_id && v.doctor_id === doctor.id) return true
    if (v.doctor_name) {
      const vName = v.doctor_name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
      return vName.includes(docRawName) || docRawName.includes(vName)
    }
    return false
  })

  // Filter feedback for this doctor
  const docFeedbacks = feedbacks.filter(f => {
    if (!f.doctor_name) return false
    const fName = f.doctor_name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
    return fName.includes(docRawName) || docRawName.includes(fName)
  })

  const totalRevenue = docVisits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  const patientCount = docVisits.length
  const avgTicket = patientCount > 0 ? Math.round(totalRevenue / patientCount) : 0
  const avgRating = docFeedbacks.length > 0 
    ? (docFeedbacks.reduce((sum, f) => sum + f.rating, 0) / docFeedbacks.length).toFixed(1)
    : '5.0'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-50 p-0 rounded-2xl border-slate-200">
        
        {/* Top Doctor Profile Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <img
                  src={doctor.photo_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
                  alt={doctor.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/30 shadow-lg"
                />
                <Badge className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[9px] font-bold px-1.5 py-0 border border-white">
                  Active DPT
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">{doctor.name}</h2>
                  {doctor.qualification && (
                    <Badge className="bg-blue-500/30 text-blue-200 border border-blue-400/30 text-xs font-bold px-2 py-0.5">
                      {doctor.qualification}
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-blue-200 font-medium">
                  {doctor.specialization || 'Physiotherapy Specialist'} • {doctor.experience_years || '8+ Years'} Experience
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 pt-1">
                  <span className="flex items-center gap-1 font-semibold text-emerald-300">
                    <Building2 className="w-3.5 h-3.5" /> {centreName || 'Physionautics Multispecialty'}
                  </span>
                  {doctor.registration_number && (
                    <span className="flex items-center gap-1 font-mono text-slate-300">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> Reg #: {doctor.registration_number}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Rating Badge */}
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-right shrink-0">
              <div className="text-[10px] uppercase font-bold text-blue-200">Patient CSAT Rating</div>
              <div className="text-2xl font-black text-amber-300 flex items-center justify-end gap-1.5">
                {avgRating} <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-[10px] text-slate-300 font-medium mt-0.5">From {docFeedbacks.length} verified reviews</div>
            </div>
          </div>

          {doctor.bio && (
            <div className="mt-4 pt-3 border-t border-white/10 text-xs text-slate-200 leading-relaxed font-sans">
              &ldquo;{doctor.bio}&rdquo;
            </div>
          )}
        </div>

        {/* Doctor Financial & Clinical Metrics Grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border border-blue-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Total Revenue Billed</p>
                  <p className="text-2xl font-black text-blue-950 mt-0.5">{formatCurrency(totalRevenue)}</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">{patientCount} billed consultations</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  ₹
                </div>
              </CardContent>
            </Card>

            <Card className="border border-emerald-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Attended Patients</p>
                  <p className="text-2xl font-black text-emerald-950 mt-0.5">{patientCount}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold">Unique clinical visits</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                  <Users className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-purple-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Average Ticket Size</p>
                  <p className="text-2xl font-black text-purple-950 mt-0.5">{formatCurrency(avgTicket)}</p>
                  <p className="text-[10px] text-purple-700 font-semibold">Per patient visit</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                  <Receipt className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-amber-200 bg-white shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-slate-500 uppercase">Contact Information</p>
                  <p className="text-xs font-mono font-bold text-slate-900 mt-1">{doctor.phone || 'N/A'}</p>
                  <p className="text-[10px] text-slate-500 truncate">{doctor.email || 'N/A'}</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tab Controls: Attended Patients vs Patient Feedback Reviews */}
          <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs">
            <div className="p-2 bg-slate-100/80 border-b border-slate-200 flex gap-2">
              <button
                onClick={() => setActiveTab('patients')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'patients'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Attended Patients History ({docVisits.length})
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                  activeTab === 'reviews'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Patient CSAT Reviews & Feedback ({docFeedbacks.length})
              </button>
            </div>

            {/* TAB 1: Attended Patients Table */}
            {activeTab === 'patients' && (
              <div className="p-0">
                {docVisits.length === 0 ? (
                  <div className="p-10 text-center text-slate-400 text-xs">
                    No clinical sessions logged for this doctor yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                        <tr className="text-left">
                          <th className="p-3">Visit Date</th>
                          <th className="p-3">Bill #</th>
                          <th className="p-3">Patient Name</th>
                          <th className="p-3">Patient UID</th>
                          <th className="p-3">Procedures Rendered</th>
                          <th className="p-3 text-right">Amount Billed</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {docVisits.map((v, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/80">
                            <td className="p-3 font-bold text-slate-900">{formatDate(v.visit_date)}</td>
                            <td className="p-3 font-mono font-bold text-blue-600">{v.bill_number}</td>
                            <td className="p-3 font-bold text-slate-900">{(v as any).patients?.full_name || (v as any).patient_name || 'Patient'}</td>
                            <td className="p-3 font-mono text-slate-500">{(v as any).patients?.uid || (v as any).patient_uid || v.patient_id}</td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {v.items && v.items.length > 0 ? (
                                  v.items.map((i, iIdx) => (
                                    <Badge key={iIdx} variant="outline" className="bg-blue-50/50 text-[10px] border-blue-200 text-blue-800">
                                      {i.service_name} (x{i.quantity})
                                    </Badge>
                                  ))
                                ) : (
                                  <span className="text-slate-400 italic">General Consultation</span>
                                )}
                              </div>
                            </td>
                            <td className="p-3 text-right font-extrabold text-emerald-700">
                              {formatCurrency(v.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Patient CSAT Reviews & Feedback */}
            {activeTab === 'reviews' && (
              <div className="p-5 space-y-3">
                {docFeedbacks.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No direct patient feedback reviews recorded for this doctor.
                  </div>
                ) : (
                  docFeedbacks.map((fb, fIdx) => (
                    <div key={fIdx} className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{fb.patient_name}</span>
                          {fb.patient_uid && (
                            <Badge variant="outline" className="text-[9px] font-mono text-slate-500">
                              {fb.patient_uid}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 font-bold text-amber-700 text-xs">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          {fb.rating} / 5
                        </div>
                      </div>

                      {fb.comments && (
                        <p className="text-xs text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed">
                          &ldquo;{fb.comments}&rdquo;
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                        <span>Submitted on {formatDate(fb.created_at)}</span>
                        {fb.centre_name && <span>{fb.centre_name}</span>}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
