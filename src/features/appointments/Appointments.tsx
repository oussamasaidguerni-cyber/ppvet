import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Calendar, Edit } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { api } from '../../lib/api'

export default function Appointments() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    client_id: '',
    animal_id: '',
    appointment_date: '',
    reason: '',
    appointment_type: 'consultation'
  })
  const [clientAnimals, setClientAnimals] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [appts, clis] = await Promise.all([api.getAppointments(), api.getClients()])
      setAppointments(appts)
      setClients(clis)
    } catch (error) {
      console.error('Error loading:', error)
    } finally {
      setLoading(false)
    }
  }

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
      if (editId) {
        await api.updateAppointment(editId, {
          appointment_date: formData.appointment_date,
          reason: formData.reason,
          appointment_type: formData.appointment_type
        })
      } else {
        await api.createAppointment({
          ...formData,
          client_id: parseInt(formData.client_id),
          animal_id: parseInt(formData.animal_id)
        })
      }
      setShowForm(false)
      setEditId(null)
      setFormData({ client_id: '', animal_id: '', appointment_date: '', reason: '', appointment_type: 'consultation' })
      loadData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const startEdit = (appt: any) => {
    setEditId(appt.id)
    setFormData({
      client_id: appt.client_id,
      animal_id: appt.animal_id,
      appointment_date: appt.appointment_date,
      reason: appt.reason,
      appointment_type: appt.appointment_type
    })
    setShowForm(true)
  }

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.updateAppointment(id, { status })
      loadData()
    } catch (error: any) {
      alert(error.message)
    }
  }

  const cancelAppointment = async (id: number) => {
    if (confirm('Cancel this appointment?')) {
      try {
        await api.updateAppointment(id, { status: 'cancelled' })
        loadData()
      } catch (error: any) {
        alert(error.message)
      }
    }
  }

  const deleteAppointment = async (id: number) => {
    if (confirm('Delete this appointment permanently?')) {
      try {
        await api.deleteAppointment(id)
        loadData()
      } catch (error: any) {
        alert(error.message)
      }
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <div className="flex gap-2">
          <Link to="/appointments/calendar">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Calendar View
            </Button>
          </Link>
          <Button onClick={() => { setShowForm(!showForm); setEditId(null); setFormData({ client_id: '', animal_id: '', appointment_date: '', reason: '', appointment_type: 'consultation' }); }}>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Appointment
          </Button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="border border-gray-200 p-4 mb-6 space-y-4 max-w-2xl">
          {!editId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Client</Label>
                <select className="w-full h-10 border border-gray-300 px-3" onChange={(e) => handleClientChange(e.target.value)} required>
                  <option value="">Select...</option>
                  {clients.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div>
                <Label>Animal</Label>
                <select className="w-full h-10 border border-gray-300 px-3" onChange={(e) => setFormData({...formData, animal_id: e.target.value})} required>
                  <option value="">Select...</option>
                  {clientAnimals.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Date & Time</Label>
              <Input type="datetime-local" value={formData.appointment_date} onChange={(e) => setFormData({...formData, appointment_date: e.target.value})} required />
            </div>
            <div>
              <Label>Type</Label>
              <select className="w-full h-10 border border-gray-300 px-3" value={formData.appointment_type} onChange={(e) => setFormData({...formData, appointment_type: e.target.value})}>
                <option value="consultation">Consultation</option>
                <option value="vaccination">Vaccination</option>
                <option value="surgery">Surgery</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>
          <div>
            <Label>Reason</Label>
            <Input value={formData.reason} onChange={(e) => setFormData({...formData, reason: e.target.value})} required />
          </div>
          <div className="flex gap-2">
            <Button type="submit">{editId ? 'Update' : 'Save'}</Button>
            <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditId(null); }}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="border border-gray-200">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium">Date</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Client</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Animal</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Reason</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Status</th>
              <th className="text-left px-4 py-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr key={appt.id} className="border-b border-gray-200 last:border-0">
                <td className="px-4 py-3 text-sm">{new Date(appt.appointment_date).toLocaleString()}</td>
                <td className="px-4 py-3">{appt.client_name}</td>
                <td className="px-4 py-3">{appt.animal_name}</td>
                <td className="px-4 py-3 text-sm">{appt.reason}</td>
                <td className="px-4 py-3 text-sm capitalize">{appt.status}</td>
                <td className="px-4 py-3 flex gap-2 flex-wrap">
                  {appt.status === 'scheduled' && (
                    <>
                      <button onClick={() => updateStatus(appt.id, 'confirmed')} className="text-sm text-black underline">Confirm</button>
                      <Link to={`/medical/start-visit?appointment_id=${appt.id}&client_id=${appt.client_id}&animal_id=${appt.animal_id}&reason=${encodeURIComponent(appt.reason)}`} className="text-sm text-black underline">Start Visit</Link>
                      <button onClick={() => cancelAppointment(appt.id)} className="text-sm text-red-600 underline">Cancel</button>
                    </>
                  )}
                  {appt.status === 'confirmed' && (
                    <>
                      <Link to={`/medical/start-visit?appointment_id=${appt.id}&client_id=${appt.client_id}&animal_id=${appt.animal_id}&reason=${encodeURIComponent(appt.reason)}`} className="text-sm text-black underline">Start Visit</Link>
                      <button onClick={() => cancelAppointment(appt.id)} className="text-sm text-red-600 underline">Cancel</button>
                    </>
                  )}
                  {appt.status === 'cancelled' && (
                    <button onClick={() => deleteAppointment(appt.id)} className="text-sm text-red-600 underline">Delete</button>
                  )}
                  {appt.status !== 'cancelled' && (
                    <button onClick={() => startEdit(appt)} className="text-sm text-black underline flex items-center gap-1"><Edit className="h-3 w-3" />Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {appointments.length === 0 && (
          <div className="p-6 text-center text-gray-600">No appointments</div>
        )}
      </div>
    </div>
  )
}
