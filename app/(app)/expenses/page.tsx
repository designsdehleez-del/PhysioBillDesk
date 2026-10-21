'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { 
  Wallet, Search, Filter, Plus, FileSpreadsheet, 
  Building2, Calendar, CreditCard, Tag, FileImage, 
  ExternalLink, Edit3, Trash2, ArrowUpDown, CheckCircle2,
  AlertCircle, Download, ArrowDownRight, RefreshCw, Layers
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import { useToast } from '@/components/ui/use-toast'
import { 
  getExpenses, deleteExpense, exportExpensesToExcel, getCentres 
} from '@/lib/data-store'
import { ExpenseLoggingModal } from '@/components/dashboard/expense-logging-modal'
import { EditExpenseModal } from '@/components/dashboard/edit-expense-modal'
import type { ClinicExpense, ExpenseCategory, Centre } from '@/lib/supabase/types'

const CATEGORIES: ExpenseCategory[] = [
  'Staff Salaries',
  'Rent & Lease',
  'Equipment & Maintenance',
  'Medical Supplies',
  'Utilities & Bills',
  'Marketing & Admin',
  'Miscellaneous',
]

export default function ExpensesPage() {
  const { profile } = useAuth()
  const { toast } = useToast()
  const isAdmin = !profile || profile?.role === 'admin' || (profile?.role !== 'clinic_reception' && profile?.role !== 'doctor')
  const userCentreId = profile?.centreId

  const [loading, setLoading] = useState(true)
  const [expenses, setExpenses] = useState<ClinicExpense[]>([])
  const [centres, setCentres] = useState<Centre[]>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCentre, setSelectedCentre] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState<'all' | 'today' | '7days' | '30days' | 'this_month'>('all')

  // Modals
  const [viewingReceiptUrl, setViewingReceiptUrl] = useState<string | null>(null)
  const [editingExpense, setEditingExpense] = useState<ClinicExpense | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      const [expData, centreData] = await Promise.all([
        getExpenses(),
        getCentres(),
      ])
      setExpenses(expData || [])
      setCentres(centreData || [])
    } catch (err) {
      console.error('Failed to load expenses:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()

    const handleExpensesUpdated = (e: any) => {
      if (e?.detail) setExpenses(e.detail)
      else getExpenses().then(setExpenses)
    }

    window.addEventListener('physio-expenses-updated', handleExpensesUpdated)
    return () => {
      window.removeEventListener('physio-expenses-updated', handleExpensesUpdated)
    }
  }, [])

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]
    const currentMonthStr = todayStr.substring(0, 7) // YYYY-MM

    return expenses.filter(e => {
      if (!e) return false

      // Role isolation: non-admins see only their centre
      if (!isAdmin && userCentreId) {
        const matchesStaff = e.centre_id === userCentreId || 
          (e.centre_name && profile?.centreName && e.centre_name.toLowerCase().includes(profile.centreName.toLowerCase()))
        if (!matchesStaff) return false
      } else if (selectedCentre !== 'all') {
        const selectedCentreObj = centres.find(c => c.id === selectedCentre)
        const selectedCentreName = selectedCentreObj?.name ? selectedCentreObj.name.toLowerCase() : ''
        const eCentreName = e.centre_name ? e.centre_name.toLowerCase() : ''
        const matchesCentre = e.centre_id === selectedCentre || 
          (eCentreName && selectedCentreName && eCentreName.includes(selectedCentreName))
        if (!matchesCentre) return false
      }

      // Category filter
      if (selectedCategory !== 'all' && e.category !== selectedCategory) {
        return false
      }

      // Payment method filter
      if (selectedPaymentMethod !== 'all' && e.payment_method !== selectedPaymentMethod) {
        return false
      }

      // Timeframe filter
      if (e.expense_date) {
        if (selectedTimeframe === 'today' && e.expense_date !== todayStr) return false
        if (selectedTimeframe === 'this_month' && !e.expense_date.startsWith(currentMonthStr)) return false
        if (selectedTimeframe === '7days') {
          const d = new Date(e.expense_date)
          if ((now.getTime() - d.getTime()) / (1000 * 3600 * 24) > 7) return false
        }
        if (selectedTimeframe === '30days') {
          const d = new Date(e.expense_date)
          if ((now.getTime() - d.getTime()) / (1000 * 3600 * 24) > 30) return false
        }
      }

      // Search query (matches description, category, logged_by, centre_name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesDesc = (e.description || '').toLowerCase().includes(q)
        const matchesCat = (e.category || '').toLowerCase().includes(q)
        const matchesLoggedBy = (e.logged_by_name || '').toLowerCase().includes(q)
        const matchesCentreName = (e.centre_name || '').toLowerCase().includes(q)
        const matchesAmount = e.amount?.toString().includes(q)
        if (!matchesDesc && !matchesCat && !matchesLoggedBy && !matchesCentreName && !matchesAmount) {
          return false
        }
      }

      return true
    })
  }, [expenses, isAdmin, userCentreId, profile, selectedCentre, centres, selectedCategory, selectedPaymentMethod, selectedTimeframe, searchQuery])

  // Aggregate Metrics
  const totalAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  }, [filteredExpenses])

  const upiVerifiedAmount = useMemo(() => {
    return filteredExpenses
      .filter(e => e.receipt_url)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0)
  }, [filteredExpenses])

  const avgExpense = useMemo(() => {
    return filteredExpenses.length > 0 ? Math.round(totalAmount / filteredExpenses.length) : 0
  }, [totalAmount, filteredExpenses.length])

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this expense record? This action cannot be undone.')) {
      return
    }
    setDeletingId(id)
    try {
      await deleteExpense(id)
      toast({
        title: 'Expense Deleted',
        description: 'The expense log was successfully removed.',
      })
    } catch (err) {
      console.error(err)
      toast({ title: 'Delete Failed', description: 'Could not remove expense.', variant: 'destructive' })
    } finally {
      setDeletingId(null)
    }
  }

  const handleExport = () => {
    exportExpensesToExcel(filteredExpenses)
    toast({
      title: 'Excel Export Ready',
      description: `Exported ${filteredExpenses.length} expense records.`,
    })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-xs">
              <Wallet className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Clinic Expense Ledger & Management
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Complete audit trail of clinic operational expenditures, staff payouts, utility bills, and verified UPI receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="text-xs font-bold gap-1.5 h-9 rounded-xl border-slate-200 hover:bg-slate-50 shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            Download Excel
          </Button>

          <ExpenseLoggingModal
            centres={centres}
            userCentreId={userCentreId}
            userCentreName={profile?.centreName}
            userName={profile?.name}
            onExpenseAdded={loadData}
            trigger={
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1.5 h-9 rounded-xl shadow-xs">
                <Plus className="w-4 h-4" /> Log New Expense
              </Button>
            }
          />
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="shadow-2xs border-slate-200 bg-white">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Filtered Expenditure</p>
            <p className="text-2xl font-black text-rose-700">{formatCurrency(totalAmount)}</p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <ArrowDownRight className="w-3 h-3 text-rose-500" /> Across {filteredExpenses.length} logged items
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-slate-200 bg-white">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">UPI Verified Proofs</p>
            <p className="text-2xl font-black text-emerald-700">{formatCurrency(upiVerifiedAmount)}</p>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {filteredExpenses.filter(e => e.receipt_url).length} verified receipts
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-slate-200 bg-white">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Expense / Entry</p>
            <p className="text-2xl font-black text-slate-900">{formatCurrency(avgExpense)}</p>
            <p className="text-[11px] text-slate-400">Transaction velocity index</p>
          </CardContent>
        </Card>

        <Card className="shadow-2xs border-slate-200 bg-white">
          <CardContent className="p-4 space-y-1">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Ledger Records</p>
            <p className="text-2xl font-black text-blue-700">{expenses.length}</p>
            <p className="text-[11px] text-slate-400">All-time clinic expenditures</p>
          </CardContent>
        </Card>
      </div>

      {/* Multi-Filter Bar */}
      <Card className="shadow-2xs border-slate-200 bg-white">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <Input
                placeholder="Search by description, staff, clinic branch, or amount..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-slate-50 border-slate-200 rounded-xl"
              />
            </div>

            {/* Timeframe Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
              {(['all', 'today', '7days', '30days', 'this_month'] as const).map(tf => {
                const labels: Record<string, string> = {
                  all: 'All Time',
                  today: 'Today',
                  '7days': '7 Days',
                  '30days': '30 Days',
                  this_month: 'This Month',
                }
                const active = selectedTimeframe === tf
                return (
                  <button
                    key={tf}
                    onClick={() => setSelectedTimeframe(tf)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
                      active ? 'bg-slate-900 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
                    }`}
                  >
                    {labels[tf]}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
            {/* Clinic Branch Filter */}
            {isAdmin && (
              <Select value={selectedCentre} onValueChange={(v: string | null) => setSelectedCentre(v ?? 'all')}>
                <SelectTrigger className="h-8 text-xs bg-slate-50 font-medium border-slate-200 rounded-lg">
                  <SelectValue placeholder="All Clinic Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="text-xs">All Clinic Branches</SelectItem>
                  {centres.map(c => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={(v: string | null) => setSelectedCategory(v ?? 'all')}>
              <SelectTrigger className="h-8 text-xs bg-slate-50 font-medium border-slate-200 rounded-lg">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Categories</SelectItem>
                {CATEGORIES.map(cat => (
                  <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Payment Method Filter */}
            <Select value={selectedPaymentMethod} onValueChange={(v: string | null) => setSelectedPaymentMethod(v ?? 'all')}>
              <SelectTrigger className="h-8 text-xs bg-slate-50 font-medium border-slate-200 rounded-lg">
                <SelectValue placeholder="All Payment Modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All Payment Modes</SelectItem>
                <SelectItem value="UPI" className="text-xs">UPI / GPay</SelectItem>
                <SelectItem value="Cash" className="text-xs">Cash</SelectItem>
                <SelectItem value="Bank Transfer" className="text-xs">Bank Transfer</SelectItem>
                <SelectItem value="Card" className="text-xs">Credit/Debit Card</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Ledger Table */}
      <Card className="shadow-2xs border-slate-200 bg-white overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
            <span>Expenses Ledger ({filteredExpenses.length})</span>
            {searchQuery && (
              <Badge variant="outline" className="text-[10px] bg-slate-100 font-normal">
                Filtered by &quot;{searchQuery}&quot;
              </Badge>
            )}
          </div>
          <span className="text-xs font-black text-rose-700">
            Total: {formatCurrency(totalAmount)}
          </span>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <p className="text-sm font-bold text-slate-700">No expenses found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No expenditure entries match your current search and filter criteria. Log a new expense to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 text-[10px]">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Clinic Centre</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4 text-center">UPI Proof</th>
                  <th className="py-3 px-4 text-right">Amount (₹)</th>
                  {isAdmin && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-700">
                      {formatDate(e.expense_date)}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 max-w-[220px]">
                      <div className="font-bold text-slate-900 truncate">{e.description}</div>
                      <div className="text-[10px] text-slate-400">
                        Logged by: {e.logged_by_name || 'Staff'}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {e.category}
                      </span>
                    </td>

                    {/* Centre */}
                    <td className="py-3 px-4 whitespace-nowrap text-slate-600 font-medium">
                      {e.centre_name || 'Physionautics Multispecialty'}
                    </td>

                    {/* Payment Mode */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        e.payment_method === 'UPI' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80' 
                          : e.payment_method === 'Cash'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/80'
                          : 'bg-blue-50 text-blue-700 border border-blue-200/80'
                      }`}>
                        {e.payment_method || 'UPI'}
                      </span>
                    </td>

                    {/* UPI / Proof Attachment */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {e.receipt_url ? (
                        <button
                          type="button"
                          onClick={() => setViewingReceiptUrl(e.receipt_url!)}
                          className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 px-2 py-1 rounded-lg transition-colors cursor-pointer shadow-2xs"
                          title="Click to view full UPI screenshot proof"
                        >
                          <FileImage className="w-3.5 h-3.5 text-emerald-600" />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-normal italic">None</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span className="font-black text-rose-700 text-sm">
                        {formatCurrency(e.amount)}
                      </span>
                    </td>

                    {/* Admin Actions */}
                    {isAdmin && (
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingExpense(e)}
                            className="h-7 w-7 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                            title="Edit expense details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={deletingId === e.id}
                            onClick={() => handleDelete(e.id)}
                            className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Delete expense"
                          >
                            {deletingId === e.id ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Trash2 className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Edit Expense Modal */}
      <EditExpenseModal
        expense={editingExpense}
        open={!!editingExpense}
        onOpenChange={(open) => { if (!open) setEditingExpense(null) }}
        centres={centres}
        onExpenseUpdated={loadData}
      />

      {/* UPI / Expense Receipt Lightbox Modal */}
      <Dialog open={!!viewingReceiptUrl} onOpenChange={(open) => { if (!open) setViewingReceiptUrl(null) }}>
        <DialogContent className="sm:max-w-[540px] bg-white rounded-2xl border-slate-200 p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <FileImage className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-sm font-bold text-slate-900">UPI Payment & Expense Proof</DialogTitle>
                <p className="text-[11px] text-slate-500">Transaction screenshot verification</p>
              </div>
            </div>
            {viewingReceiptUrl && (
              <a
                href={viewingReceiptUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200"
              >
                <ExternalLink className="w-3 h-3" /> Open Full
              </a>
            )}
          </div>
          <div className="p-4 bg-slate-900/5 flex items-center justify-center max-h-[70vh] overflow-auto">
            {viewingReceiptUrl && (
              <img
                src={viewingReceiptUrl}
                alt="Payment Proof Screenshot"
                className="max-h-[60vh] w-auto max-w-full rounded-xl shadow-md object-contain border border-slate-200"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
