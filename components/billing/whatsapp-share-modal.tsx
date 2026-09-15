'use client'
import { useState, useEffect } from 'react'
import { 
  MessageCircle, Send, Copy, Check, ExternalLink, 
  Sparkles, Smartphone, CheckCircle2, Edit3 
} from 'lucide-react'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogDescription, DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  generateWhatsAppInvoiceText, 
  openWhatsAppInvoice, 
  sendViaWhatsAppAPI, 
  getWhatsAppConfig, 
  formatPhoneNumber,
  type WhatsAppConfig 
} from '@/lib/whatsapp'
import type { StoredVisit } from '@/lib/data-store'

interface WhatsAppShareModalProps {
  visit: StoredVisit | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WhatsAppShareModal({ visit, open, onOpenChange }: WhatsAppShareModalProps) {
  const [messageText, setMessageText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)
  const [sendingApi, setSendingApi] = useState(false)
  const [apiResult, setApiResult] = useState<{ success: boolean; message: string } | null>(null)
  const [config, setConfig] = useState<WhatsAppConfig | null>(null)

  useEffect(() => {
    if (visit && open) {
      const cfg = getWhatsAppConfig()
      setConfig(cfg)
      const rendered = generateWhatsAppInvoiceText(visit)
      setMessageText(rendered)
      setIsEditing(false)
      setApiResult(null)
    }
  }, [visit, open])

  if (!visit) return null

  const phoneFormatted = formatPhoneNumber(visit.patient_phone)

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleOpenWhatsApp = () => {
    openWhatsAppInvoice(visit, messageText)
    onOpenChange(false)
  }

  const handleSendViaApi = async () => {
    setSendingApi(true)
    setApiResult(null)
    try {
      const res = await sendViaWhatsAppAPI(visit, messageText)
      setApiResult(res)
      if (res.success) {
        setTimeout(() => {
          onOpenChange(false)
        }, 1800)
      }
    } catch (err: any) {
      setApiResult({ success: false, message: err.message || 'Failed to dispatch via API' })
    } finally {
      setSendingApi(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        {/* Header */}
        <div className="bg-[#075e54] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-gray-900 text-sm">
              <MessageCircle className="h-5 w-5 text-gray-900" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-white leading-tight">
                Send WhatsApp Invoice
              </DialogTitle>
              <DialogDescription className="text-xs text-emerald-200">
                To: {visit.patient_name} · {phoneFormatted ? `+${phoneFormatted}` : 'No phone provided'}
              </DialogDescription>
            </div>
          </div>
          <Badge className="bg-emerald-700 text-white border-none font-mono text-[10px]">
            {visit.bill_number}
          </Badge>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" /> Prewritten Message & Feedback Link
            </Label>
            <div className="flex items-center gap-1">
              <Button
                size="xs"
                variant="ghost"
                className="h-7 text-xs text-gray-600 hover:text-emerald-700 gap-1"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit3 className="h-3 w-3" /> {isEditing ? 'Preview Mode' : 'Edit Text'}
              </Button>
              <Button
                size="xs"
                variant="ghost"
                className="h-7 text-xs text-gray-600 hover:text-emerald-700 gap-1"
                onClick={handleCopy}
              >
                {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          {isEditing ? (
            <textarea
              rows={12}
              className="w-full font-mono text-xs p-3 border rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 leading-relaxed"
              value={messageText}
              onChange={e => setMessageText(e.target.value)}
            />
          ) : (
            <div 
              className="p-3.5 rounded-xl border bg-[#efeae2] max-h-72 overflow-y-auto shadow-inner"
              style={{
                backgroundImage: 'radial-gradient(#d1d7db 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            >
              <div className="bg-[#d9fdd3] text-gray-900 p-3 rounded-xl shadow-xs text-xs whitespace-pre-wrap leading-relaxed font-sans border border-emerald-100">
                {messageText}
              </div>
            </div>
          )}

          {apiResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              apiResult.success ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              {apiResult.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <MessageCircle className="h-4 w-4 text-amber-600 shrink-0" />
              )}
              <span>{apiResult.message}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-gray-50 border-t flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" size="sm" className="text-xs" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>

          <div className="flex items-center gap-2">
            {config?.mode === 'api' && config.accessToken && (
              <Button
                size="sm"
                variant="outline"
                className="text-xs border-blue-300 text-blue-700 hover:bg-blue-50 gap-1.5"
                onClick={handleSendViaApi}
                disabled={sendingApi}
              >
                {sendingApi ? (
                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-blue-600 border-t-transparent" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Send via Cloud API
              </Button>
            )}

            <Button
              size="sm"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 shadow-sm"
              onClick={handleOpenWhatsApp}
            >
              <MessageCircle className="h-3.5 w-3.5" /> Open in WhatsApp Web / App
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
