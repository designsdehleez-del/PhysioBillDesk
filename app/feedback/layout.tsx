import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Patient Feedback & Care Review | Physionautics',
  description: 'Share your clinical treatment feedback and rating with Physionautics Physiotherapy & Rehabilitation.',
  openGraph: {
    title: 'Physionautics - Patient Care Feedback & Review',
    description: 'Physiotherapy & Pain Rehabilitation Centre. Please review your session and treatment experience.',
    url: 'https://physio-bill-desk.vercel.app/feedback',
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
        alt: 'Physionautics Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Physionautics - Patient Care Feedback & Review',
    description: 'Share your clinical treatment feedback with Physionautics Physiotherapy & Rehabilitation.',
    images: ['/pn-logo.png'],
  },
}

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
