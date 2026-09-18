'use client'

import { useEffect, useState, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Users, Wallet, Star, ArrowUpRight, ChevronRight, 
  Sparkles, Calendar, Award, Target, Activity, ArrowLeft, MapPin, 
  Printer, Download, ShieldCheck, Building2, Phone, Mail, FileText, Receipt, CheckCircle2
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getDoctors, getVisits, getPatientFeedback, getCentres, type StoredVisit } from '@/lib/data-store'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Doctor, Centre, PatientFeedback } from '@/lib/supabase/types'
import { motion } from 'motion/react'

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [doctor, setDoctor] = useState<Doctor | null>(null)
  const [centre, setCentre] = useState<Centre | null>(null)
  const [visits, setVisits] = useState<StoredVisit[]>([])
  const [feedbacks, setFeedbacks] = useState<PatientFeedback[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'patients' | 'reviews' | 'trends'>('patients')

  useEffect(() => {
    const load = async () => {
      try {
        const [dList, cList, vList, fbList] = await Promise.all([
          getDoctors(),
          getCentres(),
          getVisits(),
          getPatientFeedback(),
        ])

        const foundDoc = dList.find((d: Doctor) => d.id === id)
        if (foundDoc) {
          setDoctor(foundDoc)
          const foundCentre = cList.find((c: Centre) => c.id === foundDoc.centre_id)
          setCentre(foundCentre || null)

          const docRawName = foundDoc.name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
          
          const docVisits = vList.filter((v: StoredVisit) => {
            if (v.doctor_id && v.doctor_id === foundDoc.id) return true
            if (v.doctor_name) {
              const vName = v.doctor_name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
              return vName.includes(docRawName) || docRawName.includes(vName)
            }
            return false
          })
          setVisits(docVisits)

          const docFb = fbList.filter((f: PatientFeedback) => {
            if (!f.doctor_name) return false
            const fName = f.doctor_name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
            return fName.includes(docRawName) || docRawName.includes(fName)
          })
          setFeedbacks(docFb)
        }
      } catch (err) {
        console.error('Failed to load doctor profile:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <div className="p-16 flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <p className="text-xs text-muted-foreground font-medium">Loading Doctor Report Card...</p>
      </div>
    )
  }

  if (!doctor) {
    return (
      <div className="p-12 text-center text-muted-foreground space-y-4">
        <p className="text-sm">Doctor profile not found in clinic records.</p>
        <Button variant="outline" onClick={() => router.push('/doctors')} className="text-xs">
          Return to Doctor Directory
        </Button>
      </div>
    )
  }

  const name = doctor.name.startsWith('Dr.') ? doctor.name : `Dr. ${doctor.name}`
  const specialization = doctor.specialization || 'Physiotherapy Specialist'
  const clinicName = centre?.name || 'Physionautics Multispecialty'
  const totalRevenue = visits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  const patientCount = visits.length
  const avgTicket = patientCount > 0 ? Math.round(totalRevenue / patientCount) : 0
  const avgRating = feedbacks.length > 0 
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : '5.0'

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 pt-4 px-4 sm:px-6">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/doctors')} className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-100 text-xs gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </Button>
          <span className="text-xs font-bold text-slate-400">/</span>
          <span className="text-xs font-bold text-slate-700">Doctor Performance Report Card</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.print()} 
            className="border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold gap-1.5 h-9 rounded-xl"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" /> Print Report Card
          </Button>
        </div>
      </div>

      {/* Hero Doctor Profile & Credentials Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative shrink-0">
              <img
                src={doctor.photo_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'}
                alt={doctor.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white/20 shadow-xl"
              />
              <Badge className="absolute -bottom-2 -right-2 bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 border-2 border-white shadow-xs">
                {doctor.is_active ? 'ACTIVE CONSULTANT' : 'INACTIVE'}
              </Badge>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{name}</h1>
                {doctor.qualification && (
                  <Badge className="bg-blue-500/30 text-blue-200 border border-blue-400/30 text-xs font-bold px-2.5 py-0.5">
                    {doctor.qualification}
                  </Badge>
                )}
              </div>

              <p className="text-xs sm:text-sm text-blue-200 font-semibold">
                {specialization} • {doctor.experience_years || '8+ Years Clinical Practice'}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1.5">
                <span className="flex items-center gap-1.5 font-bold text-emerald-300">
                  <Building2 className="w-4 h-4" /> {clinicName}
                </span>
                {doctor.registration_number && (
                  <span className="flex items-center gap-1.5 font-mono text-slate-200">
                    <ShieldCheck className="w-4 h-4 text-blue-400" /> DMC Reg #: {doctor.registration_number}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick CSAT Rating Box */}
          <div className="bg-white/10 backdrop-blur-md px-5 py-4 rounded-2xl border border-white/20 text-right shrink-0 w-full sm:w-auto">
            <div className="text-[10px] uppercase font-extrabold text-blue-200 tracking-wider">Verified Patient CSAT</div>
            <div className="text-3xl font-black text-amber-300 flex items-center justify-end gap-1.5">
              {avgRating} <Star className="w-6 h-6 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-[11px] text-slate-300 font-medium mt-0.5">{feedbacks.length} Patient Reviews Logged</div>
          </div>
        </div>

        {doctor.bio && (
          <div className="mt-6 pt-4 border-t border-white/15 text-xs text-slate-200 leading-relaxed font-sans relative z-10 max-w-4xl">
            &ldquo;{doctor.bio}&rdquo;
          </div>
        )}
      </motion.div>

      {/* 4 Financial & Clinical Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Billed Revenue */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className="border border-blue-200 bg-white shadow-xs rounded-2xl h-full">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Billed Revenue</p>
                <p className="text-2xl font-black text-blue-950">{formatCurrency(totalRevenue)}</p>
                <p className="text-[11px] text-emerald-600 font-bold">{patientCount} billed consultations</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                ₹
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: Patients Handled */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className="border border-emerald-200 bg-white shadow-xs rounded-2xl h-full">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Attended Patients</p>
                <p className="text-2xl font-black text-emerald-950">{patientCount}</p>
                <p className="text-[11px] text-emerald-700 font-bold">Unique clinical visits</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
                <Users className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Avg Ticket Size */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className="border border-purple-200 bg-white shadow-xs rounded-2xl h-full">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Ticket Size</p>
                <p className="text-2xl font-black text-purple-950">{formatCurrency(avgTicket)}</p>
                <p className="text-[11px] text-purple-700 font-bold">Per consultation session</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-sm">
                <Receipt className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4: Contact Info */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
          <Card className="border border-amber-200 bg-white shadow-xs rounded-2xl h-full">
            <CardContent className="p-5 flex items-center justify-between">
              <div className="space-y-1 min-w-0">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consultant Contact</p>
                <p className="text-xs font-mono font-bold text-slate-900 truncate">{doctor.phone || 'N/A'}</p>
                <p className="text-[11px] text-slate-500 truncate">{doctor.email || 'N/A'}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Phone className="w-6 h-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Report Card Data Tabs */}
      <Card className="border border-slate-200/90 shadow-sm bg-white rounded-2xl overflow-hidden">
        <div className="p-3 bg-slate-100/90 border-b border-slate-200 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('patients')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'patients'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Attended Patients History ({visits.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === 'reviews'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Patient CSAT Reviews & Feedback ({feedbacks.length})
          </button>
        </div>

        {/* TAB 1: Attended Patients Table */}
        {activeTab === 'patients' && (
          <div className="p-0">
            {visits.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                No clinical sessions logged for this doctor yet.
              </div>
            ) : (
              <div className="overflow-x-auto w-full">
                <table className="w-full text-xs min-w-[700px]">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr className="text-left">
                      <th className="p-3.5">Visit Date</th>
                      <th className="p-3.5">Invoice Bill #</th>
                      <th className="p-3.5">Patient Name</th>
                      <th className="p-3.5">Patient UID</th>
                      <th className="p-3.5">Procedures & Therapies Rendered</th>
                      <th className="p-3.5 text-right">Amount Billed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visits.map((v, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3.5 font-bold text-slate-900">{formatDate(v.visit_date)}</td>
                        <td className="p-3.5 font-mono font-bold text-blue-600">{v.bill_number}</td>
                        <td className="p-3.5 font-bold text-slate-900">{(v as any).patients?.full_name || (v as any).patient_name || 'Patient'}</td>
                        <td className="p-3.5 font-mono text-slate-500">{(v as any).patients?.uid || (v as any).patient_uid || v.patient_id}</td>
                        <td className="p-3.5">
                          <div className="flex flex-wrap gap-1">
                            {v.items && v.items.length > 0 ? (
                              v.items.map((i, iIdx) => (
                                <Badge key={iIdx} variant="outline" className="bg-blue-50/50 text-[10px] border-blue-200 text-blue-800 font-semibold">
                                  {i.service_name} (x{i.quantity})
                                </Badge>
                              ))
                            ) : (
                              <span className="text-slate-400 italic">General Consultation</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3.5 text-right font-extrabold text-emerald-700">
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
          <div className="p-6 space-y-4">
            {feedbacks.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs">
                No direct patient feedback reviews recorded for this doctor.
              </div>
            ) : (
              feedbacks.map((fb, fIdx) => (
                <div key={fIdx} className="bg-slate-50 border border-slate-200/90 p-5 rounded-2xl space-y-2.5">
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
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      {fb.rating} / 5
                    </div>
                  </div>

                  {fb.comments && (
                    <p className="text-xs text-slate-700 italic bg-white p-3 rounded-xl border border-slate-200/80 leading-relaxed">
                      &ldquo;{fb.comments}&rdquo;
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>Submitted on {formatDate(fb.created_at)}</span>
                    {fb.centre_name && <span className="font-semibold text-blue-600">{fb.centre_name}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
