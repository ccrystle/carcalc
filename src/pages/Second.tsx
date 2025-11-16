import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VehicleSelector } from "@/components/VehicleSelector";
import { EmissionsPayment } from "@/components/EmissionsPayment";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Second = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState<{
    year: number;
    make: string;
    model: string;
    mpgCombined: number;
  } | null>(null);
  const [annualMiles, setAnnualMiles] = useState("12000");
  const [emissions, setEmissions] = useState<number | null>(null);
  const [isAdmin] = useState(false);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (paymentStatus === "success") {
      const metricTons = sessionStorage.getItem("payment_metric_tons");
      const totalCost = sessionStorage.getItem("payment_total_cost");
      const paymentType = sessionStorage.getItem("payment_type");

      if (metricTons && totalCost && paymentType) {
        sendReceipt(
          parseFloat(metricTons),
          parseFloat(totalCost),
          paymentType
        );
        sessionStorage.removeItem("payment_metric_tons");
        sessionStorage.removeItem("payment_total_cost");
        sessionStorage.removeItem("payment_type");
      }
      
      searchParams.delete("payment");
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams]);

  const sendReceipt = async (metricTons: number, totalCost: number, paymentType: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await supabase.functions.invoke("send-payment-receipt", {
        body: { metricTons, totalCost, paymentType },
      });

      toast({
        title: "Receipt Sent!",
        description: "A confirmation email has been sent to your inbox.",
      });
    } catch (error) {
      console.error("Error sending receipt:", error);
    }
  };

  const calculateEmissions = () => {
    if (selectedVehicle && annualMiles) {
      const miles = parseFloat(annualMiles);
      const gallonsConsumed = miles / selectedVehicle.mpgCombined;
      const lbsCO2 = gallonsConsumed * 19.6;
      const tonsCO2 = lbsCO2 / 2000;
      setEmissions(tonsCO2);
    }
  };

  const gallonsConsumed = selectedVehicle && annualMiles
    ? parseFloat(annualMiles) / selectedVehicle.mpgCombined
    : 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* SECTION 1 - Hero */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl sm:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Real Climate Action. Right Now.
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
            Climate chaos is here — bigger storms, record heat, rising costs. And while the federal government is busy rolling back climate protections and cheering on more drilling + coal… you still have power. Like, today.
          </p>
        </div>
      </section>

      {/* SECTION 2 - CO₂ Stat */}
      <section className="px-4 py-16 bg-gray-950">
        <div className="mx-auto max-w-4xl text-center">
          <div className="text-8xl sm:text-9xl font-black mb-4" style={{ color: '#4ade80' }}>
            19.6
          </div>
          <p className="text-xl sm:text-2xl text-gray-400 mb-8">
            lbs
          </p>
          <p className="text-2xl sm:text-3xl font-semibold mb-8 text-white">
            CO₂ per gallon of gas your car burns.
          </p>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            But you can wipe out your car's yearly footprint today.<br />
            No EV required. No guilt trip. Just real action.
          </p>
        </div>
      </section>

      {/* SECTION 3 - What You Can Do */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-center">
            Your "Stop Polluting" Button
          </h2>
          <div className="text-lg sm:text-xl text-gray-300 space-y-4 leading-relaxed">
            <p>
              We retire real emissions permits that fossil-fuel power plants need to operate in the Northeast.
            </p>
            <p>
              If you retire a permit, it disappears forever.
            </p>
            <p>
              Less supply = less pollution.
            </p>
            <p className="font-semibold text-white">
              It's basically a giant stop polluting button you get to press.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 4 - Calculator Module */}
      <section className="px-4 py-16 sm:py-24 bg-gray-950">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl sm:text-5xl font-bold mb-12 text-center">
            Calculate Your Impact
          </h2>

          <div className="bg-black border border-gray-800 rounded-lg p-6 sm:p-8 mb-8">
            <VehicleSelector
              onVehicleSelect={setSelectedVehicle}
              isAdmin={isAdmin}
            />

            <div className="mt-6">
              <Label htmlFor="miles" className="text-white text-base mb-2 block">
                Estimated annual miles
              </Label>
              <Input
                id="miles"
                type="number"
                value={annualMiles}
                onChange={(e) => setAnnualMiles(e.target.value)}
                placeholder="12000"
                className="bg-gray-900 border-gray-700 text-white text-lg"
              />
            </div>

            <Button
              onClick={calculateEmissions}
              disabled={!selectedVehicle || !annualMiles}
              className="w-full mt-6 h-12 text-lg font-semibold"
              style={{ backgroundColor: '#4ade80', color: '#000' }}
            >
              Calculate Emissions
            </Button>
          </div>

          {emissions !== null && selectedVehicle && (
            <div className="bg-black border border-gray-800 rounded-lg p-6 sm:p-8 mb-8">
              <div className="text-center mb-6">
                <div className="text-sm font-medium uppercase tracking-wide text-gray-400 mb-2">
                  Annual CO₂ Emissions
                </div>
                <div className="text-6xl font-bold mb-2" style={{ color: '#4ade80' }}>
                  {emissions.toFixed(2)}
                </div>
                <div className="text-xl font-medium text-gray-300">
                  tons per year
                </div>
              </div>

              <div className="bg-gray-900 rounded-lg p-4 mb-6">
                <div className="text-xs font-medium text-gray-400 mb-3">
                  Calculation:
                </div>
                <table className="w-full text-sm">
                  <tbody>
                    <tr>
                      <td className="text-right text-gray-400 pr-4 py-1.5 align-top whitespace-nowrap">
                        Gallons of gas burned:
                      </td>
                      <td className="text-white font-mono py-1.5">
                        {parseFloat(annualMiles).toLocaleString()} miles ÷ {selectedVehicle.mpgCombined} mpg = {gallonsConsumed.toFixed(0)} gallons
                      </td>
                    </tr>
                    <tr>
                      <td className="text-right text-gray-400 pr-4 py-1.5 align-top whitespace-nowrap">
                        Pounds CO₂ emitted:
                      </td>
                      <td className="text-white font-mono py-1.5">
                        {gallonsConsumed.toFixed(0)} gallons × 19.6 lbs CO₂ per gallon = {(gallonsConsumed * 19.6).toFixed(0)} lbs
                      </td>
                    </tr>
                    <tr>
                      <td className="text-right text-gray-400 pr-4 py-1.5 align-top whitespace-nowrap">
                        Tons CO₂ emitted:
                      </td>
                      <td className="text-white font-mono py-1.5 font-semibold">
                        {emissions.toFixed(2)} tons CO₂
                      </td>
                    </tr>
                    <tr>
                      <td className="text-right text-gray-400 pr-4 py-1.5 align-top whitespace-nowrap">
                        CO₂ emitted per mile driven:
                      </td>
                      <td className="text-white font-mono py-1.5">
                        {((gallonsConsumed * 19.6) / parseFloat(annualMiles)).toFixed(3)} lbs CO₂/mile
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Vehicle</span>
                  <span className="font-medium text-white">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Fuel Economy</span>
                  <span className="font-medium text-white">
                    {selectedVehicle.mpgCombined} MPG
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Annual Miles</span>
                  <span className="font-medium text-white">
                    {parseFloat(annualMiles).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Gallons Consumed</span>
                  <span className="font-medium text-white">
                    {gallonsConsumed.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {emissions !== null && selectedVehicle && (
            <div className="bg-black border border-gray-800 rounded-lg p-6 sm:p-8">
              <EmissionsPayment
                emissions={emissions}
                isAdmin={isAdmin}
              />
            </div>
          )}

          <p className="text-sm text-gray-500 text-center mt-6">
            Vehicle data from EPA FuelEconomy.gov
          </p>
        </div>
      </section>

      {/* SECTION 5 - Why Now */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8 text-center">
            When Washington Backs Off, You Don't Have To
          </h2>
          <div className="text-lg sm:text-xl text-gray-300 space-y-4 leading-relaxed text-center">
            <p>
              Climate rules are being dismantled. But state-level permit systems still work — and you can use them.
            </p>
            <p className="font-semibold text-white">
              Retire permits. Cut pollution.<br />
              Take control while others look away.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 6 - Final CTA */}
      <section className="px-4 py-16 sm:py-24 bg-gray-950">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-8">
            Neutralize Your Footprint Today
          </h2>
          <Button
            onClick={() => {
              const calculatorSection = document.querySelector('section:nth-of-type(4)');
              calculatorSection?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="h-14 px-12 text-xl font-bold"
            style={{ backgroundColor: '#4ade80', color: '#000' }}
          >
            Neutralize My Emissions →
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Second;
