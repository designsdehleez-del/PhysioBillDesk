'use client'
import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, KeyRound, Building2, ShieldAlert, Users, Search, CheckCircle2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import type { Centre, StaffUser } from '@/lib/supabase/types'

const DEFAULT_STAFF: StaffUser[] = [
  {
    id: 'usr-admin-01',
    full_name: 'Super Administrator',
    email: 'admin@physionautics.com',
    password: 'admin',
    centre_id: null,
    centre_name: 'All Centres (Global)',
    role: 'admin',
    is_active: true,
  },
  {
    id: 'usr-centre1-01',
    full_name: 'Downtown Reception',
    email: 'centre1@physionautics.com',
    password: 'centre123',
    centre_id: 'c1111111-1111-1111-1111-111111111111',
    centre_name: 'Downtown Clinic (Centre 1)',
    role: 'centre_staff',
    is_active: true,
  },
  {
    id: 'usr-centre2-01',
    full_name: 'Westside Front Desk',
    email: 'centre2@physionautics.com',
    password: 'centre123',
    centre_id: 'c2222222-2222-2222-2222-222222222222',
    centre_name: 'Westside Rehab (Centre 2)',
    role: 'centre_staff',
    is_active: true,
  },
  {
    id: 'usr-centre3-01',
    full_name: 'East Care Billing Desk',
    email: 'centre3@physionautics.com',
    password: 'centre123',
    centre_id: 'c3333333-3333-3333-3333-333333333333',
    centre_name: 'East Care Centre (Centre 3)',
    role: 'centre_staff',
    is_active: true,
  },
]

export default function StaffManagementPage() {
  const { toast } = useToast()
  const [staffList, setStaffList] = useState<StaffUser[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Form State
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [centreId, setCentreId] = useState<string>('')
  const [role, setRole] = useState<'admin' | 'centre_staff'>('centre_staff')
  const [saving, setSaving] = useState(false)

  const loadData = async () => {
    setLoading(true)
    const supabase = createClient()
    const [{ data: cData }, { data: sData }] = await Promise.all([
      supabase.from('centres').select('*').order('name'),
      supabase.from('staff_users').select('*').order('created_at'),
    ])

    const centreList = (cData as unknown as Centre[]) ?? []
    setCentres(centreList)

    // Load from local storage or fallback to defaults
    const localSaved = localStorage.getItem('physio_custom_staff_users')
    let currentStaff: StaffUser[] = DEFAULT_STAFF

    if (localSaved) {
      try {
        currentStaff = JSON.parse(localSaved)
      } catch (_) {}
    }

    if (sData && sData.length > 0) {
      currentStaff = sData as unknown as StaffUser[]
    }

    setStaffList(currentStaff)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const saveStaffList = async (updated: StaffUser[]) => {
    setStaffList(updated)
    localStorage.setItem('physio_custom_staff_users', JSON.stringify(updated))
    try {
      const supabase = createClient()
      if (editingStaff) {
        await supabase.from('staff_users').update({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          centre_id: role === 'admin' ? null : centreId || null,
          centre_name: centres.find(c => c.id === centreId)?.name || null,
          role,
        }).eq('id', editingStaff.id)
      } else {
        await supabase.from('staff_users').insert({
          full_name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          centre_id: role === 'admin' ? null : centreId || null,
          centre_name: centres.find(c => c.id === centreId)?.name || null,
          role,
          is_active: true,
        })
      }
    } catch (_) {}
  }

  const handleOpenAdd = () => {
    setEditingStaff(null)
    setFullName('')
    setEmail('')
    setPassword('')
    setCentreId(centres[0]?.id || '')
    setRole('centre_staff')
    setDialogOpen(true)
  }

  const handleOpenEdit = (staff: StaffUser) => {
    setEditingStaff(staff)
    setFullName(staff.full_name)
    setEmail(staff.email)
    setPassword(staff.password || '')
    setCentreId(staff.centre_id || centres[0]?.id || '')
    setRole(staff.role)
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' })
      return
    }

    setSaving(true)
    const selectedCentre = centres.find(c => c.id === centreId)
    const centreName = role === 'admin' ? 'All Centres (Global)' : (selectedCentre?.name || 'Clinic Branch')

    if (editingStaff) {
      const updated = staffList.map(s => s.id === editingStaff.id ? {
        ...s,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        centre_id: role === 'admin' ? null : (centreId || null),
        centre_name: centreName,
        role,
      } : s)
      await saveStaffList(updated)
      toast({ title: 'Staff login updated successfully' })
    } else {
      const newStaff: StaffUser = {
        id: `usr-custom-${Date.now()}`,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        centre_id: role === 'admin' ? null : (centreId || null),
        centre_name: centreName,
        role,
        is_active: true,
      }
      await saveStaffList([...staffList, newStaff])
      toast({ title: 'New clinic staff login created' })
    }

    setSaving(false)
    setDialogOpen(false)
  }

  const handleToggleActive = (staff: StaffUser) => {
    const updated = staffList.map(s => s.id === staff.id ? { ...s, is_active: !s.is_active } : s)
    saveStaffList(updated)
    toast({ title: `Login for ${staff.full_name} ${!staff.is_active ? 'enabled' : 'disabled'}` })
  }

  const handleDelete = () => {
    if (!deleteId) return
    const updated = staffList.filter(s => s.id !== deleteId)
    saveStaffList(updated)
    toast({ title: 'Staff login removed', variant: 'destructive' })
    setDeleteId(null)
  }

  const filteredStaff = staffList.filter(s => 
    s.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.centre_name && s.centre_name.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-purple-50/60 border border-purple-200 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-600 text-white">👑 Admin Security Console</Badge>
            <span className="text-xs text-purple-900 font-semibold">User & Clinic Login Access</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Staff & Clinic-Wise Logins</h1>
          <p className="text-xs text-muted-foreground">Create custom clinic staff accounts, assign centres, and manage passwords</p>
        </div>
        <Button onClick={handleOpenAdd} className="bg-purple-600 hover:bg-purple-700 text-white gap-2">
          <Plus className="h-4 w-4" /> Add Clinic Staff Login
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9 bg-white"
          placeholder="Search by staff name, login email, or assigned centre..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600" />
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm">No staff accounts found.</p>
              <Button className="mt-3" size="sm" onClick={handleOpenAdd}>Create First Staff Login</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr className="text-left text-xs font-semibold text-muted-foreground">
                    <th className="px-4 py-3">Staff Name</th>
                    <th className="px-4 py-3">Login Email</th>
                    <th className="px-4 py-3">Assigned Centre</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Password</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredStaff.map(staff => (
                    <tr key={staff.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-4 py-3 font-semibold text-gray-900 flex items-center gap-2">
                        {staff.role === 'admin' ? <ShieldAlert className="h-4 w-4 text-purple-600" /> : <Building2 className="h-4 w-4 text-blue-600" />}
                        {staff.full_name}
                      </td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">{staff.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={staff.role === 'admin' ? 'border-purple-200 text-purple-700 bg-purple-50' : 'border-blue-200 text-blue-700 bg-blue-50'}>
                          {staff.centre_name || 'Downtown Clinic (Centre 1)'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={staff.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-800'}>
                          {staff.role === 'admin' ? 'Admin' : 'Centre Staff'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                        {staff.password ? `•••••• (${staff.password})` : 'Encrypted'}
                      </td>
                      <td className="px-4 py-3">
                        <Switch checked={staff.is_active} onCheckedChange={() => handleToggleActive(staff)} />
                      </td>
                      <td className="px-4 py-3 text-right space-x-1">
                        <Button size="sm" variant="ghost" onClick={() => handleOpenEdit(staff)} title="Edit & Reset Password">
                          <Pencil className="h-4 w-4 text-gray-600" />
                        </Button>
                        {staff.email !== 'admin@physionautics.com' && (
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setDeleteId(staff.id)} title="Delete Login">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add / Edit Staff Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingStaff ? 'Edit Staff Login & Password' : 'Create New Clinic Login'}</DialogTitle>
            <DialogDescription className="text-xs">
              Configure credentials and assign the clinic branch.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1">
              <Label>Full Name *</Label>
              <Input placeholder="e.g. Priya Sharma (Reception)" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label>Login Email *</Label>
              <Input type="email" placeholder="e.g. staff.downtown@physionautics.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="space-y-1">
              <Label>Password *</Label>
              <div className="relative">
                <Input placeholder="Assign login password (e.g. Pass@123)" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
              <p className="text-[11px] text-muted-foreground">Staff member will use this password to sign into their clinic.</p>
            </div>

            <div className="space-y-1">
              <Label>Role *</Label>
              <Select value={role} onValueChange={(v: string | null) => setRole((v as 'admin' | 'centre_staff') || 'centre_staff')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="centre_staff">Centre Staff (Clinical Desk & Billing)</SelectItem>
                  <SelectItem value="admin">Admin (Financials & Governance)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {role === 'centre_staff' && (
              <div className="space-y-1">
                <Label>Assigned Clinic Centre *</Label>
                <Select value={centreId} onValueChange={(v: string | null) => setCentreId(v ?? '')}>
                  <SelectTrigger><SelectValue placeholder="Select Clinic Branch" /></SelectTrigger>
                  <SelectContent>
                    {centres.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">When this staff logs in, their billing and doctor list will automatically lock to this clinic.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : editingStaff ? 'Update Login' : 'Create Staff Login'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Staff Account?</AlertDialogTitle>
            <AlertDialogDescription>
              This staff member will no longer be able to log in. You can also temporarily disable the account instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}