'use client'

import React, { useState } from 'react'
import { Plus, DollarSign, Wallet, Calendar, Building2, CreditCard, Tag, RefreshCw } from 'lucide-react'
import { 
  Dialog, DialogContent, DialogDescription, 
  DialogHeader, DialogTitle, DialogTrigger, DialogFooter 
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { addExpense } from '@/lib/data-store'
import type { ClinicExpense, ExpenseCategory, Centre } from '@/lib/supabase/types'

interface ExpenseLoggingModalProps {
  centres: Centre[]
  userCentreId?: string | null
  userCentreName?: string | null
  userName?: string | null
  onExpenseAdded?: () => void
  trigger?: React.ReactNode
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

export function ExpenseLoggingModal({
  centres,
  userCentreId,
  userCentreName,
  userName,
  onExpenseAdded,
  trigger
}: ExpenseLoggingModalProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState<ExpenseCategory>('Medical Supplies')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Bank Transfer' | 'UPI' | 'Card'>('UPI')
  const [selectedCentreId, setSelectedCentreId] = useState<string>(userCentreId || (centres[0]?.id ?? 'c1111111-1111-1111-1111-111111111111'))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({ title: 'Invalid Amount', description: 'Please enter a valid expense amount in ₹', variant: 'destructive' })
      return
    }

    setSaving(true)
    try {
      const centreObj = centres.find(c => c.id === selectedCentreId)
      await addExpense({
        expense_date: date,
        category,
        amount: numAmount,
        description: description || `${category} expenditure`,
        centre_id: selectedCentreId,
        centre_name: centreObj ? centreObj.name : (userCentreName || 'Physionautics Multispecialty'),
        logged_by_name: userName || 'Clinic Staff',
        payment_method: paymentMethod,
      })

      toast({
        title: 'Clinic Expense Logged!',
        description: `₹${numAmount.toLocaleString('en-IN')} for ${category} has been saved to clinic records.`,
      })

      setOpen(false)
      setAmount('')
      setDescription('')
      if (onExpenseAdded) onExpenseAdded()
    } catch (err) {
      console.error(err)
      toast({ title: 'Error Logging Expense', description: 'Failed to record clinic expense.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger || (
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 h-9 rounded-xl shadow-xs">
            <Plus className="w-4 h-4" /> Log Clinic Expense
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[480px] bg-white rounded-2xl border-slate-200">
        <DialogHeader className="border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900">Log Daily Clinic Expense</DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Record staff salaries, facility rent, maintenance, or supplies expenditure.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {/* Clinic Centre Selection */}
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

          <DialogFooter className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="h-9 text-xs rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 px-4 rounded-xl gap-1.5 shadow-sm">
              {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
              Save Expense Record
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
