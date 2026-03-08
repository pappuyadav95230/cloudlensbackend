import mongoose, { Schema, Document } from 'mongoose';

// Interface matching the hierarchical data from BigQuery
export interface IBillingData extends Document {
  billingAccountId: string;
  projectId: string;
  projectName: string;
  services: {
    serviceDescription: string;
    cost: number;
    resources: {
      skuDescription: string;
      cost: number;
    }[];
  }[];
  totalCost: number;
  reportDate: Date;
  createdAt: Date;
}

const ResourceCostSchema = new Schema({
  skuDescription: { type: String, required: true },
  cost: { type: Number, required: true },
});

const ServiceCostSchema = new Schema({
  serviceDescription: { type: String, required: true },
  cost: { type: Number, required: true },
  resources: [ResourceCostSchema],
});

const BillingDataSchema: Schema = new Schema(
  {
    billingAccountId: { type: String, required: true },
    projectId: { type: String, required: true },
    projectName: { type: String, required: true },
    services: [ServiceCostSchema],
    totalCost: { type: Number, required: true },
    reportDate: { type: Date, required: true }, // The date the cost was incurred
  },
  { timestamps: true }
);

// Compound index to quickly query a project's cost for a specific day
BillingDataSchema.index({ projectId: 1, reportDate: -1 });

export default mongoose.model<IBillingData>('BillingData', BillingDataSchema);
