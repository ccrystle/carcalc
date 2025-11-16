import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") || "");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReceiptRequest {
  email: string;
  metricTons: number;
  totalCost: number;
  paymentType: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated");

    const { metricTons, totalCost, paymentType }: ReceiptRequest = await req.json();

    const isSubscription = paymentType === "subscription";
    const monthlyCost = isSubscription ? (totalCost / 12).toFixed(2) : null;

    const emailResponse = await resend.emails.send({
      from: "Carbon Offset <onboarding@resend.dev>",
      to: [user.email],
      subject: "Thank You for Your Carbon Offset Purchase!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50; border-bottom: 3px solid #27ae60; padding-bottom: 10px;">
            Thank You for Offsetting Your Carbon Footprint!
          </h1>
          
          <p style="font-size: 16px; color: #34495e; line-height: 1.6;">
            Dear ${user.email},
          </p>
          
          <p style="font-size: 16px; color: #34495e; line-height: 1.6;">
            Thank you for taking action on climate change! Your purchase helps support verified carbon offset projects around the world.
          </p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #27ae60; padding: 20px; margin: 20px 0;">
            <h2 style="color: #27ae60; margin-top: 0;">Purchase Summary</h2>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #34495e;"><strong>CO₂ Offset:</strong></td>
                <td style="padding: 8px 0; color: #34495e; text-align: right;">${metricTons.toFixed(2)} metric tons</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #34495e;"><strong>Payment Type:</strong></td>
                <td style="padding: 8px 0; color: #34495e; text-align: right;">${isSubscription ? 'Monthly Subscription' : 'One-Time Payment'}</td>
              </tr>
              ${isSubscription ? `
                <tr>
                  <td style="padding: 8px 0; color: #34495e;"><strong>Monthly Amount:</strong></td>
                  <td style="padding: 8px 0; color: #34495e; text-align: right;">$${monthlyCost}</td>
                </tr>
              ` : ''}
              <tr style="border-top: 2px solid #27ae60;">
                <td style="padding: 8px 0; color: #27ae60;"><strong>Total Annual Cost:</strong></td>
                <td style="padding: 8px 0; color: #27ae60; text-align: right; font-size: 18px;"><strong>$${totalCost.toFixed(2)}</strong></td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 16px; color: #34495e; line-height: 1.6;">
            Your contribution makes a real difference in fighting climate change. Together, we can create a more sustainable future!
          </p>
          
          <p style="font-size: 14px; color: #7f8c8d; margin-top: 30px;">
            Questions? Contact us at support@carbonoffset.com
          </p>
        </div>
      `,
    });

    console.log("Receipt email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending receipt:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
