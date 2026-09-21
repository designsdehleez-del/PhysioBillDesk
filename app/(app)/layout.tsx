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
    <div className="flex-1 flex flex-col w-full pb-16 md:pb-0">
      <InactivityLock />
      <TopHeaderNav />
      <main className="flex-1 w-full">{children}</main>
      <BottomNav />
    </div>
  )
}
