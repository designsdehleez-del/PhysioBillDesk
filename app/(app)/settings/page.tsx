'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  User, KeyRound, Image as ImageIcon, Building2, Upload, Trash2, 
  CheckCircle2, ShieldCheck, FileSpreadsheet, MessageCircle, Database, 
  Sparkles, Eye, EyeOff, Save, RefreshCw, Stethoscope, Receipt, Phone, Mail, Globe, MapPin
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { useClinicBranding, type ClinicBranding, type AdminProfileData } from '@/lib/settings-store'
import { AuditTrailViewer } from '@/components/security/audit-trail-viewer'
import { cn } from '@/lib/utils'

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1594824813689-cf9fd65e6fd3?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
]

export default function SettingsPage() {
  const { toast } = useToast()
  const { profile, updatePassword } = useAuth()
  const isAdmin = profile?.role === 'admin'
  const { branding, adminProfile, saveBranding, resetBranding, saveProfile } = useClinicBranding()

  // Profile Form State
  const [profileForm, setProfileForm] = useState<AdminProfileData>(adminProfile)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(adminProfile.avatarUrl)
  const profileFileRef = useRef<HTMLInputElement>(null)

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordSaving, setPasswordSaving] = useState(false)

  // Branding Form State
  const [brandingForm, setBrandingForm] = useState<ClinicBranding>(branding)
  const [logoPreview, setLogoPreview] = useState<string | null>(branding.logoUrl)
  const logoFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setProfileForm(adminProfile)
    setAvatarPreview(adminProfile.avatarUrl)
  }, [adminProfile])

  useEffect(() => {
    setBrandingForm(branding)
    setLogoPreview(branding.logoUrl)
  }, [branding])

  // Profile Picture Handlers
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast({ title: 'Image too large', description: 'Please select an image under 2MB.', variant: 'destructive' })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setAvatarPreview(base64)
      setProfileForm(p => ({ ...p, avatarUrl: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveAvatar = () => {
    setAvatarPreview(null)
    setProfileForm(p => ({ ...p, avatarUrl: null }))
    if (profileFileRef.current) profileFileRef.current.value = ''
  }

  const handleSaveProfile = () => {
    if (!profileForm.name.trim()) {
      toast({ title: 'Name cannot be empty', variant: 'destructive' })
      return
    }
    saveProfile(profileForm)
    toast({ title: 'Admin Profile Updated', description: 'Your profile details and picture have been updated successfully.' })
  }

  // Password Reset Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPassword) {
      toast({ title: 'Current password is required', variant: 'destructive' })
      return
    }
    if (newPassword.length < 6) {
      toast({ title: 'New password must be at least 6 characters', variant: 'destructive' })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: 'New passwords do not match', variant: 'destructive' })
      return
    }

    setPasswordSaving(true)
    try {
      const res = await updatePassword(currentPassword, newPassword)
      if (res.success) {
        toast({ 
          title: 'Password Updated Successfully', 
          description: 'Your administrator password has been updated. You can use it on your next login.' 
        })
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast({ title: 'Password update failed', description: res.error || 'Please verify current password.', variant: 'destructive' })
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to update password', variant: 'destructive' })
    } finally {
      setPasswordSaving(false)
    }
  }

  // Clinic Logo Handlers
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 3 * 1024 * 1024) {
      toast({ title: 'Logo image too large', description: 'Please select a logo under 3MB.', variant: 'destructive' })
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setLogoPreview(base64)
      setBrandingForm(b => ({ ...b, logoUrl: base64 }))
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setBrandingForm(b => ({ ...b, logoUrl: null }))
    if (logoFileRef.current) logoFileRef.current.value = ''
  }

  const handleSaveBranding = () => {
    saveBranding(brandingForm)
    toast({ 
      title: 'Clinic Brand Settings Saved', 
      description: 'Your clinic logo, header branding, and invoice layout have been updated across the entire system.' 
    })
  }

  const handleResetToDefaultBranding = () => {
    resetBranding()
    setLogoPreview(null)
    toast({ title: 'Branding Reset', description: 'Clinic branding has been reset to default Physionautics configuration.' })
  }

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!newPassword) return 0
    let score = 0
    if (newPassword.length >= 6) score += 25
    if (newPassword.length >= 10) score += 25
    if (/[0-9]/.test(newPassword)) score += 25
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 25
    return score
  }
  const passwordStrength = getPasswordStrength()

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 text-white p-5 rounded-2xl shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs border border-white/20 text-xs">
              ⚙️ System & Governance
            </Badge>
            <span className="text-xs text-blue-200">Admin Control Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Admin Profile, Security & Clinic Branding
          </h1>
          <p className="text-xs sm:text-sm text-blue-100/80">
            Manage your administrator credentials, upload your official clinic logo for bills, and customize invoice templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/settings/whatsapp">
            <Button size="sm" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs gap-1.5 h-9">
              <MessageCircle className="h-3.5 w-3.5 text-green-300" /> WhatsApp Templates
            </Button>
          </Link>
          <Link href="/settings/data">
            <Button size="sm" variant="outline" className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs gap-1.5 h-9">
              <Database className="h-3.5 w-3.5 text-blue-300" /> Demo & Data
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={cn("grid bg-gray-100 p-1 rounded-xl", isAdmin ? "grid-cols-4 sm:w-[620px]" : "grid-cols-3 sm:w-[480px]")}>
          <TabsTrigger value="profile" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-xs rounded-lg gap-1.5">
            <User className="h-3.5 w-3.5" /> {isAdmin ? 'Admin Profile' : 'Staff Profile'}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="security" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-xs rounded-lg gap-1.5">
              <KeyRound className="h-3.5 w-3.5" /> Reset Password
            </TabsTrigger>
          )}
          <TabsTrigger value="branding" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-xs rounded-lg gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" /> Clinic Logo & Bills
          </TabsTrigger>
          <TabsTrigger value="audit" className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-xs rounded-lg gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-600" /> Audit Trail
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: PROFILE ================= */}
        <TabsContent value="profile" className="space-y-6">
          {!isAdmin ? (
            /* Clinic Staff Read-Only Profile */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="shadow-sm border">
                <CardHeader className="pb-3 border-b bg-gray-50/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" /> Staff Account
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Your assigned clinic desk account details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-extrabold">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : 'S'}
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-gray-900 text-base">{profile?.name || 'Clinic Reception Staff'}</p>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      {profile?.centreName || 'Assigned Clinic Centre'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Role: <span className="font-semibold text-gray-800">Clinic Front Desk & Billing</span>
                  </p>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 shadow-sm border space-y-0">
                <CardHeader className="pb-3 border-b bg-gray-50/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-blue-600" /> Clinic Account Particulars
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Logged in branch credentials and security status.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 p-3 bg-gray-50 rounded-lg border">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Staff User Name</span>
                      <p className="text-sm font-bold text-gray-900">{profile?.name || 'Clinic Staff'}</p>
                    </div>

                    <div className="space-y-1 p-3 bg-gray-50 rounded-lg border">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Login ID / Email</span>
                      <p className="text-sm font-bold text-gray-900 font-mono">{profile?.email || 'centre@physionautics.com'}</p>
                    </div>

                    <div className="space-y-1 p-3 bg-gray-50 rounded-lg border">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Assigned Centre</span>
                      <p className="text-sm font-bold text-blue-900">{profile?.centreName || 'PhysioNautics Centre'}</p>
                    </div>

                    <div className="space-y-1 p-3 bg-gray-50 rounded-lg border">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">Account Status</span>
                      <span className="inline-flex items-center gap-1 text-emerald-700 text-xs font-bold">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Active & Verified
                      </span>
                    </div>
                  </div>

                  {/* Explicit Restriction Notice */}
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 text-amber-900">
                    <div className="flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-amber-700" />
                      <h4 className="font-bold text-xs uppercase tracking-wide">ID & Password Modifications Restricted</h4>
                    </div>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Clinic reception logins cannot alter their login ID, email address, or system passwords directly. 
                      Credentials and clinic branch assignments are strictly controlled by the <strong>Chief Medical Officer (CMO) / Master Administrator</strong>.
                    </p>
                    <p className="text-[11px] text-amber-700 pt-1">
                      If you need your credentials updated or password reset, please contact central clinic governance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Admin Profile Form */
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Col: Profile Photo Uploader */}
            <Card className="shadow-sm border">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-600" /> Profile Picture
                </CardTitle>
                <CardDescription className="text-xs">
                  Your avatar is displayed in the sidebar, mobile header, and audit logs.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 flex flex-col items-center text-center space-y-4">
                {/* Circular Avatar Display */}
                <div className="relative group">
                  <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-extrabold">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Admin Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{profileForm.name.charAt(0) || 'A'}</span>
                    )}
                  </div>
                  <div 
                    onClick={() => profileFileRef.current?.click()}
                    className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-xs font-semibold gap-1"
                  >
                    <Upload className="h-4 w-4" /> Change
                  </div>
                </div>

                <input 
                  type="file" 
                  ref={profileFileRef} 
                  onChange={handleProfileImageUpload} 
                  accept="image/*" 
                  className="hidden" 
                />

                <div className="space-y-1">
                  <p className="font-bold text-gray-900 text-sm">{profileForm.name || 'Financial Administrator'}</p>
                  <p className="text-xs text-muted-foreground">{profileForm.roleTitle || 'Master Admin'}</p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center pt-2">
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline" 
                    className="text-xs gap-1.5"
                    onClick={() => profileFileRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" /> Upload Photo
                  </Button>
                  {avatarPreview && (
                    <Button 
                      type="button" 
                      size="sm" 
                      variant="ghost" 
                      className="text-xs text-destructive hover:bg-destructive/10 gap-1.5"
                      onClick={handleRemoveAvatar}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </Button>
                  )}
                </div>

                {/* Preset Avatars */}
                <div className="pt-3 border-t w-full space-y-2">
                  <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                    Or Choose Doctor Avatar
                  </span>
                  <div className="flex justify-center gap-2">
                    {PRESET_AVATARS.map((url, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setAvatarPreview(url)
                          setProfileForm(p => ({ ...p, avatarUrl: url }))
                        }}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all hover:scale-110 ${avatarPreview === url ? 'border-blue-600 ring-2 ring-blue-300' : 'border-gray-200'}`}
                      >
                        <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Right Col: Admin Details Form */}
            <Card className="lg:col-span-2 shadow-sm border">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-purple-600" /> Administrator Account Particulars
                </CardTitle>
                <CardDescription className="text-xs">
                  Update your contact email, displayed name, and clinical title.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">Full Name *</Label>
                    <Input 
                      value={profileForm.name} 
                      onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Dr. Sarah Jenkins / Chief Admin"
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">Login Email *</Label>
                    <Input 
                      value={profileForm.email} 
                      onChange={e => setProfileForm(p => ({ ...p, email: e.target.value }))}
                      placeholder="admin@physionautics.com"
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">Contact Phone</Label>
                    <Input 
                      value={profileForm.phone} 
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98111 00000"
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">Administrative Role / Title</Label>
                    <Input 
                      value={profileForm.roleTitle} 
                      onChange={e => setProfileForm(p => ({ ...p, roleTitle: e.target.value }))}
                      placeholder="Master Administrator (Financials & Governance)"
                      className="bg-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end">
                  <Button 
                    onClick={handleSaveProfile} 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5"
                  >
                    <Save className="h-3.5 w-3.5" /> Save Profile Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          )}
        </TabsContent>

        {/* ================= TAB 2: RESET PASSWORD ================= */}
        {isAdmin && (
        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Password Reset Form (2 cols) */}
            <Card className="lg:col-span-2 shadow-sm border">
              <CardHeader className="pb-3 border-b bg-gray-50/50">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-purple-600" /> Reset Administrator Password
                </CardTitle>
                <CardDescription className="text-xs">
                  Change the password used to access the Master Admin Financials and multi-centre billing.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5">
                <form onSubmit={handleResetPassword} className="space-y-4">
                  {/* Current Password */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">Current Password *</Label>
                    <div className="relative">
                      <Input 
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        placeholder="Enter current master admin password"
                        required
                        className="bg-white pr-10"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-900"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-muted-foreground">Default master administrator password: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-purple-700">Vikas@12344321</code></p>
                  </div>

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">New Password *</Label>
                    <div className="relative">
                      <Input 
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter new password (min. 6 characters)"
                        required
                        className="bg-white pr-10"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-900"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* Password Strength Meter */}
                    {newPassword && (
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[11px] text-muted-foreground">
                          <span>Password Strength</span>
                          <span className={passwordStrength >= 75 ? 'text-emerald-600 font-bold' : passwordStrength >= 50 ? 'text-amber-600 font-bold' : 'text-rose-600 font-bold'}>
                            {passwordStrength >= 75 ? 'Strong' : passwordStrength >= 50 ? 'Moderate' : 'Weak'}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-300 ${passwordStrength >= 75 ? 'bg-emerald-500' : passwordStrength >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">Confirm New Password *</Label>
                    <Input 
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      required
                      className="bg-white"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-[11px] text-destructive font-medium">Passwords do not match.</p>
                    )}
                  </div>

                  <div className="pt-3 border-t flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={passwordSaving || (!!confirmPassword && newPassword !== confirmPassword)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs gap-1.5"
                    >
                      <KeyRound className="h-3.5 w-3.5" /> {passwordSaving ? 'Updating Password…' : 'Update Admin Password'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Security Guidance Card (1 col) */}
            <Card className="shadow-sm border bg-gradient-to-br from-purple-50/50 to-indigo-50/30">
              <CardHeader className="pb-3 border-b bg-purple-50/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-950">
                  <ShieldCheck className="h-4 w-4 text-purple-600" /> Security Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3 text-xs text-gray-700">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <p>Password changes take effect immediately across all sessions.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <p>Clinic staff accounts can be managed independently from the <strong>Staff & Logins</strong> page.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-purple-600 shrink-0 mt-0.5" />
                  <p>Use a combination of upper/lowercase letters, digits, and special characters.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        )}

        {/* ================= TAB 3: CLINIC LOGO & BILL BRANDING ================= */}
        <TabsContent value="branding" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 cols: Logo Upload & Clinic Particulars */}
            <div className="lg:col-span-7 space-y-6">
              {/* Logo Uploader Card */}
              <Card className="shadow-sm border">
                <CardHeader className="pb-3 border-b bg-gray-50/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-600" /> Official Clinic Logo
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Upload your high-resolution clinic logo to be used on printable invoices, WhatsApp bills, and website header.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/30">
                    {/* Logo Preview Box */}
                    <div className="w-32 h-24 rounded-lg bg-white border shadow-xs flex items-center justify-center p-2 shrink-0 overflow-hidden">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Clinic Logo" className="max-h-full max-w-full object-contain" />
                      ) : (
                        <div className="text-center text-muted-foreground p-2">
                          <Stethoscope className="h-8 w-8 mx-auto text-blue-600 opacity-60" />
                          <span className="text-[10px] block font-bold text-blue-900 mt-1">PHYSIONAUTICS</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 text-center sm:text-left flex-1">
                      <div>
                        <h4 className="font-bold text-gray-900 text-xs">
                          {logoPreview ? 'Custom Clinic Logo Uploaded' : 'Using Default Brand Mark'}
                        </h4>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Supported formats: PNG, JPG, SVG, WebP. Transparent backgrounds recommended.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        <Button 
                          type="button" 
                          size="sm" 
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white gap-1.5"
                          onClick={() => logoFileRef.current?.click()}
                        >
                          <Upload className="h-3.5 w-3.5" /> Upload Clinic Logo
                        </Button>
                        {logoPreview && (
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="outline" 
                            className="text-xs text-destructive hover:bg-destructive/10 gap-1.5"
                            onClick={handleRemoveLogo}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  <input 
                    type="file" 
                    ref={logoFileRef} 
                    onChange={handleLogoUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />

                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p>
                      <strong>Note:</strong> You can upload your official logo image here anytime, or place your file in <code className="bg-amber-100 px-1 py-0.5 rounded font-mono">public/logo.png</code>. It will automatically be rendered across all receipts, invoices, and website pages!
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Clinic & Invoice Metadata */}
              <Card className="shadow-sm border">
                <CardHeader className="pb-3 border-b bg-gray-50/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-600" /> Invoice Header & Legal Information
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Information printed on patient bills, tax invoices, and official receipts.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-700">Clinic / Hospital Name *</Label>
                      <Input 
                        value={brandingForm.clinicName} 
                        onChange={e => setBrandingForm(b => ({ ...b, clinicName: e.target.value }))}
                        placeholder="PHYSIONAUTICS"
                        className="bg-white font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-700">Tagline / Subtitle</Label>
                      <Input 
                        value={brandingForm.tagline} 
                        onChange={e => setBrandingForm(b => ({ ...b, tagline: e.target.value }))}
                        placeholder="Physiotherapy & Pain Rehabilitation Centre"
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-700">GSTIN / Clinic Registration No.</Label>
                      <Input 
                        value={brandingForm.gstin} 
                        onChange={e => setBrandingForm(b => ({ ...b, gstin: e.target.value }))}
                        placeholder="07AAAAA0000A1Z5"
                        className="bg-white font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-700">Central Helpline Phone</Label>
                      <Input 
                        value={brandingForm.phone} 
                        onChange={e => setBrandingForm(b => ({ ...b, phone: e.target.value }))}
                        placeholder="+91 83839 36905"
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-700">Official Billing Email</Label>
                      <Input 
                        value={brandingForm.email} 
                        onChange={e => setBrandingForm(b => ({ ...b, email: e.target.value }))}
                        placeholder="contact@physionautics.com"
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-700">Official Website URL</Label>
                      <Input 
                        value={brandingForm.website} 
                        onChange={e => setBrandingForm(b => ({ ...b, website: e.target.value }))}
                        placeholder="https://physionautics.com"
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">Headquarters / Primary Address</Label>
                    <Input 
                      value={brandingForm.address} 
                      onChange={e => setBrandingForm(b => ({ ...b, address: e.target.value }))}
                      placeholder="D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025"
                      className="bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-700">Authorized Signatory Name</Label>
                      <Input 
                        value={brandingForm.authorizedSignatoryName} 
                        onChange={e => setBrandingForm(b => ({ ...b, authorizedSignatoryName: e.target.value }))}
                        placeholder="Dr. Sarah Jenkins"
                        className="bg-white"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-gray-700">Signatory Designation</Label>
                      <Input 
                        value={brandingForm.authorizedSignatoryTitle} 
                        onChange={e => setBrandingForm(b => ({ ...b, authorizedSignatoryTitle: e.target.value }))}
                        placeholder="Clinical Director & Chief Physiotherapist"
                        className="bg-white"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-gray-700">Invoice Footer Note / Disclaimer</Label>
                    <Input 
                      value={brandingForm.invoiceFooterNote} 
                      onChange={e => setBrandingForm(b => ({ ...b, invoiceFooterNote: e.target.value }))}
                      placeholder="Thank you for choosing Physionautics. Computerized receipt valid for claims."
                      className="bg-white"
                    />
                  </div>

                  <div className="pt-4 border-t flex items-center justify-between">
                    <Button 
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleResetToDefaultBranding}
                      className="text-xs text-muted-foreground hover:text-gray-900"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" /> Reset to Defaults
                    </Button>
                    <Button 
                      onClick={handleSaveBranding} 
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5"
                    >
                      <Save className="h-3.5 w-3.5" /> Save Branding & Logo
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 5 cols: Live Real-Time Invoice & Header Preview */}
            <div className="lg:col-span-5 space-y-4">
              <Card className="shadow-sm border bg-gray-50/80">
                <CardHeader className="pb-2 border-b bg-white">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
                      <Receipt className="h-3.5 w-3.5 text-blue-600" /> Live Bill & Invoice Preview
                    </CardTitle>
                    <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">Real-Time Mockup</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Miniature Printable Invoice Mockup */}
                  <div className="bg-white p-4 rounded-xl border shadow-sm text-xs space-y-3">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start border-b-2 border-blue-600 pb-3">
                      <div className="space-y-1">
                        {brandingForm.logoUrl ? (
                          <div className="h-8 mb-1 flex items-center">
                            <img src={brandingForm.logoUrl} alt="Logo" className="max-h-full max-w-[150px] object-contain" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white">
                              <Stethoscope className="h-3.5 w-3.5" />
                            </div>
                            <span className="font-extrabold text-blue-900 text-sm">{brandingForm.clinicName || 'PhysioNautics'}</span>
                          </div>
                        )}
                        <p className="text-[10px] font-bold text-gray-600">{brandingForm.tagline}</p>
                        <p className="text-[9px] text-muted-foreground truncate max-w-[200px]">{brandingForm.address}</p>
                        <p className="text-[9px] text-muted-foreground">GSTIN: <span className="font-mono">{brandingForm.gstin}</span></p>
                      </div>

                      <div className="text-right space-y-0.5">
                        <Badge variant="outline" className="text-[9px] font-mono text-blue-700 bg-blue-50">
                          INV-202609-0001
                        </Badge>
                        <p className="text-[9px] text-muted-foreground">Date: Today</p>
                        <p className="text-[9px] text-emerald-700 font-bold">PAID (UPI)</p>
                      </div>
                    </div>

                    {/* Patient & Doctor mini grid */}
                    <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded text-[10px]">
                      <div>
                        <span className="text-muted-foreground block">Patient:</span>
                        <span className="font-bold text-gray-900">Rahul Verma</span>
                        <span className="text-[9px] text-blue-600 block font-mono">CLN-202609-0001</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">Consultant:</span>
                        <span className="font-bold text-gray-900">Dr. Sarah Jenkins</span>
                        <span className="text-[9px] text-muted-foreground block">Orthopedic Physio</span>
                      </div>
                    </div>

                    {/* Sample Table */}
                    <div className="border rounded overflow-hidden text-[10px]">
                      <div className="bg-gray-100 p-1.5 font-bold text-gray-700 flex justify-between">
                        <span>Description</span>
                        <span>Amount</span>
                      </div>
                      <div className="divide-y">
                        <div className="p-1.5 flex justify-between">
                          <span>Initial Consultation</span>
                          <span>₹600</span>
                        </div>
                        <div className="p-1.5 flex justify-between">
                          <span>Dry Needling Therapy</span>
                          <span>₹750</span>
                        </div>
                      </div>
                    </div>

                    {/* Total Box */}
                    <div className="flex justify-end text-[11px]">
                      <div className="w-36 bg-gray-50 p-2 rounded border space-y-0.5 text-right">
                        <div className="flex justify-between text-muted-foreground text-[10px]">
                          <span>Subtotal:</span>
                          <span>₹1,350</span>
                        </div>
                        <div className="flex justify-between font-extrabold text-blue-900 border-t pt-1">
                          <span>Total Paid:</span>
                          <span>₹1,350</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer & Signatory */}
                    <div className="pt-2 border-t flex justify-between items-end text-[9px] text-muted-foreground">
                      <p className="truncate max-w-[150px]">{brandingForm.invoiceFooterNote}</p>
                      <div className="text-right">
                        <div className="w-16 border-b border-gray-400 ml-auto mb-0.5" />
                        <span className="font-bold text-gray-800">{brandingForm.authorizedSignatoryName}</span>
                      </div>
                    </div>
                  </div>

                  {/* Website Header Preview */}
                  <div className="bg-white p-3 rounded-xl border shadow-sm space-y-2">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                      Website Navigation Header Preview
                    </span>
                    <div className="bg-gray-900 text-white p-2.5 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {brandingForm.logoUrl ? (
                          <div className="h-7 flex items-center bg-white px-2 py-0.5 rounded shadow-xs">
                            <img src={brandingForm.logoUrl} alt="Logo" className="max-h-5 max-w-[120px] object-contain" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">
                              <Stethoscope className="h-3.5 w-3.5" />
                            </div>
                            <div>
                              <span className="font-bold text-xs block leading-tight">{brandingForm.clinicName || 'PhysioNautics'}</span>
                              <span className="text-[9px] text-gray-400">Clinic Portal</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-[10px] font-bold flex items-center justify-center">
                          {avatarPreview ? (
                            <img src={avatarPreview} alt="Admin" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span>A</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ================= TAB 4: COMPLIANCE & AUDIT TRAIL ================= */}
        <TabsContent value="audit" className="space-y-6">
          <AuditTrailViewer />
        </TabsContent>
      </Tabs>
    </div>
  )
}
