-- Harden get_user_clinic_id with fixed search_path
CREATE OR REPLACE FUNCTION get_user_clinic_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT clinic_id 
    FROM public.clinic_users 
    WHERE user_id = auth.uid() 
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth;

-- Tighten clinics INSERT: only allow if user has no clinic membership
DROP POLICY IF EXISTS "Users can insert their own clinic" ON clinics;
CREATE POLICY "Users can insert clinic only if no membership" ON clinics
  FOR INSERT WITH CHECK (
    NOT EXISTS (SELECT 1 FROM public.clinic_users WHERE user_id = auth.uid())
  );

-- Tighten clinic_users INSERT: prevent joining existing clinic arbitrarily
DROP POLICY IF EXISTS "Users can insert their own membership" ON clinic_users;
CREATE POLICY "Users can insert own membership only if no existing membership" ON clinic_users
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND
    NOT EXISTS (SELECT 1 FROM public.clinic_users WHERE user_id = auth.uid())
  );

-- Prevent users from updating/deleting their membership
DROP POLICY IF EXISTS "Users cannot update membership" ON clinic_users;
CREATE POLICY "Users cannot update membership" ON clinic_users
  FOR UPDATE USING (false);

DROP POLICY IF EXISTS "Users cannot delete membership" ON clinic_users;
CREATE POLICY "Users cannot delete membership" ON clinic_users
  FOR DELETE USING (false);
