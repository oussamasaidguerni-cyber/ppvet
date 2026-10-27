import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { api } from '../../lib/api'

const animalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species: z.string().min(1, 'Species is required'),
  breed: z.string().optional(),
  sex: z.string().optional(),
  birth_date: z.string().optional(),
  estimated_age: z.string().optional(),
  color: z.string().optional(),
  microchip_id: z.string().optional(),
  identification_number: z.string().optional(),
  allergies: z.string().optional(),
  clinical_warnings: z.string().optional(),
  notes: z.string().optional(),
})

type AnimalFormData = z.infer<typeof animalSchema>

export default function AnimalEdit() {
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<AnimalFormData>({
    resolver: zodResolver(animalSchema),
  })

  useEffect(() => {
    loadAnimal()
  }, [id])

  const loadAnimal = async () => {
    try {
      const animal = await api.getAnimal(parseInt(id!))
      reset({
        name: animal.name,
        species: animal.species,
        breed: animal.breed || '',
        sex: animal.sex || '',
        birth_date: animal.birth_date || '',
        estimated_age: animal.estimated_age || '',
        color: animal.color || '',
        microchip_id: animal.microchip_id || '',
        allergies: animal.allergies || '',
        clinical_warnings: animal.clinical_warnings || '',
        notes: animal.notes || '',
      })
    } catch (err: any) {
      setError(err.message)
    }
  }

  const onSubmit = async (data: AnimalFormData) => {
    setError('')
    setLoading(true)
    try {
      await api.updateAnimal(parseInt(id!), data)
      navigate(-1)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Archive this animal?')) {
      try {
        await api.deleteAnimal(parseInt(id!))
        navigate(-1)
      } catch (err: any) {
        alert(err.message)
      }
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit Animal</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" {...register('name')} className="mt-1" />
            {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <Label htmlFor="species">Species *</Label>
            <Input id="species" {...register('species')} className="mt-1" />
            {errors.species && <p className="text-sm text-red-600 mt-1">{errors.species.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="breed">Breed</Label>
            <Input id="breed" {...register('breed')} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="sex">Sex</Label>
            <select id="sex" {...register('sex')} className="flex h-10 w-full border border-gray-300 bg-white px-3 py-2 text-sm">
              <option value="">Select...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="birth_date">Birth Date</Label>
            <Input id="birth_date" type="date" {...register('birth_date')} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="estimated_age">Estimated Age</Label>
            <Input id="estimated_age" {...register('estimated_age')} className="mt-1" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="color">Color</Label>
            <Input id="color" {...register('color')} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="microchip_id">Microchip ID</Label>
            <Input id="microchip_id" {...register('microchip_id')} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="identification_number">ID Number</Label>
            <Input id="identification_number" {...register('identification_number')} className="mt-1" />
          </div>
        </div>

        <div>
          <Label htmlFor="allergies">Allergies</Label>
          <Input id="allergies" {...register('allergies')} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="clinical_warnings">Clinical Warnings</Label>
          <Input id="clinical_warnings" {...register('clinical_warnings')} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea id="notes" {...register('notes')} className="flex min-h-[80px] w-full border border-gray-300 bg-white px-3 py-2 text-sm" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="button" variant="outline" onClick={handleDelete} className="ml-auto">Archive</Button>
        </div>
      </form>
    </div>
  )
}
