import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { api } from '../../lib/api'

export default function AnimalProfile() {
  const { id } = useParams()
  const [animal, setAnimal] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) loadAnimal()
  }, [id])

  const loadAnimal = async () => {
    try {
      const data = await api.getAnimal(parseInt(id!))
      setAnimal(data)
    } catch (error) {
      console.error('Error loading animal:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!animal) return <div>Animal not found</div>

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
            <div className="text-sm">
              <Link to={`/clients/${animal.client_id}`} className="text-black underline">
                {animal.owner_name}
              </Link>
              <p className="text-gray-600 mt-1">{animal.owner_phone || '-'}</p>
            </div>
          </div>
          <div className="border border-gray-200 p-4 mt-4">
            <h2 className="font-semibold mb-3">Details</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-600">Breed:</span> {animal.breed || '-'}</div>
              <div><span className="text-gray-600">Sex:</span> {animal.sex || '-'}</div>
              <div><span className="text-gray-600">Birth Date:</span> {animal.birth_date || '-'}</div>
              <div><span className="text-gray-600">Age:</span> {animal.estimated_age || '-'}</div>
              <div><span className="text-gray-600">Color:</span> {animal.color || '-'}</div>
              <div><span className="text-gray-600">Microchip:</span> {animal.microchip_id || '-'}</div>
              <div><span className="text-gray-600">Allergies:</span> {animal.allergies || '-'}</div>
              {animal.clinical_warnings && <div><span className="text-gray-600">Warnings:</span> {animal.clinical_warnings}</div>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="border border-gray-200 p-4 mb-4">
            <h2 className="font-semibold mb-3">Medical History</h2>
            {animal.visits?.length === 0 && animal.appointments?.length === 0 ? (
              <p className="text-gray-600 text-sm">No medical history</p>
            ) : (
              <div className="space-y-3">
                {animal.visits?.map((visit: any) => (
                  <div key={visit.id} className="border-l-2 border-gray-300 pl-3 py-2">
                    <div className="text-sm font-medium">{new Date(visit.visit_date).toLocaleDateString()}</div>
                    {visit.chief_complaint && <div className="text-sm mt-1"><span className="text-gray-600">Complaint:</span> {visit.chief_complaint}</div>}
                    {visit.diagnosis && <div className="text-sm"><span className="text-gray-600">Diagnosis:</span> {visit.diagnosis}</div>}
                    {visit.treatment_plan && <div className="text-sm"><span className="text-gray-600">Treatment:</span> {visit.treatment_plan}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
