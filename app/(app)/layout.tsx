'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { TopHeaderNav } from '@/components/layout/top-header-nav'
import { BottomNav } from '@/components/layout/bottom-nav'
import { InactivityLock } from '@/components/security/inactivity-lock'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) router.replace('/')
  }, [loading, user, router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-xs text-slate-400 font-medium">Verifying clinic credentials…</p>
      </div>
    </div>
  )

  if (!user) return null

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100/90 via-slate-50 to-indigo-50/40 text-slate-900 relative selection:bg-blue-100 selection:text-blue-900 pb-16 md:pb-0">
      {/* Ambient Decorative Background Pattern & Soft Radial Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Soft Radial Gradients */}
        <div className="absolute -top-32 -left-32 w-[32rem] h-[32rem] bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[36rem] h-[36rem] bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-[30rem] h-[30rem] bg-teal-500/10 rounded-full blur-3xl" />
        
        {/* Micro-Dot Matrix Pattern */}
        <div className="absolute inset-0 bg-dot-pattern opacity-60" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <InactivityLock />
        <TopHeaderNav />
        <main className="flex-1 w-full">{children}</main>
        <BottomNav />
      </div>
    </div>
  )
}
