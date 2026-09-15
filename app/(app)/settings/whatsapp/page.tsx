'use client'
import { useState, useEffect } from 'react'
import { 
  MessageCircle, Send, Sparkles, Check, Copy, RefreshCw, 
  Settings, Key, Globe, Smartphone, HelpCircle, CheckCircle2,
  AlertCircle, ArrowRight, ExternalLink, ShieldCheck, Tag
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  getWhatsAppConfig,
  saveWhatsAppConfig,
  renderWhatsAppMessage,
  testWhatsAppApiConnection,
  DEFAULT_WHATSAPP_TEMPLATE,
  PRESET_TEMPLATES,
  AVAILABLE_VARIABLES,
  type WhatsAppConfig,
} from '@/lib/whatsapp'
import type { StoredVisit } from '@/lib/data-store'

// Sample visit data for real-time live preview
const SAMPLE_VISIT: StoredVisit = {
  id: 'vis-sample',
  bill_number: 'INV-202609-0042',
  patient_id: 'pat-sample',
  patient_uid: 'CLN-202609-0018',
  patient_name: 'Vikram Malhotra',
  patient_phone: '+91 98765 43210',
  doctor_name: 'Sarah Jenkins',
  doctor_specialization: 'Orthopedic Physiotherapist',
  centre_name: 'New Friends Colony, New Delhi',
  centre_phone: '08383936905',
  items: [
    { service_name: 'Consultation & Assessment', price: 600, quantity: 1, total: 600 },
    { service_name: 'Dry Needling Therapy', price: 750, quantity: 1, total: 750 },
    { service_name: 'Manual Joint Mobilization', price: 900, quantity: 1, total: 900 },
  ],
  subtotal: 2250,
  discount: 250,
  total: 2000,
  payment_mode: 'UPI',
  payment_status: 'Paid',
  notes: 'Lumbar disc decompression protocol initialized. Follow up in 3 days.',
  visit_date: new Date().toISOString().split('T')[0],
  created_at: new Date().toISOString(),
}

export default function WhatsAppSettingsPage() {
  const [config, setConfig] = useState<WhatsAppConfig>({
    mode: 'deeplink',
    apiProvider: 'meta',
    apiUrl: '',
    phoneNumberId: '',
    accessToken: '',
    messageTemplate: DEFAULT_WHATSAPP_TEMPLATE,
    includeFeedbackLink: true,
  })

  const [savedSuccess, setSavedSuccess] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testLoading, setTestLoading] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [copiedTag, setCopiedTag] = useState<string | null>(null)

  useEffect(() => {
    const loaded = getWhatsAppConfig()
    setConfig(loaded)
  }, [])

  const handleSave = () => {
    saveWhatsAppConfig(config)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleInsertTag = (tag: string) => {
    setConfig(prev => ({
      ...prev,
      messageTemplate: prev.messageTemplate + (prev.messageTemplate.endsWith(' ') ? '' : ' ') + tag,
    }))
    setCopiedTag(tag)
    setTimeout(() => setCopiedTag(null), 1500)
  }

  const handleApplyPreset = (template: string) => {
    setConfig(prev => ({
      ...prev,
      messageTemplate: template,
    }))
  }

  const handleTestSend = async () => {
    if (!testPhone.trim()) {
      setTestResult({ success: false, message: 'Please enter a 10-digit phone number to test.' })
      return
    }
    setTestLoading(true)
    setTestResult(null)
    try {
      const res = await testWhatsAppApiConnection(testPhone, config)
      setTestResult(res)
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Test failed' })
    } finally {
      setTestLoading(false)
    }
  }

  // Live rendered preview
  const previewText = renderWhatsAppMessage(config.messageTemplate || DEFAULT_WHATSAPP_TEMPLATE, SAMPLE_VISIT)

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50/80 border border-emerald-200 p-5 rounded-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 text-white font-medium gap-1">
              <MessageCircle className="h-3 w-3" /> WhatsApp Communication Hub
            </Badge>
            <span className="text-xs text-emerald-800 font-semibold">Invoices & Patient Engagement</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp API & Message Studio</h1>
          <p className="text-xs text-muted-foreground">
            Configure WhatsApp Business API credentials and customize the prewritten message sent with patient bills & feedback links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 gap-1 animate-fadeIn">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Saved Successfully!
            </Badge>
          )}
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 text-xs h-9 shadow-sm" onClick={handleSave}>
            <Check className="h-4 w-4" /> Save WhatsApp Settings
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API Mode & Template Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Integration Mode Selection */}
          <Card className="shadow-sm border">
            <CardHeader className="pb-3 border-b bg-gray-50/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Settings className="h-4 w-4 text-emerald-600" /> 1. WhatsApp Delivery Mode
              </CardTitle>
              <CardDescription className="text-xs">
                Choose how WhatsApp messages should be dispatched when billing patients
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mode 1: Deep Link */}
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, mode: 'deeplink' }))}
                  className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    config.mode === 'deeplink'
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-400/20 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {config.mode === 'deeplink' && (
                    <span className="absolute top-3 right-3 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4 text-emerald-600" />
                      <p className="text-xs font-bold text-gray-900">Direct Web / App Deep-Link</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200 mt-1">
                      ⭐ Recommended · Zero Setup
                    </Badge>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                      Opens patient chat instantly in WhatsApp Web or Mobile app with pre-filled formatted invoice & feedback link. Works 100% reliably on all devices without Meta approval.
                    </p>
                  </div>
                </button>

                {/* Mode 2: Cloud API */}
                <button
                  type="button"
                  onClick={() => setConfig(prev => ({ ...prev, mode: 'api' }))}
                  className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                    config.mode === 'api'
                      ? 'border-blue-500 bg-blue-50/50 ring-2 ring-blue-400/20 shadow-xs'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  {config.mode === 'api' && (
                    <span className="absolute top-3 right-3 text-blue-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      <p className="text-xs font-bold text-gray-900">WhatsApp Business Cloud API</p>
                    </div>
                    <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-blue-200 mt-1">
                      Automated Background API
                    </Badge>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                      Sends automated background WhatsApp messages via Meta WhatsApp Cloud API or custom Webhook gateway using your verified business phone number.
                    </p>
                  </div>
                </button>
              </div>

              {/* API Credentials Input (if API mode is active) */}
              {config.mode === 'api' && (
                <div className="mt-4 p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-3 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-blue-700" />
                    <p className="text-xs font-bold text-blue-950">Meta Cloud API Credentials</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Meta Phone Number ID</Label>
                      <Input
                        placeholder="e.g. 104829104810928"
                        className="text-xs bg-white"
                        value={config.phoneNumberId || ''}
                        onChange={e => setConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] font-semibold">Custom API / Webhook Endpoint (Optional)</Label>
                      <Input
                        placeholder="https://graph.facebook.com/v19.0/..."
                        className="text-xs bg-white"
                        value={config.apiUrl || ''}
                        onChange={e => setConfig(prev => ({ ...prev, apiUrl: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] font-semibold">System User Access Token / API Key</Label>
                    <Input
                      type="password"
                      placeholder="EAABw..."
                      className="text-xs bg-white font-mono"
                      value={config.accessToken || ''}
                      onChange={e => setConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                    />
                    <p className="text-[10px] text-blue-800">
                      Tokens are securely stored in your local clinic storage.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2. Prewritten Message Template Studio */}
          <Card className="shadow-sm border">
            <CardHeader className="pb-3 border-b bg-gray-50/60 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" /> 2. Prewritten WhatsApp Bill Template
                </CardTitle>
                <CardDescription className="text-xs">
                  Format the exact text, emojis, and billing breakdown sent to the patient
                </CardDescription>
              </div>
              <Button
                size="xs"
                variant="outline"
                className="text-[11px] gap-1 border-gray-300 text-gray-700"
                onClick={() => setConfig(prev => ({ ...prev, messageTemplate: DEFAULT_WHATSAPP_TEMPLATE }))}
              >
                <RefreshCw className="h-3 w-3" /> Reset Default
              </Button>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {/* Preset Selector */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700">Quick-Load Preset Templates:</Label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PRESET_TEMPLATES.map(preset => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleApplyPreset(preset.template)}
                      className="p-2.5 rounded-lg border text-left bg-gray-50 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all text-xs"
                    >
                      <p className="font-bold text-gray-900 truncate">{preset.title}</p>
                      <p className="text-[10px] text-muted-foreground line-clamp-1 mt-0.5">{preset.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Variables / Tags */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                  <span>Click to Insert Dynamic Tag:</span>
                  <span className="text-[10px] text-muted-foreground font-normal">Replaces with live bill data</span>
                </Label>
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-gray-50 rounded-xl border max-h-32 overflow-y-auto">
                  {AVAILABLE_VARIABLES.map(v => (
                    <button
                      key={v.tag}
                      type="button"
                      onClick={() => handleInsertTag(v.tag)}
                      title={`Example: ${v.example}`}
                      className="inline-flex items-center gap-1 text-[11px] font-mono font-medium px-2 py-1 bg-white border rounded-md hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors shadow-2xs"
                    >
                      <Tag className="h-2.5 w-2.5 text-emerald-600" />
                      {v.tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Editor Textarea */}
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Message Text & Layout</Label>
                <textarea
                  rows={14}
                  className="w-full font-mono text-xs p-3.5 border rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed resize-y"
                  value={config.messageTemplate}
                  onChange={e => setConfig(prev => ({ ...prev, messageTemplate: e.target.value }))}
                  placeholder="Enter your custom message template here..."
                />
              </div>

              {/* Quick Options */}
              <div className="pt-2 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-muted-foreground">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    checked={config.includeFeedbackLink !== false}
                    onChange={e => setConfig(prev => ({ ...prev, includeFeedbackLink: e.target.checked }))}
                  />
                  <span>Always ensure <strong>{`{feedback_url}`}</strong> rating link is active</span>
                </label>

                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-sm" onClick={handleSave}>
                  <Check className="h-3.5 w-3.5" /> Save Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Live WhatsApp Chat Simulator & Connection Test (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Mobile WhatsApp Chat Mockup */}
          <Card className="shadow-md border overflow-hidden">
            <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-gray-900 text-xs">
                  PN
                </div>
                <div>
                  <p className="text-xs font-bold leading-tight">Physionautics Clinic 🌿</p>
                  <p className="text-[10px] text-emerald-200">Official Patient Channel</p>
                </div>
              </div>
              <Badge className="bg-emerald-700/80 text-white text-[10px] border-none font-normal">
                Live Preview
              </Badge>
            </div>

            <div 
              className="p-4 space-y-3 min-h-[460px] max-h-[550px] overflow-y-auto bg-[#efeae2]"
              style={{
                backgroundImage: 'radial-gradient(#d1d7db 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              {/* Date divider */}
              <div className="text-center">
                <span className="text-[10px] bg-white/90 text-gray-600 px-2.5 py-0.5 rounded-full shadow-2xs font-medium">
                  TODAY
                </span>
              </div>

              {/* Chat Balloon */}
              <div className="flex justify-end">
                <div className="max-w-[92%] bg-[#d9fdd3] text-gray-900 p-3.5 rounded-2xl rounded-tr-xs shadow-xs text-xs whitespace-pre-wrap leading-relaxed space-y-2 border border-emerald-100">
                  <div className="font-sans text-[11.5px] leading-relaxed break-words">
                    {previewText}
                  </div>
                  <div className="flex justify-end items-center gap-1 text-[9px] text-gray-500 pt-1">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <span className="text-blue-600">✓✓</span>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-3.5 bg-gray-50 border-t flex items-center justify-between text-xs text-muted-foreground">
              <span>Preview rendered using sample patient data</span>
              <Button
                size="xs"
                variant="ghost"
                className="text-emerald-700 hover:text-emerald-800 gap-1 text-[11px]"
                onClick={() => {
                  navigator.clipboard.writeText(previewText)
                  alert('Sample rendered message copied to clipboard!')
                }}
              >
                <Copy className="h-3 w-3" /> Copy Sample
              </Button>
            </CardContent>
          </Card>

          {/* Live Test Sender */}
          <Card className="shadow-sm border">
            <CardHeader className="pb-3 border-b bg-gray-50/60">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Send className="h-4 w-4 text-emerald-600" /> Test WhatsApp Delivery
              </CardTitle>
              <CardDescription className="text-xs">
                Send a live test message to verify formatting and delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Test Mobile Number (10 Digits)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. 9876543210"
                    className="text-xs flex-1 bg-white"
                    value={testPhone}
                    onChange={e => setTestPhone(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shrink-0"
                    onClick={handleTestSend}
                    disabled={testLoading}
                  >
                    {testLoading ? (
                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    Send Test
                  </Button>
                </div>
              </div>

              {testResult && (
                <div className={`p-3 rounded-xl border text-xs flex items-start gap-2 ${
                  testResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'
                }`}>
                  {testResult.success ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="font-bold">{testResult.success ? 'Delivery Success' : 'Delivery Notice'}</p>
                    <p className="text-[11px] mt-0.5">{testResult.message}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
