import Stripe from 'stripe';
import { config } from '../config/env';

const stripe = new Stripe(config.stripeSecretKey || '', {
    apiVersion: '2025-11-17.clover',
});

interface CreateSessionParams {
    email: string;
    metricTons: number;
    totalCost: number;
    paymentType: 'one-time' | 'subscription';
}

export const createPaymentSession = async ({ email, metricTons, totalCost, paymentType }: CreateSessionParams) => {
    // Check if customer exists
    const customers = await stripe.customers.list({ email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
        customerId = customers.data[0].id;
    }

    const isSubscription = paymentType === 'subscription';
    const amount = isSubscription ? Math.round((totalCost / 12) * 100) : Math.round(totalCost * 100);

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
        customer: customerId,
        customer_email: customerId ? undefined : email,
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: isSubscription ? 'Monthly Carbon Offset Subscription' : 'Annual Carbon Offset Credits',
                        description: isSubscription
                            ? `Monthly subscription to offset ${metricTons.toFixed(2)} metric tons of CO₂ annually`
                            : `One-time payment to offset ${metricTons.toFixed(2)} metric tons of CO₂ emissions`,
                    },
                    unit_amount: amount,
                    ...(isSubscription && {
                        recurring: {
                            interval: 'month',
                        },
                    }),
                },
                quantity: 1,
            },
        ],
        mode: isSubscription ? 'subscription' : 'payment',
        success_url: `${config.clientUrl}/?payment=success`,
        cancel_url: `${config.clientUrl}/?payment=cancelled`,
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    return session;
};
