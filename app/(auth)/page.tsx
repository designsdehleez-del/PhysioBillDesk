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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-50 via-slate-50 to-blue-100 p-4">
      <Card className="w-full max-w-md shadow-2xl border-border/60 bg-white">
        <CardHeader className="text-center space-y-3 pb-2 pt-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Stethoscope className="w-9 h-9 text-white" />
            </div>
          </div>
          <div>
            <CardTitle className="text-2xl font-extrabold text-gray-900 tracking-tight">Physionautics</CardTitle>
            <CardDescription className="text-xs font-semibold uppercase tracking-wider text-blue-600 mt-0.5">Clinic Management System</CardDescription>
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

          <div className="pt-2 text-center">
            <p className="text-[11px] text-muted-foreground">
              Clinic & Staff accounts are provisioned by the System Administrator.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
