'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Users, Activity, Calendar, DollarSign, UserPlus, Receipt, 
  Building2, CreditCard, TrendingUp, Filter, Wallet, 
  ArrowUpRight, Star, HeartHandshake, Sparkles, MessageCircle,
  FileSpreadsheet, Award, Download, Layers, CheckCircle2, Ticket,
  UserCog, Stethoscope, Clock, ChevronRight, X, Trash2, Plus, ArrowDownRight, Tag, Search
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { 
  getVisits, getCentres, getPatientFeedback, getDoctors, exportBillsToExcel, 
  getExpenses, deleteExpense, exportExpensesToExcel, getPatients, saveAttendanceRecord, type StoredVisit 
} from '@/lib/data-store'
import { ExecutiveFinancialDashboard } from '@/components/dashboard/executive-financial-dashboard'
import { ExpenseLoggingModal } from '@/components/dashboard/expense-logging-modal'
import { DoctorDetailModal } from '@/components/doctors/doctor-detail-modal'
import { Centre, Doctor, PatientFeedback, ClinicExpense, ExpenseCategory, Patient } from '@/lib/supabase/types'
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
  const router = useRouter()
  const { toast } = useToast()
  const { profile } = useAuth()
  const isAdmin = !profile || profile?.role === 'admin' || (profile?.role !== 'clinic_reception' && profile?.role !== 'doctor')

  const [loading, setLoading] = useState(true)
  const [allVisits, setAllVisits] = useState<StoredVisit[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [feedbacks, setFeedbacks] = useState<PatientFeedback[]>([])
  const [expenses, setExpenses] = useState<ClinicExpense[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  
  // Doctor Portal search states
  const [doctorPatientQuery, setDoctorPatientQuery] = useState('')
  const [doctorInvoiceQuery, setDoctorInvoiceQuery] = useState('')

  // Filters
  const [selectedFilterCentre, setSelectedFilterCentre] = useState<string>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('all')

  // Selected doctor modal for deep financial & feedback drilldown
  const [selectedDoctorForModal, setSelectedDoctorForModal] = useState<Doctor | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vData, cData, fbData, docData, expData, pData] = await Promise.all([
          getVisits(),
          getCentres(),
          getPatientFeedback(),
          getDoctors(),
          getExpenses(),
          getPatients(),
        ])
        setAllVisits(vData)
        setCentres(cData)
        setFeedbacks(fbData)
        setDoctors(docData)
        setExpenses(expData)
        setPatients(pData)
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
      if (!v) return false
      // If staff, lock to their clinic
      if (!isAdmin && userCentreId) {
        const matchStaff = v.centre_id === userCentreId || 
          (v.centre_name && profile?.centreName && v.centre_name.toLowerCase().includes(profile.centreName.toLowerCase()))
        if (!matchStaff) return false
      } else if (selectedFilterCentre !== 'all') {
        // Admin centre filter
        const selectedCentreObj = centres.find(c => c && c.id === selectedFilterCentre)
        const selectedCentreName = selectedCentreObj?.name ? selectedCentreObj.name.toLowerCase() : ''
        const vCentreName = v.centre_name ? v.centre_name.toLowerCase() : ''
        const matchCentre = v.centre_id === selectedFilterCentre || 
          (vCentreName && selectedCentreName && vCentreName.includes(selectedCentreName))
        if (!matchCentre) return false
      }

      if (!v.visit_date) return true

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
      if (!e) return false
      if (!isAdmin && userCentreId) {
        const matchStaff = e.centre_id === userCentreId || 
          (e.centre_name && profile?.centreName && e.centre_name.toLowerCase().includes(profile.centreName.toLowerCase()))
        if (!matchStaff) return false
      } else if (selectedFilterCentre !== 'all') {
        const selectedCentreObj = centres.find(c => c && c.id === selectedFilterCentre)
        const selectedCentreName = selectedCentreObj?.name ? selectedCentreObj.name.toLowerCase() : ''
        const eCentreName = e.centre_name ? e.centre_name.toLowerCase() : ''
        const matchCentre = e.centre_id === selectedFilterCentre || 
          (eCentreName && selectedCentreName && (eCentreName.includes(selectedCentreName) || selectedCentreName.includes(eCentreName)))
        if (!matchCentre) return false
      }

      if (!e.expense_date) return true
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
  const todayVisitsList = filteredVisits.filter(v => v && v.visit_date === todayStr)
  const todayRevenue = todayVisitsList.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  const filteredRevenue = filteredVisits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  const netRevenue = filteredRevenue - totalExpenses
  const netMarginPct = filteredRevenue > 0 ? ((netRevenue / filteredRevenue) * 100).toFixed(1) : '0.0'
  const avgBillSize = filteredVisits.length > 0 ? Math.round(filteredRevenue / filteredVisits.length) : 0

  // Feedback Metrics (Filtered specifically by clinic if filter or staff active)
  const relevantFeedbacks = useMemo(() => {
    if (!isAdmin && profile?.centreName) {
      const cName = profile.centreName.toLowerCase()
      return feedbacks.filter(f => 
        f && f.centre_name && f.centre_name.toLowerCase().includes(cName)
      )
    }
    if (isAdmin && selectedFilterCentre !== 'all') {
      const selectedCentreObj = centres.find(c => c && c.id === selectedFilterCentre)
      const selectedCentreName = selectedCentreObj?.name ? selectedCentreObj.name.toLowerCase() : selectedFilterCentre.toLowerCase()
      return feedbacks.filter(f => {
        if (!f || !f.centre_name) return false
        const fCentreName = f.centre_name.toLowerCase()
        return fCentreName.includes(selectedCentreName) || selectedCentreName.includes(fCentreName)
      })
    }
    return feedbacks
  }, [feedbacks, isAdmin, profile, selectedFilterCentre, centres])

  const avgFeedbackScore = useMemo(() => {
    if (!relevantFeedbacks || relevantFeedbacks.length === 0) return '5.0'
    const sum = relevantFeedbacks.reduce((acc, f) => acc + (f.rating || 5), 0)
    return (sum / relevantFeedbacks.length).toFixed(1)
  }, [relevantFeedbacks])

  // Doctor-Wise Financials & Performance Hub (Strictly scoped)
  const doctorStats: DoctorStat[] = useMemo(() => {
    if (!doctors || !Array.isArray(doctors)) return []
    return doctors
      .filter(Boolean)
      .map(doc => {
        const docRawName = doc.name ? doc.name.replace(/^Dr\.\s*/i, '').trim().toLowerCase() : ''
        
        const docVisits = filteredVisits.filter(v => {
          if (!v) return false
          if (v.primary_doctor_id && v.primary_doctor_id === doc.id) return true
          if (v.doctor_id && v.doctor_id === doc.id) return true
          if (v.primary_doctor_name && docRawName) {
            const pDocName = v.primary_doctor_name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
            if (pDocName.includes(docRawName) || docRawName.includes(pDocName)) return true
          }
          if (v.doctor_name && docRawName) {
            const vDocName = v.doctor_name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
            return vDocName.includes(docRawName) || docRawName.includes(vDocName)
          }
          return false
        })

        const revenue = docVisits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
        const patientCount = docVisits.length
        const avgTicket = patientCount > 0 ? Math.round(revenue / patientCount) : 0

        const docFeedbacks = feedbacks.filter(f => {
          if (!f || !f.doctor_name || !docRawName) return false
          const fDocName = f.doctor_name.replace(/^Dr\.\s*/i, '').trim().toLowerCase()
          return fDocName.includes(docRawName) || docRawName.includes(fDocName)
        })

        const avgRating = docFeedbacks.length > 0 
          ? (docFeedbacks.reduce((sum, f) => sum + (f.rating || 5), 0) / docFeedbacks.length).toFixed(1)
          : '5.0'

        const serviceCounts: Record<string, number> = {}
        docVisits.forEach(v => {
          v.items?.forEach(i => {
            if (i && i.service_name) {
              serviceCounts[i.service_name] = (serviceCounts[i.service_name] || 0) + (i.quantity || 1)
            }
          })
        })
        const topProcedures = Object.entries(serviceCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([name]) => name)

        const centreObj = centres.find(c => c && c.id === doc.centre_id)
        const docCentreName = (doc as any).centre_name || (centreObj ? centreObj.name : 'Physionautics Multispecialty')

        return {
          id: doc.id,
          name: doc.name ? (doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`) : 'Doctor',
          specialization: doc.specialization || 'Physiotherapy Specialist',
          centre_name: docCentreName,
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
        const selectedCentreObj = centres.find(c => c && c.id === selectedFilterCentre)
        const selectedCentreName = selectedCentreObj?.name ? selectedCentreObj.name.toLowerCase() : ''
        const matchesCentreName = Boolean(selectedCentreName && doc.centre_name && doc.centre_name.toLowerCase().includes(selectedCentreName))
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

  // Doctor Dashboard View: Dedicated Doctor Portal & Tagged Revenue Dashboard
  // Active Doctor ID resolution
  const activeDoctorId = profile?.doctorId || doctors.find(d => 
    (profile?.email && d.email?.toLowerCase() === profile.email.toLowerCase()) ||
    (profile?.name && d.name && d.name.toLowerCase().includes(profile.name.toLowerCase().replace(/^dr\.\s*/i, '')))
  )?.id

  // All Visits matching this Doctor (Primary Doctor or Attending Doctor)
  const doctorVisits = useMemo(() => {
    if (!profile) return []
    return allVisits.filter(v => {
      if (activeDoctorId && (v.primary_doctor_id === activeDoctorId || v.doctor_id === activeDoctorId)) {
        return true
      }
      if (profile.name) {
        const docRawName = profile.name.replace(/^dr\.\s*/i, '').trim().toLowerCase()
        const matchPrim = v.primary_doctor_name && v.primary_doctor_name.toLowerCase().includes(docRawName)
        const matchAtt = v.doctor_name && v.doctor_name.toLowerCase().includes(docRawName)
        return matchPrim || matchAtt
      }
      return false
    })
  }, [allVisits, activeDoctorId, profile])

  // Primary Doctor Tagged Visits (100% Net Invoice total where doctor is Primary Doctor)
  const primaryTaggedVisits = useMemo(() => {
    return doctorVisits.filter(v => {
      if (activeDoctorId) {
        if (v.primary_doctor_id) return v.primary_doctor_id === activeDoctorId
        return v.doctor_id === activeDoctorId
      }
      return true
    })
  }, [doctorVisits, activeDoctorId])

  // Revenue Metrics for My Tagged Revenue cards
  const currentNow = new Date()
  const currentYear = currentNow.getFullYear()
  const currentMonth = currentNow.getMonth()

  const thisMonthTaggedRevenue = useMemo(() => {
    return primaryTaggedVisits
      .filter(v => {
        const d = new Date(v.visit_date)
        return d.getFullYear() === currentYear && d.getMonth() === currentMonth
      })
      .reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  }, [primaryTaggedVisits, currentYear, currentMonth])

  const ytdTaggedRevenue = useMemo(() => {
    return primaryTaggedVisits
      .filter(v => {
        const d = new Date(v.visit_date)
        return d.getFullYear() === currentYear
      })
      .reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  }, [primaryTaggedVisits, currentYear])

  const totalTaggedRevenue = useMemo(() => {
    return primaryTaggedVisits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  }, [primaryTaggedVisits])

  // My Patients List (patients registered with primary_doctor_id === profile.doctorId)
  const myPatients = useMemo(() => {
    if (!profile) return []
    return patients.filter(p => {
      if (activeDoctorId && p.primary_doctor_id === activeDoctorId) return true
      if (activeDoctorId && doctorVisits.some(v => v.patient_id === p.id || v.patient_uid === p.uid)) return true
      return false
    })
  }, [patients, activeDoctorId, doctorVisits, profile])

  // Search filtered patients
  const filteredMyPatients = useMemo(() => {
    if (!doctorPatientQuery.trim()) return myPatients
    const q = doctorPatientQuery.toLowerCase().trim()
    return myPatients.filter(p => 
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      (p.uid && p.uid.toLowerCase().includes(q)) ||
      (p.phone && p.phone.includes(q))
    )
  }, [myPatients, doctorPatientQuery])

  // Search filtered invoices
  const filteredMyInvoices = useMemo(() => {
    const list = [...doctorVisits].sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())
    if (!doctorInvoiceQuery.trim()) return list
    const q = doctorInvoiceQuery.toLowerCase().trim()
    return list.filter(v => 
      (v.bill_number && v.bill_number.toLowerCase().includes(q)) ||
      (v.patient_name && v.patient_name.toLowerCase().includes(q)) ||
      (v.patient_uid && v.patient_uid.toLowerCase().includes(q))
    )
  }, [doctorVisits, doctorInvoiceQuery])

  // Reception Dashboard Operational Calculations (Financial metrics & growth charts masked)
  const patientsRegisteredToday = useMemo(() => {
    return patients.filter(p => {
      if (!p.created_at) return false
      return p.created_at.split('T')[0] === todayStr
    })
  }, [patients, todayStr])

  const todayExpensesList = useMemo(() => {
    return filteredExpenses.filter(e => e.expense_date === todayStr)
  }, [filteredExpenses, todayStr])

  const todayExpensesAmount = useMemo(() => {
    return todayExpensesList.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  }, [todayExpensesList])

  const recentClinicBills = useMemo(() => {
    return [...filteredVisits]
      .sort((a, b) => new Date(b.visit_date).getTime() - new Date(a.visit_date).getTime())
      .slice(0, 10)
  }, [filteredVisits])

  const recentClinicExpenses = useMemo(() => {
    return [...filteredExpenses]
      .sort((a, b) => new Date(b.expense_date).getTime() - new Date(a.expense_date).getTime())
      .slice(0, 10)
  }, [filteredExpenses])

  // Dedicated Clinic Reception Dashboard View (Role: clinic_reception)
  if (profile?.role === 'clinic_reception') {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Reception Header Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-blue-950 via-indigo-900 to-blue-900 border border-blue-800/80 text-white p-6 rounded-3xl shadow-xl backdrop-blur-md"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-bold px-2.5 py-0.5">
                🏥 Clinic Reception Desk
              </Badge>
              <span className="text-xs text-blue-200/80">{profile.centreName || 'Physionautics Clinic'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1.5">
              Welcome, {profile.name}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80">
              Daily operational overview: patient registrations, clinical billing & branch expense logging
            </p>
          </div>

          <div className="flex items-center gap-2">
            <ExpenseLoggingModal
              centres={centres}
              userCentreId={profile?.centreId}
              userCentreName={profile?.centreName}
              userName={profile?.name}
              onExpenseAdded={() => getExpenses().then(setExpenses)}
              trigger={
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 h-9 rounded-xl shadow-xs">
                  <Plus className="h-4 w-4" /> Log Expense
                </Button>
              }
            />
          </div>
        </motion.div>

        {/* Operational Reception Metric Cards - Exactly 2 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Total Patients */}
          <motion.div whileHover={{ y: -3, scale: 1.005 }} transition={{ duration: 0.2 }}>
            <Card className="border border-blue-200/90 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50/30 rounded-2xl h-full">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Patients</p>
                  <p className="text-4xl font-black text-blue-950">{patients.length}</p>
                  <p className="text-xs text-blue-700 font-bold flex items-center gap-1 mt-1">
                    <Users className="h-3.5 w-3.5 text-blue-600" /> Registered Clinic Patients
                  </p>
                </div>
                <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-sm">
                  <Users className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Total Patients Conducted / Seen */}
          <motion.div whileHover={{ y: -3, scale: 1.005 }} transition={{ duration: 0.2 }}>
            <Card className="border border-emerald-200/90 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-emerald-50/30 rounded-2xl h-full">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Patients Conducted</p>
                  <p className="text-4xl font-black text-emerald-950">{filteredVisits.length}</p>
                  <p className="text-xs text-emerald-700 font-bold flex items-center gap-1 mt-1">
                    <Activity className="h-3.5 w-3.5 text-emerald-600" /> Consultations & Visits Logged
                  </p>
                </div>
                <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-sm">
                  <Activity className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Action Buttons */}
        <Card className="shadow-xs border border-slate-200 bg-white rounded-2xl p-4">
          <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">Quick Actions</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link href="/patients/register" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 rounded-xl shadow-xs gap-2">
                <UserPlus className="h-4 w-4" /> New Patient Registration
              </Button>
            </Link>
            <Link href="/billing" className="w-full">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 rounded-xl shadow-xs gap-2">
                <Receipt className="h-4 w-4" /> New Invoice / Bill
              </Button>
            </Link>
            <ExpenseLoggingModal
              centres={centres}
              userCentreId={profile?.centreId}
              userCentreName={profile?.centreName}
              userName={profile?.name}
              onExpenseAdded={() => getExpenses().then(setExpenses)}
              trigger={
                <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-11 rounded-xl shadow-xs gap-2">
                  <Wallet className="h-4 w-4" /> Log Clinic Expense
                </Button>
              }
            />
            <Link href="/attendance" className="w-full">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-11 rounded-xl shadow-xs gap-2">
                <Clock className="h-4 w-4" /> Manage Attendance
              </Button>
            </Link>
          </div>
        </Card>

        {/* Recent Clinic Invoices & Expenses */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Recent Bills (7 cols) */}
          <Card className="lg:col-span-7 shadow-sm border bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-blue-50/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-extrabold text-blue-950 flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-blue-600" />
                  Recent Clinic Invoices & Bills
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Invoices generated at {profile?.centreName || 'this branch'}
                </CardDescription>
              </div>
              <Link href="/billing">
                <Button size="sm" variant="ghost" className="text-xs text-blue-700 hover:bg-blue-100 font-bold gap-1">
                  View All Bills <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {recentClinicBills.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No invoices recorded at this clinic yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  <div className="px-5 py-2.5 bg-slate-50 text-[11px] font-semibold text-slate-500 grid grid-cols-12">
                    <span className="col-span-4">Invoice #</span>
                    <span className="col-span-4">Patient Name</span>
                    <span className="col-span-2">Date</span>
                    <span className="col-span-2 text-right">Amount</span>
                  </div>
                  {recentClinicBills.map(inv => (
                    <div key={inv.id} className="px-5 py-3 grid grid-cols-12 items-center hover:bg-slate-50/60 transition-colors text-xs">
                      <div className="col-span-4">
                        <span className="font-mono font-bold text-slate-900 block">{inv.bill_number}</span>
                        <span className="text-[10px] text-slate-500">{inv.payment_mode} • {inv.payment_status}</span>
                      </div>
                      <div className="col-span-4">
                        <p className="font-bold text-slate-800">{inv.patient_name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{inv.patient_uid}</p>
                      </div>
                      <div className="col-span-2 text-slate-600 text-[11px]">
                        {formatDate(inv.visit_date)}
                      </div>
                      <div className="col-span-2 text-right font-extrabold text-emerald-700">
                        {formatCurrency(inv.total)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Clinic Expenses (5 cols) */}
          <Card className="lg:col-span-5 shadow-sm border bg-white rounded-2xl overflow-hidden">
            <CardHeader className="pb-3 border-b bg-rose-50/40 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-extrabold text-rose-950 flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-rose-600" />
                  Recent Clinic Expenses
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Operational expenditure logged for {profile?.centreName || 'this branch'}
                </CardDescription>
              </div>
              <ExpenseLoggingModal
                centres={centres}
                userCentreId={profile?.centreId}
                userCentreName={profile?.centreName}
                userName={profile?.name}
                onExpenseAdded={() => getExpenses().then(setExpenses)}
                trigger={
                  <Button size="sm" variant="outline" className="text-xs border-rose-200 text-rose-700 hover:bg-rose-100 font-bold gap-1">
                    <Plus className="h-3.5 w-3.5" /> Log
                  </Button>
                }
              />
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {recentClinicExpenses.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500">
                  No clinic expenses logged yet.
                </div>
              ) : (
                recentClinicExpenses.map(e => (
                  <div key={e.id} className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900">{e.description}</div>
                      <div className="text-[10px] text-slate-500 flex items-center gap-2">
                        <span>{e.category}</span> • <span>{formatDate(e.expense_date)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-rose-700">{formatCurrency(e.amount)}</span>
                      <button onClick={() => handleDeleteExp(e.id)} className="text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (profile?.role === 'doctor') {
    const handleMarkAttendance = async () => {
      try {
        const todayDate = new Date().toISOString().split('T')[0]
        const checkInTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
        
        await saveAttendanceRecord({
          staff_id: activeDoctorId || profile.id || 'doc-101',
          staff_name: profile.name || 'Doctor',
          role: 'doctor',
          centre_id: profile.centreId || 'c1111111-1111-1111-1111-111111111111',
          centre_name: profile.centreName || 'Physionautics Clinic',
          date: todayDate,
          status: 'Present',
          check_in_time: checkInTime,
        })
        
        toast({
          title: 'Attendance Marked!',
          description: `Checked in as Present today at ${checkInTime}.`,
        })
      } catch (err) {
        toast({
          title: 'Error Marking Attendance',
          description: 'Failed to record attendance.',
          variant: 'destructive',
        })
      }
    }

    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
        {/* Doctor Portal Header Banner */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-teal-950 via-emerald-900 to-teal-900 border border-teal-800/80 text-white p-6 rounded-3xl shadow-xl backdrop-blur-md"
        >
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-teal-500/20 text-teal-200 border border-teal-400/30 text-xs font-bold px-2.5 py-0.5">
                🩺 Doctor Portal Desk
              </Badge>
              <span className="text-xs text-teal-200/80">{profile.centreName || 'Physionautics Multispecialty'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-1.5">
              Welcome, Dr. {profile?.name ? profile.name.replace(/^dr\.\s*/i, '') : 'Doctor'}
            </h1>
            <p className="text-xs sm:text-sm text-teal-100/80">
              Assigned Patients, Clinical Consultations & Expense Logging
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-teal-950/70 p-2.5 rounded-2xl border border-teal-800/80">
            <Button 
              size="sm" 
              onClick={handleMarkAttendance}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold gap-1.5 h-9 rounded-xl shadow-xs"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Mark My Attendance
            </Button>
            
            <ExpenseLoggingModal
              centres={centres}
              userCentreId={profile?.centreId}
              userCentreName={profile?.centreName}
              userName={profile?.name}
              onExpenseAdded={() => getExpenses().then(setExpenses)}
              trigger={
                <Button size="sm" className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold gap-1.5 h-9 rounded-xl shadow-xs">
                  <Wallet className="h-3.5 w-3.5" /> Log Expense
                </Button>
              }
            />

            <Link href="/patients">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold gap-1.5 h-9 rounded-xl">
                <UserPlus className="h-3.5 w-3.5" /> Register Patient
              </Button>
            </Link>
            
            <Link href="/billing">
              <Button size="sm" variant="outline" className="bg-teal-900 hover:bg-teal-800 text-teal-100 border-teal-700 text-xs font-bold gap-1.5 h-9 rounded-xl">
                <Receipt className="h-3.5 w-3.5 text-emerald-400" /> New Bill
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Doctor Metric Cards - Exactly 2 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Total Patients */}
          <motion.div whileHover={{ y: -3, scale: 1.005 }} transition={{ duration: 0.2 }}>
            <Card className="border border-teal-200/90 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-teal-50/30 rounded-2xl h-full">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Patients</p>
                  <p className="text-4xl font-black text-teal-950">{myPatients.length}</p>
                  <p className="text-xs text-teal-700 font-bold flex items-center gap-1 mt-1">
                    <Users className="h-3.5 w-3.5 text-teal-600" /> Assigned Primary Patients
                  </p>
                </div>
                <div className="p-4 bg-teal-600 text-white rounded-2xl shadow-sm">
                  <Stethoscope className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 2: Total Patients Conducted / Seen */}
          <motion.div whileHover={{ y: -3, scale: 1.005 }} transition={{ duration: 0.2 }}>
            <Card className="border border-blue-200/90 shadow-xs hover:shadow-md transition-shadow bg-gradient-to-br from-white to-blue-50/30 rounded-2xl h-full">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Patients Conducted</p>
                  <p className="text-4xl font-black text-blue-950">{doctorVisits.length}</p>
                  <p className="text-xs text-blue-700 font-bold flex items-center gap-1 mt-1">
                    <Activity className="h-3.5 w-3.5 text-blue-600" /> Consultations & Visits Completed
                  </p>
                </div>
                <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-sm">
                  <Activity className="h-8 w-8" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* My Patients List */}
        <Card className="shadow-sm border bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b bg-teal-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-extrabold text-teal-950 flex items-center gap-2">
                <Users className="h-5 w-5 text-teal-600" />
                My Patients List ({myPatients.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Patients registered with Dr. {profile?.name || 'Doctor'} as Primary Doctor
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search patient name, UID..."
                value={doctorPatientQuery}
                onChange={(e) => setDoctorPatientQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-white border-slate-200 rounded-xl"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredMyPatients.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No registered primary patients found matching your search query.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="px-6 py-2.5 bg-slate-50 text-[11px] font-semibold text-slate-500 grid grid-cols-12">
                  <span className="col-span-4">Patient Name & UID</span>
                  <span className="col-span-2">Age / Gender</span>
                  <span className="col-span-3">Contact Phone</span>
                  <span className="col-span-3">Medical Notes / Complaint</span>
                </div>
                {filteredMyPatients.map(p => (
                  <div key={p.id} className="px-6 py-3.5 grid grid-cols-12 items-center hover:bg-teal-50/20 transition-colors text-xs">
                    <div className="col-span-4">
                      <p className="font-bold text-slate-900">{p.full_name}</p>
                      <span className="font-mono text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                        {p.uid}
                      </span>
                    </div>
                    <div className="col-span-2 text-slate-700">
                      {p.age} Yrs • {p.gender}
                    </div>
                    <div className="col-span-3 text-slate-700 font-mono">
                      {p.phone}
                    </div>
                    <div className="col-span-3 text-slate-600 truncate">
                      {p.medical_notes || 'No notes logged'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Recent Clinical Invoices Table */}
        <Card className="shadow-sm border bg-white rounded-2xl overflow-hidden">
          <CardHeader className="pb-3 border-b bg-blue-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-extrabold text-blue-950 flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                My Recent Clinical Invoices ({doctorVisits.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Clinical billing statements tagged to Dr. {profile?.name || 'Doctor'}
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search invoice #, patient..."
                value={doctorInvoiceQuery}
                onChange={(e) => setDoctorInvoiceQuery(e.target.value)}
                className="pl-8 h-8 text-xs bg-white border-slate-200 rounded-xl"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredMyInvoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No clinical invoices found for your account.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                <div className="px-6 py-2.5 bg-slate-50 text-[11px] font-semibold text-slate-500 grid grid-cols-12">
                  <span className="col-span-3">Invoice #</span>
                  <span className="col-span-3">Patient Name</span>
                  <span className="col-span-2">Visit Date</span>
                  <span className="col-span-2 text-right">Net Total</span>
                  <span className="col-span-2 text-center">Doctor Tag</span>
                </div>
                {filteredMyInvoices.map(inv => {
                  const isPrimary = activeDoctorId 
                    ? (inv.primary_doctor_id ? inv.primary_doctor_id === activeDoctorId : inv.doctor_id === activeDoctorId)
                    : true
                  return (
                    <div key={inv.id} className="px-6 py-3.5 grid grid-cols-12 items-center hover:bg-slate-50/60 transition-colors text-xs">
                      <div className="col-span-3">
                        <span className="font-mono font-bold text-slate-900 block">{inv.bill_number}</span>
                        <span className="text-[10px] text-slate-500">{inv.payment_mode} • {inv.payment_status}</span>
                      </div>
                      <div className="col-span-3">
                        <p className="font-bold text-slate-800">{inv.patient_name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{inv.patient_uid}</p>
                      </div>
                      <div className="col-span-2 text-slate-600">
                        {formatDate(inv.visit_date)}
                      </div>
                      <div className="col-span-2 text-right font-extrabold text-emerald-700">
                        {formatCurrency(inv.total)}
                      </div>
                      <div className="col-span-2 text-center">
                        <Badge 
                          className={isPrimary 
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]' 
                            : 'bg-blue-100 text-blue-800 border-blue-200 text-[10px]'}
                        >
                          {isPrimary ? 'Primary Doctor' : 'Attending Doctor'}
                        </Badge>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <ExecutiveFinancialDashboard />
    </div>
  )
}
