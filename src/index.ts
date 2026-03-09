import express, { Express, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cron from 'node-cron';
import { connectDB } from './config/db';
import settingsRouter from './routes/settings';
import billingRouter from './routes/billing';
import syncRouter from './routes/sync';
import usersRouter from './routes/users';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Larger limit for Service Account JSON uploads

import notificationsRouter from './routes/notifications';

// Routes
app.use('/api/settings', settingsRouter);
app.use('/api/billing', billingRouter);
app.use('/api/worker', syncRouter);
app.use('/api/users', usersRouter);
app.use('/api/notifications', notificationsRouter);

// Basic health check route
app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', message: 'CloudLens API is running' });
});

// Cron Job: Sync billing data every 6 hours
cron.schedule('0 */6 * * *', async () => {
    console.log('[cron]: Running scheduled billing data sync...');
    try {
        // Trigger the sync internally by importing logic
        const response = await fetch(`http://localhost:${port}/api/worker/sync`, { method: 'POST' });
        const data = await response.json();
        console.log('[cron]: Sync result:', data);
    } catch (error) {
        console.error('[cron]: Scheduled sync failed:', error);
    }
});

// Connect to MongoDB FIRST, then start the server
const start = async () => {
    await connectDB();
    app.listen(port, () => {
        console.log(`[server]: Server is running at http://localhost:${port}`);
        console.log(`[cron]: Billing sync scheduled every 6 hours`);
    });
};

start();
