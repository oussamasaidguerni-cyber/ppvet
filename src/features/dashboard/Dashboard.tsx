import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Package, CreditCard, Plus, FileText } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

export default function Dashboard() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    todayAppointments: 0,
    followUps: 0,
    lowStock: 0,
    revenue: 0,
  })
  const [clinicName, setClinicName] = useState('P&PVET')

  useEffect(() => {
    loadDashboardData()
  }, [user])

  const loadDashboardData = async () => {
    if (!user) return
    try {
      // Get clinic info
      const { data: clinic } = await supabase
        .from('clinic_settings')
        .select('clinic_name')
        .eq('owner_user_id', user.id)
        .single()
      
      if (clinic) {
        setClinicName(clinic.clinic_name)
      }
      
      // For new clinic with no records, show zeros
      setStats({
        todayAppointments: 0,
        followUps: 0,
        lowStock: 0,
        revenue: 0,
      })
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
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome to {clinicName}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-semibold mt-1">{stats.todayAppointments}</p>
            </div>
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Follow-ups Due</p>
              <p className="text-2xl font-semibold mt-1">{stats.followUps}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-semibold mt-1">{stats.lowStock}</p>
            </div>
            <Package className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Revenue (Today)</p>
              <p className="text-2xl font-semibold mt-1">{stats.revenue} DZD</p>
            </div>
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link to="/clients/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Register Client
            </Button>
          </Link>
          <Link to="/clients">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Animal
            </Button>
          </Link>
          <Link to="/appointments">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Appointment
            </Button>
          </Link>
        </div>
      </div>

      {/* Onboarding/Empty State */}
      <div className="border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-2">Getting Started</h2>
        <p className="text-gray-600 mb-4">
          No records yet. Start by registering your first client and their animals.
        </p>
        <Link to="/clients/new">
          <Button>Register First Client</Button>
        </Link>
      </div>
    </div>
  )
}
