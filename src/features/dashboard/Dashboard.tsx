import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, Package, CreditCard, Plus, DollarSign, ArrowRight, FileText } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { api } from '../../lib/api'
import { db } from '../../lib/db'
import Reminders from '../reminders/Reminders'
import { format } from 'date-fns'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    clients: 0,
    animals: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    outstandingBalance: 0,
    lowStock: 0,
    monthlyIncome: 0,
    totalIncome: 0,
    vaccinesDue: 0,
    invoicesOverdue: 0,
  })
  const [clinic, setClinic] = useState<any>(null)
  const [todayAppts, setTodayAppts] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsData, clinicData] = await Promise.all([
        api.getDashboardStats(),
        api.getClinic()
      ])
      setStats(statsData)
      setClinic(clinicData)
      
      // Load today's appointments
      const today = new Date().toISOString().split('T')[0]
      const appts = await db.appointments
        .where('appointment_date')
        .startsWith(today)
        .toArray()
      
      const apptsWithDetails = await Promise.all(
        appts.map(async (appt) => {
          const animal = await db.animals.get(appt.animal_id)
          const client = await db.clients.get(appt.client_id)
          return { ...appt, animal, client }
        })
      )
      setTodayAppts(apptsWithDetails.sort((a, b) => a.appointment_date.localeCompare(b.appointment_date)))
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Dashboard</h1>
        </div>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  const formatTime = (datetime: string) => {
    try {
      return format(new Date(datetime), 'HH:mm')
    } catch {
      return datetime
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Daily command center — {clinic?.clinic_name || 'P&PVET'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link to="/appointments" className="block">
          <div className="border border-border bg-card p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Appointments</p>
                <p className="text-2xl font-semibold mt-1 text-foreground">{stats.todayAppointments}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </Link>
        <Link to="/clients" className="block">
          <div className="border border-border bg-card p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Patients</p>
                <p className="text-2xl font-semibold mt-1 text-foreground">{stats.animals}</p>
              </div>
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </Link>
        <Link to="/billing" className="block">
          <div className="border border-border bg-card p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Collected</p>
                <p className="text-xl font-semibold mt-1 text-foreground">{stats.monthlyIncome} DZD</p>
              </div>
              <DollarSign className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </Link>
        <Link to="/billing" className="block">
          <div className="border border-border bg-card p-4 hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-xl font-semibold mt-1 text-foreground">{stats.outstandingBalance} DZD</p>
              </div>
              <CreditCard className="h-8 w-8 text-muted-foreground" />
            </div>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Today's Schedule</h2>
            <Link to="/appointments" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
              View calendar <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {todayAppts.length === 0 ? (
            <div className="border border-border bg-card p-6 text-center">
              <p className="text-muted-foreground">No appointments today</p>
              <Link to="/appointments" className="text-sm text-foreground underline mt-2 inline-block">Schedule appointment</Link>
            </div>
          ) : (
            <div className="border border-border bg-card divide-y divide-border">
              {todayAppts.map((appt) => (
                <div key={appt.id} className="p-4 flex items-center justify-between hover:bg-accent/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="text-sm font-medium w-16">{formatTime(appt.appointment_date)}</div>
                    <div>
                      <div className="font-medium">{appt.animal?.name} <span className="text-muted-foreground">({appt.animal?.species})</span></div>
                      <div className="text-sm text-muted-foreground">{appt.client?.full_name} • {appt.reason || 'Consultation'}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded ${
                      appt.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400' :
                      appt.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400' :
                      appt.status === 'in_consultation' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400'
                    }`}>{appt.status.replace('_', ' ')}</span>
                    <Link to={`/animals/${appt.animal_id}`}>
                      <Button variant="ghost" size="sm">Open</Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <Reminders />
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/clients/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Register Patient
            </Button>
          </Link>
          <Link to="/appointments">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </Link>
          <Link to="/medical">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Start Consultation
            </Button>
          </Link>
          <Link to="/billing">
            <Button variant="outline">
              <CreditCard className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
          <Link to="/inventory">
            <Button variant="outline">
              <Package className="h-4 w-4 mr-2" />
              Manage Inventory
            </Button>
          </Link>
        </div>
      </div>

      {stats.clients === 0 && (
        <div className="border border-border bg-card p-6">
          <h2 className="text-lg font-semibold mb-2">Get Started</h2>
          <p className="text-muted-foreground mb-4">
            No records yet. Add your first client to begin managing your practice.
          </p>
          <Link to="/clients/new">
            <Button>Register First Patient</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
