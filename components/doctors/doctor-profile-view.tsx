'use client'

import { useState } from 'react'
import { 
  Users, Wallet, Star, ArrowUpRight, ChevronRight, 
  Sparkles, Calendar, Award, Target, Activity, Bot, ArrowRight, MapPin
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

export function DoctorProfileView() {
  const [trendPeriod, setTrendPeriod] = useState<'week' | 'month' | '3months'>('week')

  const trendData = [
    { day: 'Mon', clients: 12, fee: 20000, money: 18000 },
    { day: 'Tue', clients: 16, fee: 26000, money: 22000 },
    { day: 'Wed', clients: 20, fee: 34000, money: 28000 },
    { day: 'Thu', clients: 14, fee: 22000, money: 19000 },
    { day: 'Fri', clients: 18, fee: 30000, money: 26000 },
    { day: 'Sat', clients: 24, fee: 42000, money: 38000 },
    { day: 'Sun', clients: 22, fee: 38000, money: 35000 },
  ]

  const maxVal = 50000

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Doctor Header Card */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1594824813566-88855ce78907?auto=format&fit=crop&q=80&w=200"
                alt="Ananya Sharma"
                className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
              />
              <Badge className="absolute bottom-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
                Active
              </Badge>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Ananya Sharma
              </h1>
              <p className="text-xs font-medium text-slate-500">Senior Physiotherapist</p>
              <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold pt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>Indira Nagar Clinic</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          <Select value="this_week">
            <SelectTrigger className="w-[140px] bg-white border-slate-200 text-xs font-semibold rounded-xl shadow-xs self-start sm:self-center">
              <Calendar className="w-3.5 h-3.5 text-slate-400 mr-2" />
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Clients */}
        <Card className="border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white shadow-xs rounded-2xl">
          <CardContent className="p-4 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Clients Handled</p>
              <h3 className="text-xl font-extrabold text-slate-900">86</h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>12%</span>
              <span className="text-slate-400 font-normal">vs last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Fee Charged */}
        <Card className="border border-emerald-100 bg-gradient-to-b from-emerald-50/50 to-white shadow-xs rounded-2xl">
          <CardContent className="p-4 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs">
              ₹
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Fee Charged</p>
              <h3 className="text-xl font-extrabold text-slate-900">₹ 1,56,000</h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>16%</span>
              <span className="text-slate-400 font-normal">vs last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Money Made */}
        <Card className="border border-purple-100 bg-gradient-to-b from-purple-50/50 to-white shadow-xs rounded-2xl">
          <CardContent className="p-4 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Money Made</p>
              <h3 className="text-xl font-extrabold text-slate-900">₹ 1,42,800</h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>16%</span>
              <span className="text-slate-400 font-normal">vs last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Avg. Rating */}
        <Card className="border border-amber-100 bg-gradient-to-b from-amber-50/50 to-white shadow-xs rounded-2xl">
          <CardContent className="p-4 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] font-medium text-slate-500">Avg. Session Rating</p>
              <h3 className="text-xl font-extrabold text-slate-900">4.6 <span className="text-xs text-slate-400 font-normal">/ 5</span></h3>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
              <ArrowUpRight className="w-3 h-3" />
              <span>8%</span>
              <span className="text-slate-400 font-normal">vs last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trend Card */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-base">Performance Trend</h3>
            <div className="flex items-center p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setTrendPeriod('week')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  trendPeriod === 'week' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTrendPeriod('month')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  trendPeriod === 'month' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTrendPeriod('3months')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  trendPeriod === '3months' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3 Months
              </button>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-100 pb-2">
            {trendData.map((bar, idx) => {
              const feeHeightPct = Math.round((bar.fee / maxVal) * 100)
              const moneyHeightPct = Math.round((bar.money / maxVal) * 100)
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex justify-center items-end gap-1 h-full">
                    <div
                      style={{ height: `${feeHeightPct}%` }}
                      className="w-2.5 bg-blue-500 rounded-t-sm"
                    />
                    <div
                      style={{ height: `${moneyHeightPct}%` }}
                      className="w-2.5 bg-emerald-500 rounded-t-sm"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">{bar.day}</span>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-center gap-6 text-xs font-medium text-slate-600 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Fee Charged</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Money Made</span>
          </div>
        </CardContent>
      </Card>

      {/* AI Performance Insights Box */}
      <Card className="border border-blue-100 shadow-xs rounded-2xl bg-blue-50/50">
        <CardContent className="p-6 flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Bot className="w-5 h-5 text-blue-600" />
              <span>AI Performance Insights</span>
              <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            </div>
            <p className="text-xs text-slate-600 font-medium">
              You're doing great! But here are a few ways to grow even more:
            </p>

            <ul className="space-y-2 text-xs text-slate-700">
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Your session conversion rate is <strong>12% lower</strong> than the clinic average.</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Try adding 1 more follow-up session per patient (success rate <strong>+18%</strong>).</span>
              </li>
              <li className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>Consider introducing strength training programs for post-injury cases (you handle only <strong>28%</strong> of such cases vs. top performers at 45%).</span>
              </li>
            </ul>
          </div>

          <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-5 py-2.5 rounded-xl self-start md:self-center shrink-0 flex items-center gap-2">
            View Action Plan <ArrowRight className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white hover:border-blue-300 transition-colors cursor-pointer">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Target className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Improve Conversion</h4>
              <p className="text-xs text-slate-500">Follow-up & re-engage inactive clients</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white hover:border-blue-300 transition-colors cursor-pointer">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Focus Area</h4>
              <p className="text-xs text-slate-500">Strength training & rehab programs</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </CardContent>
        </Card>

        <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white hover:border-blue-300 transition-colors cursor-pointer">
          <CardContent className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Track Progress</h4>
              <p className="text-xs text-slate-500">View detailed client performance</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </CardContent>
        </Card>
      </div>

      {/* Footer Banner */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900">Keep it up, Ananya!</h4>
              <p className="text-[11px] text-slate-500">You're among the top 3 performers this week in your clinic.</p>
            </div>
          </div>
          <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50 text-xs px-4 py-2 rounded-xl flex items-center gap-2 font-semibold">
            View Leaderboard <ChevronRight className="w-3.5 h-3.5" />
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
