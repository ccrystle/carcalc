import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditableText } from "@/components/EditableText";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EmissionsPaymentProps {
  emissions: number; // US tons
  isAdmin: boolean;
}

export const EmissionsPayment = ({ emissions, isAdmin }: EmissionsPaymentProps) => {
  const [loading, setLoading] = useState(false);
  const [permitCost, setPermitCost] = useState<number>(25);
  const [paymentType, setPaymentType] = useState<"one-time" | "subscription">("one-time");
  const [offsetPercentage, setOffsetPercentage] = useState(100);
  const [email, setEmail] = useState("");

  useEffect(() => {
    // In a real app, fetch this from backend settings
    // setPermitCost(25);
  }, []);

  // Convert US tons to metric tons (1 US ton = 0.907185 metric tons)
  const metricTons = emissions * 0.907185 * (offsetPercentage / 100);

  // Calculate base cost
  const baseCost = metricTons * permitCost;

  // Add 10% fee
  const totalCost = baseCost * 1.1;

  // Monthly cost (1/12th of total)
  const monthlyCost = totalCost / 12;

  const handlePayment = async () => {
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/payment/create-session', {
        metricTons,
        baseCost,
        totalCost,
        paymentType,
        email,
      });

      if (data?.url) {
        // Store payment info for receipt email
        sessionStorage.setItem("payment_metric_tons", metricTons.toString());
        sessionStorage.setItem("payment_total_cost", totalCost.toString());
        sessionStorage.setItem("payment_type", paymentType);
        sessionStorage.setItem("payment_email", email);

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
    <Card className="mt-6 border-gray-700 bg-gray-900 p-6">
      <EditableText
        contentKey="payment_title"
        defaultContent="Make It Zero"
        className="mb-4 text-xl font-semibold text-white"
        as="h2"
        isAdmin={isAdmin}
      />

      <div className="mb-6 space-y-4">
        <div>
          <div className="mb-3">
            <EditableText
              contentKey="offset_amount_label"
              defaultContent={`Offset Amount: ${offsetPercentage}% of your emissions`}
              className="text-sm font-medium text-white"
              as="div"
              isAdmin={isAdmin}
            />
          </div>
          <Slider
            value={[offsetPercentage]}
            onValueChange={(value) => setOffsetPercentage(value[0])}
            min={0}
            max={100}
            step={10}
            className="w-full"
          />
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-3 rounded-lg bg-gray-800 p-4">
        <div className="flex justify-between text-sm">
          <EditableText
            contentKey="us_tons_label"
            defaultContent="US Tons:"
            className="text-white"
            as="span"
            isAdmin={isAdmin}
          />
          <span className="font-medium text-white">{emissions.toFixed(2)} tons ({offsetPercentage}%)</span>
        </div>
        <div className="flex justify-between text-sm">
          <EditableText
            contentKey="metric_tons_label"
            defaultContent="Metric Tons:"
            className="text-white"
            as="span"
            isAdmin={isAdmin}
          />
          <span className="font-medium text-white">{metricTons.toFixed(2)} metric tons</span>
        </div>
        <div className="flex justify-between text-sm">
          <EditableText
            contentKey="cost_per_ton_label"
            defaultContent="Cost per Metric Ton:"
            className="text-white"
            as="span"
            isAdmin={isAdmin}
          />
          <span className="font-medium text-white">${permitCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <EditableText
            contentKey="base_cost_label"
            defaultContent="Base Cost:"
            className="text-white"
            as="span"
            isAdmin={isAdmin}
          />
          <span className="font-medium text-white">${baseCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <EditableText
            contentKey="neutralization_fee_label"
            defaultContent="Cooler RGGI Auction fee -10%"
            className="text-white"
            as="span"
            isAdmin={isAdmin}
          />
          <span className="font-medium text-white">${(totalCost - baseCost).toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-700 pt-3">
          <div className="flex justify-between">
            <EditableText
              contentKey="total_label"
              defaultContent={paymentType === "one-time" ? "Total (Annual):" : "Monthly Payment:"}
              className="font-semibold text-white"
              as="span"
              isAdmin={isAdmin}
            />
            <span className="text-xl font-bold text-green-400">
              {paymentType === "one-time"
                ? `$${totalCost.toFixed(2)}`
                : `$${monthlyCost.toFixed(2)}/mo`}
            </span>
          </div>
        </div>
        {paymentType === "subscription" && (
          <EditableText
            contentKey="annual_total_note"
            defaultContent={`Annual total: $${totalCost.toFixed(2)} (12 monthly payments)`}
            className="text-xs text-gray-400"
            as="p"
            isAdmin={isAdmin}
          />
        )}
      </div>

      <Tabs value={paymentType} onValueChange={(v) => setPaymentType(v as "one-time" | "subscription")} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="one-time">One-Time Payment</TabsTrigger>
          <TabsTrigger value="subscription">Monthly Subscription</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-4">
        <Label htmlFor="email" className="mb-2 block text-sm font-medium text-white">Email Address</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email for the receipt"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
        />
      </div>

      <Button
        onClick={handlePayment}
        disabled={loading || offsetPercentage === 0 || !email}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <EditableText
              contentKey="processing_text"
              defaultContent="Processing..."
              className="inline"
              as="span"
              isAdmin={isAdmin}
            />
          </>
        ) : paymentType === "one-time" ? (
          <EditableText
            contentKey="purchase_button_text"
            defaultContent="Offset Now"
            className="inline"
            as="span"
            isAdmin={isAdmin}
          />
        ) : (
          <EditableText
            contentKey="subscription_button_text"
            defaultContent="Subscribe Now"
            className="inline"
            as="span"
            isAdmin={isAdmin}
          />
        )}
      </Button>

      <EditableText
        contentKey="payment_footer_text"
        defaultContent="Join thousands taking real climate action today"
        className="mt-3 text-center text-xs text-gray-400"
        as="p"
        isAdmin={isAdmin}
      />
    </Card>
  );
};
