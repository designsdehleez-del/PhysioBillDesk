'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Sparkles, Save, RefreshCw, Upload, Image as ImageIcon, Trash2, Plus, Pencil,
  CheckCircle2, ArrowLeft, Layers, Stethoscope, FileText, LayoutGrid, HeartPulse,
  Building2, MapPin, Phone, Clock, ExternalLink, ShieldCheck, RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { useAuth } from '@/contexts/auth-context'
import { 
  useLandingCMS, 
  type LandingPageCMSData, 
  type ProcedureCardItem, 
  type ServiceCardItem, 
  type BranchContactItem 
} from '@/lib/landing-cms-store'

export default function LandingCMSEditorPage() {
  const { toast } = useToast()
  const { profile } = useAuth()
  const { cms, saveCMS, resetCMS } = useLandingCMS()
  const [form, setForm] = useState<LandingPageCMSData>(cms)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setForm(cms)
  }, [cms])

  const isAdmin = profile?.role === 'admin'

  const handleSave = () => {
    setSaving(true)
    saveCMS(form)
    setTimeout(() => {
      setSaving(false)
      toast({
        title: 'Landing Page CMS Updated!',
        description: 'All text box changes, images, and clinic branch locations have been saved and are now live.',
      })
    }, 400)
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all landing page content to factory defaults?')) {
      const resetData = resetCMS()
      setForm(resetData)
      toast({
        title: 'Content Reset',
        description: 'Landing page content re-initialized to default settings.',
      })
    }
  }

  // Helper for image upload (base64)
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>, 
    onSuccess: (url: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 3 * 1024 * 1024) {
      toast({ title: 'Image file too large', description: 'Please choose an image under 3MB.', variant: 'destructive' })
      return
    }

    const reader = new FileReader()
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string
      onSuccess(base64)
    }
    reader.readAsDataURL(file)
  }

  // Handlers for Procedures
  const handleAddProcedure = () => {
    const newProc: ProcedureCardItem = {
      id: `proc-${Date.now()}`,
      title: 'New Clinical Procedure',
      description: 'Describe the new treatment procedure and targeted recovery outcomes.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
      badge: 'Specialized Care',
    }
    setForm(f => ({ ...f, procedures: [...f.procedures, newProc] }))
  }

  const handleDeleteProcedure = (index: number) => {
    setForm(f => ({ ...f, procedures: f.procedures.filter((_, i) => i !== index) }))
  }

  // Handlers for Services
  const handleAddService = () => {
    const newSrv: ServiceCardItem = {
      id: `srv-${Date.now()}`,
      title: 'New Therapy Service',
      description: 'Enter modality details and patient recovery goals.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=500',
      badge: 'New Therapy',
    }
    setForm(f => ({ ...f, services: [...f.services, newSrv] }))
  }

  const handleDeleteService = (index: number) => {
    setForm(f => ({ ...f, services: f.services.filter((_, i) => i !== index) }))
  }

  // Handlers for Clinic Branches
  const handleAddBranch = () => {
    const newBranch: BranchContactItem = {
      id: `b-${Date.now()}`,
      name: 'New Delhi Clinic Branch',
      area: 'Delhi-NCR',
      address: 'Enter full street address, landmark, and pincode',
      phone: '+91 98100 00000',
      hours: '9:00 AM – 8:00 PM (Mon-Sat)',
      googleMapsUrl: 'https://maps.google.com',
    }
    setForm(f => ({ ...f, branches: [...(f.branches || []), newBranch] }))
  }

  const handleDeleteBranch = (index: number) => {
    setForm(f => ({ ...f, branches: (f.branches || []).filter((_, i) => i !== index) }))
  }

  return (
    <div className="space-y-6 pb-16">
      
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/settings" className="text-slate-400 hover:text-slate-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs font-bold px-2.5 py-0.5">
              ADMIN CMS STUDIO
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Landing Page CMS & Clinic Editor
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Visual box-by-box editor for hero text, procedure images, clinical services, and NCR branch clinic details.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={handleReset}
            className="border-slate-200 text-slate-600 hover:bg-slate-100 text-xs h-10 rounded-xl gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-10 px-5 rounded-xl shadow-sm gap-2"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save All Live Changes
          </Button>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-medium">
          Notice: Only Master Administrators can edit global landing page text and imagery.
        </div>
      )}

      <Tabs defaultValue="hero" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-xl flex flex-wrap gap-1">
          <TabsTrigger value="hero" className="rounded-lg text-xs font-bold gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Hero & Stats
          </TabsTrigger>
          <TabsTrigger value="orbit" className="rounded-lg text-xs font-bold gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-blue-600" /> Orbit & Care Protocols
          </TabsTrigger>
          <TabsTrigger value="procedures" className="rounded-lg text-xs font-bold gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> Procedures ({form.procedures.length})
          </TabsTrigger>
          <TabsTrigger value="services" className="rounded-lg text-xs font-bold gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" /> Clinical Services ({form.services.length})
          </TabsTrigger>
          <TabsTrigger value="branches" className="rounded-lg text-xs font-bold gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-600" /> Clinic Branches ({form.branches?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="showcase" className="rounded-lg text-xs font-bold gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" /> Showcase & Portal
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB ORBIT: CLINICAL ORBIT & CARE PROTOCOLS ================= */}
        <TabsContent value="orbit" className="space-y-6">
          <Card className="shadow-xs border-slate-200/90 rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600" /> Orbiting Cards Showcase & Care Protocols
              </CardTitle>
              <CardDescription className="text-xs">
                Edit headlines, subtext descriptions, badge text, and key features for the interactive orbiting cards section.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Pencil className="w-3 h-3 text-blue-600" /> Orbit Section Badge Text
                  </Label>
                  <Input 
                    value={form.orbitBadgeText || 'Interactive Care Protocols'}
                    onChange={e => setForm(f => ({ ...f, orbitBadgeText: e.target.value }))}
                    className="h-10 text-xs font-semibold text-blue-800"
                    placeholder="Interactive Care Protocols"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Pencil className="w-3 h-3 text-blue-600" /> Headline Highlight (Gradient Text)
                  </Label>
                  <Input 
                    value={form.orbitTitleHighlight || 'Rehabilitation Intelligence'}
                    onChange={e => setForm(f => ({ ...f, orbitTitleHighlight: e.target.value }))}
                    className="h-10 text-xs font-semibold text-blue-600"
                    placeholder="Rehabilitation Intelligence"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Headline Prefix</Label>
                <Input 
                  value={form.orbitTitlePrefix || 'Clinical Orbit & '}
                  onChange={e => setForm(f => ({ ...f, orbitTitlePrefix: e.target.value }))}
                  className="h-10 text-xs"
                  placeholder="Clinical Orbit & "
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Main Section Subtitle Description</Label>
                <Textarea 
                  value={form.orbitSubtitle || 'Hover over any orbiting clinical card to inspect treatment protocols, spinal decompression metrics, and real-time patient recovery ratings.'}
                  onChange={e => setForm(f => ({ ...f, orbitSubtitle: e.target.value }))}
                  className="text-xs min-h-[70px]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-3">
                <Label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Orbit Feature Cards (2 Columns)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <Label className="text-[11px] font-bold text-slate-700">Feature 1 (Title / Subtext)</Label>
                    <Input 
                      value={form.orbitFeature1Title || 'Continuous 360° Orbit'}
                      onChange={e => setForm(f => ({ ...f, orbitFeature1Title: e.target.value }))}
                      className="h-9 text-xs font-bold"
                    />
                    <Input 
                      value={form.orbitFeature1Sub || 'GPU-accelerated smooth rotation'}
                      onChange={e => setForm(f => ({ ...f, orbitFeature1Sub: e.target.value }))}
                      className="h-9 text-xs text-slate-500"
                    />
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <Label className="text-[11px] font-bold text-slate-700">Feature 2 (Title / Subtext)</Label>
                    <Input 
                      value={form.orbitFeature2Title || 'Interactive Hover Pause'}
                      onChange={e => setForm(f => ({ ...f, orbitFeature2Title: e.target.value }))}
                      className="h-9 text-xs font-bold"
                    />
                    <Input 
                      value={form.orbitFeature2Sub || 'Pauses rotation on card focus'}
                      onChange={e => setForm(f => ({ ...f, orbitFeature2Sub: e.target.value }))}
                      className="h-9 text-xs text-slate-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TAB 1: HERO & STATS BOX ================= */}
        <TabsContent value="hero" className="space-y-6">
          <Card className="shadow-xs border-slate-200/90 rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Top Hero Section & Positioning
              </CardTitle>
              <CardDescription className="text-xs">
                Edit main headline, subtext description, and right-column procedure image.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Pencil className="w-3 h-3 text-blue-600" /> Top Badge Text
                  </Label>
                  <Input 
                    value={form.heroBadgeText}
                    onChange={e => setForm(f => ({ ...f, heroBadgeText: e.target.value }))}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Pencil className="w-3 h-3 text-blue-600" /> Headline Highlight (Gradient)
                  </Label>
                  <Input 
                    value={form.heroTitleHighlight}
                    onChange={e => setForm(f => ({ ...f, heroTitleHighlight: e.target.value }))}
                    className="h-10 text-xs font-semibold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Headline Prefix</Label>
                  <Input 
                    value={form.heroTitlePrefix}
                    onChange={e => setForm(f => ({ ...f, heroTitlePrefix: e.target.value }))}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Headline Suffix</Label>
                  <Input 
                    value={form.heroTitleSuffix}
                    onChange={e => setForm(f => ({ ...f, heroTitleSuffix: e.target.value }))}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Main Hero Description Text</Label>
                <Textarea 
                  value={form.heroDescription}
                  onChange={e => setForm(f => ({ ...f, heroDescription: e.target.value }))}
                  className="text-xs min-h-[80px]"
                />
              </div>

              {/* Stats Box */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <Label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Clinical Recovery Statistics (3 Columns)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <Label className="text-[11px] font-bold text-slate-700">Stat 1 (Value / Label)</Label>
                    <Input 
                      value={form.stat1Value}
                      onChange={e => setForm(f => ({ ...f, stat1Value: e.target.value }))}
                      className="h-9 text-xs font-bold text-blue-600"
                      placeholder="84%"
                    />
                    <Input 
                      value={form.stat1Label}
                      onChange={e => setForm(f => ({ ...f, stat1Label: e.target.value }))}
                      className="h-9 text-xs"
                      placeholder="Surgery Avoided"
                    />
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <Label className="text-[11px] font-bold text-slate-700">Stat 2 (Value / Label)</Label>
                    <Input 
                      value={form.stat2Value}
                      onChange={e => setForm(f => ({ ...f, stat2Value: e.target.value }))}
                      className="h-9 text-xs font-bold text-emerald-600"
                      placeholder="3.2x"
                    />
                    <Input 
                      value={form.stat2Label}
                      onChange={e => setForm(f => ({ ...f, stat2Label: e.target.value }))}
                      className="h-9 text-xs"
                      placeholder="Faster Recovery"
                    />
                  </div>

                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <Label className="text-[11px] font-bold text-slate-700">Stat 3 (Value / Label)</Label>
                    <Input 
                      value={form.stat3Value}
                      onChange={e => setForm(f => ({ ...f, stat3Value: e.target.value }))}
                      className="h-9 text-xs font-bold text-amber-600"
                      placeholder="98.4%"
                    />
                    <Input 
                      value={form.stat3Label}
                      onChange={e => setForm(f => ({ ...f, stat3Label: e.target.value }))}
                      className="h-9 text-xs"
                      placeholder="Patient CSAT"
                    />
                  </div>
                </div>
              </div>

              {/* Logged-In Hero Card Image */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <Label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Logged-In Hero Card Image & Overlay
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4 h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-inner">
                    <img 
                      src={form.heroCardImageUrl} 
                      alt="Hero Preview" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="md:col-span-8 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-bold text-slate-700">Hero Image URL</Label>
                      <Input 
                        value={form.heroCardImageUrl}
                        onChange={e => setForm(f => ({ ...f, heroCardImageUrl: e.target.value }))}
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        id="hero-file-input"
                        onChange={e => handleImageFileUpload(e, url => setForm(f => ({ ...f, heroCardImageUrl: url })))}
                      />
                      <label 
                        htmlFor="hero-file-input"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" /> Upload Image File
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TAB 2: PROCEDURES CARDS ================= */}
        <TabsContent value="procedures" className="space-y-6">
          <Card className="shadow-xs border-slate-200/90 rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-600" /> Clinical Procedures Section Cards
                </CardTitle>
                <CardDescription className="text-xs">
                  Visually edit procedures shown on the landing page layout. Add, edit text/images, or delete procedure boxes.
                </CardDescription>
              </div>
              <Button
                onClick={handleAddProcedure}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-9 px-3 rounded-xl gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Procedure Box
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Section Title</Label>
                  <Input 
                    value={form.proceduresSectionTitle}
                    onChange={e => setForm(f => ({ ...f, proceduresSectionTitle: e.target.value }))}
                    className="h-10 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Section Subtitle</Label>
                  <Input 
                    value={form.proceduresSectionSubtitle}
                    onChange={e => setForm(f => ({ ...f, proceduresSectionSubtitle: e.target.value }))}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Procedures Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {form.procedures.map((proc, pIdx) => (
                  <div key={proc.id} className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-slate-800 text-white text-[10px] font-bold">
                        Procedure Box #{pIdx + 1}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={proc.badge}
                          onChange={e => {
                            const newProcs = [...form.procedures]
                            newProcs[pIdx].badge = e.target.value
                            setForm(f => ({ ...f, procedures: newProcs }))
                          }}
                          className="h-7 w-28 text-[11px] font-bold text-blue-600 bg-white"
                          placeholder="Badge tag"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProcedure(pIdx)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete Procedure"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="h-36 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-200 relative">
                      <img 
                        src={proc.imageUrl} 
                        alt={proc.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Pencil className="w-3 h-3 text-slate-400" /> Title
                        </Label>
                        <Input 
                          value={proc.title}
                          onChange={e => {
                            const newProcs = [...form.procedures]
                            newProcs[pIdx].title = e.target.value
                            setForm(f => ({ ...f, procedures: newProcs }))
                          }}
                          className="h-9 text-xs font-bold bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700">Description</Label>
                        <Textarea 
                          value={proc.description}
                          onChange={e => {
                            const newProcs = [...form.procedures]
                            newProcs[pIdx].description = e.target.value
                            setForm(f => ({ ...f, procedures: newProcs }))
                          }}
                          className="text-xs min-h-[60px] bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700">Image URL & Upload</Label>
                        <div className="flex gap-2">
                          <Input 
                            value={proc.imageUrl}
                            onChange={e => {
                              const newProcs = [...form.procedures]
                              newProcs[pIdx].imageUrl = e.target.value
                              setForm(f => ({ ...f, procedures: newProcs }))
                            }}
                            className="h-8 text-[11px] font-mono bg-white flex-1"
                          />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            id={`proc-file-${pIdx}`}
                            onChange={e => handleImageFileUpload(e, url => {
                              const newProcs = [...form.procedures]
                              newProcs[pIdx].imageUrl = url
                              setForm(f => ({ ...f, procedures: newProcs }))
                            })}
                          />
                          <label 
                            htmlFor={`proc-file-${pIdx}`}
                            className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold rounded-lg cursor-pointer shrink-0 flex items-center gap-1"
                          >
                            <Upload className="w-3 h-3" /> Upload
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TAB 3: CLINICAL SERVICES ================= */}
        <TabsContent value="services" className="space-y-6">
          <Card className="shadow-xs border-slate-200/90 rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-indigo-600" /> Clinical Services Grid Editor
                </CardTitle>
                <CardDescription className="text-xs">
                  Manage treatment modalities and services displayed in the Clinical Services grid.
                </CardDescription>
              </div>
              <Button
                onClick={handleAddService}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs h-9 px-3 rounded-xl gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Service Box
              </Button>
            </CardHeader>
            
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Services Section Title</Label>
                  <Input 
                    value={form.servicesSectionTitle}
                    onChange={e => setForm(f => ({ ...f, servicesSectionTitle: e.target.value }))}
                    className="h-10 text-xs font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Services Section Subtitle</Label>
                  <Input 
                    value={form.servicesSectionSubtitle}
                    onChange={e => setForm(f => ({ ...f, servicesSectionSubtitle: e.target.value }))}
                    className="h-10 text-xs"
                  />
                </div>
              </div>

              {/* Dynamic Service Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {form.services.map((srv, sIdx) => (
                  <div key={srv.id} className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3 relative group">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-indigo-700 text-white text-[10px] font-bold">
                        Service Box #{sIdx + 1}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Input 
                          value={srv.badge}
                          onChange={e => {
                            const newSrvs = [...form.services]
                            newSrvs[sIdx].badge = e.target.value
                            setForm(f => ({ ...f, services: newSrvs }))
                          }}
                          className="h-7 w-24 text-[10px] font-bold text-indigo-600 bg-white"
                          placeholder="Tag"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteService(sIdx)}
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Delete Service"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div className="h-32 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-200 relative">
                      <img 
                        src={srv.imageUrl} 
                        alt={srv.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700">Service Title</Label>
                        <Input 
                          value={srv.title}
                          onChange={e => {
                            const newSrvs = [...form.services]
                            newSrvs[sIdx].title = e.target.value
                            setForm(f => ({ ...f, services: newSrvs }))
                          }}
                          className="h-9 text-xs font-bold bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700">Description</Label>
                        <Textarea 
                          value={srv.description}
                          onChange={e => {
                            const newSrvs = [...form.services]
                            newSrvs[sIdx].description = e.target.value
                            setForm(f => ({ ...f, services: newSrvs }))
                          }}
                          className="text-xs min-h-[55px] bg-white"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700">Image URL</Label>
                        <div className="flex gap-1.5">
                          <Input 
                            value={srv.imageUrl}
                            onChange={e => {
                              const newSrvs = [...form.services]
                              newSrvs[sIdx].imageUrl = e.target.value
                              setForm(f => ({ ...f, services: newSrvs }))
                            }}
                            className="h-8 text-[10px] font-mono bg-white flex-1"
                          />
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            id={`srv-file-${sIdx}`}
                            onChange={e => handleImageFileUpload(e, url => {
                              const newSrvs = [...form.services]
                              newSrvs[sIdx].imageUrl = url
                              setForm(f => ({ ...f, services: newSrvs }))
                            })}
                          />
                          <label 
                            htmlFor={`srv-file-${sIdx}`}
                            className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold rounded cursor-pointer shrink-0 flex items-center gap-1"
                          >
                            Upload
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TAB 4: CLINIC BRANCHES DIRECTORY ================= */}
        <TabsContent value="branches" className="space-y-6">
          <Card className="shadow-xs border-slate-200/90 rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-600" /> Delhi-NCR Clinic Branches Directory
                </CardTitle>
                <CardDescription className="text-xs">
                  Edit clinic location names, addresses, operating hours, contact phone numbers, and Google Maps URL links.
                </CardDescription>
              </div>
              <Button
                onClick={handleAddBranch}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-3 rounded-xl gap-1.5 shrink-0"
              >
                <Plus className="w-4 h-4" /> Add Clinic Branch
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {(form.branches || []).map((branch, bIdx) => (
                  <div key={branch.id} className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3.5 relative">
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-700 text-white text-[10px] font-bold">
                          Branch #{bIdx + 1}
                        </Badge>
                        <Input 
                          value={branch.area}
                          onChange={e => {
                            const newBranches = [...(form.branches || [])]
                            newBranches[bIdx].area = e.target.value
                            setForm(f => ({ ...f, branches: newBranches }))
                          }}
                          className="h-7 w-32 text-[10px] font-bold text-amber-700 bg-white"
                          placeholder="Region / Area"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteBranch(bIdx)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Delete Branch"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-amber-600" /> Clinic Name
                        </Label>
                        <Input 
                          value={branch.name}
                          onChange={e => {
                            const newBranches = [...(form.branches || [])]
                            newBranches[bIdx].name = e.target.value
                            setForm(f => ({ ...f, branches: newBranches }))
                          }}
                          className="h-9 text-xs font-bold bg-white"
                          placeholder="e.g. New Friends Colony (Flagship)"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" /> Full Street Address
                        </Label>
                        <Textarea 
                          value={branch.address}
                          onChange={e => {
                            const newBranches = [...(form.branches || [])]
                            newBranches[bIdx].address = e.target.value
                            setForm(f => ({ ...f, branches: newBranches }))
                          }}
                          className="text-xs min-h-[55px] bg-white"
                          placeholder="Street address, building, pincode"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-blue-600" /> Phone Number
                          </Label>
                          <Input 
                            value={branch.phone}
                            onChange={e => {
                              const newBranches = [...(form.branches || [])]
                              newBranches[bIdx].phone = e.target.value
                              setForm(f => ({ ...f, branches: newBranches }))
                            }}
                            className="h-8 text-xs font-mono bg-white"
                            placeholder="+91..."
                          />
                        </div>

                        <div className="space-y-1">
                          <Label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" /> Operating Hours
                          </Label>
                          <Input 
                            value={branch.hours}
                            onChange={e => {
                              const newBranches = [...(form.branches || [])]
                              newBranches[bIdx].hours = e.target.value
                              setForm(f => ({ ...f, branches: newBranches }))
                            }}
                            className="h-8 text-xs bg-white"
                            placeholder="8:00 AM – 8:00 PM"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <ExternalLink className="w-3 h-3 text-blue-600" /> Google Maps URL
                        </Label>
                        <Input 
                          value={branch.googleMapsUrl}
                          onChange={e => {
                            const newBranches = [...(form.branches || [])]
                            newBranches[bIdx].googleMapsUrl = e.target.value
                            setForm(f => ({ ...f, branches: newBranches }))
                          }}
                          className="h-8 text-[11px] font-mono bg-white"
                          placeholder="https://www.google.com/maps/..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= TAB 5: PLATFORM SHOWCASE & PORTAL ================= */}
        <TabsContent value="showcase" className="space-y-6">
          <Card className="shadow-xs border-slate-200/90 rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" /> Container Scroll & Patient Care Footer Text
              </CardTitle>
              <CardDescription className="text-xs">
                Edit text content for the interactive scroll container and patient care section.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Scroll Badge</Label>
                  <Input 
                    value={form.scrollBadge}
                    onChange={e => setForm(f => ({ ...f, scrollBadge: e.target.value }))}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Scroll Highlight Text</Label>
                  <Input 
                    value={form.scrollTitleHighlight}
                    onChange={e => setForm(f => ({ ...f, scrollTitleHighlight: e.target.value }))}
                    className="h-10 text-xs font-semibold text-emerald-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Scroll Title Prefix</Label>
                <Input 
                  value={form.scrollTitlePrefix}
                  onChange={e => setForm(f => ({ ...f, scrollTitlePrefix: e.target.value }))}
                  className="h-10 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Scroll Subtitle Description</Label>
                <Textarea 
                  value={form.scrollSubtitle}
                  onChange={e => setForm(f => ({ ...f, scrollSubtitle: e.target.value }))}
                  className="text-xs min-h-[70px]"
                />
              </div>

              {/* Orbiting Animation & Clinical Intelligence Section */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <Label className="text-xs font-extrabold uppercase tracking-wider text-blue-600 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Orbiting Cards Showcase Section (Clinical Intelligence)
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Orbit Section Badge Text</Label>
                    <Input 
                      value={form.orbitBadgeText || 'Interactive Care Protocols'}
                      onChange={e => setForm(f => ({ ...f, orbitBadgeText: e.target.value }))}
                      className="h-10 text-xs"
                      placeholder="Interactive Care Protocols"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Orbit Title Highlight Text</Label>
                    <Input 
                      value={form.orbitTitleHighlight || 'Rehabilitation Intelligence'}
                      onChange={e => setForm(f => ({ ...f, orbitTitleHighlight: e.target.value }))}
                      className="h-10 text-xs font-semibold text-blue-600"
                      placeholder="Rehabilitation Intelligence"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Orbit Title Prefix</Label>
                  <Input 
                    value={form.orbitTitlePrefix || 'Clinical Orbit & '}
                    onChange={e => setForm(f => ({ ...f, orbitTitlePrefix: e.target.value }))}
                    className="h-10 text-xs"
                    placeholder="Clinical Orbit & "
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Orbit Subtitle Description</Label>
                  <Textarea 
                    value={form.orbitSubtitle || 'Hover over any orbiting clinical card to inspect treatment protocols, spinal decompression metrics, and real-time patient recovery ratings.'}
                    onChange={e => setForm(f => ({ ...f, orbitSubtitle: e.target.value }))}
                    className="text-xs min-h-[60px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <Label className="text-[11px] font-bold text-slate-700">Feature 1 (Title / Subtext)</Label>
                    <Input 
                      value={form.orbitFeature1Title || 'Continuous 360° Orbit'}
                      onChange={e => setForm(f => ({ ...f, orbitFeature1Title: e.target.value }))}
                      className="h-9 text-xs font-bold"
                    />
                    <Input 
                      value={form.orbitFeature1Sub || 'GPU-accelerated smooth rotation'}
                      onChange={e => setForm(f => ({ ...f, orbitFeature1Sub: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                    <Label className="text-[11px] font-bold text-slate-700">Feature 2 (Title / Subtext)</Label>
                    <Input 
                      value={form.orbitFeature2Title || 'Interactive Hover Pause'}
                      onChange={e => setForm(f => ({ ...f, orbitFeature2Title: e.target.value }))}
                      className="h-9 text-xs font-bold"
                    />
                    <Input 
                      value={form.orbitFeature2Sub || 'Pauses rotation on card focus'}
                      onChange={e => setForm(f => ({ ...f, orbitFeature2Sub: e.target.value }))}
                      className="h-9 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Patient Portal Text */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <Label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Patient Care Footer Section
                </Label>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Portal Section Title</Label>
                    <Input 
                      value={form.portalTitle}
                      onChange={e => setForm(f => ({ ...f, portalTitle: e.target.value }))}
                      className="h-10 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700">Portal Badge Text</Label>
                    <Input 
                      value={form.portalBadge}
                      onChange={e => setForm(f => ({ ...f, portalBadge: e.target.value }))}
                      className="h-10 text-xs font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Portal Subtitle</Label>
                  <Textarea 
                    value={form.portalSubtitle}
                    onChange={e => setForm(f => ({ ...f, portalSubtitle: e.target.value }))}
                    className="text-xs min-h-[60px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
