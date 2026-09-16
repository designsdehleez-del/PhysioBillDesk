'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Users, Activity, Calendar, DollarSign, UserPlus, Receipt, 
  Building2, CreditCard, TrendingUp, Filter, Wallet, 
  ArrowUpRight, Star, HeartHandshake, Sparkles, MessageCircle,
  FileSpreadsheet, Award, Download, Layers, CheckCircle2, Ticket,
  UserCog, Stethoscope, Clock, ChevronRight, X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { getVisits, getCentres, getPatientFeedback, getDoctors, exportBillsToExcel, type StoredVisit } from '@/lib/data-store'
import type { Centre, Doctor, PatientFeedback } from '@/lib/supabase/types'

interface DoctorStat {
  id: string
  name: string
  specialization: string
  centre_name: string
  revenue: number
  patientCount: number
  avgTicket: number
  avgRating: string
  feedbackCount: number
  feedbacks: PatientFeedback[]
  visits: StoredVisit[]
  topProcedures: string[]
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [loading, setLoading] = useState(true)
  const [allVisits, setAllVisits] = useState<StoredVisit[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [feedbacks, setFeedbacks] = useState<PatientFeedback[]>([])
  
  // Filters
  const [selectedFilterCentre, setSelectedFilterCentre] = useState<string>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('all')

  // Selected doctor modal for deep financial & feedback drilldown
  const [activeDoctorModal, setActiveDoctorModal] = useState<DoctorStat | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vData, cData, fbData, docData] = await Promise.all([
          getVisits(),
          getCentres(),
          getPatientFeedback(),
          getDoctors(),
        ])
        setAllVisits(vData)
        setCentres(cData)
        setFeedbacks(fbData)
        setDoctors(docData)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // If logged in as clinic staff, restrict data context to their clinic
  const userCentreId = profile?.centreId

  // Timeframe and Centre filtered visits
  const filteredVisits = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    
    return allVisits.filter(v => {
      // If staff, lock to their clinic
      if (!isAdmin && userCentreId) {
        const matchStaff = v.centre_id === userCentreId || 
          (v.centre_name && profile?.centreName && v.centre_name.toLowerCase().includes(profile.centreName.toLowerCase()))
        if (!matchStaff) return false
      } else if (selectedFilterCentre !== 'all') {
        // Admin centre filter
        const matchCentre = v.centre_id === selectedFilterCentre || 
          (v.centre_name && v.centre_name.toLowerCase().includes(selectedFilterCentre.toLowerCase()))
        if (!matchCentre) return false
      }

      // Timeframe Filter
      if (selectedTimeframe === 'today') {
        return v.visit_date === todayStr
      }
      if (selectedTimeframe === '7days') {
        const d = new Date(v.visit_date)
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24)
        return diffDays <= 7
      }
      if (selectedTimeframe === '30days') {
        const d = new Date(v.visit_date)
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24)
        return diffDays <= 30
      }
      return true
    })
  }, [allVisits, selectedFilterCentre, selectedTimeframe, isAdmin, userCentreId, profile])

  // KPIs
  const todayStr = new Date().toISOString().split('T')[0]
  const todayVisitsList = filteredVisits.filter(v => v.visit_date === todayStr)
  const todayRevenue = todayVisitsList.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  const filteredRevenue = filteredVisits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  const totalDiscounts = filteredVisits.reduce((sum, v) => sum + (Number(v.discount) || 0), 0)
  const avgBillSize = filteredVisits.length > 0 ? Math.round(filteredRevenue / filteredVisits.length) : 0
  const uniquePatientsCount = new Set(filteredVisits.map(v => v.patient_uid)).size

  // Feedback Metrics (Filtered by clinic if staff)
  const relevantFeedbacks = useMemo(() => {
    if (!isAdmin && profile?.centreName) {
      return feedbacks.filter(f => 
        f.centre_name && f.centre_name.toLowerCase().includes(profile.centreName!.toLowerCase())
      )
    }
    return feedbacks
  }, [feedbacks, isAdmin, profile])

  const avgFeedbackScore = useMemo(() => {
    if (relevantFeedbacks.length === 0) return '5.0'
    const sum = relevantFeedbacks.reduce((acc, f) => acc + (f.rating || 5), 0)
    return (sum / relevantFeedbacks.length).toFixed(1)
  }, [relevantFeedbacks])

  // Doctor-Wise Financials & Performance Hub
  const doctorStats: DoctorStat[] = useMemo(() => {
    return doctors.map(doc => {
      const docRawName = doc.name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
      
      const docVisits = filteredVisits.filter(v => {
        if (v.doctor_id && v.doctor_id === doc.id) return true
        if (v.doctor_name) {
          const vDocName = v.doctor_name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
          return vDocName.includes(docRawName) || docRawName.includes(vDocName)
        }
        return false
      })

      const revenue = docVisits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
      const patientCount = docVisits.length
      const avgTicket = patientCount > 0 ? Math.round(revenue / patientCount) : 0

      const docFeedbacks = feedbacks.filter(f => {
        if (!f.doctor_name) return false
        const fDocName = f.doctor_name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
        return fDocName.includes(docRawName) || docRawName.includes(fDocName)
      })

      const avgRating = docFeedbacks.length > 0 
        ? (docFeedbacks.reduce((sum, f) => sum + f.rating, 0) / docFeedbacks.length).toFixed(1)
        : '5.0'

      const serviceCounts: Record<string, number> = {}
      docVisits.forEach(v => {
        v.items?.forEach(i => {
          serviceCounts[i.service_name] = (serviceCounts[i.service_name] || 0) + i.quantity
        })
      })
      const topProcedures = Object.entries(serviceCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name]) => name)

      const centreObj = centres.find(c => c.id === doc.centre_id)

      return {
        id: doc.id,
        name: doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`,
        specialization: doc.specialization || 'Physiotherapy Specialist',
        centre_name: centreObj ? centreObj.name : 'Physionautics Multispecialty',
        revenue,
        patientCount,
        avgTicket,
        avgRating,
        feedbackCount: docFeedbacks.length,
        feedbacks: docFeedbacks,
        visits: docVisits,
        topProcedures,
      }
    }).sort((a, b) => b.revenue - a.revenue)
  }, [doctors, filteredVisits, feedbacks, centres])

  // Payment Breakdown
  const paymentBreakdown = useMemo(() => {
    const modes = ['UPI', 'Card', 'Cash', 'Insurance', 'Bank Transfer'] as const
    const colors: Record<string, { bg: string; text: string; hex: string }> = {
      UPI: { bg: 'bg-emerald-500', text: 'text-emerald-700', hex: '#10b981' },
      Card: { bg: 'bg-blue-500', text: 'text-blue-700', hex: '#3b82f6' },
      Cash: { bg: 'bg-amber-500', text: 'text-amber-700', hex: '#f59e0b' },
      Insurance: { bg: 'bg-purple-500', text: 'text-purple-700', hex: '#8b5cf6' },
      'Bank Transfer': { bg: 'bg-teal-500', text: 'text-teal-700', hex: '#14b8a6' },
    }

    return modes.map(mode => {
      const matching = filteredVisits.filter(v => v.payment_mode === mode)
      const amount = matching.reduce((s, v) => s + (Number(v.total) || 0), 0)
      const pct = filteredRevenue > 0 ? Math.round((amount / filteredRevenue) * 100) : 0
      return { mode, count: matching.length, amount, pct, color: colors[mode] }
    }).filter(p => p.count > 0 || filteredRevenue === 0)
  }, [filteredVisits, filteredRevenue])

  // Centre-wise Comparison (Admin Only)
  const centreComparison = useMemo(() => {
    const defaultList = [
      { id: 'c1111111-1111-1111-1111-111111111111', name: 'New Friends Colony, New Delhi', short: 'NFC Delhi', color: '#2563eb' },
      { id: 'c2222222-2222-2222-2222-222222222222', name: 'Vasant Vihar, New Delhi', short: 'Vasant Vihar', color: '#059669' },
      { id: 'c3333333-3333-3333-3333-333333333333', name: 'Gurugram – DLF Phase 1', short: 'Gurugram DLF', color: '#d97706' },
    ]

    const maxRev = Math.max(...defaultList.map(c => {
      const matching = allVisits.filter(v => 
        v.centre_id === c.id || 
        v.centre_name?.toLowerCase().includes(c.short.toLowerCase()) ||
        (c.id.includes('1111') && v.centre_name?.includes('Friends Colony')) ||
        (c.id.includes('2222') && v.centre_name?.includes('Vasant Vihar')) ||
        (c.id.includes('3333') && v.centre_name?.includes('Gurugram'))
      )
      return matching.reduce((s, v) => s + (Number(v.total) || 0), 0)
    }), 1000)

    return defaultList.map(c => {
      const matching = allVisits.filter(v => 
        v.centre_id === c.id || 
        v.centre_name?.toLowerCase().includes(c.short.toLowerCase()) ||
        (c.id.includes('1111') && v.centre_name?.includes('Friends Colony')) ||
        (c.id.includes('2222') && v.centre_name?.includes('Vasant Vihar')) ||
        (c.id.includes('3333') && v.centre_name?.includes('Gurugram'))
      )
      const amount = matching.reduce((s, v) => s + (Number(v.total) || 0), 0)
      const count = matching.length
      const barHeightPct = Math.min(Math.round((amount / maxRev) * 100), 100)
      return { ...c, amount, count, barHeightPct }
    })
  }, [allVisits])

  // Top Procedures / Services Breakdown
  const topServices = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>()
    filteredVisits.forEach(v => {
      v.items?.forEach(i => {
        const cur = map.get(i.service_name) || { count: 0, revenue: 0 }
        cur.count += i.quantity
        cur.revenue += i.price * i.quantity
        map.set(i.service_name, cur)
      })
    })

    return Array.from(map.entries())
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [filteredVisits])

  // Daily Trend (Last 7 Days) for SVG Area Chart
  const dailyTrend = useMemo(() => {
    const days: { label: string; date: string; amount: number; count: number }[] = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
      
      const dayVisits = filteredVisits.filter(v => v.visit_date === dateStr)
      const amount = dayVisits.reduce((s, v) => s + (Number(v.total) || 0), 0)
      
      days.push({ label, date: dateStr, amount, count: dayVisits.length })
    }
    return days
  }, [filteredVisits])

  const maxDayAmount = Math.max(...dailyTrend.map(d => d.amount), 500)

  if (loading) {
    return (
      <div className="p-16 flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <p className="text-xs text-muted-foreground font-medium">Loading clinical intelligence & analytics...</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ================= HEADER & TIMEFRAME FILTERS ================= */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs border border-white/20">
              {isAdmin ? '👑 Master Admin & Financial Command' : `🏥 ${profile?.centreName || 'Clinic Reception Desk'}`}
            </Badge>
            <span className="text-xs text-blue-200">Physionautics Multispecialty Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            {isAdmin ? 'Executive Financial & Clinical Intelligence' : 'Clinic Patient Operations & Treatment Desk'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80">
            {isAdmin 
              ? 'Real-time multi-centre revenue analytics, doctor-wise performance & patient CSAT ratings' 
              : `Live patient attendance, clinical queue & verified patient ratings for ${profile?.centreName || 'this branch'}`}
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-white/10 p-2 rounded-xl border border-white/15 backdrop-blur-md">
          {/* Branch Filter (Admin Only) */}
          {isAdmin && (
            <Select value={selectedFilterCentre} onValueChange={(v: string | null) => setSelectedFilterCentre(v ?? 'all')}>
              <SelectTrigger className="w-52 bg-white text-gray-900 text-xs font-semibold h-9">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs font-medium">All 3 Clinic Branches</SelectItem>
                {centres.map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-xs font-medium">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Timeframe Filter */}
          <div className="flex bg-white/20 p-0.5 rounded-lg border border-white/20 text-xs font-semibold">
            <button
              onClick={() => setSelectedTimeframe('today')}
              className={`px-3 py-1.5 rounded-md transition-all ${selectedTimeframe === 'today' ? 'bg-white text-blue-900 shadow-xs' : 'text-white/80 hover:text-white'}`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedTimeframe('7days')}
              className={`px-3 py-1.5 rounded-md transition-all ${selectedTimeframe === '7days' ? 'bg-white text-blue-900 shadow-xs' : 'text-white/80 hover:text-white'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('30days')}
              className={`px-3 py-1.5 rounded-md transition-all ${selectedTimeframe === '30days' ? 'bg-white text-blue-900 shadow-xs' : 'text-white/80 hover:text-white'}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('all')}
              className={`px-3 py-1.5 rounded-md transition-all ${selectedTimeframe === 'all' ? 'bg-white text-blue-900 shadow-xs' : 'text-white/80 hover:text-white'}`}
            >
              All Time
            </button>
          </div>

          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs gap-1.5 h-9"
              onClick={() => exportBillsToExcel(filteredVisits)}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-300" /> Export Excel
            </Button>
          )}
        </div>
      </div>

      {/* ================= ADMIN VIEW: FINANCIAL INTELLIGENCE ================= */}
      {isAdmin ? (
        <>
          {/* Top Financial KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50/40">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filtered Revenue</p>
                  <p className="text-2xl font-extrabold text-blue-950">{formatCurrency(filteredRevenue)}</p>
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {filteredVisits.length} billed visits
                  </p>
                </div>
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-sm">
                  <DollarSign className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-emerald-50/40">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today&apos;s Collection</p>
                  <p className="text-2xl font-extrabold text-emerald-950">{formatCurrency(todayRevenue)}</p>
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <Activity className="h-3 w-3" /> {todayVisitsList.length} patients today
                  </p>
                </div>
                <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm">
                  <Wallet className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-purple-50/40">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Ticket Size</p>
                  <p className="text-2xl font-extrabold text-purple-950">{formatCurrency(avgBillSize)}</p>
                  <p className="text-[11px] text-purple-700 font-medium flex items-center gap-1">
                    <Receipt className="h-3 w-3" /> Across {filteredVisits.length} invoices
                  </p>
                </div>
                <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-sm">
                  <Receipt className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-amber-50/40">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Network CSAT Rating</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-2xl font-extrabold text-amber-950">{avgFeedbackScore}</p>
                    <div className="flex text-amber-500 text-xs">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
                    <HeartHandshake className="h-3 w-3" /> {feedbacks.length} verified reviews
                  </p>
                </div>
                <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-sm">
                  <Star className="h-6 w-6 fill-white" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ================= DOCTOR-WISE FINANCIALS & CUSTOMER FEEDBACK HUB (NEW) ================= */}
          <Card className="shadow-sm border border-indigo-100 bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/30">
            <CardHeader className="pb-3 border-b bg-indigo-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-base font-extrabold text-indigo-950 flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-indigo-600" />
                  Doctor-Wise Financials & Customer Satisfaction Performance
                </CardTitle>
                <CardDescription className="text-xs text-indigo-900/70">
                  Track individual consultant billings, total patients attended, and verbatim patient feedback
                </CardDescription>
              </div>
              <Badge className="bg-indigo-600 text-white text-xs w-fit">
                {doctorStats.length} Attending Doctors
              </Badge>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctorStats.map((doc, idx) => {
                  const maxDocRev = Math.max(...doctorStats.map(d => d.revenue), 1)
                  const revPct = Math.min(Math.round((doc.revenue / maxDocRev) * 100), 100)

                  return (
                    <div 
                      key={doc.id}
                      className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-indigo-300"
                    >
                      <div className="space-y-3">
                        {/* Doctor Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold flex items-center justify-center text-[10px]">
                                #{idx + 1}
                              </span>
                              <h3 className="font-bold text-gray-900 text-sm truncate">{doc.name}</h3>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">{doc.specialization}</p>
                            <p className="text-[10px] text-indigo-700 font-medium truncate flex items-center gap-1 mt-0.5">
                              <Building2 className="h-3 w-3" /> {doc.centre_name}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-xs font-bold gap-1">
                              ⭐ {doc.avgRating}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground block mt-0.5">
                              {doc.feedbackCount} reviews
                            </span>
                          </div>
                        </div>

                        {/* Revenue & Visits Grid */}
                        <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2.5 rounded-lg text-xs">
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Total Revenue</span>
                            <span className="font-extrabold text-emerald-700 text-sm">{formatCurrency(doc.revenue)}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Patients Treated</span>
                            <span className="font-bold text-gray-900 text-sm">{doc.patientCount} visits</span>
                          </div>
                        </div>

                        {/* Revenue Share Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] text-muted-foreground">
                            <span>Contribution Index</span>
                            <span className="font-semibold text-gray-700">{revPct}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500" 
                              style={{ width: `${Math.max(revPct, 5)}%` }} 
                            />
                          </div>
                        </div>

                        {/* Patient Feedback Quote */}
                        {doc.feedbacks.length > 0 ? (
                          <div className="bg-rose-50/50 border border-rose-100 rounded-lg p-2 text-[11px] text-gray-700 italic">
                            <p className="line-clamp-2">&ldquo;{doc.feedbacks[0].comments}&rdquo;</p>
                            <span className="text-[9px] text-rose-700 font-semibold block mt-1">
                              — {doc.feedbacks[0].patient_name} ({doc.feedbacks[0].rating}★)
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground italic py-1">
                            No patient feedback logged yet for this doctor.
                          </div>
                        )}
                      </div>

                      {/* View Deep Breakdown Button */}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-3 text-xs gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100"
                        onClick={() => setActiveDoctorModal(doc)}
                      >
                        <Receipt className="h-3.5 w-3.5 text-indigo-600" />
                        View Invoices & All Reviews
                        <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* 7-Day Revenue Trend & Multi-Centre Comparison */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Daily Revenue Area Trend (7 cols) */}
            <Card className="lg:col-span-7 shadow-sm border">
              <CardHeader className="pb-3 border-b bg-gray-50/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-600" /> 7-Day Revenue Trendline
                  </CardTitle>
                  <CardDescription className="text-xs">Daily collections & billing velocity</CardDescription>
                </div>
                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                  Avg: {formatCurrency(Math.round(dailyTrend.reduce((a, b) => a + b.amount, 0) / 7))}/day
                </Badge>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="h-44 w-full flex items-end justify-between gap-2 pt-4">
                  {dailyTrend.map((day, idx) => {
                    const heightPct = Math.max(Math.round((day.amount / (maxDayAmount || 1)) * 100), 8)
                    const isToday = day.date === todayStr
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded shadow-md whitespace-nowrap pointer-events-none mb-1">
                          {formatCurrency(day.amount)} ({day.count} visits)
                        </div>
                        <div className="w-full max-w-[36px] bg-blue-100 rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: `${heightPct}%` }}>
                          <div 
                            className={`w-full transition-all rounded-t-lg ${isToday ? 'bg-gradient-to-t from-blue-600 to-indigo-600' : 'bg-gradient-to-t from-blue-400 to-blue-500 group-hover:from-blue-500 group-hover:to-blue-600'}`}
                            style={{ height: '100%' }}
                          />
                        </div>
                        <p className={`text-[11px] font-semibold text-center truncate ${isToday ? 'text-blue-700 font-bold' : 'text-muted-foreground'}`}>
                          {day.label}
                        </p>
                      </div>
                    )
                  })}
                </div>
                <div className="pt-3 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <span>Peak Day: <strong className="text-gray-900">{dailyTrend.slice().sort((a, b) => b.amount - a.amount)[0]?.label}</strong></span>
                  <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 100% Reconciled
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Multi-Centre Collections (5 cols) */}
            <Card className="lg:col-span-5 shadow-sm border">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" /> Multi-Centre Collections
                </CardTitle>
                <CardDescription className="text-xs">Comparative revenue across active branch locations</CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {centreComparison.map(c => (
                  <div key={c.id} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-bold text-gray-900">{c.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-extrabold text-gray-900">{formatCurrency(c.amount)}</span>
                        <span className="text-[11px] text-muted-foreground block">{c.count} visits</span>
                      </div>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(c.barHeightPct, 3)}%`, backgroundColor: c.color }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Payment Breakdown & Procedures */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <Card className="shadow-sm border">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-emerald-600" /> Payment Methods Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {paymentBreakdown.map(p => (
                  <div key={p.mode} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-gray-800">
                        <span className={`h-2.5 w-2.5 rounded-full ${p.color.bg}`} />
                        {p.mode} ({p.count} bills)
                      </span>
                      <span className="font-bold text-gray-900">{formatCurrency(p.amount)} ({p.pct}%)</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${p.color.bg} rounded-full transition-all`} 
                        style={{ width: `${Math.max(p.pct, 3)}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Procedures */}
            <Card className="shadow-sm border">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-600" /> Top Clinical Procedures by Revenue
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-3">
                {topServices.map((svc, idx) => (
                  <div key={svc.name} className="flex items-center justify-between text-xs p-2.5 rounded-lg hover:bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <span className="h-5 w-5 rounded-full bg-amber-100 text-amber-800 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-gray-900 truncate">{svc.name}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-gray-900">{formatCurrency(svc.revenue)}</span>
                      <span className="text-[10px] text-muted-foreground block">{svc.count} sessions</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        /* ================= CLINIC STAFF VIEW: PATIENT OPERATIONS & CLINICAL DESK (NO FINANCIALS) ================= */
        <div className="space-y-6">
          {/* Clinical Operational KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50/40">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patients Attended Today</p>
                  <p className="text-3xl font-extrabold text-blue-950">{todayVisitsList.length}</p>
                  <p className="text-[11px] text-blue-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Today&apos;s In-Clinic Sessions
                  </p>
                </div>
                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-sm">
                  <Activity className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-emerald-50/40">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Patients (Filtered)</p>
                  <p className="text-3xl font-extrabold text-emerald-950">{filteredVisits.length}</p>
                  <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                    <Users className="h-3 w-3" /> {uniquePatientsCount} unique individuals
                  </p>
                </div>
                <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm">
                  <Users className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-purple-50/40">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Centre Doctors</p>
                  <p className="text-3xl font-extrabold text-purple-950">
                    {doctors.filter(d => !userCentreId || d.centre_id === userCentreId).length}
                  </p>
                  <p className="text-[11px] text-purple-700 font-medium flex items-center gap-1">
                    <UserCog className="h-3 w-3" /> On-duty specialists
                  </p>
                </div>
                <div className="p-3 bg-purple-600 text-white rounded-2xl shadow-sm">
                  <UserCog className="h-6 w-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-amber-50/40">
              <CardContent className="p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Branch CSAT Rating</p>
                  <div className="flex items-center gap-1.5">
                    <p className="text-3xl font-extrabold text-amber-950">{avgFeedbackScore}</p>
                    <div className="flex text-amber-500 text-xs">
                      {'★'.repeat(5)}
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-800 font-medium flex items-center gap-1">
                    <HeartHandshake className="h-3 w-3" /> {relevantFeedbacks.length} verified reviews
                  </p>
                </div>
                <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-sm">
                  <Star className="h-6 w-6 fill-white" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Reception Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/patients/register" className="block">
              <Card className="border hover:border-blue-400 hover:shadow-md transition-all bg-gradient-to-r from-blue-50 to-indigo-50 cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 bg-blue-600 text-white rounded-xl">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Register New Patient</h4>
                    <p className="text-xs text-muted-foreground">Issue UID & record medical history</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/billing" className="block">
              <Card className="border hover:border-emerald-400 hover:shadow-md transition-all bg-gradient-to-r from-emerald-50 to-teal-50 cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 bg-emerald-600 text-white rounded-xl">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Generate Session Bill</h4>
                    <p className="text-xs text-muted-foreground">Issue invoice & WhatsApp receipt</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/patients" className="block">
              <Card className="border hover:border-purple-400 hover:shadow-md transition-all bg-gradient-to-r from-purple-50 to-pink-50 cursor-pointer">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="p-3 bg-purple-600 text-white rounded-xl">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">Patient Directory</h4>
                    <p className="text-xs text-muted-foreground">Search medical notes & past visits</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Today's In-Clinic Patient Session Queue & Verified Reviews */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Live Patient Queue (7 cols) */}
            <Card className="lg:col-span-7 shadow-sm border">
              <CardHeader className="pb-3 border-b bg-gray-50/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" /> Today&apos;s Patient Treatment Queue
                  </CardTitle>
                  <CardDescription className="text-xs">Live session log for {profile?.centreName || 'Clinic'}</CardDescription>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                  {todayVisitsList.length} Sessions Logged
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                {todayVisitsList.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground space-y-2">
                    <Activity className="h-8 w-8 mx-auto text-gray-300" />
                    <p className="text-xs font-semibold">No patients logged in clinic today yet</p>
                    <Link href="/billing">
                      <Button size="sm" variant="outline" className="text-xs mt-2">
                        Start First Session
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y text-xs">
                    {todayVisitsList.map(v => (
                      <div key={v.id} className="p-3.5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                        <div className="space-y-1 min-w-0 pr-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{v.patient_name}</span>
                            <Badge variant="outline" className="text-[10px] font-mono text-blue-700 bg-blue-50">
                              {v.patient_uid}
                            </Badge>
                          </div>
                          <p className="text-gray-600 text-[11px] truncate">
                            {v.items?.map(i => i.service_name).join(', ') || 'Physiotherapy Consultation'}
                          </p>
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <UserCog className="h-3 w-3" /> Dr. {v.doctor_name || 'Assigned Specialist'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                            ✓ Completed
                          </Badge>
                          <span className="text-[10px] text-muted-foreground block mt-1">
                            {v.payment_mode}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Branch Patient Reviews (5 cols) */}
            <Card className="lg:col-span-5 shadow-sm border">
              <CardHeader className="pb-3 border-b bg-gray-50/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <HeartHandshake className="h-4 w-4 text-rose-600" /> Branch Patient Feedback
                  </CardTitle>
                  <CardDescription className="text-xs">Direct ratings & testimonials from your patients</CardDescription>
                </div>
                <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-xs">
                  ⭐ {avgFeedbackScore} / 5.0
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {relevantFeedbacks.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">No patient feedback submitted yet</p>
                ) : (
                  relevantFeedbacks.slice(0, 4).map(fb => (
                    <div key={fb.id} className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900">{fb.patient_name}</span>
                        <div className="flex text-amber-500 text-xs">
                          {'★'.repeat(fb.rating || 5)}
                        </div>
                      </div>
                      {fb.comments && (
                        <p className="text-gray-700 italic text-[11px] leading-relaxed">
                          &ldquo;{fb.comments}&rdquo;
                        </p>
                      )}
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-rose-100/60">
                        <span>{fb.doctor_name ? `Dr. ${fb.doctor_name}` : 'Physiotherapist'}</span>
                        <span>{formatDate(fb.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ================= RECENT INVOICES AUDIT TABLE (ADMIN ONLY) ================= */}
      {isAdmin && (
        <Card className="shadow-sm border">
          <CardHeader className="flex flex-row items-center justify-between pb-3 border-b bg-gray-50/50">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Receipt className="h-4 w-4 text-blue-600" /> Recent Billed Invoices & Audit Ledger
              </CardTitle>
              <CardDescription className="text-xs">Live billing transactions across selected criteria</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/billing">
                <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1 h-8">
                  <Receipt className="h-3.5 w-3.5" /> Open Billing Desk
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredVisits.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-xs">
                No transaction records found for the selected timeframe.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100/70 border-b">
                    <tr className="text-left text-gray-700 font-semibold">
                      <th className="p-3">Bill Number</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Patient UID & Name</th>
                      <th className="p-3">Centre Location</th>
                      <th className="p-3">Doctor</th>
                      <th className="p-3 text-center">Payment</th>
                      <th className="p-3 text-right">Net Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredVisits.slice(0, 8).map(v => (
                      <tr key={v.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-3 font-mono font-bold text-blue-700">{v.bill_number}</td>
                        <td className="p-3 text-muted-foreground">{formatDate(v.visit_date)}</td>
                        <td className="p-3">
                          <p className="font-semibold text-gray-900">{v.patient_name}</p>
                          <Badge variant="outline" className="font-mono text-[9px] text-blue-700 bg-blue-50 mt-0.5">
                            {v.patient_uid}
                          </Badge>
                        </td>
                        <td className="p-3 font-medium text-gray-800">{v.centre_name || 'New Friends Colony, New Delhi'}</td>
                        <td className="p-3 text-muted-foreground">{v.doctor_name ? `Dr. ${v.doctor_name}` : 'Consultant'}</td>
                        <td className="p-3 text-center">
                          <Badge variant="outline" className="text-[10px] font-semibold">{v.payment_mode}</Badge>
                        </td>
                        <td className="p-3 text-right font-extrabold text-gray-900">
                          {formatCurrency(v.total)}
                          {v.discount > 0 && (
                            <span className="block text-[10px] text-red-600 font-normal">(-{formatCurrency(v.discount)})</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ================= DOCTOR DETAILED PERFORMANCE & REVIEWS MODAL ================= */}
      {activeDoctorModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border">
            {/* Modal Header */}
            <div className="p-5 border-b bg-gradient-to-r from-indigo-900 to-blue-900 text-white flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-white/20 text-white text-[10px]">Attending Specialist Profile</Badge>
                  <span className="text-xs text-blue-200">{activeDoctorModal.centre_name}</span>
                </div>
                <h2 className="text-xl font-bold mt-1">{activeDoctorModal.name}</h2>
                <p className="text-xs text-blue-100">{activeDoctorModal.specialization}</p>
              </div>
              <button 
                onClick={() => setActiveDoctorModal(null)}
                className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Financial & Clinical Stats Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[10px] font-semibold text-emerald-800 uppercase block">Total Generated</span>
                  <span className="text-lg font-extrabold text-emerald-900">{formatCurrency(activeDoctorModal.revenue)}</span>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100 text-center">
                  <span className="text-[10px] font-semibold text-blue-800 uppercase block">Patient Visits</span>
                  <span className="text-lg font-extrabold text-blue-900">{activeDoctorModal.patientCount} sessions</span>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-center">
                  <span className="text-[10px] font-semibold text-amber-800 uppercase block">CSAT Score</span>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg font-extrabold text-amber-900">{activeDoctorModal.avgRating}</span>
                    <span className="text-amber-500 text-xs">★</span>
                  </div>
                </div>
              </div>

              {/* Top Procedures */}
              <div>
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-600" /> Speciality Procedures Administered
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeDoctorModal.topProcedures.length > 0 ? (
                    activeDoctorModal.topProcedures.map((proc, i) => (
                      <Badge key={i} variant="outline" className="bg-gray-50 text-gray-800 border-gray-200 text-xs">
                        {proc}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-muted-foreground italic">Standard Clinical Physiotherapy</span>
                  )}
                </div>
              </div>

              {/* Verified Patient Reviews & Testimonials */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <HeartHandshake className="h-3.5 w-3.5 text-rose-600" /> Verified Patient Testimonials ({activeDoctorModal.feedbacks.length})
                </h4>
                {activeDoctorModal.feedbacks.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic bg-gray-50 p-3 rounded-lg">
                    No customer feedback records submitted specifically for {activeDoctorModal.name} yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {activeDoctorModal.feedbacks.map(fb => (
                      <div key={fb.id} className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">{fb.patient_name}</span>
                          <div className="flex text-amber-500 text-xs">
                            {'★'.repeat(fb.rating || 5)}
                          </div>
                        </div>
                        <p className="text-gray-700 italic leading-relaxed">&ldquo;{fb.comments}&rdquo;</p>
                        <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1 border-t border-rose-100">
                          <span>Hygiene: {fb.hygiene_rating || 5}★ | Treatment: {fb.treatment_rating || 5}★</span>
                          <span>{formatDate(fb.created_at)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Billed Invoices under Doctor */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Receipt className="h-3.5 w-3.5 text-blue-600" /> Invoices Attended by {activeDoctorModal.name}
                </h4>
                <div className="divide-y border rounded-xl overflow-hidden text-xs max-h-48 overflow-y-auto">
                  {activeDoctorModal.visits.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-3 text-center">No visits logged for this doctor</p>
                  ) : (
                    activeDoctorModal.visits.map(v => (
                      <div key={v.id} className="p-2.5 flex items-center justify-between hover:bg-gray-50">
                        <div>
                          <p className="font-bold text-gray-900">{v.patient_name} <span className="font-normal text-muted-foreground font-mono">({v.bill_number})</span></p>
                          <p className="text-[10px] text-muted-foreground">{formatDate(v.visit_date)} | {v.payment_mode}</p>
                        </div>
                        <span className="font-bold text-emerald-700">{formatCurrency(v.total)}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <Button size="sm" onClick={() => setActiveDoctorModal(null)} className="text-xs">
                Close Doctor Profile
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


