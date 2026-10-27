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
  allergies?: string;
  clinical_warnings?: string;
  notes?: string;
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

export interface Product {
  id?: number;
  name: string;
  category?: string;
  selling_price: number;
  cost_price: number;
  current_stock: number;
  minimum_stock: number;
  unit: string;
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
}

export class PpvetDB extends Dexie {
  clinic!: Table<Clinic>;
  clients!: Table<Client>;
  animals!: Table<Animal>;
  appointments!: Table<Appointment>;
  visits!: Table<Visit>;
  products!: Table<Product>;
  invoices!: Table<Invoice>;
  invoice_items!: Table<InvoiceItem>;
  payments!: Table<Payment>;

  constructor() {
    super('ppvet');
    this.version(1).stores({
      clinic: '++id',
      clients: '++id, full_name, phone',
      animals: '++id, client_id',
      appointments: '++id, client_id, animal_id, appointment_date',
      visits: '++id, client_id, animal_id',
      products: '++id, name',
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
