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
        <div className="text-sm text-muted-foreground">Loading...</div>
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
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      {clients.length === 0 ? (
        <div className="border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground mb-4">{searchTerm ? 'No clients match your search.' : 'No clients yet.'}</p>
          {!searchTerm && (
            <Link to="/clients/new">
              <Button>Register First Patient</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="border border-border bg-card overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Name</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Phone</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Address</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors">
                  <td className="px-4 py-3 text-foreground">{client.full_name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{client.phone || '-'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{client.address || '-'}</td>
                  <td className="px-4 py-3 flex gap-3">
                    <Link to={`/clients/${client.id}`} className="text-sm text-foreground hover:underline">
                      View
                    </Link>
                    <Link to={`/clients/edit/${client.id}`} className="text-sm text-foreground hover:underline flex items-center gap-1">
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
