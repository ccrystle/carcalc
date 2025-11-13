import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VehicleSelector } from "@/components/VehicleSelector";
import { EmissionsResult } from "@/components/EmissionsResult";
import { Leaf } from "lucide-react";

const Index = () => {
  const [selectedVehicle, setSelectedVehicle] = useState<{
    year: number;
    make: string;
    model: string;
    mpgCombined: number;
  } | null>(null);
  const [annualMiles, setAnnualMiles] = useState("");
  const [emissions, setEmissions] = useState<number | null>(null);

  const calculateEmissions = () => {
    if (selectedVehicle && annualMiles) {
      const miles = parseFloat(annualMiles);
      const gallonsConsumed = miles / selectedVehicle.mpgCombined;
      const lbsCO2 = gallonsConsumed * 19.6;
      const tonsCO2 = lbsCO2 / 2000; // Convert to tons (2000 lbs = 1 ton)
      setEmissions(tonsCO2);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-accent/10 p-3">
            <Leaf className="h-8 w-8 text-accent" />
          </div>
          <div className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Wow! Each gallon of gas we burn
          </div>
          <h1 className="text-6xl font-bold text-foreground sm:text-7xl">
            19.6 lbs
          </h1>
          <p className="mt-2 text-2xl font-medium text-muted-foreground">
            of CO₂
          </p>
        </div>

        {/* Main Card */}
        <Card className="overflow-hidden border-0 bg-card shadow-medium">
          <div className="p-6 sm:p-8">
            <h2 className="mb-6 text-2xl font-semibold text-foreground">
              Calculate Your Car's Annual Emissions
            </h2>

            <div className="space-y-6">
              {/* Vehicle Selector */}
              <VehicleSelector
                onVehicleSelect={(vehicle) => {
                  setSelectedVehicle(vehicle);
                  setEmissions(null);
                }}
              />

              {/* Annual Miles Input */}
              <div className="space-y-2">
                <Label htmlFor="miles" className="text-sm font-medium">
                  Estimated Annual Miles
                </Label>
                <Input
                  id="miles"
                  type="number"
                  placeholder="15,000"
                  value={annualMiles}
                  onChange={(e) => {
                    setAnnualMiles(e.target.value);
                    setEmissions(null);
                  }}
                  className="h-12 text-lg"
                />
              </div>

              {/* Calculate Button */}
              <Button
                onClick={calculateEmissions}
                disabled={!selectedVehicle || !annualMiles}
                className="h-12 w-full text-lg font-medium"
                size="lg"
              >
                Calculate Emissions
              </Button>
            </div>
          </div>

          {/* Results */}
          {emissions !== null && (
            <EmissionsResult
              emissions={emissions}
              vehicle={selectedVehicle}
              annualMiles={parseFloat(annualMiles)}
            />
          )}
        </Card>

        {/* Footer Note */}
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Data sourced from EPA fuel economy standards
        </p>
      </div>
    </div>
  );
};

export default Index;
