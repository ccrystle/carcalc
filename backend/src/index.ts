import Fastify from 'fastify';
import cors from '@fastify/cors';
import mongoose from 'mongoose';
import { config } from './config/env';

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
        // Connect to MongoDB
        const MONGO_URI = 'mongodb+srv://cdc-badmin:q8Hv7NxmY5lRgfdW@cluster0.ece4llm.mongodb.net/cooler-marketing?retryWrites=true&w=majority';
        console.log('Connecting to MongoDB at:', MONGO_URI);
        await mongoose.connect(MONGO_URI);
        server.log.info('Connected to MongoDB');

        // Start Server
        await server.listen({ port: Number(config.port), host: '0.0.0.0' });
        server.log.info(`Server listening on ${config.port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
