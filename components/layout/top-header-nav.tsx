'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  Stethoscope, LayoutDashboard, Receipt, Users, Sparkles, UserCog, 
  Building2, Settings, MessageCircle, Database, ChevronDown, Lock, 
  LogOut, HelpCircle, Shield, Plus, FileText, Tag, UserPlus, Sliders, Menu, X, ArrowRight
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

  const [workflowOpen, setWorkflowOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const isAdmin = profile?.role === 'admin'
  const isDoctor = profile?.role === 'doctor'

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setActiveDropdown(null)
        setProfileOpen(false)
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
      label: '📋 Operations & Billing',
      items: [
        { label: 'Financials & KPIs', href: '/dashboard', icon: LayoutDashboard, desc: 'Real-time revenue, sessions & ratings' },
        ...(!isDoctor ? [
          { label: 'Register Patient', href: '/patients/register', icon: UserPlus, desc: 'Add new patient record' },
          { label: 'Billing & Invoices', href: '/billing', icon: Receipt, desc: 'Create bills & view payment ledger' },
        ] : []),
        { label: 'AI Feedback Studio', href: '/feedback-builder', icon: Sparkles, desc: 'Build forms & view patient CSAT' },
      ],
    },
    {
      label: '📂 Practice Directory',
      items: [
        { label: 'Patient Directory', href: '/patients', icon: Users, desc: 'All registered clinic patients' },
        { label: 'Doctors & Tagging', href: '/doctors', icon: Stethoscope, desc: 'Doctor directory & branch tags' },
        ...(isAdmin ? [
          { label: 'Clinic Centres', href: '/centres', icon: Building2, desc: 'Multi-branch locations' },
          { label: 'Staff & Logins', href: '/staff', icon: UserCog, desc: 'Manage user access & passwords' },
        ] : []),
      ],
    },
    ...(!isDoctor ? [
      {
        label: '🩺 Services & Pricing',
        items: [
          { label: 'Services & Rates', href: '/services', icon: Sliders, desc: 'Physiotherapy procedures & prices' },
          { label: 'Discount Rules', href: '/discounts', icon: Tag, desc: 'Senior citizen, referral & package rules' },
        ],
      },
      {
        label: '⚙️ Settings & Tools',
        items: [
          { label: 'Brand & Clinic Settings', href: '/settings', icon: Settings, desc: 'Clinic logo, header & contacts' },
          { label: 'WhatsApp Integration', href: '/settings/whatsapp', icon: MessageCircle, desc: 'Receipt templates & auto-share' },
          ...(isAdmin ? [
            { label: 'Data & Demo Tools', href: '/settings/data', icon: Database, desc: 'Seed test data & reset options' },
          ] : []),
        ],
      },
    ] : []),
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-xs" ref={dropdownRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-2.5">
              {branding.logoUrl ? (
                <img src={branding.logoUrl} alt={branding.clinicName || 'PhysioNautics'} className="h-8 max-w-[160px] object-contain" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
                  <Stethoscope className="w-5 h-5" />
                </div>
              )}
              <div className="hidden sm:block">
                <span className="font-extrabold text-base text-gray-900 tracking-tight leading-none block">
                  {branding.clinicName || 'Physionautics'}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  {profile?.centreName || 'Multispecialty Care'}
                </span>
              </div>
            </Link>

            {/* Quick Action Button */}
            {!isDoctor && (
              <Button size="xs" className="bg-blue-600 hover:bg-blue-700 text-white gap-1 rounded-full px-2.5 ml-2 shadow-xs hidden md:flex" onClick={() => router.push('/billing')}>
                <Plus className="h-3 w-3" /> Quick Bill
              </Button>
            )}
          </div>

          {/* Desktop Categorized Navigation Dropdowns */}
          <nav className="hidden lg:flex items-center gap-1">
            {navGroups.map((group, gIdx) => {
              const isGroupActive = group.items.some(i => isActive(i.href))
              const isOpen = activeDropdown === gIdx

              return (
                <div key={gIdx} className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`text-xs font-semibold gap-1 ${isGroupActive ? 'text-blue-700 bg-blue-50 font-bold' : 'text-gray-700 hover:bg-gray-100'}`}
                    onClick={() => {
                      setActiveDropdown(isOpen ? null : gIdx)
                      setProfileOpen(false)
                    }}
                  >
                    {group.label}
                    <ChevronDown className={`h-3.5 w-3.5 opacity-60 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </Button>

                  {/* Dropdown Menu Box */}
                  {isOpen && (
                    <div className="absolute left-0 mt-1.5 w-64 bg-white border border-gray-200 rounded-xl shadow-xl p-1.5 z-50 space-y-1 animate-in fade-in-50 zoom-in-95">
                      {group.items.map((item, iIdx) => {
                        const Icon = item.icon
                        const active = isActive(item.href)
                        return (
                          <Link
                            key={iIdx}
                            href={item.href}
                            onClick={() => setActiveDropdown(null)}
                            className={`flex items-start gap-2.5 p-2 rounded-lg transition-colors ${active ? 'bg-blue-50 text-blue-900 font-bold' : 'hover:bg-gray-50'}`}
                          >
                            <div className={`p-1.5 rounded-md mt-0.5 ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-900">{item.label}</div>
                              <div className="text-[10px] text-muted-foreground leading-tight">{item.desc}</div>
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

          {/* Right Controls & Profile Menu */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:block">
              <ClinicWorkflowGuide />
            </div>

            <Button 
              size="xs" 
              variant="ghost" 
              className="text-[11px] gap-1 text-gray-600 hover:bg-gray-100 hidden sm:flex"
              onClick={handleLockNow}
              title="Lock Reception Desk (Ctrl+Alt+L)"
            >
              <Lock className="h-3.5 w-3.5 text-gray-500" /> Lock
            </Button>

            {/* Profile Menu Trigger */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 px-2 hover:bg-gray-100"
                onClick={() => {
                  setProfileOpen(!profileOpen)
                  setActiveDropdown(null)
                }}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white ${
                  isAdmin ? 'bg-purple-600' : isDoctor ? 'bg-teal-600' : 'bg-blue-600'
                }`}>
                  {profile?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden md:block leading-tight">
                  <div className="text-xs font-bold text-gray-900 truncate max-w-[110px]">{profile?.name || 'User'}</div>
                  <div className="text-[10px] text-muted-foreground capitalize">{isAdmin ? 'Admin' : isDoctor ? 'Doctor' : 'Staff'}</div>
                </div>
                <ChevronDown className={`h-3.5 w-3.5 opacity-50 transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </Button>

              {/* Profile Dropdown Box */}
              {profileOpen && (
                <div className="absolute right-0 mt-1.5 w-56 bg-white border border-gray-200 rounded-xl shadow-xl p-2 z-50 space-y-1.5 animate-in fade-in-50 zoom-in-95">
                  <div className="px-2 py-1.5 border-b text-xs font-bold text-gray-900">
                    Signed in as <span className="text-blue-600 block text-[11px] font-mono truncate">{profile?.email}</span>
                  </div>
                  <button
                    onClick={() => { setWorkflowOpen(true); setProfileOpen(false) }}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-gray-50 text-gray-700"
                  >
                    <HelpCircle className="h-4 w-4 text-amber-600" /> Clinic Workflow Guide
                  </button>
                  <button
                    onClick={handleLockNow}
                    className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-gray-50 text-gray-700"
                  >
                    <Lock className="h-4 w-4 text-slate-600" /> Lock Clinic Screen
                  </button>
                  <div className="border-t pt-1">
                    <button
                      onClick={handleSignOut}
                      className="w-full text-left flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-rose-50 text-rose-600 font-semibold"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Categorized Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white p-4 space-y-4 shadow-lg">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                  {group.label}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {group.items.map((item, iIdx) => {
                    const Icon = item.icon
                    const active = isActive(item.href)
                    return (
                      <Link 
                        key={iIdx}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium ${active ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200' : 'bg-gray-50 text-gray-800'}`}
                      >
                        <Icon className="h-4 w-4 text-blue-600 shrink-0" />
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
