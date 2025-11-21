import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VehicleSelector } from "@/components/VehicleSelector";
import { EmissionsResult } from "@/components/EmissionsResult";
import { EmissionsPayment } from "@/components/EmissionsPayment";
import { EditableText } from "@/components/EditableText";
import { Leaf } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
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
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "admin")
      .single();

    setIsAdmin(!!data);
  };

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
      const tonsCO2 = lbsCO2 / 2000; // Convert to tons (2000 lbs = 1 ton)
      setEmissions(tonsCO2);
    }
  };

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl">
        {/* Admin Toolbar */}
        {isAdmin ? (
          <div className="mb-4 flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
            <div className="flex items-center gap-2">
              <EditableText
                contentKey="home_admin_toolbar_text"
                defaultContent="Edit Mode Active - Hover over text to edit"
                className="text-sm font-medium"
                as="span"
                isAdmin={isAdmin}
              />
            </div>
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <EditableText
                  contentKey="home_admin_panel_button"
                  defaultContent="Admin Panel"
                  className="inline"
                  as="span"
                  isAdmin={isAdmin}
                />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="mb-4 text-right">
            <Link to="/auth">
              <Button variant="outline" size="sm">
                <EditableText
                  contentKey="home_admin_login_button"
                  defaultContent="Admin Login"
                  className="inline"
                  as="span"
                  isAdmin={isAdmin}
                />
              </Button>
            </Link>
          </div>
        )}
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center justify-center rounded-full bg-accent/10 p-3">
            <Leaf className="h-8 w-8 text-accent" />
          </div>
          <EditableText
            contentKey="home_fact"
            defaultContent="The average passenger vehicle emits about 4.6 metric tons of CO₂ per year"
            className="mb-2 text-sm font-medium uppercase tracking-wide text-muted-foreground"
            as="div"
            isAdmin={isAdmin}
          />
          <EditableText
            contentKey="home_hero_number"
            defaultContent="19.6 lbs"
            className="text-6xl font-bold text-foreground sm:text-7xl"
            as="h1"
            isAdmin={isAdmin}
          />
          <EditableText
            contentKey="home_hero_subtitle"
            defaultContent="of CO₂"
            className="mt-2 text-2xl font-medium text-muted-foreground"
            as="p"
            isAdmin={isAdmin}
          />
        </div>

        {/* Main Card */}
        <Card className="overflow-hidden border-0 bg-card shadow-medium">
          <div className="p-6 sm:p-8">
            <EditableText
              contentKey="home_title"
              defaultContent="Calculate Your Car's CO₂ Emissions"
              className="mb-2 text-2xl font-semibold text-foreground"
              as="h2"
              isAdmin={isAdmin}
            />
            <EditableText
              contentKey="home_subtitle"
              defaultContent="Understanding your vehicle's environmental impact is the first step toward making informed decisions about carbon offsetting and sustainable transportation."
              className="mb-6 text-sm text-muted-foreground"
              as="p"
              isAdmin={isAdmin}
            />

            <div className="space-y-6">
              {/* Vehicle Selector */}
              <VehicleSelector
                onVehicleSelect={(vehicle) => {
                  setSelectedVehicle(vehicle);
                  setEmissions(null);
                }}
                isAdmin={isAdmin}
              />

              {/* Annual Miles Input */}
              <div className="space-y-2">
                <EditableText
                  contentKey="home_miles_label"
                  defaultContent="Estimated Annual Miles"
                  className="text-sm font-medium"
                  as="div"
                  isAdmin={isAdmin}
                />
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
                <EditableText
                  contentKey="home_calculate_button"
                  defaultContent="Calculate Emissions"
                  className="inline"
                  as="div"
                  isAdmin={isAdmin}
                />
              </Button>
            </div>
          </div>

          {/* Results */}
          {emissions !== null && (
            <EmissionsResult
              emissions={emissions}
              vehicle={selectedVehicle}
              annualMiles={parseFloat(annualMiles)}
              isAdmin={isAdmin}
            />
          )}
        </Card>

        {/* Payment Section */}
        {emissions !== null && (
          <EmissionsPayment emissions={emissions} isAdmin={isAdmin} />
        )}

        {/* Footer Note */}
        <EditableText
          contentKey="home_footer"
          defaultContent="Vehicle data from EPA FuelEconomy.gov"
          className="mt-8 text-center text-sm text-muted-foreground"
          as="p"
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
};

export default Index;
