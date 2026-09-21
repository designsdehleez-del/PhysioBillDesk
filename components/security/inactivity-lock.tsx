'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Lock, ShieldCheck, KeyRound, AlertCircle, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useClinicBranding, verifyAdminPassword } from '@/lib/settings-store'
import { logAuditEvent } from '@/lib/audit-logger'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

interface InactivityLockProps {
  timeoutMinutes?: number
}

const INACTIVITY_TIMEOUT_KEY = 'physio_inactivity_timeout_mins'
const AUTO_LOCK_STATE_KEY = 'physio_workstation_locked'

export function InactivityLock({ timeoutMinutes = 15 }: InactivityLockProps) {
  const { user, profile, signOut } = useAuth()
  const { branding, adminProfile } = useClinicBranding()

  const [isLocked, setIsLocked] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [unlockError, setUnlockError] = useState('')
  const [unlocking, setUnlocking] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null)

  const lastActivityRef = useRef<number>(Date.now())

  const getEffectiveTimeoutMs = useCallback(() => {
    if (typeof window === 'undefined') return timeoutMinutes * 60 * 1000
    try {
      const stored = localStorage.getItem(INACTIVITY_TIMEOUT_KEY)
      if (stored) {
        const parsed = parseInt(stored, 10)
        if (!isNaN(parsed) && parsed > 0) return parsed * 60 * 1000
      }
    } catch (_) {}
    return timeoutMinutes * 60 * 1000
  }, [timeoutMinutes])

  const lockScreen = useCallback(() => {
    setIsLocked(true)
    setPasswordInput('')
    setUnlockError('')
    setSecondsRemaining(null)
    try {
      sessionStorage.setItem(AUTO_LOCK_STATE_KEY, 'true')
      logAuditEvent({
        event_type: 'WORKSTATION_LOCKED',
        category: 'SECURITY',
        severity: 'WARN',
        actor_name: profile?.name || 'Clinic User',
        actor_email: profile?.email || 'user@physionautics.com',
        actor_role: profile?.role || 'staff',
        centre_name: profile?.centreName || 'Clinic Terminal',
        details: 'Workstation auto-locked to shield sensitive patient clinical notes and billing information.',
      })
    } catch (_) {}
  }, [profile])

  const unlockScreen = useCallback(() => {
    setIsLocked(false)
    setPasswordInput('')
    setUnlockError('')
    setSecondsRemaining(null)
    lastActivityRef.current = Date.now()
    try {
      sessionStorage.removeItem(AUTO_LOCK_STATE_KEY)
      logAuditEvent({
        event_type: 'WORKSTATION_UNLOCKED',
        category: 'SECURITY',
        severity: 'INFO',
        actor_name: profile?.name || 'Clinic User',
        actor_email: profile?.email || 'user@physionautics.com',
        actor_role: profile?.role || 'staff',
        centre_name: profile?.centreName || 'Clinic Terminal',
        details: 'Workstation resumed clinical session via credential verification.',
      })
    } catch (_) {}
  }, [profile])

  // Handle unlock attempt
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault()
    setUnlockError('')

    const entered = passwordInput.trim()
    if (!entered) {
      setUnlockError('Please enter your clinic password or PIN.')
      return
    }

    setUnlocking(true)

    try {
      const isAdmin = profile?.role === 'admin'

      if (isAdmin) {
        if (verifyAdminPassword(entered)) {
          unlockScreen()
          setUnlocking(false)
          return
        }
      } else {
        // Staff user verification
        const customStaffRaw = typeof window !== 'undefined' ? localStorage.getItem('physio_custom_staff_users') : null
        let staffPassword = 'centre123'
        if (customStaffRaw) {
          try {
            const staffList = JSON.parse(customStaffRaw)
            const staffUser = staffList.find((s: any) => s.email?.toLowerCase() === profile?.email?.toLowerCase())
            if (staffUser && staffUser.password) {
              staffPassword = staffUser.password
            }
          } catch (_) {}
        }

        if (entered === staffPassword) {
          unlockScreen()
          setUnlocking(false)
          return
        }
      }

      setUnlockError('Incorrect password or PIN. Please try again.')
    } catch (err: any) {
      setUnlockError(err?.message || 'Authentication failed.')
    } finally {
      setUnlocking(false)
    }
  }

  // Reset activity tracker on user interaction
  const recordActivity = useCallback(() => {
    if (isLocked) return
    lastActivityRef.current = Date.now()
    setSecondsRemaining(null)
  }, [isLocked])

  // Global event listeners for user activity & hotkey (Ctrl+Alt+L / Cmd+Alt+L)
  useEffect(() => {
    try {
      if (sessionStorage.getItem(AUTO_LOCK_STATE_KEY) === 'true') {
        setIsLocked(true)
      }
    } catch (_) {}

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click']

    const handleEvent = () => recordActivity()
    events.forEach(ev => window.addEventListener(ev, handleEvent, { passive: true }))

    // Quick Lock Shortcut: Ctrl+Alt+L or Cmd+Alt+L
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.altKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault()
        lockScreen()
      }
    }
    window.addEventListener('keydown', handleKeydown)

    // Inactivity check interval every 2 seconds
    const interval = setInterval(() => {
      if (isLocked) return

      const timeoutMs = getEffectiveTimeoutMs()
      const elapsed = Date.now() - lastActivityRef.current
      const remainingMs = timeoutMs - elapsed

      if (remainingMs <= 0) {
        lockScreen()
      } else if (remainingMs <= 60000) {
        setSecondsRemaining(Math.ceil(remainingMs / 1000))
      } else {
        setSecondsRemaining(null)
      }
    }, 2000)

    const handleManualLock = () => lockScreen()
    window.addEventListener('physio-manual-lock', handleManualLock)

    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleEvent))
      window.removeEventListener('keydown', handleKeydown)
      window.removeEventListener('physio-manual-lock', handleManualLock)
      clearInterval(interval)
    }
  }, [isLocked, getEffectiveTimeoutMs, lockScreen, recordActivity])

  if (!isLocked) {
    if (secondsRemaining !== null && secondsRemaining <= 60) {
      return (
        <div className="fixed bottom-4 right-4 z-50 bg-amber-500 text-white px-3.5 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-pulse border border-amber-600">
          <Lock className="w-4 h-4" />
          <span>Workstation locking in {secondsRemaining}s due to inactivity</span>
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs text-amber-950 bg-white/80 hover:bg-white font-bold ml-1 rounded-md"
            onClick={recordActivity}
          >
            Stay Active
          </Button>
        </div>
      )
    }
    return null
  }

  const isAdmin = profile?.role === 'admin'
  const activeAvatar = isAdmin ? (adminProfile.avatarUrl || profile?.avatarUrl) : profile?.avatarUrl
  const displayName = isAdmin ? (adminProfile.name || profile?.name || 'Administrator') : (profile?.name || 'Clinic Staff')
  const displayRole = isAdmin ? (adminProfile.roleTitle || 'Master Administrator') : (profile?.centreName || 'Reception Desk')

  return (
    <div className="fixed inset-0 z-[99999] backdrop-blur-xl bg-slate-900/85 flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 p-6 text-white text-center relative">
          <div className="mx-auto w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20 shadow-inner">
            <Lock className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Workstation Protected</h2>
          <p className="text-xs text-blue-200/90 mt-1">
            Clinical records and patient PII are securely shielded.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-[11px] font-medium text-white/90 border border-white/15">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> DPDP & HIPAA Inactivity Guard Active
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            {activeAvatar ? (
              <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-indigo-300 flex-shrink-0 bg-white">
                <img src={activeAvatar} alt="Profile" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="w-11 h-11 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold flex-shrink-0">
                {displayName.charAt(0) || 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-slate-900 truncate">{displayName}</p>
              <p className="text-xs text-slate-500 truncate">{displayRole}</p>
            </div>
            <Badge variant="outline" className="text-[10px] bg-white border-slate-300 text-slate-700">
              {isAdmin ? 'Admin' : 'Clinic'}
            </Badge>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                Enter Password or PIN to Resume
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={e => {
                    setPasswordInput(e.target.value)
                    setUnlockError('')
                  }}
                  placeholder={isAdmin ? 'Enter admin password' : 'Enter clinic password / PIN'}
                  className="pr-10 text-sm font-medium bg-slate-50 focus:bg-white"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {unlockError && (
                <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium pt-1">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{unlockError}</span>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={unlocking}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm h-10 shadow-md transition-all"
            >
              {unlocking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Unlocking Workstation...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 mr-2" /> Resume Clinical Session
                </>
              )}
            </Button>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Switch user / logout:</span>
            <button
              type="button"
              onClick={() => {
                unlockScreen()
                signOut()
              }}
              className="text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
            >
              Sign Out Securely
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function triggerManualLock() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('physio-manual-lock'))
  }
}
