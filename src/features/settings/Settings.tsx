import { useEffect, useState } from 'react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { api } from '../../lib/api'

export default function Settings() {
  const [clinic, setClinic] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadClinic()
  }, [])

  const loadClinic = async () => {
    try {
      const data = await api.getClinic()
      setClinic(data)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    try {
      await api.updateClinic(clinic)
      setMessage('Saved')
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleBackup = async () => {
    try {
      const data = await api.getBackup()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ppvet-backup-${Date.now()}.json`
      a.click()
    } catch (error: any) {
      alert(error.message)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-gray-600 mt-1">Clinic configuration</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4 mb-8">
        <div>
          <Label htmlFor="clinic_name">Clinic Name</Label>
          <Input
            id="clinic_name"
            value={clinic?.clinic_name || ''}
            onChange={(e) => setClinic({...clinic, clinic_name: e.target.value})}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            value={clinic?.phone || ''}
            onChange={(e) => setClinic({...clinic, phone: e.target.value})}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={clinic?.address || ''}
            onChange={(e) => setClinic({...clinic, address: e.target.value})}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Input
            id="currency"
            value={clinic?.currency || 'DZD'}
            onChange={(e) => setClinic({...clinic, currency: e.target.value})}
            className="mt-1"
          />
        </div>
        {message && <p className="text-sm text-green-600">{message}</p>}
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </form>

      <div className="border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold mb-4">Backup</h2>
        <Button onClick={handleBackup}>Download Backup</Button>
        <p className="text-sm text-gray-600 mt-2">Database location: data/ppvet.db</p>
      </div>
    </div>
  )
}
