# CloudLens Backend — Task Tracker

## ✅ Phase 1: Project Setup (DONE)
- [x] Initialize Node.js + Express + TypeScript project
- [x] Install dependencies (`express`, `mongoose`, `cors`, `dotenv`, `@google-cloud/bigquery`)
- [x] Configure `tsconfig.json`
- [x] Basic Express server with health check (`/health`)

## ✅ Phase 2: MongoDB Atlas Integration (DONE)
- [x] MongoDB connection utility (`src/config/db.ts`)
- [x] `ServiceAccountKey` model — AES-256 encrypted GCP credentials
- [x] `BillingData` model — hierarchical billing data (Billing → Project → Service → SKU)

## ✅ Phase 3: API Routes (DONE)
- [x] `POST /api/settings/cloud-accounts` — encrypt & save GCP service account key
- [x] `GET /api/billing` — fetch aggregated billing data with filters
- [x] `POST /api/worker/sync` — trigger data sync (placeholder logic)

---

## ✅ Phase 4: Environment Setup (DONE)
- [x] Create `.env` file from `.env.example`
- [x] Get your **MongoDB Atlas URI** from [cloud.mongodb.com](https://cloud.mongodb.com)
- [x] Generate encryption key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- [x] Run `npm run dev` and verify `MongoDB Atlas Connected` in terminal

## ✅ Phase 5: BigQuery Sync Logic (DONE)
- [x] Implement actual BigQuery query inside `src/services/bigqueryService.ts`
- [x] Decrypt stored service account keys (`src/utils/encryption.ts`)
- [x] Run SQL aggregation query against BigQuery billing export
- [x] Transform results into `BillingData` documents
- [x] Bulk upsert into MongoDB

## ✅ Phase 6: Scheduled Worker (DONE)
- [x] Add `node-cron` job to auto-run sync every 6 hours
- [x] Add logging and error handling for failed syncs

## 🔲 Phase 7: Auth & Security
- [ ] Add Firebase Auth middleware to protect routes
- [ ] Validate API requests from the frontend
- [ ] Rate limiting

## ✅ Phase 8: Frontend Integration (DONE)
- [x] Connect CloudLens frontend (Next.js) to backend API
- [x] Wire up `Settings → Cloud Accounts` page to `POST /api/settings/cloud-accounts`
- [x] Wire up Dashboard to `GET /api/billing`

## 🔲 Phase 9: Deployment
- [ ] Deploy backend to a cloud provider (Cloud Run, Railway, Render, etc.)
- [ ] Set environment variables in production
- [ ] Update frontend API base URL
