import { supabase } from '../supabase'
import { syncQueue } from './queue'
import { SYNC_CONFIG } from './config'
import type { SyncQueueItem } from './types'

export class SyncEngine {
  private interval: number | null = null
  private processing = false

  start() {
    if (!SYNC_CONFIG.enabled) return
    if (this.interval) return
    
    this.processQueue()
    this.interval = setInterval(() => {
      this.processQueue()
    }, SYNC_CONFIG.syncInterval)
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
    }
  }

  async processQueue() {
    if (!SYNC_CONFIG.enabled || this.processing) return
    if (!navigator.onLine) return
    
    this.processing = true
    const items = syncQueue.getAll()
    
    for (const item of items) {
      if (item.retries >= SYNC_CONFIG.maxRetries) {
        syncQueue.remove(item.id)
        continue
      }
      
      try {
        await this.syncItem(item)
        syncQueue.remove(item.id)
      } catch (error) {
        syncQueue.incrementRetry(item.id)
      }
    }
    
    this.processing = false
  }

  private async syncItem(item: SyncQueueItem) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')
    
    const data = { ...item.data, clinic_id: item.clinicId, synced_at: new Date().toISOString() }
    
    switch (item.operation) {
      case 'insert':
      case 'update':
        const { error } = await supabase
          .from(item.table)
          .upsert(data)
        if (error) throw error
        break
      case 'delete':
        const { error: delError } = await supabase
          .from(item.table)
          .delete()
          .eq('id', item.recordId)
        if (delError) throw delError
        break
    }
  }
}

export const syncEngine = new SyncEngine()
