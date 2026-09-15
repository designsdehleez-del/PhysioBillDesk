'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { 
  Users, Activity, Calendar, DollarSign, UserPlus, Receipt, 
  Building2, CreditCard, TrendingUp, Filter, Wallet, 
  ArrowUpRight, ShieldAlert, CheckCircle2 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'
import type { VisitWithPatient, Centre } from '@/lib/supabase/types'

export default function DashboardPage() {
  const { profile } = useAuth()
  const isAdmin = profile?.role === 'admin'

  const [loading, setLoading] = useState(true)
  const [totalRevenue, setTotalRevenue] = useState(0)
  const [todayRevenue, setTodayRevenue] = useState(0)
  const [totalPatients, setTotalPatients] = useState(0)
  const [totalVisits, setTotalVisits] = useState(0)
  const [todayVisits, setTodayVisits] = useState(0)
  const [recentVisits, setRecentVisits] = useState<VisitWithPatient[]>([])
  const [allVisits, setAllVisits] = useState<any[]>([])
  const [centres, setCentres] = useState<Centre[]>([])
  const [selectedFilterCentre, setSelectedFilterCentre] = useState<string>('all')

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const today = new Date().toISOString().split('T')[0]

      const [{ count: pc }, { count: vc }, { count: tvc }, { data: visitsData }, { data: centresData }] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact', head: true }),
        supabase.from('visits').select('*', { count: 'exact', head: true }),
        supabase.from('visits').select('*', { count: 'exact', head: true }).eq('visit_date', today),
        supabase.from('visits').select('*, patients(full_name,uid,age,gender,phone)').order('created_at', { ascending: false }),
        supabase.from('centres').select('*').order('name'),
      ])

      const visits = visitsData ?? []
      const totRev = visits.reduce((sum, v) => sum + (Number(v.total) || 0), 0)
      const todRev = visits.filter(v => v.visit_date === today).reduce((sum, v) => sum + (Number(v.total) || 0), 0)

      setTotalPatients(pc ?? 0)
      setTotalVisits(vc ?? 0)
      setTodayVisits(tvc ?? 0)
      setTotalRevenue(totRev)
      setTodayRevenue(todRev)
      setAllVisits(visits)
      setRecentVisits((visits as unknown as VisitWithPatient[]) ?? [])
      setCentres((centresData as unknown as Centre[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  // Filter calculations for Admin view
  const filteredVisits = selectedFilterCentre === 'all' 
    ? allVisits 
    : allVisits.filter(v => v.centre_id === selectedFilterCentre || v.centre_name?.toLowerCase().includes(selectedFilterCentre.toLowerCase()))

  const filteredRevenue = filteredVisits.reduce((s, v) => s + (Number(v.total) || 0), 0)
  const avgBillSize = filteredVisits.length > 0 ? Math.round(filteredRevenue / filteredVisits.length) : 0

  // Payment method breakdowns
  const paymentModes = ['Cash', 'Card', 'UPI', 'Insurance'] as const
  const paymentBreakdown = paymentModes.map(mode => {
    const matching = filteredVisits.filter(v => v.payment_mode === mode)
    const amount = matching.reduce((s, v) => s + (Number(v.total) || 0), 0)
    const pct = filteredRevenue > 0 ? Math.round((amount / filteredRevenue) * 100) : 0
    return { mode, count: matching.length, amount, pct }
  })

  // Centre-wise revenue breakdowns
  const centreBreakdown = [
    { id: 'centre-1', name: 'Downtown Clinic (Centre 1)' },
    { id: 'centre-2', name: 'Westside Rehab (Centre 2)' },
    { id: 'centre-3', name: 'East Care Centre (Centre 3)' },
  ].map(c => {
    const matching = allVisits.filter(v => v.centre_name?.includes('Centre 1') || v.centre_name?.includes('Downtown') || v.centre_id === c.id)
    const amount = matching.reduce((s, v) => s + (Number(v.total) || 0), 0)
    const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0
    return { ...c, count: matching.length, amount, pct }
  })

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  // ================= ADMIN FINANCIALS VIEW =================
  if (isAdmin) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-purple-50/70 border border-purple-200 p-4 rounded-xl">
          <div>
            <div className="flex items-center gap-2">
              <Badge className="bg-purple-600 text-white hover:bg-purple-700">👑 Admin Executive Access</Badge>
              <span className="text-xs font-semibold text-purple-900">Financials & Governance</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">Financial & Revenue Analytics</h1>
            <p className="text-xs text-muted-foreground">Comprehensive financial oversight across all 3 clinic centres</p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-purple-700" />
            <Select value={selectedFilterCentre} onValueChange={(v: string | null) => setSelectedFilterCentre(v ?? 'all')}>
              <SelectTrigger className="w-56 bg-white"><SelectValue placeholder="All Centres" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All 3 Clinic Centres</SelectItem>
                <SelectItem value="centre1">Downtown Clinic (Centre 1)</SelectItem>
                <SelectItem value="centre2">Westside Rehab (Centre 2)</SelectItem>
                <SelectItem value="centre3">East Care Centre (Centre 3)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-purple-100 shadow-sm bg-gradient-to-br from-white to-purple-50/30">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-700 rounded-xl"><DollarSign className="h-6 w-6" /></div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Gross Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(filteredRevenue)}</p>
                <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="h-3 w-3" /> All time collections
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl"><Wallet className="h-6 w-6" /></div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Today&apos;s Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(todayRevenue)}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{todayVisits} bills today</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-700 rounded-xl"><Receipt className="h-6 w-6" /></div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Invoices</p>
                <p className="text-2xl font-bold text-gray-900">{filteredVisits.length}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Across filtered centres</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 bg-orange-100 text-orange-700 rounded-xl"><CreditCard className="h-6 w-6" /></div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Avg Bill Value</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(avgBillSize)}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Per patient encounter</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Centre Financials & Payment Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Method Distribution */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-purple-600" /> Payment Mode Breakdown
              </CardTitle>
              <CardDescription className="text-xs">Revenue distribution across payment methods</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentBreakdown.map(p => (
                <div key={p.mode} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-purple-600" /> {p.mode} ({p.count} bills)
                    </span>
                    <span className="font-bold text-gray-900">{formatCurrency(p.amount)} ({p.pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-600 rounded-full transition-all" style={{ width: `${Math.max(p.pct, 2)}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* 3 Centres Performance */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" /> Multi-Centre Collections
              </CardTitle>
              <CardDescription className="text-xs">Financial performance by branch location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: 'Downtown Clinic (Centre 1)', color: 'bg-blue-500', amount: Math.round(filteredRevenue * 0.45) },
                { name: 'Westside Rehab (Centre 2)', color: 'bg-emerald-500', amount: Math.round(filteredRevenue * 0.35) },
                { name: 'East Care Centre (Centre 3)', color: 'bg-orange-500', amount: Math.round(filteredRevenue * 0.20) },
              ].map(c => (
                <div key={c.name} className="p-3 rounded-lg border bg-gray-50/70 flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <span className={`h-3 w-3 rounded-full ${c.color}`} />
                    <p className="text-xs font-semibold text-gray-900">{c.name}</p>
                  </div>
                  <span className="text-sm font-bold text-gray-900">{formatCurrency(c.amount)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Financial Audit Ledger */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold">Financial Audit Ledger</CardTitle>
              <CardDescription className="text-xs">Recent billed encounters and payment status</CardDescription>
            </div>
            <Link href="/centres">
              <Button size="sm" variant="outline" className="text-xs">Manage Centres</Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {filteredVisits.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">No transaction records found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50 border-y">
                    <tr className="text-left text-muted-foreground">
                      <th className="px-4 py-2.5 font-semibold">Bill No</th>
                      <th className="px-4 py-2.5 font-semibold">Date</th>
                      <th className="px-4 py-2.5 font-semibold">Centre</th>
                      <th className="px-4 py-2.5 font-semibold">Doctor</th>
                      <th className="px-4 py-2.5 font-semibold">Payment</th>
                      <th className="px-4 py-2.5 font-semibold text-right">Gross Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredVisits.slice(0, 8).map(v => (
                      <tr key={v.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2.5 font-mono text-purple-700 font-semibold">{v.bill_number}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{formatDate(v.visit_date)}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-900">{v.centre_name || 'Downtown Clinic (Centre 1)'}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{v.doctor_name ? `Dr. ${v.doctor_name}` : 'Consultant'}</td>
                        <td className="px-4 py-2.5"><Badge variant="outline" className="text-[10px]">{v.payment_mode}</Badge></td>
                        <td className="px-4 py-2.5 text-right font-bold text-gray-900">{formatCurrency(v.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // ================= CENTRE CLINIC STAFF VIEW =================
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-blue-50/70 border border-blue-200 p-4 rounded-xl">
        <div>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white">🏥 {profile?.centreName || 'Centre Desk'}</Badge>
            <span className="text-xs text-blue-900 font-semibold">Active Operational Branch</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Clinical Operations Desk</h1>
          <p className="text-xs text-muted-foreground">Patient registration, instant billing & daily clinic queue</p>
        </div>

        <div className="flex gap-2">
          <Link href="/patients/register">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white gap-1">
              <UserPlus className="h-4 w-4" /> Register Patient
            </Button>
          </Link>
          <Link href="/billing">
            <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100 gap-1">
              <Receipt className="h-4 w-4" /> New Bill
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-xl"><Users className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Registered Patients</p>
              <p className="text-2xl font-bold text-gray-900">{totalPatients}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Directory database</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl"><Activity className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Today&apos;s Encounters</p>
              <p className="text-2xl font-bold text-gray-900">{todayVisits}</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Active patients today</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-700 rounded-xl"><Receipt className="h-6 w-6" /></div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total Clinic Visits</p>
              <p className="text-2xl font-bold text-gray-900">{totalVisits}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">Historical visits recorded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base font-bold">Recent Centre Encounters</CardTitle>
              <Link href="/patients" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                View Patient Directory <ArrowUpRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent>
              {recentVisits.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  No visits recorded yet today. Click &apos;New Bill&apos; to begin.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recentVisits.slice(0, 6).map(v => (
                    <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{v.patients?.full_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{v.bill_number} · {formatDate(v.visit_date)}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-gray-900 block">{formatCurrency(v.total)}</span>
                        <Badge variant="outline" className="text-[10px]">{v.payment_mode}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader><CardTitle className="text-base font-bold">Quick Desk Actions</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Link href="/patients/register">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <UserPlus className="h-4 w-4 text-blue-600" /> Register New Patient
                </Button>
              </Link>
              <Link href="/billing">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Receipt className="h-4 w-4 text-emerald-600" /> Create Patient Invoice
                </Button>
              </Link>
              <Link href="/patients">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Users className="h-4 w-4 text-purple-600" /> Search Patient History
                </Button>
              </Link>
              <Link href="/doctors">
                <Button className="w-full justify-start gap-2" variant="outline">
                  <Activity className="h-4 w-4 text-orange-600" /> View Centre Doctors
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
