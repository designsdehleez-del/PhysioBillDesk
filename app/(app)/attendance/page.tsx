'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, Building2, Users, CheckCircle2, XCircle, Clock, 
  AlertCircle, Download, Check, Sparkles, Filter, Search, RotateCcw, 
  UserCheck, UserX, Stethoscope, UserPlus, Shield, ChevronRight, Edit3,
  FileSpreadsheet, Lock
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { 
  getCentres, getDoctors, getAttendance, saveAttendanceRecord, 
  markBulkAttendance, exportAttendanceToExcel, exportMonthlyPersonAttendanceToExcel, 
  type AttendanceRecord 
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

  const isAdmin = profile?.role === 'admin'
  const userCentreId = profile?.centreId || 'c1111111-1111-1111-1111-111111111111'
  const userCentreName = profile?.centreName || 'New Friends Colony, New Delhi'
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [selectedCentre, setSelectedCentre] = useState<string>(isAdmin ? 'all' : userCentreId)
  const [roleFilter, setRoleFilter] = useState<'all' | 'doctor' | 'centre_staff'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Export Modal Dialog State
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportMonth, setExportMonth] = useState<string>(() => new Date().toISOString().slice(0, 7))
  const [exportStaffId, setExportStaffId] = useState<string>('all')

  const [centres, setCentres] = useState<Centre[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [staffList, setStaffList] = useState(DEFAULT_STAFF_MEMBERS)
  const [loading, setLoading] = useState(true)

  // Synchronize clinic selection based on user role
  useEffect(() => {
    if (!isAdmin && profile?.centreId) {
      setSelectedCentre(profile.centreId)
    }
  }, [isAdmin, profile])

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

  // Clinic-Scoped Filtered Roster
  const filteredRoster = useMemo(() => {
    return staffList.filter(employee => {
      // Clinic Scoping Rule:
      // If non-admin clinic login, ONLY show staff members tagged to this clinic branch!
      if (!isAdmin) {
        const isMatch = employee.centre_id === userCentreId || employee.centre_name.toLowerCase().includes(userCentreName.toLowerCase().split(',')[0])
        if (!isMatch) return false
      } else {
        // Admin login: filter by selectedCentre if not 'all'
        if (selectedCentre !== 'all' && employee.centre_id !== selectedCentre) return false
      }

      if (roleFilter !== 'all' && employee.role !== roleFilter) return false
      if (searchQuery.trim()) {
        const lower = searchQuery.toLowerCase()
        const matches = employee.name.toLowerCase().includes(lower) || employee.centre_name.toLowerCase().includes(lower)
        if (!matches) return false
      }
      return true
    })
  }, [staffList, selectedCentre, roleFilter, searchQuery, isAdmin, userCentreId, userCentreName])

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

  const handleExportToday = () => {
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
    toast({ title: `Exported daily attendance register for ${recordsToExport.length} staff!` })
  }

  const handleDownloadMonthlyReport = () => {
    exportMonthlyPersonAttendanceToExcel({
      month: exportMonth,
      staffId: exportStaffId,
      centreId: isAdmin ? selectedCentre : userCentreId,
      staffList: filteredRoster,
    })
    toast({ 
      title: "Monthly Attendance Report Generated!",
      description: `Downloaded report for ${exportMonth} (${exportStaffId === 'all' ? 'All Staff Members' : 'Selected Employee'})` 
    })
    setExportModalOpen(false)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinic Attendance Register</h1>
            {isAdmin ? (
              <Badge className="bg-amber-100 text-amber-800 border-amber-300 text-xs font-bold px-2 py-0.5 gap-1">
                <Shield className="w-3 h-3 text-amber-600" /> Master Admin Access
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs font-bold px-2 py-0.5 gap-1">
                <Building2 className="w-3 h-3 text-blue-600" /> {userCentreName.split(',')[0]} Branch Roster
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin ? (
              'Global roster overview & attendance management across all clinic branches.'
            ) : (
              `Shift check-ins and leave tracking scoped exclusively to ${userCentreName.split(',')[0]}.`
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button 
            onClick={() => setExportModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" /> Download Monthly Report
          </Button>

          <Button 
            onClick={handleMarkAllPresent}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-3.5 rounded-xl shadow-xs gap-1.5"
          >
            <UserCheck className="w-4 h-4" /> Mark All Present
          </Button>

          <Button 
            variant="outline" 
            onClick={handleExportToday}
            className="text-xs h-9 rounded-xl gap-1.5 border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            <Download className="w-4 h-4 text-slate-600" /> Export Today's Register
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

            {/* Clinic / Centre Dropdown (Admin vs Scoped Clinic Staff) */}
            <div className="md:col-span-3">
              {isAdmin ? (
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
              ) : (
                <div className="flex items-center justify-between px-3 h-10 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs font-bold text-blue-900">
                  <div className="flex items-center gap-2 truncate">
                    <Building2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span className="truncate">📍 {userCentreName.split(',')[0]}</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-200 text-blue-800 text-[9px] font-extrabold px-1.5 py-0 shrink-0">
                    SCOPED
                  </Badge>
                </div>
              )}
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
              <p className="text-xs text-slate-400">
                {isAdmin ? 'Try changing the clinic branch or search query.' : `No staff members tagged to ${userCentreName.split(',')[0]}.`}
              </p>
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
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                currentStatus === 'Present' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Present
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp, 'Late')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                currentStatus === 'Late' ? 'bg-amber-500 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Late
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp, 'Half-Day')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                currentStatus === 'Half-Day' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Half-Day
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp, 'On Leave')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                                currentStatus === 'On Leave' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                              }`}
                            >
                              Leave
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusChange(emp, 'Absent')}
                              className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
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

      {/* Month-Wise & Person-Wise Attendance Report Dialog */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-slate-200 shadow-xl rounded-2xl p-6 space-y-4">
          <DialogHeader className="space-y-1.5 text-left">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-slate-900">
                  Export Monthly Attendance Report
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  Download a person-wise and day-by-day attendance log in Excel (.xlsx) format.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            
            {/* 1. Month Picker */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Select Month</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                <Input
                  type="month"
                  value={exportMonth}
                  onChange={e => setExportMonth(e.target.value)}
                  className="pl-9 bg-slate-50 border-slate-200 text-xs h-10 rounded-xl font-medium"
                />
              </div>
            </div>

            {/* 2. Staff / Person Selector */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Select Employee / Person</Label>
              <Select value={exportStaffId} onValueChange={(val: string | null) => setExportStaffId(val || 'all')}>
                <SelectTrigger className="bg-slate-50 border-slate-200 text-xs h-10 rounded-xl">
                  <SelectValue placeholder="All Roster Staff" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">👥 All Roster Staff ({filteredRoster.length} Members)</SelectItem>
                  {filteredRoster.map(staff => (
                    <SelectItem key={staff.id} value={staff.id}>
                      {staff.role === 'doctor' ? '🩺' : staff.role === 'admin' ? '🛡️' : '📍'} {staff.name} ({staff.centre_name.split(',')[0]})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 3. Branch Scope Information */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs space-y-1">
              <div className="font-bold text-slate-700 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Clinic Scope:</span>
                <span className="text-blue-700 font-extrabold">
                  {isAdmin ? (selectedCentre === 'all' ? 'All Clinic Branches (Global)' : centres.find(c => c.id === selectedCentre)?.name) : userCentreName.split(',')[0]}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                The Excel file will contain 2 sheets: <span className="font-bold text-slate-700">Monthly Person Summary</span> and <span className="font-bold text-slate-700">Daily Attendance Logs</span>.
              </p>
            </div>

          </div>

          <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setExportModalOpen(false)}
              className="text-xs h-10 rounded-xl px-4 border-slate-200 text-slate-700"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDownloadMonthlyReport}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-4 rounded-xl gap-2 shadow-xs"
            >
              <Download className="w-4 h-4" /> Download Excel Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
