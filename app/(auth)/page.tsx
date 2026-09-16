'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Stethoscope, Loader2, Award, HeartPulse, 
  Building2, ArrowRight, Sparkles, User, Lock
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
      <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md px-6 py-3.5 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo & Tagline only - NO duplicate text next to image logo */}
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

      {/* Main Content: Minimal Light Design */}
      <main className="max-w-6xl mx-auto px-6 py-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Brand Vision & Minimal Facts */}
        <div className="lg:col-span-7 space-y-7">
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

          {/* Mission & Vision: Minimal Light Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
                <HeartPulse className="w-4 h-4 text-blue-600" /> Clinical Mission
              </div>
              <p className="text-xs text-slate-600 leading-normal">
                Eliminating pain & movement dysfunction with individualized therapy protocols and transparent recovery tracking.
              </p>
            </div>

            <div className="bg-white border border-slate-200/80 p-4 rounded-xl space-y-1.5 shadow-xs">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                <Award className="w-4 h-4 text-amber-500" /> Excellence Vision
              </div>
              <p className="text-xs text-slate-600 leading-normal">
                Setting India's benchmark for physical rehabilitation where technology and clinical research converge.
              </p>
            </div>
          </div>

          {/* Clinical Insights */}
          <div className="space-y-2.5 pt-1">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Clinical Recovery Statistics
            </p>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white border border-slate-200/80 p-3 rounded-xl text-center shadow-xs">
                <div className="text-xl font-extrabold text-blue-600">84%</div>
                <div className="text-[11px] font-semibold text-slate-700 mt-0.5">Surgery Avoidance</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Chronic lumbar & knee OA</div>
              </div>

              <div className="bg-white border border-slate-200/80 p-3 rounded-xl text-center shadow-xs">
                <div className="text-xl font-extrabold text-emerald-600">3.2x</div>
                <div className="text-[11px] font-semibold text-slate-700 mt-0.5">Faster Recovery</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Targeted electrotherapy</div>
              </div>

              <div className="bg-white border border-slate-200/80 p-3 rounded-xl text-center shadow-xs">
                <div className="text-xl font-extrabold text-amber-600">98.4%</div>
                <div className="text-[11px] font-semibold text-slate-700 mt-0.5">Patient CSAT</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Verified NCR patient reviews</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Minimal Sign In Card */}
        <div className="lg:col-span-5">
          <Card className="shadow-lg border-slate-200/90 bg-white rounded-2xl">
            <CardHeader className="space-y-1 pb-3 pt-5 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 text-[10px] font-semibold">
                  Authorized Access
                </Badge>
                <span className="text-[10px] text-slate-400 font-mono">v0.1.0</span>
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">
                {isSignUp ? 'Create Staff Account' : 'Portal Sign In'}
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Enter your credentials to access the clinic system.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-4 pb-5">

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
                      className="pl-9 h-10 bg-white text-xs border-slate-200"
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
                      className="pl-9 h-10 bg-white text-xs border-slate-200"
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-xs text-xs gap-1.5 mt-1" 
                  disabled={loading}
                >
                  {loading ? (
                    <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Verifying...</>
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
      <footer className="border-t border-slate-200/80 bg-white px-6 py-3 text-xs text-slate-500">
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
