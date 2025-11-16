import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface EmissionsPaymentProps {
  emissions: number; // US tons
}

export const EmissionsPayment = ({ emissions }: EmissionsPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [permitCost, setPermitCost] = useState<number>(25);
  const [paymentType, setPaymentType] = useState<"one-time" | "subscription">("one-time");

  useEffect(() => {
    fetchPermitCost();
  }, []);

  const fetchPermitCost = async () => {
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "co2_permit_cost")
        .single();

      if (error) throw error;
      if (data) setPermitCost(Number(data.value));
    } catch (error) {
      console.error("Error fetching permit cost:", error);
    }
  };

  // Convert US tons to metric tons (1 US ton = 0.907185 metric tons)
  const metricTons = emissions * 0.907185;
  
  // Calculate base cost
  const baseCost = metricTons * permitCost;
  
  // Add 10% fee
  const totalCost = baseCost * 1.1;
  
  // Monthly cost (1/12th of total)
  const monthlyCost = totalCost / 12;

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to purchase carbon offsets");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-co2-payment", {
        body: {
          metricTons,
          baseCost,
          totalCost,
          paymentType,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to create payment session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-6 border-accent/20 bg-accent/5 p-6">
      <h3 className="mb-4 text-xl font-semibold text-foreground">
        Offset Your Carbon Emissions
      </h3>
      
      <div className="mb-6 space-y-3 rounded-lg bg-background/50 p-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">US Tons:</span>
          <span className="font-medium">{emissions.toFixed(2)} tons</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Metric Tons:</span>
          <span className="font-medium">{metricTons.toFixed(2)} metric tons</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Cost per Metric Ton:</span>
          <span className="font-medium">${permitCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Base Cost:</span>
          <span className="font-medium">${baseCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">CO2 Neutralization (10%):</span>
          <span className="font-medium">${(totalCost - baseCost).toFixed(2)}</span>
        </div>
        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="font-semibold">
              {paymentType === "one-time" ? "Total (Annual):" : "Monthly Payment:"}
            </span>
            <span className="text-xl font-bold text-accent">
              {paymentType === "one-time" 
                ? `$${totalCost.toFixed(2)}` 
                : `$${monthlyCost.toFixed(2)}/mo`}
            </span>
          </div>
        </div>
        {paymentType === "subscription" && (
          <p className="text-xs text-muted-foreground">
            Annual total: ${totalCost.toFixed(2)} (12 monthly payments)
          </p>
        )}
      </div>

      <Tabs value={paymentType} onValueChange={(v) => setPaymentType(v as "one-time" | "subscription")} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="one-time">One-Time Payment</TabsTrigger>
          <TabsTrigger value="subscription">Monthly Subscription</TabsTrigger>
        </TabsList>
      </Tabs>

      <Button
        onClick={handlePayment}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : paymentType === "one-time" ? (
          "Purchase Annual Offset"
        ) : (
          "Start Monthly Subscription"
        )}
      </Button>
      
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Your payment supports verified carbon offset projects
      </p>
    </Card>
  );
};
