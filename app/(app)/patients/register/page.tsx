'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { registerPatient } from '@/lib/data-store'
import { isValidPhone, isValidEmail } from '@/lib/utils'

interface FormData {
  full_name: string; age: string; gender: string; phone: string
  email: string; address: string; blood_group: string; medical_notes: string
}
interface Errors { [k: string]: string }

export default function RegisterPatientPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({ full_name: '', age: '', gender: '', phone: '', email: '', address: '', blood_group: '', medical_notes: '' })
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ uid: string; id: string } | null>(null)

  const set = (k: keyof FormData) => (v: string) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e: Errors = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 0 || Number(form.age) > 150) e.age = 'Age must be 0-150'
    if (!form.gender) e.gender = 'Gender is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    else if (!isValidPhone(form.phone)) e.phone = 'Enter a valid phone number (10-15 digits)'
    if (form.email && !isValidEmail(form.email)) e.email = 'Enter a valid email'
    setErrors(e); return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const res = await registerPatient({
        full_name: form.full_name.trim(),
        age: Number(form.age),
        gender: form.gender as 'Male' | 'Female' | 'Other',
        phone: form.phone.trim(),
        email: form.email || null,
        address: form.address || null,
        blood_group: (form.blood_group || null) as any,
        medical_notes: form.medical_notes || null,
      })
      setSuccess({ uid: res.uid, id: res.id })
    } catch (err: unknown) {
      setErrors({ _: err instanceof Error ? err.message : 'Registration failed' })
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="p-6 max-w-lg mx-auto mt-12 text-center">
      <div className="flex justify-center mb-4"><CheckCircle className="h-16 w-16 text-green-500" /></div>
      <h2 className="text-xl font-bold text-gray-900 mb-1">Patient Registered!</h2>
      <p className="text-muted-foreground text-sm mb-4">Patient ID: <span className="font-mono font-semibold text-blue-600 text-base">{success.uid}</span></p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={() => router.push(`/billing?patientId=${success.id}`)}>Create Bill</Button>
        <Button variant="outline" onClick={() => { setSuccess(null); setForm({ full_name: '', age: '', gender: '', phone: '', email: '', address: '', blood_group: '', medical_notes: '' }) }}>Register Another</Button>
        <Button variant="ghost" onClick={() => router.push('/patients')}>View Patient List</Button>
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Register New Patient</h1>
      <Card>
        <CardHeader><CardTitle className="text-base">Patient Information</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {errors._ && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{errors._}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input id="full_name" value={form.full_name} onChange={e => set('full_name')(e.target.value)} placeholder="Patient full name" />
                {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="age">Age *</Label>
                <Input id="age" type="number" value={form.age} onChange={e => set('age')(e.target.value)} placeholder="Age" min={0} max={150} />
                {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
              </div>
              <div className="space-y-1">
                <Label>Gender *</Label>
                <Select value={form.gender} onValueChange={(v: string | null) => set('gender')(v ?? '')}>
                  <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone *</Label>
                <Input id="phone" value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="10-15 digit number" />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={e => set('email')(e.target.value)} placeholder="Optional" />
                {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-1">
                <Label>Blood Group</Label>
                <Select value={form.blood_group} onValueChange={(v: string | null) => set('blood_group')(v ?? '')}>
                  <SelectTrigger><SelectValue placeholder="Select blood group" /></SelectTrigger>
                  <SelectContent>
                    {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={form.address} onChange={e => set('address')(e.target.value)} placeholder="Optional" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label htmlFor="medical_notes">Medical Notes</Label>
                <Textarea id="medical_notes" value={form.medical_notes} onChange={e => set('medical_notes')(e.target.value)} placeholder="Any relevant medical history..." rows={3} />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Register Patient
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
