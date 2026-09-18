'use client'

import React, { useState } from 'react'
import { MapPin, Navigation, Phone, Clock, ExternalLink, Sparkles, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useLandingCMS, type BranchContactItem } from '@/lib/landing-cms-store'

export interface NCRBranch {
  id: string
  name: string
  area: string
  address: string
  phone: string
  hours: string
  googleMapsUrl: string
  coords: { x: number; y: number }
}

export const DEFAULT_NCR_BRANCH_COORDS = [
  { x: 72, y: 48 },
  { x: 45, y: 55 },
  { x: 22, y: 78 },
  { x: 60, y: 35 },
  { x: 35, y: 65 },
]

export function NCRMapVisualizer() {
  const { cms } = useLandingCMS()

  const branches: NCRBranch[] = (cms.branches && cms.branches.length > 0 ? cms.branches : []).map((b, idx) => ({
    id: b.id,
    name: b.name,
    area: b.area,
    address: b.address,
    phone: b.phone,
    hours: b.hours,
    googleMapsUrl: b.googleMapsUrl,
    coords: DEFAULT_NCR_BRANCH_COORDS[idx % DEFAULT_NCR_BRANCH_COORDS.length],
  }))

  const [selectedBranch, setSelectedBranch] = useState<NCRBranch>(branches[0] || {
    id: 'nfc',
    name: 'New Friends Colony (Flagship)',
    area: 'South Delhi',
    address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
    phone: '+91 83839 36905',
    hours: '8:00 AM – 8:30 PM (Mon-Sat)',
    googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=CV+Raman+Marg+New+Friends+Colony+New+Delhi',
    coords: { x: 72, y: 48 },
  })

  const currentBranch = branches.find(b => b.id === selectedBranch.id) || branches[0] || selectedBranch

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl space-y-0 text-white">
      
      {/* Top Map Control Bar */}
      <div className="bg-slate-900/90 text-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md shadow-blue-500/20">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-extrabold text-white flex items-center gap-2">
              Delhi-NCR Regional Map & Clinic Directory
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono px-2 py-0.5">
                LIVE GPS
              </Badge>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Select any branch below or click interactive map pointers</div>
          </div>
        </div>

        <Badge className="bg-blue-600/20 text-blue-300 border border-blue-500/30 text-xs px-3 py-1 font-semibold rounded-full w-fit">
          <Building2 className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> {branches.length} Flagship Locations
        </Badge>
      </div>

      {/* Unified Dark Map & Branch Panel Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[440px]">
        
        {/* Left Column: Sleek Dark Glassmorphism Branch Cards List */}
        <div className="lg:col-span-5 p-4 border-r border-slate-800 bg-slate-900/80 space-y-3">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 px-1 flex items-center justify-between">
            <span>Physionautics NCR Centres ({branches.length})</span>
            <span className="text-[10px] text-blue-400 font-normal">Interactive Selection</span>
          </div>

          <div className="space-y-2.5">
            {branches.map((b) => {
              const isSelected = currentBranch.id === b.id
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBranch(b)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 relative overflow-hidden ${
                    isSelected 
                      ? 'bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-slate-900 border-2 border-blue-500 shadow-lg shadow-blue-500/10 text-white' 
                      : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-500 hover:bg-slate-800/70 text-slate-200'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 shadow-sm" />
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-700/80 text-slate-300'
                      }`}>
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-extrabold text-xs text-white">{b.name}</span>
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-semibold ${
                      isSelected ? 'bg-blue-500/20 text-blue-300 border-blue-400/40' : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {b.area}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-normal pl-8">
                    {b.address}
                  </p>

                  <div className="pl-8 pt-1 flex items-center justify-between text-[11px]">
                    <span className="text-blue-400 font-mono font-semibold flex items-center gap-1">
                      <Phone className="w-3 h-3 text-blue-400" /> {b.phone}
                    </span>
                    <a
                      href={b.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-blue-400 font-bold hover:text-blue-300 hover:underline inline-flex items-center gap-1 transition-colors"
                    >
                      Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Custom Styled Dark NCR Vector Map Graphic with Pins */}
        <div className="lg:col-span-7 relative bg-slate-950 text-white min-h-[440px] overflow-hidden flex flex-col justify-between">
          <div className="relative w-full h-full min-h-[440px] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-6 flex flex-col justify-between select-none">
            
            {/* Background Geographic Grid Pattern Graphic */}
            <svg className="absolute inset-0 w-full h-full opacity-25 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <pattern id="grid-pattern-map" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid-pattern-map)" />
              {/* Simulated NCR Ring Roads */}
              <path d="M 20 200 Q 200 80 500 220 T 700 350" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="6,6" />
              <path d="M 100 50 Q 300 300 600 380" fill="none" stroke="#818cf8" strokeWidth="1.5" />
            </svg>

            {/* Map Title overlay */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 shadow-md">
                <Navigation className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-xs font-bold text-slate-200">Delhi-NCR Regional Map Canvas</span>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                Vector GPS Active
              </Badge>
            </div>

            {/* Animated Map Pointers */}
            <div className="absolute inset-0 pointer-events-auto">
              {branches.map((b) => {
                const isSelected = currentBranch.id === b.id
                return (
                  <div
                    key={b.id}
                    style={{ left: `${b.coords.x}%`, top: `${b.coords.y}%` }}
                    onClick={() => setSelectedBranch(b)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
                  >
                    {/* Pulsing Outer Ring */}
                    <span className={`absolute -inset-3 rounded-full animate-ping opacity-75 ${
                      isSelected ? 'bg-red-500' : 'bg-blue-500'
                    }`} />

                    {/* Map Pin Icon Marker */}
                    <div className={`relative w-9 h-9 rounded-full flex items-center justify-center font-bold shadow-xl transition-transform group-hover:scale-125 ${
                      isSelected 
                        ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white ring-4 ring-red-500/30 scale-110' 
                        : 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white hover:bg-blue-500'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>

                    {/* Tooltip Label */}
                    <div className={`absolute left-1/2 -translate-x-1/2 top-10 px-3 py-1 rounded-lg text-[10px] font-extrabold whitespace-nowrap shadow-xl transition-all ${
                      isSelected 
                        ? 'bg-white text-slate-900 shadow-2xl border border-blue-400 scale-105' 
                        : 'bg-slate-900/90 text-slate-200 border border-slate-700 opacity-90 group-hover:opacity-100'
                    }`}>
                      {b.name}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Selected Pin Info Card (Bottom Overlay) */}
            <div className="relative z-10 bg-slate-900/95 backdrop-blur-md border border-slate-800 p-4 rounded-xl space-y-2 shadow-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-extrabold text-white">{currentBranch.name}</span>
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px]">
                  Open Now • 8:00 AM – 8:30 PM
                </Badge>
              </div>
              
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {currentBranch.address}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3 h-3 text-amber-400" /> {currentBranch.hours}
                </span>
                <a
                  href={currentBranch.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm text-xs"
                >
                  Open in Google Maps <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
