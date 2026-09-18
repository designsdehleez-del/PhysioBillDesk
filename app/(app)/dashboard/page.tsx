'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Users, Activity, Calendar, DollarSign, UserPlus, Receipt, 
  Building2, CreditCard, TrendingUp, Filter, Wallet, 
  ArrowUpRight, Star, HeartHandshake, Sparkles, MessageCircle,
  FileSpreadsheet, Award, Download, Layers, CheckCircle2, Ticket,
  UserCog, Stethoscope, Clock, ChevronRight, X, Trash2, Plus, ArrowDownRight, Tag
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { 
  getVisits, getCentres, getPatientFeedback, getDoctors, exportBillsToExcel, 
  getExpenses, deleteExpense, exportExpensesToExcel, type StoredVisit 
} from '@/lib/data-store'
import { FinancialTrackingView } from '@/components/dashboard/financial-tracking-view'
import { ExpenseLoggingModal } from '@/components/dashboard/expense-logging-modal'
import { DoctorDetailModal } from '@/components/doctors/doctor-detail-modal'
import { Centre, Doctor, PatientFeedback, ClinicExpense, ExpenseCategory } from '@/lib/supabase/types'
import { motion } from 'motion/react'

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
  rawCentreId?: string | null
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [loading, setLoading] = useState(true)
  const [allVisits, setAllVisits] = useState<StoredVisit[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [feedbacks, setFeedbacks] = useState<PatientFeedback[]>([])
  const [expenses, setExpenses] = useState<ClinicExpense[]>([])
  
  // Filters
  const [selectedFilterCentre, setSelectedFilterCentre] = useState<string>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('all')

  // Selected doctor modal for deep financial & feedback drilldown
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<Doctor | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vData, cData, fbData, docData, expData] = await Promise.all([
          getVisits(),
          getCentres(),
          getPatientFeedback(),
          getDoctors(),
          getExpenses(),
        ])
        setAllVisits(vData)
        setCentres(cData)
        setFeedbacks(fbData)
        setDoctors(docData)
        setExpenses(expData)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()

    const handleExpensesUpdated = (e: any) => {
      if (e.detail) setExpenses(e.detail)
      else getExpenses().then(setExpenses)
    }

    window.addEventListener('physio-expenses-updated', handleExpensesUpdated)
    return () => {
      window.removeEventListener('physio-expenses-updated', handleExpensesUpdated)
    }
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
        const selectedCentreObj = centres.find(c => c.id === selectedFilterCentre)
        const matchCentre = v.centre_id === selectedFilterCentre || 
          (v.centre_name && selectedCentreObj && v.centre_name.toLowerCase().includes(selectedCentreObj.name.toLowerCase()))
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
  }, [allVisits, selectedFilterCentre, selectedTimeframe, isAdmin, userCentreId, profile, centres])

  // Timeframe and Centre filtered operational expenses
  const filteredExpenses = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    return expenses.filter(e => {
      if (!isAdmin && userCentreId) {
        const matchStaff = e.centre_id === userCentreId || 
          (e.centre_name && profile?.centreName && e.centre_name.toLowerCase().includes(profile.centreName.toLowerCase()))
        if (!matchStaff) return false
      } else if (selectedFilterCentre !== 'all') {
        const selectedCentreObj = centres.find(c => c.id === selectedFilterCentre)
        const matchCentre = e.centre_id === selectedFilterCentre || 
          (e.centre_name && selectedCentreObj && e.centre_name.toLowerCase().includes(selectedCentreObj.name.toLowerCase())) ||
          (selectedCentreObj && e.centre_name && selectedCentreObj.name.toLowerCase().includes(e.centre_name.toLowerCase()))
        if (!matchCentre) return false
      }

      if (selectedTimeframe === 'today') return e.expense_date === todayStr
      if (selectedTimeframe === '7days') {
        const d = new Date(e.expense_date)
        return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 7
      }
      if (selectedTimeframe === '30days') {
        const d = new Date(e.expense_date)
        return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 30
      }
      return true
    })
  }, [expenses, selectedFilterCentre, selectedTimeframe, isAdmin, userCentreId, profile, centres])

  // Revenue & Expense Financial Indicators
  const todayStr = new Date().toISOString().split('T')[0]
  const todayVisitsList = filteredVisits.filter(v => v.visit_date === todayStr)
  const todayRevenue = todayVisitsList.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  const filteredRevenue = filteredVisits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const netRevenue = filteredRevenue - totalExpenses
  const netMarginPct = filteredRevenue > 0 ? ((netRevenue / filteredRevenue) * 100).toFixed(1) : '0.0'
  const avgBillSize = filteredVisits.length > 0 ? Math.round(filteredRevenue / filteredVisits.length) : 0

  // Feedback Metrics (Filtered specifically by clinic if filter or staff active)
  const relevantFeedbacks = useMemo(() => {
    if (!isAdmin && profile?.centreName) {
      return feedbacks.filter(f => 
        f.centre_name && f.centre_name.toLowerCase().includes(profile.centreName!.toLowerCase())
      )
    }
    if (isAdmin && selectedFilterCentre !== 'all') {
      const selectedCentreObj = centres.find(c => c.id === selectedFilterCentre)
      return feedbacks.filter(f => {
        if (!f.centre_name) return false
        if (selectedCentreObj) {
          return f.centre_name.toLowerCase().includes(selectedCentreObj.name.toLowerCase()) ||
                 selectedCentreObj.name.toLowerCase().includes(f.centre_name.toLowerCase())
        }
        return f.centre_name.toLowerCase().includes(selectedFilterCentre.toLowerCase())
      })
    }
    return feedbacks
  }, [feedbacks, isAdmin, profile, selectedFilterCentre, centres])

  const avgFeedbackScore = useMemo(() => {
    if (relevantFeedbacks.length === 0) return '5.0'
    const sum = relevantFeedbacks.reduce((acc, f) => acc + (f.rating || 5), 0)
    return (sum / relevantFeedbacks.length).toFixed(1)
  }, [relevantFeedbacks])

  // Doctor-Wise Financials & Performance Hub (Strictly scoped)
  const doctorStats: DoctorStat[] = useMemo(() => {
    return doctors
      .map(doc => {
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
          rawCentreId: doc.centre_id,
        }
      })
      .filter(doc => {
        if (selectedFilterCentre === 'all') return true
        const matchesCentreId = doc.rawCentreId === selectedFilterCentre
        const selectedCentreObj = centres.find(c => c.id === selectedFilterCentre)
        const matchesCentreName = selectedCentreObj && doc.centre_name.toLowerCase().includes(selectedCentreObj.name.toLowerCase())
        const hasVisitsInFilter = doc.patientCount > 0
        return matchesCentreId || matchesCentreName || hasVisitsInFilter
      })
      .sort((a, b) => b.revenue - a.revenue)
  }, [doctors, filteredVisits, feedbacks, centres, selectedFilterCentre])

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

  // Expense Categories Aggregation
  const expenseCategoryBreakdown = useMemo(() => {
    const categories: ExpenseCategory[] = [
      'Staff Salaries',
      'Rent & Lease',
      'Equipment & Maintenance',
      'Medical Supplies',
      'Utilities & Bills',
      'Marketing & Admin',
      'Miscellaneous',
    ]

    return categories.map(cat => {
      const matching = filteredExpenses.filter(e => e.category === cat)
      const amount = matching.reduce((s, e) => s + (Number(e.amount) || 0), 0)
      const pct = totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
      return { category: cat, count: matching.length, amount, pct }
    }).filter(c => c.amount > 0)
  }, [filteredExpenses, totalExpenses])

  // Centre-wise Comparison (Isolated when single clinic selected)
  const centreComparison = useMemo(() => {
    const defaultList = [
      { id: 'c1111111-1111-1111-1111-111111111111', name: 'New Friends Colony, New Delhi', short: 'NFC Delhi', color: '#2563eb' },
      { id: 'c2222222-2222-2222-2222-222222222222', name: 'Vasant Vihar, New Delhi', short: 'Vasant Vihar', color: '#059669' },
      { id: 'c3333333-3333-3333-3333-333333333333', name: 'Gurugram – DLF Phase 1', short: 'Gurugram DLF', color: '#d97706' },
    ]

    const selectedCentreObj = centres.find(c => c.id === selectedFilterCentre)
    const targetList = selectedFilterCentre !== 'all'
      ? defaultList.filter(c => c.id === selectedFilterCentre || (selectedCentreObj && c.name.toLowerCase().includes(selectedCentreObj.name.toLowerCase())))
      : defaultList

    const maxRev = Math.max(...targetList.map(c => {
      const matching = filteredVisits.filter(v => 
        v.centre_id === c.id || 
        v.centre_name?.toLowerCase().includes(c.short.toLowerCase()) ||
        (c.id.includes('1111') && v.centre_name?.includes('Friends Colony')) ||
        (c.id.includes('2222') && v.centre_name?.includes('Vasant Vihar')) ||
        (c.id.includes('3333') && v.centre_name?.includes('Gurugram'))
      )
      return matching.reduce((s, v) => s + (Number(v.total) || 0), 0)
    }), 1000)

    return targetList.map(c => {
      const matching = filteredVisits.filter(v => 
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
  }, [filteredVisits, selectedFilterCentre, centres])

  // Daily Trend
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

  const handleDeleteExp = async (id: string) => {
    if (confirm('Delete this expense record?')) {
      await deleteExpense(id)
    }
  }

  if (loading) {
    return (
      <div className="p-16 flex flex-col justify-center items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <p className="text-xs text-muted-foreground font-medium">Loading clinical intelligence & analytics...</p>
      </div>
    )
  }

  // Doctor Dashboard View omitted for brevity (unchanged)
  if (profile?.role === 'doctor') {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        <div className="p-6 bg-gradient-to-r from-teal-900 to-emerald-900 text-white rounded-2xl">
          <h1 className="text-2xl font-bold">Doctor Performance Desk - Dr. {profile.name}</h1>
          <p className="text-xs text-teal-200 mt-1">View patient feedback and session logs.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">

      {/* ================= HEADER & TIMEFRAME FILTERS ================= */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-slate-900/95 border border-slate-800 text-white p-6 rounded-3xl shadow-xl backdrop-blur-md"
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 text-xs font-bold px-2.5 py-0.5">
              {isAdmin ? '👑 Master Admin & Financial Command' : `🏥 ${profile?.centreName || 'Clinic Reception Desk'}`}
            </Badge>
            <span className="text-xs text-slate-400">Physionautics Multispecialty Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1.5">
            {isAdmin ? 'Executive Financial & Clinical Intelligence' : 'Clinic Operations & Expense Desk'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {isAdmin 
              ? 'Gross & Net revenue analytics, operational expenses, doctor performance & CSAT ratings' 
              : `Live patient attendance, daily clinic expenses & verified ratings for ${profile?.centreName || 'this branch'}`}
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-slate-700/80 backdrop-blur-md">
          {/* Branch Filter (Admin Only) */}
          {isAdmin && (
            <Select value={selectedFilterCentre} onValueChange={(v: string | null) => setSelectedFilterCentre(v ?? 'all')}>
              <SelectTrigger className="w-52 bg-white text-slate-900 text-xs font-bold h-9 rounded-xl border-none">
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
          <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700/80 text-xs font-bold">
            <button
              onClick={() => setSelectedTimeframe('today')}
              className={`px-3 py-1.5 rounded-lg transition-all ${selectedTimeframe === 'today' ? 'bg-cyan-500 text-slate-950 font-black shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              Today
            </button>
            <button
              onClick={() => setSelectedTimeframe('7days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${selectedTimeframe === '7days' ? 'bg-cyan-500 text-slate-950 font-black shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('30days')}
              className={`px-3 py-1.5 rounded-lg transition-all ${selectedTimeframe === '30days' ? 'bg-cyan-500 text-slate-950 font-black shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              30 Days
            </button>
            <button
              onClick={() => setSelectedTimeframe('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${selectedTimeframe === 'all' ? 'bg-cyan-500 text-slate-950 font-black shadow-xs' : 'text-slate-300 hover:text-white'}`}
            >
              All Time
            </button>
          </div>

          {/* Action Modals */}
          <ExpenseLoggingModal
            centres={centres}
            userCentreId={profile?.centreId}
            userCentreName={profile?.centreName}
            userName={profile?.name}
            onExpenseAdded={() => getExpenses().then(setExpenses)}
          />

          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="bg-slate-800 hover:bg-slate-700 text-white border-slate-700 text-xs gap-1.5 h-9 rounded-xl font-bold"
              onClick={() => exportBillsToExcel(filteredVisits)}
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" /> Export Excel
            </Button>
          )}
        </div>
      </motion.div>

      {/* ================= ADMIN & STAFF VIEW: FINANCIAL INTELLIGENCE ================= */}
      {isAdmin ? (
        <>
          {/* Top Financial KPI Cards: GROSS REVENUE, EXPENSES, NET PROFIT, CSAT */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Gross Revenue */}
            <motion.div whileHover={{ y: -3, scale: 1.005 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
              <Card className="border border-blue-200/90 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl h-full">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gross Billed Revenue</p>
                    <p className="text-2xl font-black text-blue-950">{formatCurrency(filteredRevenue)}</p>
                    <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> {filteredVisits.length} billed visits
                    </p>
                  </div>
                  <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-sm">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 2: Operational Expenses */}
            <motion.div whileHover={{ y: -3, scale: 1.005 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
              <Card className="border border-rose-200/90 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl h-full">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Clinic Expenses</p>
                    <p className="text-2xl font-black text-rose-700">{formatCurrency(totalExpenses)}</p>
                    <p className="text-[11px] text-rose-600 font-bold flex items-center gap-1">
                      <ArrowDownRight className="h-3 w-3" /> {filteredExpenses.length} expense logs
                    </p>
                  </div>
                  <div className="p-3 bg-rose-600 text-white rounded-2xl shadow-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 3: Net Revenue / Profit & Margin */}
            <motion.div whileHover={{ y: -3, scale: 1.005 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
              <Card className="border border-emerald-200/90 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl h-full">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Net Profit / Revenue</p>
                    <p className="text-2xl font-black text-emerald-950">{formatCurrency(netRevenue)}</p>
                    <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-amber-500" /> {netMarginPct}% Net Margin
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-600 text-white rounded-2xl shadow-sm">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 4: CSAT Rating */}
            <motion.div whileHover={{ y: -3, scale: 1.005 }} transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}>
              <Card className="border border-amber-200/90 shadow-xs hover:shadow-md transition-shadow bg-white rounded-2xl h-full">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {selectedFilterCentre !== 'all' ? 'Branch CSAT Rating' : 'Network CSAT Rating'}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-2xl font-black text-amber-950">{avgFeedbackScore}</p>
                      <div className="flex text-amber-500 text-xs">
                        {'★'.repeat(5)}
                      </div>
                    </div>
                    <p className="text-[11px] text-amber-800 font-bold flex items-center gap-1">
                      <HeartHandshake className="h-3 w-3" /> {relevantFeedbacks.length} verified reviews
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-sm">
                    <Star className="h-6 w-6 fill-white" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* ================= DOCTOR-WISE FINANCIALS & CUSTOMER FEEDBACK HUB ================= */}
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
                    <motion.div 
                      key={doc.id}
                      whileHover={{ y: -3, scale: 1.005 }}
                      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                      className="bg-white rounded-xl border border-gray-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group hover:border-indigo-300"
                    >
                      <div className="space-y-3">
                        {/* Doctor Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div 
                              className="flex items-center gap-1.5 cursor-pointer group/name"
                              onClick={() => {
                                const fullDoc: Doctor = doctors.find(d => d.id === doc.id) || {
                                  id: doc.id,
                                  name: doc.name,
                                  specialization: doc.specialization,
                                  qualification: 'BPT, MPT',
                                  photo_url: null,
                                  experience_years: '5+ Years',
                                  registration_number: null,
                                  bio: null,
                                  phone: null,
                                  email: null,
                                  centre_id: doc.rawCentreId || null,
                                  is_active: true,
                                  created_at: new Date().toISOString(),
                                  updated_at: new Date().toISOString()
                                }
                                setSelectedDoctorForModal(fullDoc)
                              }}
                            >
                              <span className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold flex items-center justify-center text-[10px]">
                                #{idx + 1}
                              </span>
                              <h3 className="font-bold text-gray-900 text-sm truncate group-hover/name:text-blue-600 group-hover/name:underline">{doc.name}</h3>
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
                        className="w-full mt-3 text-xs gap-1.5 border-indigo-200 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 font-semibold"
                        onClick={() => {
                          const fullDoc: Doctor = doctors.find(d => d.id === doc.id) || {
                            id: doc.id,
                            name: doc.name,
                            specialization: doc.specialization,
                            qualification: 'BPT, MPT',
                            photo_url: null,
                            experience_years: '5+ Years',
                            registration_number: null,
                            bio: null,
                            phone: null,
                            email: null,
                            centre_id: doc.rawCentreId || null,
                            is_active: true,
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                          }
                          setSelectedDoctorForModal(fullDoc)
                        }}
                      >
                        <Receipt className="h-3.5 w-3.5 text-indigo-600" />
                        View Profile, Patients & Financials
                        <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                      </Button>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* ================= OPERATIONAL EXPENSES BREAKDOWN & BRANCH COLLECTIONS ================= */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Operational Expense Category Breakdown (7 cols) */}
            <Card className="lg:col-span-7 shadow-sm border bg-white">
              <CardHeader className="pb-3 border-b bg-rose-50/40 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-rose-950">
                    <Wallet className="h-4 w-4 text-rose-600" /> Operational Expense Categories Breakdown
                  </CardTitle>
                  <CardDescription className="text-xs">Category-wise breakdown of clinic operational expenditure</CardDescription>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportExpensesToExcel(filteredExpenses)}
                  className="text-xs border-rose-200 text-rose-700 hover:bg-rose-50 h-8 gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-rose-600" /> Export Expenses
                </Button>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {expenseCategoryBreakdown.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    No operational expenses recorded for this selection.
                  </div>
                ) : (
                  expenseCategoryBreakdown.map(cat => (
                    <div key={cat.category} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span className="text-slate-800">{cat.category} ({cat.count} logs)</span>
                        <span className="text-rose-700 font-extrabold">{formatCurrency(cat.amount)} ({cat.pct}%)</span>
                      </div>
                      <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full transition-all" style={{ width: `${Math.max(cat.pct, 4)}%` }} />
                      </div>
                    </div>
                  ))
                )}

                {/* Recent Expense Logs List */}
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Recent Expense Entries ({filteredExpenses.length})
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {filteredExpenses.map(e => (
                      <div key={e.id} className="p-2 bg-slate-50 border border-slate-200/80 rounded-lg flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-900">{e.description}</div>
                          <div className="text-[10px] text-slate-500 flex items-center gap-2">
                            <span>{e.category}</span> • <span>{formatDate(e.expense_date)}</span> • <span className="font-mono text-blue-600">{e.centre_name}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-rose-700">{formatCurrency(e.amount)}</span>
                          <button onClick={() => handleDeleteExp(e.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Branch Collections & Isolated Clinic Performance (5 cols) */}
            <Card className="lg:col-span-5 shadow-sm border bg-white">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-purple-600" />
                  {selectedFilterCentre !== 'all' ? 'Selected Clinic Branch Collections' : 'Multi-Centre Collections'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedFilterCentre !== 'all' ? 'Isolated branch collections and total billed visits' : 'Comparative revenue across active branch locations'}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {centreComparison.map(c => (
                  <div key={c.id} className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/80">
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

          {/* 7-Day Revenue Trend & Payment Breakdown */}
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
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card className="lg:col-span-5 shadow-sm border">
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
          </div>
        </>
      ) : (
        /* Clinic Staff View */
        <div className="space-y-6">
          <Card className="border border-blue-200 bg-blue-50/40 p-6 rounded-2xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <Badge className="bg-blue-600 text-white text-xs mb-2">Clinic Desk</Badge>
                <h2 className="text-xl font-bold text-blue-950">{profile?.centreName || 'Clinic Branch Desk'}</h2>
                <p className="text-xs text-blue-700 mt-0.5">Manage daily operational expenses, patient billing, and session records.</p>
              </div>
              <ExpenseLoggingModal
                centres={centres}
                userCentreId={profile?.centreId}
                userCentreName={profile?.centreName}
                userName={profile?.name}
                onExpenseAdded={() => getExpenses().then(setExpenses)}
              />
            </div>
          </Card>
        </div>
      )}

      {/* Interactive Admin Doctor Profile & Performance Drilldown Modal */}
      <DoctorDetailModal
        doctor={selectedDoctorForModal}
        open={!!selectedDoctorForModal}
        onOpenChange={(open) => { if (!open) setSelectedDoctorForModal(null) }}
        visits={allVisits}
        feedbacks={feedbacks}
        centreName={selectedDoctorForModal ? centres.find(c => c.id === selectedDoctorForModal.centre_id)?.name : undefined}
      />
    </div>
  )
}
