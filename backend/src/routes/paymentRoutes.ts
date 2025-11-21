import { FastifyInstance } from 'fastify';
import * as paymentController from '../controllers/paymentController';

export default async function paymentRoutes(fastify: FastifyInstance) {
    fastify.post('/create-session', paymentController.createSession);
    fastify.post('/receipt', paymentController.sendReceipt);
}
