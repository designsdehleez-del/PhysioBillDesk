'use client'

import { useEffect } from 'react'
import { initOfflineSyncListener } from '@/lib/offline-sync'

export function OfflineSyncWatcher() {
  useEffect(() => {
    initOfflineSyncListener()
  }, [])

  return null
}
