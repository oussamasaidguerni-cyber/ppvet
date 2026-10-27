import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { supabase } from '../../lib/supabase'
import type { Client } from '../../types/database'
import { useAuth } from '../../hooks/useAuth'

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { user } = useAuth()

  useEffect(() => {
    loadClients()
  }, [user])

  const loadClients = async () => {
    if (!user) return
    try {
      const { data: clinic } = await supabase
        .from('clinic_settings')
        .select('id')
        .eq('owner_user_id', user.id)
        .single()

      if (clinic) {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('clinic_id', clinic.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        setClients(data || [])
      }
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClients = clients.filter(client =>
    client.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Clients</h1>
        </div>
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link to="/clients/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="border border-gray-200 p-6 text-center">
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No clients found matching your search.' : 'No clients yet.'}
          </p>
          {!searchTerm && (
            <Link to="/clients/new">
              <Button>Register First Client</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="border border-gray-200">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Phone</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Email</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b border-gray-200 last:border-0">
                  <td className="px-4 py-3">{client.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{client.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{client.email || '-'}</td>
                  <td className="px-4 py-3">
                    <Link to={`/clients/${client.id}`} className="text-sm text-black underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
