export interface SyncQueueItem {
  id: string
  table: string
  operation: 'insert' | 'update' | 'delete'
  recordId: number
  data: any
  clinicId: string
  timestamp: number
  retries: number
  version?: number
}

export interface SyncStatus {
  status: 'synced' | 'syncing' | 'offline' | 'error'
  lastSync?: Date
  pendingCount?: number
  error?: string
}
