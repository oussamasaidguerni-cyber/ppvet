import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { api } from '../../lib/api'

const clientSchema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  phone: z.string().optional(),
  secondary_phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
})

type ClientFormData = z.infer<typeof clientSchema>

export default function ClientEdit() {
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  })

  useEffect(() => {
    loadClient()
  }, [id])

  const loadClient = async () => {
    try {
      const client = await api.getClient(parseInt(id!))
      reset({
        full_name: client.full_name,
        phone: client.phone || '',
        secondary_phone: client.secondary_phone || '',
        address: client.address || '',
        notes: client.notes || '',
      })
    } catch (err: any) {
      setError(err.message)
    }
  }

  const onSubmit = async (data: ClientFormData) => {
    setError('')
    setLoading(true)
    try {
      await api.updateClient(parseInt(id!), data)
      navigate('/clients')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm('Archive this client?')) {
      try {
        await api.deleteClient(parseInt(id!))
        navigate('/clients')
      } catch (err: any) {
        alert(err.message)
      }
    }
  }

  const handlePermanentDelete = async () => {
    if (confirm('Permanently delete this client? This cannot be undone.')) {
      try {
        await api.permanentDeleteClient(parseInt(id!))
        navigate('/clients')
      } catch (err: any) {
        alert(err.message)
      }
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Edit Client</h1>
        <p className="text-gray-600 mt-1">Update client information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
        <div>
          <Label htmlFor="full_name">Full Name *</Label>
          <Input id="full_name" {...register('full_name')} className="mt-1" />
          {errors.full_name && <p className="text-sm text-red-600 mt-1">{errors.full_name.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="secondary_phone">Secondary Phone</Label>
            <Input id="secondary_phone" {...register('secondary_phone')} className="mt-1" />
          </div>
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" {...register('address')} className="mt-1" />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea id="notes" {...register('notes')} className="flex min-h-[80px] w-full border border-border border-border bg-background px-3 py-2 text-sm" />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
          <Button type="button" variant="outline" onClick={() => navigate('/clients')}>Cancel</Button>
          <Button type="button" variant="outline" onClick={handleDelete} className="ml-auto">Archive</Button>
          <Button type="button" variant="outline" onClick={handlePermanentDelete} className="text-red-600">Delete Permanently</Button>
        </div>
      </form>
    </div>
  )
}
