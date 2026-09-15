'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Activity, Calendar, DollarSign, UserPlus, Receipt, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { VisitWithPatient } from '@/lib/supabase/types'

interface Stats { totalPatients: number; totalVisits: number; todayVisits: number; totalRevenue: number }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalPatients: 0, totalVisits: 0, todayVisits: 0, totalRevenue: 0 })
  const [recentVisits, setRecentVisits] = useState<VisitWithPatient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]
      const [{ count: pc }, { count: vc }, { count: tvc }, { data: rev }, { data: visits }] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('visits').select('*', { count: 'exact', head: true }),
        supabase.from('visits').select('*', { count: 'exact', head: true }).eq('visit_date', today),
        supabase.from('visits').select('total'),
        supabase.from('visits').select('*, patients(full_name,uid,age,gender,phone)').order('created_at', { ascending: false }).limit(5),
      ])
      const totalRevenue = (rev ?? []).reduce((s, v) => s + (Number(v.total) || 0), 0)
      setStats({ totalPatients: pc ?? 0, totalVisits: vc ?? 0, todayVisits: tvc ?? 0, totalRevenue })
      setRecentVisits((visits as VisitWithPatient[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const statCards = [
    { title: 'Total Patients', value: stats.totalPatients, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Visits', value: stats.totalVisits, icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: "Today's Visits", value: stats.todayVisits, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
    { title: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Welcome to Physionautics Clinic Management</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => {
          const Icon = s.icon
          return (
            <Card key={s.title} className="border shadow-sm">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`${s.bg} ${s.color} p-3 rounded-lg`}><Icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{s.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Recent Visits</CardTitle>
              <Link href="/patients" className="text-sm text-blue-600 hover:underline flex items-center gap-1">View all <ArrowRight className="h-3 w-3" /></Link>
            </CardHeader>
            <CardContent>
              {recentVisits.length === 0 ? (
                <p className="text-center text-muted-foreground py-8 text-sm">No visits yet</p>
              ) : (
                <div className="space-y-3">
                  {recentVisits.map(v => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{v.patients?.full_name}</p>
                        <p className="text-xs text-muted-foreground">{v.bill_number} · {formatDate(v.visit_date)}</p>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(v.total)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardHeader><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Link href="/patients/register"><Button className="w-full justify-start gap-2" variant="outline"><UserPlus className="h-4 w-4" />Register Patient</Button></Link>
              <Link href="/billing"><Button className="w-full justify-start gap-2" variant="outline"><Receipt className="h-4 w-4" />Create New Bill</Button></Link>
              <Link href="/patients"><Button className="w-full justify-start gap-2" variant="outline"><Users className="h-4 w-4" />View Patients</Button></Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
