import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
    port: process.env.PORT || 3001,
    // MongoDB is optional - only needed for Content management (EditableText feature)
    mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || undefined,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder',
    resendApiKey: process.env.RESEND_API_KEY || 're_placeholder',
    jwtSecret: process.env.JWT_SECRET || 'supersecret',
    clientUrl: process.env.CLIENT_URL || 'http://localhost:8080',
};
