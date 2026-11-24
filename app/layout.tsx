import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/sonner'
import { PwaRegister } from '@/components/pwa/pwa-installer'
import { OfflineSyncWatcher } from '@/components/pwa/offline-sync-watcher'
import { AmbientPhysioBackground } from '@/components/layout/ambient-physio-background'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://physio-bill-desk.vercel.app'),
  title: 'Physionautics - Physiotherapy & Pain Rehabilitation Centre',
  description: 'Specialized Physiotherapy, Pain Rehabilitation & Clinical Management Platform',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Physionautics',
  },
  openGraph: {
    title: 'Physionautics - Physiotherapy & Pain Rehabilitation Centre',
    description: 'Specialized Physiotherapy, Pain Rehabilitation & Clinical Management Platform',
    url: 'https://physio-bill-desk.vercel.app',
    siteName: 'Physionautics Clinic',
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: '/pn-logo.png',
        width: 1200,
        height: 630,
        alt: 'Physionautics Clinic Logo',
      },
      {
        url: '/logo.png',
        width: 800,
        height: 400,
        alt: 'Physionautics Physiotherapy Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Physionautics - Physiotherapy & Pain Rehabilitation Centre',
    description: 'Specialized Physiotherapy, Pain Rehabilitation & Clinical Management Platform',
    images: ['/pn-logo.png'],
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
          {/* Ambient Decorative Background & Vector Watermark Overlay */}
          <AmbientPhysioBackground />

          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
          <Toaster richColors />
          <PwaRegister />
          <OfflineSyncWatcher />
        </AuthProvider>
      </body>
    </html>
  )
}