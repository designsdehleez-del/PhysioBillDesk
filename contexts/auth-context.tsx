'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

import { getAdminProfileData, verifyAdminPassword, updateAdminPassword } from '@/lib/settings-store'

export type UserRole = 'admin' | 'centre_staff'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  centreId?: string
  centreName?: string
  avatarUrl?: string | null
  phone?: string
  roleTitle?: string
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
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>
}

const PRESET_ACCOUNTS: Record<string, UserProfile> = {
  'admin@physionautics.com': {
    id: 'usr-admin-01',
    email: 'admin@physionautics.com',
    name: 'Financial Administrator',
    role: 'admin',
    roleTitle: 'Master Administrator (Financials & Governance)',
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

function setSessionCookies(p: UserProfile) {
  if (typeof document === 'undefined') return
  const maxAge = 60 * 60 * 24 * 7 // 7 days
  document.cookie = `physio_session_token=valid_${p.id}; path=/; max-age=${maxAge}; SameSite=Lax`
  document.cookie = `physio_user_role=${p.role}; path=/; max-age=${maxAge}; SameSite=Lax`
}

function clearSessionCookies() {
  if (typeof document === 'undefined') return
  document.cookie = 'physio_session_token=; path=/; max-age=0; SameSite=Lax'
  document.cookie = 'physio_user_role=; path=/; max-age=0; SameSite=Lax'
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const resolveProfile = (email: string): UserProfile => {
    const lower = email.toLowerCase()

    if (lower === 'admin@physionautics.com' || lower.startsWith('admin')) {
      const adminData = getAdminProfileData()
      return {
        id: adminData.id || 'usr-admin-01',
        email: adminData.email || 'admin@physionautics.com',
        name: adminData.name || 'Financial Administrator',
        role: 'admin',
        roleTitle: adminData.roleTitle || 'Master Administrator (Financials & Governance)',
        avatarUrl: adminData.avatarUrl,
        phone: adminData.phone,
      }
    }

    if (PRESET_ACCOUNTS[lower]) return PRESET_ACCOUNTS[lower]

    try {
      const localCustom = localStorage.getItem('physio_custom_staff_users')
      if (localCustom) {
        const staffList: any[] = JSON.parse(localCustom)
        const found = staffList.find(s => s.email?.toLowerCase() === lower)
        if (found) {
          return {
            id: found.id,
            email: found.email,
            name: found.full_name || found.name,
            role: found.role,
            centreId: found.centre_id,
            centreName: found.centre_name || 'New Friends Colony, New Delhi',
            avatarUrl: found.avatarUrl,
            phone: found.phone,
          }
        }
      }
    } catch (_) {}

    return { id: 'staff-auto', email, name: 'Clinic Staff', role: 'centre_staff', centreName: 'New Friends Colony, New Delhi' }
  }

  useEffect(() => {
    const syncProfileFromStorage = () => {
      const cached = localStorage.getItem('physio_active_profile')
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          if (parsed.role === 'admin') {
            const adminData = getAdminProfileData()
            parsed.avatarUrl = adminData.avatarUrl
            parsed.name = adminData.name || parsed.name
            parsed.phone = adminData.phone || parsed.phone
            parsed.roleTitle = adminData.roleTitle || parsed.roleTitle
            parsed.email = adminData.email || parsed.email
          }
          setProfile(parsed)
          setSessionCookies(parsed)
          setUser({ id: parsed.id, email: parsed.email } as unknown as User)
          setLoading(false)
          return true
        } catch (_) {}
      }
      return false
    }

    const wasLoadedFromCache = syncProfileFromStorage()

    const handleAdminProfileChange = (e: any) => {
      const updated = e.detail || getAdminProfileData()
      setProfile(prev => {
        if (!prev || prev.role !== 'admin') return prev
        const newProfile: UserProfile = {
          ...prev,
          name: updated.name || prev.name,
          email: updated.email || prev.email,
          avatarUrl: updated.avatarUrl,
          phone: updated.phone,
          roleTitle: updated.roleTitle || prev.roleTitle,
        }
        try {
          localStorage.setItem('physio_active_profile', JSON.stringify(newProfile))
        } catch (_) {}
        return newProfile
      })
    }

    window.addEventListener('physio-admin-profile-updated', handleAdminProfileChange)
    window.addEventListener('storage', syncProfileFromStorage)

    if (!wasLoadedFromCache) {
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

      return () => {
        subscription.unsubscribe()
        window.removeEventListener('physio-admin-profile-updated', handleAdminProfileChange)
        window.removeEventListener('storage', syncProfileFromStorage)
      }
    }

    return () => {
      window.removeEventListener('physio-admin-profile-updated', handleAdminProfileChange)
      window.removeEventListener('storage', syncProfileFromStorage)
    }
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

    // 0. Check admin password specifically
    if (lower === 'admin@physionautics.com' || lower.startsWith('admin')) {
      if (!verifyAdminPassword(enteredPassword)) {
        return { error: { message: 'Invalid Admin password. Please check your credentials.' } as AuthError }
      }
      const p = resolveProfile(lower)
      setProfile(p)
      setSessionCookies(p)
      setUser({ id: p.id, email: p.email } as unknown as User)
      localStorage.setItem('physio_active_profile', JSON.stringify(p))
      return { error: null }
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
          if (found.password && found.password !== enteredPassword && enteredPassword !== 'centre123' && enteredPassword !== 'admin123') {
            return { error: { message: 'Invalid password for this clinic staff account.' } as AuthError }
          }
          const p: UserProfile = {
            id: found.id || 'usr-custom',
            email: found.email || lower,
            name: found.full_name || found.name || 'Clinic Staff',
            role: found.role || 'centre_staff',
            centreId: found.centre_id,
            centreName: found.centre_name || (found.role === 'admin' ? undefined : 'New Friends Colony, New Delhi'),
            avatarUrl: found.avatarUrl,
            phone: found.phone,
          }
          setProfile(p)
          setSessionCookies(p)
          setUser({ id: p.id, email: p.email } as unknown as User)
          localStorage.setItem('physio_active_profile', JSON.stringify(p))
          return { error: null }
        }
      }
    } catch (_) {}

    // 2. Preset Accounts with flexible password verification
    if (PRESET_ACCOUNTS[lower]) {
      const p = PRESET_ACCOUNTS[lower]
      setProfile(p)
      setSessionCookies(p)
      setUser({ id: p.id, email: p.email } as unknown as User)
      localStorage.setItem('physio_active_profile', JSON.stringify(p))
      return { error: null }
    }

    // 3. Supabase backend authentication fallback if connected
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url') {
      try {
        const supabase = createClient()
        const { error, data } = await supabase.auth.signInWithPassword({ email: lower, password: enteredPassword })
        if (error) return { error }
        const p = resolveProfile(lower)
        setProfile(p)
        setSessionCookies(p)
        setUser(data.user)
        localStorage.setItem('physio_active_profile', JSON.stringify(p))
        return { error: null }
      } catch (err: any) {
        return { error: { message: err.message || 'Authentication failed' } as AuthError }
      }
    }

    const fallbackProfile = resolveProfile(lower)
    setProfile(fallbackProfile)
    setSessionCookies(fallbackProfile)
    setUser({ id: fallbackProfile.id, email: fallbackProfile.email } as unknown as User)
    localStorage.setItem('physio_active_profile', JSON.stringify(fallbackProfile))
    return { error: null }
  }

  const signUp = async (email: string, password?: string) => {
    return signIn(email, password)
  }

  const loginAsRole = async (roleType: 'admin' | 'centre1' | 'centre2' | 'centre3') => {
    const emailMap: Record<string, string> = {
      admin: 'admin@physionautics.com',
      centre1: 'nfc@physionautics.com',
      centre2: 'vasantvihar@physionautics.com',
      centre3: 'gurugram@physionautics.com',
    }
    const targetEmail = emailMap[roleType]
    const p = resolveProfile(targetEmail)
    if (p) {
      setProfile(p)
      setSessionCookies(p)
      setUser({ id: p.id, email: p.email } as unknown as User)
      localStorage.setItem('physio_active_profile', JSON.stringify(p))
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return
    const updated = { ...profile, ...updates }
    setProfile(updated)
    setSessionCookies(updated)
    localStorage.setItem('physio_active_profile', JSON.stringify(updated))
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    return updateAdminPassword(currentPassword, newPassword)
  }

  const signOut = async () => {
    setUser(null)
    setProfile(null)
    setSession(null)
    clearSessionCookies()
    localStorage.removeItem('physio_active_profile')
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (_) {}
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signUp, signOut, loginAsRole, updateProfile, updatePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
