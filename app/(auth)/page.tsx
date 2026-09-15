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
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" disabled={loading}>
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isSignUp ? 'Creating Account…' : 'Authenticating…'}</> : isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          {error && <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>}
          {successMsg && <div className="rounded-md bg-green-50 border border-green-200 p-3 text-sm text-green-700">{successMsg}</div>}

          <div className="pt-2 text-center text-xs text-muted-foreground border-t">
            <p>Protected Clinic Portal · Physionautics Management</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
