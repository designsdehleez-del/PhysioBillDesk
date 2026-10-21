'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Edit3, DollarSign, Wallet, Calendar, Building2, CreditCard, Tag, RefreshCw, UploadCloud, X, CheckCircle2, FileImage } from 'lucide-react'
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { updateExpense, uploadExpenseReceipt } from '@/lib/data-store'
import type { ClinicExpense, ExpenseCategory, Centre } from '@/lib/supabase/types'

interface EditExpenseModalProps {
  expense: ClinicExpense | null
  open: boolean
  onOpenChange: (open: boolean) => void
  centres: Centre[]
  onExpenseUpdated?: () => void
}

const CATEGORIES: ExpenseCategory[] = [
  'Staff Salaries',
  'Rent & Lease',
  'Equipment & Maintenance',
  'Medical Supplies',
  'Utilities & Bills',
  'Marketing & Admin',
  'Miscellaneous',
]

export function EditExpenseModal({
  expense,
  open,
  onOpenChange,
  centres,
  onExpenseUpdated,
}: EditExpenseModalProps) {
  const { toast } = useToast()
  const [saving, setSaving] = useState(false)

  const [date, setDate] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('Medical Supplies')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'UPI' | 'Card'>('UPI')
  const [selectedCentreId, setSelectedCentreId] = useState<string>('')
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [newReceiptFile, setNewReceiptFile] = useState<File | null>(null)
  const [newReceiptPreview, setNewReceiptPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (expense) {
      setDate(expense.expense_date || new Date().toISOString().split('T')[0])
      setCategory(expense.category || 'Medical Supplies')
      setAmount(expense.amount ? expense.amount.toString() : '')
      setDescription(expense.description || '')
      setPaymentMethod(expense.payment_method || 'UPI')
      setSelectedCentreId(expense.centre_id || centres[0]?.id || '')
      setReceiptUrl(expense.receipt_url || null)
      setNewReceiptFile(null)
      setNewReceiptPreview(null)
    }
  }, [expense, centres])

  const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: 'File too large', description: 'Please select an image under 10MB', variant: 'destructive' })
      return
    }
    setNewReceiptFile(file)
    const previewUrl = URL.createObjectURL(file)
    setNewReceiptPreview(previewUrl)
  }

  const handleRemoveExistingReceipt = () => {
    setReceiptUrl(null)
  }

  const handleClearNewReceipt = () => {
    if (newReceiptPreview) URL.revokeObjectURL(newReceiptPreview)
    setNewReceiptFile(null)
    setNewReceiptPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!expense) return

    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid expense amount in ₹', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      let finalReceiptUrl = receiptUrl
      if (newReceiptFile) {
        finalReceiptUrl = await uploadExpenseReceipt(newReceiptFile)
      }

      const centreObj = centres.find(c => c.id === selectedCentreId)

      await updateExpense(expense.id, {
        expense_date: date,
        category,
        amount: numAmount,
        description: description.trim() || `${category} expenditure`,
        centre_id: selectedCentreId || null,
        centre_name: centreObj ? centreObj.name : expense.centre_name,
        payment_method: paymentMethod,
        receipt_url: finalReceiptUrl,
      })

      toast({
        title: 'Expense Updated',
        description: `Expense record has been successfully updated.`,
      })

      onOpenChange(false)
      if (onExpenseUpdated) onExpenseUpdated()
    } catch (err) {
      console.error(err)
      toast({ title: 'Update Failed', description: 'Failed to update expense record.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl border-slate-200">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900">Edit Clinic Expense</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Update expenditure details, clinic branch, or attached payment proof.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Clinic Centre */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-blue-600" /> Clinic Branch Location
            </Label>
            <Select value={selectedCentreId} onValueChange={(v: string | null) => setSelectedCentreId(v ?? selectedCentreId)}>
              <SelectTrigger className="h-10 text-xs bg-slate-50 font-semibold border-slate-200 rounded-xl">
                <SelectValue placeholder="Select Clinic Branch" />
              </SelectTrigger>
              <SelectContent>
                {centres.map(c => (
                  <SelectItem key={c.id} value={c.id} className="text-xs font-medium">{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Category */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-purple-600" /> Expense Category
              </Label>
              <Select value={category} onValueChange={(v: string | null) => setCategory((v as ExpenseCategory) ?? category)}>
                <SelectTrigger className="h-10 text-xs bg-slate-50 font-semibold border-slate-200 rounded-xl">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat} className="text-xs font-medium">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-600" /> Expense Date
              </Label>
              <Input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="h-10 text-xs bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Amount */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Amount (₹)
              </Label>
              <Input
                type="number"
                placeholder="e.g. 5000"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                required
                min="1"
                step="any"
                className="h-10 text-xs bg-slate-50 font-bold text-slate-900 border-slate-200 rounded-xl"
              />
            </div>

            {/* Payment Method */}
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-indigo-600" /> Payment Method
              </Label>
              <Select value={paymentMethod} onValueChange={(v: string | null) => setPaymentMethod((v as any) ?? paymentMethod)}>
                <SelectTrigger className="h-10 text-xs bg-slate-50 font-semibold border-slate-200 rounded-xl">
                  <SelectValue placeholder="Payment Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UPI" className="text-xs font-medium">UPI / GPay</SelectItem>
                  <SelectItem value="Cash" className="text-xs font-medium">Cash</SelectItem>
                  <SelectItem value="Bank Transfer" className="text-xs font-medium">Bank Transfer</SelectItem>
                  <SelectItem value="Card" className="text-xs font-medium">Credit/Debit Card</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700">Description / Item Remarks</Label>
            <Textarea
              placeholder="e.g. Staff salaries payout, equipment service bill, electricity bill..."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="text-xs min-h-[60px] bg-slate-50 border-slate-200 rounded-xl"
            />
          </div>

          {/* Existing or New Receipt Upload */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileImage className="w-3.5 h-3.5 text-emerald-600" />
                {paymentMethod === 'UPI' ? 'UPI Screenshot Proof' : 'Receipt / Proof'}
              </Label>
              {(receiptUrl || newReceiptPreview) && (
                <button
                  type="button"
                  onClick={newReceiptPreview ? handleClearNewReceipt : handleRemoveExistingReceipt}
                  className="text-[10px] text-red-600 hover:underline flex items-center gap-0.5 font-semibold cursor-pointer"
                >
                  <X className="w-3 h-3" /> Remove Proof
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleReceiptChange}
              className="hidden"
              id="edit-expense-receipt-input"
            />

            {/* If neither existing nor new is selected */}
            {!receiptUrl && !newReceiptPreview ? (
              <label
                htmlFor="edit-expense-receipt-input"
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 bg-slate-50 hover:bg-slate-100/70 rounded-xl p-3 cursor-pointer transition-all"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center">
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold text-slate-700">Click to upload new UPI proof</p>
                    <p className="text-[10px] text-slate-400">PNG, JPG, or screenshot image</p>
                  </div>
                </div>
              </label>
            ) : newReceiptPreview ? (
              <div className="flex items-center gap-3 p-2.5 rounded-xl border border-blue-200 bg-blue-50/60">
                <img
                  src={newReceiptPreview}
                  alt="New Receipt Preview"
                  className="w-12 h-12 object-cover rounded-lg border border-blue-300 shadow-2xs"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-blue-950 truncate flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    New Proof Selected
                  </p>
                  <p className="text-[10px] text-blue-700">
                    Will replace current attachment on save
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={receiptUrl!}
                    alt="Current Receipt"
                    className="w-12 h-12 object-cover rounded-lg border border-emerald-300 shadow-2xs"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-950 truncate flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      Current Attachment Active
                    </p>
                    <p className="text-[10px] text-emerald-700">Verified payment proof</p>
                  </div>
                </div>
                <label
                  htmlFor="edit-expense-receipt-input"
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-200 px-2 py-1 rounded-lg cursor-pointer"
                >
                  Replace
                </label>
              </div>
            )}
          </div>

          <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-9 text-xs rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-sm">
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Edit3 className="w-3.5 h-3.5" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
