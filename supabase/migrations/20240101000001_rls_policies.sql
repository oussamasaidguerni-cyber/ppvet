-- Row Level Security Policies

-- Enable RLS on all tables
ALTER TABLE clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
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

-- Clinic Settings Policies
CREATE POLICY "Users can view their own clinic settings" ON clinic_settings
  FOR SELECT USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can insert their own clinic settings" ON clinic_settings
  FOR INSERT WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Users can update their own clinic settings" ON clinic_settings
  FOR UPDATE USING (auth.uid() = owner_user_id);

CREATE POLICY "Users can delete their own clinic settings" ON clinic_settings
  FOR DELETE USING (auth.uid() = owner_user_id);

-- Helper function to get user's clinic
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
BEGIN
  RETURN (SELECT id FROM clinic_settings WHERE owner_user_id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clients Policies
CREATE POLICY "Users can view clients in their clinic" ON clients
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert clients in their clinic" ON clients
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update clients in their clinic" ON clients
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete clients in their clinic" ON clients
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Animals Policies
CREATE POLICY "Users can view animals in their clinic" ON animals
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert animals in their clinic" ON animals
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update animals in their clinic" ON animals
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete animals in their clinic" ON animals
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Appointments Policies
CREATE POLICY "Users can view appointments in their clinic" ON appointments
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert appointments in their clinic" ON appointments
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update appointments in their clinic" ON appointments
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete appointments in their clinic" ON appointments
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Visits Policies
CREATE POLICY "Users can view visits in their clinic" ON visits
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert visits in their clinic" ON visits
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update visits in their clinic" ON visits
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete visits in their clinic" ON visits
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Prescriptions Policies
CREATE POLICY "Users can view prescriptions in their clinic" ON prescriptions
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert prescriptions in their clinic" ON prescriptions
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update prescriptions in their clinic" ON prescriptions
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete prescriptions in their clinic" ON prescriptions
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Prescription Items Policies (via prescription)
CREATE POLICY "Users can view prescription items" ON prescription_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM prescriptions p 
      WHERE p.id = prescription_items.prescription_id 
      AND p.clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Users can insert prescription items" ON prescription_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM prescriptions p 
      WHERE p.id = prescription_items.prescription_id 
      AND p.clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Users can update prescription items" ON prescription_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM prescriptions p 
      WHERE p.id = prescription_items.prescription_id 
      AND p.clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Users can delete prescription items" ON prescription_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM prescriptions p 
      WHERE p.id = prescription_items.prescription_id 
      AND p.clinic_id = get_user_clinic_id()
    )
  );

-- Vaccinations Policies
CREATE POLICY "Users can view vaccinations in their clinic" ON vaccinations
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert vaccinations in their clinic" ON vaccinations
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update vaccinations in their clinic" ON vaccinations
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete vaccinations in their clinic" ON vaccinations
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Products Policies
CREATE POLICY "Users can view products in their clinic" ON products
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert products in their clinic" ON products
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update products in their clinic" ON products
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete products in their clinic" ON products
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Stock Movements Policies
CREATE POLICY "Users can view stock movements in their clinic" ON stock_movements
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert stock movements in their clinic" ON stock_movements
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update stock movements in their clinic" ON stock_movements
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete stock movements in their clinic" ON stock_movements
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Invoices Policies
CREATE POLICY "Users can view invoices in their clinic" ON invoices
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert invoices in their clinic" ON invoices
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update invoices in their clinic" ON invoices
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete invoices in their clinic" ON invoices
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Invoice Items Policies (via invoice)
CREATE POLICY "Users can view invoice items" ON invoice_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM invoices i 
      WHERE i.id = invoice_items.invoice_id 
      AND i.clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Users can insert invoice items" ON invoice_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM invoices i 
      WHERE i.id = invoice_items.invoice_id 
      AND i.clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Users can update invoice items" ON invoice_items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM invoices i 
      WHERE i.id = invoice_items.invoice_id 
      AND i.clinic_id = get_user_clinic_id()
    )
  );

CREATE POLICY "Users can delete invoice items" ON invoice_items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM invoices i 
      WHERE i.id = invoice_items.invoice_id 
      AND i.clinic_id = get_user_clinic_id()
    )
  );

-- Payments Policies
CREATE POLICY "Users can view payments in their clinic" ON payments
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert payments in their clinic" ON payments
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update payments in their clinic" ON payments
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete payments in their clinic" ON payments
  FOR DELETE USING (clinic_id = get_user_clinic_id());
