'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Stethoscope, Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function AuthPage() {
  const router = useRouter()
  const { signIn, signUp } = useAuth()
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

  const fillCredentials = (em: string, pw: string) => {
    setEmail(em)
    setPassword(pw)
    setError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-xl border-blue-100">
        <CardHeader className="text-center space-y-3 pb-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Stethoscope className="w-9 h-9 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">Physionautics</CardTitle>
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-blue-600 mt-0.5">Clinic Management System</CardDescription>
          </div>
          <CardDescription className="text-sm font-medium text-foreground pt-1">
            {isSignUp ? 'Create your account' : 'Sign in to access your clinic portal'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold">Email or Username</Label>
              <Input
                id="email"
                type="text"
                placeholder="admin or admin@physionautics.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-white"
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-xs font-bold">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={loading}
                className="bg-white"
              />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-10 shadow-md" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isSignUp ? 'Creating Account…' : 'Authenticating…'}</> : isSignUp ? 'Sign Up' : 'Sign In to Portal'}
            </Button>
          </form>

          {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">{error}</div>}
          {successMsg && <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-xs text-green-700 font-medium">{successMsg}</div>}

          {/* Quick Access Account Pill Presets */}
          <div className="pt-3 border-t space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">
              Quick Login Presets
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              <button
                type="button"
                className="p-2 rounded-lg border bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-900 text-left transition-colors"
                onClick={() => fillCredentials('admin@physionautics.com', 'admin')}
              >
                <p className="font-bold text-[11px]">👑 Super Admin</p>
                <p className="text-[10px] text-purple-700 opacity-80">admin / admin</p>
              </button>

              <button
                type="button"
                className="p-2 rounded-lg border bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900 text-left transition-colors"
                onClick={() => fillCredentials('nfc@physionautics.com', 'centre123')}
              >
                <p className="font-bold text-[11px]">🏥 Friends Colony</p>
                <p className="text-[10px] text-blue-700 opacity-80">nfc / centre123</p>
              </button>

              <button
                type="button"
                className="p-2 rounded-lg border bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900 text-left transition-colors"
                onClick={() => fillCredentials('vasantvihar@physionautics.com', 'centre123')}
              >
                <p className="font-bold text-[11px]">🏥 Vasant Vihar</p>
                <p className="text-[10px] text-emerald-700 opacity-80">vasant / centre123</p>
              </button>

              <button
                type="button"
                className="p-2 rounded-lg border bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-900 text-left transition-colors"
                onClick={() => fillCredentials('gurugram@physionautics.com', 'centre123')}
              >
                <p className="font-bold text-[11px]">🏥 Gurugram DLF 1</p>
                <p className="text-[10px] text-orange-700 opacity-80">gurugram / centre123</p>
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
