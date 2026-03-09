import { Router, Request, Response } from 'express';
import User from '../models/User';

import Notification from '../models/Notification';

const router = Router();

// POST /api/users/sync - Sync Firebase user with MongoDB
router.post('/sync', async (req: Request, res: Response): Promise<any> => {
    try {
        const { uid, email, displayName, photoURL } = req.body;

        if (!uid || !email) {
            return res.status(400).json({ error: 'UID and Email are required' });
        }

        // Auto-promote admin email on first creation
        const ADMIN_EMAILS = ['610490@gmail.com', '610490papu@gmail.com'];
        const existingUser = await User.findOne({ uid });
        const isNewUser = !existingUser;

        const user = await User.findOneAndUpdate(
            { uid },
            { 
                email, 
                displayName, 
                photoURL,
                lastLogin: new Date(),
                ...(isNewUser && ADMIN_EMAILS.includes(email) ? { role: 'admin' } : {}),
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        if (isNewUser) {
            await Notification.create({
                uid,
                title: 'Welcome to CloudLens!',
                message: 'Thank you for joining. Explore your new Cloud Cost dashboard to start saving.',
                type: 'welcome'
            });
        }

        return res.status(200).json({ message: 'User synced successfully', user });
    } catch (error: any) {
        console.error('[users]: Sync error:', error.message);
        return res.status(500).json({ error: 'Failed to sync user', details: error.message });
    }
});

// GET /api/users/list - Get all users (Admin only)
router.get('/list', async (req: Request, res: Response): Promise<any> => {
    try {
        const users = await User.find({}).sort({ createdAt: -1 });
        return res.status(200).json(users);
    } catch (error) {
        console.error('[users]: List error:', error);
        return res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// PATCH /api/users/role - Update user role (Admin only)
router.patch('/role', async (req: Request, res: Response): Promise<any> => {
    try {
        const { uid, role } = req.body;

        if (!uid || !['admin', 'editor', 'viewer'].includes(role)) {
            return res.status(400).json({ error: 'Invalid UID or role' });
        }

        const user = await User.findOneAndUpdate(
            { uid },
            { role },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ message: 'Role updated successfully', user });
    } catch (error) {
        console.error('[users]: Role update error:', error);
        return res.status(500).json({ error: 'Failed to update role' });
    }
});

// PATCH /api/users/permissions - Update user permissions (Admin only)
router.patch('/permissions', async (req: Request, res: Response): Promise<any> => {
    try {
        const { uid, permissions } = req.body;

        if (!uid || !permissions) {
            return res.status(400).json({ error: 'UID and permissions are required' });
        }

        const user = await User.findOneAndUpdate(
            { uid },
            { permissions },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json({ message: 'Permissions updated successfully', user });
    } catch (error) {
        console.error('[users]: Permissions update error:', error);
        return res.status(500).json({ error: 'Failed to update permissions' });
    }
});

export default router;
