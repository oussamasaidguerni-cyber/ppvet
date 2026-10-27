export interface ClinicSettings {
  id: string
  owner_user_id: string
  clinic_name: string
  phone: string | null
  address: string | null
  currency: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface Client {
  id: string
  clinic_id: string
  full_name: string
  phone: string | null
  email: string | null
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Animal {
  id: string
  clinic_id: string
  client_id: string
  name: string
  species: string
  breed: string | null
  sex: 'male' | 'female' | 'unknown' | null
  birth_date: string | null
  estimated_age: string | null
  color: string | null
  microchip_id: string | null
  weight: number | null
  allergies: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  clinic_id: string
  client_id: string | null
  animal_id: string | null
  appointment_date: string
  duration_minutes: number
  reason: string | null
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  created_at: string
  updated_at: string
}
