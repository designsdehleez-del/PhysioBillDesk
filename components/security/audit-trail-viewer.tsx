'use client'

import React, { useState, useEffect } from 'react'
import { 
  ShieldCheck, Search, Download, Filter, FileText, CheckCircle2, 
  AlertTriangle, AlertCircle, Clock, User, Building2, Eye, RefreshCw, KeyRound
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { getAuditLogs, exportAuditLogsToCSV, type AuditLogEntry, type AuditCategory, type AuditSeverity } from '@/lib/audit-logger'

export function AuditTrailViewer() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL')

  const loadLogs = () => {
    setLogs(getAuditLogs())
  }

  useEffect(() => {
    loadLogs()
    const handleNewLog = () => loadLogs()
    window.addEventListener('physio-audit-log-created', handleNewLog)
    return () => window.removeEventListener('physio-audit-log-created', handleNewLog)
  }, [])

  const filteredLogs = logs.filter(l => {
    const matchesSearch = 
      search === '' ||
      l.details.toLowerCase().includes(search.toLowerCase()) ||
      l.actor_name.toLowerCase().includes(search.toLowerCase()) ||
      l.actor_email.toLowerCase().includes(search.toLowerCase()) ||
      l.event_type.toLowerCase().includes(search.toLowerCase()) ||
      (l.resource_id && l.resource_id.toLowerCase().includes(search.toLowerCase())) ||
      (l.resource_name && l.resource_name.toLowerCase().includes(search.toLowerCase()))

    const matchesCategory = selectedCategory === 'ALL' || l.category === selectedCategory
    const matchesSeverity = selectedSeverity === 'ALL' || l.severity === selectedSeverity

    return matchesSearch && matchesCategory && matchesSeverity
  })

  const handleExportCSV = () => {
    const csvData = exportAuditLogsToCSV(filteredLogs)
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `physionautics_audit_trail_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const todayLogs = logs.filter(l => {
    const logDate = new Date(l.timestamp).toDateString()
    const today = new Date().toDateString()
    return logDate === today
  })

  const securityLogs = logs.filter(l => l.category === 'SECURITY' || l.category === 'AUTH')
  const billingLogs = logs.filter(l => l.category === 'BILLING')

  const getSeverityBadge = (sev: AuditSeverity) => {
    switch (sev) {
      case 'CRITICAL':
        return <Badge className="bg-red-500/15 text-red-700 border-red-200 hover:bg-red-500/25 text-[10px]">CRITICAL</Badge>
      case 'WARN':
        return <Badge className="bg-amber-500/15 text-amber-700 border-amber-200 hover:bg-amber-500/25 text-[10px]">WARN</Badge>
      case 'INFO':
      default:
        return <Badge className="bg-blue-500/15 text-blue-700 border-blue-200 hover:bg-blue-500/25 text-[10px]">INFO</Badge>
    }
  }

  const getCategoryColor = (cat: AuditCategory) => {
    switch (cat) {
      case 'AUTH': return 'text-purple-600 bg-purple-50 border-purple-200'
      case 'PATIENT': return 'text-emerald-600 bg-emerald-50 border-emerald-200'
      case 'BILLING': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'SECURITY': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'STAFF': return 'text-indigo-600 bg-indigo-50 border-indigo-200'
      default: return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Audit Records</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{logs.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today's Operations</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{todayLogs.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Security & Lock Events</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{securityLogs.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <KeyRound className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-xs bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Billing & Tax Logs</p>
              <p className="text-2xl font-black text-slate-900 mt-1">{billingLogs.length}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Audit Trail Card */}
      <Card className="border shadow-xs bg-white">
        <CardHeader className="p-5 border-b bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              Statutory Clinical Audit Trail & Access Logs
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Tamper-evident logs of all patient record views, bill modifications, staff actions & security events (Indian DPDP Act 2023 & HIPAA compliance).
            </CardDescription>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="text-xs gap-1.5 border-slate-200 hover:bg-slate-100"
            >
              <Download className="w-3.5 h-3.5" /> Export Compliance CSV
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadLogs}
              className="text-xs gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="Search by patient name, invoice ID, staff member, or action details..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-9 text-xs bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="text-xs h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
              >
                <option value="ALL">All Categories</option>
                <option value="AUTH">Authentication</option>
                <option value="PATIENT">Patient Care</option>
                <option value="BILLING">Billing & Invoices</option>
                <option value="SECURITY">Security & Lock</option>
                <option value="STAFF">Staff & Logins</option>
                <option value="SYSTEM">System & Config</option>
              </select>

              <select
                value={selectedSeverity}
                onChange={e => setSelectedSeverity(e.target.value)}
                className="text-xs h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700"
              >
                <option value="ALL">All Severities</option>
                <option value="INFO">INFO Only</option>
                <option value="WARN">WARN Only</option>
                <option value="CRITICAL">CRITICAL Only</option>
              </select>
            </div>
          </div>

          {/* Table of Logs */}
          <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Actor & Centre</th>
                  <th className="py-2.5 px-3">Event Particulars</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-400">
                      No audit events match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap font-mono text-[11px]">
                        {new Date(log.timestamp).toLocaleString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {log.event_type}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(log.category)}`}>
                          {log.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getSeverityBadge(log.severity)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-medium text-slate-900">{log.actor_name}</div>
                        <div className="text-[10px] text-slate-400">{log.centre_name || log.actor_role}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700 max-w-md">
                        <div>{log.details}</div>
                        {(log.resource_id || log.resource_name) && (
                          <div className="text-[10px] text-indigo-600 font-mono mt-0.5">
                            Target: {log.resource_id} {log.resource_name ? `(${log.resource_name})` : ''}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
