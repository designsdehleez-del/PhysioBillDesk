'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, UserPlus, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Patient } from '@/lib/supabase/types'

interface PatientRow extends Patient {
  last_visit?: string; total_bills?: number; total_amount?: number
}

export default function PatientListPage() {
  const router = useRouter()
  const [patients, setPatients] = useState<PatientRow[]>([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    let q = supabase.from('patients').select('*').order('created_at', { ascending: false })
    if (query.trim()) {
      q = q.or(`uid.ilike.%${query}%,full_name.ilike.%${query}%,phone.ilike.%${query}%`)
    }
    const { data } = await q.limit(100)
    if (!data) { setLoading(false); return }
    const ids = data.map(p => p.id)
    const { data: visits } = await supabase.from('visits').select('patient_id,total,visit_date').in('patient_id', ids)
    const mapped: PatientRow[] = data.map(p => {
      const pv = (visits ?? []).filter(v => v.patient_id === p.id)
      return { ...p, last_visit: pv.sort((a,b)=>b.visit_date.localeCompare(a.visit_date))[0]?.visit_date, total_bills: pv.length, total_amount: pv.reduce((s,v)=>s+Number(v.total),0) }
    })
    setPatients(mapped); setLoading(false)
  }, [query])

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [load])

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Patient List</h1><p className="text-sm text-muted-foreground">{patients.length} patients found</p></div>
        <Button onClick={() => router.push('/patients/register')}><UserPlus className="h-4 w-4 mr-2" />Register Patient</Button>
      </div>
      <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by UID, name, or phone…" value={query} onChange={e => setQuery(e.target.value)} />
      </div>
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" /></div>
          ) : patients.length === 0 ? (
            <div className="text-center py-12"><Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" /><p className="text-muted-foreground">No patients found</p>
              <Button className="mt-4" onClick={() => router.push('/patients/register')}>Register First Patient</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">UID</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Name</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Age</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Gender</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Phone</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Last Visit</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Bills</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {patients.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => router.push(`/patients/${p.id}`)}>
                      <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium">{p.uid}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{p.full_name}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.age}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.gender}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.phone}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{p.last_visit ? formatDate(p.last_visit) : '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{p.total_bills ?? 0}</td>
                      <td className="px-4 py-3 font-medium hidden lg:table-cell">{formatCurrency(p.total_amount ?? 0)}</td>
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
