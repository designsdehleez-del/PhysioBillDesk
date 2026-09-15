'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, UserPlus, Users, Receipt, Stethoscope, Building2, UserCog, Tag, LogOut, DollarSign, ShieldAlert, MessageCircle, Database } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function Sidebar() {
  const { user, profile, signOut, loginAsRole } = useAuth()
  const pathname = usePathname()

  const isAdmin = profile?.role === 'admin'

  const adminNav = [
    { label: 'Financials & KPIs', href: '/dashboard', icon: DollarSign },
    { label: 'Billing & Invoices', href: '/billing', icon: Receipt },
    { label: 'Patients Directory', href: '/patients', icon: Users },
    { label: 'Doctors & Tagging', href: '/doctors', icon: UserCog },
    { label: 'Centres Management', href: '/centres', icon: Building2 },
    { label: 'Staff & Clinic Logins', href: '/staff', icon: ShieldAlert },
    { label: 'Services & Pricing', href: '/services', icon: Stethoscope },
    { label: 'Discount Rules', href: '/discounts', icon: Tag },
    { label: 'WhatsApp Settings', href: '/settings/whatsapp', icon: MessageCircle },
    { label: 'Data & Demo Tools', href: '/settings/data', icon: Database },
  ]

  const clinicNav = [
    { label: 'Clinic Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Register Patient', href: '/patients/register', icon: UserPlus },
    { label: 'Patient Directory', href: '/patients', icon: Users },
    { label: 'Generate Bill', href: '/billing', icon: Receipt },
    { label: 'Centre Doctors', href: '/doctors', icon: UserCog },
    { label: 'WhatsApp Settings', href: '/settings/whatsapp', icon: MessageCircle },
    { label: 'Data & Demo Tools', href: '/settings/data', icon: Database },
  ]

  const activeNav = isAdmin ? adminNav : clinicNav

  return (
    <aside className="w-64 h-screen bg-white border-r flex flex-col">
      <div className="flex items-center gap-3 px-4 py-4 border-b">
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Stethoscope className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="text-base font-bold text-gray-900 block leading-tight">Physionautics</span>
          <span className="text-[11px] text-muted-foreground">{isAdmin ? 'Admin Console' : (profile?.centreName || 'Clinic Desk')}</span>
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className={cn("p-2.5 rounded-lg border text-xs flex items-center gap-2", isAdmin ? "bg-purple-50 border-purple-200 text-purple-900" : "bg-blue-50 border-blue-200 text-blue-900")}>
          {isAdmin ? <ShieldAlert className="h-4 w-4 text-purple-700 flex-shrink-0" /> : <Building2 className="h-4 w-4 text-blue-700 flex-shrink-0" />}
          <div className="min-w-0 flex-1">
            <p className="font-bold truncate">{profile?.name || (isAdmin ? 'Admin' : 'Staff')}</p>
            <p className="text-[10px] opacity-75 truncate">{isAdmin ? '👑 Master Admin (Financials)' : (profile?.centreName || 'Active Centre')}</p>
          </div>
        </div>

        {/* Instant Role Switcher for Presentation */}
        <div className="bg-gray-50 border rounded-lg p-1.5 space-y-1">
          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block px-1">Switch View / Role</span>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-semibold">
            <button
              onClick={() => loginAsRole('admin')}
              className={cn("px-1.5 py-1 rounded text-left truncate transition-colors", isAdmin ? "bg-purple-600 text-white" : "bg-white text-gray-700 hover:bg-purple-50")}
            >
              👑 Admin
            </button>
            <button
              onClick={() => loginAsRole('centre1')}
              className={cn("px-1.5 py-1 rounded text-left truncate transition-colors", profile?.email === 'nfc@physionautics.com' ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-blue-50")}
            >
              🏥 NFC
            </button>
            <button
              onClick={() => loginAsRole('centre2')}
              className={cn("px-1.5 py-1 rounded text-left truncate transition-colors", profile?.email === 'vasantvihar@physionautics.com' ? "bg-emerald-600 text-white" : "bg-white text-gray-700 hover:bg-emerald-50")}
            >
              🏥 Vasant V.
            </button>
            <button
              onClick={() => loginAsRole('centre3')}
              className={cn("px-1.5 py-1 rounded text-left truncate transition-colors", profile?.email === 'gurugram@physionautics.com' ? "bg-amber-600 text-white" : "bg-white text-gray-700 hover:bg-amber-50")}
            >
              🏥 Gurugram
            </button>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <p className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {isAdmin ? 'Financial Governance' : 'Clinical Operations'}
        </p>
        {activeNav.map(item => {
          const Icon = item.icon
          const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700')}>
              <Icon className="h-4 w-4 flex-shrink-0" />{item.label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 py-3 border-t space-y-2">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2 text-xs border-blue-200 text-blue-700 bg-blue-50/50 hover:bg-blue-100"
          onClick={() => {
            if ((window as any).__pwaPrompt) {
              (window as any).__pwaPrompt.prompt()
            } else {
              alert('To install Physionautics on Desktop:\n1. Click the Install icon (💻/➕) in your browser address bar\n2. Or open browser menu (⋮) -> Apps -> Install this site as an app')
            }
          }}
        >
          <Building2 className="h-3.5 w-3.5 text-blue-600" />
          Install Desktop App
        </Button>
        {user?.email && <p className="text-xs text-muted-foreground truncate px-1" title={user.email}>{user.email}</p>}
        <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-gray-700 h-8 text-xs" onClick={() => signOut()}>
          <LogOut className="h-3.5 w-3.5" />Sign Out
        </Button>
      </div>
    </aside>
  )
}
