-- Enable RLS on medical_forms table
ALTER TABLE medical_forms ENABLE ROW LEVEL SECURITY;

-- Enable RLS on medical_forms_audit table
ALTER TABLE medical_forms_audit ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies on medical_forms
DROP POLICY IF EXISTS "Allow public form submissions" ON medical_forms;
DROP POLICY IF EXISTS "Authenticated users can delete forms" ON medical_forms;
DROP POLICY IF EXISTS "Authenticated users can update forms" ON medical_forms;
DROP POLICY IF EXISTS "Authenticated users can view forms" ON medical_forms;

-- Drop existing policy on medical_forms_audit
DROP POLICY IF EXISTS "Authenticated users can view audit logs" ON medical_forms_audit;

-- Create PERMISSIVE policies for medical_forms (default behavior)
CREATE POLICY "Allow public form submissions" 
ON medical_forms 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can view forms" 
ON medical_forms 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can update forms" 
ON medical_forms 
FOR UPDATE 
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Authenticated users can delete forms" 
ON medical_forms 
FOR DELETE 
TO authenticated
USING (true);

-- Create PERMISSIVE policy for medical_forms_audit
CREATE POLICY "Authenticated users can view audit logs" 
ON medical_forms_audit 
FOR SELECT 
TO authenticated
USING (true);