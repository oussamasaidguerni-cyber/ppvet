-- Script to create the initial mehdi user
-- Run this in Supabase SQL Editor after migrations

-- Instructions:
-- 1. Go to Supabase Authentication > Users
-- 2. Create a new user with email: mehdi@ppvet.local (or use username mapping)
-- 3. Set password from MEHDI_INITIAL_PASSWORD environment variable
-- 4. Run this script to ensure profile is configured

-- Update or insert profile for mehdi
INSERT INTO profiles (id, username, full_name, role, must_change_password)
SELECT 
  id,
  'mehdi',
  'Mehdi',
  'veterinarian',
  true
FROM auth.users 
WHERE raw_user_meta_data->>'username' = 'mehdi' OR email LIKE '%mehdi%'
ON CONFLICT (id) DO UPDATE SET
  username = 'mehdi',
  must_change_password = true;

-- Create initial clinic settings if not exists
INSERT INTO clinic_settings (clinic_name, currency, timezone)
SELECT 'P&PVET Clinic', 'DZD', 'Africa/Algiers'
WHERE NOT EXISTS (SELECT 1 FROM clinic_settings);
