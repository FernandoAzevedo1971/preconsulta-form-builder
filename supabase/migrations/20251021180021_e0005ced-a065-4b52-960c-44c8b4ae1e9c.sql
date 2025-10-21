-- Fix RLS policy to prevent public access to medical records
-- Drop the overly permissive public SELECT policy
DROP POLICY IF EXISTS "Enable select for service role" ON public.medical_forms;

-- Create a restrictive policy that only allows service role to read records
-- This prevents the anon key from being used to query medical records
CREATE POLICY "Service role only can select medical forms"
ON public.medical_forms
FOR SELECT
TO service_role
USING (true);

-- Add audit logging trigger for security monitoring
CREATE TABLE IF NOT EXISTS public.medical_forms_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id uuid REFERENCES public.medical_forms(id) ON DELETE CASCADE,
  action text NOT NULL,
  user_id uuid,
  timestamp timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit table
ALTER TABLE public.medical_forms_audit ENABLE ROW LEVEL SECURITY;

-- Only service role can view audit logs
CREATE POLICY "Service role only can view audit logs"
ON public.medical_forms_audit
FOR SELECT
TO service_role
USING (true);

-- Trigger function to log form access
CREATE OR REPLACE FUNCTION public.log_medical_form_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.medical_forms_audit (form_id, action, user_id)
  VALUES (NEW.id, TG_OP, auth.uid());
  RETURN NEW;
END;
$$;

-- Trigger to log all inserts
CREATE TRIGGER log_medical_form_insert
AFTER INSERT ON public.medical_forms
FOR EACH ROW
EXECUTE FUNCTION public.log_medical_form_access();