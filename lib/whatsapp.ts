import { StoredVisit } from '@/lib/data-store'
import { formatCurrency, formatDate } from '@/lib/utils'

export interface WhatsAppConfig {
  mode: 'deeplink' | 'api'
  apiProvider?: 'meta' | 'generic' | 'aisensy' | 'interakt'
  apiUrl?: string
  phoneNumberId?: string
  accessToken?: string
  apiKey?: string
  customSenderPhone?: string
  messageTemplate: string
  autoShareOnBilling?: boolean
  includeFeedbackLink?: boolean
}

export const DEFAULT_WHATSAPP_TEMPLATE = `🏥 *PHYSIONAUTICS CLINIC & PHYSIOTHERAPY*
━━━━━━━━━━━━━━━━━━━━
📄 *INVOICE & RECEIPT*
━━━━━━━━━━━━━━━━━━━━
🔢 *Bill No:* {bill_number}
📅 *Date:* {bill_date}
👤 *Patient:* {patient_name} ({patient_uid})
👨‍⚕️ *Consulting Doctor:* Dr. {doctor_name}
📍 *Clinic Centre:* {centre_name}

📋 *Services & Charges:*
{services_breakdown}

💵 *Subtotal:* {subtotal}
💰 *Discount:* {discount}
✨ *NET TOTAL PAID:* {total_amount}
💳 *Payment Mode:* {payment_mode} (Paid)
📝 *Care Remarks:* {notes}
━━━━━━━━━━━━━━━━━━━━
⭐ *WE VALUE YOUR RECOVERY & FEEDBACK!*
Please take 30 seconds to rate your session experience:
👉 {feedback_url}
━━━━━━━━━━━━━━━━━━━━
Thank you for trusting Physionautics with your wellness! 🌿
📞 Contact us: {centre_phone}`

export const PRESET_TEMPLATES = [
  {
    id: 'detailed',
    title: 'Detailed Itemized Invoice & Feedback (Default)',
    description: 'Complete breakdown of procedures, payment info, clinic branch & feedback link.',
    template: DEFAULT_WHATSAPP_TEMPLATE,
  },
  {
    id: 'concise',
    title: 'Short & Concise Receipt',
    description: 'Compact summary with invoice number, amount paid and feedback link.',
    template: `🏥 *PHYSIONAUTICS CLINIC*
Receipt for {patient_name} ({patient_uid})
━━━━━━━━━━━━━━━━━━━━
Invoice: {bill_number} | Date: {bill_date}
Doctor: Dr. {doctor_name}
Branch: {centre_name}

Services:
{services_breakdown}

Net Amount: {total_amount} ({payment_mode})

⭐ Rate your session: {feedback_url}
Get well soon! 🌿
📞 Helpline: {centre_phone}`,
  },
  {
    id: 'warm_care',
    title: 'Warm Patient Care & Follow-up',
    description: 'Personalized tone focused on recovery guidance, care remarks, and feedback.',
    template: `Dear {patient_name},

Thank you for visiting *Physionautics ({centre_name})* today! 

Your session with Dr. {doctor_name} has been recorded under Invoice #{bill_number}.
✨ *Total Amount Paid:* {total_amount} via {payment_mode}

💧 *Post-Treatment Care:*
Please stay well hydrated and perform any prescribed mobility drills gently.
{notes}

We would love to know how you felt during your session today. Please share your rating:
👉 {feedback_url}

Wishing you a speedy recovery! 🌟
Physionautics Team 🌿`,
  },
  {
    id: 'minimal',
    title: 'Minimal Payment Confirmation',
    description: 'Quick payment receipt with minimal clutter.',
    template: `*PHYSIONAUTICS INVOICE CONFIRMATION*
Bill #{bill_number}
Patient: {patient_name}
Amount Paid: {total_amount} via {payment_mode}
Date: {bill_date}

Feedback & Review: {feedback_url}
Thank you!`,
  },
]

export const AVAILABLE_VARIABLES = [
  { tag: '{patient_name}', label: 'Patient Full Name', example: 'Rahul Verma' },
  { tag: '{patient_uid}', label: 'Patient UID', example: 'CLN-202609-0001' },
  { tag: '{patient_phone}', label: 'Patient Mobile Number', example: '+91 98765 11111' },
  { tag: '{bill_number}', label: 'Invoice Number', example: 'INV-202609-0001' },
  { tag: '{bill_date}', label: 'Invoice Date', example: '15 Sep 2026' },
  { tag: '{doctor_name}', label: 'Attending Doctor', example: 'Dr. Sarah Jenkins' },
  { tag: '{centre_name}', label: 'Clinic Branch Name', example: 'New Friends Colony, New Delhi' },
  { tag: '{centre_phone}', label: 'Clinic Contact Number', example: '08383936905' },
  { tag: '{services_breakdown}', label: 'Itemized Procedures & Rates', example: '• Consultation (x1) - ₹600' },
  { tag: '{subtotal}', label: 'Subtotal Amount', example: '₹1,900' },
  { tag: '{discount}', label: 'Discount Amount', example: '₹200' },
  { tag: '{total_amount}', label: 'Net Total Paid', example: '₹1,700' },
  { tag: '{payment_mode}', label: 'Payment Method', example: 'UPI' },
  { tag: '{notes}', label: 'Clinical Care Remarks', example: 'Lower lumbar mobilization session completed.' },
  { tag: '{feedback_url}', label: 'Patient Feedback Link', example: 'https://physionautics.vercel.app/feedback?...' },
]

export function getWhatsAppConfig(): WhatsAppConfig {
  if (typeof window === 'undefined') {
    return {
      mode: 'deeplink',
      messageTemplate: DEFAULT_WHATSAPP_TEMPLATE,
      includeFeedbackLink: true,
    }
  }

  const cached = localStorage.getItem('physio_whatsapp_config_v1')
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      return {
        mode: parsed.mode || 'deeplink',
        apiProvider: parsed.apiProvider || 'meta',
        apiUrl: parsed.apiUrl || '',
        phoneNumberId: parsed.phoneNumberId || '',
        accessToken: parsed.accessToken || '',
        apiKey: parsed.apiKey || '',
        customSenderPhone: parsed.customSenderPhone || '',
        messageTemplate: parsed.messageTemplate || DEFAULT_WHATSAPP_TEMPLATE,
        autoShareOnBilling: !!parsed.autoShareOnBilling,
        includeFeedbackLink: parsed.includeFeedbackLink !== false,
      }
    } catch (_) {}
  }

  const initial: WhatsAppConfig = {
    mode: 'deeplink',
    apiProvider: 'meta',
    messageTemplate: DEFAULT_WHATSAPP_TEMPLATE,
    includeFeedbackLink: true,
  }
  localStorage.setItem('physio_whatsapp_config_v1', JSON.stringify(initial))
  return initial
}

export function saveWhatsAppConfig(config: Partial<WhatsAppConfig>): WhatsAppConfig {
  const current = getWhatsAppConfig()
  const updated: WhatsAppConfig = {
    ...current,
    ...config,
  }
  if (typeof window !== 'undefined') {
    localStorage.setItem('physio_whatsapp_config_v1', JSON.stringify(updated))
  }
  return updated
}

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

export function renderWhatsAppMessage(template: string, visit: StoredVisit): string {
  const feedbackUrl = getFeedbackUrl(visit)
  
  const itemsText = (visit.items || [])
    .map(i => `  • ${i.service_name} (x${i.quantity}) - ${formatCurrency(i.price * i.quantity)}`)
    .join('\n')

  let discountText = '₹0'
  if (visit.discount > 0) {
    discountText = `-${formatCurrency(visit.discount)}`
  }

  const doctorName = (visit.doctor_name || 'Consultant').replace(/^Dr\.\s*/i, '')
  const centreName = visit.centre_name || 'New Friends Colony, New Delhi'
  const centrePhone = visit.centre_phone || '08383936905'
  const notesText = visit.notes ? visit.notes : 'Thank you for choosing Physionautics.'

  let message = template
    .replace(/{patient_name}/g, visit.patient_name || 'Valued Patient')
    .replace(/{patient_uid}/g, visit.patient_uid || '')
    .replace(/{patient_phone}/g, visit.patient_phone || '')
    .replace(/{bill_number}/g, visit.bill_number || '')
    .replace(/{bill_date}/g, formatDate(visit.visit_date))
    .replace(/{doctor_name}/g, doctorName)
    .replace(/{centre_name}/g, centreName)
    .replace(/{centre_phone}/g, centrePhone)
    .replace(/{services_breakdown}/g, itemsText || '  • Physiotherapy Session')
    .replace(/{subtotal}/g, formatCurrency(visit.subtotal || 0))
    .replace(/{discount}/g, discountText)
    .replace(/{total_amount}/g, formatCurrency(visit.total || 0))
    .replace(/{payment_mode}/g, visit.payment_mode || 'Cash')
    .replace(/{notes}/g, notesText)
    .replace(/{feedback_url}/g, feedbackUrl)

  return message
}

export function generateWhatsAppInvoiceText(visit: StoredVisit, customTemplate?: string): string {
  const config = getWhatsAppConfig()
  const templateToUse = customTemplate || config.messageTemplate || DEFAULT_WHATSAPP_TEMPLATE
  return renderWhatsAppMessage(templateToUse, visit)
}

export function formatPhoneNumber(phone: string): string {
  const raw = (phone || '').replace(/[^0-9]/g, '')
  if (!raw) return ''
  if (raw.length === 10) return `91${raw}`
  if (raw.length === 11 && raw.startsWith('0')) return `91${raw.substring(1)}`
  return raw
}

export function openWhatsAppInvoice(visit: StoredVisit, customText?: string) {
  const phone = formatPhoneNumber(visit.patient_phone)
  const message = customText || generateWhatsAppInvoiceText(visit)
  const encoded = encodeURIComponent(message)
  const url = phone ? `https://wa.me/${phone}?text=${encoded}` : `https://wa.me/?text=${encoded}`
  
  if (typeof window !== 'undefined') {
    window.open(url, '_blank')
  }
}

export async function sendViaWhatsAppAPI(
  visit: StoredVisit,
  customText?: string
): Promise<{ success: boolean; message: string; messageId?: string }> {
  const config = getWhatsAppConfig()
  const phone = formatPhoneNumber(visit.patient_phone)
  const text = customText || generateWhatsAppInvoiceText(visit)

  if (!phone) {
    return { success: false, message: 'Patient phone number is missing.' }
  }

  // If in deeplink mode or missing credentials, open in web
  if (config.mode !== 'api' || !config.accessToken || !config.phoneNumberId) {
    openWhatsAppInvoice(visit, text)
    return { success: true, message: 'Opened in WhatsApp Web / App.' }
  }

  try {
    // Call Meta Cloud API or Generic Webhook
    const endpoint = config.apiUrl || `https://graph.facebook.com/v19.0/${config.phoneNumberId}/messages`
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phone,
        type: 'text',
        text: { preview_url: true, body: text },
      }),
    })

    const data = await res.json()
    if (res.ok && data.messages?.[0]?.id) {
      return { success: true, message: 'Message sent successfully via WhatsApp API!', messageId: data.messages[0].id }
    } else {
      console.warn('WhatsApp API response error:', data)
      // Fallback to web deeplink
      openWhatsAppInvoice(visit, text)
      return { 
        success: true, 
        message: `API returned: ${data?.error?.message || 'Notice'}. Opened WhatsApp directly.` 
      }
    }
  } catch (err: any) {
    console.error('WhatsApp API dispatch failed:', err)
    openWhatsAppInvoice(visit, text)
    return { success: true, message: 'API connection failed. Opened in WhatsApp directly.' }
  }
}

export async function testWhatsAppApiConnection(
  testPhone: string,
  config: WhatsAppConfig
): Promise<{ success: boolean; message: string }> {
  const phone = formatPhoneNumber(testPhone)
  if (!phone) return { success: false, message: 'Please enter a valid 10-digit phone number.' }

  if (config.mode === 'deeplink') {
    const text = `🏥 *PHYSIONAUTICS TEST MESSAGE*\nThis is a sample test message from Physionautics WhatsApp messaging service.`
    const encoded = encodeURIComponent(text)
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank')
    return { success: true, message: 'Test message opened in WhatsApp.' }
  }

  if (!config.accessToken || !config.phoneNumberId) {
    return { success: false, message: 'Please provide both Meta Phone Number ID and Access Token.' }
  }

  try {
    const endpoint = config.apiUrl || `https://graph.facebook.com/v19.0/${config.phoneNumberId}/messages`
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: phone,
        type: 'text',
        text: { preview_url: true, body: `🏥 *PHYSIONAUTICS CLINIC API TEST*\nWhatsApp Business Cloud API connection test successful!` },
      }),
    })

    const data = await res.json()
    if (res.ok) {
      return { success: true, message: 'Test message sent successfully via WhatsApp API!' }
    } else {
      return { success: false, message: data?.error?.message || 'API verification failed. Check credentials.' }
    }
  } catch (err: any) {
    return { success: false, message: `Network request error: ${err.message}` }
  }
}
