import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { parse } from "https://deno.land/std@0.168.0/encoding/csv.ts";

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
    console.log("Fetching EPA vehicle data from fueleconomy.gov...");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Download the full EPA vehicle dataset CSV
    console.log("Downloading EPA CSV data...");
    const response = await fetch("https://fueleconomy.gov/feg/epadata/vehicles.csv");
    
    if (!response.ok) {
      throw new Error(`Failed to fetch EPA data: ${response.statusText}`);
    }

    const csvText = await response.text();
    console.log("Parsing CSV data...");
    
    const records = parse(csvText, {
      skipFirstRow: true,
    }) as any[];

    console.log(`Parsed ${records.length} total vehicles from EPA data`);

    // Filter for years 2010-2026 and extract only the fields we need
    const vehicles = records
      .filter((record: any) => {
        const year = parseInt(record.year);
        return year >= 2010 && year <= 2026 && record.make && record.model;
      })
      .map((record: any) => ({
        year: parseInt(record.year),
        make: record.make.trim(),
        model: record.model.trim(),
        mpg_combined: record.comb08 ? parseFloat(record.comb08) : null,
        mpg_city: record.city08 ? parseInt(record.city08) : null,
        mpg_highway: record.highway08 ? parseInt(record.highway08) : null,
        fuel_type: record.fuelType1 || record.fuelType || null,
        cylinders: record.cylinders ? parseInt(record.cylinders) : null,
        displacement: record.displ ? parseFloat(record.displ) : null,
        transmission: record.trans_dscr || record.trany || null,
        drive_type: record.drive || null,
      }))
      .filter((v: any) => v.mpg_combined && v.mpg_combined > 0); // Only include vehicles with valid MPG data

    console.log(`Filtered to ${vehicles.length} vehicles (2010-2026) with valid MPG data`);

    // Insert vehicles in batches to avoid timeout
    const batchSize = 500;
    let insertedCount = 0;

    console.log(`Inserting ${vehicles.length} vehicles in batches of ${batchSize}...`);

    for (let i = 0; i < vehicles.length; i += batchSize) {
      const batch = vehicles.slice(i, i + batchSize);
      
      const { error: insertError } = await supabase
        .from("vehicles")
        .upsert(batch, { 
          onConflict: "year,make,model",
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
        throw insertError;
      }

      insertedCount += batch.length;
      console.log(`Inserted batch ${Math.floor(i / batchSize) + 1}, total: ${insertedCount} vehicles`);
    }

    console.log("Successfully populated all EPA vehicle data");

    return new Response(
      JSON.stringify({
        success: true,
        message: "EPA vehicle data populated successfully",
        totalVehicles: vehicles.length,
        yearsIncluded: "2010-2026",
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
