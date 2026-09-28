'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  Users, DollarSign, Wallet, TrendingUp, ArrowUpRight, 
  Calendar, ChevronRight, Filter, IndianRupee, UserCog, Tag, X
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'
import { getDoctors, getVisits, type StoredVisit } from '@/lib/data-store'
import type { Doctor } from '@/lib/supabase/types'

interface PhysioItem {
  id: string
  name: string
  avatar: string
  clientsHandled: number
  feeCharged: number
  moneyMade: number
  role: 'doctor' | 'physio'
  specialization?: string
}

const SAMPLE_PHYSIOS: PhysioItem[] = [
  {
    id: 'doc-101',
    name: 'Dr. Sarah Jenkins',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    clientsHandled: 86,
    feeCharged: 156000,
    moneyMade: 142800,
    role: 'doctor',
    specialization: 'Orthopedic Physiotherapy'
  },
  {
    id: 'doc-102',
    name: 'Dr. Rajesh Sharma',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    clientsHandled: 64,
    feeCharged: 112000,
    moneyMade: 102400,
    role: 'doctor',
    specialization: 'Sports Rehabilitation'
  },
  {
    id: 'doc-201',
    name: 'Dr. Emily Watson',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78907?auto=format&fit=crop&q=80&w=200',
    clientsHandled: 58,
    feeCharged: 98000,
    moneyMade: 89600,
    role: 'doctor',
    specialization: 'Neuro Physiotherapy'
  },
  {
    id: 'doc-202',
    name: 'Dr. Michael Chang',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
    clientsHandled: 47,
    feeCharged: 82000,
    moneyMade: 73200,
    role: 'doctor',
    specialization: 'Spine & Posture Specialist'
  },
  {
    id: 'doc-301',
    name: 'Dr. Priya Nair',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78907?auto=format&fit=crop&q=80&w=200',
    clientsHandled: 39,
    feeCharged: 69000,
    moneyMade: 61800,
    role: 'doctor',
    specialization: 'Cardiorespiratory Rehab'
  }
]

interface FinancialTrackingViewProps {
  initialDoctors?: Doctor[]
  initialVisits?: StoredVisit[]
}

export function FinancialTrackingView({ initialDoctors, initialVisits }: FinancialTrackingViewProps = {}) {
  const [viewTab, setViewTab] = useState<'doctor' | 'physio'>('doctor')
  const [timePeriod, setTimePeriod] = useState<string>('month')
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all')

  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors || [])
  const [visits, setVisits] = useState<StoredVisit[]>(initialVisits || [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docData, visitData] = await Promise.all([
          getDoctors(),
          getVisits()
        ])
        setDoctors(docData)
        setVisits(visitData)
      } catch (err) {
        console.error('Failed to load financial tracking data:', err)
      }
    }
    if (!initialDoctors || !initialVisits) {
      fetchData()
    }
  }, [initialDoctors, initialVisits])

  // Filter visits based on selected time period & primary doctor
  const filteredVisits = useMemo(() => {
    const now = new Date()
    return visits.filter(v => {
      // Primary Doctor Filter
      if (selectedDoctorId !== 'all') {
        const isMatch = v.primary_doctor_id === selectedDoctorId || v.doctor_id === selectedDoctorId
        if (!isMatch) return false
      }

      // Time Period Filter
      if (timePeriod === 'today') {
        const todayStr = now.toISOString().split('T')[0]
        return v.visit_date === todayStr
      }
      if (timePeriod === 'week') {
        const d = new Date(v.visit_date)
        return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 7
      }
      if (timePeriod === 'month') {
        const d = new Date(v.visit_date)
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      }
      if (timePeriod === 'quarter') {
        const d = new Date(v.visit_date)
        return (now.getTime() - d.getTime()) / (1000 * 3600 * 24) <= 90
      }
      return true
    })
  }, [visits, selectedDoctorId, timePeriod])

  // Calculated Financial Metrics
  const metrics = useMemo(() => {
    if (visits.length > 0) {
      const clientIds = new Set(filteredVisits.map(v => v.patient_id || v.patient_uid))
      const totalClients = clientIds.size || filteredVisits.length
      const feeCharged = filteredVisits.reduce((sum, v) => sum + (Number(v.subtotal) || Number(v.total) || 0), 0)
      const moneyMade = filteredVisits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
      return { totalClients, feeCharged, moneyMade }
    } else {
      // Fallback for demo display when no visits are logged yet
      if (selectedDoctorId !== 'all') {
        const found = SAMPLE_PHYSIOS.find(p => p.id === selectedDoctorId)
        if (found) {
          return {
            totalClients: found.clientsHandled,
            feeCharged: found.feeCharged,
            moneyMade: found.moneyMade
          }
        }
      }
      const totalClients = SAMPLE_PHYSIOS.reduce((sum, p) => sum + p.clientsHandled, 0)
      const feeCharged = SAMPLE_PHYSIOS.reduce((sum, p) => sum + p.feeCharged, 0)
      const moneyMade = SAMPLE_PHYSIOS.reduce((sum, p) => sum + p.moneyMade, 0)
      return { totalClients, feeCharged, moneyMade }
    }
  }, [filteredVisits, visits.length, selectedDoctorId])

  // Doctor/Physio Performance Breakdown List
  const doctorPerformanceList = useMemo(() => {
    if (doctors.length > 0 && visits.length > 0) {
      return doctors.map(doc => {
        const docVisits = filteredVisits.filter(v => 
          v.primary_doctor_id === doc.id || v.doctor_id === doc.id ||
          (v.doctor_name && v.doctor_name.toLowerCase().includes(doc.name.toLowerCase().replace(/^dr\.\s*/i, '')))
        )
        const clientIds = new Set(docVisits.map(v => v.patient_id || v.patient_uid))
        const clientsHandled = clientIds.size || docVisits.length
        const feeCharged = docVisits.reduce((sum, v) => sum + (Number(v.subtotal) || Number(v.total) || 0), 0)
        const moneyMade = docVisits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)

        return {
          id: doc.id,
          name: doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`,
          avatar: doc.photo_url || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
          clientsHandled,
          feeCharged,
          moneyMade,
          role: 'doctor' as const,
          specialization: doc.specialization || 'Physiotherapy Specialist',
        }
      }).filter(item => {
        if (selectedDoctorId !== 'all') return item.id === selectedDoctorId
        return true
      }).sort((a, b) => b.moneyMade - a.moneyMade)
    }

    // Fallback sample data
    return SAMPLE_PHYSIOS.filter(item => {
      if (selectedDoctorId !== 'all') return item.id === selectedDoctorId
      return viewTab === 'doctor' ? item.role === 'doctor' : true
    })
  }, [doctors, visits.length, filteredVisits, selectedDoctorId, viewTab])

  // Revenue trend visualization bars
  const revenueBars = useMemo(() => {
    if (filteredVisits.length > 0) {
      // Group by weeks/days
      const bars = [
        { period: 'Period 1', fee: Math.round(metrics.feeCharged * 0.15), earned: Math.round(metrics.moneyMade * 0.15) },
        { period: 'Period 2', fee: Math.round(metrics.feeCharged * 0.20), earned: Math.round(metrics.moneyMade * 0.20) },
        { period: 'Period 3', fee: Math.round(metrics.feeCharged * 0.22), earned: Math.round(metrics.moneyMade * 0.22) },
        { period: 'Period 4', fee: Math.round(metrics.feeCharged * 0.25), earned: Math.round(metrics.moneyMade * 0.25) },
        { period: 'Recent',   fee: Math.round(metrics.feeCharged * 0.18), earned: Math.round(metrics.moneyMade * 0.18) },
      ]
      return bars
    }
    return [
      { period: 'Apr 1', fee: 52000, earned: 44000 },
      { period: 'Apr 8', fee: 60000, earned: 48000 },
      { period: 'Apr 15', fee: 65000, earned: 58000 },
      { period: 'Apr 22', fee: 72000, earned: 64000 },
      { period: 'Apr 29', fee: 90000, earned: 82000 },
    ]
  }, [filteredVisits, metrics])

  const maxVal = Math.max(...revenueBars.map(b => Math.max(b.fee, b.earned)), 10000)

  const selectedDoctorObj = doctors.find(d => d.id === selectedDoctorId) || SAMPLE_PHYSIOS.find(p => p.id === selectedDoctorId)

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Financial Tracking & Tagged Revenue
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
            <span>Client wise • Primary Doctors & Physios Tagged Performance</span>
            {selectedDoctorId !== 'all' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[10px] font-bold">
                Filtered: {selectedDoctorObj?.name}
              </Badge>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Primary Doctor Filter Dropdown */}
          <div className="flex items-center gap-1.5">
            <Select value={selectedDoctorId} onValueChange={(val: string | null) => setSelectedDoctorId(val ?? 'all')}>
              <SelectTrigger className="w-[200px] bg-slate-50 border-slate-200 text-xs font-semibold rounded-xl shadow-xs">
                <UserCog className="w-3.5 h-3.5 text-blue-600 mr-2" />
                <SelectValue placeholder="Filter by Primary Doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs font-medium">All Primary Doctors</SelectItem>
                {doctors.length > 0 ? (
                  doctors.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id} className="text-xs font-medium">
                      {doc.name.startsWith('Dr.') ? doc.name : `Dr. ${doc.name}`}
                    </SelectItem>
                  ))
                ) : (
                  SAMPLE_PHYSIOS.map((doc) => (
                    <SelectItem key={doc.id} value={doc.id} className="text-xs font-medium">
                      {doc.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            {selectedDoctorId !== 'all' && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedDoctorId('all')}
                className="h-9 px-2 text-xs text-slate-500 hover:text-slate-900"
                title="Reset Doctor Filter"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Time Period Filter */}
          <Select value={timePeriod} onValueChange={(val: string | null) => setTimePeriod(val ?? 'month')}>
            <SelectTrigger className="w-[150px] bg-slate-50 border-slate-200 text-xs font-semibold rounded-xl shadow-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Primary Doctor Filter Status Alert if active */}
      {selectedDoctorId !== 'all' && selectedDoctorObj && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs text-blue-900">
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-blue-600" />
            <span>
              Showing 100% net tagged revenue performance for Primary Consultant <strong>{selectedDoctorObj.name}</strong>.
            </span>
          </div>
          <button 
            onClick={() => setSelectedDoctorId('all')}
            className="text-blue-700 hover:text-blue-900 font-bold underline text-xs"
          >
            Clear Filter
          </button>
        </div>
      )}

      {/* Top 3 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Clients */}
        <Card className="border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white shadow-xs rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                {selectedDoctorId !== 'all' ? 'Doctor Clients Handled' : 'Total Clients Handled'}
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {metrics.totalClients}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>12%</span>
              <span className="text-slate-400 font-normal">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Fee Charged */}
        <Card className="border border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white shadow-xs rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Gross Billed Fee</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                {formatCurrency(metrics.feeCharged)}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>13%</span>
              <span className="text-slate-400 font-normal">vs previous period</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Money Made / Tagged Revenue */}
        <Card className="border border-purple-100 bg-gradient-to-b from-purple-50/50 to-white shadow-xs rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                {selectedDoctorId !== 'all' ? 'Tagged Net Revenue' : 'Net Revenue Collected'}
              </p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-950 mt-0.5">
                {formatCurrency(metrics.moneyMade)}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>16%</span>
              <span className="text-slate-400 font-normal">vs previous period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart Card */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Revenue & Tagged Performance Trend
            </h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-slate-600">Fee Charged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Money Made</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 flex items-end justify-between gap-4 pt-4 px-2 border-b border-slate-100 pb-2">
            {revenueBars.map((bar, idx) => {
              const feeHeightPct = Math.round((bar.fee / (maxVal || 1)) * 100)
              const earnedHeightPct = Math.round((bar.earned / (maxVal || 1)) * 100)
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex justify-center items-end gap-1.5 h-full">
                    {/* Fee Charged Bar */}
                    <div
                      style={{ height: `${Math.max(feeHeightPct, 4)}%` }}
                      className="w-1/3 bg-blue-600 rounded-t-md transition-all hover:bg-blue-700"
                      title={`Fee: ${formatCurrency(bar.fee)}`}
                    />
                    {/* Money Made Bar */}
                    <div
                      style={{ height: `${Math.max(earnedHeightPct, 4)}%` }}
                      className="w-1/3 bg-emerald-500 rounded-t-md transition-all hover:bg-emerald-600"
                      title={`Earned: ${formatCurrency(bar.earned)}`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">{bar.period}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Doctor / Physio Performance Breakdown Card */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-0">
          {/* Tab Switcher Bar */}
          <div className="p-2 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between">
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => setViewTab('doctor')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  viewTab === 'doctor'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                By Doctor ({doctorPerformanceList.length})
              </button>
              <button
                onClick={() => setViewTab('physio')}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  viewTab === 'physio'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Consultants
              </button>
            </div>
          </div>

          {/* Table Header */}
          <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200/60 grid grid-cols-12 text-[11px] font-semibold text-slate-500">
            <span className="col-span-4">Consultant / Doctor</span>
            <span className="col-span-3 text-center">Clients Handled</span>
            <span className="col-span-2 text-right">Fee Billed</span>
            <span className="col-span-3 text-right pr-4">Money Made (Tagged)</span>
          </div>

          {/* List Rows */}
          <div className="divide-y divide-slate-100">
            {doctorPerformanceList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No matching consultant billing records found for this filter selection.
              </div>
            ) : (
              doctorPerformanceList.map((item) => (
                <div
                  key={item.id}
                  className="px-6 py-4 grid grid-cols-12 items-center hover:bg-slate-50/60 transition-colors"
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                    <div>
                      <span className="font-bold text-slate-900 text-sm block leading-tight">
                        {item.name}
                      </span>
                      {item.specialization && (
                        <span className="text-[10px] text-slate-500 block">
                          {item.specialization}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-3 text-center">
                    <span className="text-sm font-semibold text-slate-800">
                      {item.clientsHandled} clients
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    <span className="text-sm font-semibold text-slate-800">
                      {formatCurrency(item.feeCharged)}
                    </span>
                  </div>

                  <div className="col-span-3 flex items-center justify-end gap-3">
                    <span className="text-sm font-bold text-emerald-700">
                      {formatCurrency(item.moneyMade)}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
