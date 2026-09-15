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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Physionautics</CardTitle>
            <CardDescription className="text-sm mt-1">Clinic Management System</CardDescription>
          </div>
          <CardDescription className="text-base font-medium text-foreground">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" value={email}
                onChange={e => setEmail(e.target.value)} required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" value={password}
                onChange={e => setPassword(e.target.value)} required disabled={loading} minLength={6} />
            </div>
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isSignUp ? 'Creating…' : 'Signing in…'}</> : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground font-semibold">Select Account Role</span></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              className="flex flex-col text-left p-2.5 rounded-lg border border-purple-200 bg-purple-50/60 hover:bg-purple-100 transition-colors"
              onClick={async () => {
                setLoading(true)
                await signIn('admin@physionautics.com', 'admin123')
                router.push('/dashboard')
              }}
            >
              <span className="text-xs font-bold text-purple-900 flex items-center gap-1">👑 Admin Login</span>
              <span className="text-[11px] text-purple-700">Financials & Revenue Analytics</span>
            </button>

            <button
              type="button"
              className="flex flex-col text-left p-2.5 rounded-lg border border-blue-200 bg-blue-50/60 hover:bg-blue-100 transition-colors"
              onClick={async () => {
                setLoading(true)
                await signIn('centre1@physionautics.com', 'centre123')
                router.push('/dashboard')
              }}
            >
              <span className="text-xs font-bold text-blue-900 flex items-center gap-1">🏥 Downtown Clinic</span>
              <span className="text-[11px] text-blue-700">Centre 1 Staff & Billing</span>
            </button>

            <button
              type="button"
              className="flex flex-col text-left p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 transition-colors"
              onClick={async () => {
                setLoading(true)
                await signIn('centre2@physionautics.com', 'centre123')
                router.push('/dashboard')
              }}
            >
              <span className="text-xs font-bold text-emerald-900 flex items-center gap-1">🏥 Westside Rehab</span>
              <span className="text-[11px] text-emerald-700">Centre 2 Staff & Billing</span>
            </button>

            <button
              type="button"
              className="flex flex-col text-left p-2.5 rounded-lg border border-orange-200 bg-orange-50/60 hover:bg-orange-100 transition-colors"
              onClick={async () => {
                setLoading(true)
                await signIn('centre3@physionautics.com', 'centre123')
                router.push('/dashboard')
              }}
            >
              <span className="text-xs font-bold text-orange-900 flex items-center gap-1">🏥 East Care Centre</span>
              <span className="text-[11px] text-orange-700">Centre 3 Staff & Billing</span>
            </button>
          </div>

          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
          {successMsg && <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">{successMsg}</div>}
          <p className="text-center text-sm text-muted-foreground pt-2">
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
            <button type="button" onClick={() => { setIsSignUp(p => !p); setError(null); setSuccessMsg(null) }}
              className="text-blue-600 hover:underline font-medium">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
