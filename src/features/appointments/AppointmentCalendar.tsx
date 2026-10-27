import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { api } from '../../lib/api'

export default function AppointmentCalendar() {
  const [appointments, setAppointments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const data = await api.getAppointments()
      setAppointments(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const groupByDate = () => {
    const groups: any = {}
    appointments.forEach(appt => {
      const date = appt.appointment_date.split('T')[0]
      if (!groups[date]) groups[date] = []
      groups[date].push(appt)
    })
    return groups
  }

  if (loading) return <div>Loading...</div>

  const groups = groupByDate()
  const dates = Object.keys(groups).sort()

  return (
    <div>
      <div className="mb-6">
        <Link to="/appointments" className="flex items-center text-sm text-muted-foreground hover:text-black mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Appointments
        </Link>
        <h1 className="text-2xl font-semibold">Calendar View</h1>
      </div>

      {dates.length === 0 ? (
        <div className="border border-gray-200 p-6 text-center text-muted-foreground">No appointments</div>
      ) : (
        <div className="space-y-6">
          {dates.map(date => (
            <div key={date}>
              <h2 className="font-semibold mb-2">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
              <div className="border border-gray-200">
                {groups[date].map((appt: any) => (
                  <div key={appt.id} className="p-3 border-b border-gray-100 last:border-0 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{appt.client_name} - {appt.animal_name}</div>
                      <div className="text-sm text-muted-foreground">{new Date(appt.appointment_date).toLocaleTimeString()} - {appt.reason}</div>
                      <div className="text-sm text-muted-foreground capitalize">{appt.status} | {appt.appointment_type}</div>
                    </div>
                    {appt.status !== 'completed' && appt.status !== 'cancelled' && (
                      <Link to={`/medical/start-visit?appointment_id=${appt.id}&client_id=${appt.client_id}&animal_id=${appt.animal_id}&reason=${encodeURIComponent(appt.reason)}`}>
                        <Button size="sm">Start Visit</Button>
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
