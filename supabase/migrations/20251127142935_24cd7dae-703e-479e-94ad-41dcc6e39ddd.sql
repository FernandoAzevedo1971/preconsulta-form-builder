-- Fix RLS for public form submissions on medical_forms

-- 1) Drop existing INSERT policy (if any)
DROP POLICY IF EXISTS "Allow public form submissions" ON public.medical_forms;

-- 2) Recreate INSERT policy, explicitly for role "public"
CREATE POLICY "Allow public form submissions"
ON public.medical_forms
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (true);

-- 3) Ensure required privileges for anonymous and authenticated clients
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT INSERT ON public.medical_forms TO anon;
GRANT INSERT ON public.medical_forms TO authenticated;