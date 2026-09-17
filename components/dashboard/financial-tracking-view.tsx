'use client'

import { useState } from 'react'
import { 
  Users, DollarSign, Wallet, TrendingUp, ArrowUpRight, 
  Calendar, ChevronRight, Filter, IndianRupee
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

interface PhysioItem {
  id: string
  name: string
  avatar: string
  clientsHandled: number
  feeCharged: number
  moneyMade: number
  role: 'doctor' | 'physio'
}

const SAMPLE_PHYSIOS: PhysioItem[] = [
  {
    id: 'p1',
    name: 'Ananya Sharma',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78907?auto=format&fit=crop&q=80&w=200',
    clientsHandled: 86,
    feeCharged: 156000,
    moneyMade: 142800,
    role: 'physio'
  },
  {
    id: 'p2',
    name: 'Rohit Mehta',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    clientsHandled: 64,
    feeCharged: 112000,
    moneyMade: 102400,
    role: 'physio'
  },
  {
    id: 'p3',
    name: 'Simran Kaur',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200',
    clientsHandled: 58,
    feeCharged: 98000,
    moneyMade: 89600,
    role: 'physio'
  },
  {
    id: 'p4',
    name: 'Vikram Singh',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200',
    clientsHandled: 47,
    feeCharged: 82000,
    moneyMade: 73200,
    role: 'doctor'
  },
  {
    id: 'p5',
    name: 'Pooja Nair',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78907?auto=format&fit=crop&q=80&w=200',
    clientsHandled: 39,
    feeCharged: 69000,
    moneyMade: 61800,
    role: 'doctor'
  }
]

export function FinancialTrackingView() {
  const [viewTab, setViewTab] = useState<'doctor' | 'physio'>('physio')
  const [timePeriod, setTimePeriod] = useState<string>('month')

  const filteredList = SAMPLE_PHYSIOS.filter(item => 
    viewTab === 'doctor' ? item.role === 'doctor' : true
  )

  const revenueBars = [
    { period: 'Apr 1', fee: 52000, earned: 44000 },
    { period: 'Apr 8', fee: 60000, earned: 48000 },
    { period: 'Apr 15', fee: 65000, earned: 58000 },
    { period: 'Apr 22', fee: 72000, earned: 64000 },
    { period: 'Apr 29', fee: 90000, earned: 82000 },
  ]

  const maxVal = 100000

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Financial Tracking
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Client wise • Doctors & Physio wise
          </p>
        </div>

        <Select value={timePeriod} onValueChange={(val: string | null) => setTimePeriod(val ?? 'month')}>
          <SelectTrigger className="w-[160px] bg-white border-slate-200 text-xs font-semibold rounded-xl shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
            <SelectValue placeholder="Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="quarter">This Quarter</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top 3 KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Clients */}
        <Card className="border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white shadow-xs rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Clients Handled</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">342</h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>12%</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Fee Charged */}
        <Card className="border border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white shadow-xs rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
              ₹
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Fee Charged</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                ₹ 5,48,000
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>13%</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Money Made */}
        <Card className="border border-purple-100 bg-gradient-to-b from-purple-50/50 to-white shadow-xs rounded-2xl">
          <CardContent className="p-5 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Money Made</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-0.5">
                ₹ 4,26,200
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>16%</span>
              <span className="text-slate-400 font-normal">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart Card */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Revenue Trend</h3>
            <div className="flex items-center gap-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                <span className="text-slate-600">Fee Charged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Money Made</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-48 flex items-end justify-between gap-4 pt-4 px-2 border-b border-slate-100 pb-2">
            {revenueBars.map((bar, idx) => {
              const feeHeightPct = Math.round((bar.fee / maxVal) * 100)
              const earnedHeightPct = Math.round((bar.earned / maxVal) * 100)
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex justify-center items-end gap-1.5 h-full">
                    {/* Fee Charged Bar */}
                    <div
                      style={{ height: `${feeHeightPct}%` }}
                      className="w-1/3 bg-blue-600 rounded-t-md transition-all hover:bg-blue-700"
                    />
                    {/* Money Made Bar */}
                    <div
                      style={{ height: `${earnedHeightPct}%` }}
                      className="w-1/3 bg-emerald-500 rounded-t-md transition-all hover:bg-emerald-600"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">{bar.period}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Doctor / Physio Performance Breakdown Card */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white overflow-hidden">
        <CardContent className="p-0">
          {/* Tab Switcher Bar */}
          <div className="p-2 bg-slate-100/70 border-b border-slate-200/60 flex">
            <button
              onClick={() => setViewTab('doctor')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                viewTab === 'doctor'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Doctor
            </button>
            <button
              onClick={() => setViewTab('physio')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                viewTab === 'physio'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              By Physio
            </button>
          </div>

          {/* Table Header */}
          <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200/60 grid grid-cols-12 text-[11px] font-semibold text-slate-500">
            <span className="col-span-4">Physio</span>
            <span className="col-span-3 text-center">Clients Handled</span>
            <span className="col-span-2 text-right">Fee Charged</span>
            <span className="col-span-3 text-right pr-4">Money Made</span>
          </div>

          {/* List Rows */}
          <div className="divide-y divide-slate-100">
            {filteredList.map((item) => (
              <div
                key={item.id}
                className="px-6 py-4 grid grid-cols-12 items-center hover:bg-slate-50/60 transition-colors"
              >
                <div className="col-span-4 flex items-center gap-3">
                  <img
                    src={item.avatar}
                    alt={item.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <span className="font-bold text-slate-900 text-sm block leading-tight">
                      {item.name}
                    </span>
                  </div>
                </div>

                <div className="col-span-3 text-center">
                  <span className="text-sm font-semibold text-slate-800">
                    {item.clientsHandled}
                  </span>
                </div>

                <div className="col-span-2 text-right">
                  <span className="text-sm font-semibold text-slate-800">
                    {formatCurrency(item.feeCharged)}
                  </span>
                </div>

                <div className="col-span-3 flex items-center justify-end gap-3">
                  <span className="text-sm font-bold text-slate-900">
                    {formatCurrency(item.moneyMade)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
