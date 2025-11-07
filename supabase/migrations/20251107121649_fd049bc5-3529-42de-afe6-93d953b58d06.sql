-- Create medical_forms table
CREATE TABLE public.medical_forms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_completo TEXT NOT NULL,
  data_nascimento TEXT,
  idade INTEGER,
  indicacao TEXT,
  quem_indicou TEXT,
  form_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create audit table for tracking form submissions
CREATE TABLE public.medical_forms_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  form_id UUID REFERENCES public.medical_forms(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  user_id UUID,
  ip_address INET,
  user_agent TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.medical_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_forms_audit ENABLE ROW LEVEL SECURITY;

-- RLS Policies for medical_forms
-- Allow public to insert forms (for patient submissions)
CREATE POLICY "Allow public form submissions"
ON public.medical_forms
FOR INSERT
TO anon
WITH CHECK (true);

-- Only authenticated users (doctors/staff) can view forms
CREATE POLICY "Authenticated users can view forms"
ON public.medical_forms
FOR SELECT
TO authenticated
USING (true);

-- Only authenticated users can update forms
CREATE POLICY "Authenticated users can update forms"
ON public.medical_forms
FOR UPDATE
TO authenticated
USING (true);

-- Only authenticated users can delete forms
CREATE POLICY "Authenticated users can delete forms"
ON public.medical_forms
FOR DELETE
TO authenticated
USING (true);

-- RLS Policies for medical_forms_audit
-- Allow public to insert audit logs (for tracking submissions)
CREATE POLICY "Allow public audit logging"
ON public.medical_forms_audit
FOR INSERT
TO anon
WITH CHECK (true);

-- Only authenticated users can view audit logs
CREATE POLICY "Authenticated users can view audit logs"
ON public.medical_forms_audit
FOR SELECT
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_medical_forms_updated_at
BEFORE UPDATE ON public.medical_forms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_medical_forms_created_at ON public.medical_forms(created_at DESC);
CREATE INDEX idx_medical_forms_nome ON public.medical_forms(nome_completo);
CREATE INDEX idx_medical_forms_audit_form_id ON public.medical_forms_audit(form_id);
CREATE INDEX idx_medical_forms_audit_timestamp ON public.medical_forms_audit(timestamp DESC);