'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle, Stethoscope, Activity, CreditCard, UserPlus, Users, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { registerPatient, getDoctors, getPhysiotherapists } from '@/lib/data-store'
import type { Doctor, Physiotherapist } from '@/lib/supabase/types'
import { isValidPhone, isValidEmail } from '@/lib/utils'

interface FormData {
  full_name: string
  age: string
  gender: string
  phone: string
  email: string
  address: string
  blood_group: string
  primary_doctor_id: string
  physiotherapist_id: string
  emergency_contact_name: string
  emergency_contact_phone: string
  referral_source: string
  referral_doctor_name: string
  referral_clinic_name: string
  referral_contact: string
  initial_complaint: string
}

interface Errors { [k: string]: string }

export default function RegisterPatientPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>({ 
    full_name: '', age: '', gender: '', phone: '', email: '', address: '', blood_group: '',
    primary_doctor_id: '', physiotherapist_id: '',
    emergency_contact_name: '', emergency_contact_phone: '',
    referral_source: 'Self', referral_doctor_name: '', referral_clinic_name: '', referral_contact: '',
    initial_complaint: ''
  })
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [physiotherapists, setPhysiotherapists] = useState<Physiotherapist[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState<{ uid: string; id: string } | null>(null)

  useEffect(() => {
    async function loadCareTeam() {
      try {
        const [docs, pts] = await Promise.all([getDoctors(), getPhysiotherapists()])
        setDoctors(docs.filter(d => d.is_active !== false))
        setPhysiotherapists(pts.filter(p => p.is_active !== false))
      } catch (err) {
        console.error('Failed to load care team:', err)
      }
    }
    loadCareTeam()
  }, [])

  const set = (k: keyof FormData) => (v: string) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e: Errors = {}
    if (!form.full_name.trim()) e.full_name = 'Full name is required'
    if (!form.age || isNaN(Number(form.age)) || Number(form.age) < 0 || Number(form.age) > 150) e.age = 'Age must be 0-150'
    if (!form.gender) e.gender = 'Gender is required'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    else if (!isValidPhone(form.phone)) e.phone = 'Enter a valid phone number'
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
        primary_doctor_id: form.primary_doctor_id || null,
        physiotherapist_id: form.physiotherapist_id || null,
        referral_source: (form.referral_source || 'Self') as any,
        referral_doctor_name: form.referral_doctor_name || null,
        referral_clinic_name: form.referral_clinic_name || null,
        referral_contact: form.referral_contact || null,
        emergency_contact_name: form.emergency_contact_name || null,
        emergency_contact_phone: form.emergency_contact_phone || null,
        initial_complaint: form.initial_complaint || null,
      })
      setSuccess({ uid: res.uid, id: res.id })
    } catch (err: unknown) {
      setErrors({ _: err instanceof Error ? err.message : 'Registration failed' })
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="p-6 max-w-xl mx-auto mt-8">
      <Card className="border-emerald-200 bg-gradient-to-b from-emerald-50/40 to-white shadow-lg rounded-3xl p-6 text-center space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle className="h-10 w-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">Patient Successfully Registered!</h2>
          <p className="text-sm text-slate-600 mt-1">
            Patient UID: <span className="font-mono font-bold text-blue-600 text-base">{success.uid}</span>
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Choose Next Action Step:</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button 
              onClick={() => router.push(`/patients/${success.id}/assessment?type=physiotherapy`)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 rounded-xl shadow-xs gap-2"
            >
              <Stethoscope className="w-4 h-4" /> Start Physio Assessment
            </Button>

            <Button 
              onClick={() => router.push(`/patients/${success.id}/assessment?type=neurotherapy`)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-11 rounded-xl shadow-xs gap-2"
            >
              <Activity className="w-4 h-4" /> Start Neuro Assessment
            </Button>
          </div>

          <Button 
            onClick={() => router.push(`/billing?patientId=${success.id}`)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-11 rounded-xl shadow-xs gap-2"
          >
            <CreditCard className="w-4 h-4" /> Skip Assessment & Create Bill Directly <ArrowRight className="w-4 h-4" />
          </Button>

          <div className="flex justify-center gap-4 pt-2">
            <button 
              onClick={() => {
                setSuccess(null)
                setForm({
                  full_name: '', age: '', gender: '', phone: '', email: '', address: '', blood_group: '',
                  primary_doctor_id: '', physiotherapist_id: '',
                  emergency_contact_name: '', emergency_contact_phone: '',
                  referral_source: 'Self', referral_doctor_name: '', referral_clinic_name: '', referral_contact: '',
                  initial_complaint: ''
                })
              }} 
              className="text-xs text-blue-600 hover:underline font-bold"
            >
              + Register Another Patient
            </button>
            <button onClick={() => router.push('/patients')} className="text-xs text-slate-500 hover:underline">
              View Patient List
            </button>
          </div>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">New Patient Registration</h1>
        <p className="text-xs text-slate-500">Fast onboarding: patient demographics & referral channel</p>
      </div>

      <Card className="border-slate-200 shadow-sm rounded-2xl bg-white">
        <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-blue-600" />
            Patient Information & Referral Record
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors._ && <div className="rounded-xl bg-destructive/10 p-3 text-xs font-semibold text-destructive">{errors._}</div>}

            {/* Demographics */}
            <div className="space-y-3">
              <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">1. Patient Demographics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="full_name" className="text-xs font-bold text-slate-700">Full Name *</Label>
                  <Input id="full_name" value={form.full_name} onChange={e => set('full_name')(e.target.value)} placeholder="e.g. Rajesh Kumar" className="h-10 text-xs rounded-xl" />
                  {errors.full_name && <p className="text-xs text-destructive">{errors.full_name}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="age" className="text-xs font-bold text-slate-700">Age *</Label>
                  <Input id="age" type="number" value={form.age} onChange={e => set('age')(e.target.value)} placeholder="e.g. 42" min={0} max={150} className="h-10 text-xs rounded-xl" />
                  {errors.age && <p className="text-xs text-destructive">{errors.age}</p>}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Gender *</Label>
                  <Select value={form.gender} onValueChange={(v: string | null) => set('gender')(v ?? '')}>
                    <SelectTrigger className="h-10 text-xs rounded-xl"><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.gender && <p className="text-xs text-destructive">{errors.gender}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs font-bold text-slate-700">Phone Number *</Label>
                  <Input id="phone" value={form.phone} onChange={e => set('phone')(e.target.value)} placeholder="10-15 digit mobile number" className="h-10 text-xs rounded-xl" />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-bold text-slate-700">Email Address</Label>
                  <Input id="email" type="email" value={form.email} onChange={e => set('email')(e.target.value)} placeholder="Optional" className="h-10 text-xs rounded-xl" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="emergency_contact_name" className="text-xs font-bold text-slate-700">Emergency Contact Name</Label>
                  <Input id="emergency_contact_name" value={form.emergency_contact_name} onChange={e => set('emergency_contact_name')(e.target.value)} placeholder="Relative / Guardian Name" className="h-10 text-xs rounded-xl" />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="emergency_contact_phone" className="text-xs font-bold text-slate-700">Emergency Contact Phone</Label>
                  <Input id="emergency_contact_phone" value={form.emergency_contact_phone} onChange={e => set('emergency_contact_phone')(e.target.value)} placeholder="Contact Phone Number" className="h-10 text-xs rounded-xl" />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="address" className="text-xs font-bold text-slate-700">Address / City</Label>
                  <Input id="address" value={form.address} onChange={e => set('address')(e.target.value)} placeholder="Full street address or area" className="h-10 text-xs rounded-xl" />
                </div>
              </div>
            </div>

            {/* Referral Information */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">2. Referral Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Referred By</Label>
                  <Select value={form.referral_source} onValueChange={(v: string | null) => set('referral_source')(v ?? 'Self')}>
                    <SelectTrigger className="h-10 text-xs rounded-xl"><SelectValue placeholder="Select referral source" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Self">Self / Walk-in</SelectItem>
                      <SelectItem value="Doctor">Doctor Referral</SelectItem>
                      <SelectItem value="Patient/Friend">Patient / Friend Recommendation</SelectItem>
                      <SelectItem value="Other">Other Channel / Social Media</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(form.referral_source === 'Doctor' || form.referral_source === 'Other') && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="referral_doctor_name" className="text-xs font-bold text-slate-700">Referring Doctor's Name</Label>
                      <Input id="referral_doctor_name" value={form.referral_doctor_name} onChange={e => set('referral_doctor_name')(e.target.value)} placeholder="e.g. Dr. A. K. Gupta" className="h-10 text-xs rounded-xl" />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="referral_clinic_name" className="text-xs font-bold text-slate-700">Clinic / Hospital Name</Label>
                      <Input id="referral_clinic_name" value={form.referral_clinic_name} onChange={e => set('referral_clinic_name')(e.target.value)} placeholder="e.g. Fortis / Max Hospital" className="h-10 text-xs rounded-xl" />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="referral_contact" className="text-xs font-bold text-slate-700">Doctor Contact Number</Label>
                      <Input id="referral_contact" value={form.referral_contact} onChange={e => set('referral_contact')(e.target.value)} placeholder="Optional contact phone" className="h-10 text-xs rounded-xl" />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Care Team Assignment & Initial Complaint */}
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">3. Primary Concern & Care Team</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="initial_complaint" className="text-xs font-bold text-slate-700">Main Complaint / Discomfort (One Line)</Label>
                  <Input id="initial_complaint" value={form.initial_complaint} onChange={e => set('initial_complaint')(e.target.value)} placeholder="e.g. Lower Back Pain, Frozen Shoulder, Post-ACL Rehab..." className="h-10 text-xs rounded-xl" />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Primary Consulting Doctor</Label>
                  <Select value={form.primary_doctor_id} onValueChange={(v: string | null) => set('primary_doctor_id')(v === 'none' ? '' : (v ?? ''))}>
                    <SelectTrigger className="h-10 text-xs rounded-xl"><SelectValue placeholder="Select doctor" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None / Unassigned</SelectItem>
                      {doctors.map(d => (
                        <SelectItem key={d.id} value={d.id}>{d.name} {d.specialization ? `(${d.specialization})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Attending Physiotherapist</Label>
                  <Select value={form.physiotherapist_id} onValueChange={(v: string | null) => set('physiotherapist_id')(v === 'none' ? '' : (v ?? ''))}>
                    <SelectTrigger className="h-10 text-xs rounded-xl"><SelectValue placeholder="Select physiotherapist" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None / Unassigned</SelectItem>
                      {physiotherapists.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} {p.qualification ? `(${p.qualification})` : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-11 rounded-xl shadow-xs">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Complete Patient Registration
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="h-11 text-xs rounded-xl">Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
