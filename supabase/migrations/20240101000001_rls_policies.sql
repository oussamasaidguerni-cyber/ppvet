-- Row Level Security Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles - users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Clinic Settings - authenticated users can view and update
CREATE POLICY "Authenticated users can view clinic settings" ON clinic_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update clinic settings" ON clinic_settings
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert clinic settings" ON clinic_settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- All other tables - authenticated users can manage
CREATE POLICY "Authenticated users full access to clients" ON clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to animals" ON animals
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to weight_history" ON weight_history
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to appointments" ON appointments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to visits" ON visits
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to prescriptions" ON prescriptions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to prescription_items" ON prescription_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to vaccinations" ON vaccinations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to products" ON products
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to stock_movements" ON stock_movements
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to invoices" ON invoices
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to invoice_items" ON invoice_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access to payments" ON payments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can view audit logs" ON audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
