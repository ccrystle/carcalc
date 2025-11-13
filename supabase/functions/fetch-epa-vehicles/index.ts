import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Fetching EPA vehicle data...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Sample popular vehicles data for 2010-2024
    // In production, this would call the actual EPA API
    const sampleVehicles = [
      // 2024
      { year: 2024, make: "Toyota", model: "Camry", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2024, make: "Toyota", model: "Corolla", mpg_combined: 35, fuel_type: "Gasoline" },
      { year: 2024, make: "Toyota", model: "RAV4", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2024, make: "Honda", model: "Civic", mpg_combined: 35, fuel_type: "Gasoline" },
      { year: 2024, make: "Honda", model: "Accord", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2024, make: "Honda", model: "CR-V", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2024, make: "Ford", model: "F-150", mpg_combined: 22, fuel_type: "Gasoline" },
      { year: 2024, make: "Ford", model: "Mustang", mpg_combined: 23, fuel_type: "Gasoline" },
      { year: 2024, make: "Ford", model: "Explorer", mpg_combined: 24, fuel_type: "Gasoline" },
      { year: 2024, make: "Chevrolet", model: "Silverado", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2024, make: "Chevrolet", model: "Malibu", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2024, make: "Chevrolet", model: "Equinox", mpg_combined: 28, fuel_type: "Gasoline" },
      { year: 2024, make: "Tesla", model: "Model 3", mpg_combined: 132, fuel_type: "Electric" },
      { year: 2024, make: "Tesla", model: "Model Y", mpg_combined: 122, fuel_type: "Electric" },
      { year: 2024, make: "Nissan", model: "Altima", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2024, make: "Nissan", model: "Rogue", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2024, make: "Jeep", model: "Wrangler", mpg_combined: 22, fuel_type: "Gasoline" },
      { year: 2024, make: "Jeep", model: "Grand Cherokee", mpg_combined: 22, fuel_type: "Gasoline" },
      { year: 2024, make: "Ram", model: "1500", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2024, make: "Hyundai", model: "Elantra", mpg_combined: 37, fuel_type: "Gasoline" },
      { year: 2024, make: "Hyundai", model: "Tucson", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2024, make: "Mazda", model: "CX-5", mpg_combined: 27, fuel_type: "Gasoline" },
      { year: 2024, make: "Mazda", model: "Mazda3", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2024, make: "Subaru", model: "Outback", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2024, make: "Subaru", model: "Forester", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2024, make: "Kia", model: "Forte", mpg_combined: 35, fuel_type: "Gasoline" },
      { year: 2024, make: "Kia", model: "Sportage", mpg_combined: 28, fuel_type: "Gasoline" },
      { year: 2024, make: "Volkswagen", model: "Jetta", mpg_combined: 34, fuel_type: "Gasoline" },
      { year: 2024, make: "Volkswagen", model: "Tiguan", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2024, make: "GMC", model: "Sierra", mpg_combined: 20, fuel_type: "Gasoline" },
      
      // 2023
      { year: 2023, make: "Toyota", model: "Camry", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2023, make: "Toyota", model: "Corolla", mpg_combined: 34, fuel_type: "Gasoline" },
      { year: 2023, make: "Toyota", model: "RAV4", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2023, make: "Honda", model: "Civic", mpg_combined: 33, fuel_type: "Gasoline" },
      { year: 2023, make: "Honda", model: "Accord", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2023, make: "Honda", model: "CR-V", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2023, make: "Ford", model: "F-150", mpg_combined: 21, fuel_type: "Gasoline" },
      { year: 2023, make: "Ford", model: "Escape", mpg_combined: 28, fuel_type: "Gasoline" },
      { year: 2023, make: "Chevrolet", model: "Silverado", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2023, make: "Chevrolet", model: "Tahoe", mpg_combined: 18, fuel_type: "Gasoline" },
      { year: 2023, make: "Tesla", model: "Model 3", mpg_combined: 130, fuel_type: "Electric" },
      { year: 2023, make: "Nissan", model: "Altima", mpg_combined: 31, fuel_type: "Gasoline" },
      { year: 2023, make: "Jeep", model: "Wrangler", mpg_combined: 21, fuel_type: "Gasoline" },
      { year: 2023, make: "Ram", model: "1500", mpg_combined: 19, fuel_type: "Gasoline" },
      { year: 2023, make: "Hyundai", model: "Elantra", mpg_combined: 36, fuel_type: "Gasoline" },
      { year: 2023, make: "Mazda", model: "CX-5", mpg_combined: 26, fuel_type: "Gasoline" },
      
      // 2022
      { year: 2022, make: "Toyota", model: "Camry", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2022, make: "Toyota", model: "Corolla", mpg_combined: 34, fuel_type: "Gasoline" },
      { year: 2022, make: "Toyota", model: "RAV4", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2022, make: "Honda", model: "Civic", mpg_combined: 33, fuel_type: "Gasoline" },
      { year: 2022, make: "Honda", model: "Accord", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2022, make: "Honda", model: "CR-V", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2022, make: "Ford", model: "F-150", mpg_combined: 21, fuel_type: "Gasoline" },
      { year: 2022, make: "Ford", model: "Escape", mpg_combined: 28, fuel_type: "Gasoline" },
      { year: 2022, make: "Chevrolet", model: "Silverado", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2022, make: "Chevrolet", model: "Malibu", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2022, make: "Tesla", model: "Model 3", mpg_combined: 130, fuel_type: "Electric" },
      { year: 2022, make: "Nissan", model: "Altima", mpg_combined: 31, fuel_type: "Gasoline" },
      { year: 2022, make: "Jeep", model: "Wrangler", mpg_combined: 21, fuel_type: "Gasoline" },
      { year: 2022, make: "Ram", model: "1500", mpg_combined: 19, fuel_type: "Gasoline" },
      { year: 2022, make: "Hyundai", model: "Elantra", mpg_combined: 36, fuel_type: "Gasoline" },
      { year: 2022, make: "Mazda", model: "CX-5", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2022, make: "Subaru", model: "Outback", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2022, make: "Kia", model: "Forte", mpg_combined: 35, fuel_type: "Gasoline" },
      { year: 2022, make: "Volkswagen", model: "Jetta", mpg_combined: 34, fuel_type: "Gasoline" },
      
      // 2021
      { year: 2021, make: "Toyota", model: "Camry", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2021, make: "Toyota", model: "Corolla", mpg_combined: 34, fuel_type: "Gasoline" },
      { year: 2021, make: "Toyota", model: "RAV4", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2021, make: "Honda", model: "Civic", mpg_combined: 33, fuel_type: "Gasoline" },
      { year: 2021, make: "Honda", model: "Accord", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2021, make: "Honda", model: "CR-V", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2021, make: "Ford", model: "F-150", mpg_combined: 21, fuel_type: "Gasoline" },
      { year: 2021, make: "Ford", model: "Escape", mpg_combined: 28, fuel_type: "Gasoline" },
      { year: 2021, make: "Chevrolet", model: "Silverado", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2021, make: "Chevrolet", model: "Malibu", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2021, make: "Tesla", model: "Model 3", mpg_combined: 130, fuel_type: "Electric" },
      { year: 2021, make: "Nissan", model: "Altima", mpg_combined: 31, fuel_type: "Gasoline" },
      { year: 2021, make: "Jeep", model: "Wrangler", mpg_combined: 21, fuel_type: "Gasoline" },
      { year: 2021, make: "Ram", model: "1500", mpg_combined: 19, fuel_type: "Gasoline" },
      { year: 2021, make: "Hyundai", model: "Elantra", mpg_combined: 36, fuel_type: "Gasoline" },
      { year: 2021, make: "Mazda", model: "CX-5", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2021, make: "Subaru", model: "Outback", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2021, make: "Kia", model: "Forte", mpg_combined: 35, fuel_type: "Gasoline" },
      
      // 2020
      { year: 2020, make: "Toyota", model: "Camry", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2020, make: "Toyota", model: "Corolla", mpg_combined: 34, fuel_type: "Gasoline" },
      { year: 2020, make: "Toyota", model: "RAV4", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2020, make: "Honda", model: "Civic", mpg_combined: 33, fuel_type: "Gasoline" },
      { year: 2020, make: "Honda", model: "Accord", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2020, make: "Honda", model: "CR-V", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2020, make: "Ford", model: "F-150", mpg_combined: 21, fuel_type: "Gasoline" },
      { year: 2020, make: "Ford", model: "Escape", mpg_combined: 28, fuel_type: "Gasoline" },
      { year: 2020, make: "Chevrolet", model: "Silverado", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2020, make: "Chevrolet", model: "Malibu", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2020, make: "Tesla", model: "Model 3", mpg_combined: 130, fuel_type: "Electric" },
      { year: 2020, make: "Nissan", model: "Altima", mpg_combined: 31, fuel_type: "Gasoline" },
      { year: 2020, make: "Jeep", model: "Wrangler", mpg_combined: 21, fuel_type: "Gasoline" },
      { year: 2020, make: "Ram", model: "1500", mpg_combined: 19, fuel_type: "Gasoline" },
      { year: 2020, make: "Hyundai", model: "Elantra", mpg_combined: 35, fuel_type: "Gasoline" },
      { year: 2020, make: "Mazda", model: "CX-5", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2020, make: "Subaru", model: "Outback", mpg_combined: 29, fuel_type: "Gasoline" },
      
      // 2019
      { year: 2019, make: "Toyota", model: "Camry", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2019, make: "Toyota", model: "Corolla", mpg_combined: 33, fuel_type: "Gasoline" },
      { year: 2019, make: "Toyota", model: "RAV4", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2019, make: "Honda", model: "Civic", mpg_combined: 33, fuel_type: "Gasoline" },
      { year: 2019, make: "Honda", model: "Accord", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2019, make: "Honda", model: "CR-V", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2019, make: "Ford", model: "F-150", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2019, make: "Ford", model: "Escape", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2019, make: "Chevrolet", model: "Silverado", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2019, make: "Chevrolet", model: "Malibu", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2019, make: "Nissan", model: "Altima", mpg_combined: 31, fuel_type: "Gasoline" },
      { year: 2019, make: "Jeep", model: "Wrangler", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2019, make: "Ram", model: "1500", mpg_combined: 19, fuel_type: "Gasoline" },
      { year: 2019, make: "Hyundai", model: "Elantra", mpg_combined: 35, fuel_type: "Gasoline" },
      { year: 2019, make: "Mazda", model: "CX-5", mpg_combined: 26, fuel_type: "Gasoline" },
      
      // 2018
      { year: 2018, make: "Toyota", model: "Camry", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2018, make: "Toyota", model: "Corolla", mpg_combined: 33, fuel_type: "Gasoline" },
      { year: 2018, make: "Toyota", model: "RAV4", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2018, make: "Honda", model: "Civic", mpg_combined: 33, fuel_type: "Gasoline" },
      { year: 2018, make: "Honda", model: "Accord", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2018, make: "Honda", model: "CR-V", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2018, make: "Ford", model: "F-150", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2018, make: "Ford", model: "Escape", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2018, make: "Chevrolet", model: "Silverado", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2018, make: "Chevrolet", model: "Malibu", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2018, make: "Nissan", model: "Altima", mpg_combined: 31, fuel_type: "Gasoline" },
      { year: 2018, make: "Jeep", model: "Wrangler", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2018, make: "Ram", model: "1500", mpg_combined: 17, fuel_type: "Gasoline" },
      { year: 2018, make: "Hyundai", model: "Elantra", mpg_combined: 32, fuel_type: "Gasoline" },
      
      // 2017
      { year: 2017, make: "Toyota", model: "Camry", mpg_combined: 28, fuel_type: "Gasoline" },
      { year: 2017, make: "Toyota", model: "Corolla", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2017, make: "Toyota", model: "RAV4", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2017, make: "Honda", model: "Civic", mpg_combined: 35, fuel_type: "Gasoline" },
      { year: 2017, make: "Honda", model: "Accord", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2017, make: "Honda", model: "CR-V", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2017, make: "Ford", model: "F-150", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2017, make: "Ford", model: "Escape", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2017, make: "Chevrolet", model: "Silverado", mpg_combined: 19, fuel_type: "Gasoline" },
      { year: 2017, make: "Chevrolet", model: "Malibu", mpg_combined: 31, fuel_type: "Gasoline" },
      { year: 2017, make: "Nissan", model: "Altima", mpg_combined: 31, fuel_type: "Gasoline" },
      { year: 2017, make: "Jeep", model: "Wrangler", mpg_combined: 19, fuel_type: "Gasoline" },
      { year: 2017, make: "Ram", model: "1500", mpg_combined: 17, fuel_type: "Gasoline" },
      
      // 2016
      { year: 2016, make: "Toyota", model: "Camry", mpg_combined: 28, fuel_type: "Gasoline" },
      { year: 2016, make: "Toyota", model: "Corolla", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2016, make: "Toyota", model: "RAV4", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2016, make: "Honda", model: "Civic", mpg_combined: 35, fuel_type: "Gasoline" },
      { year: 2016, make: "Honda", model: "Accord", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2016, make: "Honda", model: "CR-V", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2016, make: "Ford", model: "F-150", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2016, make: "Ford", model: "Escape", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2016, make: "Chevrolet", model: "Silverado", mpg_combined: 19, fuel_type: "Gasoline" },
      { year: 2016, make: "Chevrolet", model: "Malibu", mpg_combined: 31, fuel_type: "Gasoline" },
      { year: 2016, make: "Nissan", model: "Altima", mpg_combined: 31, fuel_type: "Gasoline" },
      { year: 2016, make: "Jeep", model: "Wrangler", mpg_combined: 19, fuel_type: "Gasoline" },
      
      // 2015
      { year: 2015, make: "Toyota", model: "Camry", mpg_combined: 28, fuel_type: "Gasoline" },
      { year: 2015, make: "Toyota", model: "Corolla", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2015, make: "Toyota", model: "RAV4", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2015, make: "Honda", model: "Civic", mpg_combined: 33, fuel_type: "Gasoline" },
      { year: 2015, make: "Honda", model: "Accord", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2015, make: "Honda", model: "CR-V", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2015, make: "Ford", model: "F-150", mpg_combined: 20, fuel_type: "Gasoline" },
      { year: 2015, make: "Ford", model: "Escape", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2015, make: "Chevrolet", model: "Silverado", mpg_combined: 19, fuel_type: "Gasoline" },
      { year: 2015, make: "Chevrolet", model: "Malibu", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2015, make: "Nissan", model: "Altima", mpg_combined: 31, fuel_type: "Gasoline" },
      
      // 2014
      { year: 2014, make: "Toyota", model: "Camry", mpg_combined: 28, fuel_type: "Gasoline" },
      { year: 2014, make: "Toyota", model: "Corolla", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2014, make: "Toyota", model: "RAV4", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2014, make: "Honda", model: "Civic", mpg_combined: 33, fuel_type: "Gasoline" },
      { year: 2014, make: "Honda", model: "Accord", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2014, make: "Honda", model: "CR-V", mpg_combined: 27, fuel_type: "Gasoline" },
      { year: 2014, make: "Ford", model: "F-150", mpg_combined: 19, fuel_type: "Gasoline" },
      { year: 2014, make: "Ford", model: "Escape", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2014, make: "Chevrolet", model: "Silverado", mpg_combined: 18, fuel_type: "Gasoline" },
      { year: 2014, make: "Chevrolet", model: "Malibu", mpg_combined: 29, fuel_type: "Gasoline" },
      
      // 2013
      { year: 2013, make: "Toyota", model: "Camry", mpg_combined: 28, fuel_type: "Gasoline" },
      { year: 2013, make: "Toyota", model: "Corolla", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2013, make: "Toyota", model: "RAV4", mpg_combined: 25, fuel_type: "Gasoline" },
      { year: 2013, make: "Honda", model: "Civic", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2013, make: "Honda", model: "Accord", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2013, make: "Honda", model: "CR-V", mpg_combined: 27, fuel_type: "Gasoline" },
      { year: 2013, make: "Ford", model: "F-150", mpg_combined: 18, fuel_type: "Gasoline" },
      { year: 2013, make: "Ford", model: "Escape", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2013, make: "Chevrolet", model: "Silverado", mpg_combined: 18, fuel_type: "Gasoline" },
      { year: 2013, make: "Chevrolet", model: "Malibu", mpg_combined: 29, fuel_type: "Gasoline" },
      
      // 2012
      { year: 2012, make: "Toyota", model: "Camry", mpg_combined: 28, fuel_type: "Gasoline" },
      { year: 2012, make: "Toyota", model: "Corolla", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2012, make: "Toyota", model: "RAV4", mpg_combined: 24, fuel_type: "Gasoline" },
      { year: 2012, make: "Honda", model: "Civic", mpg_combined: 32, fuel_type: "Gasoline" },
      { year: 2012, make: "Honda", model: "Accord", mpg_combined: 27, fuel_type: "Gasoline" },
      { year: 2012, make: "Honda", model: "CR-V", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2012, make: "Ford", model: "F-150", mpg_combined: 18, fuel_type: "Gasoline" },
      { year: 2012, make: "Ford", model: "Escape", mpg_combined: 25, fuel_type: "Gasoline" },
      { year: 2012, make: "Chevrolet", model: "Silverado", mpg_combined: 18, fuel_type: "Gasoline" },
      { year: 2012, make: "Chevrolet", model: "Malibu", mpg_combined: 26, fuel_type: "Gasoline" },
      
      // 2011
      { year: 2011, make: "Toyota", model: "Camry", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2011, make: "Toyota", model: "Corolla", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2011, make: "Toyota", model: "RAV4", mpg_combined: 24, fuel_type: "Gasoline" },
      { year: 2011, make: "Honda", model: "Civic", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2011, make: "Honda", model: "Accord", mpg_combined: 27, fuel_type: "Gasoline" },
      { year: 2011, make: "Honda", model: "CR-V", mpg_combined: 25, fuel_type: "Gasoline" },
      { year: 2011, make: "Ford", model: "F-150", mpg_combined: 17, fuel_type: "Gasoline" },
      { year: 2011, make: "Ford", model: "Escape", mpg_combined: 25, fuel_type: "Gasoline" },
      { year: 2011, make: "Chevrolet", model: "Silverado", mpg_combined: 17, fuel_type: "Gasoline" },
      { year: 2011, make: "Chevrolet", model: "Malibu", mpg_combined: 26, fuel_type: "Gasoline" },
      
      // 2010
      { year: 2010, make: "Toyota", model: "Camry", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2010, make: "Toyota", model: "Corolla", mpg_combined: 30, fuel_type: "Gasoline" },
      { year: 2010, make: "Toyota", model: "RAV4", mpg_combined: 24, fuel_type: "Gasoline" },
      { year: 2010, make: "Honda", model: "Civic", mpg_combined: 29, fuel_type: "Gasoline" },
      { year: 2010, make: "Honda", model: "Accord", mpg_combined: 26, fuel_type: "Gasoline" },
      { year: 2010, make: "Honda", model: "CR-V", mpg_combined: 25, fuel_type: "Gasoline" },
      { year: 2010, make: "Ford", model: "F-150", mpg_combined: 17, fuel_type: "Gasoline" },
      { year: 2010, make: "Ford", model: "Escape", mpg_combined: 24, fuel_type: "Gasoline" },
      { year: 2010, make: "Chevrolet", model: "Silverado", mpg_combined: 17, fuel_type: "Gasoline" },
      { year: 2010, make: "Chevrolet", model: "Malibu", mpg_combined: 26, fuel_type: "Gasoline" },
    ];

    console.log(`Inserting ${sampleVehicles.length} vehicles...`);

    // Insert vehicles (ignore conflicts for duplicates)
    const { error: insertError } = await supabase
      .from("vehicles")
      .upsert(sampleVehicles, { 
        onConflict: "year,make,model",
        ignoreDuplicates: true 
      });

    if (insertError) {
      console.error("Error inserting vehicles:", insertError);
      throw insertError;
    }

    console.log("Successfully populated vehicle data");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Vehicle data populated successfully",
        count: sampleVehicles.length,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in fetch-epa-vehicles:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
