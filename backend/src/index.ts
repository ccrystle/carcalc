import Fastify from 'fastify';
import cors from '@fastify/cors';
import mongoose from 'mongoose';
import { config } from './config/env';
import { loadVehicleData } from './services/vehicleDataService';

const server = Fastify({
    logger: true
});

// Register CORS
server.register(cors, {
    origin: config.clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
});

// Register Routes
server.register(import('./routes/vehicleRoutes'), { prefix: '/api/vehicles' });
server.register(import('./routes/paymentRoutes'), { prefix: '/api/payment' });
server.register(import('./routes/contentRoutes'), { prefix: '/api/content' });

// Health Check
server.get('/health', async (request, reply) => {
    return { status: 'ok' };
});

const start = async () => {
    try {
        // Load vehicle data into memory (no MongoDB needed)
        console.log('Loading vehicle data...');
        loadVehicleData();
        server.log.info('Vehicle data loaded');

        // Connect to MongoDB (only needed for Content management)
        if (config.mongoUri) {
            console.log('Connecting to MongoDB for Content management...');
            await mongoose.connect(config.mongoUri);
            server.log.info('Connected to MongoDB');
        } else {
            server.log.warn('MongoDB URI not configured - Content management will not work');
        }

        // Start Server
        await server.listen({ port: Number(config.port), host: '0.0.0.0' });
        server.log.info(`Server listening on ${config.port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
