-- Enable RLS on all tables
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE animals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vaccinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper function to get user's clinic
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT clinic_id 
    FROM clinic_users 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Clinics policies
CREATE POLICY "Users can view their own clinic" ON clinics
  FOR SELECT USING (id = get_user_clinic_id());

CREATE POLICY "Users can update their own clinic" ON clinics
  FOR UPDATE USING (id = get_user_clinic_id());

CREATE POLICY "Users can insert their own clinic" ON clinics
  FOR INSERT WITH CHECK (true);

-- Clinic users policies
CREATE POLICY "Users can view their clinic membership" ON clinic_users
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own membership" ON clinic_users
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Clients policies
CREATE POLICY "Users can view clinic clients" ON clients
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert clinic clients" ON clients
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update clinic clients" ON clients
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete clinic clients" ON clients
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Animals policies
CREATE POLICY "Users can view clinic animals" ON animals
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert clinic animals" ON animals
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update clinic animals" ON animals
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete clinic animals" ON animals
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Appointments policies
CREATE POLICY "Users can view clinic appointments" ON appointments
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert clinic appointments" ON appointments
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update clinic appointments" ON appointments
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete clinic appointments" ON appointments
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Visits policies
CREATE POLICY "Users can view clinic visits" ON visits
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert clinic visits" ON visits
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update clinic visits" ON visits
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete clinic visits" ON visits
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Prescriptions policies
CREATE POLICY "Users can view clinic prescriptions" ON prescriptions
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert clinic prescriptions" ON prescriptions
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update clinic prescriptions" ON prescriptions
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete clinic prescriptions" ON prescriptions
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Vaccinations policies
CREATE POLICY "Users can view clinic vaccinations" ON vaccinations
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert clinic vaccinations" ON vaccinations
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update clinic vaccinations" ON vaccinations
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete clinic vaccinations" ON vaccinations
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Weight history policies
CREATE POLICY "Users can view clinic weight history" ON weight_history
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert clinic weight history" ON weight_history
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update clinic weight history" ON weight_history
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete clinic weight history" ON weight_history
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Products policies
CREATE POLICY "Users can view clinic products" ON products
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert clinic products" ON products
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update clinic products" ON products
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete clinic products" ON products
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Invoices policies
CREATE POLICY "Users can view clinic invoices" ON invoices
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert clinic invoices" ON invoices
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update clinic invoices" ON invoices
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete clinic invoices" ON invoices
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Invoice items policies
CREATE POLICY "Users can view clinic invoice_items" ON invoice_items
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert clinic invoice_items" ON invoice_items
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update clinic invoice_items" ON invoice_items
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete clinic invoice_items" ON invoice_items
  FOR DELETE USING (clinic_id = get_user_clinic_id());

-- Payments policies
CREATE POLICY "Users can view clinic payments" ON payments
  FOR SELECT USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can insert clinic payments" ON payments
  FOR INSERT WITH CHECK (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can update clinic payments" ON payments
  FOR UPDATE USING (clinic_id = get_user_clinic_id());

CREATE POLICY "Users can delete clinic payments" ON payments
  FOR DELETE USING (clinic_id = get_user_clinic_id());
