import { Router, Request, Response } from 'express';
import ServiceAccountKey from '../models/ServiceAccountKey';
import BillingData from '../models/BillingData';
import { decrypt } from '../utils/encryption';
import { fetchBillingFromBigQuery, groupBillingData } from '../services/bigqueryService';

const router = Router();

// POST /api/worker/sync — Trigger a full data sync from BigQuery → MongoDB
router.post('/sync', async (req: Request, res: Response): Promise<any> => {
    try {
        console.log('[sync]: Starting billing data sync...');

        // 1. Fetch all stored Service Account Keys
        const accounts = await ServiceAccountKey.find({});

        if (accounts.length === 0) {
            return res.status(200).json({
                message: 'No cloud accounts connected. Add one in Settings first.',
                synced: 0,
            });
        }

        let totalSynced = 0;
        const errors: string[] = [];

        for (const account of accounts) {
            try {
                // 2. Decrypt the service account JSON
                const decryptedJson = decrypt(account.encryptedKey, account.iv);
                const credentials = JSON.parse(decryptedJson);

                // 3. Query BigQuery
                const projectId = account.projectId;
                const datasetId = (account as any).datasetId || '';
                const tableName = (account as any).tableName || '';

                if (!datasetId || !tableName) {
                    errors.push(`${projectId}: Missing datasetId or tableName. Skipping.`);
                    continue;
                }

                const rows = await fetchBillingFromBigQuery(
                    credentials,
                    projectId,
                    datasetId,
                    tableName,
                    30 // last 30 days
                );

                // 4. Group into hierarchical structure
                const groupedData = groupBillingData(rows);

                // 5. Save to MongoDB — delete old data for this billing account and insert fresh
                for (const entry of groupedData) {
                    await BillingData.findOneAndUpdate(
                        {
                            projectId: entry.projectId,
                            reportDate: {
                                $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                                $lt: new Date(new Date().setHours(23, 59, 59, 999)),
                            },
                        },
                        entry,
                        { upsert: true, new: true }
                    );
                }

                totalSynced += groupedData.length;
                console.log(`[sync]: Synced ${groupedData.length} project(s) for account ${projectId}`);
            } catch (accountError: any) {
                const errMsg = `${account.projectId}: ${accountError.message}`;
                console.error(`[sync]: Error syncing account: ${errMsg}`);
                errors.push(errMsg);
            }
        }

        return res.status(200).json({
            message: `Sync completed. ${totalSynced} project(s) synced.`,
            synced: totalSynced,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error) {
        console.error('[sync]: Fatal sync error:', error);
        return res.status(500).json({ error: 'Sync failed. Check server logs.' });
    }
});

export default router;
