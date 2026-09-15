'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session); setUser(session?.user ?? null); setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session); setUser(session?.user ?? null); setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    // If Supabase keys are still default placeholders, allow direct demo access
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
      const mockUser = { id: 'demo-user-id', email: email || 'demo@physionautics.com', user_metadata: { full_name: 'Dr. Demo' } } as unknown as User
      setUser(mockUser)
      return { error: null }
    }
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error }
  }
  const signUp = async (email: string, password: string) => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') || process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url') {
      const mockUser = { id: 'demo-user-id', email: email || 'demo@physionautics.com', user_metadata: { full_name: 'Dr. Demo' } } as unknown as User
      setUser(mockUser)
      return { error: null }
    }
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({ email, password })
    return { error }
  }
  const signOut = async () => {
    setUser(null)
    setSession(null)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (_) {}
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
