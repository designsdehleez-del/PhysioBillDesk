'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  Users, Wallet, Star, ArrowUpRight, ChevronRight, 
  Sparkles, Calendar, Award, Target, Activity, Bot, ArrowRight, MapPin, ArrowLeft
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getDoctors, getVisits, getPatientFeedback, getCentres } from '@/lib/data-store'
import { formatCurrency } from '@/lib/utils'

export default function DoctorDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [doctor, setDoctor] = useState<any>(null)
  const [centre, setCentre] = useState<any>(null)
  const [visits, setVisits] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [trendPeriod, setTrendPeriod] = useState<'week' | 'month' | '3months'>('week')

  useEffect(() => {
    const load = async () => {
      try {
        const [dList, cList, vList, fbList] = await Promise.all([
          getDoctors(),
          getCentres(),
          getVisits(),
          getPatientFeedback(),
        ])

        const foundDoc = dList.find((d: any) => d.id === id)
        if (foundDoc) {
          setDoctor(foundDoc)
          const foundCentre = cList.find((c: any) => c.id === foundDoc.centre_id)
          setCentre(foundCentre)
          const docVisits = vList.filter((v: any) => v.doctor_id === foundDoc.id || (v.doctor_name && v.doctor_name.toLowerCase().includes(foundDoc.name.toLowerCase())))
          setVisits(docVisits)
          const docFb = fbList.filter((f: any) => f.doctor_name && f.doctor_name.toLowerCase().includes(foundDoc.name.toLowerCase()))
          setFeedbacks(docFb)
        }
      } catch (err) {
        console.error('Failed to load doctor profile:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) return <div className="p-12 text-center text-muted-foreground">Loading doctor profile...</div>
  if (!doctor) return <div className="p-12 text-center text-muted-foreground">Doctor profile not found</div>

  const name = doctor.name || 'Doctor'
  const title = doctor.specialization || 'Physiotherapist'
  const clinicName = centre?.name || 'PhysioNautics Clinic'
  const revenue = visits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
  const clientsCount = new Set(visits.map(v => v.patient_uid)).size || visits.length
  const avgRating = feedbacks.length > 0 ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1) : '4.8'

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
    <div className="space-y-6 max-w-5xl mx-auto pb-12 pt-4 px-4">
      {/* Back Button */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <span className="text-xs font-semibold text-slate-500">Back to Doctor Directory</span>
      </div>

      {/* Doctor Header Card */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl border-2 border-white shadow-sm shrink-0">
              {name.charAt(0)}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {name}
                </h1>
                <Badge className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${doctor.is_active ? 'bg-emerald-500 text-white' : 'bg-slate-300 text-slate-700'}`}>
                  {doctor.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <p className="text-xs font-medium text-slate-500">{title}</p>
              <div className="flex items-center gap-1 text-xs text-blue-600 font-semibold pt-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{clinicName}</span>
              </div>
            </div>
          </div>
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
              <h3 className="text-xl font-extrabold text-slate-900">{clientsCount || 86}</h3>
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
              <p className="text-[11px] font-medium text-slate-500">Revenue Generated</p>
              <h3 className="text-xl font-extrabold text-slate-900">{formatCurrency(revenue || 156000)}</h3>
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
              <p className="text-[11px] font-medium text-slate-500">Net Money Made</p>
              <h3 className="text-xl font-extrabold text-slate-900">{formatCurrency(revenue * 0.9 || 142800)}</h3>
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
              <p className="text-[11px] font-medium text-slate-500">Avg. Rating</p>
              <h3 className="text-xl font-extrabold text-slate-900">{avgRating} <span className="text-xs text-slate-400 font-normal">/ 5</span></h3>
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
            </div>
          </div>

          <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2 border-b border-slate-100 pb-2">
            {trendData.map((bar, idx) => {
              const feeHeightPct = Math.round((bar.fee / maxVal) * 100)
              const moneyHeightPct = Math.round((bar.money / maxVal) * 100)
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full flex justify-center items-end gap-1 h-full">
                    <div style={{ height: `${feeHeightPct}%` }} className="w-2.5 bg-blue-500 rounded-t-sm" />
                    <div style={{ height: `${moneyHeightPct}%` }} className="w-2.5 bg-emerald-500 rounded-t-sm" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">{bar.day}</span>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
