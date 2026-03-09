import { Router, Request, Response } from 'express';
import Notification from '../models/Notification';

const router = Router();

// GET /api/notifications/:uid - Get all notifications for a user
router.get('/:uid', async (req: Request, res: Response): Promise<any> => {
    try {
        const { uid } = req.params;
        const { unreadOnly } = req.query;
        
        const filter: any = { uid };
        if (unreadOnly === 'true') {
            filter.isRead = false;
        }

        const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
        return res.status(200).json(notifications);
    } catch (error) {
        console.error('[notifications]: Fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// PATCH /api/notifications/:id/read - Mark a specific notification as read
router.patch('/:id/read', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const notification = await Notification.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        return res.status(200).json(notification);
    } catch (error) {
        console.error('[notifications]: Mark read error:', error);
        return res.status(500).json({ error: 'Failed to mark notification as read' });
    }
});

// PATCH /api/notifications/:uid/read-all - Mark all unread notifications for a user as read
router.patch('/:uid/read-all', async (req: Request, res: Response): Promise<any> => {
    try {
        const { uid } = req.params;
        const result = await Notification.updateMany(
            { uid, isRead: false },
            { isRead: true }
        );

        return res.status(200).json({ message: `Marked ${result.modifiedCount} notifications as read` });
    } catch (error) {
        console.error('[notifications]: Mark all read error:', error);
        return res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
});

export default router;
