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

export interface BroadcastCampaign {
  id: string
  title: string
  description: string
  imageUrl: string
  template: string
}

export const DEFAULT_WHATSAPP_TEMPLATE = `🏥 *PHYSIONAUTICS CLINIC & PHYSIOTHERAPY*
━━━━━━━━━━━━━━━━━━━━
📄 *INVOICE & RECEIPT*
━━━━━━━━━━━━━━━━━━━━
🔢 *Bill No:* {bill_number}
📅 *Date:* {bill_date}
👤 *Patient:* {patient_name} ({patient_uid})
👨‍⚕️ *Primary Doctor:* {primary_doctor}
🩺 *Attending Physiotherapist:* {physiotherapist}
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
Primary Doctor: {primary_doctor}
Attending Physio: {physiotherapist}
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
Primary Doctor: {primary_doctor}
Attending Physiotherapist: {physiotherapist}
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
Primary Doctor: {primary_doctor}
Attending Physio: {physiotherapist}
Amount Paid: {total_amount} via {payment_mode}
Date: {bill_date}

Feedback & Review: {feedback_url}
Thank you!`,
  },
]

export const PRESET_BROADCAST_CAMPAIGNS: BroadcastCampaign[] = [
  {
    id: 'camp_custom',
    title: '✏️ Custom Message & Announcement',
    description: 'Compose your own custom broadcast message from scratch or edit your saved draft.',
    imageUrl: '',
    template: `🏥 *PHYSIONAUTICS CLINIC ANNOUNCEMENT* 🌿
━━━━━━━━━━━━━━━━━━━━
Dear *{patient_name}*,

[Write your custom message or clinic announcement here...]

Warm regards,
*Physionautics Team ({centre_name})*
📞 Contact: {centre_phone}`,
  },
  {
    id: 'camp_spine_health',
    title: '🌿 Free Spine & Posture Health Camp',
    description: 'Promotional announcement for special consultation camp with banner.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
    template: `🏥 *PHYSIONAUTICS CLINIC - FREE SPINE & POSTURE CAMP* 🌿
━━━━━━━━━━━━━━━━━━━━
Dear *{patient_name}*,

We are excited to announce a special *Free Spine & Posture Assessment Camp* at our *{centre_name}* clinic!

🗓️ *Event Dates:* 1st - 5th Next Month
👨‍⚕️ *Lead Specialist:* Dr. Sarah Jenkins & Care Team
📍 *Location:* {centre_name}

✨ *What's Included:*
• Digital Posture Analysis
• 1-on-1 Ergonomic Consultation
• Free VAS Mobility Assessment

Book your priority slot today by replying to this message or calling us at {centre_phone}.

Wishing you active & healthy living! 🌿
*Physionautics Physiotherapy Team*`,
  },
  {
    id: 'camp_festival_greetings',
    title: '✨ Festival & Wellness Greetings',
    description: 'Warm seasonal greeting with clinic wellness tips and banner.',
    imageUrl: 'https://images.unsplash.com/photo-1519824145371-296894a0daa9?auto=format&fit=crop&q=80&w=800',
    template: `✨ *HAPPY FESTIVE SEASON FROM PHYSIONAUTICS!* ✨
━━━━━━━━━━━━━━━━━━━━
Dear *{patient_name}*,

Wishing you and your family immense health, joy, and vitality this festive season! 🎉

As a valued member of the Physionautics family, we remind you to take short movement breaks during festive celebrations to keep your spine & joints pain-free.

🌿 *Clinic Hours Notice:*
Our clinic branches will remain open for scheduled therapy sessions.

For appointments or emergency care, reach out at {centre_phone}.

Warm regards,
*Physionautics Team ({centre_name})*`,
  },
  {
    id: 'camp_rehab_followup',
    title: '🩺 Post-Treatment Recovery Check-in',
    description: 'Bulk check-in reminder for existing patients with posture guidance image.',
    imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=800',
    template: `🩺 *PHYSIONAUTICS PATIENT RECOVERY CHECK-IN*
━━━━━━━━━━━━━━━━━━━━
Hello *{patient_name}*!

We are checking in on your rehabilitation progress at Physionautics.

Are you experiencing any stiffness or discomfort? Keeping up with your daily home exercises is essential for long-term recovery.

📞 *Need a Follow-up Consultation?*
If you wish to review your treatment plan with Dr. {doctor_name}, call us at {centre_phone} or reply directly to this WhatsApp.

Stay strong and keep moving! 🌿
*Physionautics Care Desk*`,
  },
  {
    id: 'camp_neuro_offer',
    title: '⚡ Advanced Neuro & Sports Rehab Launch',
    description: 'Announce new services like dry needling, laser therapy & neuro rehabilitation.',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&q=80&w=800',
    template: `⚡ *NEW ADVANCED THERAPY SERVICES AT PHYSIONAUTICS!*
━━━━━━━━━━━━━━━━━━━━
Dear *{patient_name}*,

We are thrilled to introduce state-of-the-art *Advanced Neuro Rehab, High-Intensity Laser Therapy & Sports Decompression* at our {centre_name} branch!

🎯 Special introductory 20% discount on 5-Session Rehab Packages for existing patients!

📞 Call {centre_phone} to claim your package or consult with our lead specialists.

To a healthier, pain-free life! 🌿
*Physionautics Clinic*`,
  },
]

export function getSavedCustomBroadcast(): { imageUrl: string; template: string } {
  if (typeof window === 'undefined') return { imageUrl: '', template: '' }
  try {
    const saved = localStorage.getItem('physio_custom_broadcast_draft_v1')
    if (saved) return JSON.parse(saved)
  } catch (_) {}
  return { imageUrl: '', template: '' }
}

export function saveCustomBroadcast(imageUrl: string, template: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem('physio_custom_broadcast_draft_v1', JSON.stringify({ imageUrl, template }))
}

export const AVAILABLE_VARIABLES = [
  { tag: '{patient_name}', label: 'Patient Full Name', example: 'Rahul Verma' },
  { tag: '{patient_uid}', label: 'Patient UID', example: 'CLN-202609-0001' },
  { tag: '{patient_phone}', label: 'Patient Mobile Number', example: '+91 98765 11111' },
  { tag: '{bill_number}', label: 'Invoice Number', example: 'INV-202609-0001' },
  { tag: '{bill_date}', label: 'Invoice Date', example: '15 Sep 2026' },
  { tag: '{primary_doctor}', label: 'Primary Doctor', example: 'Dr. Sarah Jenkins' },
  { tag: '{physiotherapist}', label: 'Attending Physiotherapist', example: 'PT Vikram Verma' },
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
  const servicesList = (visit.items || []).map(i => i.service_name).join(', ')
  const params = new URLSearchParams({
    bid: visit.bill_number,
    uid: visit.patient_uid,
    name: visit.patient_name,
    phone: visit.patient_phone || '',
    doc: (visit.primary_doctor_name || visit.doctor_name || '').replace(/^Dr\.\s*/i, ''),
    centre: visit.centre_name || '',
    services: servicesList || '',
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

  const primaryDoctor = visit.primary_doctor_name || visit.doctor_name || 'N/A'
  const physiotherapist = visit.physiotherapist_name || 'N/A'
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
    .replace(/{primary_doctor}/g, primaryDoctor)
    .replace(/{physiotherapist}/g, physiotherapist)
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

export function renderBroadcastMessage(template: string, patient: any): string {
  const patientName = patient.full_name || patient.name || 'Valued Patient'
  const patientUid = patient.uid || 'CLN-PATIENT'
  const doctorName = patient.primary_doctor_name || patient.doctor_name || 'Dr. Sarah Jenkins'
  const centreName = patient.centre_name || 'New Friends Colony, New Delhi'
  const centrePhone = patient.centre_phone || '08383936905'
  const phone = patient.phone || ''

  return template
    .replace(/{patient_name}/g, patientName)
    .replace(/{patient_uid}/g, patientUid)
    .replace(/{doctor_name}/g, (doctorName || '').replace(/^Dr\.\s*/i, ''))
    .replace(/{primary_doctor}/g, doctorName)
    .replace(/{centre_name}/g, centreName)
    .replace(/{centre_phone}/g, centrePhone)
    .replace(/{patient_phone}/g, phone)
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

  if (config.mode !== 'api' || !config.accessToken || !config.phoneNumberId) {
    openWhatsAppInvoice(visit, text)
    return { success: true, message: 'Opened in WhatsApp Web / App.' }
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
        text: { preview_url: true, body: text },
      }),
    })

    const data = await res.json()
    if (res.ok && data.messages?.[0]?.id) {
      return { success: true, message: 'Message sent successfully via WhatsApp API!', messageId: data.messages[0].id }
    } else {
      console.warn('WhatsApp API response error:', data)
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

export async function sendWhatsAppMediaMessageAPI(
  recipientPhone: string,
  messageText: string,
  imageUrl?: string,
  config?: WhatsAppConfig
): Promise<{ success: boolean; message: string; messageId?: string }> {
  const cfg = config || getWhatsAppConfig()
  const phone = formatPhoneNumber(recipientPhone)

  if (!phone) {
    return { success: false, message: 'Invalid phone number' }
  }

  if (cfg.mode !== 'api' || !cfg.accessToken || !cfg.phoneNumberId) {
    return { 
      success: true, 
      message: 'Deep-link mode active',
      messageId: `web-${Date.now()}`
    }
  }

  try {
    const endpoint = cfg.apiUrl || `https://graph.facebook.com/v19.0/${cfg.phoneNumberId}/messages`
    const payload = imageUrl
      ? {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phone,
          type: 'image',
          image: {
            link: imageUrl,
            caption: messageText,
          },
        }
      : {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phone,
          type: 'text',
          text: { preview_url: true, body: messageText },
        }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfg.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    if (res.ok && data.messages?.[0]?.id) {
      return { success: true, message: 'Sent via Meta WhatsApp API', messageId: data.messages[0].id }
    } else {
      return { success: false, message: data?.error?.message || 'Meta API delivery failed' }
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'API connection error' }
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
