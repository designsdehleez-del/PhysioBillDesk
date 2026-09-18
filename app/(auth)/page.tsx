'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  Stethoscope, Loader2, Award, HeartPulse, 
  Building2, ArrowRight, Sparkles, User, Lock, Activity, CheckCircle2, ShieldCheck,
  Calendar, FileText, Phone, MapPin, ChevronRight, LogOut, LayoutDashboard, Dumbbell,
  Zap, Target, RefreshCw, UserPlus, CreditCard, Clock, Check, Star, ArrowUpRight
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
        // Keep user on landing page in logged in state
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally { setLoading(false) }
  }

  const isLoggedIn = !!profile || !!user

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

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#overview" className="hover:text-blue-600 transition-colors">Overview</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">Who We Are</a>
            <a href="#procedures" className="hover:text-blue-600 transition-colors">Procedures</a>
            <a href="#services" className="hover:text-blue-600 transition-colors">Services</a>
            <a href="#patient-portal" className="hover:text-blue-600 transition-colors">Patient Care</a>
            <a href="#centers" className="hover:text-blue-600 transition-colors">NCR Clinics</a>
          </nav>

          {/* Right Action / Auth State */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-900">{profile?.name || 'Clinic Staff'}</span>
                  <span className="text-[10px] text-emerald-600 font-medium flex items-center justify-end gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Active Session
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

      {/* 2. Hero Section: Perfectly Balanced Side-by-Side Split */}
      <section id="overview" className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Specific Clinical Positioning */}
        <div className="lg:col-span-7 space-y-6">
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
            <a 
              href="#patient-portal" 
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow flex items-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4" /> Book Patient Consultation <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a 
              href="#procedures" 
              className="px-6 py-3 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs hover:bg-slate-50 transition-all"
            >
              Explore Therapy Procedures
            </a>
          </div>
        </div>

        {/* Right Column: Equal-Height Portal Sign-In or Procedure Showcase */}
        <div id="auth-panel" className="lg:col-span-5 w-full">
          {isLoggedIn ? (
            /* Logged-In State: High-Quality Procedure Care Image Card */
            <Card className="shadow-lg border-blue-200/80 bg-white rounded-2xl overflow-hidden h-[460px] flex flex-col justify-between">
              <div className="relative h-full w-full overflow-hidden">
                <img 
                  src={cms.heroCardImageUrl} 
                  alt="Physiotherapy Patient Care" 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent flex flex-col justify-end p-6">
                  <div className="text-white space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-emerald-500 text-white border-none text-[10px] font-bold px-2.5 py-1">
                        Active Session • {profile?.name || 'Logged In'}
                      </Badge>
                      <button 
                        onClick={() => signOut()} 
                        className="text-xs text-slate-300 hover:text-red-400 font-semibold flex items-center gap-1 transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                    <h3 className="text-xl font-black text-white leading-snug">
                      {cms.heroCardTitle}
                    </h3>
                    <p className="text-xs text-slate-200 leading-relaxed">
                      {cms.heroCardDescription}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            /* Logged-Out State: Sleek, Height-Balanced Portal Sign In Card */
            <Card className="shadow-lg border-slate-200/90 bg-white rounded-2xl h-[460px] flex flex-col justify-between">
              <CardHeader className="space-y-1.5 pb-4 pt-6 px-6 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                    Authorized Access
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">Physionautics v1.0</span>
                </div>
                <CardTitle className="text-xl font-black text-slate-900">
                  {isSignUp ? 'Create Staff Account' : 'Portal Sign In'}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 leading-relaxed">
                  Enter your assigned clinic credentials to access patient records, session logs, and billing.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 px-6 py-6 flex-1 flex flex-col justify-center">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-slate-700">Email or Username</Label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="text"
                        placeholder="e.g. doctor@physionautics.com"
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
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* 2.5 Structured Clinical Statistics & Mission Row */}
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

      {/* 3. Aceternity Container Scroll Animation Section */}
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
          {/* Mockup Dashboard Content inside Container Scroll */}
          <div className="w-full h-full bg-slate-950 p-4 sm:p-8 space-y-6 text-slate-100 flex flex-col justify-between select-none">
            {/* Top Mock Header */}
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

            {/* Dashboard Mock Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Today's Appointments</div>
                <div className="text-2xl font-black text-blue-400">24 Patients</div>
                <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> 18 Completed • 6 Scheduled
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Spine Decompression Recovery</div>
                <div className="text-2xl font-black text-indigo-400">92% Progress</div>
                <div className="text-[11px] text-slate-400">Average VAS Pain Reduction</div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="text-[10px] font-bold text-slate-400 uppercase">Active Therapy Sessions</div>
                <div className="text-2xl font-black text-emerald-400">14 Sessions Today</div>
                <div className="text-[11px] text-slate-400">Non-Invasive Care Active</div>
              </div>
            </div>

            {/* Live Patient Progress Mock List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Recent Active Cases</span>
                <span className="text-blue-400 text-[10px]">View All Records</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Rajesh Kumar (L4-L5 Disc Rehab)</div>
                    <div className="text-[10px] text-slate-400">Session #8 • Dry Needling & Traction</div>
                  </div>
                  <Badge className="bg-blue-500/20 text-blue-300 border-none text-[10px]">Session Active</Badge>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">Anita Sharma (Cervical Spondylosis)</div>
                    <div className="text-[10px] text-slate-400">Session #4 • IFT & Posture Correction</div>
                  </div>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-none text-[10px]">Completed</Badge>
                </div>
              </div>
            </div>
          </div>
        </ContainerScroll>
      </section>

      {/* 4. Section 1: What is Physionautics + Dynamic Procedure Visual Cards */}
      <section id="procedures" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 w-full space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
            PROCEDURES & THERAPIES
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {cms.proceduresSectionTitle}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {cms.proceduresSectionSubtitle}
          </p>
        </div>

        {/* Procedure Image Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cms.procedures.map((proc) => (
            <div key={proc.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                  <img 
                    src={proc.imageUrl} 
                    alt={proc.title} 
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-3 left-3 bg-blue-600 text-white border-none text-[10px] font-bold">
                    {proc.badge}
                  </Badge>
                </div>
                <div className="p-5 space-y-2">
                  <h3 className="font-bold text-base text-slate-900">{proc.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {proc.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Section 2: Who We Are & Clinical Excellence */}
      <section id="about" className="bg-slate-100/70 border-y border-slate-200/80 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-4">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
                WHO WE ARE
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Delhi-NCR’s Leading Physical Therapy Network
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Founded by senior physical therapy specialists, Physionautics operates flagship rehabilitation centres across New Delhi and Gurugram. Every patient undergoes standardized biomechanical assessment and doctor-guided recovery pathways.
              </p>
              
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Doctor of Physical Therapy Led Clinical Teams
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Computerized Spinal Decompression Systems
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Integrated Digital Patient Progress Portal
                </div>
              </div>
            </div>

            {/* Branch Locations Directory */}
            <div id="centers" className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {cms.branches.map((b) => (
                <div key={b.id} className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                    <MapPin className="w-3.5 h-3.5" /> {b.name}
                  </div>
                  <p className="text-[11px] text-slate-500">{b.tagline}</p>
                  <div className="text-[10px] text-slate-400 font-mono">{b.phone}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Section 3: Services & Specialized Therapies */}
      <section id="services" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 w-full space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
            OUR CLINICAL SERVICES
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {cms.servicesSectionTitle}
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            {cms.servicesSectionSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {cms.services.map((srv) => (
            <div key={srv.id} className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all">
              <div className="h-40 w-full relative bg-slate-100">
                <img 
                  src={srv.imageUrl} 
                  alt={srv.title} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{srv.title}</h3>
                  <Badge className="bg-blue-50 text-blue-700 border-none text-[10px]">{srv.badge}</Badge>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {srv.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Section 4: Patient-Facing Portal & Services */}
      <section id="patient-portal" className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-3xl space-y-3">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs px-3 py-1 font-semibold rounded-full">
              {cms.portalBadge}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {cms.portalTitle}
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              {cms.portalSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 backdrop-blur-xs">
              <Calendar className="w-8 h-8 text-blue-400" />
              <h3 className="font-bold text-base text-white">Online Scheduling</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Book consultation sessions with specialist doctors at your preferred clinic branch.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 backdrop-blur-xs">
              <Dumbbell className="w-8 h-8 text-emerald-400" />
              <h3 className="font-bold text-base text-white">Home Exercise Plans</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Access guided exercise video instructions tailored specifically to your treatment phase.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 backdrop-blur-xs">
              <FileText className="w-8 h-8 text-amber-400" />
              <h3 className="font-bold text-base text-white">Digital Reports & Invoices</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Download itemized GST invoices, session history, and doctor assessment reports instantly.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3 backdrop-blur-xs">
              <Phone className="w-8 h-8 text-purple-400" />
              <h3 className="font-bold text-base text-white">WhatsApp Updates</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Receive instant session reminders, receipt PDFs, and doctor follow-up notifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="border-t border-slate-200/80 bg-white px-4 sm:px-8 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              <Stethoscope className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900">
              © {new Date().getFullYear()} Physionautics Physical Therapy & Pain Rehabilitation Centre. All rights reserved.
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex flex-wrap items-center gap-3">
            <span>New Friends Colony</span> •
            <span>Vasant Vihar</span> •
            <span>Gurugram DLF Phase 1</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
