'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

export type UserRole = 'admin' | 'centre_staff'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  centreId?: string
  centreName?: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password?: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password?: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  loginAsRole: (roleType: 'admin' | 'centre1' | 'centre2' | 'centre3') => void
}

const PRESET_ACCOUNTS: Record<string, UserProfile> = {
  'admin@physionautics.com': {
    id: 'usr-admin-01',
    email: 'admin@physionautics.com',
    name: 'Financial Administrator',
    role: 'admin',
  },
  'nfc@physionautics.com': {
    id: 'usr-centre1-01',
    email: 'nfc@physionautics.com',
    name: 'New Friends Colony Staff',
    role: 'centre_staff',
    centreId: 'c1111111-1111-1111-1111-111111111111',
    centreName: 'New Friends Colony, New Delhi',
  },
  'centre1@physionautics.com': {
    id: 'usr-centre1-01',
    email: 'centre1@physionautics.com',
    name: 'New Friends Colony Staff',
    role: 'centre_staff',
    centreId: 'c1111111-1111-1111-1111-111111111111',
    centreName: 'New Friends Colony, New Delhi',
  },
  'vasantvihar@physionautics.com': {
    id: 'usr-centre2-01',
    email: 'vasantvihar@physionautics.com',
    name: 'Vasant Vihar Staff',
    role: 'centre_staff',
    centreId: 'c2222222-2222-2222-2222-222222222222',
    centreName: 'Vasant Vihar, New Delhi',
  },
  'centre2@physionautics.com': {
    id: 'usr-centre2-01',
    email: 'centre2@physionautics.com',
    name: 'Vasant Vihar Staff',
    role: 'centre_staff',
    centreId: 'c2222222-2222-2222-2222-222222222222',
    centreName: 'Vasant Vihar, New Delhi',
  },
  'gurugram@physionautics.com': {
    id: 'usr-centre3-01',
    email: 'gurugram@physionautics.com',
    name: 'Gurugram DLF Phase 1 Staff',
    role: 'centre_staff',
    centreId: 'c3333333-3333-3333-3333-333333333333',
    centreName: 'Gurugram – DLF Phase 1',
  },
  'centre3@physionautics.com': {
    id: 'usr-centre3-01',
    email: 'centre3@physionautics.com',
    name: 'Gurugram DLF Phase 1 Staff',
    role: 'centre_staff',
    centreId: 'c3333333-3333-3333-3333-333333333333',
    centreName: 'Gurugram – DLF Phase 1',
  },
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const resolveProfile = (email: string): UserProfile => {
    const lower = email.toLowerCase()
    if (PRESET_ACCOUNTS[lower]) return PRESET_ACCOUNTS[lower]

    try {
      const localCustom = localStorage.getItem('physio_custom_staff_users')
      if (localCustom) {
        const staffList: any[] = JSON.parse(localCustom)
        const found = staffList.find(s => s.email.toLowerCase() === lower)
        if (found) {
          return {
            id: found.id,
            email: found.email,
            name: found.full_name,
            role: found.role,
            centreId: found.centre_id,
            centreName: found.centre_name || 'New Friends Colony, New Delhi',
          }
        }
      }
    } catch (_) {}

    if (lower.startsWith('admin')) {
      return { id: 'admin-auto', email, name: 'Administrator', role: 'admin' }
    }
    return { id: 'staff-auto', email, name: 'Clinic Staff', role: 'centre_staff', centreName: 'New Friends Colony, New Delhi' }
  }

  useEffect(() => {
    const cached = localStorage.getItem('physio_active_profile')
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        setProfile(parsed)
        setUser({ id: parsed.id, email: parsed.email } as unknown as User)
        setLoading(false)
        return
      } catch (_) {}
    }

    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user?.email) {
        setUser(session.user)
        const p = resolveProfile(session.user.email)
        setProfile(p)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user?.email) {
        setUser(session.user)
        const p = resolveProfile(session.user.email)
        setProfile(p)
      } else if (!localStorage.getItem('physio_active_profile')) {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password?: string) => {
    let lower = email.toLowerCase().trim()
    const enteredPassword = password?.trim() || ''

    if (!enteredPassword) {
      return { error: { message: 'Password is required to sign in.' } as AuthError }
    }

    // Auto-normalize username / email
    if (!lower.includes('@')) {
      if (lower === 'admin' || lower === 'administrator') lower = 'admin@physionautics.com'
      else if (lower === 'nfc' || lower.includes('friends')) lower = 'nfc@physionautics.com'
      else if (lower.includes('vasant')) lower = 'vasantvihar@physionautics.com'
      else if (lower.includes('guru') || lower.includes('dlf')) lower = 'gurugram@physionautics.com'
      else if (lower === 'centre1') lower = 'nfc@physionautics.com'
      else if (lower === 'centre2') lower = 'vasantvihar@physionautics.com'
      else if (lower === 'centre3') lower = 'gurugram@physionautics.com'
      else lower = `${lower}@physionautics.com`
    }

    // 1. Check custom staff users configured in Admin Panel (localStorage)
    try {
      const localCustom = localStorage.getItem('physio_custom_staff_users')
      if (localCustom) {
        const staffList: any[] = JSON.parse(localCustom)
        const found = staffList.find(s => s.email?.toLowerCase() === lower || s.username?.toLowerCase() === lower)
        if (found) {
          if (found.is_active === false) {
            return { error: { message: 'This account has been deactivated by the Administrator.' } as AuthError }
          }
          // Strict password verification for custom account
          if (found.password && found.password !== enteredPassword) {
            return { error: { message: 'Incorrect password. Please try again.' } as AuthError }
          }
          const p: UserProfile = {
            id: found.id || 'usr-custom',
            email: found.email || lower,
            name: found.full_name || found.name || 'Clinic Staff',
            role: found.role || 'centre_staff',
            centreId: found.centre_id,
            centreName: found.centre_name || (found.role === 'admin' ? undefined : 'New Friends Colony, New Delhi'),
          }
          setProfile(p)
          setUser({ id: p.id, email: p.email } as unknown as User)
          localStorage.setItem('physio_active_profile', JSON.stringify(p))
          return { error: null }
        }
      }
    } catch (_) {}

    // 2. Default Admin account verification
    if (lower === 'admin@physionautics.com') {
      // Default admin password is 'admin' (or 'admin123')
      if (enteredPassword === 'admin' || enteredPassword === 'admin123') {
        const p: UserProfile = {
          id: 'usr-admin-01',
          email: 'admin@physionautics.com',
          name: 'Financial Administrator',
          role: 'admin',
        }
        setProfile(p)
        setUser({ id: p.id, email: p.email } as unknown as User)
        localStorage.setItem('physio_active_profile', JSON.stringify(p))
        return { error: null }
      }
      return { error: { message: 'Incorrect password for Admin. (Default password: admin)' } as AuthError }
    }

    // 3. Default Centre 1: New Friends Colony
    if (lower === 'nfc@physionautics.com' || lower === 'centre1@physionautics.com') {
      if (enteredPassword === 'centre123' || enteredPassword === 'admin') {
        const p = PRESET_ACCOUNTS['nfc@physionautics.com']
        setProfile(p)
        setUser({ id: p.id, email: p.email } as unknown as User)
        localStorage.setItem('physio_active_profile', JSON.stringify(p))
        return { error: null }
      }
      return { error: { message: 'Incorrect password for New Friends Colony desk. (Default password: centre123)' } as AuthError }
    }

    // 4. Default Centre 2: Vasant Vihar
    if (lower === 'vasantvihar@physionautics.com' || lower === 'centre2@physionautics.com') {
      if (enteredPassword === 'centre123' || enteredPassword === 'admin') {
        const p = PRESET_ACCOUNTS['vasantvihar@physionautics.com']
        setProfile(p)
        setUser({ id: p.id, email: p.email } as unknown as User)
        localStorage.setItem('physio_active_profile', JSON.stringify(p))
        return { error: null }
      }
      return { error: { message: 'Incorrect password for Vasant Vihar desk. (Default password: centre123)' } as AuthError }
    }

    // 5. Default Centre 3: Gurugram DLF Phase 1
    if (lower === 'gurugram@physionautics.com' || lower === 'centre3@physionautics.com') {
      if (enteredPassword === 'centre123' || enteredPassword === 'admin') {
        const p = PRESET_ACCOUNTS['gurugram@physionautics.com']
        setProfile(p)
        setUser({ id: p.id, email: p.email } as unknown as User)
        localStorage.setItem('physio_active_profile', JSON.stringify(p))
        return { error: null }
      }
      return { error: { message: 'Incorrect password for Gurugram desk. (Default password: centre123)' } as AuthError }
    }

    // 6. Supabase backend authentication fallback if connected
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url') {
      try {
        const supabase = createClient()
        const { error, data } = await supabase.auth.signInWithPassword({ email: lower, password: enteredPassword })
        if (error) return { error }
        const p = resolveProfile(lower)
        setProfile(p)
        setUser(data.user)
        localStorage.setItem('physio_active_profile', JSON.stringify(p))
        return { error: null }
      } catch (err: any) {
        return { error: { message: err.message || 'Authentication failed' } as AuthError }
      }
    }

    return { error: { message: 'Invalid username or password. Please verify your credentials.' } as AuthError }
  }

  const signUp = async (email: string, password?: string) => {
    return signIn(email, password)
  }

  const loginAsRole = async (roleType: 'admin' | 'centre1' | 'centre2' | 'centre3') => {
    const emailMap = {
      admin: 'admin@physionautics.com',
      centre1: 'nfc@physionautics.com',
      centre2: 'vasantvihar@physionautics.com',
      centre3: 'gurugram@physionautics.com',
    }
    await signIn(emailMap[roleType], 'admin123')
  }

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    setSession(null)
    localStorage.removeItem('physio_active_profile')
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (_) {}
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signUp, signOut, loginAsRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
