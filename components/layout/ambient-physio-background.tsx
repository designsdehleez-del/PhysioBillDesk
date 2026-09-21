'use client'

import React from 'react'
import { 
  SpineVertebraeIcon, 
  TherapyBallIcon, 
  JointKneeIcon, 
  ElectrotherapyIcon, 
  ManualTherapyIcon, 
  TreadmillGaitIcon,
  NeuroRehabIcon 
} from '@/components/icons/physio-icons'

export function AmbientPhysioBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none" aria-hidden="true">
      {/* 1. Soft Radial Ambient Color Glows */}
      <div className="absolute -top-32 -left-32 w-[36rem] h-[36rem] bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute top-1/3 -right-32 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 w-[36rem] h-[36rem] bg-teal-500/10 rounded-full blur-3xl" />
      
      {/* 2. Micro-Dot Matrix Overlay */}
      <div className="absolute inset-0 bg-dot-pattern opacity-60" />

      {/* 3. Aesthetic Floating Line-Art Physiotherapy Watermark Vector Icons */}
      <div className="absolute inset-0 overflow-hidden text-slate-400/20">
        
        {/* Top Left: Spine Vertebrae Column Watermark */}
        <div className="absolute top-12 left-8 md:left-16 rotate-12 opacity-30 transition-transform duration-1000 hover:rotate-6">
          <SpineVertebraeIcon size={120} className="text-blue-600/30" />
        </div>

        {/* Top Right: Exercise Therapy Ball Watermark */}
        <div className="absolute top-16 right-10 md:right-24 -rotate-12 opacity-25">
          <TherapyBallIcon size={140} className="text-indigo-600/30" />
        </div>

        {/* Mid Left: Joint & Knee Mobility Biomechanics */}
        <div className="absolute top-1/3 left-6 md:left-20 -rotate-6 opacity-25">
          <JointKneeIcon size={110} className="text-teal-600/30" />
        </div>

        {/* Mid Right: Electrotherapy & TENS Stimulation Waves */}
        <div className="absolute top-1/2 right-8 md:right-16 rotate-12 opacity-30">
          <ElectrotherapyIcon size={130} className="text-blue-600/30" />
        </div>

        {/* Lower Left: Manual Therapy & Myofascial Pressure */}
        <div className="absolute bottom-32 left-12 md:left-28 rotate-6 opacity-25">
          <ManualTherapyIcon size={125} className="text-purple-600/30" />
        </div>

        {/* Lower Right: Biomechanical Gait & Treadmill Rehabilitation */}
        <div className="absolute bottom-20 right-14 md:right-32 -rotate-12 opacity-30">
          <TreadmillGaitIcon size={135} className="text-indigo-600/30" />
        </div>

        {/* Center Subdued Spine & Synaptic Neural Flow */}
        <div className="absolute top-2/3 left-1/2 -translate-x-1/2 -rotate-4 opacity-15">
          <NeuroRehabIcon size={160} className="text-blue-500/20" />
        </div>

      </div>
    </div>
  )
}
