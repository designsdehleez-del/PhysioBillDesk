'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Sparkles,
  UserPlus,
  Receipt,
  Printer,
  Share2,
  CheckCircle2,
  ArrowRight,
  Stethoscope,
  Building2,
  Star,
  Activity,
  X,
  Play,
  HelpCircle,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getCentres, getDoctors, getServices } from '@/lib/data-store'

export function ClinicWorkflowGuide() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [simulating, setSimulating] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)

  const STEPS = [
    {
      num: 1,
      title: 'Patient Intake',
      subtitle: 'Auto-generates CLN-YYYYMM-XXXX in Supabase',
      icon: UserPlus,
      href: '/patients/register',
      color: 'from-blue-600 to-indigo-600',
      description: 'Collect patient name, phone, age, blood group, and clinical history.',
    },
    {
      num: 2,
      title: 'Doctor & Procedure Billing',
      subtitle: 'Doctor mapped to branch + discounts',
      icon: Receipt,
      href: '/billing',
      color: 'from-teal-600 to-emerald-600',
      description: 'Select branch doctor, assign therapy procedures, and generate INV-YYYYMM-XXXX invoice.',
    },
    {
      num: 3,
      title: 'Thermal & A4 Invoice',
      subtitle: 'Instant print & QR receipt',
      icon: Printer,
      href: '/billing',
      color: 'from-amber-600 to-orange-600',
      description: 'Thermal 80mm roll or A4 GST invoice with doctor breakdown and QR link.',
    },
    {
      num: 4,
      title: 'Cross-Clinic Sync',
      subtitle: 'Real-time multi-branch history',
      icon: Building2,
      href: '/patients',
      color: 'from-purple-600 to-pink-600',
      description: 'Visit timeline immediately accessible across NFC, Vasant Vihar, and Gurugram.',
    },
    {
      num: 5,
      title: 'AI Patient Feedback',
      subtitle: 'Doctor & Invoice Attribution',
      icon: Star,
      href: '/feedback-builder',
      color: 'from-emerald-600 to-teal-700',
      description: 'Patient receives personalized review link attributed to treating therapist.',
    },
  ]

  const handleSimulateQuickRun = async () => {
    setSimulating(true)
    try {
      const supabase = createClient()
      const centres = await getCentres()
      const nfc = centres.find(c => c.name.toLowerCase().includes('friends')) || centres[0]
      const doctors = await getDoctors(nfc.id)
      const doc = doctors[0] || { id: 'doc-101', name: 'Dr. Sarah Jenkins' }
      const services = await getServices()
      const laser = services.find(s => s.name.includes('Laser')) || services[0]

      // 1. Create Patient in Supabase
      let uid = `CLN-${new Date().toISOString().slice(0, 7).replace('-', '')}-9999`
      try {
        const { data: rpcUid } = await supabase.rpc('generate_patient_uid')
        if (rpcUid) uid = rpcUid
      } catch (_) {}

      const { data: patientData, error: patErr } = await supabase.from('patients').insert({
        uid,
        full_name: 'Simulated Clinical Workflow Patient',
        age: 34,
        gender: 'Female',
        phone: '9811122334',
        address: 'NFC Branch, New Delhi',
        blood_group: 'B+',
        medical_notes: 'Cervical stiffness & upper trap trigger points. End-to-end workflow simulation record.',
      }).select('id').single()

      if (patErr) throw patErr
      const patientId = patientData.id

      // 2. Create Visit in Supabase
      let billNo = `INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-9999`
      try {
        const { data: rpcBill } = await supabase.rpc('generate_bill_number')
        if (rpcBill) billNo = rpcBill
      } catch (_) {}

      const { data: visitData, error: visErr } = await supabase.from('visits').insert({
        bill_number: billNo,
        patient_id: patientId,
        doctor_id: doc.id,
        doctor_name: doc.name,
        centre_id: nfc.id,
        centre_name: nfc.name,
        payment_mode: 'UPI',
        subtotal: Number(laser.price) || 1000,
        discount: 100,
        total: (Number(laser.price) || 1000) - 100,
        visit_date: new Date().toISOString().split('T')[0],
      }).select('id').single()

      if (visErr) throw visErr

      // 3. Insert Visit Service Line Item
      await supabase.from('visit_services').insert({
        visit_id: visitData.id,
        service_id: laser.id,
        service_name: laser.name,
        price: Number(laser.price) || 1000,
        quantity: 1,
      })

      toast.success(`✨ End-to-End Workflow Simulated! Patient: ${uid}, Invoice: ${billNo}`)
      setIsOpen(false)
      // Open patient profile with cross-clinic visit history
      router.push(`/patients/${patientId}`)
    } catch (err: any) {
      toast.error('Simulation error: ' + (err?.message || 'Check database'))
    } finally {
      setSimulating(false)
    }
  }

  return (
    <>
      {/* Trigger Button in Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-linear-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-semibold shadow-md shadow-teal-900/20 transition-all cursor-pointer select-none"
      >
        <Activity className="w-3.5 h-3.5 animate-pulse text-amber-300" />
        <span>Clinic Workflow Guide</span>
        <Badge variant="secondary" className="bg-white/20 text-white text-[10px] px-1.5 py-0 h-4">
          5-Step
        </Badge>
      </button>

      {/* Interactive Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="bg-linear-to-r from-teal-950 via-teal-900 to-emerald-950 text-white p-6 rounded-t-2xl relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full p-1.5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2 text-teal-200 text-xs font-semibold uppercase tracking-wider mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Live Supabase Multi-Clinic System
              </div>
              <h2 className="text-2xl font-bold text-white">End-to-End Clinic Workflow</h2>
              <p className="text-xs text-teal-100 max-w-xl mt-1">
                From front-desk patient intake to doctor billing, cross-branch sync, and AI feedback collection.
              </p>
            </div>

            {/* Steps Timeline */}
            <div className="p-6 space-y-4 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {STEPS.map(step => {
                  const Icon = step.icon
                  return (
                    <div
                      key={step.num}
                      onClick={() => setCurrentStep(step.num)}
                      className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                        currentStep === step.num
                          ? 'border-teal-500 bg-teal-50/50 shadow-sm'
                          : 'border-gray-200 hover:border-teal-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white bg-linear-to-br ${step.color}`}>
                          {step.num}
                        </span>
                        <Icon className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="text-xs font-bold text-gray-900 leading-tight">{step.title}</div>
                      <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{step.subtitle}</div>
                    </div>
                  )
                })}
              </div>

              {/* Active Step Details */}
              {STEPS.find(s => s.num === currentStep) && (
                <Card className="border-teal-200 bg-linear-to-br from-teal-50/40 to-white shadow-xs">
                  <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-800">
                        <span className="w-2 h-2 rounded-full bg-teal-500" />
                        Step {currentStep} Active Focus
                      </div>
                      <h3 className="text-base font-bold text-gray-900">
                        {STEPS[currentStep - 1].title}
                      </h3>
                      <p className="text-xs text-gray-600 max-w-lg">
                        {STEPS[currentStep - 1].description}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setIsOpen(false)
                          router.push(STEPS[currentStep - 1].href)
                        }}
                        className="bg-teal-700 hover:bg-teal-800 text-white text-xs font-semibold"
                      >
                        Open {STEPS[currentStep - 1].title}
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Bottom Actions Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="text-gray-500 text-center sm:text-left">
                Want to test the full pipeline in 1-click?
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-xs flex-1 sm:flex-none"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  disabled={simulating}
                  onClick={handleSimulateQuickRun}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex-1 sm:flex-none shadow-md"
                >
                  <Play className={`w-3.5 h-3.5 mr-1.5 ${simulating ? 'animate-spin' : ''}`} />
                  {simulating ? 'Simulating Pipeline...' : 'Run 1-Click Simulation'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
