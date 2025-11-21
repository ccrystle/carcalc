import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { EditableText } from "@/components/EditableText";

interface VehicleSelectorProps {
  onVehicleSelect: (vehicle: {
    year: number;
    make: string;
    model: string;
    mpgCombined: number;
  }) => void;
  isAdmin: boolean;
}

export const VehicleSelector = ({ onVehicleSelect, isAdmin }: VehicleSelectorProps) => {
  const [years, setYears] = useState<number[]>([]);
  const [makes, setMakes] = useState<string[]>([]);
  const [models, setModels] = useState<
    Array<{ model: string; mpg_combined: number }>
  >([]);

  const [selectedYear, setSelectedYear] = useState<string>("2025");
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
      const { data } = await api.get<number[]>('/vehicles/years');
      setYears(data);

      // If no data, try to sync (only if we have an admin endpoint or auto-sync)
      if (data.length === 0) {
        toast.info("Initializing vehicle database...");
        await api.post('/vehicles/sync');
        const { data: newData } = await api.get<number[]>('/vehicles/years');
        setYears(newData);
        toast.success("Vehicle database loaded!");
      }
    } catch (error) {
      console.error("Error fetching years:", error);
      toast.error("Failed to load vehicle years");
    }
  };

  const fetchMakes = async (year: number) => {
    try {
      const { data } = await api.get<string[]>(`/vehicles/makes/${year}`);
      setMakes(data);

      // Set default make to Acura if it exists
      if (data.includes("Acura")) {
        setSelectedMake("Acura");
      }
    } catch (error) {
      console.error("Error fetching makes:", error);
      toast.error("Failed to load vehicle makes");
    }
  };

  const fetchModels = async (year: number, make: string) => {
    try {
      const { data } = await api.get<Array<{ model: string; mpg_combined: number }>>(`/vehicles/models/${year}/${make}`);
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
        <EditableText
          contentKey="vehicle_year_label"
          defaultContent="Year"
          className="text-sm font-medium"
          as="div"
          isAdmin={isAdmin}
        />
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger id="year" className="h-12 bg-gray-900 border-gray-700 text-white">
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
        <EditableText
          contentKey="vehicle_make_label"
          defaultContent="Make"
          className="text-sm font-medium"
          as="div"
          isAdmin={isAdmin}
        />
        <Select
          value={selectedMake}
          onValueChange={setSelectedMake}
          disabled={!selectedYear}
        >
          <SelectTrigger id="make" className="h-12 bg-gray-900 border-gray-700 text-white">
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
        <EditableText
          contentKey="vehicle_model_label"
          defaultContent="Model"
          className="text-sm font-medium"
          as="div"
          isAdmin={isAdmin}
        />
        <Select
          value={selectedModel}
          onValueChange={setSelectedModel}
          disabled={!selectedMake}
        >
          <SelectTrigger id="model" className="h-12 bg-gray-900 border-gray-700 text-white">
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
