import type { SyncQueueItem } from './types'

const QUEUE_KEY = 'ppvet_sync_queue'

export class SyncQueue {
  private queue: SyncQueueItem[] = []

  constructor() {
    this.load()
  }

  private load() {
    try {
      const data = localStorage.getItem(QUEUE_KEY)
      if (data) {
        this.queue = JSON.parse(data)
      }
    } catch {}
  }

  private save() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue))
    } catch {}
  }

  add(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retries'>) {
    const queueItem: SyncQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      retries: 0
    }
    this.queue.push(queueItem)
    this.save()
    return queueItem
  }

  getAll(): SyncQueueItem[] {
    return [...this.queue]
  }

  remove(id: string) {
    this.queue = this.queue.filter(item => item.id !== id)
    this.save()
  }

  incrementRetry(id: string) {
    const item = this.queue.find(i => i.id === id)
    if (item) {
      item.retries++
      this.save()
    }
  }

  clear() {
    this.queue = []
    this.save()
  }

  count(): number {
    return this.queue.length
  }
}

export const syncQueue = new SyncQueue()
