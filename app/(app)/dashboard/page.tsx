'use client'
import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Users, Activity, Calendar, DollarSign, UserPlus, Receipt, 
  Building2, CreditCard, TrendingUp, Filter, Wallet, 
  ArrowUpRight, Star, HeartHandshake, Sparkles, MessageCircle,
  FileSpreadsheet, Award, Download, Layers, CheckCircle2, Ticket
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { getVisits, getCentres, getPatientFeedback, exportBillsToExcel, type StoredVisit } from '@/lib/data-store'
import type { Centre, PatientFeedback } from '@/lib/supabase/types'

export default function DashboardPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [loading, setLoading] = useState(true)
  const [allVisits, setAllVisits] = useState<StoredVisit[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [feedbacks, setFeedbacks] = useState<PatientFeedback[]>([])
  
  // Filters
  const [selectedFilterCentre, setSelectedFilterCentre] = useState<string>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | '7days' | '30days' | 'all'>('all')

  useEffect(() => {
    const loadData = async () => {
      try {
        const [vData, cData, fbData] = await Promise.all([
          getVisits(),
          getCentres(),
          getPatientFeedback(),
        ])
        setAllVisits(vData)
        setCentres(cData)
        setFeedbacks(fbData)
      } catch (err) {
        console.error('Failed to load dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Timeframe and Centre filtered visits
  const filteredVisits = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    
    return allVisits.filter(v => {
      // Centre Filter
      if (selectedFilterCentre !== 'all') {
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
  }, [allVisits, selectedFilterCentre, selectedTimeframe])

  // KPIs
  const todayStr = new Date().toISOString().split('T')[0]
  const todayVisitsList = allVisits.filter(v => v.visit_date === todayStr)
  const todayRevenue = todayVisitsList.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  const filteredRevenue = filteredVisits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  const totalDiscounts = filteredVisits.reduce((sum, v) => sum + (Number(v.discount) || 0), 0)
  const avgBillSize = filteredVisits.length > 0 ? Math.round(filteredRevenue / filteredVisits.length) : 0
  const uniquePatientsCount = new Set(allVisits.map(v => v.patient_uid)).size

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

  // Centre-wise Comparison
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

  // Feedback Metrics
  const avgFeedbackScore = useMemo(() => {
    if (feedbacks.length === 0) return 5.0
    const sum = feedbacks.reduce((acc, f) => acc + (f.rating || 5), 0)
    return (sum / feedbacks.length).toFixed(1)
  }, [feedbacks])

  // Daily Trend (Last 7 Days) for SVG Area Chart
  const dailyTrend = useMemo(() => {
    const days: { label: string; date: string; amount: number; count: number }[] = []
    const now = new Date()
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const label = d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })
      
      const dayVisits = allVisits.filter(v => v.visit_date === dateStr)
      const amount = dayVisits.reduce((s, v) => s + (Number(v.total) || 0), 0)
      
      days.push({ label, date: dateStr, amount, count: dayVisits.length })
    }
    return days
  }, [allVisits])

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
              {isAdmin ? '👑 Executive Admin Analytics' : `🏥 ${profile?.centreName || 'Clinic Operations'}`}
            </Badge>
            <span className="text-xs text-blue-200">Physionautics Multispecialty Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Financial & Clinical Analytics
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80">
            Real-time multi-centre revenue trends, patient feedback scores & treatment volume
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-white/10 p-2 rounded-xl border border-white/15 backdrop-blur-md">
          {/* Branch Filter */}
          <Select value={selectedFilterCentre} onValueChange={(v: string | null) => setSelectedFilterCentre(v ?? 'all')}>
            <SelectTrigger className="w-48 bg-white text-gray-900 text-xs font-semibold h-9">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs font-medium">All 3 Clinic Branches</SelectItem>
              {centres.map(c => (
                <SelectItem key={c.id} value={c.id} className="text-xs font-medium">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

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

          <Button
            size="sm"
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs gap-1.5 h-9"
            onClick={() => exportBillsToExcel(filteredVisits)}
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-300" /> Export Excel
          </Button>
        </div>
      </div>

      {/* ================= TOP METRIC CARDS ================= */}
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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Bill Value</p>
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
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Patient CSAT Rating</p>
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

      {/* ================= CHARTS SECTION 1: REVENUE TREND & MULTI-CENTRE COMPARISON ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Daily Revenue Area Trend (7 cols) */}
        <Card className="lg:col-span-7 shadow-sm border">
          <CardHeader className="pb-3 border-b bg-gray-50/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" /> 7-Day Revenue Trendline
              </CardTitle>
              <CardDescription className="text-xs">Daily collections & billing volume</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              Avg: {formatCurrency(Math.round(dailyTrend.reduce((a, b) => a + b.amount, 0) / 7))}/day
            </Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* SVG Interactive Area Chart */}
            <div className="h-48 w-full flex items-end justify-between gap-2 pt-6">
              {dailyTrend.map((day, idx) => {
                const heightPct = Math.max(Math.round((day.amount / (maxDayAmount || 1)) * 100), 8)
                const isToday = day.date === todayStr
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    {/* Tooltip amount on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] font-bold py-1 px-2 rounded shadow-md whitespace-nowrap pointer-events-none mb-1">
                      {formatCurrency(day.amount)} ({day.count} visits)
                    </div>

                    {/* Bar visualization */}
                    <div className="w-full max-w-[36px] bg-blue-100 rounded-t-lg overflow-hidden flex flex-col justify-end" style={{ height: `${heightPct}%` }}>
                      <div 
                        className={`w-full transition-all rounded-t-lg ${isToday ? 'bg-gradient-to-t from-blue-600 to-indigo-600' : 'bg-gradient-to-t from-blue-400 to-blue-500 group-hover:from-blue-500 group-hover:to-blue-600'}`}
                        style={{ height: '100%' }}
                      />
                    </div>

                    {/* Day label */}
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

        {/* Multi-Centre Collections Bar Chart (5 cols) */}
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

                {/* Progress bar */}
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.max(c.barHeightPct, 3)}%`, backgroundColor: c.color }}
                  />
                </div>
              </div>
            ))}

            <div className="p-3 bg-purple-50/80 rounded-xl border border-purple-100 text-xs text-purple-900 flex justify-between items-center mt-2">
              <span className="font-semibold">Top Performing Centre:</span>
              <Badge className="bg-purple-700 text-white text-[10px]">
                {centreComparison.slice().sort((a, b) => b.amount - a.amount)[0]?.short}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ================= CHARTS SECTION 2: PAYMENT DONUT, TOP SERVICES & CSAT ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1. Payment Breakdown */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-3 border-b bg-gray-50/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-emerald-600" /> Payment Methods
            </CardTitle>
            <CardDescription className="text-xs">UPI, Cards, Cash & Insurance distribution</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3.5">
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

        {/* 2. Top Procedures Ranking */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-3 border-b bg-gray-50/50">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Award className="h-4 w-4 text-amber-600" /> Top Clinical Procedures
            </CardTitle>
            <CardDescription className="text-xs">Ranked by revenue contribution & volume</CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {topServices.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No services billed in this timeframe</p>
            ) : (
              topServices.map((svc, idx) => (
                <div key={svc.name} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-gray-50 border border-gray-100">
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
              ))
            )}
          </CardContent>
        </Card>

        {/* 3. Patient Experience & Feedback Snippets */}
        <Card className="shadow-sm border">
          <CardHeader className="pb-3 border-b bg-gray-50/50 flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <HeartHandshake className="h-4 w-4 text-rose-600" /> Patient CSAT & Reviews
              </CardTitle>
              <CardDescription className="text-xs">Post-session patient ratings & feedback</CardDescription>
            </div>
            <Badge className="bg-rose-100 text-rose-800 border-rose-200 text-[10px]">
              ⭐ {avgFeedbackScore} / 5.0
            </Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {feedbacks.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No feedback received yet</p>
            ) : (
              feedbacks.slice(0, 3).map(fb => (
                <div key={fb.id} className="p-3 bg-rose-50/40 rounded-xl border border-rose-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900">{fb.patient_name}</span>
                    <div className="flex text-amber-500 text-[11px]">
                      {'★'.repeat(fb.rating || 5)}
                    </div>
                  </div>
                  {fb.comments && (
                    <p className="text-gray-700 italic text-[11px] leading-relaxed line-clamp-2">
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

      {/* ================= RECENT INVOICES LEDGER TABLE ================= */}
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
    </div>
  )
}

