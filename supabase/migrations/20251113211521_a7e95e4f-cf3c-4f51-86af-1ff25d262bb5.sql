-- Create function to get distinct years
CREATE OR REPLACE FUNCTION get_distinct_years()
RETURNS TABLE (year INTEGER)
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT vehicles.year 
  FROM vehicles 
  ORDER BY vehicles.year DESC;
$$;