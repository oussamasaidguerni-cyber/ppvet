import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../lib/db'

export default function Reminders() {
  const [reminders, setReminders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateReminders()
  }, [])

  const generateReminders = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      
      const appointments = await db.appointments.toArray()
      const vaccinations = await db.vaccinations.toArray()
      const animals = await db.animals.where('is_active').equals(1).toArray()
      const clients = await db.clients.toArray()
      
      const items: any[] = []
      
      // Vaccinations due
      vaccinations.forEach(v => {
        if (v.next_due_date) {
          if (v.next_due_date < today) {
            const animal = animals.find(a => a.id === v.animal_id)
            const client = clients.find(c => c.id === animal?.client_id)
            items.push({ type: 'overdue', title: `Vaccine overdue: ${v.vaccine_name}`, subtitle: `${animal?.name} - ${client?.full_name}`, link: `/animals/${v.animal_id}`, date: v.next_due_date })
          } else if (v.next_due_date <= in30Days) {
            const animal = animals.find(a => a.id === v.animal_id)
            const client = clients.find(c => c.id === animal?.client_id)
            items.push({ type: 'soon', title: `Vaccine due: ${v.vaccine_name}`, subtitle: `${animal?.name} - ${client?.full_name}`, link: `/animals/${v.animal_id}`, date: v.next_due_date })
          }
        }
      })
      
      // Appointments
      appointments.forEach(appt => {
        if (appt.status === 'cancelled') return
        const apptDate = appt.appointment_date.split('T')[0]
        const animal = animals.find(a => a.id === appt.animal_id)
        const client = clients.find(c => c.id === appt.client_id)
        if (apptDate === today && appt.status !== 'completed') {
          items.push({ type: 'today', title: `Appointment today`, subtitle: `${animal?.name} - ${client?.full_name} - ${appt.reason}`, link: `/appointments`, date: apptDate })
        } else if (apptDate >= today && apptDate <= in7Days && appt.status !== 'completed') {
          items.push({ type: 'upcoming', title: `Upcoming appointment`, subtitle: `${animal?.name} - ${client?.full_name}`, link: `/appointments`, date: apptDate })
        }
      })
      
      setReminders(items)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return null

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3">Action Center</h2>
      <div className="space-y-2">
        {reminders.length === 0 ? (
          <div className="border border-border bg-card p-3 text-sm text-muted-foreground">No pending tasks</div>
        ) : (
          reminders.map((r, idx) => (
            <Link key={idx} to={r.link} className="block border border-border bg-card p-3 hover:bg-accent/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm text-foreground">{r.title}</div>
                  <div className="text-sm text-muted-foreground">{r.subtitle}</div>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded ${
                    r.type === 'overdue' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400' :
                    r.type === 'today' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400' :
                    'bg-muted text-muted-foreground'
                  }`}>{r.type}</span>
                  <div className="text-xs text-muted-foreground mt-1">{r.date}</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
