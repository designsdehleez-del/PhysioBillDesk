import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const billId = decodeURIComponent(id)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://physio-bill-desk.vercel.app'
  const logoUrl = `${baseUrl.replace(/\/$/, '')}/pn-logo.png`

  return {
    title: `PhysioNautics Official Tax Invoice - ${billId}`,
    description: `Official digital computerized tax receipt & clinical invoice #${billId} issued by PhysioNautics Physiotherapy & Pain Rehabilitation Centre. Click to view and download.`,
    openGraph: {
      title: `PhysioNautics Official Tax Invoice - #${billId}`,
      description: `Official digital computerized tax receipt & clinical invoice #${billId} issued by PhysioNautics Physiotherapy & Pain Rehabilitation Centre. Click to view and download.`,
      url: `${baseUrl}/i/${billId}`,
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

export default async function ShortInvoicePage({ params }: Props) {
  const { id } = await params
  const billId = decodeURIComponent(id)
  // Redirect to full invoice viewer
  redirect(`/invoice/view?bid=${encodeURIComponent(billId)}`)
}
