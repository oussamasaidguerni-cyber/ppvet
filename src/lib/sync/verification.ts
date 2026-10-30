import { supabase } from '../supabase'
import { db } from '../db'

const TABLES = [
  'clients', 'animals', 'appointments', 'visits', 'prescriptions', 
  'vaccinations', 'weight_history', 'products', 'invoices', 
  'invoice_items', 'payments'
]

export interface VerificationResult {
  passed: boolean
  details: Array<{
    table: string
    localCount: number
    cloudCount: number
    match: boolean
    issues?: string[]
  }>
  summary: string
}

export async function verifyMigration(clinicId: string): Promise<VerificationResult> {
  const results = []
  let allPassed = true
  
  for (const table of TABLES) {
    try {
      // Get local count
      const localCount = await (db as any)[table].count()
      
      // Get cloud count
      const { count: cloudCount, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
      
      if (error) {
        results.push({
          table,
          localCount,
          cloudCount: 0,
          match: false,
          issues: [error.message]
        })
        allPassed = false
        continue
      }
      
      const match = localCount === (cloudCount || 0)
      if (!match) allPassed = false
      
      results.push({
        table,
        localCount,
        cloudCount: cloudCount || 0,
        match
      })
    } catch (e: any) {
      results.push({
        table,
        localCount: 0,
        cloudCount: 0,
        match: false,
        issues: [e.message]
      })
      allPassed = false
    }
  }
  
  return {
    passed: allPassed,
    details: results,
    summary: allPassed 
      ? 'All tables verified successfully' 
      : 'Verification failed - discrepancies found'
  }
}

export async function checkExistingCloudData(clinicId: string): Promise<{
  hasData: boolean
  counts: Record<string, number>
}> {
  const counts: Record<string, number> = {}
  let hasData = false
  
  for (const table of TABLES) {
    try {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('clinic_id', clinicId)
      
      counts[table] = count || 0
      if ((count || 0) > 0) hasData = true
    } catch {
      counts[table] = 0
    }
  }
  
  return { hasData, counts }
}
