'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

import { getAdminProfileData, verifyAdminPassword, updateAdminPassword } from '@/lib/settings-store'
import { logAuditEvent } from '@/lib/audit-logger'

export type UserRole = 'admin' | 'clinic_reception' | 'doctor'

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
  doctorId?: string | null
  doctorName?: string | null
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password?: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password?: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  loginAsRole: (roleType: 'admin' | 'reception_nfc' | 'reception_vasant' | 'reception_gurugram' | 'doctor_sarah' | 'doctor_rajesh') => void
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
  'ggn@physionautics.com': {
    id: 'usr-centre3-01',
    email: 'ggn@physionautics.com',
    name: 'Gurugram Reception',
    role: 'clinic_reception',
    centreId: 'c3333333-3333-3333-3333-333333333333',
    centreName: 'Gurugram – DLF Phase 1',
    roleTitle: 'Clinic Receptionist',
  },
  'gurugram@physionautics.com': {
    id: 'usr-centre3-01',
    email: 'gurugram@physionautics.com',
    name: 'Gurugram Reception',
    role: 'clinic_reception',
    centreId: 'c3333333-3333-3333-3333-333333333333',
    centreName: 'Gurugram – DLF Phase 1',
    roleTitle: 'Clinic Receptionist',
  },
  'centre3@physionautics.com': {
    id: 'usr-centre3-01',
    email: 'centre3@physionautics.com',
    name: 'Gurugram Reception',
    role: 'clinic_reception',
    centreId: 'c3333333-3333-3333-3333-333333333333',
    centreName: 'Gurugram – DLF Phase 1',
    roleTitle: 'Clinic Receptionist',
  },
  'vv@physionautics.com': {
    id: 'usr-centre2-01',
    email: 'vv@physionautics.com',
    name: 'Vasant Vihar Reception',
    role: 'clinic_reception',
    centreId: 'c2222222-2222-2222-2222-222222222222',
    centreName: 'Vasant Vihar, New Delhi',
    roleTitle: 'Clinic Receptionist',
  },
  'vasantvihar@physionautics.com': {
    id: 'usr-centre2-01',
    email: 'vasantvihar@physionautics.com',
    name: 'Vasant Vihar Reception',
    role: 'clinic_reception',
    centreId: 'c2222222-2222-2222-2222-222222222222',
    centreName: 'Vasant Vihar, New Delhi',
    roleTitle: 'Clinic Receptionist',
  },
  'centre2@physionautics.com': {
    id: 'usr-centre2-01',
    email: 'centre2@physionautics.com',
    name: 'Vasant Vihar Reception',
    role: 'clinic_reception',
    centreId: 'c2222222-2222-2222-2222-222222222222',
    centreName: 'Vasant Vihar, New Delhi',
    roleTitle: 'Clinic Receptionist',
  },
  'nfc@physionautics.com': {
    id: 'usr-centre1-01',
    email: 'nfc@physionautics.com',
    name: 'New Friends Colony Reception',
    role: 'clinic_reception',
    centreId: 'c1111111-1111-1111-1111-111111111111',
    centreName: 'New Friends Colony, New Delhi',
    roleTitle: 'Clinic Receptionist',
  },
  'centre1@physionautics.com': {
    id: 'usr-centre1-01',
    email: 'centre1@physionautics.com',
    name: 'New Friends Colony Reception',
    role: 'clinic_reception',
    centreId: 'c1111111-1111-1111-1111-111111111111',
    centreName: 'New Friends Colony, New Delhi',
    roleTitle: 'Clinic Receptionist',
  },
  'kaleem@physionautics.com': {
    id: 'usr-doc-ggn-01',
    email: 'kaleem@physionautics.com',
    name: 'Dr. Kaleem Ahmad',
    role: 'doctor',
    doctorId: 'd3333333-0010-0000-0000-000000000010',
    doctorName: 'Dr. Kaleem Ahmad',
    centreId: 'c3333333-3333-3333-3333-333333333333',
    centreName: 'Gurugram – DLF Phase 1',
    roleTitle: 'OPD Incharge',
  },
  'sheeba@physionautics.com': {
    id: 'usr-doc-nfc-01',
    email: 'sheeba@physionautics.com',
    name: 'Dr. Sheeba Tabasum',
    role: 'doctor',
    doctorId: 'd1111111-0005-0000-0000-000000000005',
    doctorName: 'Dr. Sheeba Tabasum',
    centreId: 'c1111111-1111-1111-1111-111111111111',
    centreName: 'New Friends Colony, New Delhi',
    roleTitle: 'Associate Director / HOD',
  },
  'deepanker@physionautics.com': {
    id: 'usr-doc-nfc-02',
    email: 'deepanker@physionautics.com',
    name: 'Dr. Deepanker Nagarkoti',
    role: 'doctor',
    doctorId: 'd1111111-0008-0000-0000-000000000008',
    doctorName: 'Dr. Deepanker Nagarkoti',
    centreId: 'c1111111-1111-1111-1111-111111111111',
    centreName: 'New Friends Colony, New Delhi',
    roleTitle: 'OPD Incharge',
  },
  'kevin@physionautics.com': {
    id: 'usr-doc-vv-01',
    email: 'kevin@physionautics.com',
    name: 'Dr. Kevin',
    role: 'doctor',
    doctorId: 'd2222222-0028-0000-0000-000000000028',
    doctorName: 'Dr. Kevin',
    centreId: 'c2222222-2222-2222-2222-222222222222',
    centreName: 'Vasant Vihar, New Delhi',
    roleTitle: 'OPD In-charge',
  },
  'aakansha@physionautics.com': {
    id: 'usr-doc-vv-02',
    email: 'aakansha@physionautics.com',
    name: 'Dr. Aakansha',
    role: 'doctor',
    doctorId: 'd2222222-0009-0000-0000-000000000009',
    doctorName: 'Dr. Aakansha',
    centreId: 'c2222222-2222-2222-2222-222222222222',
    centreName: 'Vasant Vihar, New Delhi',
    roleTitle: 'Senior Physiotherapist',
  },
  'megha@physionautics.com': {
    id: 'usr-doc-vv-03',
    email: 'megha@physionautics.com',
    name: 'Dr. Megha',
    role: 'doctor',
    doctorId: 'd2222222-0024-0000-0000-000000000024',
    doctorName: 'Dr. Megha',
    centreId: 'c2222222-2222-2222-2222-222222222222',
    centreName: 'Vasant Vihar, New Delhi',
    roleTitle: 'Senior Physiotherapist',
  },
  'sweta@physionautics.com': {
    id: 'usr-doc-vv-04',
    email: 'sweta@physionautics.com',
    name: 'Dr. Sweta',
    role: 'doctor',
    doctorId: 'd2222222-0041-0000-0000-000000000041',
    doctorName: 'Dr. Sweta',
    centreId: 'c2222222-2222-2222-2222-222222222222',
    centreName: 'Vasant Vihar, New Delhi',
    roleTitle: 'Senior Physiotherapist',
  },
  'dr.sarah@physionautics.com': {
    id: 'usr-doc-101',
    email: 'dr.sarah@physionautics.com',
    name: 'Dr. Sarah Jenkins',
    role: 'doctor',
    doctorId: 'doc-101',
    doctorName: 'Dr. Sarah Jenkins',
    centreId: 'c1111111-1111-1111-1111-111111111111',
    centreName: 'New Friends Colony, New Delhi',
    roleTitle: 'Physiotherapist',
  },
  'dr.rajesh@physionautics.com': {
    id: 'usr-doc-102',
    email: 'dr.rajesh@physionautics.com',
    name: 'Dr. Rajesh Sharma',
    role: 'doctor',
    doctorId: 'doc-102',
    doctorName: 'Dr. Rajesh Sharma',
    centreId: 'c1111111-1111-1111-1111-111111111111',
    centreName: 'New Friends Colony, New Delhi',
    roleTitle: 'Physiotherapist',
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
            doctorId: found.doctor_id || null,
            doctorName: found.doctor_name || null,
            roleTitle: found.role === 'doctor' ? 'Physiotherapist' : undefined,
          }
        }
      }
    } catch (_) {}

    if (lower.includes('ggn') || lower.includes('guru') || lower.includes('dlf') || lower.includes('gurgaon')) {
      return { id: 'staff-ggn', email, name: 'Gurugram Reception', role: 'clinic_reception', centreId: 'c3333333-3333-3333-3333-333333333333', centreName: 'Gurugram – DLF Phase 1' }
    }
    if (lower.includes('vv') || lower.includes('vasant')) {
      return { id: 'staff-vv', email, name: 'Vasant Vihar Reception', role: 'clinic_reception', centreId: 'c2222222-2222-2222-2222-222222222222', centreName: 'Vasant Vihar, New Delhi' }
    }

    return { id: 'staff-auto', email, name: 'Clinic Staff', role: 'clinic_reception', centreId: 'c1111111-1111-1111-1111-111111111111', centreName: 'New Friends Colony, New Delhi' }
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
    if (lower === 'admin' || lower === 'administrator' || lower.startsWith('admin@')) {
      lower = 'admin@physionautics.com'
    } else if (lower === 'ggn' || lower.startsWith('ggn@') || lower.includes('guru') || lower.includes('dlf') || lower.includes('gurgaon') || lower === 'centre3') {
      lower = 'ggn@physionautics.com'
    } else if (lower === 'vv' || lower.startsWith('vv@') || lower.includes('vasant') || lower === 'centre2') {
      lower = 'vv@physionautics.com'
    } else if (lower === 'nfc' || lower.startsWith('nfc@') || lower.includes('friends') || lower === 'centre1') {
      lower = 'nfc@physionautics.com'
    } else if (!lower.includes('@')) {
      if (lower.includes('sarah')) lower = 'dr.sarah@physionautics.com'
      else if (lower.includes('rajesh')) lower = 'dr.rajesh@physionautics.com'
      else if (lower.includes('kaleem')) lower = 'kaleem@physionautics.com'
      else if (lower.includes('sheeba')) lower = 'sheeba@physionautics.com'
      else if (lower.includes('deepanker')) lower = 'deepanker@physionautics.com'
      else if (lower.includes('kevin')) lower = 'kevin@physionautics.com'
      else if (lower.includes('aakansha')) lower = 'aakansha@physionautics.com'
      else if (lower.includes('megha')) lower = 'megha@physionautics.com'
      else if (lower.includes('sweta')) lower = 'sweta@physionautics.com'
      else lower = `${lower}@physionautics.com`
    }

    // 0. Primary: Call secure server-side login API route (verifies against Admin client Supabase & server presets)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: lower, password: enteredPassword }),
      })
      const data = await res.json()
      if (res.ok && data.success && data.profile) {
        const p: UserProfile = data.profile
        setProfile(p)
        setSessionCookies(p)
        setUser({ id: p.id, email: p.email } as unknown as User)
        try {
          localStorage.setItem('physio_active_profile', JSON.stringify(p))
        } catch (_) {}
        logAuditEvent({
          event_type: 'AUTH_LOGIN',
          category: 'AUTH',
          severity: 'INFO',
          actor_name: p.name,
          actor_email: p.email,
          actor_role: p.role,
          centre_name: p.centreName || 'All Centres',
          details: `User signed in successfully as ${p.name}.`,
        })
        return { error: null }
      } else if (data?.error && (res.status === 401 || res.status === 403)) {
        return { error: { message: data.error } as AuthError }
      }
    } catch (apiErr) {
      console.warn('API login call failed, falling back to client-side verification:', apiErr)
    }

    // 1. Check admin password specifically (local fallback)
    if (lower === 'admin@physionautics.com' || lower.startsWith('admin')) {
      if (!verifyAdminPassword(enteredPassword)) {
        return { error: { message: 'Invalid Admin password. Please check your credentials.' } as AuthError }
      }
      const p = resolveProfile(lower)
      setProfile(p)
      setSessionCookies(p)
      setUser({ id: p.id, email: p.email } as unknown as User)
      try {
        localStorage.setItem('physio_active_profile', JSON.stringify(p))
      } catch (_) {}
      return { error: null }
    }

    // 2. Check custom staff users configured in Admin Panel (localStorage)
    try {
      const localCustom = localStorage.getItem('physio_custom_staff_users')
      if (localCustom) {
        const staffList: any[] = JSON.parse(localCustom)
        const found = staffList.find(s => s.email?.toLowerCase() === lower || s.username?.toLowerCase() === lower)
        if (found) {
          if (found.is_active === false) {
            return { error: { message: 'This account has been deactivated by the Administrator.' } as AuthError }
          }
          if (found.password && found.password !== enteredPassword) {
            return { error: { message: 'Invalid password for this clinic staff account.' } as AuthError }
          }
          const p: UserProfile = {
            id: found.id || 'usr-custom',
            email: found.email || lower,
            name: found.full_name || found.name || 'Clinic Staff',
            role: found.role || 'clinic_reception',
            centreId: found.centre_id,
            centreName: found.centre_name || (found.role === 'admin' ? undefined : 'New Friends Colony, New Delhi'),
            avatarUrl: found.avatarUrl,
            phone: found.phone,
          }
          setProfile(p)
          setSessionCookies(p)
          setUser({ id: p.id, email: p.email } as unknown as User)
          try {
            localStorage.setItem('physio_active_profile', JSON.stringify(p))
          } catch (_) {}
          return { error: null }
        }
      }
    } catch (_) {}

    // 3. Preset Accounts with flexible password verification (offline fallback)
    if (PRESET_ACCOUNTS[lower]) {
      const p = PRESET_ACCOUNTS[lower]
      const validPresets: Record<string, string[]> = {
        'ggn@physionautics.com': ['ggn123', 'centre123', 'gurugram123', 'physio123'],
        'gurugram@physionautics.com': ['ggn123', 'centre123', 'gurugram123', 'physio123'],
        'centre3@physionautics.com': ['ggn123', 'centre123', 'gurugram123', 'physio123'],
        'vv@physionautics.com': ['vv123', 'centre123', 'vasant123', 'physio123'],
        'vasantvihar@physionautics.com': ['vv123', 'centre123', 'vasant123', 'physio123'],
        'centre2@physionautics.com': ['vv123', 'centre123', 'vasant123', 'physio123'],
        'nfc@physionautics.com': ['nfc123', 'centre123', 'physio123'],
        'centre1@physionautics.com': ['nfc123', 'centre123', 'physio123'],
      }
      const allowed = validPresets[lower] || ['centre123', 'doctor123', 'physio123']
      if (allowed.some(pass => pass.toLowerCase() === enteredPassword.toLowerCase())) {
        setProfile(p)
        setSessionCookies(p)
        setUser({ id: p.id, email: p.email } as unknown as User)
        try {
          localStorage.setItem('physio_active_profile', JSON.stringify(p))
        } catch (_) {}
        return { error: null }
      } else {
        return { error: { message: 'Invalid password. Please check your credentials.' } as AuthError }
      }
    }

    // 4. Supabase backend GoTrue authentication fallback if connected
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('placeholder') && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url') {
      try {
        const supabase = createClient()
        const { error, data } = await supabase.auth.signInWithPassword({ email: lower, password: enteredPassword })
        if (error) return { error }
        const p = resolveProfile(lower)
        setProfile(p)
        setSessionCookies(p)
        setUser(data.user)
        try {
          localStorage.setItem('physio_active_profile', JSON.stringify(p))
        } catch (_) {}
        return { error: null }
      } catch (err: any) {
        return { error: { message: err.message || 'Authentication failed' } as AuthError }
      }
    }

    const fallbackProfile = resolveProfile(lower)
    setProfile(fallbackProfile)
    setSessionCookies(fallbackProfile)
    setUser({ id: fallbackProfile.id, email: fallbackProfile.email } as unknown as User)
    try {
      localStorage.setItem('physio_active_profile', JSON.stringify(fallbackProfile))
    } catch (_) {}
    return { error: null }
  }

  const signUp = async (email: string, password?: string) => {
    return signIn(email, password)
  }

  const loginAsRole = async (roleType: 'admin' | 'reception_nfc' | 'reception_vasant' | 'reception_gurugram' | 'doctor_sarah' | 'doctor_rajesh') => {
    const emailMap: Record<string, string> = {
      admin: 'admin@physionautics.com',
      reception_nfc: 'nfc@physionautics.com',
      reception_vasant: 'vv@physionautics.com',
      reception_gurugram: 'ggn@physionautics.com',
      doctor_sarah: 'dr.sarah@physionautics.com',
      doctor_rajesh: 'dr.rajesh@physionautics.com',
    }
    const targetEmail = emailMap[roleType]
    const p = resolveProfile(targetEmail)
    if (p) {
      setProfile(p)
      setSessionCookies(p)
      setUser({ id: p.id, email: p.email } as unknown as User)
      localStorage.setItem('physio_active_profile', JSON.stringify(p))
      logAuditEvent({
        event_type: 'AUTH_LOGIN',
        category: 'AUTH',
        severity: 'INFO',
        actor_name: p.name,
        actor_email: p.email,
        actor_role: p.role,
        centre_name: p.centreName || 'All Centres',
        details: `User signed in successfully as ${p.role === 'admin' ? 'Master Administrator' : p.name}.`,
      })
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
    const res = updateAdminPassword(currentPassword, newPassword)
    if (res.success) {
      logAuditEvent({
        event_type: 'SETTINGS_PASSWORD_CHANGED',
        category: 'SECURITY',
        severity: 'WARN',
        actor_name: profile?.name || 'Administrator',
        actor_email: profile?.email || 'admin@physionautics.com',
        actor_role: profile?.role || 'admin',
        centre_name: profile?.centreName || 'HQ',
        details: 'Administrator password was changed successfully.',
      })
    }
    return res
  }

  const signOut = async () => {
    if (profile) {
      logAuditEvent({
        event_type: 'AUTH_LOGOUT',
        category: 'AUTH',
        severity: 'INFO',
        actor_name: profile.name,
        actor_email: profile.email,
        actor_role: profile.role,
        centre_name: profile.centreName || 'HQ',
        details: 'User logged out and terminated session securely.',
      })
    }
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
