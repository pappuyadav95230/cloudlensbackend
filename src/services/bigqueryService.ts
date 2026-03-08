import { BigQuery } from '@google-cloud/bigquery';

interface ServiceAccountCredentials {
    type: string;
    project_id: string;
    private_key_id: string;
    private_key: string;
    client_email: string;
    client_id: string;
    [key: string]: any;
}

export interface BillingRow {
    billingAccountId: string;
    projectId: string;
    projectName: string;
    serviceDescription: string;
    skuDescription: string;
    cost: number;
}

/**
 * Queries the GCP BigQuery billing export table and returns aggregated cost data.
 *
 * @param credentials - Decrypted Service Account JSON
 * @param bigqueryProjectId - The GCP project ID where BigQuery jobs will run
 * @param datasetId - The BigQuery dataset containing the billing export table
 * @param tableName - The billing export table name (e.g., gcp_billing_export_v1_XXXXXX)
 * @param daysBack - How many days of data to fetch (default: 30)
 */
export async function fetchBillingFromBigQuery(
    credentials: ServiceAccountCredentials,
    bigqueryProjectId: string,
    datasetId: string,
    tableName: string,
    daysBack: number = 30
): Promise<BillingRow[]> {
    // Initialize BigQuery client with service account credentials
    const bigquery = new BigQuery({
        projectId: bigqueryProjectId,
        credentials: {
            client_email: credentials.client_email,
            private_key: credentials.private_key,
        },
    });

    const query = `
        SELECT
            billing_account_id AS billingAccountId,
            project.id AS projectId,
            project.name AS projectName,
            service.description AS serviceDescription,
            sku.description AS skuDescription,
            ROUND(SUM(cost) + SUM(IFNULL((SELECT SUM(c.amount) FROM UNNEST(credits) c), 0)), 2) AS cost
        FROM
            \`${bigqueryProjectId}.${datasetId}.${tableName}\`
        WHERE
            _PARTITIONTIME >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL ${daysBack} DAY)
        GROUP BY
            billing_account_id,
            project.id,
            project.name,
            service.description,
            sku.description
        HAVING
            cost > 0
        ORDER BY
            projectId, cost DESC
    `;

    console.log(`[bigquery]: Running billing query for project ${bigqueryProjectId}...`);

    const [rows] = await bigquery.query({ query, location: 'US' });

    console.log(`[bigquery]: Fetched ${rows.length} rows from BigQuery`);

    return rows as BillingRow[];
}

/**
 * Groups flat BigQuery rows into a hierarchical structure:
 * Project → Services → Resources (SKUs)
 */
export function groupBillingData(rows: BillingRow[]) {
    const projectMap = new Map<string, {
        billingAccountId: string;
        projectId: string;
        projectName: string;
        serviceMap: Map<string, {
            serviceDescription: string;
            cost: number;
            resources: { skuDescription: string; cost: number }[];
        }>;
        totalCost: number;
    }>();

    for (const row of rows) {
        // Get or create project entry
        if (!projectMap.has(row.projectId)) {
            projectMap.set(row.projectId, {
                billingAccountId: row.billingAccountId,
                projectId: row.projectId,
                projectName: row.projectName || row.projectId,
                serviceMap: new Map(),
                totalCost: 0,
            });
        }

        const project = projectMap.get(row.projectId)!;
        project.totalCost += row.cost;

        // Get or create service entry
        if (!project.serviceMap.has(row.serviceDescription)) {
            project.serviceMap.set(row.serviceDescription, {
                serviceDescription: row.serviceDescription,
                cost: 0,
                resources: [],
            });
        }

        const service = project.serviceMap.get(row.serviceDescription)!;
        service.cost += row.cost;
        service.resources.push({
            skuDescription: row.skuDescription,
            cost: row.cost,
        });
    }

    // Convert maps to arrays for MongoDB storage
    return Array.from(projectMap.values()).map((project) => ({
        billingAccountId: project.billingAccountId,
        projectId: project.projectId,
        projectName: project.projectName,
        services: Array.from(project.serviceMap.values()).map((svc) => ({
            serviceDescription: svc.serviceDescription,
            cost: Math.round(svc.cost * 100) / 100,
            resources: svc.resources,
        })),
        totalCost: Math.round(project.totalCost * 100) / 100,
        reportDate: new Date(),
    }));
}
