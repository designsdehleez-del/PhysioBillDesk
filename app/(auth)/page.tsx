'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Stethoscope, Loader2, Award, HeartPulse, 
  Building2, ArrowRight, Sparkles, User, Lock, Activity, CheckCircle2, ShieldCheck,
  Calendar, FileText, Phone, MapPin, ChevronRight, LogOut, LayoutDashboard, Dumbbell,
  Zap, Target, RefreshCw, UserPlus, CreditCard, Clock, Check, Star, ArrowUpRight
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useClinicBranding } from '@/lib/settings-store'
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
        else router.push('/dashboard')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally { setLoading(false) }
  }

  const fillQuickLogin = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail)
    setPassword(rolePass)
  }

  const isLoggedIn = !!profile || !!user

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* 1. Header / Navigation Bar */}
      <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Left: Brand Logo & Clinic Name */}
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <div className="flex flex-col">
                <img src={branding.logoUrl} alt={branding.clinicName || 'Physionautics'} className="h-9 max-w-[220px] object-contain" />
                <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                  {branding.tagline || 'Physiotherapy & Pain Rehabilitation Centre'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-lg text-slate-900 tracking-tight leading-none">
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
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-600">
            <a href="#overview" className="hover:text-blue-600 transition-colors">Overview</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">Who We Are</a>
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

      {/* 2. Hero Section: Split Grid Layout */}
      <section id="overview" className="max-w-7xl mx-auto px-4 sm:px-8 py-10 sm:py-14 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Brand & Clinical Positioning */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-4">
            <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 text-xs font-bold px-3 py-1 rounded-full inline-flex items-center gap-2 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" /> Welcome to Physionautics Healthcare
            </Badge>

            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Pioneering <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Non-Invasive Rehabilitation</span> & Spine Care
            </h1>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl">
              Doctor-led multispecialty physical therapy network dedicated to restoring biomechanical alignment, eliminating chronic pain, and preventing unnecessary surgical interventions.
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-3 gap-3 p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs">
            <div className="text-center border-r border-slate-100 pr-2">
              <div className="text-2xl font-black text-blue-600">84%</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">Surgery Avoided</div>
              <div className="text-[10px] text-slate-400">Spine & knee cases</div>
            </div>
            <div className="text-center border-r border-slate-100 px-2">
              <div className="text-2xl font-black text-emerald-600">3.2x</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">Faster Recovery</div>
              <div className="text-[10px] text-slate-400">Evidence-based care</div>
            </div>
            <div className="text-center pl-2">
              <div className="text-2xl font-black text-amber-600">98.4%</div>
              <div className="text-xs font-bold text-slate-800 mt-0.5">Patient CSAT</div>
              <div className="text-[10px] text-slate-400">Delhi-NCR reviews</div>
            </div>
          </div>

          {/* Clinical Mission & Vision */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-2 shadow-xs hover:border-blue-300 transition-all">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-xs">
                <HeartPulse className="w-4 h-4 text-blue-600" /> Clinical Mission
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eliminating pain and movement dysfunction with individualized targeted therapy protocols and transparent recovery tracking.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-2 shadow-xs hover:border-blue-300 transition-all">
              <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                <Award className="w-4 h-4 text-amber-500" /> Excellence Vision
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Setting India's benchmark for physical rehabilitation where biomechanical technology and clinical research converge.
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <a 
              href="#patient-portal" 
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow flex items-center gap-2 transition-all"
            >
              <Calendar className="w-4 h-4" /> Book Patient Session <ArrowRight className="w-3.5 h-3.5" />
            </a>
            <a 
              href="#services" 
              className="px-5 py-2.5 bg-white border border-slate-200 hover:border-blue-300 text-slate-700 font-bold text-xs rounded-xl shadow-2xs hover:bg-slate-50 transition-all"
            >
              Explore Treatment Modalities
            </a>
          </div>
        </div>

        {/* Right Column: Conditional Auth State or Physiotherapy Showcase */}
        <div id="auth-panel" className="lg:col-span-5 w-full">
          {isLoggedIn ? (
            /* Logged-In State: Physiotherapy Care Showcase & Quick Workspace Access */
            <Card className="shadow-lg border-blue-200/80 bg-gradient-to-b from-white to-blue-50/40 rounded-2xl overflow-hidden">
              <div className="relative h-44 w-full overflow-hidden border-b border-slate-100">
                <img 
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800" 
                  alt="Physiotherapy Patient Care" 
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/30 to-transparent flex items-end p-4">
                  <div className="text-white space-y-1">
                    <Badge className="bg-emerald-500 text-white border-none text-[10px] font-bold px-2 py-0.5">
                      Doctor Guided Protocol
                    </Badge>
                    <h3 className="text-base font-extrabold text-white">Physionautics Clinical Care Portal</h3>
                  </div>
                </div>
              </div>

              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between p-3 bg-white border border-slate-200/80 rounded-xl shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm border border-blue-200">
                      {profile?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-slate-900">{profile?.name || 'Authorized Staff'}</div>
                      <div className="text-[11px] text-slate-500">{profile?.roleTitle || (profile?.role === 'admin' ? 'Master Administrator' : 'Clinic Specialist')}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold">
                    Active
                  </Badge>
                </div>

                <div className="space-y-2">
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 text-xs rounded-xl shadow-md gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Enter Staff Workspace <ArrowRight className="w-4 h-4" />
                  </Button>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/patients/register')}
                      className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-semibold text-xs h-9 rounded-xl gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-blue-600" /> New Patient
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => router.push('/billing')}
                      className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 font-semibold text-xs h-9 rounded-xl gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" /> Billing
                    </Button>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">Session ID: <span className="font-mono text-slate-700">{profile?.id || 'usr-active'}</span></span>
                  <button 
                    onClick={() => signOut()} 
                    className="text-red-600 hover:text-red-700 font-bold flex items-center gap-1 hover:underline"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Sign Out
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Logged-Out State: Interactive Portal Sign In Card */
            <Card className="shadow-lg border-slate-200/90 bg-white rounded-2xl">
              <CardHeader className="space-y-1 pb-3 pt-5 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold">
                    Authorized Access
                  </Badge>
                  <span className="text-[10px] text-slate-400 font-mono">Physionautics v1.0</span>
                </div>
                <CardTitle className="text-lg font-bold text-slate-900">
                  {isSignUp ? 'Create Staff Account' : 'Portal Sign In'}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Enter your clinic credentials to access patient records and billing.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 pt-4 pb-5">
                {/* Demo Preset Credentials */}
                <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    Quick Login Demo Credentials
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => fillQuickLogin('admin@physionautics.com', 'admin123')}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-[11px] font-semibold text-slate-700 text-left transition-colors"
                    >
                      👑 Master Admin
                    </button>
                    <button
                      type="button"
                      onClick={() => fillQuickLogin('sarah@physionautics.com', 'doctor123')}
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-[11px] font-semibold text-slate-700 text-left transition-colors"
                    >
                      🩺 Doctor Desk
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-xs font-medium text-slate-700">Email or Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="text"
                        placeholder="e.g. admin@physionautics.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-9 h-10 bg-white text-xs border-slate-200 focus-visible:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-xs font-medium text-slate-700">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        className="pl-9 h-10 bg-white text-xs border-slate-200 focus-visible:ring-blue-600"
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-xs text-xs gap-1.5 mt-1 rounded-xl" 
                    disabled={loading}
                  >
                    {loading ? (
                      <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Verifying Credentials...</>
                    ) : (
                      <>{isSignUp ? 'Create Account' : 'Sign In'} <ArrowRight className="w-3.5 h-3.5" /></>
                    )}
                  </Button>
                </form>

                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-2.5 text-xs text-red-700 font-medium">
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-700 font-medium">
                    {successMsg}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* 3. Aceternity Container Scroll Animation Section */}
      <section className="bg-slate-900 text-white py-12 px-4 sm:px-8 overflow-hidden">
        <ContainerScroll
          titleComponent={
            <div className="flex flex-col items-center space-y-3">
              <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs px-3 py-1 font-semibold rounded-full">
                INTEGRATED CLINICAL PLATFORM
              </Badge>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight text-center">
                Unleash Precision Recovery with <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                  Digital Health Workflows
                </span>
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xl text-center leading-relaxed">
                Experience seamless patient evaluation, digital session logging, real-time revenue tracking, and outcome monitoring in one unified platform.
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
                <div className="text-[10px] font-bold text-slate-400 uppercase">Revenue & Collections</div>
                <div className="text-2xl font-black text-amber-400">₹48,500 Today</div>
                <div className="text-[11px] text-slate-400">Instant GST Invoicing Active</div>
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

      {/* 4. Section 1: What is Physionautics */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-8 py-16 w-full space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold px-3 py-1 rounded-full">
            WHAT IS PHYSIONAUTICS
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Science-Backed Non-Invasive Physical Medicine
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Physionautics represents a modern approach to rehabilitation combining clinical biomechanics, precise targeted physical therapies, and digital recovery tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Spine Alignment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Targeted cervical and lumbar spinal decompression to relieve nerve root compression without surgery.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Advanced Electrophysiology</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Interferential Therapy (IFT) and High-Frequency Ultrasound for deep tissue inflammation reduction.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Myofascial Dry Needling</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Precision trigger point needle therapy for releasing deep muscle knots and restoring blood circulation.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl space-y-3 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Dumbbell className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900">Functional Rehab</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Custom joint loading protocols and posture re-education for long-term pain prevention.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Section 2: Who We Are & Clinical Excellence */}
      <section className="bg-slate-100/70 border-y border-slate-200/80 py-16">
        <div id="centers" className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
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

            {/* Branch Locations Grid */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                  <MapPin className="w-3.5 h-3.5" /> New Friends Colony
                </div>
                <p className="text-[11px] text-slate-500">Flagship Centre, South Delhi</p>
                <div className="text-[10px] text-slate-400 font-mono">+91 98100 12345</div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                  <MapPin className="w-3.5 h-3.5" /> Vasant Vihar
                </div>
                <p className="text-[11px] text-slate-500">Spine & Joint Centre, South Delhi</p>
                <div className="text-[10px] text-slate-400 font-mono">+91 98100 67890</div>
              </div>

              <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 text-blue-600 font-bold text-xs">
                  <MapPin className="w-3.5 h-3.5" /> Gurugram DLF Phase 1
                </div>
                <p className="text-[11px] text-slate-500">Sports & Spine Rehab, HR</p>
                <div className="text-[10px] text-slate-400 font-mono">+91 98100 54321</div>
              </div>
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
            Comprehensive Physical Rehabilitation Modalities
          </h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Tailored treatment plans engineered for rapid symptom control and structural joint stabilization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xl">⚡</span>
              <Badge className="bg-blue-50 text-blue-700 border-none text-[10px]">Pain Management</Badge>
            </div>
            <h3 className="font-bold text-sm text-slate-900">IFT & Ultrasound Therapy</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Dual-frequency interferential current to block pain nerve pathways and accelerate cellular healing.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xl">🎯</span>
              <Badge className="bg-rose-50 text-rose-700 border-none text-[10px]">Targeted Muscle</Badge>
            </div>
            <h3 className="font-bold text-sm text-slate-900">Dry Needling & Cupping</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Myofascial trigger point deactivation for persistent muscle tightness and chronic spasms.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xl"> Spine</span>
              <Badge className="bg-indigo-50 text-indigo-700 border-none text-[10px]">Disc Decompression</Badge>
            </div>
            <h3 className="font-bold text-sm text-slate-900">Computerized Spinal Traction</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Graduated lumbar and cervical distraction for herniated discs and sciatica nerve pressure.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xl">🩹</span>
              <Badge className="bg-teal-50 text-teal-700 border-none text-[10px]">Joint Support</Badge>
            </div>
            <h3 className="font-bold text-sm text-slate-900">Kinesio Taping & Mobilization</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Proprioceptive taping protocols to stabilize ligaments and support dynamic movement during recovery.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xl">🏃</span>
              <Badge className="bg-amber-50 text-amber-700 border-none text-[10px]">Sports Medicine</Badge>
            </div>
            <h3 className="font-bold text-sm text-slate-900">Sports Injury Rehabilitation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ACL/MCL recovery, shoulder rotator cuff rehab, and return-to-sport athletic conditioning.
            </p>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-2xl space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xl">🦴</span>
              <Badge className="bg-emerald-50 text-emerald-700 border-none text-[10px]">Post-Op Care</Badge>
            </div>
            <h3 className="font-bold text-sm text-slate-900">Post-Surgical Joint Restoration</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Structured progressive loading after knee replacement, hip surgery, or spinal fixation.
            </p>
          </div>
        </div>
      </section>

      {/* 7. Section 4: Patient-Facing Portal & Services */}
      <section id="patient-portal" className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 text-white py-16 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="max-w-3xl space-y-3">
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-xs px-3 py-1 font-semibold rounded-full">
              PATIENT CARE & PORTAL
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Seamless Patient Experience & Digital Care
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              From appointment scheduling to home exercise plans and digital bill receipts, Physionautics keeps patients connected to their recovery journey.
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
