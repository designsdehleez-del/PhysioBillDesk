'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileHeader } from '@/components/layout/mobile-header'
import { InactivityLock } from '@/components/security/inactivity-lock'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  useEffect(() => { if (!loading && !user) router.replace('/') }, [loading, user, router])
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )
  if (!user) return null
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <InactivityLock />
      <div className="hidden lg:flex"><Sidebar /></div>
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="lg:hidden"><MobileHeader /></div>
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  )
}
