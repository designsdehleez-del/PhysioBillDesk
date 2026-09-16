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

          {/* Biomechanical Pain & Musculoskeletal Focus Vector Diagram */}
          <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs font-bold text-slate-800">Biomechanical Rehabilitation & Spine/Joint Focal Points</h3>
              </div>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                Non-Surgical Focus
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
              {/* Spine/Joint Musculoskeletal SVG Diagram */}
              <div className="sm:col-span-5 bg-slate-50 border border-slate-100 rounded-lg p-3 flex flex-col items-center justify-center relative min-h-[160px]">
                <svg viewBox="0 0 160 200" className="w-32 h-40 drop-shadow-xs">
                  {/* Head & Neck */}
                  <circle cx="80" cy="25" r="14" className="fill-slate-200 stroke-slate-400" strokeWidth="1.5" />
                  
                  {/* Spine Segment lines (Cervical, Thoracic, Lumbar) */}
                  <path d="M 80 40 L 80 65" className="stroke-blue-500" strokeWidth="3" strokeDasharray="3 2" />
                  <path d="M 80 65 L 80 115" className="stroke-slate-400" strokeWidth="3" strokeDasharray="4 2" />
                  <path d="M 80 115 L 80 145" className="stroke-amber-500" strokeWidth="4" strokeDasharray="3 2" />
                  
                  {/* Shoulder girdle */}
                  <path d="M 50 65 Q 80 58 110 65" className="fill-none stroke-slate-400" strokeWidth="2.5" />
                  <circle cx="48" cy="66" r="6" className="fill-blue-100 stroke-blue-500" strokeWidth="1.5" />
                  <circle cx="112" cy="66" r="6" className="fill-blue-100 stroke-blue-500" strokeWidth="1.5" />

                  {/* Pelvic girdle */}
                  <path d="M 60 145 Q 80 140 100 145" className="fill-none stroke-slate-500" strokeWidth="3" />

                  {/* Lower Extremity (Knees) */}
                  <path d="M 65 145 L 62 185" className="stroke-slate-400" strokeWidth="2.5" />
                  <path d="M 95 145 L 98 185" className="stroke-slate-400" strokeWidth="2.5" />
                  <circle cx="62" cy="185" r="5" className="fill-emerald-100 stroke-emerald-600" strokeWidth="1.5" />
                  <circle cx="98" cy="185" r="5" className="fill-emerald-100 stroke-emerald-600" strokeWidth="1.5" />

                  {/* Focal Pain Indicators */}
                  {/* C5-C6 Cervical Pain pulse */}
                  <circle cx="80" cy="52" r="4" className="fill-blue-600 animate-pulse" />
                  <line x1="80" y1="52" x2="135" y2="45" className="stroke-blue-400" strokeWidth="1" strokeDasharray="2 2" />
                  
                  {/* L4-L5 Disc Herniation pulse */}
                  <circle cx="80" cy="130" r="4.5" className="fill-amber-600 animate-pulse" />
                  <line x1="80" y1="130" x2="140" y2="125" className="stroke-amber-400" strokeWidth="1" strokeDasharray="2 2" />

                  {/* Knee OA Joint Space pulse */}
                  <circle cx="98" cy="185" r="3.5" className="fill-emerald-600 animate-pulse" />
                  <line x1="98" y1="185" x2="138" y2="175" className="stroke-emerald-400" strokeWidth="1" strokeDasharray="2 2" />
                </svg>
              </div>

              {/* Focal Annotations Grid */}
              <div className="sm:col-span-7 space-y-2">
                <div className="p-2 rounded-lg bg-blue-50/60 border border-blue-100 flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-1 shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 block">Cervical Spine (C5-C6 Decompression)</span>
                    <span className="text-[10px] text-slate-500">Radiculopathy, neck stiffness & nerve root tension release</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-amber-50/60 border border-amber-100 flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-600 mt-1 shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 block">Lumbar Spine (L4-L5 Disc Rehab)</span>
                    <span className="text-[10px] text-slate-500">Sciatica relief, spinal traction & core postural stability</span>
                  </div>
                </div>

                <div className="p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1 shrink-0" />
                  <div>
                    <span className="text-[11px] font-bold text-slate-800 block">Tibiofemoral Knee OA & Shoulder Mobility</span>
                    <span className="text-[10px] text-slate-500">Cartilage loading protocol & capsular range expansion</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Treatment Modality Cards with SVG Icons */}
          <div className="space-y-2">
            <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400">
              Evidence-Based Therapy Modalities
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Electrotherapy Waveform */}
              <div className="bg-white border border-slate-200/80 p-3 rounded-xl flex flex-col items-center text-center space-y-1.5 shadow-xs hover:border-blue-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12h4l2-8 4 16 3-10 2 4h5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">IFT & Electrotherapy</span>
                <span className="text-[9px] text-slate-500 leading-tight">Interferential pain block</span>
              </div>

              {/* Dry Needling & Trigger Point */}
              <div className="bg-white border border-slate-200/80 p-3 rounded-xl flex flex-col items-center text-center space-y-1.5 shadow-xs hover:border-blue-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <circle cx="12" cy="12" r="3" fill="currentColor" />
                    <line x1="12" y1="3" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="21" />
                    <line x1="3" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="21" y2="12" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">Dry Needling</span>
                <span className="text-[9px] text-slate-500 leading-tight">Myofascial trigger release</span>
              </div>

              {/* Spinal Decompression Traction */}
              <div className="bg-white border border-slate-200/80 p-3 rounded-xl flex flex-col items-center text-center space-y-1.5 shadow-xs hover:border-blue-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="5" y="4" width="14" height="4" rx="1" />
                    <rect x="5" y="10" width="14" height="4" rx="1" />
                    <rect x="5" y="16" width="14" height="4" rx="1" />
                    <path d="M12 8v2M12 14v2" strokeDasharray="1 1" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">Spinal Traction</span>
                <span className="text-[9px] text-slate-500 leading-tight">Intervertebral spacing</span>
              </div>

              {/* Kinesiology Taping */}
              <div className="bg-white border border-slate-200/80 p-3 rounded-xl flex flex-col items-center text-center space-y-1.5 shadow-xs hover:border-blue-300 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 8l16-4M4 16l16-4M4 20l16-4" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-[11px] font-bold text-slate-800 leading-tight">Kinesio Taping</span>
                <span className="text-[9px] text-slate-500 leading-tight">Biomechanical support</span>
              </div>
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
