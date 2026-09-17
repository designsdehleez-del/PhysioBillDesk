'use client'

import { useState } from 'react'
import { 
  Clock, ShieldCheck, Target, Sparkles, QrCode, 
  ChevronRight, Star, MapPin, Award, CheckCircle2, User, ArrowRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const SYMPTOMS = [
  { id: 'back', label: 'Back Pain', icon: '🦵' },
  { id: 'neck', label: 'Neck Pain', icon: '👤' },
  { id: 'knee', label: 'Knee Pain', icon: '🦵' },
  { id: 'shoulder', label: 'Shoulder Pain', icon: '🦾' },
  { id: 'sports', label: 'Sports Injury', icon: '🏃' },
  { id: 'other', label: 'Other / Not Sure', icon: '💬' },
]

const MATCHED_DOCTORS = [
  {
    name: 'Dr. Ananya Sharma',
    title: 'Sports & Musculoskeletal Physio',
    badge: 'Best Match',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    rating: 4.8,
    reviews: 124,
    experience: '5+ years experience',
    clinic: 'Indira Nagar Clinic • 2.1 km',
    avatar: 'https://images.unsplash.com/photo-1594824813566-88855ce78907?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Dr. Rohit Mehta',
    title: 'Orthopedic & Posture Specialist',
    badge: 'Great Fit',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    rating: 4.7,
    reviews: 98,
    experience: '6+ years experience',
    clinic: 'MG Road Clinic • 3.5 km',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200'
  },
  {
    name: 'Dr. Simran Kaur',
    title: 'Rehab & Functional Movement',
    badge: 'Also Recommended',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    rating: 4.6,
    reviews: 76,
    experience: '4+ years experience',
    clinic: 'Civil Lines Clinic • 4.2 km',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
  }
]

export function AssessmentWizard() {
  const [selectedSymptom, setSelectedSymptom] = useState<string>('back')
  const [step, setStep] = useState<number>(1)
  const [showResults, setShowResults] = useState<boolean>(true)

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top Banner: Quick Self Assessment */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-50/90 via-indigo-50/40 to-white rounded-2xl overflow-hidden">
        <CardContent className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-7 space-y-4">
            <span className="text-[11px] font-bold tracking-wider text-blue-600 uppercase">
              Quick Self Assessment
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
              Understand Your Muscle & Joint Health
            </h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              Answer a few simple questions to get a personalized recommendation for the right physiotherapist and treatment plan.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-600 pt-2">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-blue-600" /> Takes 2–3 minutes</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Private & Secure</span>
              <span className="flex items-center gap-1.5"><Target className="w-4 h-4 text-purple-600" /> Matched with expert</span>
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-xs text-center space-y-3">
            <span className="text-xs font-semibold text-slate-500">Scan the QR code to start</span>
            <div className="w-28 h-28 bg-slate-900 p-2 rounded-xl flex items-center justify-center text-white shadow-md">
              <QrCode className="w-20 h-20 text-white" />
            </div>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-6 rounded-lg">
              Scan & Begin
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Questionnaire Card (Step 1 of 5) */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                1
              </span>
              <span className="font-semibold text-slate-900 text-sm">Your Details</span>
            </div>
            <span className="text-xs font-medium text-slate-500">1 of 5</span>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">What brings you here today?</h3>
            <p className="text-xs text-slate-500">Select the option that best describes your problem.</p>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {SYMPTOMS.map((symptom) => {
              const isSelected = selectedSymptom === symptom.id
              return (
                <button
                  key={symptom.id}
                  onClick={() => setSelectedSymptom(symptom.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/40 ring-2 ring-blue-600/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{symptom.icon}</span>
                    <span className="text-sm font-semibold text-slate-800">{symptom.label}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </button>
              )
            })}
          </div>

          <div className="flex justify-end pt-2">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-6 py-2 rounded-xl flex items-center gap-2">
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Your Results Section */}
      <Card className="border border-blue-100 shadow-xs rounded-2xl bg-gradient-to-b from-blue-50/30 to-white">
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-600 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span>Your Results</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900">We've analyzed your responses!</h3>
              <p className="text-xs text-slate-500">
                Based on your symptoms, here are the best-matched physiotherapists for your condition.
              </p>
            </div>
            <Badge className="bg-blue-100 text-blue-800 border-0 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 self-start sm:self-auto">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Powered Recommendations
            </Badge>
          </div>

          {/* Doctors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MATCHED_DOCTORS.map((doc, idx) => (
              <Card key={idx} className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow bg-white">
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <img
                      src={doc.avatar}
                      alt={doc.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                    <Badge variant="outline" className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${doc.badgeColor}`}>
                      {doc.badge}
                    </Badge>
                  </div>

                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{doc.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{doc.title}</p>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1 text-amber-600 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{doc.rating}</span>
                      <span className="text-slate-400 font-normal">({doc.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.experience}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{doc.clinic}</span>
                    </div>
                  </div>

                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2 rounded-xl">
                    Book Now
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Bottom Callout Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-blue-50/70 border border-blue-100 rounded-2xl gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Not sure? Take the full assessment</h4>
                <p className="text-[11px] text-slate-500">Answer all questions for a more precise match and personalized plan.</p>
              </div>
            </div>
            <Button variant="outline" className="bg-white hover:bg-slate-50 text-blue-600 border-blue-200 text-xs px-4 py-2 rounded-xl flex items-center gap-2 font-semibold">
              Take Full Assessment <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
