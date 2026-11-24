/**
 * Offline Sync & IndexedDB Fallback Manager
 * Provides client-side resilience during clinic network drops
 * without altering primary cloud Supabase architecture.
 */

const DB_NAME = 'PhysioBilldesk_Offline_Cache_v1'
const DB_VERSION = 1
const STORE_OUTBOX = 'sync_outbox'
const STORE_CACHE = 'local_cache'

export interface OutboxItem {
  id: string
  endpoint: string
  method: 'POST' | 'PUT' | 'DELETE'
  payload: any
  createdAt: number
  attempts: number
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'))
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result as IDBDatabase
      if (!db.objectStoreNames.contains(STORE_OUTBOX)) {
        db.createObjectStore(STORE_OUTBOX, { keyPath: 'id' })
      }
      if (!db.objectStoreNames.contains(STORE_CACHE)) {
        db.createObjectStore(STORE_CACHE, { keyPath: 'key' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Queue an operation when the network is offline or unstable
 */
export async function queueOfflineOperation(endpoint: string, method: 'POST' | 'PUT' | 'DELETE', payload: any): Promise<void> {
  try {
    const db = await openDB()
    const item: OutboxItem = {
      id: `outbox-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      endpoint,
      method,
      payload,
      createdAt: Date.now(),
      attempts: 0,
    }

    const tx = db.transaction(STORE_OUTBOX, 'readwrite')
    tx.objectStore(STORE_OUTBOX).put(item)
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch (err) {
    console.warn('Could not queue to IndexedDB outbox:', err)
  }
}

/**
 * Flush and synchronize pending outbox items once connectivity is restored
 */
export async function flushOfflineOutbox(): Promise<{ processed: number; succeeded: number; failed: number }> {
  try {
    const db = await openDB()
    const tx = db.transaction(STORE_OUTBOX, 'readonly')
    const store = tx.objectStore(STORE_OUTBOX)
    const items: OutboxItem[] = await new Promise((resolve, reject) => {
      const req = store.getAll()
      req.onsuccess = () => resolve(req.result || [])
      req.onerror = () => reject(req.error)
    })

    if (items.length === 0) return { processed: 0, succeeded: 0, failed: 0 }

    let succeeded = 0
    let failed = 0

    for (const item of items) {
      try {
        const res = await fetch(item.endpoint, {
          method: item.method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.payload),
        })

        if (res.ok) {
          succeeded++
          const delTx = db.transaction(STORE_OUTBOX, 'readwrite')
          delTx.objectStore(STORE_OUTBOX).delete(item.id)
        } else {
          failed++
        }
      } catch (err) {
        failed++
      }
    }

    return { processed: items.length, succeeded, failed }
  } catch (err) {
    console.warn('Error flushing outbox:', err)
    return { processed: 0, succeeded: 0, failed: 0 }
  }
}

/**
 * Hook to automatically register online/offline listeners
 */
export function initOfflineSyncListener(): void {
  if (typeof window === 'undefined') return

  window.addEventListener('online', () => {
    console.log('[OfflineSync] Network reconnected. Flushing queued records to Supabase...')
    flushOfflineOutbox().then((stats) => {
      if (stats.succeeded > 0) {
        console.log(`[OfflineSync] Synced ${stats.succeeded} queued records.`)
      }
    })
  })
}
