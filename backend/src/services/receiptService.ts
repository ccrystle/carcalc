import { Resend } from 'resend';
import { config } from '../config/env';

const resend = new Resend(config.resendApiKey);

interface SendReceiptParams {
    email: string;
    metricTons: number;
    totalCost: number;
    paymentType: string;
}

export const sendReceiptEmail = async ({ email, metricTons, totalCost, paymentType }: SendReceiptParams) => {
    const isSubscription = paymentType === 'subscription';
    const monthlyCost = isSubscription ? (totalCost / 12).toFixed(2) : null;

    const response = await resend.emails.send({
        from: 'Carbon Offset <onboarding@resend.dev>',
        to: [email],
        subject: 'Thank You for Your Carbon Offset Purchase!',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2c3e50; border-bottom: 3px solid #27ae60; padding-bottom: 10px;">
          Thank You for Offsetting Your Carbon Footprint!
        </h1>
        
        <p style="font-size: 16px; color: #34495e; line-height: 1.6;">
          Dear ${email},
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

    return response;
};
