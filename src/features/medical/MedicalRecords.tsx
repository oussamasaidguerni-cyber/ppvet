import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { api } from '../../lib/api'

export default function MedicalRecords() {
  const [clients, setClients] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    client_id: '',
    animal_id: '',
    appointment_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    chief_complaint: '',
    clinical_observations: '',
    diagnosis: '',
    treatment_plan: '',
    notes: '',
    follow_up_date: ''
  })
  const [clientAnimals, setClientAnimals] = useState<any[]>([])

  useEffect(() => {
    api.getClients().then(setClients)
  }, [])

  const handleClientChange = async (clientId: string) => {
    setFormData({ ...formData, client_id: clientId, animal_id: '' })
    if (clientId) {
      const client = await api.getClient(parseInt(clientId))
      setClientAnimals(client.animals || [])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createVisit({
        ...formData,
        client_id: parseInt(formData.client_id),
        animal_id: parseInt(formData.animal_id),
        appointment_id: formData.appointment_id ? parseInt(formData.appointment_id) : null
      })
      alert('Visit recorded')
      setShowForm(false)
      setFormData({
        client_id: '', animal_id: '', appointment_id: '', visit_date: new Date().toISOString().split('T')[0],
        chief_complaint: '', clinical_observations: '', diagnosis: '', treatment_plan: '', notes: '', follow_up_date: ''
      })
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Medical Records</h1>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Record Visit
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Client</Label>
              <select className="w-full h-10 border border-border px-3" onChange={(e) => handleClientChange(e.target.value)} required>
                <option value="">Select...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
              </select>
            </div>
            <div>
              <Label>Animal</Label>
              <select className="w-full h-10 border border-border px-3" onChange={(e) => setFormData({...formData, animal_id: e.target.value})} required>
                <option value="">Select...</option>
                {clientAnimals.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Visit Date</Label>
              <Input type="date" value={formData.visit_date} onChange={(e) => setFormData({...formData, visit_date: e.target.value})} required />
            </div>
            <div>
              <Label>Follow Up Date</Label>
              <Input type="date" onChange={(e) => setFormData({...formData, follow_up_date: e.target.value})} />
            </div>
          </div>
          <div>
            <Label>Chief Complaint</Label>
            <Input onChange={(e) => setFormData({...formData, chief_complaint: e.target.value})} />
          </div>
          <div>
            <Label>Clinical Observations</Label>
            <textarea className="w-full border border-border px-3 py-2" rows={3} onChange={(e) => setFormData({...formData, clinical_observations: e.target.value})} />
          </div>
          <div>
            <Label>Diagnosis</Label>
            <Input onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} />
          </div>
          <div>
            <Label>Treatment Plan</Label>
            <textarea className="w-full border border-border px-3 py-2" rows={3} onChange={(e) => setFormData({...formData, treatment_plan: e.target.value})} />
          </div>
          <div>
            <Label>Notes</Label>
            <textarea className="w-full border border-border px-3 py-2" rows={2} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
          </div>
          <Button type="submit">Save Visit</Button>
        </form>
      )}

      <div className="border border-gray-200 p-6 text-center text-gray-600">
        Use the form above to record medical visits
      </div>
    </div>
  )
}
