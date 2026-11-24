'use client'

import { createClient } from '@/lib/supabase/client'

export type AuditCategory = 'AUTH' | 'PATIENT' | 'BILLING' | 'STAFF' | 'SYSTEM' | 'SECURITY'
export type AuditSeverity = 'INFO' | 'WARN' | 'CRITICAL'

export interface AuditLogEntry {
  id: string
  timestamp: string
  event_type: string
  category: AuditCategory
  severity: AuditSeverity
  actor_name: string
  actor_email: string
  actor_role: string
  centre_name?: string
  resource_id?: string
  resource_name?: string
  details: string
  metadata?: Record<string, any>
}

const AUDIT_LOGS_KEY = 'physio_clinical_audit_logs_v1'
const MAX_LOCAL_LOGS = 500

const SEED_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'aud-seed-01',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
    event_type: 'AUTH_LOGIN',
    category: 'AUTH',
    severity: 'INFO',
    actor_name: 'Chief Medical Administrator',
    actor_email: 'admin@physionautics.com',
    actor_role: 'admin',
    centre_name: 'All Centres',
    details: 'Master Administrator authenticated successfully from secure clinic gateway.',
  },
  {
    id: 'aud-seed-02',
    timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
    event_type: 'PATIENT_CREATED',
    category: 'PATIENT',
    severity: 'INFO',
    actor_name: 'New Friends Colony Staff',
    actor_email: 'nfc@physionautics.com',
    actor_role: 'clinic_reception',
    centre_name: 'New Friends Colony, New Delhi',
    resource_id: 'CLN-202609-0001',
    resource_name: 'Rahul Verma',
    details: 'Registered patient profile with diagnosis: Lumbar Disc Bulge with Sciatica.',
  },
  {
    id: 'aud-seed-03',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
    event_type: 'BILL_GENERATED',
    category: 'BILLING',
    severity: 'INFO',
    actor_name: 'New Friends Colony Staff',
    actor_email: 'nfc@physionautics.com',
    actor_role: 'clinic_reception',
    centre_name: 'New Friends Colony, New Delhi',
    resource_id: 'INV-202609-0001',
    resource_name: 'Rahul Verma',
    details: 'Generated computerized tax invoice for ₹2,100 (Payment: UPI, Discount: ₹200).',
  },
  {
    id: 'aud-seed-04',
    timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
    event_type: 'WORKSTATION_LOCKED',
    category: 'SECURITY',
    severity: 'WARN',
    actor_name: 'Vasant Vihar Staff',
    actor_email: 'vasantvihar@physionautics.com',
    actor_role: 'clinic_reception',
    centre_name: 'Vasant Vihar, New Delhi',
    details: 'Workstation auto-locked after 15 minutes of inactivity to protect patient records.',
  },
  {
    id: 'aud-seed-05',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    event_type: 'WORKSTATION_UNLOCKED',
    category: 'SECURITY',
    severity: 'INFO',
    actor_name: 'Vasant Vihar Staff',
    actor_email: 'vasantvihar@physionautics.com',
    actor_role: 'clinic_reception',
    centre_name: 'Vasant Vihar, New Delhi',
    details: 'Resumed clinical workstation session via credential re-authentication.',
  },
]

export function getAuditLogs(): AuditLogEntry[] {
  if (typeof window === 'undefined') return SEED_AUDIT_LOGS
  try {
    const cached = localStorage.getItem(AUDIT_LOGS_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch (_) {}

  try {
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(SEED_AUDIT_LOGS))
  } catch (_) {}
  return SEED_AUDIT_LOGS
}

export function logAuditEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const newLog: AuditLogEntry = {
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  }

  if (typeof window !== 'undefined') {
    try {
      const existing = getAuditLogs()
      const updated = [newLog, ...existing].slice(0, MAX_LOCAL_LOGS)
      localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('physio-audit-log-created', { detail: newLog }))
    } catch (err) {
      console.error('Local audit log failed:', err)
    }

    // Non-blocking async push to Supabase API (server-side admin route)
    setTimeout(async () => {
      try {
        await fetch('/api/audit-logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newLog),
        })
      } catch (_) {}
    }, 50)
  }

  return newLog
}

export function exportAuditLogsToCSV(logs: AuditLogEntry[]): string {
  const headers = ['Log ID', 'Timestamp', 'Event Type', 'Category', 'Severity', 'Actor Name', 'Actor Email', 'Actor Role', 'Centre Name', 'Resource ID', 'Resource Name', 'Details']
  const rows = logs.map(l => [
    `"${l.id}"`,
    `"${l.timestamp}"`,
    `"${l.event_type}"`,
    `"${l.category}"`,
    `"${l.severity}"`,
    `"${l.actor_name}"`,
    `"${l.actor_email}"`,
    `"${l.actor_role}"`,
    `"${l.centre_name || ''}"`,
    `"${l.resource_id || ''}"`,
    `"${l.resource_name || ''}"`,
    `"${l.details.replace(/"/g, '""')}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  return csvContent
}
