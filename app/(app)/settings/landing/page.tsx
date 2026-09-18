'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Sparkles, Save, RefreshCw, Upload, Image as ImageIcon, Trash2, 
  CheckCircle2, ArrowLeft, Layers, Stethoscope, FileText, LayoutGrid, HeartPulse, ShieldCheck
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
import { useLandingCMS, type LandingPageCMSData, type ProcedureCardItem, type ServiceCardItem } from '@/lib/landing-cms-store'

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
        description: 'All text box changes and image URLs have been saved and are now live on the landing page.',
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

  // Image Upload helper converting local files to base64
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
            Landing Page Content & Image Editor
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            Edit text boxes, headings, clinical stats, and image URLs box-by-box for your public landing page.
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
            Save CMS Changes
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
            <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Hero & Stats Box
          </TabsTrigger>
          <TabsTrigger value="procedures" className="rounded-lg text-xs font-bold gap-1.5">
            <HeartPulse className="w-3.5 h-3.5 text-rose-600" /> Procedures Cards (4)
          </TabsTrigger>
          <TabsTrigger value="services" className="rounded-lg text-xs font-bold gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" /> Clinical Services (6)
          </TabsTrigger>
          <TabsTrigger value="showcase" className="rounded-lg text-xs font-bold gap-1.5">
            <Layers className="w-3.5 h-3.5 text-emerald-600" /> Platform Showcase
          </TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: HERO & STATS BOX ================= */}
        <TabsContent value="hero" className="space-y-6">
          <Card className="shadow-xs border-slate-200/90 rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" /> Top Hero Section & Main Positioning
              </CardTitle>
              <CardDescription className="text-xs">
                Edit main headline, subtext description, and right-column procedure image.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Top Badge Text</Label>
                  <Input 
                    value={form.heroBadgeText}
                    onChange={e => setForm(f => ({ ...f, heroBadgeText: e.target.value }))}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Headline Highlight Text (Blue Gradient)</Label>
                  <Input 
                    value={form.heroTitleHighlight}
                    onChange={e => setForm(f => ({ ...f, heroTitleHighlight: e.target.value }))}
                    className="h-10 text-xs font-semibold text-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Headline Prefix Text</Label>
                  <Input 
                    value={form.heroTitlePrefix}
                    onChange={e => setForm(f => ({ ...f, heroTitlePrefix: e.target.value }))}
                    className="h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Headline Suffix Text</Label>
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
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <Label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Clinical Recovery Statistics (3 Columns)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
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

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
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

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
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

              {/* Main Logged-In Hero Procedure Image */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <Label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Logged-In Hero Card Image & Overlay Text
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-4 h-36 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative">
                    <img 
                      src={form.heroCardImageUrl} 
                      alt="Hero Card Preview" 
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
                        placeholder="https://..."
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

        {/* ================= TAB 2: PROCEDURES CARDS (4 CARDS) ================= */}
        <TabsContent value="procedures" className="space-y-6">
          <Card className="shadow-xs border-slate-200/90 rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-rose-600" /> Procedures & Therapies Box-by-Box Editor
              </CardTitle>
              <CardDescription className="text-xs">
                Edit the 4 primary procedure cards displayed under the Procedures section.
              </CardDescription>
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

              {/* 4 Procedure Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {form.procedures.map((proc, pIdx) => (
                  <div key={proc.id} className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-slate-800 text-white text-[10px] font-bold">
                        Procedure Box #{pIdx + 1}
                      </Badge>
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
                    </div>

                    <div className="h-32 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-200 relative">
                      <img 
                        src={proc.imageUrl} 
                        alt={proc.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="space-y-1">
                        <Label className="text-[11px] font-bold text-slate-700">Procedure Title</Label>
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
                        <Label className="text-[11px] font-bold text-slate-700">Image URL</Label>
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
                            className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-semibold rounded cursor-pointer shrink-0 flex items-center gap-1"
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

        {/* ================= TAB 3: CLINICAL SERVICES (6 CARDS) ================= */}
        <TabsContent value="services" className="space-y-6">
          <Card className="shadow-xs border-slate-200/90 rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-indigo-600" /> Clinical Services Grid Editor (6 Boxes)
              </CardTitle>
              <CardDescription className="text-xs">
                Edit the 6 service cards displayed in the Clinical Services grid.
              </CardDescription>
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

              {/* 6 Service Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {form.services.map((srv, sIdx) => (
                  <div key={srv.id} className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-indigo-700 text-white text-[10px] font-bold">
                        Service Box #{sIdx + 1}
                      </Badge>
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
                    </div>

                    <div className="h-28 w-full rounded-lg overflow-hidden border border-slate-200 bg-slate-200 relative">
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

        {/* ================= TAB 4: PLATFORM SHOWCASE & PORTAL ================= */}
        <TabsContent value="showcase" className="space-y-6">
          <Card className="shadow-xs border-slate-200/90 rounded-2xl">
            <CardHeader className="border-b border-slate-100 pb-4">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" /> Container Scroll & Patient Portal Text
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

              {/* Patient Portal Text */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <Label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
                  Patient Portal Footer Section
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
