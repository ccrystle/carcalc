import { FastifyRequest, FastifyReply } from 'fastify';
import { createPaymentSession } from '../services/paymentService';
import { sendReceiptEmail } from '../services/receiptService';

interface PaymentRequestBody {
    metricTons: number;
    baseCost: number;
    totalCost: number;
    paymentType: 'one-time' | 'subscription';
    email: string; // In a real app, get this from the authenticated user
}

export const createSession = async (req: FastifyRequest<{ Body: PaymentRequestBody }>, reply: FastifyReply) => {
    const { metricTons, totalCost, paymentType, email } = req.body;

    try {
        const session = await createPaymentSession({
            email,
            metricTons,
            totalCost,
            paymentType
        });

        return { url: session.url };
    } catch (error: any) {
        req.log.error(error);
        reply.code(500).send({ error: error.message });
    }
};

export const sendReceipt = async (req: FastifyRequest<{ Body: PaymentRequestBody }>, reply: FastifyReply) => {
    const { metricTons, totalCost, paymentType, email } = req.body;

    try {
        await sendReceiptEmail({
            email,
            metricTons,
            totalCost,
            paymentType
        });

        return { success: true };
    } catch (error: any) {
        req.log.error(error);
        reply.code(500).send({ error: error.message });
    }
};
