import { db } from './db';

export async function globalSearch(query: string) {
  if (!query || query.trim().length < 2) return [];
  
  const q = query.toLowerCase().trim();
  const results: any[] = [];
  
  // Clients
  const clients = await db.clients.where('is_active').equals(1).toArray();
  clients.forEach(c => {
    if (c.full_name.toLowerCase().includes(q) || (c.phone && c.phone.includes(query))) {
      results.push({ type: 'client', id: c.id, title: c.full_name, subtitle: c.phone || '', link: `/clients/${c.id}` });
    }
  });
  
  // Animals
  const animals = await db.animals.where('is_active').equals(1).toArray();
  for (const a of animals) {
    if (a.name.toLowerCase().includes(q) || a.species.toLowerCase().includes(q) || 
        (a.breed && a.breed.toLowerCase().includes(q)) ||
        (a.microchip_id && a.microchip_id.includes(query)) ||
        (a.identification_number && a.identification_number.includes(query))) {
      const client = await db.clients.get(a.client_id);
      results.push({ type: 'animal', id: a.id, title: a.name, subtitle: `${a.species} - ${client?.full_name || ''}`, link: `/animals/${a.id}` });
    }
  }
  
  // Invoices
  const invoices = await db.invoices.toArray();
  invoices.forEach(inv => {
    if (inv.invoice_number.toLowerCase().includes(q)) {
      const client = clients.find(c => c.id === inv.client_id);
      results.push({ type: 'invoice', id: inv.id, title: inv.invoice_number, subtitle: `${client?.full_name || ''} - ${inv.total} DZD`, link: `/billing/print/${inv.id}` });
    }
  });
  
  // Products
  const products = await db.products.toArray();
  products.forEach(p => {
    if (p.name.toLowerCase().includes(q) || (p.sku && p.sku.toLowerCase().includes(q)) || (p.internal_code && p.internal_code.toLowerCase().includes(q))) {
      results.push({ type: 'product', id: p.id, title: p.name, subtitle: `${p.selling_price} DZD - Stock: ${p.current_stock}`, link: `/inventory` });
    }
  });
  
  // Appointments
  const appointments = await db.appointments.toArray();
  for (const appt of appointments) {
    const animal = await db.animals.get(appt.animal_id);
    const client = await db.clients.get(appt.client_id);
    if ((animal && animal.name.toLowerCase().includes(q)) || (client && client.full_name.toLowerCase().includes(q))) {
      results.push({ type: 'appointment', id: appt.id, title: `${animal?.name} - ${client?.full_name}`, subtitle: appt.appointment_date.split('T')[0], link: `/appointments` });
    }
  }
  
  return results.slice(0, 20);
}
