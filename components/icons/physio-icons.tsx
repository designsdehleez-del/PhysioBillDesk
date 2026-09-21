import React from 'react'

export interface PhysioIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number
  className?: string
}

// 1. Spine & Vertebrae Column Icon (Cervical & Lumbar Disc Decompression)
export function SpineVertebraeIcon({ size = 24, className = '', ...props }: PhysioIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Spinal Alignment Curve */}
      <path d="M16 3v26" strokeDasharray="2 2" strokeOpacity="0.4" />
      
      {/* Vertebral Bodies */}
      <rect x="11" y="4" width="10" height="3.5" rx="1.5" fill="currentColor" fillOpacity="0.1" />
      <rect x="10" y="9.5" width="12" height="4" rx="1.5" fill="currentColor" fillOpacity="0.1" />
      <rect x="9" y="15" width="14" height="4.5" rx="1.5" fill="currentColor" fillOpacity="0.1" />
      <rect x="9.5" y="21" width="13" height="4" rx="1.5" fill="currentColor" fillOpacity="0.1" />
      
      {/* Intervertebral Discs */}
      <path d="M13 7.5h6" strokeWidth="2.2" stroke="currentColor" />
      <path d="M12 13.5h8" strokeWidth="2.2" stroke="currentColor" />
      <path d="M11.5 19.5h9" strokeWidth="2.2" stroke="currentColor" />
      
      {/* Lateral Process Extensions */}
      <path d="M8 6h3M21 6h3" />
      <path d="M7 11.5h3M22 11.5h3" />
      <path d="M6 17.2h3M23 17.2h3" />
    </svg>
  )
}

// 2. Physiotherapy Exercise & Rehabilitation Ball Icon
export function TherapyBallIcon({ size = 24, className = '', ...props }: PhysioIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <circle cx="16" cy="16" r="11" fill="currentColor" fillOpacity="0.08" />
      <path d="M16 5c4 3 6 7 6 11s-2 8-6 11" />
      <path d="M16 5c-4 3-6 7-6 11s2 8 6 11" />
      <path d="M5.5 13c3 1.5 7 2.5 10.5 2.5s7.5-1 10.5-2.5" />
      <path d="M5.5 19c3-1.5 7-2.5 10.5-2.5s7.5 1 10.5 2.5" />
    </svg>
  )
}

// 3. Knee & Joint Biomechanics Mobility Icon
export function JointKneeIcon({ size = 24, className = '', ...props }: PhysioIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Upper Femur */}
      <path d="M14 4v7a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V4" />
      {/* Patella Joint Core */}
      <circle cx="16" cy="16" r="3" fill="currentColor" fillOpacity="0.2" />
      {/* Lower Tibia & Fibula */}
      <path d="M14 28v-7a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v7" />
      {/* Range of Motion Arcs */}
      <path d="M7 16a9 9 0 0 1 4.5-7.8" strokeDasharray="2 2" />
      <path d="M25 16a9 9 0 0 0-4.5 7.8" strokeDasharray="2 2" />
    </svg>
  )
}

// 4. Electrotherapy & Shockwave Stimulation Icon
export function ElectrotherapyIcon({ size = 24, className = '', ...props }: PhysioIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Electro Pulse Waves */}
      <path d="M3 16h5l2.5-6 4 12 3.5-9 2.5 4h8.5" />
      {/* Electrode Pads */}
      <rect x="5" y="5" width="6" height="4" rx="1" fill="currentColor" fillOpacity="0.15" />
      <rect x="21" y="23" width="6" height="4" rx="1" fill="currentColor" fillOpacity="0.15" />
      {/* Cable Connections */}
      <path d="M8 9v1" />
      <path d="M24 22v1" />
    </svg>
  )
}

// 5. Manual Therapy & Myofascial Release Icon
export function ManualTherapyIcon({ size = 24, className = '', ...props }: PhysioIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Therapist Hands Technique */}
      <path d="M6 18c0-3.5 2.5-6 6-6h8c3.5 0 6 2.5 6 6" />
      <path d="M10 12V7a2 2 0 0 1 4 0v5" />
      <path d="M14 12V5a2 2 0 0 1 4 0v7" />
      <path d="M18 12V7a2 2 0 0 1 4 0v5" />
      {/* Anatomical Pressure Target */}
      <circle cx="16" cy="23" r="4" fill="currentColor" fillOpacity="0.15" />
      <path d="M16 21v4M14 23h4" />
    </svg>
  )
}

// 6. Biomechanical Gait & Treadmill Running Icon
export function TreadmillGaitIcon({ size = 24, className = '', ...props }: PhysioIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Treadmill Base */}
      <path d="M4 25h24l-3-4H7l-3 4z" fill="currentColor" fillOpacity="0.1" />
      <path d="M22 21l3-14h-4" />
      {/* Runner Posture */}
      <circle cx="15" cy="7" r="2.5" />
      <path d="M13 13l3-3.5 4 2 3 3" />
      <path d="M15 12v6l-4 3" />
      <path d="M15 18l4 3.5" />
    </svg>
  )
}

// 7. Neurological & Brain Rehabilitation Icon
export function NeuroRehabIcon({ size = 24, className = '', ...props }: PhysioIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M16 5c-5 0-9 3.5-9 8.5 0 3.5 2 6.5 4 8v4.5h10V21.5c2-1.5 4-4.5 4-8c0-5-4-8.5-9-8.5z" fill="currentColor" fillOpacity="0.08" />
      {/* Synaptic Flash */}
      <path d="M16 9l-2 5h4l-2 5" stroke="currentColor" strokeWidth="2" />
    </svg>
  )
}
