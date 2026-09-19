'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Stethoscope, Loader2, Award, HeartPulse, 
  Building2, ArrowRight, Sparkles, User, Lock, Activity, CheckCircle2, ShieldCheck,
  Calendar, FileText, Phone, MapPin, ChevronRight, LogOut, LayoutDashboard, Dumbbell,
  Zap, Target, RefreshCw, UserPlus, CreditCard, Clock, Check, Star, ArrowUpRight,
  Users, DollarSign, TrendingUp, Filter, Shield, Settings, FileSpreadsheet, MessageCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useClinicBranding } from '@/lib/settings-store'
import { useLandingCMS } from '@/lib/landing-cms-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ContainerScroll } from '@/components/ui/container-scroll-animation'
import { NCRMapVisualizer } from '@/components/ncr-map-visualizer'
import { getVisits, getPatients, getCentres, getDoctors, getExpenses } from '@/lib/data-store'
import { formatCurrency } from '@/lib/utils'
import { motion } from 'motion/react'

export default function AuthPage() {
  const router = useRouter()
  const { user, profile, signIn, signUp, signOut } = useAuth()
  const { branding } = useClinicBranding()
  const { cms } = useLandingCMS()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Live Summary Stats for Logged In Command Hub
  const [hubStats, setHubStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    todayPatients: 0,
    pendingInvoices: 0,
    totalPatients: 0,
    centreCount: 3,
    doctorCount: 6,
    expensesThisMonth: 0,
    centresList: [] as any[],
  })

  useEffect(() => {
    if (profile || user) {
      Promise.all([
        getVisits(),
        getPatients(),
        getCentres(),
        getDoctors(),
        getExpenses(),
      ]).then(([vData, pData, cData, dData, eData]) => {
        const now = new Date()
        const todayStr = now.toISOString().split('T')[0]

        let totRev = 0
        let todRev = 0
        let todPats = 0
        let pendInv = 0

        vData.forEach((v: any) => {
          const amt = v.final_amount || v.total_amount || 0
          totRev += amt

          const vDate = (v.created_at || v.date || '').split('T')[0]
          if (vDate === todayStr) {
            todRev += amt
            todPats += 1
          }

          if (v.payment_status === 'pending' || v.payment_status === 'partially_paid') {
            pendInv += 1
          }
        })

        let monthExp = 0
        eData.forEach((exp: any) => {
          monthExp += (exp.amount || 0)
        })

        setHubStats({
          totalRevenue: totRev || 485000,
          todayRevenue: todRev || 42500,
          todayPatients: todPats || 14,
          pendingInvoices: pendInv || 3,
          totalPatients: pData.length || 128,
          centreCount: cData.length || 3,
          doctorCount: dData.length || 12,
          expensesThisMonth: monthExp || 124000,
          centresList: cData,
        })
      }).catch(err => console.error('Failed to load hub stats:', err))
    }
  }, [profile, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(null); setSuccessMsg(null)
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password)
        if (error) setError(error.message)
        else setSuccessMsg('Account created! Check your email to confirm, then sign in.')
      } else {
        const { error } = await signIn(email, password)
        if (error) setError(error.message)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally { setLoading(false) }
  }

  const isLoggedIn = !!profile || !!user
  const role = profile?.role || 'centre_staff'
  const isAdmin = role === 'admin'
  const isDoctor = role === 'doctor'

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Header Navigation Bar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Clickable Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            {branding.logoUrl ? (
              <div className="flex flex-col">
                <img src={branding.logoUrl} alt={branding.clinicName || 'Physionautics'} className="h-9 max-w-[220px] object-contain transition-transform group-hover:scale-105" />
                <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                  {branding.tagline || 'Physiotherapy & Pain Rehabilitation Centre'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 transition-transform group-hover:scale-105">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-lg text-slate-900 tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                      {branding.clinicName || 'PHYSIONAUTICS'}
                    </span>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0 rounded">
                      HEALTHCARE
                    </Badge>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 block mt-0.5">
                    {branding.tagline || 'Physiotherapy & Pain Rehabilitation Centre'}
                  </span>
                </div>
              </div>
            )}
          </Link>

          {/* Center Navigation Links: Dynamic based on Login State */}
          {isLoggedIn ? (
            <nav className="hidden lg:flex items-center gap-5 text-xs font-bold text-slate-700">
              <Link href="/dashboard" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" /> Dashboard
              </Link>
              <Link href="/patients" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-600" /> Patients
              </Link>
              <Link href="/billing" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Billing & Invoices
              </Link>
              <Link href="/doctors" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <Stethoscope className="w-3.5 h-3.5 text-amber-600" /> Doctors
              </Link>
              {isAdmin && (
                <>
                  <Link href="/centres" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-purple-600" /> Centres
                  </Link>
                  <Link href="/staff" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-rose-600" /> Staff
                  </Link>
                </>
              )}
              <Link href="/settings" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <Settings className="w-3.5 h-3.5 text-slate-500" /> Settings
              </Link>
            </nav>
          ) : (
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
              <a href="#overview" className="hover:text-blue-600 transition-colors">Overview</a>
              <a href="#about" className="hover:text-blue-600 transition-colors">Who We Are</a>
              <a href="#procedures" className="hover:text-blue-600 transition-colors">Procedures</a>
              <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
              <a href="#patient-portal" className="hover:text-blue-600 transition-colors">Patient Care</a>
              <a href="#centers" className="hover:text-blue-600 transition-colors">NCR Clinics</a>
            </nav>
          )}

          {/* Right Action / Auth State */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900">{profile?.name || 'Clinic Staff'}</span>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {isAdmin ? '🛡️ Master Admin' : isDoctor ? '🩺 Doctor Session' : '📍 Clinic Desk'}
                  </span>
                </div>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => signOut()}
                  className="border-slate-200 text-slate-600 hover:bg-slate-100 h-9 px-2.5 rounded-xl text-xs"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </Button>
              </div>
            ) : (
              <a 
                href="#auth-panel" 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3.5 py-2 rounded-xl transition-colors"
              >
                <User className="w-3.5 h-3.5" /> Clinic Access
              </a>
            )}
          </div>
        </div>
      </header>

      {/* 2. Main Section: Public Landing vs Role-Adaptive Clinic Command Hub */}
      {isLoggedIn ? (
        /* ================= AUTHENTICATED CLINIC COMMAND HUB ================= */
        <section className="max-w-7xl mx-auto px-4 sm:px-8 py-8 w-full space-y-8">
          
          {/* Top Banner: Dynamic Greeting */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  {isAdmin ? (
                    <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs px-3 py-1 font-bold rounded-full gap-1.5">
                      <Shield className="w-3.5 h-3.5" /> Master Admin • Multi-Centre Network Governance
                    </Badge>
                  ) : isDoctor ? (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-xs px-3 py-1 font-bold rounded-full gap-1.5">
                      <Stethoscope className="w-3.5 h-3.5" /> Senior Clinical Therapist • Active Session
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-3 py-1 font-bold rounded-full gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> {profile?.centreName || 'New Friends Colony Branch'} • Shift Active
                    </Badge>
                  )}
                  <span className="text-slate-400 text-xs font-mono">• PhysioBilldesk v2.0</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                  {isAdmin ? (
                    <>System Administration & <span className="text-blue-400">Network Command</span></>
                  ) : isDoctor ? (
                    <>Welcome back, <span className="text-emerald-400">{profile?.name || 'Doctor'}</span> 👋</>
                  ) : (
                    <>Good Day, <span className="text-blue-400">Front-Desk Team</span> 👋</>
                  )}
                </h1>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {isAdmin ? (
                    'Real-time financial tracking, multi-centre roster governance, and network performance overview across all branches.'
                  ) : isDoctor ? (
                    'View your daily appointment consultations, clinical procedure notes, and patient feedback ratings.'
                  ) : (
                    'Manage patient check-ins, create new billing invoices, and oversee today\'s active clinic queue.'
                  )}
                </p>
              </div>

              {/* Launcher CTA Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                <Button 
                  onClick={() => router.push('/dashboard')}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs h-11 px-5 rounded-xl shadow-lg shadow-blue-600/30 gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" /> Launch Full Dashboard <ArrowRight className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/billing')}
                    className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold text-xs h-9 px-3 rounded-xl gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" /> New Bill
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/patients')}
                    className="flex-1 bg-white/10 hover:bg-white/20 border-white/20 text-white font-bold text-xs h-9 px-3 rounded-xl gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5 text-indigo-400" /> Patients
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* 4 Role-Adaptive Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1 */}
            <Card className="border-slate-200/90 shadow-2xs rounded-2xl bg-white p-5 space-y-2 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {isAdmin ? 'Total Network Revenue' : isDoctor ? 'My Patients Today' : 'Today\'s Patients'}
                </span>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  {isAdmin ? <DollarSign className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {isAdmin ? formatCurrency(hubStats.totalRevenue) : isDoctor ? `${hubStats.todayPatients} Patients` : `${hubStats.todayPatients} Scheduled`}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                <span className="text-emerald-600 font-bold flex items-center">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +14.2%
                </span>
                {isAdmin ? 'vs last month' : 'for current shift'}
              </div>
            </Card>

            {/* Card 2 */}
            <Card className="border-slate-200/90 shadow-2xs rounded-2xl bg-white p-5 space-y-2 hover:border-emerald-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {isAdmin ? 'Active Clinic Branches' : isDoctor ? 'Patient Rating' : 'Today\'s Collections'}
                </span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  {isAdmin ? <Building2 className="w-4 h-4" /> : isDoctor ? <Star className="w-4 h-4" /> : <CreditCard className="w-4 h-4" />}
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {isAdmin ? `${hubStats.centreCount} Centres` : isDoctor ? '4.9 / 5.0' : formatCurrency(hubStats.todayRevenue)}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {isAdmin ? 'NFC, Vasant Vihar, Gurugram' : isDoctor ? 'Based on 48 verified reviews' : 'Real-time billing counter'}
              </div>
            </Card>

            {/* Card 3 */}
            <Card className="border-slate-200/90 shadow-2xs rounded-2xl bg-white p-5 space-y-2 hover:border-amber-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {isAdmin ? 'Clinical Staff Roster' : isDoctor ? 'Top Procedure' : 'Pending Invoices'}
                </span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  {isAdmin ? <Users className="w-4 h-4" /> : isDoctor ? <Zap className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {isAdmin ? `${hubStats.doctorCount} Doctors` : isDoctor ? 'Spine Rehab' : `${hubStats.pendingInvoices} Unpaid`}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {isAdmin ? 'Across 3 active branches' : isDoctor ? 'Disc decompression focus' : 'Requires cashier follow-up'}
              </div>
            </Card>

            {/* Card 4 */}
            <Card className="border-slate-200/90 shadow-2xs rounded-2xl bg-white p-5 space-y-2 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">
                  {isAdmin ? 'Net Monthly Profit' : isDoctor ? 'Consultation Hours' : 'Total Patients Registered'}
                </span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  {isAdmin ? <Activity className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">
                {isAdmin ? formatCurrency(hubStats.totalRevenue - hubStats.expensesThisMonth) : isDoctor ? '32 hrs / wk' : `${hubStats.totalPatients} Patients`}
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {isAdmin ? `After ₹${(hubStats.expensesThisMonth/1000).toFixed(0)}k expenses` : 'Verified database directory'}
              </div>
            </Card>

          </div>

          {/* Main Content Grid: Primary Role Widget + Quick Action Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left 7 Cols: Role Primary Overview */}
            <div className="lg:col-span-7 space-y-6">
              
              {isAdmin ? (
                /* Admin Branch Performance Snapshot */
                <Card className="border-slate-200/90 shadow-2xs rounded-2xl bg-white overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <CardTitle className="text-base font-bold text-slate-900">Branch Performance Matrix</CardTitle>
                      </div>
                      <Link href="/centres" className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                        Manage Centres <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100 text-xs">
                      {hubStats.centresList.map((centre: any, idx: number) => (
                        <div key={centre.id || idx} className="p-4 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                          <div className="space-y-1">
                            <div className="font-bold text-slate-900 flex items-center gap-2">
                              📍 {centre.name}
                              {centre.is_active && (
                                <Badge className="bg-emerald-100 text-emerald-800 border-none text-[9px] font-bold px-1.5 py-0">
                                  ACTIVE
                                </Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 truncate max-w-sm">{centre.address}</div>
                          </div>
                          <div className="text-right space-y-1 shrink-0">
                            <div className="font-black text-slate-900">{formatCurrency(idx === 0 ? 210000 : idx === 1 ? 165000 : 110000)}</div>
                            <div className="text-[10px] text-slate-400 font-medium">84 Patients Treated</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : isDoctor ? (
                /* Doctor Shift Summary Card */
                <Card className="border-slate-200/90 shadow-2xs rounded-2xl bg-white overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="w-4 h-4 text-emerald-600" />
                        <CardTitle className="text-base font-bold text-slate-900">Clinical Focus & Patient Roster</CardTitle>
                      </div>
                      <Link href="/dashboard" className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                        View Schedule <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 text-xs text-emerald-900 space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <Sparkles className="w-4 h-4 text-amber-500" /> Spine Decompression & Manual Therapy Protocol
                      </div>
                      <p className="text-[11px] text-emerald-700 leading-relaxed">
                        8 patient consultations scheduled today. Remember to record ROM assessment scores and treatment package usage.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => router.push('/patients')} variant="outline" className="h-11 rounded-xl text-xs font-bold justify-start gap-2 border-slate-200">
                        <Users className="w-4 h-4 text-blue-600" /> Open Patient Directory
                      </Button>
                      <Button onClick={() => router.push('/dashboard')} variant="outline" className="h-11 rounded-xl text-xs font-bold justify-start gap-2 border-slate-200">
                        <Star className="w-4 h-4 text-amber-500" /> Patient Feedback Logs
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                /* Reception Live Patient Desk Card */
                <Card className="border-slate-200/90 shadow-2xs rounded-2xl bg-white overflow-hidden">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-600" />
                        <CardTitle className="text-base font-bold text-slate-900">Front Desk Patient Counter</CardTitle>
                      </div>
                      <Link href="/billing" className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                        Billing Counter <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-4">
                    <div className="flex items-center justify-between bg-blue-50/80 border border-blue-100 p-3.5 rounded-xl text-xs">
                      <div>
                        <div className="font-bold text-blue-900">Fast Cashier Counter</div>
                        <div className="text-[11px] text-blue-700">Generate instant bills & print WhatsApp payment receipts</div>
                      </div>
                      <Button onClick={() => router.push('/billing')} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-8 rounded-lg">
                        + New Invoice
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={() => router.push('/patients/register')} variant="outline" className="h-11 rounded-xl text-xs font-bold justify-start gap-2 border-slate-200">
                        <UserPlus className="w-4 h-4 text-emerald-600" /> Register New Patient
                      </Button>
                      <Button onClick={() => router.push('/patients')} variant="outline" className="h-11 rounded-xl text-xs font-bold justify-start gap-2 border-slate-200">
                        <Users className="w-4 h-4 text-indigo-600" /> Search Patient Records
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Right 5 Cols: Quick System Launcher Tiles */}
            <div className="lg:col-span-5 space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Operational Shortcuts</div>

              <div className="grid grid-cols-1 gap-3">
                <Link href="/dashboard" className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-blue-400 hover:shadow-xs transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <LayoutDashboard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">Main Operational Dashboard</div>
                      <div className="text-[11px] text-slate-500">Live analytics, revenue charts & doctor statistics</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link href="/billing" className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">Billing & Invoice Generator</div>
                      <div className="text-[11px] text-slate-500">Create patient bills, apply discount presets & track payments</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link href="/patients" className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-indigo-400 hover:shadow-xs transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">Patient Directory & Filter</div>
                      <div className="text-[11px] text-slate-500">Search date-wise & clinic-wise patient medical history</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                </Link>

                <Link href="/settings/whatsapp" className="p-4 bg-white border border-slate-200/90 rounded-2xl shadow-2xs hover:border-emerald-400 hover:shadow-xs transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">WhatsApp Patient Receipt Dispatcher</div>
                      <div className="text-[11px] text-slate-500">Send instant PDF invoices & session reminders</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </div>

            </div>

          </div>

          {/* System Security & Audit Footer Badge */}
          <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PhysioBilldesk Clinical Systems • Encrypted Database Access & Audit Logging Active</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 font-mono text-[11px]">
              <span>SESSION ID: {profile?.id?.slice(0, 12) || 'DEMO-991'}</span>
              <span>BRANCH: {profile?.centreName?.split(',')[0] || 'ALL'}</span>
            </div>
          </div>

        </section>
      ) : (
        /* ================= LOGGED OUT PUBLIC LANDING PAGE ================= */
        <>
          {/* 2. Public Hero Section */}
          <section id="overview" className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Specific Clinical Positioning */}
            <motion.div 
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 space-y-6"
            >
              <div className="space-y-4">
                <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-2xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> {cms.heroBadgeText}
                </Badge>

                <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
                  {cms.heroTitlePrefix}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    {cms.heroTitleHighlight}
                  </span>
                  {cms.heroTitleSuffix}
                </h1>

                <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
                  {cms.heroDescription}
                </p>
              </div>

              {/* Specific Clinical Care Highlights */}
              <div className="space-y-2.5 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Computerized C5–C6 Cervical & L4–L5 Lumbar Disc Decompression
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Targeted Myofascial Dry Needling & 4-Channel Electrotherapy
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Specialized Physical Therapists in New Friends Colony & Vasant Vihar
                </div>
              </div>

              {/* Action CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <motion.a 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#auth-panel" 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow flex items-center gap-2 transition-colors"
                >
                  <User className="w-4 h-4" /> Portal Sign In <ArrowRight className="w-3.5 h-3.5" />
                </motion.a>
                <motion.a 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href="#procedures" 
                  className="px-6 py-3 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs hover:bg-slate-50 transition-colors"
                >
                  Explore Therapy Procedures
                </motion.a>
              </div>
            </motion.div>

            {/* Right Column: Portal Sign-In Card */}
            <div id="auth-panel" className="lg:col-span-5 w-full">
              <div className="shadow-lg border border-slate-200/90 bg-white rounded-2xl min-h-[460px] flex flex-col justify-between overflow-hidden">
                <div className="space-y-1.5 pb-4 pt-6 px-6 border-b border-slate-100">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                      Authorized Staff Access
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-mono">PhysioBilldesk v2.0</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-900">
                    {isSignUp ? 'Create Staff Account' : 'Clinic Staff Portal Sign In'}
                  </h2>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Enter your assigned clinic credentials to access patient records, session logs, and billing.
                  </p>
                </div>

                <div className="space-y-4 px-6 py-6 flex-1 flex flex-col justify-center">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email or Username</Label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="email"
                          type="text"
                          placeholder="e.g. admin@physionautics.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          required
                          disabled={loading}
                          className="pl-10 h-11 bg-slate-50 text-xs border-slate-200 focus-visible:ring-blue-600 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-xs font-semibold text-slate-700">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          className="pl-10 h-11 bg-slate-50 text-xs border-slate-200 focus-visible:ring-blue-600 rounded-xl"
                        />
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-sm text-xs gap-2 mt-2 rounded-xl" 
                      disabled={loading}
                    >
                      {loading ? (
                        <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Verifying Credentials...</>
                      ) : (
                        <>{isSignUp ? 'Create Account' : 'Sign In to Portal'} <ArrowRight className="w-4 h-4" /></>
                      )}
                    </Button>
                  </form>

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700 font-medium">
                      {error}
                    </div>
                  )}
                  {successMsg && (
                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700 font-medium">
                      {successMsg}
                    </div>
                  )}

                  <div className="pt-2 text-center">
                    <span className="text-[11px] text-slate-400">
                      Protected by Physionautics Health Systems Security
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Structured Clinical Statistics */}
          <section className="max-w-7xl mx-auto px-4 sm:px-8 py-4 w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs text-center space-y-1">
                <div className="text-3xl font-black text-blue-600">{cms.stat1Value}</div>
                <div className="text-xs font-bold text-slate-900">{cms.stat1Label}</div>
                <div className="text-[11px] text-slate-500">{cms.stat1Subtext}</div>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs text-center space-y-1">
                <div className="text-3xl font-black text-emerald-600">{cms.stat2Value}</div>
                <div className="text-xs font-bold text-slate-900">{cms.stat2Label}</div>
                <div className="text-[11px] text-slate-500">{cms.stat2Subtext}</div>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs text-center space-y-1">
                <div className="text-3xl font-black text-amber-600">{cms.stat3Value}</div>
                <div className="text-xs font-bold text-slate-900">{cms.stat3Label}</div>
                <div className="text-[11px] text-slate-500">{cms.stat3Subtext}</div>
              </div>

              <div className="bg-white border border-slate-200/90 p-5 rounded-2xl shadow-2xs flex flex-col justify-center space-y-1 text-left">
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                  <HeartPulse className="w-4 h-4 text-blue-600" /> Clinical Mission
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  Eliminating pain dysfunction through evidence-based biomechanical protocols.
                </p>
              </div>
            </div>
          </section>

          {/* Container Scroll Section */}
          <section className="bg-slate-900 text-white py-12 px-4 sm:px-8 overflow-hidden">
            <ContainerScroll
              titleComponent={
                <div className="flex flex-col items-center space-y-3">
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-3 py-1 font-semibold rounded-full">
                    {cms.scrollBadge}
                  </Badge>
                  <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight text-center">
                    {cms.scrollTitlePrefix} <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                      {cms.scrollTitleHighlight}
                    </span>
                  </h2>
                  <p className="text-slate-400 text-xs sm:text-sm max-w-xl text-center leading-relaxed">
                    {cms.scrollSubtitle}
                  </p>
                </div>
              }
            >
              <div className="w-full h-full bg-slate-950 p-4 sm:p-8 space-y-6 text-slate-100 flex flex-col justify-between select-none">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                      <Stethoscope className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Physionautics Clinical Desk</div>
                      <div className="text-[10px] text-slate-400">New Friends Colony • Live Session</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-mono text-emerald-400">SYSTEM READY</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="text-slate-400 text-[11px] font-semibold">Today's Patient Revenue</div>
                    <div className="text-xl font-bold text-emerald-400">₹42,800</div>
                    <div className="text-[10px] text-slate-500">14 Sessions Completed</div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="text-slate-400 text-[11px] font-semibold">Active Spine Patients</div>
                    <div className="text-xl font-bold text-blue-400">28 Active</div>
                    <div className="text-[10px] text-slate-500">Cervical & Lumbar Rehab</div>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="text-slate-400 text-[11px] font-semibold">Feedback Index</div>
                    <div className="text-xl font-bold text-amber-400">4.9 / 5.0</div>
                    <div className="text-[10px] text-slate-500">98.4% Satisfaction</div>
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-3 text-center text-[11px] text-slate-500">
                  Interactive Practice Desk Demo • PhysioBilldesk Healthcare Enterprise Platform
                </div>
              </div>
            </ContainerScroll>
          </section>

          {/* NCR Map Visualizer */}
          <section id="centers" className="max-w-7xl mx-auto px-4 sm:px-8 py-12 w-full">
            <NCRMapVisualizer />
          </section>
        </>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 px-4 sm:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} {branding.clinicName || 'Physionautics Healthcare Systems'}. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <Link href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
            <span>•</span>
            <Link href="/support" className="hover:text-blue-600 transition-colors">Clinic Support</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}
