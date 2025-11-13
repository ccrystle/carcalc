import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface VehicleSelectorProps {
  onVehicleSelect: (vehicle: {
    year: number;
    make: string;
    model: string;
    mpgCombined: number;
  }) => void;
}

export const VehicleSelector = ({ onVehicleSelect }: VehicleSelectorProps) => {
  const [years, setYears] = useState<number[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<
    Array<{ model: string; mpg_combined: number }>
  >([]);

  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedMake, setSelectedMake] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState<string>("");

  // Fetch available years on mount
  useEffect(() => {
    fetchYears();
  }, []);

  // Fetch makes when year changes
  useEffect(() => {
    if (selectedYear) {
      fetchMakes(parseInt(selectedYear));
      setSelectedMake("");
      setSelectedModel("");
      setModels([]);
    }
  }, [selectedYear]);

  // Fetch models when make changes
  useEffect(() => {
    if (selectedYear && selectedMake) {
      fetchModels(parseInt(selectedYear), selectedMake);
      setSelectedModel("");
    }
  }, [selectedMake]);

  // Notify parent when a complete selection is made
  useEffect(() => {
    if (selectedYear && selectedMake && selectedModel) {
      const vehicle = models.find((m) => m.model === selectedModel);
      if (vehicle) {
        onVehicleSelect({
          year: parseInt(selectedYear),
          make: selectedMake,
          model: selectedModel,
          mpgCombined: vehicle.mpg_combined,
        });
      }
    }
  }, [selectedModel]);

  const fetchYears = async () => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("year")
        .order("year", { ascending: false });

      if (error) throw error;

      const uniqueYears = Array.from(new Set(data.map((v) => v.year)));
      setYears(uniqueYears);

      // If no data, call edge function to populate
      if (uniqueYears.length === 0) {
        toast.info("Loading complete EPA vehicle database (2010-2026). This may take a moment...");
        await supabase.functions.invoke("fetch-epa-vehicles");
        toast.success("Vehicle database loaded successfully!");
        // Retry fetching years
        fetchYears();
      }
    } catch (error) {
      console.error("Error fetching years:", error);
      toast.error("Failed to load vehicle years");
    }
  };

  const fetchMakes = async (year: number) => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("make")
        .eq("year", year)
        .order("make");

      if (error) throw error;

      const uniqueMakes = Array.from(new Set(data.map((v) => v.make)));
      setMakes(uniqueMakes);
    } catch (error) {
      console.error("Error fetching makes:", error);
      toast.error("Failed to load vehicle makes");
    }
  };

  const fetchModels = async (year: number, make: string) => {
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("model, mpg_combined")
        .eq("year", year)
        .eq("make", make)
        .order("model");

      if (error) throw error;

      setModels(data);
    } catch (error) {
      console.error("Error fetching models:", error);
      toast.error("Failed to load vehicle models");
    }
  };

  return (
    <div className="space-y-4">
      {/* Year Selector */}
      <div className="space-y-2">
        <Label htmlFor="year" className="text-sm font-medium">
          Year
        </Label>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger id="year" className="h-12">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Make Selector */}
      <div className="space-y-2">
        <Label htmlFor="make" className="text-sm font-medium">
          Make
        </Label>
        <Select
          value={selectedMake}
          onValueChange={setSelectedMake}
          disabled={!selectedYear}
        >
          <SelectTrigger id="make" className="h-12">
            <SelectValue placeholder="Select make" />
          </SelectTrigger>
          <SelectContent>
            {makes.map((make) => (
              <SelectItem key={make} value={make}>
                {make}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Model Selector */}
      <div className="space-y-2">
        <Label htmlFor="model" className="text-sm font-medium">
          Model
        </Label>
        <Select
          value={selectedModel}
          onValueChange={setSelectedModel}
          disabled={!selectedMake}
        >
          <SelectTrigger id="model" className="h-12">
            <SelectValue placeholder="Select model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.model} value={model.model}>
                {model.model} ({model.mpg_combined} MPG)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
