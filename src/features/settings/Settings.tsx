import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

const settingsSchema = z.object({
  clinic_name: z.string().min(1, 'Clinic name is required'),
  phone: z.string().optional(),
  address: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  timezone: z.string().min(1, 'Timezone is required'),
})

type SettingsFormData = z.infer<typeof settingsSchema>

export default function Settings() {
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [clinicId, setClinicId] = useState<string | null>(null)
  const { user } = useAuth()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      clinic_name: 'P&PVET Clinic',
      currency: 'DZD',
      timezone: 'Africa/Algiers',
    },
  })

  useEffect(() => {
    loadSettings()
  }, [user])

  const loadSettings = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('clinic_settings')
        .select('*')
        .eq('owner_user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (data) {
        setClinicId(data.id)
        setValue('clinic_name', data.clinic_name)
        setValue('phone', data.phone || '')
        setValue('address', data.address || '')
        setValue('currency', data.currency)
        setValue('timezone', data.timezone)
      }
    } catch (err: any) {
      console.error('Error loading settings:', err)
    } finally {
      setFetchLoading(false)
    }
  }

  const onSubmit = async (data: SettingsFormData) => {
    if (!user) return
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (clinicId) {
        const { error } = await supabase
          .from('clinic_settings')
          .update({
            clinic_name: data.clinic_name,
            phone: data.phone || null,
            address: data.address || null,
            currency: data.currency,
            timezone: data.timezone,
          })
          .eq('id', clinicId)

        if (error) throw error
      } else {
        const { data: newClinic, error } = await supabase
          .from('clinic_settings')
          .insert({
            owner_user_id: user.id,
            clinic_name: data.clinic_name,
            phone: data.phone || null,
            address: data.address || null,
            currency: data.currency,
            timezone: data.timezone,
          })
          .select()
          .single()

        if (error) throw error
        if (newClinic) setClinicId(newClinic.id)
      }
      setSuccess('Settings saved successfully')
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">Settings</h1>
        <div className="text-sm text-gray-600">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Clinic Settings</h1>
        <p className="text-gray-600 mt-1">Manage your clinic information</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-2xl space-y-4">
        <div>
          <Label htmlFor="clinic_name">Clinic Name *</Label>
          <Input
            id="clinic_name"
            {...register('clinic_name')}
            className="mt-1"
          />
          {errors.clinic_name && (
            <p className="text-sm text-red-600 mt-1">{errors.clinic_name.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            id="phone"
            {...register('phone')}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            {...register('address')}
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="currency">Currency *</Label>
            <Input
              id="currency"
              {...register('currency')}
              className="mt-1"
            />
            {errors.currency && (
              <p className="text-sm text-red-600 mt-1">{errors.currency.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="timezone">Timezone *</Label>
            <Input
              id="timezone"
              {...register('timezone')}
              className="mt-1"
            />
            {errors.timezone && (
              <p className="text-sm text-red-600 mt-1">{errors.timezone.message}</p>
            )}
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600">{success}</p>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : 'Save Settings'}
        </Button>
      </form>
    </div>
  )
}
