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
    const clients = await db.clients.where('is_active').equals(1).count();
    const animals = await db.animals.where('is_active').equals(1).count();
    const today = new Date().toISOString().split('T')[0];
    const allAppts = await db.appointments.toArray();
    const todayAppointments = allAppts.filter(a => a.appointment_date.startsWith(today)).length;
    const upcomingAppointments = allAppts.filter(a => a.appointment_date >= new Date().toISOString() && a.status !== 'cancelled' && a.status !== 'completed').length;
    const invoices = await db.invoices.toArray();
    const outstandingBalance = invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + (i.balance || 0), 0);
    const products = await db.products.toArray();
    const lowStock = products.filter(p => p.current_stock <= p.minimum_stock).length;
    
    // Income
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    const payments = await db.payments.toArray();
    const monthlyIncome = payments.filter(p => p.payment_date >= startOfMonth).reduce((sum, p) => sum + p.amount, 0);
    const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // Reminders
    const vaccinations = await db.vaccinations.toArray();
    const todayDate = new Date().toISOString().split('T')[0];
    const in30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const vaccinesDue = vaccinations.filter(v => v.next_due_date && v.next_due_date >= todayDate && v.next_due_date <= in30Days).length;
    const invoicesOverdue = invoices.filter(i => i.status !== 'paid').length;
    
    return { clients, animals, todayAppointments, upcomingAppointments, outstandingBalance, lowStock, monthlyIncome, totalIncome, vaccinesDue, invoicesOverdue };
  },
  getClients: async (search?: string) => {
    let clients = await db.clients.where('is_active').equals(1).toArray();
    if (search) {
      const s = search.toLowerCase();
      clients = clients.filter(c => c.full_name.toLowerCase().includes(s) || (c.phone && c.phone.includes(search)));
    }
    return clients.sort((a, b) => (b.id || 0) - (a.id || 0));
  },
  getClient: async (id: number) => {
    const client = await db.clients.get(id);
    const animals = await db.animals.where('client_id').equals(id).and(a => a.is_active === 1).toArray();
    const invoices = await db.invoices.where('client_id').equals(id).toArray();
    const appointments = await db.appointments.where('client_id').equals(id).toArray();
    return { ...client, animals, invoices: invoices.sort((a,b) => (b.id||0)-(a.id||0)), appointments: appointments.sort((a,b) => (b.id||0)-(a.id||0)) };
  },
  createClient: async (data: any) => {
    const id = await db.clients.add({ ...data, is_active: 1, created_at: new Date().toISOString() });
    return db.clients.get(id);
  },
  updateClient: async (id: number, data: any) => {
    await db.clients.update(id, data);
    return db.clients.get(id);
  },
  deleteClient: async (id: number) => {
    await db.clients.update(id, { is_active: 0 });
  },
  permanentDeleteClient: async (id: number) => {
    await db.clients.delete(id);
  },
  getAnimal: async (id: number) => {
    const animal = await db.animals.get(id);
    const client = await db.clients.get(animal!.client_id);
    const visits = await db.visits.where('animal_id').equals(id).toArray();
    const appointments = await db.appointments.where('animal_id').equals(id).toArray();
    const vaccinations = await db.vaccinations.where('animal_id').equals(id).toArray();
    const prescriptions = await db.prescriptions.where('animal_id').equals(id).toArray();
    const weightHistory = await db.weight_history.where('animal_id').equals(id).toArray();
    return { 
      ...animal, 
      owner_name: client?.full_name, 
      owner_phone: client?.phone,
      visits: visits.sort((a,b) => (b.id||0)-(a.id||0)), 
      appointments: appointments.sort((a,b) => (b.id||0)-(a.id||0)),
      vaccinations: vaccinations.sort((a,b) => b.date_administered.localeCompare(a.date_administered)),
      prescriptions: prescriptions.sort((a,b) => (b.id||0)-(a.id||0)),
      weightHistory: weightHistory.sort((a,b) => b.weight_date.localeCompare(a.weight_date))
    };
  },
  createAnimal: async (data: any) => {
    const id = await db.animals.add({ ...data, is_active: 1, created_at: new Date().toISOString() });
    return db.animals.get(id);
  },
  updateAnimal: async (id: number, data: any) => {
    await db.animals.update(id, data);
    return db.animals.get(id);
  },
  deleteAnimal: async (id: number) => {
    await db.animals.update(id, { is_active: 0 });
  },
  getAppointments: async () => {
    const appointments = await db.appointments.toArray();
    const clients = await db.clients.toArray();
    const animals = await db.animals.toArray();
    return appointments.map(a => ({
      ...a,
      client_name: clients.find(c => c.id === a.client_id)?.full_name,
      animal_name: animals.find(an => an.id === a.animal_id)?.name
    })).sort((a,b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
  },
  createAppointment: async (data: any) => {
    const id = await db.appointments.add({ ...data, status: 'scheduled', created_at: new Date().toISOString() });
    return db.appointments.get(id);
  },
  updateAppointment: async (id: number, data: any) => {
    await db.appointments.update(id, data);
    return db.appointments.get(id);
  },
  deleteAppointment: async (id: number) => {
    await db.appointments.delete(id);
  },
  createVisit: async (data: any) => {
    const id = await db.visits.add({ ...data, created_at: new Date().toISOString() });
    if (data.appointment_id) {
      await db.appointments.update(data.appointment_id, { status: 'completed' });
    }
    return db.visits.get(id);
  },
  createPrescription: async (data: any) => {
    const id = await db.prescriptions.add({ ...data, created_at: new Date().toISOString() });
    return db.prescriptions.get(id);
  },
  createVaccination: async (data: any) => {
    const id = await db.vaccinations.add({ ...data, created_at: new Date().toISOString() });
    return db.vaccinations.get(id);
  },
  addWeight: async (data: any) => {
    const id = await db.weight_history.add(data);
    return db.weight_history.get(id);
  },
  getProducts: async () => {
    return db.products.toArray();
  },
  createProduct: async (data: any) => {
    const id = await db.products.add({ ...data, created_at: new Date().toISOString() });
    return db.products.get(id);
  },
  updateProduct: async (id: number, data: any) => {
    await db.products.update(id, data);
    return db.products.get(id);
  },
  adjustStock: async (data: any) => {
    const product = await db.products.get(data.product_id);
    if (product) {
      const newStock = data.adjustment_type === 'add' ? product.current_stock + data.quantity : product.current_stock - data.quantity;
      await db.products.update(data.product_id, { current_stock: newStock });
      await db.stock_adjustments.add({ ...data, created_at: new Date().toISOString() });
    }
  },
  getInvoices: async () => {
    const invoices = await db.invoices.toArray();
    const clients = await db.clients.toArray();
    return invoices.map(i => ({
      ...i,
      client_name: clients.find(c => c.id === i.client_id)?.full_name
    })).sort((a,b) => (b.id||0)-(a.id||0));
  },
  createInvoice: async (data: any) => {
    const invoice_number = `INV-${Date.now()}`;
    let subtotal = 0;
    data.items.forEach((item: any) => {
      subtotal += Number(item.quantity) * Number(item.unit_price);
    });
    const total = subtotal - Number(data.discount || 0);
    const invoiceId = await db.invoices.add({
      invoice_number,
      client_id: data.client_id,
      animal_id: data.animal_id,
      subtotal,
      discount: Number(data.discount || 0),
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
        quantity: Number(item.quantity),
        unit_price: Number(item.unit_price),
        line_total: Number(item.quantity) * Number(item.unit_price)
      });
      if (item.product_id) {
        const prod = await db.products.get(item.product_id);
        if (prod) {
          await db.products.update(item.product_id, { current_stock: prod.current_stock - Number(item.quantity) });
        }
      }
    }
    return db.invoices.get(invoiceId);
  },
  createPayment: async (data: any) => {
    await db.payments.add({
      invoice_id: data.invoice_id,
      amount: Number(data.amount),
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: data.payment_method || 'cash',
      notes: data.notes,
      created_at: new Date().toISOString()
    });
    const invoice = await db.invoices.get(data.invoice_id);
    if (invoice) {
      const newPaid = invoice.amount_paid + Number(data.amount);
      const newBalance = invoice.total - newPaid;
      const status = newBalance <= 0 ? 'paid' : 'partially_paid';
      await db.invoices.update(data.invoice_id, { amount_paid: newPaid, balance: newBalance, status });
    }
    return db.invoices.get(data.invoice_id);
  },
  deleteInvoice: async (id: number) => {
    await db.transaction('rw', [db.invoices, db.invoice_items, db.payments], async () => {
      await db.invoice_items.where('invoice_id').equals(id).delete();
      await db.payments.where('invoice_id').equals(id).delete();
      await db.invoices.delete(id);
    });
  },
  getInvoiceDetails: async (id: number) => {
    const invoice = await db.invoices.get(id);
    const client = await db.clients.get(invoice!.client_id);
    const items = await db.invoice_items.where('invoice_id').equals(id).toArray();
    const payments = await db.payments.where('invoice_id').equals(id).toArray();
    const clinic = await db.clinic.toCollection().first();
    return { invoice, client, items, payments, clinic };
  },
  getBackup: async () => {
    return {
      clinic: await db.clinic.toArray(),
      clients: await db.clients.toArray(),
      animals: await db.animals.toArray(),
      appointments: await db.appointments.toArray(),
      visits: await db.visits.toArray(),
      prescriptions: await db.prescriptions.toArray(),
      vaccinations: await db.vaccinations.toArray(),
      weight_history: await db.weight_history.toArray(),
      products: await db.products.toArray(),
      stock_adjustments: await db.stock_adjustments.toArray(),
      invoices: await db.invoices.toArray(),
      invoice_items: await db.invoice_items.toArray(),
      payments: await db.payments.toArray(),
      timestamp: new Date().toISOString()
    };
  },
  restoreBackup: async (data: any) => {
    await db.transaction('rw', [db.clients, db.animals, db.appointments, db.visits, db.prescriptions, db.vaccinations, db.weight_history, db.products, db.invoices, db.invoice_items, db.payments], async () => {
      if (data.clients) await db.clients.clear();
      if (data.animals) await db.animals.clear();
      if (data.appointments) await db.appointments.clear();
      if (data.visits) await db.visits.clear();
      if (data.prescriptions) await db.prescriptions.clear();
      if (data.vaccinations) await db.vaccinations.clear();
      if (data.weight_history) await db.weight_history.clear();
      if (data.products) await db.products.clear();
      if (data.invoices) await db.invoices.clear();
      if (data.invoice_items) await db.invoice_items.clear();
      if (data.payments) await db.payments.clear();
      
      if (data.clients) await db.clients.bulkAdd(data.clients);
      if (data.animals) await db.animals.bulkAdd(data.animals);
      if (data.appointments) await db.appointments.bulkAdd(data.appointments);
      if (data.visits) await db.visits.bulkAdd(data.visits);
      if (data.prescriptions) await db.prescriptions.bulkAdd(data.prescriptions);
      if (data.vaccinations) await db.vaccinations.bulkAdd(data.vaccinations);
      if (data.weight_history) await db.weight_history.bulkAdd(data.weight_history);
      if (data.products) await db.products.bulkAdd(data.products);
      if (data.invoices) await db.invoices.bulkAdd(data.invoices);
      if (data.invoice_items) await db.invoice_items.bulkAdd(data.invoice_items);
      if (data.payments) await db.payments.bulkAdd(data.payments);
    });
  }
};
