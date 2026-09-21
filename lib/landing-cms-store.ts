'use client'

import { useEffect, useState } from 'react'

export interface ProcedureCardItem {
  id: string
  title: string
  description: string
  imageUrl: string
  badge: string
}

export interface ServiceCardItem {
  id: string
  title: string
  description: string
  imageUrl: string
  badge: string
}

export interface BranchContactItem {
  id: string
  name: string
  area: string
  address: string
  phone: string
  hours: string
  googleMapsUrl: string
}

export interface LandingPageCMSData {
  // Hero Section
  heroBadgeText: string
  heroTitlePrefix: string
  heroTitleHighlight: string
  heroTitleSuffix: string
  heroDescription: string
  stat1Value: string
  stat1Label: string
  stat1Subtext: string
  stat2Value: string
  stat2Label: string
  stat2Subtext: string
  stat3Value: string
  stat3Label: string
  stat3Subtext: string
  heroCardImageUrl: string
  heroCardTitle: string
  heroCardDescription: string

  // Container Scroll Showcase
  scrollBadge: string
  scrollTitlePrefix: string
  scrollTitleHighlight: string
  scrollSubtitle: string

  // Orbit Clinical Showcase Section
  orbitBadgeText: string
  orbitTitlePrefix: string
  orbitTitleHighlight: string
  orbitSubtitle: string
  orbitFeature1Title: string
  orbitFeature1Sub: string
  orbitFeature2Title: string
  orbitFeature2Sub: string

  // Procedures Section (4 Cards)
  proceduresSectionTitle: string
  proceduresSectionSubtitle: string
  procedures: ProcedureCardItem[]

  // Clinical Services Section (6 Cards)
  servicesSectionTitle: string
  servicesSectionSubtitle: string
  services: ServiceCardItem[]

  // Patient Portal Section
  portalBadge: string
  portalTitle: string
  portalSubtitle: string

  // Branch Directory
  branches: BranchContactItem[]
}

export const DEFAULT_LANDING_CMS: LandingPageCMSData = {
  heroBadgeText: 'Welcome to Physionautics Healthcare',
  heroTitlePrefix: 'Pioneering ',
  heroTitleHighlight: 'Non-Invasive Rehabilitation',
  heroTitleSuffix: ' & Spine Care',
  heroDescription: 'Doctor-led multispecialty physical therapy network dedicated to restoring biomechanical alignment, eliminating chronic pain, and preventing unnecessary surgical interventions.',
  stat1Value: '84%',
  stat1Label: 'Surgery Avoided',
  stat1Subtext: 'Spine & knee cases',
  stat2Value: '3.2x',
  stat2Label: 'Faster Recovery',
  stat2Subtext: 'Evidence-based care',
  stat3Value: '98.4%',
  stat3Label: 'Patient CSAT',
  stat3Subtext: 'Delhi-NCR reviews',
  heroCardImageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=800',
  heroCardTitle: 'Doctor-Guided Physical Medicine & Spine Care',
  heroCardDescription: 'Welcome back to Physionautics. You are currently logged in to your clinic session.',

  scrollBadge: 'INTEGRATED CLINICAL PLATFORM',
  scrollTitlePrefix: 'Unleash Precision Recovery with ',
  scrollTitleHighlight: 'Digital Health Workflows',
  scrollSubtitle: 'Experience seamless patient evaluation, digital session logging, doctor-guided care plans, and outcome monitoring in one unified platform.',

  orbitBadgeText: 'Interactive Care Protocols',
  orbitTitlePrefix: 'Clinical Orbit & ',
  orbitTitleHighlight: 'Rehabilitation Intelligence',
  orbitSubtitle: 'Hover over any orbiting clinical card to inspect treatment protocols, spinal decompression metrics, and real-time patient recovery ratings.',
  orbitFeature1Title: 'Continuous 360° Orbit',
  orbitFeature1Sub: 'GPU-accelerated smooth rotation',
  orbitFeature2Title: 'Interactive Hover Pause',
  orbitFeature2Sub: 'Pauses rotation on card focus',

  proceduresSectionTitle: 'Advanced Clinical Rehabilitation Procedures',
  proceduresSectionSubtitle: 'Combining biomechanical assessment with targeted non-surgical physical medicine procedures for lasting recovery.',
  procedures: [
    {
      id: 'proc-1',
      title: 'Spine Alignment & Decompression',
      description: 'Computerized cervical and lumbar traction designed to relieve disc pressure, herniations, and nerve radiculopathy.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600',
      badge: 'Spine Care',
    },
    {
      id: 'proc-2',
      title: 'Advanced Electrophysiology (IFT & US)',
      description: 'Interferential current and therapeutic ultrasound targeting deep tissue inflammation and rapid acute pain relief.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
      badge: 'Electrotherapy',
    },
    {
      id: 'proc-3',
      title: 'Myofascial Dry Needling',
      description: 'Precision needle therapy releasing deep muscle knots, localized ischemia, and chronic neuromuscular tightness.',
      imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=600',
      badge: 'Trigger Point',
    },
    {
      id: 'proc-4',
      title: 'Functional Joint Rehabilitation',
      description: 'Custom targeted joint loading protocols and posture re-education for shoulder, knee, and hip joints.',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=600',
      badge: 'Rehabilitation',
    },
  ],

  servicesSectionTitle: 'Comprehensive Physical Rehabilitation Modalities',
  servicesSectionSubtitle: 'Tailored treatment plans engineered for rapid symptom control and structural joint stabilization.',
  services: [
    {
      id: 'srv-1',
      title: 'IFT & Ultrasound Therapy',
      description: 'Dual-frequency interferential current to block pain nerve pathways and accelerate cellular healing.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=500',
      badge: 'Pain Block',
    },
    {
      id: 'srv-2',
      title: 'Dry Needling & Cupping',
      description: 'Myofascial trigger point deactivation for persistent muscle tightness and chronic muscle spasms.',
      imageUrl: 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=500',
      badge: 'Trigger Point',
    },
    {
      id: 'srv-3',
      title: 'Computerized Spinal Traction',
      description: 'Graduated lumbar and cervical distraction for herniated discs and sciatica nerve pressure.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=500',
      badge: 'Disc Care',
    },
    {
      id: 'srv-4',
      title: 'Kinesio Taping & Mobilization',
      description: 'Proprioceptive taping protocols to stabilize ligaments and support dynamic movement during recovery.',
      imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&q=80&w=500',
      badge: 'Joint Support',
    },
    {
      id: 'srv-5',
      title: 'Sports Injury Rehabilitation',
      description: 'ACL/MCL recovery, shoulder rotator cuff rehab, and return-to-sport athletic conditioning.',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&q=80&w=500',
      badge: 'Athletic Rehab',
    },
    {
      id: 'srv-6',
      title: 'Post-Surgical Joint Restoration',
      description: 'Structured progressive loading after knee replacement, hip surgery, or spinal fixation.',
      imageUrl: 'https://images.unsplash.com/photo-1576091160291-2f080f55cfef?auto=format&fit=crop&q=80&w=500',
      badge: 'Post-Op Care',
    },
  ],

  portalBadge: 'PATIENT CARE & PORTAL',
  portalTitle: 'Seamless Patient Experience & Digital Care',
  portalSubtitle: 'From appointment scheduling to home exercise plans and digital bill receipts, Physionautics keeps patients connected to their recovery journey.',

  branches: [
    {
      id: 'b-1',
      name: 'New Friends Colony (Flagship)',
      area: 'South Delhi',
      address: 'D-819, Ground Floor, CV Raman Marg, New Friends Colony, New Delhi – 110025',
      phone: '+91 83839 36905',
      hours: '8:00 AM – 8:30 PM (Mon-Sat)',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=CV+Raman+Marg+New+Friends+Colony+New+Delhi',
    },
    {
      id: 'b-2',
      name: 'Vasant Vihar Spine & Joint',
      area: 'South Delhi',
      address: 'C-4/18, Vasant Vihar, Outer Ring Road, New Delhi – 110057',
      phone: '+91 98100 67890',
      hours: '8:30 AM – 8:00 PM (Mon-Sat)',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Vasant+Vihar+Outer+Ring+Road+New+Delhi',
    },
    {
      id: 'b-3',
      name: 'Gurugram DLF Phase 1',
      area: 'Gurugram, Haryana',
      address: 'A-26/12, Golf Course Road, DLF Phase 1, Gurugram – 122002',
      phone: '+91 98100 54321',
      hours: '9:00 AM – 8:00 PM (Mon-Sat)',
      googleMapsUrl: 'https://www.google.com/maps/search/?api=1&query=Golf+Course+Road+DLF+Phase+1+Gurugram',
    },
  ],
}

const LANDING_CMS_KEY = 'physio_landing_cms_v1'

export function getLandingCMSData(): LandingPageCMSData {
  if (typeof window === 'undefined') return DEFAULT_LANDING_CMS
  try {
    const cached = localStorage.getItem(LANDING_CMS_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      const merged: LandingPageCMSData = {
        ...DEFAULT_LANDING_CMS,
        ...parsed,
        procedures: Array.isArray(parsed.procedures) && parsed.procedures.length > 0 ? parsed.procedures : DEFAULT_LANDING_CMS.procedures,
        services: Array.isArray(parsed.services) && parsed.services.length > 0 ? parsed.services : DEFAULT_LANDING_CMS.services,
        branches: Array.isArray(parsed.branches) && parsed.branches.length > 0 ? parsed.branches : DEFAULT_LANDING_CMS.branches,
      }

      // Automatically sanitize legacy phrasing from cached localStorage
      if (!merged.orbitBadgeText || merged.orbitBadgeText.toLowerCase().includes('jitter')) {
        merged.orbitBadgeText = 'Interactive Care Protocols'
      }
      return merged
    }
  } catch (_) {}
  return DEFAULT_LANDING_CMS
}

export function saveLandingCMSData(updates: Partial<LandingPageCMSData>): LandingPageCMSData {
  const current = getLandingCMSData()
  const updated: LandingPageCMSData = { ...current, ...updates }
  try {
    localStorage.setItem(LANDING_CMS_KEY, JSON.stringify(updated))
    window.dispatchEvent(new CustomEvent('physio-landing-cms-updated', { detail: updated }))
  } catch (err) {
    console.error('Failed to save landing page CMS to localStorage:', err)
  }
  return updated
}

export function resetLandingCMSData(): LandingPageCMSData {
  try {
    localStorage.removeItem(LANDING_CMS_KEY)
    window.dispatchEvent(new CustomEvent('physio-landing-cms-updated', { detail: DEFAULT_LANDING_CMS }))
  } catch (_) {}
  return DEFAULT_LANDING_CMS
}

export function useLandingCMS() {
  const [cms, setCms] = useState<LandingPageCMSData>(DEFAULT_LANDING_CMS)

  useEffect(() => {
    setCms(getLandingCMSData())

    const handleCMSChange = (e: any) => {
      setCms(e.detail || getLandingCMSData())
    }

    window.addEventListener('physio-landing-cms-updated', handleCMSChange)
    window.addEventListener('storage', () => setCms(getLandingCMSData()))

    return () => {
      window.removeEventListener('physio-landing-cms-updated', handleCMSChange)
    }
  }, [])

  return {
    cms,
    saveCMS: saveLandingCMSData,
    resetCMS: resetLandingCMSData,
  }
}
