'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Stethoscope, Loader2, CheckCircle2, Award, Activity, 
  ShieldCheck, HeartPulse, Building2, ArrowRight, Sparkles, User, Lock, ChevronRight
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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Background Subtle Gradient Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-10 border-b border-slate-800 bg-slate-950/70 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {branding.logoUrl ? (
              <div className="h-10 px-3 py-1 rounded-xl bg-white flex items-center justify-center shadow-md">
                <img src={branding.logoUrl} alt={branding.clinicName || 'PhysioNautics'} className="max-h-8 max-w-[180px] object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
            )}
            <div>
              <div className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
                {branding.clinicName || 'Physionautics'}
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30 text-[10px]">
                  Multispecialty Care
                </Badge>
              </div>
              <p className="text-xs text-slate-400">{branding.tagline || 'Physiotherapy & Pain Rehabilitation Network'}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-teal-400" /> 3 NCR Branches</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-blue-400" /> HIPAA Compliant</span>
            <span className="flex items-center gap-1.5"><HeartPulse className="w-4 h-4 text-rose-400" /> 5,000+ Patients Recovered</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: Brand Vision & Physiotherapy Facts */}
        <div className="lg:col-span-7 space-y-8">
          <div className="space-y-4">
            <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 px-3 py-1 text-xs font-semibold gap-1.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Welcome to Physionautics Health Ecosystem
            </Badge>

            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Pioneering <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">Non-Invasive Rehabilitation</span> & Precision Care
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Physionautics is a doctor-led multispecialty physical therapy network dedicated to restoring human movement, eliminating chronic pain, and preventing surgical interventions through evidence-based biomechanics.
            </p>
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl space-y-2 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <HeartPulse className="w-4 h-4" /> Our Clinical Mission
              </div>
              <p className="text-xs text-slate-300 leading-normal">
                To eliminate movement dysfunction and chronic pain using individualized physical therapy protocols, state-of-the-art modalities, and transparent recovery tracking.
              </p>
            </div>

            <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-2xl space-y-2 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Award className="w-4 h-4" /> Our Excellence Vision
              </div>
              <p className="text-xs text-slate-300 leading-normal">
                To set the benchmark for physical rehabilitation in India where technology, clinical research, and compassionate care converge for lasting patient wellness.
              </p>
            </div>
          </div>

          {/* Physiotherapy Clinical Facts */}
          <div className="space-y-3">
            <p className="text-xs uppercase font-bold text-slate-400 tracking-wider">
              📊 Key Physiotherapy Clinical Insights & Metrics
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-2xl font-black text-teal-400">84%</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">Surgery Avoidance</div>
                <div className="text-[11px] text-slate-400 mt-0.5">For chronic lumbar disc prolapse & knee OA through targeted therapy.</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-2xl font-black text-blue-400">3.2x</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">Faster Recovery</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Velocity using structured electrotherapy & dry needling protocols.</div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl">
                <div className="text-2xl font-black text-amber-400">98.4%</div>
                <div className="text-xs font-semibold text-slate-200 mt-0.5">Patient Satisfaction</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Verified recovery CSAT across Delhi-NCR clinic locations.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Staff & Admin Portal Sign-In */}
        <div className="lg:col-span-5">
          <Card className="w-full shadow-2xl border-slate-700/80 bg-slate-950/90 text-white backdrop-blur-md">
            <CardHeader className="space-y-2 pb-3 pt-6 border-b border-slate-800">
              <div className="flex items-center justify-between">
                <Badge className="bg-blue-600 text-white text-[11px] font-bold">
                  🔐 Authorized Access
                </Badge>
                <span className="text-[11px] text-slate-400 font-mono">v0.1.0 PWA</span>
              </div>
              <CardTitle className="text-xl font-extrabold text-white">
                {isSignUp ? 'Create Staff Account' : 'Sign In to Physio Portal'}
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                {isSignUp ? 'Register new clinical or desk user credentials' : 'Access your clinic branch desk, doctor dashboard, or financial command center.'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4 pb-6">
              {/* Quick Fill Credentials for Testing */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-2">
                <p className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Quick Test Sign-In Roles:
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    type="button" 
                    size="xs" 
                    variant="outline" 
                    className="bg-purple-950/60 border-purple-800 text-purple-200 hover:bg-purple-900 text-[11px]"
                    onClick={() => fillQuickLogin('admin@physionautics.com', 'admin')}
                  >
                    👑 Admin Login
                  </Button>
                  <Button 
                    type="button" 
                    size="xs" 
                    variant="outline" 
                    className="bg-blue-950/60 border-blue-800 text-blue-200 hover:bg-blue-900 text-[11px]"
                    onClick={() => fillQuickLogin('staff.nfc@physionautics.com', 'Pass@123')}
                  >
                    🏥 Clinic Reception Staff
                  </Button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-semibold text-slate-300">Email or Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="email"
                      type="text"
                      placeholder="e.g. admin@physionautics.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-slate-900 border-slate-800 text-white pl-9 h-11 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-semibold text-slate-300">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      className="bg-slate-900 border-slate-800 text-white pl-9 h-11 focus:border-blue-500"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white font-bold h-11 shadow-lg text-sm gap-2 mt-2" 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying Credentials…</>
                  ) : (
                    <>{isSignUp ? 'Create Account' : 'Sign In to Portal'} <ArrowRight className="w-4 h-4" /></>
                  )}
                </Button>
              </form>

              {error && (
                <div className="rounded-xl bg-rose-950/60 border border-rose-800 p-3 text-xs text-rose-300 font-medium flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-rose-500 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {successMsg && (
                <div className="rounded-xl bg-emerald-950/60 border border-emerald-800 p-3 text-xs text-emerald-300 font-medium">
                  {successMsg}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950/80 px-6 py-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} Physionautics Physical Therapy & Pain Rehabilitation Centre. All rights reserved.
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>New Friends Colony</span> · <span>Vasant Vihar</span> · <span>DLF Phase 1 Gurugram</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
