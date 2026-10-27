import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, ArrowLeft } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { api } from '../../lib/api'

export default function ClientProfile() {
  const { id } = useParams()
  const [client, setClient] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadClient()
  }, [id])

  const loadClient = async () => {
    try {
      const data = await api.getClient(parseInt(id!))
      setClient(data)
    } catch (error) {
      console.error('Error loading client:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!client) return <div>Client not found</div>

  return (
    <div>
      <div className="mb-6">
        <Link to="/clients" className="flex items-center text-sm text-muted-foreground hover:text-black mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Clients
        </Link>
        <h1 className="text-2xl font-semibold">{client.full_name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="border border-gray-200 p-4">
            <h2 className="font-semibold mb-3">Contact Information</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-muted-foreground">Phone:</span>
                <p>{client.phone || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Secondary Phone:</span>
                <p>{client.secondary_phone || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Address:</span>
                <p>{client.address || '-'}</p>
              </div>
              {client.notes && (
                <div>
                  <span className="text-muted-foreground">Notes:</span>
                  <p>{client.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Animals</h2>
            <Link to={`/clients/${client.id}/animals/new`}>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Animal
              </Button>
            </Link>
          </div>

          {client.animals?.length === 0 ? (
            <div className="border border-gray-200 p-6 text-center">
              <p className="text-muted-foreground mb-4">No animals registered</p>
              <Link to={`/clients/${client.id}/animals/new`}>
                <Button>Register First Animal</Button>
              </Link>
            </div>
          ) : (
            <div className="border border-gray-200">
              <table className="w-full">
                <thead className="bg-muted border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium">Name</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Species</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Breed</th>
                    <th className="text-left px-4 py-3 text-sm font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {client.animals?.map((animal: any) => (
                    <tr key={animal.id} className="border-b border-gray-200 last:border-0">
                      <td className="px-4 py-3">{animal.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{animal.species}</td>
                      <td className="px-4 py-3 text-muted-foreground">{animal.breed || '-'}</td>
                      <td className="px-4 py-3">
                        <Link to={`/animals/${animal.id}`} className="text-sm text-black underline">
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
      </div>
    </div>
  )
}
