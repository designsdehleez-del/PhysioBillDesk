'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { 
  Stethoscope, Activity, Star, CheckCircle2, Building2, 
  Sparkles, Zap, HeartPulse, CreditCard, ShieldCheck 
} from 'lucide-react'
import { 
  SpineVertebraeIcon, 
  TherapyBallIcon, 
  JointKneeIcon, 
  ElectrotherapyIcon, 
  ManualTherapyIcon 
} from '@/components/icons/physio-icons'

export interface OrbitItem {
  id: string
  title: string
  subtitle: string
  tag: string
  icon: React.ReactNode
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'indigo' | 'teal'
  radius: number // Distance in px from center
  duration: number // Orbit cycle duration in seconds
  reverse?: boolean
  initialAngle: number // Starting position in degrees (0..360)
}

const DEFAULT_ORBIT_ITEMS: OrbitItem[] = [
  {
    id: 'orbit-1',
    title: 'Spine Decompression',
    subtitle: 'Cervical & Lumbar Protocol',
    tag: '98.4% Relief',
    icon: <SpineVertebraeIcon size={20} className="text-blue-600" />,
    color: 'blue',
    radius: 125,
    duration: 22,
    initialAngle: 0,
  },
  {
    id: 'orbit-2',
    title: 'Electrotherapy & TENS',
    subtitle: '4-Channel Muscle Stimulation',
    tag: '14 Active Today',
    icon: <ElectrotherapyIcon size={20} className="text-emerald-600" />,
    color: 'emerald',
    radius: 135,
    duration: 28,
    reverse: true,
    initialAngle: 120,
  },
  {
    id: 'orbit-3',
    title: 'Myofascial Therapy',
    subtitle: 'Targeted Dry Needling',
    tag: '4.9 ★ Rating',
    icon: <ManualTherapyIcon size={20} className="text-purple-600" />,
    color: 'purple',
    radius: 200,
    duration: 34,
    initialAngle: 210,
  },
  {
    id: 'orbit-4',
    title: 'Biomechanical Gait',
    subtitle: 'Laser Joint Mobility',
    tag: 'Verified Clinic',
    icon: <JointKneeIcon size={20} className="text-teal-600" />,
    color: 'teal',
    radius: 210,
    duration: 40,
    reverse: true,
    initialAngle: 310,
  },
]

export function OrbitingCards({ items = DEFAULT_ORBIT_ITEMS }: { items?: OrbitItem[] }) {
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  return (
    <div className="relative w-full aspect-square max-w-[500px] mx-auto flex items-center justify-center select-none overflow-visible">
      
      {/* 1. Concentric Orbit Path Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {/* Inner Ring */}
        <div className="w-[250px] h-[250px] rounded-full border border-dashed border-blue-400/40 animate-[spin_60s_linear_infinite]" />
        {/* Outer Ring */}
        <div className="absolute w-[400px] h-[400px] rounded-full border border-dashed border-indigo-400/30 animate-[spin_90s_linear_infinite_reverse]" />
      </div>

      {/* 2. Central Core Nucleus (Physionautics Central Hub) */}
      <motion.div 
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="relative z-20 w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 flex flex-col items-center justify-center gap-1 border border-white/30 cursor-pointer"
      >
        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
          <Stethoscope className="w-6 h-6 text-white" />
        </div>
        <span className="text-[10px] font-black tracking-wider text-white uppercase">PHYSIO</span>
        <div className="absolute inset-0 rounded-3xl border border-blue-300/40 animate-ping opacity-25 pointer-events-none" />
      </motion.div>

      {/* 3. Orbiting Cards */}
      {items.map(item => {
        const isHovered = hoveredId === item.id

        return (
          <div
            key={item.id}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            {/* Orbit Rotation Wrapper */}
            <motion.div
              animate={{ rotate: item.reverse ? [item.initialAngle, item.initialAngle - 360] : [item.initialAngle, item.initialAngle + 360] }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                ease: 'linear',
              }}
              style={{
                width: item.radius * 2,
                height: item.radius * 2,
                animationPlayState: hoveredId ? 'paused' : 'running',
              }}
              className="relative flex items-center justify-center rounded-full"
            >
              {/* Card Container Positioned at Top of Orbit Radius */}
              <div 
                className="absolute top-0 -translate-y-1/2 pointer-events-auto"
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Counter-Rotate Inner Card so text remains right-side up! */}
                <motion.div
                  animate={{ rotate: item.reverse ? [-item.initialAngle, -item.initialAngle + 360] : [-item.initialAngle, -item.initialAngle - 360] }}
                  transition={{
                    duration: item.duration,
                    repeat: Infinity,
                    ease: 'linear',
                  }}
                  style={{
                    animationPlayState: hoveredId ? 'paused' : 'running',
                  }}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, y: -4 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`p-3 rounded-2xl border bg-white/95 backdrop-blur-md shadow-md hover:shadow-xl transition-all cursor-pointer flex items-center gap-3 min-w-[170px] ${
                      isHovered ? 'border-blue-500 ring-2 ring-blue-500/20 z-30' : 'border-slate-200/90'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${
                      item.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                      item.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' :
                      item.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                      item.color === 'teal' ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                      {item.icon}
                    </div>

                    <div className="space-y-0.5 text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 leading-none">{item.title}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium truncate max-w-[110px]">{item.subtitle}</div>
                      <span className="inline-block text-[9px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full mt-0.5">
                        {item.tag}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              </div>

            </motion.div>
          </div>
        )
      })}

    </div>
  )
}
