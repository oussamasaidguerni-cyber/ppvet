import { useState } from 'react'
import { Button } from '../../components/ui/Button'
import { api } from '../../lib/api'
import { supabase } from '../../lib/supabase'

export default function MigrationTool() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const exportBackup = async () => {
    setLoading(true)
    setStatus('Exporting backup...')
    try {
      const backup = await api.getBackup()
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ppvet-backup-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
      setStatus('Backup exported successfully')
    } catch (e: any) {
      setStatus('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const migrateToCloud = async () => {
    setLoading(true)
    setStatus('Starting migration...')
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setStatus('Error: Please sign in first')
        return
      }
      
      // Create or get clinic
      let { data: clinicUser } = await supabase
        .from('clinic_users')
        .select('clinic_id')
        .eq('user_id', user.id)
        .single()
      
      let clinicId = clinicUser?.clinic_id
      
      if (!clinicId) {
        const { data: clinic } = await supabase
          .from('clinics')
          .insert({ name: 'P&PVET Clinic' })
          .select()
          .single()
        
        clinicId = clinic.id
        
        await supabase
          .from('clinic_users')
          .insert({ user_id: user.id, clinic_id: clinicId, role: 'owner' })
      }
      
      setStatus('Uploading data...')
      const backup = await api.getBackup()
      
      // Migrate in order respecting foreign keys
      if (backup.clients?.length) {
        await supabase.from('clients').upsert(backup.clients.map(c => ({...c, clinic_id: clinicId})))
      }
      if (backup.animals?.length) {
        await supabase.from('animals').upsert(backup.animals.map(a => ({...a, clinic_id: clinicId})))
      }
      if (backup.products?.length) {
        await supabase.from('products').upsert(backup.products.map(p => ({...p, clinic_id: clinicId})))
      }
      if (backup.appointments?.length) {
        await supabase.from('appointments').upsert(backup.appointments.map(a => ({...a, clinic_id: clinicId})))
      }
      if (backup.visits?.length) {
        await supabase.from('visits').upsert(backup.visits.map(v => ({...v, clinic_id: clinicId})))
      }
      if (backup.prescriptions?.length) {
        await supabase.from('prescriptions').upsert(backup.prescriptions.map(p => ({...p, clinic_id: clinicId})))
      }
      if (backup.vaccinations?.length) {
        await supabase.from('vaccinations').upsert(backup.vaccinations.map(v => ({...v, clinic_id: clinicId})))
      }
      if (backup.weight_history?.length) {
        await supabase.from('weight_history').upsert(backup.weight_history.map(w => ({...w, clinic_id: clinicId})))
      }
      if (backup.invoices?.length) {
        await supabase.from('invoices').upsert(backup.invoices.map(i => ({...i, clinic_id: clinicId})))
      }
      if (backup.invoice_items?.length) {
        await supabase.from('invoice_items').upsert(backup.invoice_items.map(i => ({...i, clinic_id: clinicId})))
      }
      if (backup.payments?.length) {
        await supabase.from('payments').upsert(backup.payments.map(p => ({...p, clinic_id: clinicId})))
      }
      
      setStatus('Migration completed successfully')
    } catch (e: any) {
      setStatus('Error: ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Data Migration & Backup</h2>
        <p className="text-sm text-muted-foreground">Export backups before migrating to cloud sync</p>
      </div>
      
      <div className="border border-border p-4 space-y-3">
        <div>
          <h3 className="font-medium mb-1">1. Export Backup</h3>
          <p className="text-sm text-muted-foreground mb-2">Download a complete backup of all local data</p>
          <Button onClick={exportBackup} disabled={loading} size="sm">Export Backup</Button>
        </div>
        
        <div className="border-t border-border pt-3">
          <h3 className="font-medium mb-1">2. Migrate to Cloud</h3>
          <p className="text-sm text-muted-foreground mb-2">Upload local data to Supabase (requires sign in)</p>
          <Button onClick={migrateToCloud} disabled={loading} size="sm">Migrate to Cloud</Button>
        </div>
      </div>
      
      {status && <p className="text-sm text-muted-foreground">{status}</p>}
    </div>
  )
}
