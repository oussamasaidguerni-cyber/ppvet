import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Animal, Client } from '../../types/database'

export default function AnimalProfile() {
  const { id } = useParams()
  const [animal, setAnimal] = useState<Animal | null>(null)
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadAnimalData()
  }, [id])

  const loadAnimalData = async () => {
    try {
      const { data: animalData, error: animalError } = await supabase
        .from('animals')
        .select('*')
        .eq('id', id)
        .single()

      if (animalError) throw animalError
      setAnimal(animalData)

      if (animalData) {
        const { data: clientData, error: clientError } = await supabase
          .from('clients')
          .select('*')
          .eq('id', animalData.client_id)
          .single()

        if (clientError) throw clientError
        setClient(clientData)
      }
    } catch (error) {
      console.error('Error loading animal:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Animal Profile</h1>
        </div>
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    )
  }

  if (!animal) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold">Animal Profile</h1>
        </div>
        <div className="border border-gray-200 p-6 text-center">
          <p className="text-gray-600">Animal not found</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <Link to={`/clients/${animal.client_id}`} className="flex items-center text-sm text-gray-600 hover:text-black mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Client
        </Link>
        <h1 className="text-2xl font-semibold">{animal.name}</h1>
        <p className="text-gray-600 mt-1">{animal.species}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="border border-gray-200 p-4">
            <h2 className="font-semibold mb-3">Owner</h2>
            {client && (
              <div className="text-sm">
                <Link to={`/clients/${client.id}`} className="text-black underline">
                  {client.full_name}
                </Link>
                <p className="text-gray-600 mt-1">{client.phone || '-'}</p>
                <p className="text-gray-600">{client.email || '-'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="border border-gray-200 p-4">
            <h2 className="font-semibold mb-3">Animal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Name:</span>
                <p>{animal.name}</p>
              </div>
              <div>
                <span className="text-gray-600">Species:</span>
                <p>{animal.species}</p>
              </div>
              <div>
                <span className="text-gray-600">Breed:</span>
                <p>{animal.breed || '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">Sex:</span>
                <p className="capitalize">{animal.sex || '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">Birth Date:</span>
                <p>{animal.birth_date || '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">Estimated Age:</span>
                <p>{animal.estimated_age || '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">Color:</span>
                <p>{animal.color || '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">Weight:</span>
                <p>{animal.weight ? `${animal.weight} kg` : '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">Microchip ID:</span>
                <p>{animal.microchip_id || '-'}</p>
              </div>
              <div>
                <span className="text-gray-600">Allergies:</span>
                <p>{animal.allergies || '-'}</p>
              </div>
            </div>
            {animal.notes && (
              <div className="mt-4">
                <span className="text-gray-600 text-sm">Notes:</span>
                <p className="text-sm mt-1">{animal.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
