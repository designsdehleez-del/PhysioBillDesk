import type { Metadata } from 'next'
import PublicInvoiceViewClient from './client'

interface Props {
  searchParams: Promise<{ bid?: string; uid?: string; d?: string; print?: string }>
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const { bid } = await searchParams
  const billId = bid || 'INVOICE'
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://physio-bill-desk.vercel.app'
  const logoUrl = `${baseUrl.replace(/\/$/, '')}/pn-logo.png`

  return {
    title: `PhysioNautics Official Tax Invoice - ${billId}`,
    description: `Official digital computerized tax receipt & clinical invoice #${billId} issued by PhysioNautics Physiotherapy & Pain Rehabilitation Centre. Click to view and download.`,
    openGraph: {
      title: `PhysioNautics Official Tax Invoice - #${billId}`,
      description: `Official digital computerized tax receipt & clinical invoice #${billId} issued by PhysioNautics Physiotherapy & Pain Rehabilitation Centre. Click to view and download.`,
      url: `${baseUrl}/invoice/view?bid=${encodeURIComponent(billId)}`,
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
      title: `PhysioNautics Official Tax Invoice - #${billId}`,
      description: `Official digital computerized tax receipt & clinical invoice #${billId} issued by PhysioNautics Physiotherapy & Pain Rehabilitation Centre.`,
      images: [logoUrl],
    },
  }
}

export default async function PublicInvoiceViewPage({ searchParams }: Props) {
  const resolved = await searchParams
  return <PublicInvoiceViewClient resolvedParams={resolved} />
}
