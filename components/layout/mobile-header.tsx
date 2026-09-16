'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, LayoutDashboard, UserPlus, Users, Receipt, Stethoscope, Building2, UserCog, Tag, LogOut, DollarSign, ShieldAlert, MessageCircle, Database, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useClinicBranding } from '@/lib/settings-store'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function MobileHeader() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { user, profile, signOut } = useAuth()
  const { branding, adminProfile } = useClinicBranding()

  const isAdmin = profile?.role === 'admin'
  const activeAvatar = isAdmin ? (adminProfile.avatarUrl || profile?.avatarUrl) : profile?.avatarUrl

  const adminNav = [
    { label: 'Financials & KPIs', href: '/dashboard', icon: DollarSign },
    { label: 'Billing & Invoices', href: '/billing', icon: Receipt },
    { label: 'Patients Directory', href: '/patients', icon: Users },
    { label: 'Doctors & Tagging', href: '/doctors', icon: UserCog },
    { label: 'Centres Management', href: '/centres', icon: Building2 },
    { label: 'Staff & Clinic Logins', href: '/staff', icon: ShieldAlert },
    { label: 'Services & Pricing', href: '/services', icon: Stethoscope },
    { label: 'Discount Rules', href: '/discounts', icon: Tag },
    { label: 'Admin & Brand Settings', href: '/settings', icon: Settings },
    { label: 'WhatsApp Settings', href: '/settings/whatsapp', icon: MessageCircle },
    { label: 'Data & Demo Tools', href: '/settings/data', icon: Database },
  ]

  const clinicNav = [
    { label: 'Clinic Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Register Patient', href: '/patients/register', icon: UserPlus },
    { label: 'Patient Directory', href: '/patients', icon: Users },
    { label: 'Generate Bill', href: '/billing', icon: Receipt },
    { label: 'Centre Doctors', href: '/doctors', icon: UserCog },
    { label: 'Clinic & Brand Settings', href: '/settings', icon: Settings },
    { label: 'WhatsApp Settings', href: '/settings/whatsapp', icon: MessageCircle },
    { label: 'Data & Demo Tools', href: '/settings/data', icon: Database },
  ]

  const activeNav = isAdmin ? adminNav : clinicNav

  const renderItems = (items: typeof adminNav) => items.map(item => {
    const Icon = item.icon
    const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)
    return (
      <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
        className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700')}>
        <Icon className="h-4 w-4 flex-shrink-0" />{item.label}
      </Link>
    )
  })

  return (
    <header className="flex items-center justify-between h-14 px-4 bg-white border-b lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger render={
          <Button variant="ghost" size="icon" aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
        } />
        <SheetContent side="left" className="w-64 p-0 flex flex-col" showCloseButton={false}>
          <div className="px-4 py-3.5 border-b">
            {branding.logoUrl ? (
              <div className="flex flex-col gap-1">
                <div className="h-8 flex items-center">
                  <img src={branding.logoUrl} alt={branding.clinicName || 'PhysioNautics'} className="max-h-7 max-w-[170px] object-contain" />
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider pl-0.5">
                  {isAdmin ? 'Admin Console' : (profile?.centreName || 'Clinic Desk')}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-base font-bold leading-tight block truncate">{branding.clinicName || 'PhysioNautics'}</span>
                  <span className="text-[11px] text-muted-foreground truncate block">{isAdmin ? 'Admin' : (profile?.centreName || 'Staff')}</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-b bg-gray-50">
            <div className="flex items-center gap-2">
              {activeAvatar ? (
                <div className="w-8 h-8 rounded-full overflow-hidden border border-purple-300 flex-shrink-0 bg-white">
                  <img src={activeAvatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
              ) : isAdmin ? (
                <ShieldAlert className="h-4 w-4 text-purple-700 flex-shrink-0" />
              ) : (
                <Building2 className="h-4 w-4 text-blue-700 flex-shrink-0" />
              )}
              <div className="min-w-0 flex-1 text-xs">
                <p className="font-bold truncate text-gray-900">{profile?.name || (isAdmin ? 'Admin' : 'Staff')}</p>
                <p className="text-[10px] text-muted-foreground truncate">{isAdmin ? 'Financial Access' : (profile?.centreName || 'Clinic Desk')}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
            <div className="space-y-1">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {isAdmin ? 'Financial Governance' : 'Clinical Operations'}
              </p>
              {renderItems(activeNav)}
            </div>
          </nav>
          <div className="px-4 py-4 border-t space-y-2">
            {user?.email && <p className="text-xs text-muted-foreground truncate">{user.email}</p>}
            <Button variant="outline" size="sm" className="w-full justify-start gap-2" onClick={() => { signOut(); setOpen(false) }}>
              <LogOut className="h-4 w-4" />Sign Out
            </Button>
          </div>
        </SheetContent>
      </Sheet>
      {branding.logoUrl ? (
        <div className="h-7 flex items-center">
          <img src={branding.logoUrl} alt={branding.clinicName || 'PhysioNautics'} className="max-h-6 max-w-[150px] object-contain" />
        </div>
      ) : (
        <span className="text-base font-bold text-gray-900 truncate">{branding.clinicName || 'PhysioNautics'}</span>
      )}
      <div className="w-10" />
    </header>
  )
}