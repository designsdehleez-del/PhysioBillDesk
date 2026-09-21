'use client'

import { useEffect, useState } from 'react'

export interface ClinicBranding {
  clinicName: string
  tagline: string
  logoUrl: string | null // Base64 data URL or relative path like /logo.png
  phone: string
  email: string
  website: string
  gstin: string
  address: string
  invoiceFooterNote: string
  authorizedSignatoryName: string
  authorizedSignatoryTitle: string
}

export interface AdminProfileData {
  id: string
  name: string
  email: string
  phone: string
  roleTitle: string
  avatarUrl: string | null // Base64 image data or URL
}

const DEFAULT_BRANDING: ClinicBranding = {
  clinicName: 'PhysioNautics',
  tagline: 'Physiotherapy & Pain Rehabilitation Centre',
  logoUrl: '/logo.png',
  phone: '+91 83839 36905',
  email: 'contact@physionautics.com',
  website: 'https://physionautics.com',
  gstin: '07AAAAA0000A1Z5',
  address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
  invoiceFooterNote: 'Thank you for choosing PhysioNautics. Computerized receipt valid for corporate & insurance claims.',
  authorizedSignatoryName: 'Dr. Sarah Jenkins',
  authorizedSignatoryTitle: 'Clinical Director & Chief Physiotherapist',
}

const DEFAULT_ADMIN_PROFILE: AdminProfileData = {
  id: 'usr-admin-01',
  name: 'Chief Medical Administrator',
  email: 'admin@physionautics.com',
  phone: '+91 98111 00000',
  roleTitle: 'Master Administrator (Financials & Governance)',
  avatarUrl: null,
}

const BRANDING_KEY = 'physio_clinic_branding_v2'
const ADMIN_PROFILE_KEY = 'physio_admin_profile_v2'
const ADMIN_PASSWORD_KEY = 'physio_admin_custom_password_v2'

// ================= BRANDING STORE =================

export function getClinicBranding(): ClinicBranding {
  if (typeof window === 'undefined') return DEFAULT_BRANDING
  try {
    const cached = localStorage.getItem(BRANDING_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      return {
        ...DEFAULT_BRANDING,
        ...parsed,
        logoUrl: parsed.logoUrl || DEFAULT_BRANDING.logoUrl,
      }
    }
  } catch (_) {}
  return DEFAULT_BRANDING
}

export function saveClinicBranding(updates: Partial<ClinicBranding>): ClinicBranding {
  const current = getClinicBranding()
  const updated: ClinicBranding = { ...current, ...updates }
  try {
    localStorage.setItem(BRANDING_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('physio-branding-updated', { detail: updated }))
  } catch (err) {
    console.error('Failed to save branding to localStorage:', err)
  }
  return updated
}

export function resetClinicBranding(): ClinicBranding {
  try {
    localStorage.removeItem(BRANDING_KEY)
    window.dispatchEvent(new CustomEvent('physio-branding-updated', { detail: DEFAULT_BRANDING }))
  } catch (_) {}
  return DEFAULT_BRANDING
}

// ================= ADMIN PROFILE STORE =================

export function getAdminProfileData(): AdminProfileData {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_PROFILE
  try {
    const cached = localStorage.getItem(ADMIN_PROFILE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      return { ...DEFAULT_ADMIN_PROFILE, ...parsed }
    }
  } catch (_) {}
  return DEFAULT_ADMIN_PROFILE
}

export function saveAdminProfileData(updates: Partial<AdminProfileData>): AdminProfileData {
  const current = getAdminProfileData()
  const updated: AdminProfileData = { ...current, ...updates }
  try {
    localStorage.setItem(ADMIN_PROFILE_KEY, JSON.stringify(updated))
    
    // Also update active profile if logged in as admin
    const activeRaw = localStorage.getItem('physio_active_profile')
    if (activeRaw) {
      try {
        const active = JSON.parse(activeRaw)
        if (active.role === 'admin') {
          active.name = updated.name
          active.email = updated.email
          active.avatarUrl = updated.avatarUrl
          active.phone = updated.phone
          active.roleTitle = updated.roleTitle
          localStorage.setItem('physio_active_profile', JSON.stringify(active))
        }
      } catch (_) {}
    }

    window.dispatchEvent(new CustomEvent('physio-admin-profile-updated', { detail: updated }))
  } catch (err) {
    console.error('Failed to save admin profile:', err)
  }
  return updated
}

// ================= ADMIN PASSWORD MANAGEMENT =================

export function getStoredAdminPassword(): string {
  if (typeof window === 'undefined') return 'admin123'
  try {
    const stored = localStorage.getItem(ADMIN_PASSWORD_KEY)
    if (stored) return stored
  } catch (_) {}
  return 'admin123'
}

export function verifyAdminPassword(inputPassword: string): boolean {
  const current = getStoredAdminPassword()
  return inputPassword === current
}

export function updateAdminPassword(currentPassword: string, newPassword: string): { success: boolean; error?: string } {
  if (!verifyAdminPassword(currentPassword)) {
    return { success: false, error: 'Current password is incorrect.' }
  }
  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: 'New password must be at least 6 characters.' }
  }

  try {
    localStorage.setItem(ADMIN_PASSWORD_KEY, newPassword)
    return { success: true }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to update password' }
  }
}

// ================= REACT HOOK =================

export function useClinicBranding() {
  const [branding, setBranding] = useState<ClinicBranding>(DEFAULT_BRANDING)
  const [adminProfile, setAdminProfile] = useState<AdminProfileData>(DEFAULT_ADMIN_PROFILE)

  useEffect(() => {
    setBranding(getClinicBranding())
    setAdminProfile(getAdminProfileData())

    const handleBrandingChange = (e: any) => {
      setBranding(e.detail || getClinicBranding())
    }

    const handleProfileChange = (e: any) => {
      setAdminProfile(e.detail || getAdminProfileData())
    }

    window.addEventListener('physio-branding-updated', handleBrandingChange)
    window.addEventListener('physio-admin-profile-updated', handleProfileChange)
    window.addEventListener('storage', () => {
      setBranding(getClinicBranding())
      setAdminProfile(getAdminProfileData())
    })

    return () => {
      window.removeEventListener('physio-branding-updated', handleBrandingChange)
      window.removeEventListener('physio-admin-profile-updated', handleProfileChange)
    }
  }, [])

  return {
    branding,
    adminProfile,
    saveBranding: saveClinicBranding,
    resetBranding: resetClinicBranding,
    saveProfile: saveAdminProfileData,
    updatePassword: updateAdminPassword,
  }
}
