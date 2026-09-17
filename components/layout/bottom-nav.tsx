'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Video, User, MoreHorizontal, Sparkles } from 'lucide-react'

export function BottomNav() {
  const pathname = usePathname()

  const navItems = [
    { label: 'Home', href: '/dashboard', icon: Home },
    { label: 'Patients', href: '/patients', icon: Calendar },
    { label: 'Team', href: '/doctors', icon: User },
    { label: 'Feedback', href: '/feedback-builder', icon: Video },
    { label: 'Settings', href: '/settings', icon: MoreHorizontal },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-md border-t border-slate-200 py-2 px-4 md:hidden shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                isActive
                  ? 'text-blue-600 font-semibold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {isActive && <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-0.5" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
