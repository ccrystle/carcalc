# Digital Ocean Deployment Guide

## Prerequisites
- Digital Ocean account
- GitHub repository connected to Digital Ocean
- Environment variables ready

## Quick Deploy via App Platform

### Option 1: Using app.yaml (Recommended)

1. **Update the `.do/app.yaml` file:**
   - Replace `your-username/CarCalc` with your actual GitHub repo
   - Update region if needed (default: nyc)

2. **In Digital Ocean Dashboard:**
   - Go to App Platform
   - Click "Create App"
   - Select "GitHub" and choose your repo
   - Select "Use app.yaml"
   - Digital Ocean will detect the `.do/app.yaml` file

3. **Set Environment Variables:**
   - In the App Platform dashboard, go to Settings → App-Level Environment Variables
   - Add these as **SECRET** variables:
     - `MONGODB_URI`
     - `STRIPE_SECRET_KEY`
     - `RESEND_API_KEY`
     - `JWT_SECRET`

4. **Deploy!**
   - Click "Create Resources"
   - Digital Ocean will build and deploy both apps

### Option 2: Manual Setup

#### Frontend App
1. Create new Static Site app
2. Connect GitHub repo
3. Build command: `npm ci && npm run build`
4. Output directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` = your backend URL (will be auto-generated)

#### Backend App
1. Create new Web Service app
2. Connect GitHub repo
3. Source directory: `backend`
4. Build command: `npm ci && npm run build`
5. Run command: `npm start`
6. HTTP port: `3001`
7. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=3001`
   - `CLIENT_URL` = your frontend URL
   - `MONGODB_URI` (SECRET)
   - `STRIPE_SECRET_KEY` (SECRET)
   - `RESEND_API_KEY` (SECRET)
   - `JWT_SECRET` (SECRET)

## Post-Deployment

1. **Update Frontend API URL:**
   - After backend deploys, copy its public URL
   - Update frontend's `VITE_API_URL` environment variable
   - Redeploy frontend

2. **Update CORS:**
   - In backend, ensure `CLIENT_URL` matches your frontend URL
   - Fastify CORS is already configured in `backend/src/index.ts`

## Cost Estimate
- Frontend (Static): **Free** (or $5/mo for custom domain)
- Backend (Basic XXS): **$5/mo**
- **Total: ~$5-10/month**

## Monitoring
- Check logs in Digital Ocean dashboard
- Health check endpoint: `https://your-backend-url/health`

## Troubleshooting

### Build Fails
- Check Node.js version (App Platform auto-detects, but you can specify in app.yaml)
- Ensure all dependencies are in package.json

### Backend Can't Connect to MongoDB
- Verify `MONGODB_URI` is set correctly
- Check MongoDB Atlas IP whitelist (add Digital Ocean IPs or 0.0.0.0/0)

### CORS Errors
- Verify `CLIENT_URL` matches your frontend URL exactly
- Check Fastify CORS config in `backend/src/index.ts`

