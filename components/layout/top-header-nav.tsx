'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Stethoscope, LayoutDashboard, Receipt, Users, Sparkles, UserCog, 
  Building2, Settings, MessageCircle, Database, ChevronDown, Lock, 
  LogOut, HelpCircle, Plus, Sliders, Tag, UserPlus, Menu, X, ShieldCheck
} from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { useClinicBranding } from '@/lib/settings-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ClinicWorkflowGuide } from '@/components/clinic-workflow-guide'

export function TopHeaderNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { profile, signOut } = useAuth()
  const { branding } = useClinicBranding()

  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [logoMenuOpen, setLogoMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const isAdmin = profile?.role === 'admin'
  const isDoctor = profile?.role === 'doctor'

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
        setProfileOpen(false)
        setLogoMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLockNow = () => {
    document.cookie = 'physio_locked=true; path=/; max-age=86400'
    window.location.reload()
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  // Navigation Groups
  const navGroups = [
    {
      label: 'Operations & Billing',
      icon: LayoutDashboard,
      items: [
        { label: 'Financials & KPIs', href: '/dashboard', icon: LayoutDashboard, desc: 'Real-time revenue & CSAT' },
        ...(!isDoctor ? [
          { label: 'Register Patient', href: '/patients/register', icon: UserPlus, desc: 'Add new patient record' },
          { label: 'Billing & Invoices', href: '/billing', icon: Receipt, desc: 'Create bills & ledger' },
        ] : []),
        { label: 'AI Feedback Studio', href: '/feedback-builder', icon: Sparkles, desc: 'Patient feedback forms' },
      ],
    },
    {
      label: 'Practice Directory',
      icon: Users,
      items: [
        { label: 'Patient Directory', href: '/patients', icon: Users, desc: 'All registered patients' },
        { label: 'Doctors & Tagging', href: '/doctors', icon: Stethoscope, desc: 'Doctor directory & tags' },
        ...(isAdmin ? [
          { label: 'Clinic Centres', href: '/centres', icon: Building2, desc: 'Multi-branch locations' },
          { label: 'Staff & Logins', href: '/staff', icon: UserCog, desc: 'Manage access & passwords' },
        ] : []),
      ],
    },
    ...(!isDoctor ? [
      {
        label: 'Services & Pricing',
        icon: Sliders,
        items: [
          { label: 'Services & Rates', href: '/services', icon: Sliders, desc: 'Procedures & price list' },
          { label: 'Discount Rules', href: '/discounts', icon: Tag, desc: 'Discount presets & rules' },
        ],
      },
      {
        label: 'Settings & Tools',
        icon: Settings,
        items: [
          { label: 'Brand & Clinic Settings', href: '/settings', icon: Settings, desc: 'Branding & contacts' },
          { label: 'Landing Page CMS', href: '/settings/landing', icon: Sparkles, desc: 'Edit text & images' },
          { label: 'WhatsApp Settings', href: '/settings/whatsapp', icon: MessageCircle, desc: 'Message templates' },
          ...(isAdmin ? [
            { label: 'Data & Demo Tools', href: '/settings/data', icon: Database, desc: 'Seed & reset tools' },
          ] : []),
        ],
      },
    ] : []),
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs" ref={dropdownRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          
          {/* Logo Section: Clickable Link to Landing Page */}
          <div className="flex items-center gap-1.5">
            <Link
              href="/"
              className="flex flex-col text-left group cursor-pointer focus:outline-none py-1"
              title="Go to Home Landing Page"
            >
              {branding.logoUrl ? (
                <div className="flex flex-col">
                  <img src={branding.logoUrl} alt={branding.clinicName || 'PhysioNautics'} className="h-7 max-w-[170px] object-contain group-hover:opacity-90 transition-opacity" />
                  <span className="text-[9px] font-medium text-slate-400 -mt-0.5 leading-none">
                    {branding.tagline || 'Physiotherapy & Pain Rehabilitation'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:bg-blue-700 transition-colors">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-900 tracking-tight leading-none block group-hover:text-blue-600 transition-colors">
                      {branding.clinicName || 'Physionautics'}
                    </span>
                    <span className="text-[9px] font-medium text-slate-400">
                      {branding.tagline || 'Physiotherapy & Pain Rehabilitation'}
                    </span>
                  </div>
                </div>
              )}
            </Link>
          </div>

          {/* Desktop Clean Categorized Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navGroups.map((group, gIdx) => {
              const isGroupActive = group.items.some(i => isActive(i.href))
              const isOpen = activeDropdown === gIdx

              return (
                <div key={gIdx} className="relative">
                  <button 
                    className={`text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer ${
                      isGroupActive ? 'text-blue-600 bg-blue-50 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                    onClick={() => {
                      setActiveDropdown(isOpen ? null : gIdx)
                      setProfileOpen(false)
                      setLogoMenuOpen(false)
                    }}
                  >
                    {group.label}
                    <ChevronDown className={`h-3 w-3 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Clean Dropdown Box */}
                  {isOpen && (
                    <div className="absolute left-0 mt-1.5 w-60 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 space-y-0.5 animate-in fade-in-50 zoom-in-95">
                      {group.items.map((item, iIdx) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                          <Link
                            key={iIdx}
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className={`flex items-start gap-2.5 p-2 rounded-lg transition-colors ${
                              active ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                            }`}
                          >
                            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                            <div>
                              <div className="text-xs font-semibold">{item.label}</div>
                              <div className="text-[10px] text-slate-400 font-normal leading-tight">{item.desc}</div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Right Controls: Minimal Profile Menu Only */}
          <div className="flex items-center gap-2">
            {!isDoctor && (
              <Button 
                size="xs" 
                className="bg-blue-600 hover:bg-blue-700 text-white gap-1 rounded-lg px-2.5 shadow-xs hidden sm:flex text-[11px]" 
                onClick={() => router.push('/billing')}
              >
                <Plus className="h-3 w-3" /> New Bill
              </Button>
            )}

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                onClick={() => {
                  setProfileOpen(!profileOpen)
                  setActiveDropdown(null)
                  setLogoMenuOpen(false)
                }}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                  isAdmin ? 'bg-purple-600' : isDoctor ? 'bg-teal-600' : 'bg-blue-600'
                }`}>
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden md:block leading-tight">
                  <div className="text-xs font-bold text-slate-900 truncate max-w-[100px]">{profile?.name || 'User'}</div>
                  <div className="text-[10px] text-slate-400 capitalize">{isAdmin ? 'Admin' : isDoctor ? 'Doctor' : 'Staff'}</div>
                </div>
                <ChevronDown className={`h-3 w-3 opacity-40 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Box */}
              {profileOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50 space-y-1 animate-in fade-in-50 zoom-in-95">
                  <div className="px-2.5 py-1.5 border-b text-xs font-bold text-slate-900">
                    Signed in as <span className="text-blue-600 block text-[11px] font-mono truncate">{profile?.email}</span>
                  </div>
                  <button
                    onClick={handleLockNow}
                    className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-slate-50 text-slate-700"
                  >
                    <Lock className="h-3.5 w-3.5 text-slate-500" /> Lock Screen
                  </button>
                  <div className="border-t pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs hover:bg-rose-50 text-rose-600 font-semibold"
                    >
                      <LogOut className="h-3.5 w-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="lg:hidden h-8 w-8" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white p-4 space-y-3 shadow-lg">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">
                  {group.label}
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {group.items.map((item, iIdx) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link 
                        key={iIdx}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs ${
                          active ? 'bg-blue-50 text-blue-900 font-bold' : 'bg-slate-50 text-slate-700'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </header>
    </>
  )
}
