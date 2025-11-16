-- Create function to update timestamps if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create table for editable page content
CREATE TABLE IF NOT EXISTS public.page_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.page_content ENABLE ROW LEVEL SECURITY;

-- Everyone can read content
CREATE POLICY "Anyone can view page content"
ON public.page_content
FOR SELECT
USING (true);

-- Only admins can update content
CREATE POLICY "Admins can update page content"
ON public.page_content
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert content
CREATE POLICY "Admins can insert page content"
ON public.page_content
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default content
INSERT INTO public.page_content (key, content) VALUES
  ('home_title', 'Calculate Your Car''s CO₂ Emissions'),
  ('home_subtitle', 'Understanding your vehicle''s environmental impact is the first step toward making informed decisions about carbon offsetting and sustainable transportation.'),
  ('home_fact', 'The average passenger vehicle emits about 4.6 metric tons of CO₂ per year'),
  ('home_footer', 'Vehicle data from EPA FuelEconomy.gov')
ON CONFLICT (key) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_page_content_updated_at
BEFORE UPDATE ON public.page_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();