'use client'

import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  Save,
  CheckCircle2,
  Star,
  Eye,
  Settings2,
  Stethoscope,
  Building2,
  Receipt,
  FileText,
  Download,
  BarChart3,
  Layers,
  Award,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import {
  getFeedbackTemplates,
  saveFeedbackTemplate,
  getPatientFeedback,
  getDoctorSatisfactionMetrics,
} from '@/lib/data-store'
import type { FeedbackFormTemplate, FormField, FormFieldType } from '@/lib/supabase/types'

export default function FeedbackBuilderPage() {
  const [activeTab, setActiveTab] = useState<'builder' | 'templates' | 'analytics' | 'preview'>('builder')
  const [templates, setTemplates] = useState<FeedbackFormTemplate[]>([])
  const [currentTemplate, setCurrentTemplate] = useState<FeedbackFormTemplate | null>(null)
  const [aiPrompt, setAiPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [doctorMetrics, setDoctorMetrics] = useState<any[]>([])
  const [feedbackList, setFeedbackList] = useState<any[]>([])
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState<string>('all')

  const PRESET_PROMPTS = [
    '5-question post-op knee & spine rehab pain relief survey',
    'Doctor consultation clarity and home exercise guidance',
    'Sports injury functional mobility and athlete confidence',
    'Clinic cleanliness, treatment bay hygiene and reception speed',
  ]

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const tmpls = await getFeedbackTemplates()
    setTemplates(tmpls)
    const active = tmpls.find(t => t.is_active) || tmpls[0]
    if (active) setCurrentTemplate(JSON.parse(JSON.stringify(active)))

    const metrics = await getDoctorSatisfactionMetrics()
    setDoctorMetrics(metrics)

    const list = await getPatientFeedback()
    setFeedbackList(list)
  }

  const handleGenerateAI = async (promptToUse?: string) => {
    const query = promptToUse || aiPrompt
    if (!query.trim()) {
      toast.error('Please enter a description for the AI form generator.')
      return
    }

    setGenerating(true)
    try {
      const res = await fetch('/api/ai/generate-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      })
      const data = await res.json()
      if (data.success && data.template) {
        const newTmpl: FeedbackFormTemplate = {
          id: `tmpl-ai-${Date.now()}`,
          title: data.template.title || 'AI Clinical Survey',
          description: data.template.description || '',
          is_active: true,
          show_doctor_badge: true,
          show_invoice_badge: true,
          show_centre_badge: true,
          show_procedures_badge: true,
          accent_color: data.template.accent_color || '#0d9488',
          fields: data.template.fields || [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setCurrentTemplate(newTmpl)
        toast.success('✨ AI Form generated! Review questions below and click Save.')
      } else {
        toast.error('Could not generate form. Please try again.')
      }
    } catch (err) {
      toast.error('Failed to connect to AI generator.')
    } finally {
      setGenerating(false)
    }
  }

  const handleSaveTemplate = async (makeActive: boolean = true) => {
    if (!currentTemplate) return
    if (!currentTemplate.title.trim()) {
      toast.error('Form Title cannot be empty.')
      return
    }
    if (currentTemplate.fields.length === 0) {
      toast.error('Please add at least one question.')
      return
    }

    setSaving(true)
    try {
      await saveFeedbackTemplate({
        ...currentTemplate,
        is_active: makeActive ? true : currentTemplate.is_active,
      })
      toast.success(makeActive ? '🎉 Form template saved & activated for all patient links!' : 'Template saved successfully!')
      loadData()
    } catch (err) {
      toast.error('Error saving template.')
    } finally {
      setSaving(false)
    }
  }

  const addQuestion = (type: FormFieldType = 'star_rating') => {
    if (!currentTemplate) return
    const newField: FormField = {
      id: `q-${Date.now()}`,
      type,
      title: 'New Clinical Question',
      description: '',
      required: true,
      options: type === 'multiple_choice' || type === 'checkbox' ? ['Option 1', 'Option 2', 'Option 3'] : undefined,
      min_scale: type === 'linear_scale' || type === 'nps' ? (type === 'nps' ? 0 : 1) : undefined,
      max_scale: type === 'linear_scale' || type === 'nps' ? 10 : undefined,
      min_label: type === 'linear_scale' ? 'Minimal / Poor' : undefined,
      max_label: type === 'linear_scale' ? 'Excellent / Complete' : undefined,
      category: 'treatment',
    }
    setCurrentTemplate({
      ...currentTemplate,
      fields: [...currentTemplate.fields, newField],
    })
  }

  const updateField = (index: number, updates: Partial<FormField>) => {
    if (!currentTemplate) return
    const updated = [...currentTemplate.fields]
    updated[index] = { ...updated[index], ...updates }
    setCurrentTemplate({ ...currentTemplate, fields: updated })
  }

  const removeField = (index: number) => {
    if (!currentTemplate) return
    const updated = currentTemplate.fields.filter((_, i) => i !== index)
    setCurrentTemplate({ ...currentTemplate, fields: updated })
  }

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (!currentTemplate) return
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= currentTemplate.fields.length) return
    const updated = [...currentTemplate.fields]
    const [moved] = updated.splice(index, 1)
    updated.splice(targetIndex, 0, moved)
    setCurrentTemplate({ ...currentTemplate, fields: updated })
  }

  const duplicateField = (index: number) => {
    if (!currentTemplate) return
    const target = currentTemplate.fields[index]
    const copy: FormField = {
      ...JSON.parse(JSON.stringify(target)),
      id: `q-${Date.now()}`,
      title: `${target.title} (Copy)`,
    }
    const updated = [...currentTemplate.fields]
    updated.splice(index + 1, 0, copy)
    setCurrentTemplate({ ...currentTemplate, fields: updated })
  }

  const exportFeedbackExcel = () => {
    const data = feedbackList.map(fb => ({
      'Date': new Date(fb.created_at).toLocaleDateString('en-IN'),
      'Invoice #': fb.bill_number || 'N/A',
      'Patient UID': fb.patient_uid || 'N/A',
      'Patient Name': fb.patient_name,
      'Phone': fb.patient_phone || 'N/A',
      'Doctor Name': fb.doctor_name || 'General / Unassigned',
      'Centre': fb.centre_name || 'N/A',
      'Overall Rating (1-5)': fb.rating,
      'Hygiene Score': fb.hygiene_rating || 'N/A',
      'Treatment Score': fb.treatment_rating || 'N/A',
      'Staff Score': fb.staff_rating || 'N/A',
      'Comments': fb.comments || '',
    }))

    const ws = XLSX.utils.json_to_sheet(data)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Patient Feedback')
    XLSX.writeFile(wb, `Physionautics_Doctor_Feedback_${new Date().toISOString().split('T')[0]}.xlsx`)
    toast.success('Excel exported successfully!')
  }

  const filteredMetrics = selectedDoctorFilter === 'all'
    ? doctorMetrics
    : doctorMetrics.filter(d => d.doctor_name === selectedDoctorFilter)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-linear-to-r from-teal-900 via-teal-800 to-emerald-900 p-6 rounded-2xl text-white shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-700/60 rounded-full text-xs font-semibold text-teal-200 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            AI Google-Forms Builder & Doctor Performance
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            AI Feedback Form Studio
          </h1>
          <p className="text-sm text-teal-100 max-w-2xl">
            Design dynamic patient surveys with AI. Feedback links automatically display the treating doctor, clinic branch, invoice ID, and procedures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => setActiveTab('preview')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium"
          >
            <Eye className="w-4 h-4 mr-1.5" />
            Patient Preview
          </Button>
          <Button
            onClick={() => handleSaveTemplate(true)}
            disabled={saving}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-950/30"
          >
            <Save className="w-4 h-4 mr-1.5" />
            {saving ? 'Publishing...' : 'Publish Active Form'}
          </Button>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
        <TabsList className="grid grid-cols-4 bg-gray-100 p-1 rounded-xl max-w-2xl">
          <TabsTrigger value="builder" className="rounded-lg font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            Form Builder
          </TabsTrigger>
          <TabsTrigger value="templates" className="rounded-lg font-medium flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="preview" className="rounded-lg font-medium flex items-center gap-2">
            <Eye className="w-4 h-4 text-indigo-600" />
            Live Preview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg font-medium flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            Doctor Ratings
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: FORM BUILDER CANVAS */}
        <TabsContent value="builder" className="space-y-6">
          <Card className="border-teal-200 bg-linear-to-br from-teal-50/70 via-emerald-50/40 to-white shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-teal-950 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-teal-600" />
                  Generate or Customize with AI
                </CardTitle>
                <Badge variant="secondary" className="bg-teal-100 text-teal-800 text-xs">
                  Gemini Prompt Engine
                </Badge>
              </div>
              <CardDescription className="text-xs text-teal-800">
                Describe the patient condition or survey focus. AI will synthesize clinical questions, ratings, and scale metrics instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2.5">
                <Input
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  placeholder="e.g. Create a 5-question recovery assessment for post-surgery physiotherapy..."
                  className="bg-white border-teal-200 focus:border-teal-500 text-sm"
                  onKeyDown={e => e.key === 'Enter' && handleGenerateAI()}
                />
                <Button
                  onClick={() => handleGenerateAI()}
                  disabled={generating}
                  className="bg-teal-700 hover:bg-teal-800 text-white font-semibold shrink-0"
                >
                  <Sparkles className={`w-4 h-4 mr-1.5 ${generating ? 'animate-spin' : ''}`} />
                  {generating ? 'Synthesizing...' : 'Generate with AI'}
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-xs text-gray-500 font-medium">Quick Prompts:</span>
                {PRESET_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAiPrompt(p)
                      handleGenerateAI(p)
                    }}
                    className="text-xs bg-white hover:bg-teal-100 text-teal-800 border border-teal-200 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                  >
                    + {p}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {currentTemplate && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <Card className="border-t-4 border-t-teal-600 shadow-sm bg-white">
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Form Title</Label>
                      <Input
                        value={currentTemplate.title}
                        onChange={e => setCurrentTemplate({ ...currentTemplate, title: e.target.value })}
                        className="text-xl font-bold text-gray-900 border-gray-200"
                        placeholder="Form Title"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description & Patient Instructions</Label>
                      <Input
                        value={currentTemplate.description}
                        onChange={e => setCurrentTemplate({ ...currentTemplate, description: e.target.value })}
                        className="text-sm text-gray-600 border-gray-200"
                        placeholder="Description for patients..."
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {currentTemplate.fields.map((field, index) => (
                    <Card key={field.id} className="shadow-sm border-gray-200 hover:border-teal-300 transition-all bg-white">
                      <CardContent className="p-5 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                          <div className="sm:col-span-2 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md">
                                Q{index + 1}
                              </span>
                              <Input
                                value={field.title}
                                onChange={e => updateField(index, { title: e.target.value })}
                                placeholder="Enter your question here..."
                                className="font-semibold text-sm text-gray-900 border-gray-200"
                              />
                            </div>
                            <Input
                              value={field.description || ''}
                              onChange={e => updateField(index, { description: e.target.value })}
                              placeholder="Help text or explanation (optional)..."
                              className="text-xs text-gray-500 border-dashed border-gray-200"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs text-gray-500">Question Type</Label>
                            <select
                              value={field.type}
                              onChange={e => updateField(index, { type: e.target.value as FormFieldType })}
                              className="w-full text-xs font-medium bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-800"
                            >
                              <option value="star_rating">⭐ Star Rating (1-5)</option>
                              <option value="linear_scale">📏 Linear Scale (1-10)</option>
                              <option value="multiple_choice">🔘 Multiple Choice (Radio)</option>
                              <option value="checkbox">☑️ Checkboxes (Multi-select)</option>
                              <option value="nps">🔟 Net Promoter Score (0-10)</option>
                              <option value="textarea">📝 Paragraph / Long Text</option>
                              <option value="text">💬 Short Answer</option>
                            </select>
                          </div>
                        </div>

                        {(field.type === 'multiple_choice' || field.type === 'checkbox') && (
                          <div className="space-y-2 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                            <Label className="text-xs font-bold text-gray-600">Answer Choices:</Label>
                            <div className="space-y-2">
                              {(field.options || ['Option 1']).map((opt, optIdx) => (
                                <div key={optIdx} className="flex items-center gap-2">
                                  <span className="text-xs text-gray-400 font-bold">{optIdx + 1}.</span>
                                  <Input
                                    value={opt}
                                    onChange={e => {
                                      const newOpts = [...(field.options || [])]
                                      newOpts[optIdx] = e.target.value
                                      updateField(index, { options: newOpts })
                                    }}
                                    className="text-xs h-8 bg-white"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const newOpts = (field.options || []).filter((_, i) => i !== optIdx)
                                      updateField(index, { options: newOpts })
                                    }}
                                    className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newOpts = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`]
                                  updateField(index, { options: newOpts })
                                }}
                                className="text-xs h-7 text-teal-700 border-teal-300 hover:bg-teal-50"
                              >
                                <Plus className="w-3 h-3 mr-1" /> Add Option
                              </Button>
                            </div>
                          </div>
                        )}

                        {field.type === 'linear_scale' && (
                          <div className="grid grid-cols-2 gap-3 bg-gray-50/80 p-3 rounded-xl border border-gray-100">
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-500">Min Label (1):</Label>
                              <Input
                                value={field.min_label || ''}
                                onChange={e => updateField(index, { min_label: e.target.value })}
                                placeholder="e.g. Severe Discomfort"
                                className="text-xs h-8 bg-white"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs text-gray-500">Max Label (10):</Label>
                              <Input
                                value={field.max_label || ''}
                                onChange={e => updateField(index, { max_label: e.target.value })}
                                placeholder="e.g. Complete Relief"
                                className="text-xs h-8 bg-white"
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
                          <div className="flex items-center gap-4">
                            <label className="flex items-center gap-1.5 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                checked={field.required}
                                onChange={e => updateField(index, { required: e.target.checked })}
                                className="rounded text-teal-600 focus:ring-teal-500"
                              />
                              <span className="font-medium text-gray-700">Required</span>
                            </label>

                            <select
                              value={field.category || 'treatment'}
                              onChange={e => updateField(index, { category: e.target.value as any })}
                              className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1 text-gray-600"
                            >
                              <option value="doctor">Attributed to Doctor</option>
                              <option value="treatment">Treatment Outcome</option>
                              <option value="facility">Clinic Hygiene & Staff</option>
                              <option value="general">General Clinic NPS</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={index === 0}
                              onClick={() => moveField(index, 'up')}
                              className="h-8 w-8 p-0 text-gray-500"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={index === currentTemplate.fields.length - 1}
                              onClick={() => moveField(index, 'down')}
                              className="h-8 w-8 p-0 text-gray-500"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateField(index)}
                              className="h-8 w-8 p-0 text-gray-500 hover:text-teal-600"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeField(index)}
                              className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => addQuestion('star_rating')}
                    variant="outline"
                    className="flex-1 border-dashed border-2 border-teal-300 text-teal-700 hover:bg-teal-50 h-12 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Rating Question
                  </Button>
                  <Button
                    onClick={() => addQuestion('multiple_choice')}
                    variant="outline"
                    className="flex-1 border-dashed border-2 border-blue-300 text-blue-700 hover:bg-blue-50 h-12 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Multiple Choice
                  </Button>
                  <Button
                    onClick={() => addQuestion('linear_scale')}
                    variant="outline"
                    className="flex-1 border-dashed border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 h-12 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add 1-10 Scale
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Card className="shadow-sm border-gray-200 sticky top-20 bg-white">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-teal-600" />
                      Invoice & Doctor Attribution
                    </CardTitle>
                    <CardDescription className="text-xs text-gray-500">
                      Control which visit variables are displayed on the patient’s feedback link.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs">
                    <div className="space-y-3 bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-teal-600" />
                          <span className="font-semibold text-gray-800">Show Treating Doctor</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={currentTemplate.show_doctor_badge}
                          onChange={e => setCurrentTemplate({ ...currentTemplate, show_doctor_badge: e.target.checked })}
                          className="rounded text-teal-600"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-blue-600" />
                          <span className="font-semibold text-gray-800">Show Clinic Branch</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={currentTemplate.show_centre_badge}
                          onChange={e => setCurrentTemplate({ ...currentTemplate, show_centre_badge: e.target.checked })}
                          className="rounded text-teal-600"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-amber-600" />
                          <span className="font-semibold text-gray-800">Show Invoice & Patient UID</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={currentTemplate.show_invoice_badge}
                          onChange={e => setCurrentTemplate({ ...currentTemplate, show_invoice_badge: e.target.checked })}
                          className="rounded text-teal-600"
                        />
                      </label>

                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-purple-600" />
                          <span className="font-semibold text-gray-800">Show Billed Procedures</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={currentTemplate.show_procedures_badge}
                          onChange={e => setCurrentTemplate({ ...currentTemplate, show_procedures_badge: e.target.checked })}
                          className="rounded text-teal-600"
                        />
                      </label>
                    </div>

                    <Button
                      onClick={() => handleSaveTemplate(true)}
                      disabled={saving}
                      className="w-full bg-teal-700 hover:bg-teal-800 text-white font-semibold"
                    >
                      <Save className="w-4 h-4 mr-1.5" />
                      Save & Activate for All Links
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 2: TEMPLATES */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map(tmpl => (
              <Card key={tmpl.id} className={`border-2 ${tmpl.is_active ? 'border-teal-500 bg-teal-50/20' : 'border-gray-200'}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-gray-900">{tmpl.title}</CardTitle>
                    {tmpl.is_active && (
                      <Badge className="bg-emerald-600 text-white">Active Template</Badge>
                    )}
                  </div>
                  <CardDescription className="text-xs text-gray-500">{tmpl.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-xs text-gray-600">
                    <span className="font-semibold">{tmpl.fields.length} Questions</span> · Updated {new Date(tmpl.updated_at).toLocaleDateString('en-IN')}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setCurrentTemplate(JSON.parse(JSON.stringify(tmpl)))
                        setActiveTab('builder')
                      }}
                      className="text-xs flex-1"
                    >
                      Edit Questions
                    </Button>
                    {!tmpl.is_active && (
                      <Button
                        size="sm"
                        onClick={async () => {
                          await saveFeedbackTemplate({ ...tmpl, is_active: true })
                          loadData()
                          toast.success('Template activated!')
                        }}
                        className="text-xs bg-teal-600 text-white hover:bg-teal-700"
                      >
                        Set as Active
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: PREVIEW */}
        <TabsContent value="preview" className="space-y-4">
          {currentTemplate && (
            <div className="max-w-2xl mx-auto bg-gray-50 p-6 rounded-2xl border border-gray-200 shadow-xl space-y-6">
              <div className="bg-linear-to-r from-teal-800 to-emerald-800 text-white p-6 rounded-xl shadow-md space-y-3">
                <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Physionautics Verified Visit
                </div>
                <h2 className="text-xl font-bold text-white">{currentTemplate.title}</h2>
                <p className="text-xs text-teal-100">{currentTemplate.description}</p>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-teal-700/60 text-xs">
                  {currentTemplate.show_doctor_badge && (
                    <div className="flex items-center gap-2 text-teal-100">
                      <Stethoscope className="w-4 h-4 text-emerald-300" />
                      <span>Doctor: <strong className="text-white">Dr. Sarah Jenkins</strong></span>
                    </div>
                  )}
                  {currentTemplate.show_centre_badge && (
                    <div className="flex items-center gap-2 text-teal-100">
                      <Building2 className="w-4 h-4 text-teal-300" />
                      <span>Branch: <strong className="text-white">New Friends Colony</strong></span>
                    </div>
                  )}
                  {currentTemplate.show_invoice_badge && (
                    <div className="flex items-center gap-2 text-teal-100">
                      <Receipt className="w-4 h-4 text-amber-300" />
                      <span>Bill: <strong className="text-white">INV-202609-0001</strong></span>
                    </div>
                  )}
                  {currentTemplate.show_procedures_badge && (
                    <div className="flex items-center gap-2 text-teal-100">
                      <FileText className="w-4 h-4 text-purple-300" />
                      <span>Therapy: <strong className="text-white">Manual Joint Mobilization</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {currentTemplate.fields.map((field, idx) => (
                  <Card key={field.id} className="bg-white shadow-xs">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {idx + 1}. {field.title} {field.required && <span className="text-red-500">*</span>}
                          </p>
                          {field.description && <p className="text-xs text-gray-500">{field.description}</p>}
                        </div>
                      </div>

                      {field.type === 'star_rating' && (
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star key={s} className="w-7 h-7 text-amber-400 fill-amber-400 cursor-pointer" />
                          ))}
                        </div>
                      )}

                      {field.type === 'linear_scale' && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{field.min_label || '1'}</span>
                            <span>{field.max_label || '10'}</span>
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                              <button
                                key={num}
                                type="button"
                                className="flex-1 py-2 text-xs font-bold rounded-lg border border-gray-200 hover:bg-teal-600 hover:text-white transition-colors"
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {field.type === 'multiple_choice' && (
                        <div className="space-y-2">
                          {field.options?.map((opt, oIdx) => (
                            <label key={oIdx} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                              <input type="radio" name={field.id} className="text-teal-600" />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {field.type === 'checkbox' && (
                        <div className="space-y-2">
                          {field.options?.map((opt, oIdx) => (
                            <label key={oIdx} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                              <input type="checkbox" className="rounded text-teal-600" />
                              <span>{opt}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {field.type === 'textarea' && (
                        <textarea
                          placeholder="Patient will write recovery comments..."
                          className="w-full text-xs p-2.5 rounded-lg border border-gray-200"
                          rows={3}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB 4: DOCTOR RATINGS & ANALYTICS */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                Doctor Satisfaction & Clinical Quality Hub
              </h2>
              <p className="text-xs text-gray-500">
                Track patient recovery ratings, hygiene scores, and doctor praise across all clinic centres.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <select
                value={selectedDoctorFilter}
                onChange={e => setSelectedDoctorFilter(e.target.value)}
                className="text-xs font-medium bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 shadow-xs"
              >
                <option value="all">All Doctors ({doctorMetrics.length})</option>
                {doctorMetrics.map(d => (
                  <option key={d.doctor_name} value={d.doctor_name}>{d.doctor_name}</option>
                ))}
              </select>

              <Button
                onClick={exportFeedbackExcel}
                variant="outline"
                className="text-xs font-semibold border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <Download className="w-4 h-4 mr-1.5" />
                Export Excel (.xlsx)
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredMetrics.map((doc, idx) => (
              <Card key={idx} className="shadow-md border-gray-200 hover:shadow-lg transition-shadow bg-white">
                <CardHeader className="pb-3 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                        <Stethoscope className="w-4 h-4 text-teal-600" />
                        {doc.doctor_name}
                      </CardTitle>
                      <CardDescription className="text-xs text-teal-700 font-medium">
                        {doc.centre_name || 'All Clinic Branches'}
                      </CardDescription>
                    </div>
                    <Badge className="bg-amber-100 text-amber-900 border-amber-300 font-bold flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      {doc.avg_rating.toFixed(1)} / 5.0
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-teal-50/60 p-2.5 rounded-xl border border-teal-100">
                      <div className="text-xs text-gray-500">Treatment</div>
                      <div className="text-sm font-bold text-teal-800">{doc.treatment_score.toFixed(1)} ⭐</div>
                    </div>
                    <div className="bg-blue-50/60 p-2.5 rounded-xl border border-blue-100">
                      <div className="text-xs text-gray-500">Hygiene</div>
                      <div className="text-sm font-bold text-blue-800">{doc.hygiene_score.toFixed(1)} ⭐</div>
                    </div>
                    <div className="bg-purple-50/60 p-2.5 rounded-xl border border-purple-100">
                      <div className="text-xs text-gray-500">Staff</div>
                      <div className="text-sm font-bold text-purple-800">{doc.staff_score.toFixed(1)} ⭐</div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="text-xs font-bold text-gray-700">Recent Patient Remarks:</div>
                    {doc.recent_comments.length > 0 ? (
                      <div className="space-y-1">
                        {doc.recent_comments.slice(0, 2).map((c: string, cIdx: number) => (
                          <p key={cIdx} className="text-xs italic text-gray-600 bg-gray-50 p-2 rounded-lg border border-gray-100">
                            "{c}"
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No direct written comments yet.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
