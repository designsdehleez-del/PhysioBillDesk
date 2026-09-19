'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, Building2, Users, CheckCircle2, XCircle, Clock, 
  AlertCircle, Download, Check, Sparkles, Filter, Search, RotateCcw, 
  UserCheck, UserX, Stethoscope, UserPlus, Shield, ChevronRight, Edit3
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { createClient } from '@/lib/supabase/client'
import { 
  getCentres, getDoctors, getAttendance, saveAttendanceRecord, 
  markBulkAttendance, exportAttendanceToExcel, type AttendanceRecord 
} from '@/lib/data-store'
import type { Centre, Doctor, StaffUser } from '@/lib/supabase/types'

const DEFAULT_STAFF_MEMBERS: { id: string; name: string; role: 'admin' | 'centre_staff' | 'doctor'; centre_id: string; centre_name: string }[] = [
  { id: 'usr-admin-01', name: 'Super Administrator', role: 'admin', centre_id: 'c1111111-1111-1111-1111-111111111111', centre_name: 'All Centres (Global)' },
  { id: 'usr-centre1-01', name: 'New Friends Colony Reception', role: 'centre_staff', centre_id: 'c1111111-1111-1111-1111-111111111111', centre_name: 'New Friends Colony, New Delhi' },
  { id: 'doc-101', name: 'Dr. Sarah Jenkins', role: 'doctor', centre_id: 'c1111111-1111-1111-1111-111111111111', centre_name: 'New Friends Colony, New Delhi' },
  { id: 'doc-102', name: 'Dr. Rajesh Sharma', role: 'doctor', centre_id: 'c1111111-1111-1111-1111-111111111111', centre_name: 'New Friends Colony, New Delhi' },
  
  { id: 'usr-centre2-01', name: 'Vasant Vihar Reception', role: 'centre_staff', centre_id: 'c2222222-2222-2222-2222-222222222222', centre_name: 'Vasant Vihar, New Delhi' },
  { id: 'doc-201', name: 'Dr. Emily Watson', role: 'doctor', centre_id: 'c2222222-2222-2222-2222-222222222222', centre_name: 'Vasant Vihar, New Delhi' },
  { id: 'doc-202', name: 'Dr. Michael Chang', role: 'doctor', centre_id: 'c2222222-2222-2222-2222-222222222222', centre_name: 'Vasant Vihar, New Delhi' },

  { id: 'usr-centre3-01', name: 'Gurugram DLF Phase 1 Desk', role: 'centre_staff', centre_id: 'c3333333-3333-3333-3333-333333333333', centre_name: 'Gurugram – DLF Phase 1' },
  { id: 'doc-301', name: 'Dr. Priya Nair', role: 'doctor', centre_id: 'c3333333-3333-3333-3333-333333333333', centre_name: 'Gurugram – DLF Phase 1' },
  { id: 'doc-302', name: 'Dr. David Kim', role: 'doctor', centre_id: 'c3333333-3333-3333-3333-333333333333', centre_name: 'Gurugram – DLF Phase 1' },
]

export default function AttendancePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { profile } = useAuth()
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedCentre, setSelectedCentre] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<'all' | 'doctor' | 'centre_staff'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily')

  const [centres, setCentres] = useState<Centre[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [staffList, setStaffList] = useState(DEFAULT_STAFF_MEMBERS)
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [cData, docData, attData] = await Promise.all([
        getCentres(),
        getDoctors(),
        getAttendance(selectedDate),
      ])
      
      setCentres(cData)

      // Merge Doctors and Staff
      const localStaff = localStorage.getItem('physio_custom_staff_users')
      let combinedStaff = [...DEFAULT_STAFF_MEMBERS]

      if (localStaff) {
        try {
          const parsed = JSON.parse(localStaff)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped = parsed.map(s => ({
              id: s.id,
              name: s.full_name,
              role: s.role,
              centre_id: s.centre_id || 'c1111111-1111-1111-1111-111111111111',
              centre_name: s.centre_name || 'New Friends Colony, New Delhi',
            }))
            combinedStaff = [...mapped]
          }
        } catch (_) {}
      }

      // Ensure doc list is merged
      docData.forEach(d => {
        if (!combinedStaff.some(s => s.id === d.id)) {
          combinedStaff.push({
            id: d.id,
            name: d.name,
            role: 'doctor',
            centre_id: d.centre_id || 'c1111111-1111-1111-1111-111111111111',
            centre_name: cData.find(c => c.id === d.centre_id)?.name || 'New Friends Colony, New Delhi',
          })
        }
      })

      setStaffList(combinedStaff)
      setAttendanceRecords(attData)
    } catch (err) {
      console.error('Failed to load attendance data:', err)
    } finally {
      setLoading(false)
    }
  }, [selectedDate])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filtered Roster
  const filteredRoster = useMemo(() => {
    return staffList.filter(employee => {
      if (selectedCentre !== 'all' && employee.centre_id !== selectedCentre) return false
      if (roleFilter !== 'all' && employee.role !== roleFilter) return false
      if (searchQuery.trim()) {
        const lower = searchQuery.toLowerCase()
        const matches = employee.name.toLowerCase().includes(lower) || employee.centre_name.toLowerCase().includes(lower)
        if (!matches) return false
      }
      return true
    })
  }, [staffList, selectedCentre, roleFilter, searchQuery])

  // Map employee ID to attendance record
  const attendanceMap = useMemo(() => {
    const map = new Map<string, AttendanceRecord>()
    attendanceRecords.forEach(r => {
      map.set(r.staff_id, r)
    })
    return map
  }, [attendanceRecords])

  // Stats calculation
  const stats = useMemo(() => {
    let present = 0
    let absent = 0
    let late = 0
    let halfDay = 0
    let leave = 0

    filteredRoster.forEach(emp => {
      const rec = attendanceMap.get(emp.id)
      const status = rec?.status || 'Present' // Default to present if not marked
      if (status === 'Present') present++
      else if (status === 'Absent') absent++
      else if (status === 'Late') late++
      else if (status === 'Half-Day') halfDay++
      else if (status === 'On Leave') leave++
    })

    const total = filteredRoster.length
    const attendancePercentage = total > 0 ? Math.round(((present + late + halfDay * 0.5) / total) * 100) : 100

    return { present, absent, late, halfDay, leave, total, attendancePercentage }
  }, [filteredRoster, attendanceMap])

  // Update Status for single employee
  const handleStatusChange = async (
    employee: typeof DEFAULT_STAFF_MEMBERS[0], 
    newStatus: 'Present' | 'Absent' | 'Half-Day' | 'On Leave' | 'Late'
  ) => {
    const existing = attendanceMap.get(employee.id)
    const updated = await saveAttendanceRecord({
      ...existing,
      date: selectedDate,
      staff_id: employee.id,
      staff_name: employee.name,
      role: employee.role,
      centre_id: employee.centre_id,
      centre_name: employee.centre_name,
      status: newStatus,
      check_in_time: newStatus === 'Absent' || newStatus === 'On Leave' ? '—' : (existing?.check_in_time || '09:00 AM'),
      check_out_time: newStatus === 'Absent' || newStatus === 'On Leave' ? '—' : (existing?.check_out_time || '06:00 PM'),
    })

    setAttendanceRecords(prev => {
      const idx = prev.findIndex(r => r.staff_id === employee.id && r.date === selectedDate)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = updated
        return copy
      }
      return [updated, ...prev]
    })

    toast({ title: `Updated ${employee.name} status to ${newStatus}` })
  }

  // Update Time or Notes
  const handleFieldChange = async (employee: typeof DEFAULT_STAFF_MEMBERS[0], field: 'check_in_time' | 'check_out_time' | 'notes', value: string) => {
    const existing = attendanceMap.get(employee.id)
    const updated = await saveAttendanceRecord({
      ...existing,
      date: selectedDate,
      staff_id: employee.id,
      staff_name: employee.name,
      role: employee.role,
      centre_id: employee.centre_id,
      centre_name: employee.centre_name,
      status: existing?.status || 'Present',
      [field]: value,
    })

    setAttendanceRecords(prev => {
      const idx = prev.findIndex(r => r.staff_id === employee.id && r.date === selectedDate)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = updated
        return copy
      }
      return [updated, ...prev]
    })
  }

  // Fast "Mark All Present"
  const handleMarkAllPresent = async () => {
    const toSave: Partial<AttendanceRecord>[] = filteredRoster.map(emp => {
      const existing = attendanceMap.get(emp.id)
      return {
        ...existing,
        date: selectedDate,
        staff_id: emp.id,
        staff_name: emp.name,
        role: emp.role,
        centre_id: emp.centre_id,
        centre_name: emp.centre_name,
        status: 'Present',
        check_in_time: existing?.check_in_time || '09:00 AM',
        check_out_time: existing?.check_out_time || '06:00 PM',
      }
    })

    await markBulkAttendance(toSave)
    loadData()
    toast({ title: `Marked all ${filteredRoster.length} roster members as Present!` })
  }

  const handleExport = () => {
    const recordsToExport: AttendanceRecord[] = filteredRoster.map(emp => {
      const rec = attendanceMap.get(emp.id)
      return rec || {
        id: `att-export-${emp.id}`,
        date: selectedDate,
        staff_id: emp.id,
        staff_name: emp.name,
        role: emp.role,
        centre_id: emp.centre_id,
        centre_name: emp.centre_name,
        status: 'Present',
        check_in_time: '09:00 AM',
        check_out_time: '06:00 PM',
        notes: 'Default check-in',
        updated_at: new Date().toISOString(),
      }
    })

    exportAttendanceToExcel(recordsToExport)
    toast({ title: `Exported attendance register for ${recordsToExport.length} employees!` })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinic Attendance Register</h1>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold px-2 py-0.5">
              Clinic-Wise Roster
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Track daily attendance, shift check-ins, and leave logs for doctors & clinic staff.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={handleMarkAllPresent}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs gap-1.5"
          >
            <UserCheck className="w-4 h-4" /> Mark All Present
          </Button>
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="text-xs h-9 rounded-xl gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4 text-blue-600" /> Export Excel Register
          </Button>
        </div>
      </div>

      {/* Structured Filter Controls Bar */}
      <Card className="border-slate-200 shadow-2xs bg-white rounded-2xl overflow-visible relative z-20">
        <CardContent className="p-4 space-y-3">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            
            {/* Search Input */}
            <div className="relative md:col-span-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9 bg-slate-50 text-xs border-slate-200 rounded-xl h-10 focus-visible:ring-blue-600"
                placeholder="Search staff or doctor name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Clinic / Centre Dropdown */}
            <div className="md:col-span-3">
              <Select value={selectedCentre} onValueChange={(val: string | null) => setSelectedCentre(val || 'all')}>
                <SelectTrigger className="bg-slate-50 border-slate-200 text-xs h-10 rounded-xl">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <SelectValue placeholder="All Clinics / Centres" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">🏢 All Clinics & Centres</SelectItem>
                  {centres.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      📍 {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Input */}
            <div className="md:col-span-3">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-600" />
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="pl-9 bg-slate-50 text-xs border-slate-200 rounded-xl h-10 focus-visible:ring-blue-600 font-medium"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="md:col-span-2">
              <Select value={roleFilter} onValueChange={(val: any) => setRoleFilter(val)}>
                <SelectTrigger className="bg-slate-50 border-slate-200 text-xs h-10 rounded-xl">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">👥 All Roles</SelectItem>
                  <SelectItem value="doctor">🩺 Doctors Only</SelectItem>
                  <SelectItem value="centre_staff">📍 Clinic Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

        </CardContent>
      </Card>

      {/* 4 Attendance Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="border-slate-200/90 shadow-2xs rounded-2xl bg-white p-5 space-y-1.5 border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Present Today</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.present} <span className="text-xs text-slate-400 font-semibold">/ {stats.total} Staff</span></div>
          <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {stats.attendancePercentage}% Attendance Rate
          </div>
        </Card>

        <Card className="border-slate-200/90 shadow-2xs rounded-2xl bg-white p-5 space-y-1.5 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Late & Half-Day</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.late + stats.halfDay}</div>
          <div className="text-[11px] text-slate-500 font-medium">
            {stats.late} Late check-ins · {stats.halfDay} Half-day shifts
          </div>
        </Card>

        <Card className="border-slate-200/90 shadow-2xs rounded-2xl bg-white p-5 space-y-1.5 border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>On Leave</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.leave}</div>
          <div className="text-[11px] text-slate-500 font-medium">Approved personal/sick leave</div>
        </Card>

        <Card className="border-slate-200/90 shadow-2xs rounded-2xl bg-white p-5 space-y-1.5 border-l-4 border-l-red-500">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Absent</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.absent}</div>
          <div className="text-[11px] text-slate-500 font-medium">Unexcused / Absent today</div>
        </Card>

      </div>

      {/* Main Attendance Roster Table */}
      <Card className="border-slate-200/90 shadow-2xs rounded-2xl overflow-hidden bg-white">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <CardTitle className="text-base font-bold text-slate-900">Daily Attendance Roster ({selectedDate})</CardTitle>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing <span className="font-bold text-slate-900">{filteredRoster.length}</span> staff members
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredRoster.length === 0 ? (
            <div className="text-center py-16 text-slate-500 space-y-2">
              <Users className="h-10 w-10 text-slate-300 mx-auto" />
              <div className="text-sm font-semibold text-slate-700">No staff members found</div>
              <p className="text-xs text-slate-400">Try changing the clinic branch or search query.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/80">
                  <tr className="text-left font-bold text-slate-600">
                    <th className="px-4 py-3.5">Employee Name & Role</th>
                    <th className="px-4 py-3.5">Clinic Branch</th>
                    <th className="px-4 py-3.5">Attendance Status</th>
                    <th className="px-4 py-3.5">Check-In</th>
                    <th className="px-4 py-3.5">Check-Out</th>
                    <th className="px-4 py-3.5">Shift Notes / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRoster.map(emp => {
                    const rec = attendanceMap.get(emp.id)
                    const currentStatus = rec?.status || 'Present'
                    const checkIn = rec?.check_in_time || '09:00 AM'
                    const checkOut = rec?.check_out_time || '06:00 PM'
                    const notes = rec?.notes || ''

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Employee Info */}
                        <td className="px-4 py-3.5 space-y-1">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            {emp.name}
                          </div>
                          <div className="flex items-center gap-1.5">
                            {emp.role === 'doctor' ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border-none text-[9px] font-bold px-1.5 py-0">
                                🩺 DOCTOR
                              </Badge>
                            ) : emp.role === 'admin' ? (
                              <Badge className="bg-amber-100 text-amber-800 border-none text-[9px] font-bold px-1.5 py-0">
                                🛡️ ADMIN
                              </Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-800 border-none text-[9px] font-bold px-1.5 py-0">
                                📍 FRONT DESK
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Clinic Branch */}
                        <td className="px-4 py-3.5 text-slate-700">
                          <div className="font-medium truncate max-w-[200px]">
                            📍 {emp.centre_name.split(',')[0]}
                          </div>
                        </td>

                        {/* 5-Status Interactive Toggle Pills */}
                        <td className="px-4 py-3.5">
                          <div className="inline-flex p-0.5 bg-slate-100 rounded-xl border border-slate-200/90 gap-0.5">
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp, 'Present')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                currentStatus === 'Present' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp, 'Late')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                currentStatus === 'Late' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp, 'Half-Day')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                currentStatus === 'Half-Day' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Half-Day
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp, 'On Leave')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                currentStatus === 'On Leave' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Leave
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp, 'Absent')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                currentStatus === 'Absent' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Absent
                            </button>
                          </div>
                        </td>

                        {/* Check In Input */}
                        <td className="px-4 py-3.5">
                          <Input
                            value={checkIn}
                            onChange={e => handleFieldChange(emp, 'check_in_time', e.target.value)}
                            disabled={currentStatus === 'Absent' || currentStatus === 'On Leave'}
                            className="h-8 text-xs bg-slate-50 border-slate-200 rounded-lg w-24 font-mono text-center disabled:opacity-40"
                          />
                        </td>

                        {/* Check Out Input */}
                        <td className="px-4 py-3.5">
                          <Input
                            value={checkOut}
                            onChange={e => handleFieldChange(emp, 'check_out_time', e.target.value)}
                            disabled={currentStatus === 'Absent' || currentStatus === 'On Leave'}
                            className="h-8 text-xs bg-slate-50 border-slate-200 rounded-lg w-24 font-mono text-center disabled:opacity-40"
                          />
                        </td>

                        {/* Notes Input */}
                        <td className="px-4 py-3.5">
                          <Input
                            placeholder="Add shift log or reason..."
                            value={notes}
                            onChange={e => handleFieldChange(emp, 'notes', e.target.value)}
                            className="h-8 text-xs bg-slate-50 border-slate-200 rounded-lg min-w-[180px]"
                          />
                        </td>

                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
