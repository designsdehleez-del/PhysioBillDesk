import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/sonner'
import { PwaRegister } from '@/components/pwa/pwa-installer'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'Physionautics - Clinic Management System',
  description: 'Specialized Physiotherapy & Clinical Management Desktop & Mobile Application',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Physionautics',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Physionautics" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className={`${inter.className} bg-gradient-to-br from-slate-100/90 via-slate-50 to-indigo-50/40 text-slate-900 min-h-screen relative selection:bg-blue-100 selection:text-blue-900 antialiased`}>
        <AuthProvider>
          {/* Ambient Decorative Background Pattern & Soft Radial Glows */}
          <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {/* Soft Radial Gradients */}
            <div className="absolute -top-32 -left-32 w-[36rem] h-[36rem] bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute top-1/3 -right-32 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 left-1/3 w-[36rem] h-[36rem] bg-teal-500/10 rounded-full blur-3xl" />
            
            {/* Micro-Dot Matrix Pattern */}
            <div className="absolute inset-0 bg-dot-pattern opacity-65" />
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
          <Toaster richColors />
          <PwaRegister />
        </AuthProvider>
      </body>
    </html>
  )
}