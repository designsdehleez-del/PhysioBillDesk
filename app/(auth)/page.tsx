'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Stethoscope, Loader2, Award, HeartPulse, 
  Building2, ArrowRight, Sparkles, User, Lock, Activity, CheckCircle2, ShieldCheck
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useClinicBranding } from '@/lib/settings-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      {/* Top Clean Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md px-6 py-3.5 sticky top-0 z-20 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <div className="flex flex-col">
                <img src={branding.logoUrl} alt={branding.clinicName || 'Physionautics'} className="h-8 max-w-[200px] object-contain" />
                <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                  {branding.tagline || 'Physiotherapy & Pain Rehabilitation Centre'}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-bold text-base text-slate-900 tracking-tight leading-none block">
                    {branding.clinicName || 'Physionautics'}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {branding.tagline || 'Physiotherapy & Pain Rehabilitation Centre'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-4 text-xs text-slate-600 font-medium">
            <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 text-blue-600" /> Delhi-NCR Branches</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1.5"><HeartPulse className="w-3.5 h-3.5 text-emerald-600" /> Evidence-Based Care</span>
          </div>
        </div>
      </header>

      {/* Main Content: Top-Aligned Grid Layout */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* Left Column: Brand Overview & Clinical Information */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-3">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-semibold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-amber-500" /> Welcome to Physionautics
            </Badge>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Pioneering <span className="text-blue-600">Non-Invasive Rehabilitation</span> & Biomechanical Care
            </h1>

            <p className="text-slate-600 text-xs sm:text-sm leading-relaxed max-w-xl">
              Doctor-led multispecialty physical therapy network dedicated to restoring movement, eliminating chronic pain, and preventing surgeries.
            </p>
          </div>

          {/* Clinical Mission & Vision Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-1.5 shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                <HeartPulse className="w-4 h-4 text-blue-600" /> Clinical Mission
              </div>
              <p className="text-xs text-slate-600 leading-normal">
                Eliminating pain & movement dysfunction with individualized therapy protocols and transparent recovery tracking.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-1.5 shadow-xs hover:border-blue-300 transition-colors">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                <Award className="w-4 h-4 text-amber-500" /> Excellence Vision
              </div>
              <p className="text-xs text-slate-600 leading-normal">
                Setting India's benchmark for physical rehabilitation where technology and clinical research converge.
              </p>
            </div>
          </div>

          {/* Professional Medical Photography & Focal Points */}
          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs space-y-4 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Spine & Joint Focal Point Rehabilitation</h3>
              </div>
              <Badge className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                Non-Surgical Care
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Real Human Rehabilitation Image */}
              <div className="sm:col-span-5 relative h-40 rounded-xl overflow-hidden shadow-xs border border-slate-200">
                <img
                  src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=500"
                  alt="Physiotherapy Patient Care"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent flex items-end p-2.5">
                  <span className="text-[10px] font-bold text-white flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" /> Doctor-Guided Protocols
                  </span>
                </div>
              </div>

              {/* Treatment Focus Points */}
              <div className="sm:col-span-7 space-y-2">
                <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Cervical Spine (C5–C6 Decompression)</span>
                    <span className="text-[11px] text-slate-500">Radiculopathy, neck stiffness & nerve root tension release</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Lumbar Spine (L4–L5 Disc Rehab)</span>
                    <span className="text-[11px] text-slate-500">Sciatica relief, spinal traction & core postural stability</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Knee OA & Shoulder Mobility</span>
                    <span className="text-[11px] text-slate-500">Cartilage loading protocol & capsular range expansion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence-Based Therapy Modalities */}
          <div className="space-y-2.5">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Evidence-Based Therapy Modalities
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-white border border-slate-200/80 p-3 rounded-xl flex flex-col items-center text-center space-y-1 shadow-xs hover:border-blue-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  ⚡
                </div>
                <span className="text-xs font-bold text-slate-800">IFT & Electrotherapy</span>
                <span className="text-[10px] text-slate-500">Pain block therapy</span>
              </div>

              <div className="bg-white border border-slate-200/80 p-3 rounded-xl flex flex-col items-center text-center space-y-1 shadow-xs hover:border-blue-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs">
                  🎯
                </div>
                <span className="text-xs font-bold text-slate-800">Dry Needling</span>
                <span className="text-[10px] text-slate-500">Trigger point release</span>
              </div>

              <div className="bg-white border border-slate-200/80 p-3 rounded-xl flex flex-col items-center text-center space-y-1 shadow-xs hover:border-blue-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold text-xs">
                   Spine
                </div>
                <span className="text-xs font-bold text-slate-800">Spinal Traction</span>
                <span className="text-[10px] text-slate-500">Disc decompression</span>
              </div>

              <div className="bg-white border border-slate-200/80 p-3 rounded-xl flex flex-col items-center text-center space-y-1 shadow-xs hover:border-blue-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-xs">
                  🩹
                </div>
                <span className="text-xs font-bold text-slate-800">Kinesio Taping</span>
                <span className="text-[10px] text-slate-500">Joint stabilization</span>
              </div>
            </div>
          </div>

          {/* Clinical Recovery Statistics */}
          <div className="space-y-2 pt-1">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Clinical Recovery Statistics
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl text-center shadow-xs">
                <div className="text-xl font-extrabold text-blue-600">84%</div>
                <div className="text-[11px] font-bold text-slate-800 mt-0.5">Surgery Avoidance</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Chronic lumbar & knee cases</div>
              </div>

              <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl text-center shadow-xs">
                <div className="text-xl font-extrabold text-emerald-600">3.2x</div>
                <div className="text-[11px] font-bold text-slate-800 mt-0.5">Faster Recovery</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Targeted rehab protocols</div>
              </div>

              <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl text-center shadow-xs">
                <div className="text-xl font-extrabold text-amber-600">98.4%</div>
                <div className="text-[11px] font-bold text-slate-800 mt-0.5">Patient CSAT</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Verified NCR patient reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Top-Aligned Sign In Card */}
        <div className="lg:col-span-5 w-full">
          <Card className="shadow-md border-slate-200/90 bg-white rounded-2xl">
            <CardHeader className="space-y-1 pb-3 pt-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-semibold">
                  Authorized Access
                </Badge>
                <span className="text-[10px] text-slate-400 font-mono">Physionautics v1.0</span>
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">
                {isSignUp ? 'Create Staff Account' : 'Portal Sign In'}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Enter your clinic credentials to access the system.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4 pb-5">
              {/* Quick Fill Demo Shortcuts */}
              <div className="p-2.5 bg-slate-50 border border-slate-200/60 rounded-xl space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                  Quick Login Demo Credentials
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => fillQuickLogin('admin@physionautics.com', 'admin123')}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-[11px] font-semibold text-slate-700 text-left transition-colors"
                  >
                    👑 Master Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => fillQuickLogin('sarah@physionautics.com', 'doctor123')}
                    className="px-2 py-1 bg-white border border-slate-200 hover:border-blue-400 rounded-lg text-[11px] font-semibold text-slate-700 text-left transition-colors"
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
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white px-6 py-3.5 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} Physionautics Physical Therapy & Pain Rehabilitation Centre.
          </div>
          <div className="text-[11px] text-slate-400">
            New Friends Colony · Vasant Vihar · Gurugram DLF
          </div>
        </div>
      </footer>
    </div>
  )
}
