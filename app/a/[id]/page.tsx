import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const reportId = decodeURIComponent(id)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://physio-bill-desk.vercel.app'
  const logoUrl = `${baseUrl.replace(/\/$/, '')}/pn-logo.png`

  return {
    title: `PhysioNautics Clinical Assessment & Rehabilitation Plan - ${reportId}`,
    description: `Official Physiotherapy & Clinical Assessment Report #${reportId} by PhysioNautics Pain Rehabilitation Specialists. Click to view treatment notes and recovery plan.`,
    openGraph: {
      title: `PhysioNautics Clinical Assessment Report - #${reportId}`,
      description: `Official Physiotherapy & Clinical Assessment Report #${reportId} by PhysioNautics Pain Rehabilitation Specialists. Click to view treatment notes and recovery plan.`,
      url: `${baseUrl}/a/${reportId}`,
      siteName: 'PhysioNautics Clinical Management',
      images: [
        {
          url: logoUrl,
          width: 800,
          height: 800,
          alt: 'PhysioNautics Official Clinic Logo',
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `PhysioNautics Clinical Assessment - #${reportId}`,
      description: `Official Physiotherapy & Clinical Assessment Report #${reportId} by PhysioNautics Pain Rehabilitation Specialists.`,
      images: [logoUrl],
    },
  }
}

export default async function ShortAssessmentPage({ params }: Props) {
  const { id } = await params
  const reportId = decodeURIComponent(id)
  // Redirect to full assessment viewer
  redirect(`/assessment/view?aid=${encodeURIComponent(reportId)}`)
}
