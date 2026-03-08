import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceAccountKey extends Document {
    projectId: string;       // The GCP project ID (where BigQuery jobs run)
    datasetId: string;       // BigQuery dataset name (e.g., "billing_export")
    tableName: string;       // BigQuery table name (e.g., "gcp_billing_export_v1_XXXXXX")
    encryptedKey: string;    // AES-256-CBC encrypted Service Account JSON
    iv: string;              // Initialization vector for decryption
    createdAt: Date;
    updatedAt: Date;
}

const ServiceAccountKeySchema: Schema = new Schema(
    {
        projectId: { type: String, required: true, unique: true },
        datasetId: { type: String, default: '' },
        tableName: { type: String, default: '' },
        encryptedKey: { type: String, required: true },
        iv: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<IServiceAccountKey>('ServiceAccountKey', ServiceAccountKeySchema);
