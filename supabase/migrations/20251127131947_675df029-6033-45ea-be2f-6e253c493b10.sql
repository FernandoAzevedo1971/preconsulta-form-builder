-- Drop the existing restrictive RLS policy
DROP POLICY IF EXISTS "Allow public form submissions" ON medical_forms;

-- Create a new permissive RLS policy for public form submissions
CREATE POLICY "Allow public form submissions" 
ON medical_forms 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);