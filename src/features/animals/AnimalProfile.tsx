import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Edit, Plus, Printer } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { api } from '../../lib/api'

export default function AnimalProfile() {
  const { id } = useParams()
  const [animal, setAnimal] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showWeight, setShowWeight] = useState(false)
  const [showVacc, setShowVacc] = useState(false)
  const [showPresc, setShowPresc] = useState(false)
  const [weight, setWeight] = useState({ weight: '', weight_date: new Date().toISOString().split('T')[0], notes: '' })
  const [vacc, setVacc] = useState({ vaccine_name: '', date_administered: new Date().toISOString().split('T')[0], next_due_date: '', batch_number: '', notes: '' })
  const [presc, setPresc] = useState({ medication_name: '', dosage: '', frequency: '', duration: '', instructions: '' })

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

  const addWeight = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.addWeight({ animal_id: parseInt(id!), weight: parseFloat(weight.weight), weight_date: weight.weight_date, notes: weight.notes })
      setShowWeight(false)
      loadAnimal()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const addVaccination = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createVaccination({ animal_id: parseInt(id!), ...vacc })
      setShowVacc(false)
      loadAnimal()
    } catch (err: any) {
      alert(err.message)
    }
  }

  const addPrescription = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.createPrescription({ animal_id: parseInt(id!), client_id: animal.client_id, prescription_date: new Date().toISOString().split('T')[0], ...presc })
      setShowPresc(false)
      loadAnimal()
    } catch (err: any) {
      alert(err.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (!animal) return <div>Animal not found</div>

  return (
    <div>
      <div className="mb-6">
        <Link to={`/clients/${animal.client_id}`} className="flex items-center text-sm text-muted-foreground hover:text-black mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Client
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{animal.name}</h1>
            <p className="text-muted-foreground mt-1">{animal.species}</p>
          </div>
          <Link to={`/animals/edit/${animal.id}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Animal
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="border border-gray-200 p-4">
            <h2 className="font-semibold mb-3">Owner</h2>
            <div className="text-sm">
              <Link to={`/clients/${animal.client_id}`} className="text-black underline">
                {animal.owner_name}
              </Link>
              <p className="text-muted-foreground mt-1">{animal.owner_phone || '-'}</p>
            </div>
          </div>
          <div className="border border-gray-200 p-4 mt-4">
            <h2 className="font-semibold mb-3">Details</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Breed:</span> {animal.breed || '-'}</div>
              <div><span className="text-muted-foreground">Sex:</span> {animal.sex || '-'}</div>
              <div><span className="text-muted-foreground">Birth Date:</span> {animal.birth_date || '-'}</div>
              <div><span className="text-muted-foreground">Age:</span> {animal.estimated_age || '-'}</div>
              <div><span className="text-muted-foreground">Color:</span> {animal.color || '-'}</div>
              <div><span className="text-muted-foreground">Microchip:</span> {animal.microchip_id || '-'}</div>
              <div><span className="text-muted-foreground">ID Number:</span> {animal.identification_number || '-'}</div>
              {animal.allergies && <div className="bg-red-50 border border-red-200 p-2"><span className="text-red-700 font-medium">Allergies:</span> {animal.allergies}</div>}
              {animal.clinical_warnings && <div className="bg-yellow-50 border border-yellow-200 p-2"><span className="text-yellow-700 font-medium">Warnings:</span> {animal.clinical_warnings}</div>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Weight History</h2>
              <Button size="sm" variant="outline" onClick={() => setShowWeight(!showWeight)}>
                <Plus className="h-4 w-4 mr-1" /> Add Weight
              </Button>
            </div>
            {showWeight && (
              <form onSubmit={addWeight} className="mb-3 space-y-2 border border-gray-200 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Weight (kg)</Label>
                    <Input type="number" step="0.1" value={weight.weight} onChange={(e) => setWeight({...weight, weight: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Date</Label>
                    <Input type="date" value={weight.weight_date} onChange={(e) => setWeight({...weight, weight_date: e.target.value})} required />
                  </div>
                </div>
                <Button type="submit" size="sm">Save</Button>
              </form>
            )}
            {animal.weightHistory?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No weight records</p>
            ) : (
              <div className="space-y-2">
                {animal.weightHistory?.map((w: any) => (
                  <div key={w.id} className="flex justify-between text-sm border-b border-gray-100 pb-1">
                    <span>{w.weight_date}</span>
                    <span className="font-medium">{w.weight} kg</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Vaccinations</h2>
              <Button size="sm" variant="outline" onClick={() => setShowVacc(!showVacc)}>
                <Plus className="h-4 w-4 mr-1" /> Add Vaccination
              </Button>
            </div>
            {showVacc && (
              <form onSubmit={addVaccination} className="mb-3 space-y-2 border border-gray-200 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Vaccine Name</Label>
                    <Input value={vacc.vaccine_name} onChange={(e) => setVacc({...vacc, vaccine_name: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Date Administered</Label>
                    <Input type="date" value={vacc.date_administered} onChange={(e) => setVacc({...vacc, date_administered: e.target.value})} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Next Due Date</Label>
                    <Input type="date" value={vacc.next_due_date} onChange={(e) => setVacc({...vacc, next_due_date: e.target.value})} />
                  </div>
                  <div>
                    <Label>Batch Number</Label>
                    <Input value={vacc.batch_number} onChange={(e) => setVacc({...vacc, batch_number: e.target.value})} />
                  </div>
                </div>
                <Button type="submit" size="sm">Save</Button>
              </form>
            )}
            {animal.vaccinations?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No vaccinations</p>
            ) : (
              <div className="space-y-2">
                {animal.vaccinations?.map((v: any) => (
                  <div key={v.id} className="border border-gray-100 p-2 text-sm">
                    <div className="font-medium">{v.vaccine_name}</div>
                    <div className="text-muted-foreground">Given: {v.date_administered} {v.next_due_date && `| Due: ${v.next_due_date}`}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Prescriptions</h2>
              <Button size="sm" variant="outline" onClick={() => setShowPresc(!showPresc)}>
                <Plus className="h-4 w-4 mr-1" /> Add Prescription
              </Button>
            </div>
            {showPresc && (
              <form onSubmit={addPrescription} className="mb-3 space-y-2 border border-gray-200 p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Medication</Label>
                    <Input value={presc.medication_name} onChange={(e) => setPresc({...presc, medication_name: e.target.value})} required />
                  </div>
                  <div>
                    <Label>Dosage</Label>
                    <Input value={presc.dosage} onChange={(e) => setPresc({...presc, dosage: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label>Frequency</Label>
                    <Input value={presc.frequency} onChange={(e) => setPresc({...presc, frequency: e.target.value})} />
                  </div>
                  <div>
                    <Label>Duration</Label>
                    <Input value={presc.duration} onChange={(e) => setPresc({...presc, duration: e.target.value})} />
                  </div>
                </div>
                <div>
                  <Label>Instructions</Label>
                  <Input value={presc.instructions} onChange={(e) => setPresc({...presc, instructions: e.target.value})} />
                </div>
                <Button type="submit" size="sm">Save</Button>
              </form>
            )}
            {animal.prescriptions?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No prescriptions</p>
            ) : (
              <div className="space-y-2">
                {animal.prescriptions?.map((p: any) => (
                  <div key={p.id} className="border border-gray-100 p-2 text-sm flex justify-between items-center">
                    <div>
                      <div className="font-medium">{p.medication_name}</div>
                      <div className="text-muted-foreground">{p.dosage} {p.frequency} {p.duration && `- ${p.duration}`}</div>
                      {p.instructions && <div className="text-muted-foreground">{p.instructions}</div>}
                    </div>
                    <Link to={`/prescription/print/${p.id}`} target="_blank">
                      <Button size="sm" variant="outline"><Printer className="h-3 w-3" /></Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="border border-gray-200 p-4">
            <h2 className="font-semibold mb-3">Medical History</h2>
            {animal.visits?.length === 0 && animal.appointments?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No medical history</p>
            ) : (
              <div className="space-y-3">
                {animal.visits?.map((visit: any) => (
                  <div key={visit.id} className="border-l-2 border-gray-300 pl-3 py-2">
                    <div className="text-sm font-medium">{new Date(visit.visit_date).toLocaleDateString()}</div>
                    {visit.chief_complaint && <div className="text-sm mt-1"><span className="text-muted-foreground">Complaint:</span> {visit.chief_complaint}</div>}
                    {visit.diagnosis && <div className="text-sm"><span className="text-muted-foreground">Diagnosis:</span> {visit.diagnosis}</div>}
                    {visit.treatment_plan && <div className="text-sm"><span className="text-muted-foreground">Treatment:</span> {visit.treatment_plan}</div>}
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
