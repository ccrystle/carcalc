import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface EmissionsResultProps {
  emissions: number;
  vehicle: {
    year: number;
    make: string;
    model: string;
    mpgCombined: number;
  } | null;
  annualMiles: number;
}

export const EmissionsResult = ({
  emissions,
  vehicle,
  annualMiles,
}: EmissionsResultProps) => {
  const gallonsConsumed = vehicle
    ? annualMiles / vehicle.mpgCombined
    : 0;

  return (
    <div className="border-t bg-accent/5 p-6 sm:p-8">
      <div className="mb-4 text-center">
        <div className="mb-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Annual CO₂ Emissions
        </div>
        <div className="text-5xl font-bold text-accent sm:text-6xl">
          {emissions.toFixed(2)}
        </div>
        <div className="mt-1 text-xl font-medium text-muted-foreground">
          tons per year
        </div>
      </div>

      <Separator className="my-6" />

      <div className="rounded-lg bg-muted/50 p-4 mb-4">
        <div className="text-xs font-medium text-muted-foreground mb-3">
          Calculation:
        </div>
        <table className="w-full text-sm">
          <tbody>
            <tr>
              <td className="text-right text-muted-foreground pr-4 py-1.5 align-top whitespace-nowrap">
                Gallons of gas burned:
              </td>
              <td className="text-foreground font-mono py-1.5">
                {annualMiles.toLocaleString()} miles ÷ {vehicle?.mpgCombined} mpg = {gallonsConsumed.toFixed(0)} gallons
              </td>
            </tr>
            <tr>
              <td className="text-right text-muted-foreground pr-4 py-1.5 align-top whitespace-nowrap">
                Pounds CO₂ emitted:
              </td>
              <td className="text-foreground font-mono py-1.5">
                {gallonsConsumed.toFixed(0)} gallons × 19.6 lbs CO₂ per gallon = {(gallonsConsumed * 19.6).toFixed(0)} lbs
              </td>
            </tr>
            <tr>
              <td className="text-right text-muted-foreground pr-4 py-1.5 align-top whitespace-nowrap">
                Tons CO₂ emitted:
              </td>
              <td className="text-foreground font-mono py-1.5 font-semibold">
                {emissions.toFixed(2)} tons CO₂
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Vehicle</span>
          <span className="font-medium text-foreground">
            {vehicle?.year} {vehicle?.make} {vehicle?.model}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Fuel Economy</span>
          <span className="font-medium text-foreground">
            {vehicle?.mpgCombined} MPG
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Annual Miles</span>
          <span className="font-medium text-foreground">
            {annualMiles.toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Gallons Consumed</span>
          <span className="font-medium text-foreground">
            {gallonsConsumed.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );
};
