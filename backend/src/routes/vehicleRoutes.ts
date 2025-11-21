import { FastifyInstance } from 'fastify';
import * as vehicleController from '../controllers/vehicleController';

export default async function vehicleRoutes(fastify: FastifyInstance) {
    fastify.get('/years', vehicleController.getYears);
    fastify.get('/makes/:year', vehicleController.getMakes);
    fastify.get('/models/:year/:make', vehicleController.getModels);
    fastify.post('/sync', vehicleController.syncVehicles);
}
