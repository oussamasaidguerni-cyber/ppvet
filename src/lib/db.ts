import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface Clinic {
  id?: number;
  clinic_name: string;
  phone?: string;
  address?: string;
  currency: string;
}

export interface Client {
  id?: number;
  full_name: string;
  phone?: string;
  secondary_phone?: string;
  address?: string;
  notes?: string;
  is_active: number;
  created_at: string;
}

export interface Animal {
  id?: number;
  client_id: number;
  name: string;
  species: string;
  breed?: string;
  sex?: string;
  birth_date?: string;
  estimated_age?: string;
  color?: string;
  microchip_id?: string;
  identification_number?: string;
  allergies?: string;
  clinical_warnings?: string;
  notes?: string;
  photo?: string;
  status?: string;
  is_active: number;
  created_at: string;
}

export interface Appointment {
  id?: number;
  client_id: number;
  animal_id: number;
  appointment_date: string;
  reason: string;
  appointment_type: string;
  status: string;
  notes?: string;
  created_at: string;
}

export interface Visit {
  id?: number;
  client_id: number;
  animal_id: number;
  appointment_id?: number;
  visit_date: string;
  chief_complaint?: string;
  clinical_observations?: string;
  diagnosis?: string;
  treatment_plan?: string;
  notes?: string;
  follow_up_date?: string;
  created_at: string;
}

export interface Prescription {
  id?: number;
  animal_id: number;
  client_id: number;
  visit_id?: number;
  prescription_date: string;
  medication_name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  created_at: string;
}

export interface Vaccination {
  id?: number;
  animal_id: number;
  vaccine_name: string;
  date_administered: string;
  next_due_date?: string;
  batch_number?: string;
  notes?: string;
  created_at: string;
}

export interface WeightHistory {
  id?: number;
  animal_id: number;
  weight: number;
  weight_date: string;
  notes?: string;
}

export interface Product {
  id?: number;
  name: string;
  category?: string;
  sku?: string;
  internal_code?: string;
  selling_price: number;
  cost_price?: number;
  current_stock: number;
  minimum_stock: number;
  unit: string;
  is_active: number;
  created_at: string;
}

export interface ProductBatch {
  id?: number;
  product_id: number;
  batch_number: string;
  quantity: number;
  quantity_remaining: number;
  expiry_date?: string;
  purchase_cost?: number;
  supplier?: string;
  received_date: string;
  created_at: string;
}

export interface StockAdjustment {
  id?: number;
  product_id: number;
  batch_id?: number;
  adjustment_type: string;
  quantity: number;
  reason: string;
  created_at: string;
}

export interface Reminder {
  id?: number;
  type: string; // appointment, vaccination, followup, missed
  related_id?: number;
  animal_id?: number;
  client_id?: number;
  title: string;
  description?: string;
  due_date: string;
  status: string; // pending, completed, dismissed
  created_at: string;
}

export interface Invoice {
  id?: number;
  invoice_number: string;
  client_id: number;
  animal_id?: number;
  subtotal: number;
  discount: number;
  total: number;
  amount_paid: number;
  balance: number;
  status: string;
  notes?: string;
  created_at: string;
}

export interface InvoiceItem {
  id?: number;
  invoice_id: number;
  product_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface Payment {
  id?: number;
  invoice_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes?: string;
  created_at: string;
}

export class PpvetDB extends Dexie {
  clinic!: Table<Clinic>;
  clients!: Table<Client>;
  animals!: Table<Animal>;
  appointments!: Table<Appointment>;
  visits!: Table<Visit>;
  prescriptions!: Table<Prescription>;
  vaccinations!: Table<Vaccination>;
  weight_history!: Table<WeightHistory>;
  products!: Table<Product>;
  product_batches!: Table<ProductBatch>;
  stock_adjustments!: Table<StockAdjustment>;
  reminders!: Table<Reminder>;
  invoices!: Table<Invoice>;
  invoice_items!: Table<InvoiceItem>;
  payments!: Table<Payment>;

  constructor() {
    super('ppvet');
    this.version(3).stores({
      clinic: '++id',
      clients: '++id, full_name, phone, is_active',
      animals: '++id, client_id, is_active, name, microchip_id, identification_number',
      appointments: '++id, client_id, animal_id, appointment_date',
      visits: '++id, client_id, animal_id',
      prescriptions: '++id, animal_id, client_id',
      vaccinations: '++id, animal_id, next_due_date',
      weight_history: '++id, animal_id',
      products: '++id, name, sku, internal_code',
      product_batches: '++id, product_id, batch_number, expiry_date',
      stock_adjustments: '++id, product_id, batch_id',
      reminders: '++id, type, animal_id, due_date, status',
      invoices: '++id, client_id, invoice_number',
      invoice_items: '++id, invoice_id',
      payments: '++id, invoice_id'
    });
  }
}

export const db = new PpvetDB();

db.on('ready', async () => {
  const count = await db.clinic.count();
  if (count === 0) {
    await db.clinic.add({
      clinic_name: 'P&PVET Clinic',
      currency: 'DZD'
    });
  }
});
