'use client'

import { useState } from 'react'
import { 
  Star, Play, Send, Calendar, CheckCircle2, 
  Lightbulb, ChevronRight, X, Phone, User, Clock
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function PatientProfileView() {
  const [activeTab, setActiveTab] = useState<'feedback' | 'exercises' | 'progress'>('feedback')
  const [rating, setRating] = useState<number>(0)
  const [feedbackText, setFeedbackText] = useState<string>('')
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [showProTip, setShowProTip] = useState<boolean>(true)

  const exercises = [
    {
      title: 'Neck Mobility Stretches',
      duration: '2:15',
      setsReps: '2 sets • 10 reps',
      image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=300'
    },
    {
      title: 'Shoulder Strengthening',
      duration: '3:20',
      setsReps: '2 sets • 12 reps',
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=300'
    },
    {
      title: 'Lower Back Relief',
      duration: '2:45',
      setsReps: '2 sets • 10 reps',
      image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=300'
    }
  ]

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault()
    if (rating > 0) {
      setSubmitted(true)
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Patient Header Card */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
              alt="Priya Sharma"
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Priya Sharma</h1>
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                  Active Patient
                </Badge>
              </div>
              <p className="text-xs font-semibold text-slate-500">Patient ID: PN-10224</p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 pt-1">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Age: 32</span>
                <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> Gender: Female</span>
                <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> +91 98765 43210</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Tabs Bar */}
      <div className="bg-white border border-slate-200/80 p-1.5 rounded-2xl shadow-xs flex gap-2">
        <button
          onClick={() => setActiveTab('feedback')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'feedback'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Session Feedback
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'exercises'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Exercises
        </button>
        <button
          onClick={() => setActiveTab('progress')}
          className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'progress'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Progress
        </button>
      </div>

      {/* Session Feedback Section */}
      {activeTab === 'feedback' && (
        <Card className="border border-blue-100 shadow-xs rounded-2xl bg-gradient-to-b from-blue-50/40 to-white">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xl">
                😊
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Submit Feedback</h3>
                <p className="text-xs text-slate-500">Help us improve your care. Share how you felt after today's session.</p>
              </div>
            </div>

            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Thank you! Your feedback has been submitted to your physiotherapist.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-4 pt-2">
                {/* 5 Star Rating */}
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-medium">Tap to rate your session</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-300 fill-slate-100'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Textarea
                    placeholder="Write your feedback (optional)..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="bg-white border-slate-200 text-xs rounded-xl min-h-[90px] focus-visible:ring-blue-600"
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={rating === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-6 py-2.5 rounded-xl flex items-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" /> Submit Feedback
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommended Exercises Section */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                <Play className="w-4 h-4 fill-blue-600 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Recommended Exercises</h3>
                <p className="text-xs text-slate-500">Your physio has curated these exercises for your recovery.</p>
              </div>
            </div>

            <button className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {exercises.map((ex, idx) => (
              <div
                key={idx}
                className="border border-slate-200/80 rounded-2xl overflow-hidden hover:shadow-md transition-shadow group bg-white"
              >
                <div className="relative h-36 bg-slate-900">
                  <img
                    src={ex.image}
                    alt={ex.title}
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-slate-900/60 backdrop-blur-xs text-white flex items-center justify-center border border-white/40">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                  <Badge className="absolute bottom-2 right-2 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-md">
                    {ex.duration}
                  </Badge>
                </div>

                <div className="p-3.5 space-y-1">
                  <h4 className="font-bold text-slate-900 text-xs">{ex.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">{ex.setsReps}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pro Tip Banner */}
      {showProTip && (
        <Card className="border border-blue-100 bg-blue-50/70 shadow-xs rounded-2xl">
          <CardContent className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <Lightbulb className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">Pro Tip</h4>
                <p className="text-[11px] text-slate-600">Consistency is key! Try to complete your exercises daily for better results.</p>
              </div>
            </div>
            <button onClick={() => setShowProTip(false)} className="text-slate-400 hover:text-slate-600 p-1">
              <X className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      )}

      {/* Recent Session Card */}
      <Card className="border border-slate-200/80 shadow-xs rounded-2xl bg-white hover:bg-slate-50/50 transition-colors">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-slate-900">Recent Session</h4>
              <p className="text-[11px] text-slate-500">Thu, 24 Apr 2025 • 10:00 AM</p>
              <p className="text-[11px] text-slate-500 font-medium">Dr. Rohit Mehta • Clinic - Indiranagar</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
            </Badge>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
