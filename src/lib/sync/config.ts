export const SYNC_CONFIG = {
  enabled: import.meta.env.VITE_SYNC_ENABLED === 'true',
  syncInterval: 30000, // 30 seconds
  retryDelay: 5000,
  maxRetries: 3
}
