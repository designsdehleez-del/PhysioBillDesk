'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stethoscope, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useClinicBranding } from '@/lib/settings-store'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-slate-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/60 bg-white">
        <CardHeader className="text-center space-y-3 pb-2 pt-6">
          <div className="flex justify-center">
            {branding.logoUrl ? (
              <div className="h-16 px-4 py-2 rounded-2xl bg-white border border-border/50 shadow-md flex items-center justify-center">
                <img src={branding.logoUrl} alt={branding.clinicName || 'PhysioNautics'} className="max-h-12 max-w-[240px] object-contain" />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Stethoscope className="w-9 h-9 text-white" />
              </div>
            )}
          </div>
          <div>
            {!branding.logoUrl && (
              <CardTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">{branding.clinicName || 'PhysioNautics'}</CardTitle>
            )}
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-blue-600 mt-1">{branding.tagline || 'Clinic Management System'}</CardDescription>
          </div>
          <CardDescription className="text-sm font-medium text-foreground pt-1">
            {isSignUp ? 'Create your authorized staff account' : 'Sign in to access your clinic portal'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2 pb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-gray-700">Email or Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="e.g. admin or yourname@physionautics.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-white h-11"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-bold text-gray-700">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-white h-11"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 shadow-md text-sm mt-2" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isSignUp ? 'Creating Account…' : 'Verifying Credentials…'}</> : isSignUp ? 'Sign Up' : 'Sign In to Portal'}
            </Button>
          </form>

          {error && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-destructive flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {successMsg && (
            <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-700 font-medium">
              {successMsg}
            </div>
          )}

          {/* Presentation & Demo 1-Click Role Switcher */}
          <div className="pt-2 border-t space-y-2">
            <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider text-center">
              ⚡ Quick 1-Click Demo Logins
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  setEmail('admin@physionautics.com')
                  setPassword('admin123')
                  await signIn('admin@physionautics.com', 'admin123')
                  router.push('/dashboard')
                }}
                className="p-2 text-left rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 transition-colors text-xs space-y-0.5"
              >
                <div className="font-bold text-purple-950 flex items-center gap-1">👑 Master Admin</div>
                <div className="text-[10px] text-purple-700">Financials & Doctor Earnings</div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setEmail('nfc@physionautics.com')
                  setPassword('centre123')
                  await signIn('nfc@physionautics.com', 'centre123')
                  router.push('/dashboard')
                }}
                className="p-2 text-left rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 transition-colors text-xs space-y-0.5"
              >
                <div className="font-bold text-blue-950">🏥 New Friends Colony</div>
                <div className="text-[10px] text-blue-700">Clinical Desk (No Financials)</div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setEmail('vasantvihar@physionautics.com')
                  setPassword('centre123')
                  await signIn('vasantvihar@physionautics.com', 'centre123')
                  router.push('/dashboard')
                }}
                className="p-2 text-left rounded-lg border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors text-xs space-y-0.5"
              >
                <div className="font-bold text-emerald-950">🏥 Vasant Vihar</div>
                <div className="text-[10px] text-emerald-700">Clinical Desk (No Financials)</div>
              </button>

              <button
                type="button"
                onClick={async () => {
                  setEmail('gurugram@physionautics.com')
                  setPassword('centre123')
                  await signIn('gurugram@physionautics.com', 'centre123')
                  router.push('/dashboard')
                }}
                className="p-2 text-left rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors text-xs space-y-0.5"
              >
                <div className="font-bold text-amber-950">🏥 Gurugram DLF Ph-1</div>
                <div className="text-[10px] text-amber-700">Clinical Desk (No Financials)</div>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
