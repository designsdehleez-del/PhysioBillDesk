'use client'

import React, { useEffect, useState } from 'react'
import { Download, Monitor, CheckCircle2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // 1. Register service worker
    if ('serviceWorker' in navigator && (process.env.NODE_ENV === 'production' || window.location.hostname === 'localhost')) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registered:', reg.scope)
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err)
        })
    }

    // 2. Check if already installed / standalone
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      setIsStandalone(isStandaloneMode)
    }
    checkStandalone()

    // 3. Listen for browser beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      ;(window as any).__pwaPrompt = e
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Listen for appinstalled
    window.addEventListener('appinstalled', () => {
      setIsInstallable(false)
      setDeferredPrompt(null)
      toast.success('Physionautics Desktop App installed successfully!')
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      toast.info('To install on desktop, click the Install icon (💻/➕) in your browser address bar.')
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      toast.success('Installing Physionautics Desktop App...')
      setIsInstallable(false)
    } else {
      toast.info('Installation deferred.')
    }
    setDeferredPrompt(null)
  }

  if (isStandalone || !isInstallable || dismissed) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-sm">
      <div className="bg-white border-2 border-blue-600 rounded-2xl p-4 shadow-2xl flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white flex-shrink-0 shadow-md">
          <Monitor className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-gray-900">Install Desktop App</p>
            <button
              onClick={() => setDismissed(true)}
              className="text-gray-400 hover:text-gray-600 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">
            Run Physionautics as a standalone native window on your desktop.
          </p>
          <div className="mt-2.5 flex items-center gap-2">
            <Button
              size="xs"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs gap-1.5 shadow-sm"
              onClick={handleInstallClick}
            >
              <Download className="h-3.5 w-3.5" /> Install App
            </Button>
            <Button
              size="xs"
              variant="ghost"
              className="text-[11px] text-gray-500 h-7"
              onClick={() => setDismissed(true)}
            >
              Later
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
