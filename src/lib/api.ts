import { db } from './db';

export const api = {
  getClinic: async () => {
    const clinic = await db.clinic.toCollection().first();
    return clinic || { clinic_name: 'P&PVET Clinic', currency: 'DZD' };
  },
  updateClinic: async (data: any) => {
    const clinic = await db.clinic.toCollection().first();
    if (clinic?.id) {
      await db.clinic.update(clinic.id, data);
    } else {
      await db.clinic.add({ ...data, currency: data.currency || 'DZD' });
    }
    return api.getClinic();
  },
  getDashboardStats: async () => {
    const clients = await db.clients.count();
    const animals = await db.animals.count();
    const today = new Date().toISOString().split('T')[0];
    const allAppts = await db.appointments.toArray();
    const todayAppointments = allAppts.filter(a => a.appointment_date.startsWith(today)).length;
    const upcomingAppointments = allAppts.filter(a => a.appointment_date > new Date().toISOString() && a.status !== 'cancelled').length;
    const invoices = await db.invoices.toArray();
    const outstandingBalance = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.balance, 0);
    const products = await db.products.toArray();
    const lowStock = products.filter(p => p.current_stock <= p.minimum_stock).length;
    return { clients, animals, todayAppointments, upcomingAppointments, outstandingBalance, lowStock };
  },
  getClients: async (search?: string) => {
    let clients = await db.clients.toArray();
    if (search) {
      const s = search.toLowerCase();
      clients = clients.filter(c => c.full_name.toLowerCase().includes(s) || (c.phone && c.phone.includes(search)));
    }
    return clients.sort((a, b) => b.id! - a.id!);
  },
  getClient: async (id: number) => {
    const client = await db.clients.get(id);
    const animals = await db.animals.where('client_id').equals(id).toArray();
    return { ...client, animals };
  },
  createClient: async (data: any) => {
    const id = await db.clients.add({ ...data, created_at: new Date().toISOString() });
    return db.clients.get(id);
  },
  updateClient: async (id: number, data: any) => {
    await db.clients.update(id, data);
    return db.clients.get(id);
  },
  getAnimal: async (id: number) => {
    const animal = await db.animals.get(id);
    const client = await db.clients.get(animal!.client_id);
    const visits = await db.visits.where('animal_id').equals(id).toArray();
    const appointments = await db.appointments.where('animal_id').equals(id).toArray();
    return { ...animal, owner_name: client?.full_name, owner_phone: client?.phone, visits: visits.sort((a,b) => b.id! - a.id!), appointments: appointments.sort((a,b) => b.id! - a.id!) };
  },
  createAnimal: async (data: any) => {
    const id = await db.animals.add({ ...data, created_at: new Date().toISOString() });
    return db.animals.get(id);
  },
  getAppointments: async () => {
    const appointments = await db.appointments.toArray();
    const clients = await db.clients.toArray();
    const animals = await db.animals.toArray();
    return appointments.map(a => ({
      ...a,
      client_name: clients.find(c => c.id === a.client_id)?.full_name,
      animal_name: animals.find(an => an.id === a.animal_id)?.name
    })).sort((a,b) => b.id! - a.id!);
  },
  createAppointment: async (data: any) => {
    const id = await db.appointments.add({ ...data, status: 'scheduled', created_at: new Date().toISOString() });
    return db.appointments.get(id);
  },
  updateAppointment: async (id: number, data: any) => {
    await db.appointments.update(id, data);
    return db.appointments.get(id);
  },
  createVisit: async (data: any) => {
    const id = await db.visits.add({ ...data, created_at: new Date().toISOString() });
    if (data.appointment_id) {
      await db.appointments.update(data.appointment_id, { status: 'completed' });
    }
    return db.visits.get(id);
  },
  getProducts: async () => {
    return db.products.toArray();
  },
  createProduct: async (data: any) => {
    const id = await db.products.add({ ...data, created_at: new Date().toISOString() });
    return db.products.get(id);
  },
  getInvoices: async () => {
    const invoices = await db.invoices.toArray();
    const clients = await db.clients.toArray();
    return invoices.map(i => ({
      ...i,
      client_name: clients.find(c => c.id === i.client_id)?.full_name
    })).sort((a,b) => b.id! - a.id!);
  },
  createInvoice: async (data: any) => {
    const invoice_number = `INV-${Date.now()}`;
    let subtotal = 0;
    data.items.forEach((item: any) => {
      subtotal += item.quantity * item.unit_price;
    });
    const total = subtotal - (data.discount || 0);
    const invoiceId = await db.invoices.add({
      invoice_number,
      client_id: data.client_id,
      animal_id: data.animal_id,
      subtotal,
      discount: data.discount || 0,
      total,
      amount_paid: 0,
      balance: total,
      status: 'unpaid',
      notes: data.notes,
      created_at: new Date().toISOString()
    });
    for (const item of data.items) {
      await db.invoice_items.add({
        invoice_id: invoiceId,
        product_id: item.product_id || null,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.quantity * item.unit_price
      });
      if (item.product_id) {
        const prod = await db.products.get(item.product_id);
        if (prod) {
          await db.products.update(item.product_id, { current_stock: prod.current_stock - item.quantity });
        }
      }
    }
    return db.invoices.get(invoiceId);
  },
  createPayment: async (data: any) => {
    await db.payments.add({
      invoice_id: data.invoice_id,
      amount: data.amount,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: data.payment_method || 'cash',
      notes: data.notes
    });
    const invoice = await db.invoices.get(data.invoice_id);
    if (invoice) {
      const newPaid = invoice.amount_paid + data.amount;
      const newBalance = invoice.total - newPaid;
      const status = newBalance <= 0 ? 'paid' : 'partially_paid';
      await db.invoices.update(data.invoice_id, { amount_paid: newPaid, balance: newBalance, status });
    }
    return db.invoices.get(data.invoice_id);
  },
  getBackup: async () => {
    return {
      clinic: await db.clinic.toArray(),
      clients: await db.clients.toArray(),
      animals: await db.animals.toArray(),
      appointments: await db.appointments.toArray(),
      visits: await db.visits.toArray(),
      products: await db.products.toArray(),
      invoices: await db.invoices.toArray(),
      invoice_items: await db.invoice_items.toArray(),
      payments: await db.payments.toArray(),
      timestamp: new Date().toISOString()
    };
  }
};
