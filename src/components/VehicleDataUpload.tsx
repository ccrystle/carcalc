import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload } from "lucide-react";

export const VehicleDataUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const processCSV = async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Find required column indices
      const yearIdx = headers.indexOf('year');
      const makeIdx = headers.indexOf('make');
      const modelIdx = headers.indexOf('model');
      const cityIdx = headers.indexOf('city08');
      const hwyIdx = headers.indexOf('highway08');
      const combIdx = headers.indexOf('comb08');
      const displIdx = headers.indexOf('displ');
      const cylIdx = headers.indexOf('cylinders');
      const fuelIdx = headers.indexOf('fuelType');
      const transIdx = headers.indexOf('trany');
      const driveIdx = headers.indexOf('drive');

      const vehicleMap = new Map();
      
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim());
        
        const year = parseInt(values[yearIdx]);
        const mpgCity = parseInt(values[cityIdx]);
        const mpgHighway = parseInt(values[hwyIdx]);
        const mpgCombined = parseFloat(values[combIdx]);
        
        // Filter: years 2010-2026 and valid MPG
        if (year >= 2010 && year <= 2026 && mpgCombined > 0) {
          const make = values[makeIdx];
          const model = values[modelIdx];
          const key = `${year}-${make}-${model}`;
          
          // Keep only unique year/make/model combinations
          if (!vehicleMap.has(key)) {
            vehicleMap.set(key, {
              year,
              make,
              model,
              mpg_city: mpgCity || null,
              mpg_highway: mpgHighway || null,
              mpg_combined: mpgCombined,
              displacement: parseFloat(values[displIdx]) || null,
              cylinders: parseInt(values[cylIdx]) || null,
              fuel_type: values[fuelIdx] || null,
              transmission: values[transIdx] || null,
              drive_type: values[driveIdx] || null
            });
          }
        }
        
        if (i % 1000 === 0) {
          setProgress((i / lines.length) * 50);
        }
      }

      const vehicles = Array.from(vehicleMap.values());
      console.log(`Parsed ${vehicles.length} unique vehicles`);
      toast.info(`Parsed ${vehicles.length} unique vehicles, uploading...`);

      // Insert in batches of 500
      const batchSize = 500;
      for (let i = 0; i < vehicles.length; i += batchSize) {
        const batch = vehicles.slice(i, i + batchSize);
        
        const { error } = await supabase
          .from('vehicles')
          .upsert(batch, {
            onConflict: 'year,make,model',
            ignoreDuplicates: false
          });

        if (error) throw error;
        
        setProgress(50 + ((i / vehicles.length) * 50));
      }

      setProgress(100);
      toast.success(`Successfully uploaded ${vehicles.length} vehicles!`);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload vehicles: ' + (error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      processCSV(file);
    } else {
      toast.error('Please select a CSV file');
    }
  };

  return (
    <div className="space-y-4 p-6 border border-border rounded-lg bg-card">
      <div className="flex items-center gap-2">
        <Upload className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Upload Vehicle Data</h3>
      </div>
      
      <div className="space-y-2">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        {uploading && (
          <div className="space-y-2">
            <Progress value={progress} />
            <p className="text-sm text-muted-foreground text-center">
              {progress < 50 ? 'Parsing CSV...' : 'Uploading to database...'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
