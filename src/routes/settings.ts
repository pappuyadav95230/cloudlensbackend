import { Router, Request, Response } from 'express';
import ServiceAccountKey from '../models/ServiceAccountKey';
import { encrypt } from '../utils/encryption';

const router = Router();

// POST /api/settings/cloud-accounts
router.post('/cloud-accounts', async (req: Request, res: Response): Promise<any> => {
    try {
        const { projectId, datasetId, tableName, serviceAccountJson } = req.body;

        if (!projectId || !serviceAccountJson) {
            return res.status(400).json({ error: 'Missing projectId or serviceAccountJson' });
        }

        // Encrypt the JSON string
        const jsonString = typeof serviceAccountJson === 'string' ? serviceAccountJson : JSON.stringify(serviceAccountJson);
        const { iv, encryptedData } = encrypt(jsonString);

        // Save or update in MongoDB
        await ServiceAccountKey.findOneAndUpdate(
            { projectId },
            {
                encryptedKey: encryptedData,
                iv,
                datasetId: datasetId || '',
                tableName: tableName || '',
            },
            { upsert: true, new: true }
        );

        return res.status(200).json({ message: 'Service account credentials securely saved' });
    } catch (error) {
        console.error('Error saving service account:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/settings/cloud-accounts — list connected accounts (without keys)
router.get('/cloud-accounts', async (req: Request, res: Response): Promise<any> => {
    try {
        const accounts = await ServiceAccountKey.find({}, { encryptedKey: 0, iv: 0 });
        return res.status(200).json(accounts);
    } catch (error) {
        console.error('Error fetching accounts:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
