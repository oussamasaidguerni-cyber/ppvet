import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Edit } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { api } from '../../lib/api'

export default function ClientsList() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async (search = '') => {
    try {
      const data = await api.getClients(search)
      setClients(data)
    } catch (error) {
      console.error('Error loading clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadClients(searchTerm)
  }

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

      <form onSubmit={handleSearch} className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {clients.length === 0 ? (
        <div className="border border-gray-200 p-6 text-center">
          <p className="text-gray-600 mb-4">No clients yet.</p>
          <Link to="/clients/new">
            <Button>Add First Client</Button>
          </Link>
        </div>
      ) : (
        <div className="border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Phone</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Address</th>
                <th className="text-left px-4 py-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-gray-200 last:border-0">
                  <td className="px-4 py-3">{client.full_name}</td>
                  <td className="px-4 py-3 text-gray-600">{client.phone || '-'}</td>
                  <td className="px-4 py-3 text-gray-600">{client.address || '-'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <Link to={`/clients/${client.id}`} className="text-sm text-black underline">
                      View
                    </Link>
                    <Link to={`/clients/edit/${client.id}`} className="text-sm text-black underline flex items-center gap-1">
                      <Edit className="h-3 w-3" /> Edit
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
