import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { api } from '../../lib/api'

export default function StartVisit() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    appointment_id: searchParams.get('appointment_id') || '',
    client_id: searchParams.get('client_id') || '',
    animal_id: searchParams.get('animal_id') || '',
    visit_date: new Date().toISOString().split('T')[0],
    chief_complaint: searchParams.get('reason') || '',
    clinical_observations: '',
    diagnosis: '',
    treatment_plan: '',
    notes: '',
    follow_up_date: ''
  })

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
      navigate('/appointments')
    } catch (error: any) {
      alert(error.message)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Start Visit</h1>
        <p className="text-gray-600 mt-1">Record consultation</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
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
          <Input value={formData.chief_complaint} onChange={(e) => setFormData({...formData, chief_complaint: e.target.value})} />
        </div>
        <div>
          <Label>Clinical Observations</Label>
          <textarea className="w-full border border-input bg-background text-foreground px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" rows={3} onChange={(e) => setFormData({...formData, clinical_observations: e.target.value})} />
        </div>
        <div>
          <Label>Diagnosis</Label>
          <Input onChange={(e) => setFormData({...formData, diagnosis: e.target.value})} />
        </div>
        <div>
          <Label>Treatment Plan</Label>
          <textarea className="w-full border border-input bg-background text-foreground px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" rows={3} onChange={(e) => setFormData({...formData, treatment_plan: e.target.value})} />
        </div>
        <div>
          <Label>Notes</Label>
          <textarea className="w-full border border-input bg-background text-foreground px-3 py-2 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring" rows={2} onChange={(e) => setFormData({...formData, notes: e.target.value})} />
        </div>
        <div className="flex gap-2">
          <Button type="submit">Save Visit</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/appointments')}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
