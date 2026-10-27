const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'ppvet.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

function initDB() {
  // Clinic settings
  db.exec(`
    CREATE TABLE IF NOT EXISTS clinic_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      clinic_name TEXT NOT NULL DEFAULT 'P&PVET Clinic',
      phone TEXT,
      address TEXT,
      currency TEXT NOT NULL DEFAULT 'DZD',
      timezone TEXT DEFAULT 'Africa/Algiers',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Clients
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      phone TEXT,
      secondary_phone TEXT,
      email TEXT,
      address TEXT,
      notes TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Animals
  db.exec(`
    CREATE TABLE IF NOT EXISTS animals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      breed TEXT,
      sex TEXT,
      birth_date TEXT,
      estimated_age TEXT,
      color TEXT,
      microchip_id TEXT,
      allergies TEXT,
      clinical_warnings TEXT,
      is_active INTEGER DEFAULT 1,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id)
    )
  `);

  // Appointments
  db.exec(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id INTEGER NOT NULL,
      animal_id INTEGER NOT NULL,
      appointment_date TEXT NOT NULL,
      duration_minutes INTEGER DEFAULT 30,
      appointment_type TEXT DEFAULT 'consultation',
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (animal_id) REFERENCES animals(id)
    )
  `);

  // Visits
  db.exec(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      appointment_id INTEGER,
      client_id INTEGER NOT NULL,
      animal_id INTEGER NOT NULL,
      visit_date TEXT DEFAULT CURRENT_TIMESTAMP,
      visit_type TEXT DEFAULT 'consultation',
      chief_complaint TEXT,
      clinical_observations TEXT,
      diagnosis TEXT,
      treatment_plan TEXT,
      notes TEXT,
      follow_up_date TEXT,
      weight REAL,
      temperature REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (appointment_id) REFERENCES appointments(id),
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (animal_id) REFERENCES animals(id)
    )
  `);

  // Prescriptions
  db.exec(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      visit_id INTEGER NOT NULL,
      medication_name TEXT NOT NULL,
      dosage TEXT,
      frequency TEXT,
      duration TEXT,
      instructions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (visit_id) REFERENCES visits(id)
    )
  `);

  // Vaccinations
  db.exec(`
    CREATE TABLE IF NOT EXISTS vaccinations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      animal_id INTEGER NOT NULL,
      visit_id INTEGER,
      vaccine_name TEXT NOT NULL,
      date_administered TEXT NOT NULL,
      next_due_date TEXT,
      batch_number TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (animal_id) REFERENCES animals(id),
      FOREIGN KEY (visit_id) REFERENCES visits(id)
    )
  `);

  // Products
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT,
      selling_price INTEGER NOT NULL DEFAULT 0,
      cost_price INTEGER DEFAULT 0,
      current_stock INTEGER NOT NULL DEFAULT 0,
      minimum_stock INTEGER DEFAULT 0,
      unit TEXT DEFAULT 'piece',
      is_active INTEGER DEFAULT 1,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Stock movements
  db.exec(`
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      movement_type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      reason TEXT,
      invoice_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Invoices
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT UNIQUE NOT NULL,
      client_id INTEGER NOT NULL,
      animal_id INTEGER,
      visit_id INTEGER,
      issue_date TEXT DEFAULT CURRENT_DATE,
      due_date TEXT,
      subtotal INTEGER NOT NULL DEFAULT 0,
      discount INTEGER DEFAULT 0,
      total INTEGER NOT NULL DEFAULT 0,
      amount_paid INTEGER DEFAULT 0,
      balance INTEGER NOT NULL DEFAULT 0,
      status TEXT DEFAULT 'unpaid',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES clients(id),
      FOREIGN KEY (animal_id) REFERENCES animals(id),
      FOREIGN KEY (visit_id) REFERENCES visits(id)
    )
  `);

  // Invoice items
  db.exec(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      product_id INTEGER,
      description TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price INTEGER NOT NULL,
      line_total INTEGER NOT NULL,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id),
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);

  // Payments
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      amount INTEGER NOT NULL,
      payment_date TEXT DEFAULT CURRENT_DATE,
      payment_method TEXT DEFAULT 'cash',
      reference_number TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id)
    )
  `);

  // Initialize clinic if not exists
  const clinic = db.prepare('SELECT * FROM clinic_settings WHERE id = 1').get();
  if (!clinic) {
    db.prepare(`INSERT INTO clinic_settings (id, clinic_name) VALUES (1, 'P&PVET Clinic')`).run();
    console.log('Clinic initialized');
  }

  console.log('Database initialized at:', dbPath);
}

initDB();

module.exports = db;
