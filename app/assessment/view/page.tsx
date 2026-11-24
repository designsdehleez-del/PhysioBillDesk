import type { Metadata } from 'next'
import PublicAssessmentViewClient from './client'

interface Props {
  searchParams: Promise<{ aid?: string; uid?: string; d?: string; print?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { aid } = await searchParams
  const reportId = aid || 'ASSESSMENT'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://physio-bill-desk.vercel.app'
  const logoUrl = `${baseUrl.replace(/\/$/, '')}/pn-logo.png`

  return {
    title: `PhysioNautics Clinical Assessment & Rehabilitation Plan - ${reportId}`,
    description: `Official Physiotherapy & Clinical Assessment Report #${reportId} by PhysioNautics Pain Rehabilitation Specialists. Click to view treatment notes and recovery plan.`,
    openGraph: {
      title: `PhysioNautics Clinical Assessment Report - #${reportId}`,
      description: `Official Physiotherapy & Clinical Assessment Report #${reportId} by PhysioNautics Pain Rehabilitation Specialists. Click to view treatment notes and recovery plan.`,
      url: `${baseUrl}/assessment/view?aid=${encodeURIComponent(reportId)}`,
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

export default async function PublicAssessmentViewPage({ searchParams }: Props) {
  const resolved = await searchParams
  return <PublicAssessmentViewClient resolvedParams={resolved} />
}
