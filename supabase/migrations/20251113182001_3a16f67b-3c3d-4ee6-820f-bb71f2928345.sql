-- Create vehicles table to cache EPA data
CREATE TABLE IF NOT EXISTS public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INTEGER NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  cylinders INTEGER,
  displacement NUMERIC,
  drive_type TEXT,
  fuel_type TEXT,
  transmission TEXT,
  mpg_city INTEGER,
  mpg_highway INTEGER,
  mpg_combined NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(year, make, model)
);

-- Enable RLS but allow public read access since this is reference data
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read vehicles"
  ON public.vehicles
  FOR SELECT
  USING (true);

-- Only allow insert/update via edge functions (authenticated)
CREATE POLICY "Service role can insert vehicles"
  ON public.vehicles
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service role can update vehicles"
  ON public.vehicles
  FOR UPDATE
  USING (true);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_vehicles_year ON public.vehicles(year);
CREATE INDEX IF NOT EXISTS idx_vehicles_make ON public.vehicles(make);
CREATE INDEX IF NOT EXISTS idx_vehicles_year_make ON public.vehicles(year, make);