import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

console.log('ENV CHECK - MONGODB_URI:', process.env.MONGODB_URI);
console.log('ENV CHECK - MONGO_URI:', process.env.MONGO_URI);

export const config = {
    port: process.env.PORT || 3001,
    mongoUri: 'mongodb+srv://cdc-badmin:q8Hv7NxmY5lRgfdW@cluster0.ece4llm.mongodb.net/cooler-marketing?retryWrites=true&w=majority',
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
    resendApiKey: process.env.RESEND_API_KEY || 're_placeholder',
    jwtSecret: process.env.JWT_SECRET || 'supersecret',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:8080',
};

console.log('CONFIG - mongoUri:', config.mongoUri);
