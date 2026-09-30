'use client'
import { useState, useEffect } from 'react'
import { 
  MessageCircle, Send, Sparkles, Check, Copy, RefreshCw, 
  Settings, Key, Globe, Smartphone, HelpCircle, CheckCircle2,
  AlertCircle, ArrowRight, ExternalLink, ShieldCheck, Tag,
  Users, Image as ImageIcon, Layers, Play, CheckSquare, Square, Filter, Search, Clock,
  Upload, Trash2, Plus, FileText, X, ImagePlus, Save, RotateCcw
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  getWhatsAppConfig,
  saveWhatsAppConfig,
  renderWhatsAppMessage,
  renderBroadcastMessage,
  testWhatsAppApiConnection,
  sendWhatsAppMediaMessageAPI,
  getSavedCustomBroadcast,
  saveCustomBroadcast,
  DEFAULT_WHATSAPP_TEMPLATE,
  PRESET_TEMPLATES,
  PRESET_BROADCAST_CAMPAIGNS,
  AVAILABLE_VARIABLES,
  type WhatsAppConfig,
  type BroadcastCampaign,
} from '@/lib/whatsapp'
import { getPatients, getCentres, type StoredVisit } from '@/lib/data-store'

// Sample visit data for real-time live billing preview
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
  const [activeTab, setActiveTab] = useState<'broadcast' | 'settings'>('broadcast')

  // Settings State
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

  // Patients Data & Broadcast State
  const [patients, setPatients] = useState<any[]>([])
  const [centres, setCentres] = useState<any[]>([])
  const [selectedPatientIds, setSelectedPatientIds] = useState<Set<string>>(new Set())
  const [selectedCentre, setSelectedCentre] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Broadcast Message Composer State
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>('camp_custom')
  const [broadcastImageUrl, setBroadcastImageUrl] = useState<string>('')
  const [broadcastTemplate, setBroadcastTemplate] = useState<string>(PRESET_BROADCAST_CAMPAIGNS[0].template)
  const [uploadedFileName, setUploadedFileName] = useState<string>('')
  const [savedCustomNotice, setSavedCustomNotice] = useState(false)

  // Broadcast Execution State
  const [isBroadcasting, setIsBroadcasting] = useState(false)
  const [broadcastProgress, setBroadcastProgress] = useState({ current: 0, total: 0, currentName: '' })
  const [broadcastLogs, setBroadcastLogs] = useState<{ name: string; phone: string; status: 'sent' | 'failed'; time: string }[]>([])
  const [broadcastFinishedModal, setBroadcastFinishedModal] = useState(false)

  useEffect(() => {
    const loadedConfig = getWhatsAppConfig()
    setConfig(loadedConfig)

    // Load saved custom broadcast if available
    const savedCustom = getSavedCustomBroadcast()
    if (savedCustom.template || savedCustom.imageUrl) {
      setBroadcastImageUrl(savedCustom.imageUrl)
      setBroadcastTemplate(savedCustom.template)
    }

    async function loadData() {
      try {
        const [patList, centreList] = await Promise.all([getPatients(), getCentres()])
        setPatients(patList)
        setCentres(centreList)
        // Default select all patients
        const ids = new Set(patList.map((p: any) => p.id || p.uid))
        setSelectedPatientIds(ids)
      } catch (err) {
        console.error('Failed to load broadcast patients:', err)
      }
    }
    loadData()
  }, [])

  const handleSaveConfig = () => {
    saveWhatsAppConfig(config)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleInsertTag = (tag: string, target: 'settings' | 'broadcast') => {
    if (target === 'settings') {
      setConfig(prev => ({
        ...prev,
        messageTemplate: prev.messageTemplate + (prev.messageTemplate.endsWith(' ') ? '' : ' ') + tag,
      }))
    } else {
      setBroadcastTemplate(prev => prev + (prev.endsWith(' ') ? '' : ' ') + tag)
    }
  }

  const handleSelectCampaignPreset = (camp: BroadcastCampaign) => {
    setSelectedCampaignId(camp.id)
    if (camp.id === 'camp_custom') {
      const saved = getSavedCustomBroadcast()
      if (saved.template || saved.imageUrl) {
        setBroadcastImageUrl(saved.imageUrl)
        setBroadcastTemplate(saved.template)
      } else {
        setBroadcastImageUrl(camp.imageUrl)
        setBroadcastTemplate(camp.template)
      }
    } else {
      setBroadcastImageUrl(camp.imageUrl)
      setBroadcastTemplate(camp.template)
    }
  }

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 8 * 1024 * 1024) {
      alert('Image file size exceeds 8MB. Please choose a smaller image.')
      return
    }

    const reader = new FileReader()
    reader.onload = (evt) => {
      const dataUrl = evt.target?.result as string
      if (dataUrl) {
        setBroadcastImageUrl(dataUrl)
        setUploadedFileName(file.name)
        if (selectedCampaignId === 'camp_custom') {
          saveCustomBroadcast(dataUrl, broadcastTemplate)
        }
      }
    }
    reader.readAsDataURL(file)
  }

  const handleClearImage = () => {
    setBroadcastImageUrl('')
    setUploadedFileName('')
    if (selectedCampaignId === 'camp_custom') {
      saveCustomBroadcast('', broadcastTemplate)
    }
  }

  const handleSaveCustomDraft = () => {
    saveCustomBroadcast(broadcastImageUrl, broadcastTemplate)
    setSavedCustomNotice(true)
    setTimeout(() => setSavedCustomNotice(false), 3000)
  }

  const handleClearTemplate = () => {
    setBroadcastTemplate('')
  }

  // Filtered patients for broadcast selection
  const filteredPatients = patients.filter((p: any) => {
    const matchesCentre = selectedCentre === 'all' || p.centre_name?.toLowerCase().includes(selectedCentre.toLowerCase()) || p.centre_id === selectedCentre
    const matchesQuery = !searchQuery.trim() || 
      (p.full_name || p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone || '').includes(searchQuery) ||
      (p.uid || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCentre && matchesQuery
  })

  const toggleSelectPatient = (id: string) => {
    const next = new Set(selectedPatientIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedPatientIds(next)
  }

  const toggleSelectAll = () => {
    if (selectedPatientIds.size === filteredPatients.length) {
      setSelectedPatientIds(new Set())
    } else {
      const allIds = new Set(filteredPatients.map(p => p.id || p.uid))
      setSelectedPatientIds(allIds)
    }
  }

  // Execute Bulk Broadcast Dispatch
  const handleStartBroadcast = async () => {
    const targets = filteredPatients.filter(p => selectedPatientIds.has(p.id || p.uid))
    if (targets.length === 0) {
      alert('Please select at least 1 patient to send broadcast.')
      return
    }

    setIsBroadcasting(true)
    setBroadcastProgress({ current: 0, total: targets.length, currentName: '' })
    setBroadcastLogs([])

    const logs: { name: string; phone: string; status: 'sent' | 'failed'; time: string }[] = []

    for (let i = 0; i < targets.length; i++) {
      const patient = targets[i]
      const pName = patient.full_name || patient.name || 'Patient'
      const pPhone = patient.phone || ''
      setBroadcastProgress({ current: i + 1, total: targets.length, currentName: pName })

      const renderedText = renderBroadcastMessage(broadcastTemplate, patient)

      if (config.mode === 'api' && config.accessToken && config.phoneNumberId) {
        // Send via Meta Cloud API
        const res = await sendWhatsAppMediaMessageAPI(pPhone, renderedText, broadcastImageUrl, config)
        logs.push({
          name: pName,
          phone: pPhone,
          status: res.success ? 'sent' : 'failed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
      } else {
        // Queue Deep Link Mode - Open window per patient or open formatted web link
        const cleanPhone = (pPhone || '').replace(/[^0-9]/g, '')
        const fullMsg = (broadcastImageUrl && !broadcastImageUrl.startsWith('data:') ? `[PROMO BANNER: ${broadcastImageUrl}]\n\n` : '') + renderedText
        const encoded = encodeURIComponent(fullMsg)
        const waUrl = cleanPhone ? `https://wa.me/91${cleanPhone}?text=${encoded}` : `https://wa.me/?text=${encoded}`
        
        window.open(waUrl, '_blank')
        logs.push({
          name: pName,
          phone: pPhone,
          status: 'sent',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        })
        // Short delay for browser tab popup
        await new Promise(r => setTimeout(r, 600))
      }

      setBroadcastLogs([...logs])
    }

    setIsBroadcasting(false)
    setBroadcastFinishedModal(true)
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

  // Live rendered previews
  const billingPreviewText = renderWhatsAppMessage(config.messageTemplate || DEFAULT_WHATSAPP_TEMPLATE, SAMPLE_VISIT)
  
  const samplePatient = filteredPatients[0] || { full_name: 'Vikram Malhotra', uid: 'CLN-202609-0018', centre_name: 'New Friends Colony, New Delhi', centre_phone: '08383936905', primary_doctor_name: 'Dr. Sarah Jenkins' }
  const broadcastPreviewText = renderBroadcastMessage(broadcastTemplate, samplePatient)

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Page Title & Navigation Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50/90 border border-emerald-200/90 p-5 rounded-2xl shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 text-white font-semibold gap-1 text-xs">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Business Communication Center
            </Badge>
            <span className="text-xs text-emerald-800 font-bold">Physionautics Marketing & Care Hub</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            WhatsApp Bulk Broadcast & Messaging Studio
          </h1>
          <p className="text-xs text-slate-600">
            Dispatch customizable Picture + Text bulk business announcements, festival greetings, and post-session billing receipts.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200/80 shadow-2xs">
          <button
            onClick={() => setActiveTab('broadcast')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'broadcast'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Bulk Broadcast Studio
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5" /> API & Billing Settings
          </button>
        </div>
      </div>

      {/* ================= TAB 1: BULK BROADCAST STUDIO ================= */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Campaign Composer & Patient Selector */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Select Campaign Preset & Image Header */}
            <Card className="shadow-xs border border-slate-200/80 rounded-2xl bg-white">
              <CardHeader className="pb-3 border-b bg-slate-50/60 rounded-t-2xl">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-600" /> 1. Select Preset Campaign or Write Custom Message
                  </span>
                  <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                    Picture + Text Support
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Choose a clinic template or create a custom broadcast message with custom uploaded media banner
                </CardDescription>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                {/* Campaign Presets Grid */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-700">Select Campaign Template / Mode:</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {PRESET_BROADCAST_CAMPAIGNS.map(camp => (
                      <button
                        key={camp.id}
                        type="button"
                        onClick={() => handleSelectCampaignPreset(camp)}
                        className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                          selectedCampaignId === camp.id
                            ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-400/20 shadow-xs'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <p className="font-bold text-xs text-slate-900">{camp.title}</p>
                            {camp.id === 'camp_custom' && (
                              <Badge className="bg-emerald-600 text-white text-[9px] px-1.5 py-0">Custom</Badge>
                            )}
                          </div>
                          <p className="text-[10.5px] text-slate-500 mt-1 line-clamp-2">{camp.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner Image Upload & URL input */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-600" /> Header Media Banner (Upload File or Enter Image Link)
                    </Label>
                    {broadcastImageUrl && (
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="text-[10.5px] font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" /> Remove Image
                      </button>
                    )}
                  </div>

                  {/* Dual Upload Mode Controls */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    {/* Local File Upload Button */}
                    <label className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-center gap-2 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-xs font-bold rounded-xl border border-dashed border-emerald-300 transition-all text-center shadow-2xs">
                        <Upload className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="truncate">{uploadedFileName ? `Change Image (${uploadedFileName})` : 'Upload Image File'}</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageFileUpload}
                      />
                    </label>

                    <span className="text-[10px] font-bold text-slate-400 text-center uppercase">or</span>

                    {/* Image URL Input */}
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Paste image web URL (https://...)"
                        className="text-xs bg-white font-mono h-9"
                        value={broadcastImageUrl.startsWith('data:') ? '' : broadcastImageUrl}
                        onChange={e => {
                          setUploadedFileName('')
                          setBroadcastImageUrl(e.target.value)
                          if (selectedCampaignId === 'camp_custom') {
                            saveCustomBroadcast(e.target.value, broadcastTemplate)
                          }
                        }}
                      />
                    </div>
                  </div>

                  {/* Thumbnail Preview Card */}
                  {broadcastImageUrl && (
                    <div className="relative h-32 w-full rounded-xl overflow-hidden border border-slate-200 shadow-2xs group bg-slate-900/5">
                      <img
                        src={broadcastImageUrl}
                        alt="Campaign Media Header"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                      <div className="absolute top-2 left-2 flex items-center gap-1.5">
                        <span className="bg-slate-900/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-xs flex items-center gap-1">
                          <ImageIcon className="w-2.5 h-2.5" />
                          {uploadedFileName ? `File: ${uploadedFileName}` : 'Attached Header Media'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md transition-colors"
                        title="Remove image"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Text Composer, Toolbar & Personalization Tags */}
                <div className="space-y-2.5 pt-3 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Broadcast Message Body Text:</span>
                    </Label>

                    {/* Toolbar Actions */}
                    <div className="flex items-center gap-1.5">
                      {selectedCampaignId === 'camp_custom' && (
                        <Button
                          type="button"
                          size="xs"
                          variant="outline"
                          onClick={handleSaveCustomDraft}
                          className="text-[10.5px] h-7 bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 font-semibold gap-1"
                        >
                          <Save className="w-3 h-3" />
                          {savedCustomNotice ? 'Saved!' : 'Save Custom Draft'}
                        </Button>
                      )}

                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        onClick={handleClearTemplate}
                        className="text-[10.5px] h-7 text-slate-500 hover:text-slate-800 gap-1"
                      >
                        <Trash2 className="w-3 h-3" /> Clear Text
                      </Button>
                    </div>
                  </div>

                  {/* Variable Tag Insert Chips */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10.5px] text-slate-500">
                      <span>Click tag to insert into message:</span>
                      <span className="text-[10px] text-slate-400">Formatting: *bold*, _italics_</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200/80 max-h-24 overflow-y-auto">
                      {AVAILABLE_VARIABLES.map(v => (
                        <button
                          key={v.tag}
                          type="button"
                          onClick={() => handleInsertTag(v.tag, 'broadcast')}
                          className="inline-flex items-center gap-1 text-[10.5px] font-mono font-semibold px-2 py-0.5 bg-white border border-slate-200 rounded-md hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors shadow-2xs"
                        >
                          <Tag className="h-2.5 w-2.5 text-emerald-600" />
                          {v.tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={10}
                    className="w-full font-mono text-xs p-3.5 border border-slate-200 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed resize-y"
                    value={broadcastTemplate}
                    onChange={e => {
                      setBroadcastTemplate(e.target.value)
                      if (selectedCampaignId === 'camp_custom') {
                        saveCustomBroadcast(broadcastImageUrl, e.target.value)
                      }
                    }}
                    placeholder="Type your custom WhatsApp broadcast message here... Use tags like {patient_name} to personalize."
                  />
                </div>
              </CardContent>
            </Card>

            {/* 2. Patient Filter & Recipient Selection Table */}
            <Card className="shadow-xs border border-slate-200/80 rounded-2xl bg-white">
              <CardHeader className="pb-3 border-b bg-slate-50/60 rounded-t-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Users className="h-4 w-4 text-emerald-600" /> 2. Target Patient Recipient List
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Select active clinic patients to receive this bulk campaign
                  </CardDescription>
                </div>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs font-bold px-3 py-1 rounded-full shrink-0">
                  Targeting {selectedPatientIds.size} / {filteredPatients.length} Patients
                </Badge>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Search & Centre Filters */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                    <Input
                      placeholder="Search patient by name, UID or mobile number..."
                      className="text-xs pl-9 bg-white"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={selectedCentre} onValueChange={(val) => setSelectedCentre(val || 'all')}>
                      <SelectTrigger className="text-xs h-9 w-[180px] bg-white">
                        <SelectValue placeholder="Filter by Centre" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Clinic Branches</SelectItem>
                        {centres.map(c => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={toggleSelectAll}
                      className="text-xs font-semibold shrink-0 gap-1 border-slate-200"
                    >
                      {selectedPatientIds.size === filteredPatients.length ? (
                        <> <CheckSquare className="w-3.5 h-3.5 text-emerald-600" /> Deselect All </>
                      ) : (
                        <> <Square className="w-3.5 h-3.5 text-slate-400" /> Select All ({filteredPatients.length}) </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Patient List Table */}
                <div className="border border-slate-200/70 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b text-slate-600 font-semibold sticky top-0">
                      <tr>
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            className="rounded text-emerald-600 h-4 w-4"
                            checked={selectedPatientIds.size === filteredPatients.length && filteredPatients.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="p-3">Patient Name</th>
                        <th className="p-3">Patient UID</th>
                        <th className="p-3">Mobile Number</th>
                        <th className="p-3">Primary Branch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {filteredPatients.map(p => {
                        const pid = p.id || p.uid
                        const isSelected = selectedPatientIds.has(pid)
                        return (
                          <tr
                            key={pid}
                            onClick={() => toggleSelectPatient(pid)}
                            className={`cursor-pointer transition-colors ${
                              isSelected ? 'bg-emerald-50/50 hover:bg-emerald-50/80' : 'hover:bg-slate-50'
                            }`}
                          >
                            <td className="p-3 text-center" onClick={e => e.stopPropagation()}>
                              <input
                                type="checkbox"
                                className="rounded text-emerald-600 h-4 w-4"
                                checked={isSelected}
                                onChange={() => toggleSelectPatient(pid)}
                              />
                            </td>
                            <td className="p-3 font-bold text-slate-900">{p.full_name || p.name}</td>
                            <td className="p-3 font-mono text-slate-500">{p.uid || 'CLN-PATIENT'}</td>
                            <td className="p-3 font-medium text-slate-700">{p.phone || '+91 98765 43210'}</td>
                            <td className="p-3 text-slate-500 truncate max-w-[140px]">{p.centre_name || 'New Friends Colony'}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Action Trigger Button */}
                <div className="pt-2 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <div className="text-xs text-slate-500">
                    Mode: <span className="font-bold text-slate-800">{config.mode === 'api' ? '⚡ Automated Meta WhatsApp Cloud API' : '📲 WhatsApp Web / App Queue Link'}</span>
                  </div>

                  <Button
                    size="lg"
                    onClick={handleStartBroadcast}
                    disabled={isBroadcasting || selectedPatientIds.size === 0}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md gap-2 w-full sm:w-auto"
                  >
                    {isBroadcasting ? (
                      <> <RefreshCw className="w-4 h-4 animate-spin" /> Dispatching ({broadcastProgress.current}/{broadcastProgress.total})... </>
                    ) : (
                      <> <Send className="w-4 h-4" /> Start Bulk Broadcast ({selectedPatientIds.size} Patients) </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Right 5 Columns: Live Phone Preview Simulator */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-md border border-slate-200 overflow-hidden sticky top-6">
              <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-slate-900 text-xs shadow-xs">
                    PN
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Physionautics Clinic 🌿</p>
                    <p className="text-[10px] text-emerald-200">Official Patient Channel</p>
                  </div>
                </div>
                <Badge className="bg-emerald-700/80 text-white text-[10px] border-none font-normal">
                  Live Phone Preview
                </Badge>
              </div>

              {/* Chat Canvas */}
              <div 
                className="p-4 space-y-3 min-h-[520px] max-h-[600px] overflow-y-auto bg-[#efeae2]"
                style={{
                  backgroundImage: 'radial-gradient(#d1d7db 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                {/* Date tag */}
                <div className="text-center">
                  <span className="text-[10px] bg-white/90 text-slate-600 px-2.5 py-0.5 rounded-full shadow-2xs font-medium">
                    TODAY
                  </span>
                </div>

                {/* Broadcast Chat Bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[94%] bg-[#d9fdd3] text-slate-900 p-3 rounded-2xl rounded-tr-xs shadow-xs text-xs whitespace-pre-wrap leading-relaxed space-y-2 border border-emerald-100 overflow-hidden">
                    
                    {/* Header Image if available */}
                    {broadcastImageUrl && (
                      <div className="rounded-xl overflow-hidden border border-emerald-200/80 max-h-48">
                        <img
                          src={broadcastImageUrl}
                          alt="Broadcast Media Header"
                          className="w-full h-36 object-cover"
                          onError={(e) => { (e.target as HTMLElement).style.display = 'none' }}
                        />
                      </div>
                    )}

                    <div className="font-sans text-[11.5px] leading-relaxed break-words pt-1">
                      {broadcastPreviewText}
                    </div>

                    <div className="flex justify-end items-center gap-1 text-[9px] text-slate-500 pt-1">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-blue-600">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-3.5 bg-slate-50 border-t flex items-center justify-between text-xs text-slate-500">
                <span>Renders preview for <strong>{samplePatient.full_name || samplePatient.name}</strong></span>
                <Button
                  size="xs"
                  variant="ghost"
                  className="text-emerald-700 hover:text-emerald-800 gap-1 text-[11px]"
                  onClick={() => {
                    navigator.clipboard.writeText(broadcastPreviewText)
                    alert('Broadcast message copied to clipboard!')
                  }}
                >
                  <Copy className="h-3 w-3" /> Copy Message
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ================= TAB 2: API & BILLING SETTINGS ================= */}
      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: API Mode & Billing Template Studio (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="shadow-xs border border-slate-200/80 rounded-2xl bg-white">
              <CardHeader className="pb-3 border-b bg-slate-50/60 rounded-t-2xl">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-emerald-600" /> 1. WhatsApp Delivery Mode
                  </span>
                  {savedSuccess && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 gap-1 animate-fadeIn">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Saved!
                    </Badge>
                  )}
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
                        : 'border-slate-200 bg-white hover:border-slate-300'
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
                        <p className="text-xs font-bold text-slate-900">Direct Web / App Deep-Link</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200 mt-1">
                        ⭐ Recommended · Zero Setup
                      </Badge>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
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
                        : 'border-slate-200 bg-white hover:border-slate-300'
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
                        <p className="text-xs font-bold text-slate-900">WhatsApp Business Cloud API</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-blue-200 mt-1">
                        Automated Background API
                      </Badge>
                      <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                        Sends automated background WhatsApp messages via Meta WhatsApp Cloud API or custom Webhook gateway using your verified business phone number.
                      </p>
                    </div>
                  </button>
                </div>

                {/* API Credentials Input */}
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
                          className="text-xs bg-white font-mono"
                          value={config.phoneNumberId || ''}
                          onChange={e => setConfig(prev => ({ ...prev, phoneNumberId: e.target.value }))}
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-[11px] font-semibold">Custom API / Webhook Endpoint (Optional)</Label>
                        <Input
                          placeholder="https://graph.facebook.com/v19.0/..."
                          className="text-xs bg-white font-mono"
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

            {/* Prewritten Billing Template Studio */}
            <Card className="shadow-xs border border-slate-200/80 rounded-2xl bg-white">
              <CardHeader className="pb-3 border-b bg-slate-50/60 rounded-t-2xl flex flex-row items-center justify-between">
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
                  className="text-[11px] gap-1 border-slate-300 text-slate-700"
                  onClick={() => setConfig(prev => ({ ...prev, messageTemplate: DEFAULT_WHATSAPP_TEMPLATE }))}
                >
                  <RefreshCw className="h-3 w-3" /> Reset Default
                </Button>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                {/* Preset Selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Quick-Load Preset Templates:</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_TEMPLATES.map(preset => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, messageTemplate: preset.template }))}
                        className="p-2.5 rounded-lg border text-left bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 transition-all text-xs"
                      >
                        <p className="font-bold text-slate-900 truncate">{preset.title}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{preset.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editor Textarea */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Message Text & Layout</Label>
                  <textarea
                    rows={12}
                    className="w-full font-mono text-xs p-3.5 border rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed resize-y"
                    value={config.messageTemplate}
                    onChange={e => setConfig(prev => ({ ...prev, messageTemplate: e.target.value }))}
                  />
                </div>

                <div className="pt-2 border-t flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs text-slate-500">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-1.5 shadow-xs" onClick={handleSaveConfig}>
                    <Check className="h-3.5 w-3.5" /> Save WhatsApp Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Billing Preview & Connection Test */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="shadow-md border border-slate-200 overflow-hidden sticky top-6">
              <div className="bg-[#075e54] text-white p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-slate-900 text-xs">
                    PN
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Physionautics Billing 🌿</p>
                    <p className="text-[10px] text-emerald-200">Invoice Receipt Channel</p>
                  </div>
                </div>
                <Badge className="bg-emerald-700/80 text-white text-[10px] border-none font-normal">
                  Invoice Preview
                </Badge>
              </div>

              <div 
                className="p-4 space-y-3 min-h-[460px] max-h-[550px] overflow-y-auto bg-[#efeae2]"
                style={{
                  backgroundImage: 'radial-gradient(#d1d7db 1px, transparent 1px)',
                  backgroundSize: '16px 16px',
                }}
              >
                <div className="flex justify-end">
                  <div className="max-w-[92%] bg-[#d9fdd3] text-slate-900 p-3.5 rounded-2xl rounded-tr-xs shadow-xs text-xs whitespace-pre-wrap leading-relaxed space-y-2 border border-emerald-100">
                    <div className="font-sans text-[11.5px] leading-relaxed break-words">
                      {billingPreviewText}
                    </div>
                    <div className="flex justify-end items-center gap-1 text-[9px] text-slate-500 pt-1">
                      <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span className="text-blue-600">✓✓</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Broadcast Finished Dialog Modal */}
      {broadcastFinishedModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <Card className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 space-y-4 p-6">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-extrabold text-slate-900">Broadcast Completed!</h3>
              <p className="text-xs text-slate-500">
                Bulk campaign dispatched to {broadcastLogs.length} target patient recipients.
              </p>
            </div>

            <div className="max-h-48 overflow-y-auto border border-slate-200/80 rounded-xl divide-y divide-slate-100 text-xs">
              {broadcastLogs.map((log, idx) => (
                <div key={idx} className="p-2.5 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-900">{log.name}</p>
                    <p className="text-[10px] text-slate-400">{log.phone}</p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-semibold">
                    Sent ✓
                  </Badge>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setBroadcastFinishedModal(false)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
            >
              Done & Close
            </Button>
          </Card>
        </div>
      )}
    </div>
  )
}
