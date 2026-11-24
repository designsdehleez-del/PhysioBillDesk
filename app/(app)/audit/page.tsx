'use client'

import { useState, useEffect } from 'react'
import { ShieldCheck, ShieldAlert, Download, RefreshCw, Search, Filter, Calendar, User, Clock, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type AuditLogEntry, exportAuditLogsToCSV, getAuditLogs } from '@/lib/audit-logger'
import { useAuth } from '@/contexts/auth-context'

export default function AuditLogsPage() {
  const { profile } = useAuth()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('ALL')
  const [severityFilter, setSeverityFilter] = useState('ALL')

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/audit-logs?limit=300')
      const json = await res.json()
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        setLogs(json.data)
      } else {
        // Fallback to local logs
        setLogs(getAuditLogs())
      }
    } catch (err) {
      console.warn('Failed to fetch from /api/audit-logs, using local cache:', err)
      setLogs(getAuditLogs())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      (log.details || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.actor_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.actor_email || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.event_type || '').toLowerCase().includes(search.toLowerCase()) ||
      (log.centre_name || '').toLowerCase().includes(search.toLowerCase())

    const matchesCategory = categoryFilter === 'ALL' || log.category === categoryFilter
    const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter

    return matchesSearch && matchesCategory && matchesSeverity
  })

  const handleExportCSV = () => {
    const csv = exportAuditLogsToCSV(filteredLogs)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `physionautics-audit-trail-${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return <Badge className="bg-red-600 text-white hover:bg-red-700">CRITICAL</Badge>
      case 'WARN':
        return <Badge className="bg-amber-500 text-white hover:bg-amber-600">WARN</Badge>
      default:
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">INFO</Badge>
    }
  }

  const getCategoryBadge = (cat: string) => {
    switch (cat) {
      case 'AUTH':
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-700">AUTH</span>
      case 'BILLING':
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">BILLING</span>
      case 'PATIENT':
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-sky-100 text-sky-700">PATIENT</span>
      case 'SECURITY':
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-rose-100 text-rose-700">SECURITY</span>
      case 'STAFF':
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-100 text-indigo-700">STAFF</span>
      default:
        return <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">{cat}</span>
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Clinical Audit Trail & Security Logs</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time immutable log of clinical activities, patient record modifications, logins, and billing transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="default" size="sm" onClick={handleExportCSV} disabled={filteredLogs.length === 0} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by actor, email, action, patient or clinic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div>
              <Select value={categoryFilter} onValueChange={(val) => setCategoryFilter(val || 'ALL')}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value="AUTH">Authentication (AUTH)</SelectItem>
                  <SelectItem value="BILLING">Billing & Invoices</SelectItem>
                  <SelectItem value="PATIENT">Patient Records</SelectItem>
                  <SelectItem value="SECURITY">Security Events</SelectItem>
                  <SelectItem value="STAFF">Staff Management</SelectItem>
                  <SelectItem value="SYSTEM">System Operations</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={severityFilter} onValueChange={(val) => setSeverityFilter(val || 'ALL')}>
                <SelectTrigger>
                  <SelectValue placeholder="All Severities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Severities</SelectItem>
                  <SelectItem value="INFO">INFO</SelectItem>
                  <SelectItem value="WARN">WARN</SelectItem>
                  <SelectItem value="CRITICAL">CRITICAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-base font-semibold">Activity Records ({filteredLogs.length})</CardTitle>
              <CardDescription>Records stored securely in PostgreSQL Supabase with cloud audit compliance.</CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              Live Cloud Sync: Enabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-600" />
              <p className="text-sm">Fetching verified audit logs from Supabase...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <ShieldAlert className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium">No matching audit logs found.</p>
              <p className="text-xs text-slate-400 mt-1">Try clearing filters or checking other categories.</p>
            </div>
          ) : (
            <div className="divide-y overflow-x-auto">
              {filteredLogs.map((log) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 text-sm">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-0.5">{getSeverityBadge(log.severity)}</div>
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {getCategoryBadge(log.category)}
                        <span className="font-mono text-xs text-slate-500">{log.event_type}</span>
                        {log.centre_name && (
                          <span className="text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            📍 {log.centre_name}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-900 font-medium leading-relaxed break-words">{log.details}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          <strong className="text-slate-700">{log.actor_name}</strong> ({log.actor_email})
                        </span>
                        <span>•</span>
                        <span className="capitalize text-slate-600">Role: {log.actor_role}</span>
                        {log.resource_id && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-slate-600">Ref: {log.resource_id}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400 whitespace-nowrap self-start md:self-center flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(log.timestamp).toLocaleString('en-IN', {
                      timeZone: 'Asia/Kolkata',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
