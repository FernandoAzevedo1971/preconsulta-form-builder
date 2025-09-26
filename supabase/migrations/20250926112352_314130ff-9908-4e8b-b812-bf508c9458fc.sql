-- Drop existing policy and recreate with proper permissions
DROP POLICY IF EXISTS "Anyone can insert medical forms" ON public.medical_forms;

-- Create a new policy that allows anonymous users to insert
CREATE POLICY "Enable insert for everyone" 
ON public.medical_forms 
FOR INSERT 
WITH CHECK (true);

-- Also add a policy for select for the edge function
CREATE POLICY "Enable select for service role" 
ON public.medical_forms 
FOR SELECT 
USING (true);