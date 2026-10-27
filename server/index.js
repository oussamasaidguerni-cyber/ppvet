const express = require('express');
const cors = require('cors');
const db = require('./db');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Clinic
app.get('/api/clinic', (req, res) => {
  try {
    const clinic = db.prepare('SELECT * FROM clinic_settings WHERE id = 1').get();
    res.json(clinic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clinic', (req, res) => {
  try {
    const { clinic_name, phone, address, currency } = req.body;
    db.prepare(`UPDATE clinic_settings SET clinic_name = ?, phone = ?, address = ?, currency = COALESCE(?, currency), updated_at = CURRENT_TIMESTAMP WHERE id = 1`)
      .run(clinic_name, phone || null, address || null, currency || 'DZD');
    const clinic = db.prepare('SELECT * FROM clinic_settings WHERE id = 1').get();
    res.json(clinic);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard stats
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const clients = db.prepare('SELECT COUNT(*) as count FROM clients WHERE is_active = 1').get();
    const animals = db.prepare('SELECT COUNT(*) as count FROM animals WHERE is_active = 1').get();
    const today = new Date().toISOString().split('T')[0];
    const todayAppts = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE date(appointment_date) = ?").get(today);
    const upcoming = db.prepare("SELECT COUNT(*) as count FROM appointments WHERE date(appointment_date) > ? AND status != 'cancelled'").get(today);
    const outstanding = db.prepare("SELECT COALESCE(SUM(balance), 0) as total FROM invoices WHERE status IN ('unpaid', 'partially_paid')").get();
    const lowStock = db.prepare('SELECT COUNT(*) as count FROM products WHERE is_active = 1 AND current_stock <= minimum_stock').get();
    
    res.json({
      clients: clients.count,
      animals: animals.count,
      todayAppointments: todayAppts.count,
      upcomingAppointments: upcoming.count,
      outstandingBalance: outstanding.total,
      lowStock: lowStock.count
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clients
app.get('/api/clients', (req, res) => {
  try {
    const { search } = req.query;
    let query = 'SELECT * FROM clients WHERE is_active = 1';
    let params = [];
    if (search) {
      query += ' AND (full_name LIKE ? OR phone LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY created_at DESC';
    const clients = db.prepare(query).all(...params);
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/clients/:id', (req, res) => {
  try {
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    if (!client) return res.status(404).json({ error: 'Client not found' });
    const animals = db.prepare('SELECT * FROM animals WHERE client_id = ? AND is_active = 1').all(req.params.id);
    res.json({ ...client, animals });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', (req, res) => {
  try {
    const { full_name, phone, secondary_phone, address, notes } = req.body;
    if (!full_name) return res.status(400).json({ error: 'Name required' });
    const result = db.prepare('INSERT INTO clients (full_name, phone, secondary_phone, address, notes) VALUES (?, ?, ?, ?, ?)')
      .run(full_name, phone || null, secondary_phone || null, address || null, notes || null);
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(result.lastInsertRowid);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/clients/:id', (req, res) => {
  try {
    const { full_name, phone, secondary_phone, address, notes } = req.body;
    db.prepare('UPDATE clients SET full_name = ?, phone = ?, secondary_phone = ?, address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(full_name, phone || null, secondary_phone || null, address || null, notes || null, req.params.id);
    const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Animals
app.get('/api/animals/:id', (req, res) => {
  try {
    const animal = db.prepare('SELECT a.*, c.full_name as owner_name, c.phone as owner_phone FROM animals a JOIN clients c ON c.id = a.client_id WHERE a.id = ?').get(req.params.id);
    if (!animal) return res.status(404).json({ error: 'Animal not found' });
    const visits = db.prepare('SELECT * FROM visits WHERE animal_id = ? ORDER BY visit_date DESC').all(req.params.id);
    const appointments = db.prepare('SELECT * FROM appointments WHERE animal_id = ? ORDER BY appointment_date DESC').all(req.params.id);
    const vaccinations = db.prepare('SELECT * FROM vaccinations WHERE animal_id = ? ORDER BY date_administered DESC').all(req.params.id);
    res.json({ ...animal, visits, appointments, vaccinations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/animals', (req, res) => {
  try {
    const { client_id, name, species, breed, sex, birth_date, estimated_age, color, microchip_id, allergies, clinical_warnings, notes } = req.body;
    if (!client_id || !name || !species) return res.status(400).json({ error: 'Missing required fields' });
    const result = db.prepare('INSERT INTO animals (client_id, name, species, breed, sex, birth_date, estimated_age, color, microchip_id, allergies, clinical_warnings, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(client_id, name, species, breed || null, sex || null, birth_date || null, estimated_age || null, color || null, microchip_id || null, allergies || null, clinical_warnings || null, notes || null);
    const animal = db.prepare('SELECT * FROM animals WHERE id = ?').get(result.lastInsertRowid);
    res.json(animal);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Appointments
app.get('/api/appointments', (req, res) => {
  try {
    const appointments = db.prepare(`
      SELECT a.*, c.full_name as client_name, an.name as animal_name 
      FROM appointments a 
      JOIN clients c ON c.id = a.client_id 
      JOIN animals an ON an.id = a.animal_id 
      ORDER BY a.appointment_date DESC
    `).all();
    res.json(appointments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/appointments', (req, res) => {
  try {
    const { client_id, animal_id, appointment_date, reason, appointment_type, notes } = req.body;
    if (!client_id || !animal_id || !appointment_date || !reason) return res.status(400).json({ error: 'Missing required fields' });
    const result = db.prepare('INSERT INTO appointments (client_id, animal_id, appointment_date, reason, appointment_type, notes) VALUES (?, ?, ?, ?, ?, ?)')
      .run(client_id, animal_id, appointment_date, reason, appointment_type || 'consultation', notes || null);
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(result.lastInsertRowid);
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/appointments/:id', (req, res) => {
  try {
    const { status, appointment_date, notes } = req.body;
    db.prepare('UPDATE appointments SET status = COALESCE(?, status), appointment_date = COALESCE(?, appointment_date), notes = COALESCE(?, notes), updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(status || null, appointment_date || null, notes || null, req.params.id);
    const appointment = db.prepare('SELECT * FROM appointments WHERE id = ?').get(req.params.id);
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Visits
app.post('/api/visits', (req, res) => {
  try {
    const { appointment_id, client_id, animal_id, visit_date, visit_type, chief_complaint, clinical_observations, diagnosis, treatment_plan, notes, follow_up_date, weight, temperature } = req.body;
    if (!client_id || !animal_id) return res.status(400).json({ error: 'Missing required fields' });
    const result = db.prepare('INSERT INTO visits (appointment_id, client_id, animal_id, visit_date, visit_type, chief_complaint, clinical_observations, diagnosis, treatment_plan, notes, follow_up_date, weight, temperature) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
      .run(appointment_id || null, client_id, animal_id, visit_date || new Date().toISOString(), visit_type || 'consultation', chief_complaint || null, clinical_observations || null, diagnosis || null, treatment_plan || null, notes || null, follow_up_date || null, weight || null, temperature || null);
    if (appointment_id) {
      db.prepare("UPDATE appointments SET status = 'completed' WHERE id = ?").run(appointment_id);
    }
    const visit = db.prepare('SELECT * FROM visits WHERE id = ?').get(result.lastInsertRowid);
    res.json(visit);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Products
app.get('/api/products', (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products WHERE is_active = 1 ORDER BY name').all();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/products', (req, res) => {
  try {
    const { name, category, selling_price, cost_price, current_stock, minimum_stock, unit } = req.body;
    if (!name) return res.status(400).json({ error: 'Name required' });
    const result = db.prepare('INSERT INTO products (name, category, selling_price, cost_price, current_stock, minimum_stock, unit) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(name, category || null, selling_price || 0, cost_price || 0, current_stock || 0, minimum_stock || 0, unit || 'piece');
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(result.lastInsertRowid);
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Invoices
app.get('/api/invoices', (req, res) => {
  try {
    const invoices = db.prepare(`
      SELECT i.*, c.full_name as client_name 
      FROM invoices i 
      JOIN clients c ON c.id = i.client_id 
      ORDER BY i.created_at DESC
    `).all();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/invoices', (req, res) => {
  const transaction = db.transaction((invoiceData) => {
    const { client_id, animal_id, items, discount, notes } = invoiceData;
    if (!client_id || !items || items.length === 0) throw new Error('Invalid invoice data');
    
    let subtotal = 0;
    items.forEach(item => {
      subtotal += item.quantity * item.unit_price;
    });
    const total = subtotal - (discount || 0);
    const invoice_number = `INV-${Date.now()}`;
    
    const result = db.prepare('INSERT INTO invoices (invoice_number, client_id, animal_id, subtotal, discount, total, balance, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(invoice_number, client_id, animal_id || null, subtotal, discount || 0, total, total, notes || null);
    
    const invoiceId = result.lastInsertRowid;
    
    items.forEach(item => {
      const lineTotal = item.quantity * item.unit_price;
      db.prepare('INSERT INTO invoice_items (invoice_id, product_id, description, quantity, unit_price, line_total) VALUES (?, ?, ?, ?, ?, ?)')
        .run(invoiceId, item.product_id || null, item.description, item.quantity, item.unit_price, lineTotal);
      
      if (item.product_id) {
        db.prepare('UPDATE products SET current_stock = current_stock - ? WHERE id = ?').run(item.quantity, item.product_id);
        db.prepare('INSERT INTO stock_movements (product_id, movement_type, quantity, reason, invoice_id) VALUES (?, ?, ?, ?, ?)')
          .run(item.product_id, 'sale', -item.quantity, `Invoice ${invoice_number}`, invoiceId);
      }
    });
    
    return db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoiceId);
  });
  
  try {
    const invoice = transaction(req.body);
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/payments', (req, res) => {
  const transaction = db.transaction((paymentData) => {
    const { invoice_id, amount, payment_method, notes } = paymentData;
    if (!invoice_id || !amount) throw new Error('Invalid payment data');
    
    db.prepare('INSERT INTO payments (invoice_id, amount, payment_method, notes) VALUES (?, ?, ?, ?)')
      .run(invoice_id, amount, payment_method || 'cash', notes || null);
    
    const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoice_id);
    const newPaid = invoice.amount_paid + amount;
    const newBalance = invoice.total - newPaid;
    const status = newBalance <= 0 ? 'paid' : 'partially_paid';
    
    db.prepare('UPDATE invoices SET amount_paid = ?, balance = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(newPaid, newBalance, status, invoice_id);
    
    return db.prepare('SELECT * FROM invoices WHERE id = ?').get(invoice_id);
  });
  
  try {
    const invoice = transaction(req.body);
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Backup
app.get('/api/backup', (req, res) => {
  try {
    const backup = {
      clinic: db.prepare('SELECT * FROM clinic_settings').all(),
      clients: db.prepare('SELECT * FROM clients').all(),
      animals: db.prepare('SELECT * FROM animals').all(),
      appointments: db.prepare('SELECT * FROM appointments').all(),
      visits: db.prepare('SELECT * FROM visits').all(),
      products: db.prepare('SELECT * FROM products').all(),
      invoices: db.prepare('SELECT * FROM invoices').all(),
      invoice_items: db.prepare('SELECT * FROM invoice_items').all(),
      payments: db.prepare('SELECT * FROM payments').all(),
      timestamp: new Date().toISOString()
    };
    res.json(backup);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`P&PVET API running on http://localhost:${PORT}`);
  console.log('Database:', path.join(__dirname, '..', 'data', 'ppvet.db'));
});
