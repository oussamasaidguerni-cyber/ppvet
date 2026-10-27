import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Calendar, Package, CreditCard, Plus, DollarSign } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { api } from '../../lib/api'
import Reminders from '../reminders/Reminders'

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
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">Dashboard</h1>
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome to {clinic?.clinic_name || 'P&PVET'}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Clients</p>
              <p className="text-2xl font-semibold mt-1">{stats.clients}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Animals</p>
              <p className="text-2xl font-semibold mt-1">{stats.animals}</p>
            </div>
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Appointments</p>
              <p className="text-2xl font-semibold mt-1">{stats.todayAppointments}</p>
            </div>
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Upcoming</p>
              <p className="text-2xl font-semibold mt-1">{stats.upcomingAppointments}</p>
            </div>
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Income</p>
              <p className="text-2xl font-semibold mt-1">{stats.monthlyIncome} DZD</p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Income</p>
              <p className="text-2xl font-semibold mt-1">{stats.totalIncome} DZD</p>
            </div>
            <DollarSign className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-semibold mt-1">{stats.outstandingBalance} DZD</p>
            </div>
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock / Vaccines Due</p>
              <p className="text-2xl font-semibold mt-1">{stats.lowStock} / {stats.vaccinesDue}</p>
            </div>
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      <Reminders />

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/clients/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Client
            </Button>
          </Link>
          <Link to="/appointments">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </Link>
          <Link to="/medical">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Record Visit
            </Button>
          </Link>
          <Link to="/billing">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {stats.clients === 0 && (
        <div className="border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-2">Get Started</h2>
          <p className="text-muted-foreground mb-4">
            No records yet. Add your first client to begin.
          </p>
          <Link to="/clients/new">
            <Button>Add First Client</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
