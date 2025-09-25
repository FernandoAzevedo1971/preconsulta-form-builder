-- Create a table for medical forms
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

-- Enable Row Level Security
ALTER TABLE public.medical_forms ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (forms can be submitted by anyone)
CREATE POLICY "Anyone can insert medical forms" 
ON public.medical_forms 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_medical_forms_updated_at
BEFORE UPDATE ON public.medical_forms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();