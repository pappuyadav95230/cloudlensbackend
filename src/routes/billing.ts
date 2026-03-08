import { Router, Request, Response } from 'express';
import BillingData from '../models/BillingData';

const router = Router();

// GET /api/billing
router.get('/', async (req: Request, res: Response): Promise<any> => {
  try {
    const { billingAccountId, projectId } = req.query;
    
    // Build query based on filters
    const query: any = {};
    if (billingAccountId) query.billingAccountId = billingAccountId;
    if (projectId) query.projectId = projectId;

    // Fetch the latest or all data matching the filter
    const data = await BillingData.find(query).sort({ reportDate: -1 }).limit(100);

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error fetching billing data:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
