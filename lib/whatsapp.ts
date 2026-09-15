import { StoredVisit } from '@/lib/data-store'
import { formatCurrency, formatDate } from '@/lib/utils'

export function getFeedbackUrl(visit: StoredVisit): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://physionautics.vercel.app'
  const params = new URLSearchParams({
    bid: visit.bill_number,
    uid: visit.patient_uid,
    name: visit.patient_name,
    phone: visit.patient_phone || '',
    doc: visit.doctor_name || '',
    centre: visit.centre_name || '',
  })
  return `${origin}/feedback?${params.toString()}`
}

export function generateWhatsAppInvoiceText(visit: StoredVisit): string {
  const feedbackUrl = getFeedbackUrl(visit)
  
  const itemsText = visit.items
    .map(i => `  • ${i.service_name} (x${i.quantity}) - ${formatCurrency(i.price * i.quantity)}`)
    .join('\n')

  let discountText = ''
  if (visit.discount > 0) {
    discountText = `\n💰 *Discount Applied:* -${formatCurrency(visit.discount)}`
  }

  const doctorLine = visit.doctor_name ? `\n👨‍⚕️ *Consulting Doctor:* Dr. ${visit.doctor_name}` : ''
  const centreLine = visit.centre_name ? `\n📍 *Clinic Centre:* ${visit.centre_name}` : ''
  const notesLine = visit.notes ? `\n📝 *Notes:* ${visit.notes}` : ''

  return `🏥 *PHYSIONAUTICS CLINIC & PHYSIOTHERAPY*
━━━━━━━━━━━━━━━━━━━━
📄 *INVOICE & RECEIPT*
━━━━━━━━━━━━━━━━━━━━
🔢 *Bill No:* ${visit.bill_number}
📅 *Date:* ${formatDate(visit.visit_date)}
👤 *Patient:* ${visit.patient_name} (${visit.patient_uid})${doctorLine}${centreLine}

📋 *Services Rendered:*
${itemsText}

💵 *Subtotal:* ${formatCurrency(visit.subtotal)}${discountText}
✨ *NET TOTAL PAID:* ${formatCurrency(visit.total)}
💳 *Payment Mode:* ${visit.payment_mode} (Paid)${notesLine}
━━━━━━━━━━━━━━━━━━━━
⭐ *WE VALUE YOUR RECOVERY & FEEDBACK!*
Please take 30 seconds to rate your session experience:
👉 ${feedbackUrl}
━━━━━━━━━━━━━━━━━━━━
Thank you for trusting Physionautics with your wellness! 🌿`
}

export function openWhatsAppInvoice(visit: StoredVisit) {
  const rawPhone = (visit.patient_phone || '').replace(/[^0-9]/g, '')
  let phone = rawPhone
  if (phone.length === 10) {
    phone = `91${phone}`
  } else if (phone.length === 11 && phone.startsWith('0')) {
    phone = `91${phone.substring(1)}`
  }

  const message = generateWhatsAppInvoiceText(visit)
  const encoded = encodeURIComponent(message)
  const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`
  
  if (typeof window !== 'undefined') {
    window.open(url, '_blank')
  }
}
