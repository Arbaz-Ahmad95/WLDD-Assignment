# Meme’d — Campaign Payout Tracker & Creator Engine 🚀

A full-stack, production-grade creator marketplace platform built for **WLDD Assignment Evaluation**.

Brands sponsor viral meme & clip campaigns with custom performance milestone ladders (e.g. 10K views → ₹500, 50K views → ₹2,000, 100K views → ₹5,000). Creators post content on **Instagram** or **YouTube**, submit post links, and earn payouts as verified views climb. The system strictly enforces campaign budget spending caps, provides atomic concurrency control to prevent race-condition overspending, detects suspicious bot view spikes, and caches campaign reads with Redis.

---

## 📑 Table of Contents
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Folder & Project Structure](#-folder--project-structure)
- [Business Logic & Assumptions Handled](#-business-logic--assumptions-handled)
- [Concurrency & Race-Condition Safety](#-concurrency--race-condition-safety)
- [Bot View Spike & Fraud Detection](#-bot-view-spike--fraud-detection)
- [Redis Caching Strategy](#-redis-caching-strategy)
- [Scaling Note: Scaling to 10,000 Creators](#-scaling-note-how-would-this-scale-to-10000-creators)
- [Unit & Integration Test Suite](#-unit--integration-test-suite)
- [Quick Start: Running Locally](#-quick-start-running-locally)
- [Running via Docker Compose](#-running-via-docker-compose)
- [API Reference](#-api-reference)

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Key Capabilities |
| :--- | :--- | :--- |
| **Backend** | Node.js, Express, TypeScript | REST API, JWT Authentication, Strict Typing, Modular Services |
| **Database** | MongoDB & Mongoose | Indexed schemas, atomic conditional `$inc` operations |
| **Caching** | Redis (ioredis) + Memory Fallback | Sub-millisecond campaign listings, auto-invalidation |
| **Testing** | Jest, ts-jest, Supertest, MongoMemoryServer | 28 automated unit & integration tests covering edge cases |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript | Glassmorphic cyber dark UI, interactive milestone ladders, live simulator |
| **Icons & FX** | Lucide React, Canvas Confetti | Visual badges, micro-animations, celebration triggers |
| **Containerization**| Docker & Docker Compose | Multi-stage production Dockerfiles with orchestrated Redis and Mongo |

---

## 📁 Folder & Project Structure

The codebase is strictly separated into two distinct, professional folders:

```text
WLDD-Assignment/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.ts                         # MongoDB connection with Mongoose
│   │   ├── controllers/
│   │   │   ├── authController.ts             # Signup, login, profile, demo seeding
│   │   │   ├── campaignController.ts         # Create campaign, brand stats, live listings
│   │   │   └── submissionController.ts       # Post submission, earnings, PATCH view simulation
│   │   ├── middleware/
│   │   │   ├── auth.ts                       # Bearer JWT verification
│   │   │   ├── roleCheck.ts                  # Brand & Creator role guard
│   │   │   └── errorHandler.ts               # Centralized Express error handler
│   │   ├── models/
│   │   │   ├── User.ts                       # User schema with bcrypt password hashing
│   │   │   ├── Campaign.ts                   # Campaign schema with sorted milestone ladders
│   │   │   └── Submission.ts                 # Submission schema with audit history & spike flags
│   │   ├── routes/
│   │   │   ├── authRoutes.ts                 # /api/auth routes
│   │   │   ├── campaignRoutes.ts             # /api/campaigns routes
│   │   │   └── submissionRoutes.ts           # /api/submissions routes
│   │   ├── services/
│   │   │   ├── payoutService.ts              # Core milestone calculation & atomic OCC
│   │   │   ├── anomalyService.ts             # Velocity-based view spike detector
│   │   │   └── cacheService.ts               # Redis cache client with in-memory TTL fallback
│   │   ├── types/
│   │   │   └── index.ts                      # Shared TypeScript domain interfaces
│   │   ├── utils/
│   │   │   └── seedData.ts                   # Realistic demo brands, creators, campaigns
│   │   ├── app.ts                            # Express application setup & middleware
│   │   └── server.ts                         # Server entry point & DB startup
│   ├── tests/
│   │   ├── payout.test.ts                    # Unit tests for milestone ladders & increments
│   │   ├── budgetCap.test.ts                 # Unit tests for budget capping & exhaustion
│   │   ├── anomaly.test.ts                   # Unit tests for view velocity & spike detection
│   │   └── integration.test.ts               # Full E2E Supertest API integration suite
│   ├── jest.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                    # Root layout with Toast & Auth providers
│   │   │   ├── page.tsx                      # Showcase Hub with interactive hero demo
│   │   │   ├── brand/page.tsx                # Brand Portal: spend meters, ladder inspector
│   │   │   ├── creator/page.tsx              # Creator Portal: marketplace, post submissions
│   │   │   ├── simulator/page.tsx            # Evaluator Test Bench & Webhook Studio
│   │   │   └── auth/
│   │   │       ├── login/page.tsx            # Login with 1-click Demo credentials
│   │   │       └── signup/page.tsx           # Signup with Brand/Creator role selection
│   │   ├── components/
│   │   │   ├── Navbar.tsx                    # Top nav with Quick Role Switcher
│   │   │   ├── StatCard.tsx                  # Metric widget with glowing borders
│   │   │   ├── BudgetBar.tsx                 # Dynamic budget spend progress bar
│   │   │   ├── MilestoneLadderVisualizer.tsx # Stepper showing view targets & payout states
│   │   │   ├── CreateCampaignModal.tsx       # Interactive ladder builder modal
│   │   │   ├── SubmitPostModal.tsx           # URL validator and post submission modal
│   │   │   └── ViewSimulatorModal.tsx        # Live view scraper emulator with confetti
│   │   ├── context/
│   │   │   ├── AuthContext.tsx               # Auth state & quick demo logins
│   │   │   └── ToastContext.tsx              # Floating toast notification system
│   │   ├── lib/
│   │   │   └── api.ts                        # Type-safe API client
│   │   ├── styles/
│   │   │   └── globals.css                   # Custom CSS tokens, glassmorphism, animations
│   │   └── types/
│   │       └── index.ts                      # Frontend TypeScript models
│   ├── tsconfig.json
│   ├── next.config.mjs
│   ├── package.json
│   └── Dockerfile
│
├── docker-compose.yml                        # Full container stack (Mongo, Redis, API, Next)
└── README.md
```

---

## 🎯 Business Logic & Assumptions Handled

Where the brief left room for interpretation, clear and production-tested engineering decisions were made:

### 1. Highest Milestone Crossed Rule
- A creator's payout is **always** equal to the payout of the highest milestone their post has surpassed.
- Milestones are strictly ordered by `viewThreshold` ascending.
- If views hit 42,000 on a ladder with [10K → ₹500, 50K → ₹2,000], the post sits at the 10K milestone and has unlocked ₹500.
- When views cross 50,000, target payout becomes ₹2,000. The post already received ₹500, so the incremental disbursement owed is `₹2,000 - ₹500 = ₹1,500`.

### 2. Multi-Milestone Jumps in a Single View Update
- **Scenario:** A viral post jumps straight from `0` to `120,000` views, crossing 10K (₹500), 50K (₹2,000), and 100K (₹5,000) simultaneously.
- **Rule:** The creator is credited the highest milestone crossed (₹5,000) minus whatever was already paid (₹0). The system pays ₹5,000 in one go, without requiring intermediate step pings.

### 3. Repeated or Regressed View Updates (No Double-Paying)
- **Scenario:** The platform scraper runs multiple times, reporting identical views, or platform anti-fraud audits drop verified views from 52,000 down to 48,000.
- **Rule:** Incremental payout is calculated as `Math.max(0, targetPayout - previousPayout)`. If target payout is less than or equal to `previousPayout`, the owed increment is **₹0**.
- Money is never clawed back from creator earnings on regression, and money is never double-disbursed on repeated updates.

### 4. Mid-Payout Campaign Budget Exhaustion (Strict Budget Cap)
- **Scenario:** A post qualifies for a ₹5,000 milestone jump, but the campaign only has ₹2,300 in remaining budget.
- **Rule:** The campaign pays out the remaining `₹2,300`. It **never** overspends. The submission records `isBudgetCapped: true`, the campaign's `spentBudget` reaches `totalBudget`, `remainingBudget` drops to `0`, and campaign status transitions to `exhausted`.
- Future view updates on an exhausted campaign disburse exactly **₹0**.

---

## 🔒 Concurrency & Race-Condition Safety

A key stretch requirement is ensuring that **two simultaneous view updates can NEVER overspend the campaign budget, and repeated updates never double-pay**.

### How Meme’d Guarantees Concurrency Safety:
1. **Atomic Conditional Campaign Deduction:**
   Rather than performing a vulnerable "read-then-write", budget deduction is executed atomically via MongoDB's `$inc` with a conditional filter:
   ```typescript
   const updatedCampaign = await Campaign.findOneAndUpdate(
     {
       _id: campaign._id,
       remainingBudget: { $gte: result.actualPaidIncrement } // Strict condition
     },
     {
       $inc: {
         spentBudget: result.actualPaidIncrement,
         remainingBudget: -result.actualPaidIncrement
       }
     },
     { new: true }
   );
   ```
   If two requests hit concurrently when only ₹3,000 remains and both request ₹3,000:
   - Exactly **one** operation satisfies `{ remainingBudget: { $gte: 3000 } }` and succeeds.
   - The second operation fails the filter, triggers an automatic retry loop, recalculates against the newly updated `remainingBudget` (which is now ₹0), and safely returns ₹0 without overdrawing.

2. **Optimistic Concurrency Control (OCC) on Submissions:**
   Submissions are updated with a guard against duplicate writes:
   ```typescript
   Submission.findOneAndUpdate(
     { _id: submissionId, currentPayout: previousPayout }, // Prevents duplicate execution
     submissionUpdate,
     { new: true }
   );
   ```

---

## 🚨 Bot View Spike & Fraud Detection

To protect brands from automated view bots, every view update runs through `detectViewSpike()`:
1. **View Velocity Check:** If velocity exceeds `2,000 views/second` with a jump of `≥ 5,000 views`.
2. **Flash Surge Check:** If views jump by `≥ 50,000 views` in `≤ 30 seconds`.
3. **Abnormal Surge Multiplier:** If views multiply by `≥ 10x` previous view count within `≤ 60 seconds`.

When triggered:
- The submission is marked `isSpikeFlagged: true` with an explanatory diagnostic message (e.g. *"Flash spike detected: +65,000 views within 15.0s"*).
- The alert surfaces in the Brand Dashboard and Simulator Studio for auditing.

---

## ⚡ Redis Caching Strategy

- `GET /api/campaigns` is cached via Redis under `cache:live_campaigns` (and `cache:live_campaigns:<platform>`).
- Sub-millisecond response latency for creator marketplace browsing.
- Automatic cache invalidation on `POST /api/campaigns` and `PATCH /api/submissions/:id/views`.
- **Fault-Tolerant Fallback:** If Redis is offline or not installed locally, the backend automatically fails over to an internal TTL in-memory cache without crashing.

---

## 📈 Scaling Note: How Would This Scale to 10,000 Creators?

Scaling Meme’d from hundreds of creators to **10,000+ creators** generating millions of views requires transitioning from synchronous request processing to an asynchronous, distributed event-driven pipeline:

### 1. Ingestion Pipeline & Message Queuing (Decoupled Webhooks)
- In a production environment with 10,000 creators, view scrapers and platform webhooks (Instagram Graph API, YouTube Data API v3) emit tens of thousands of view pings per minute.
- Instead of executing view calculations synchronously inside HTTP request handlers, the `PATCH /api/submissions/:id/views` endpoint acts as a lightweight ingress that publishes an event to an event stream (e.g., **Apache Kafka** or **AWS SQS** with **BullMQ** on Redis).
- Worker pools consume view update events in batches, smoothing out traffic spikes and eliminating API latency.

### 2. Campaign Budget Partitioning & Distributed Locks
- When hundreds of creators submit views concurrently under a single viral campaign (e.g. "Swiggy Blitz"), contention on that campaign's budget document increases.
- **Solution:** Shard campaign budget deduction using **Redis distributed locks (Redlock)** or atomic **Lua scripts** for instant in-memory balance reservation (`DECRBY remaining_budget amount`), followed by periodic asynchronous reconciliation back to MongoDB.
- Partitioning queues by `campaignId` ensures in-order sequential processing per campaign without blocking other campaigns.

### 3. Database Sharding & Read/Write Splitting
- **Sharding Key:** Shard the `submissions` collection in MongoDB on `campaignId`.
- **Read Replicas:** Route read-heavy traffic (creators browsing campaigns, checking ladder tiers) to MongoDB secondary read replicas, keeping the primary replica dedicated to transactional writes.
- **Compound Indexes:** `{ campaignId: 1, creatorId: 1 }` and `{ campaignId: 1, currentPayout: -1 }` maintain constant-time $O(1)$ lookups.

### 4. Sliding-Window View Debouncing
- Creator views do not need sub-second database commits. Implementing a 60-second sliding debounce window in Redis (aggregating incoming view diffs per submission) reduces database write throughput by up to **90%**.

---

## 🧪 Unit & Integration Test Suite

The test suite runs with Jest and in-memory MongoDB (`mongodb-memory-server`), ensuring zero external dependencies are required to run tests.

### Run All Tests:
```bash
cd backend
npm test
```

### Coverage Overview:
- **`tests/payout.test.ts`** (11 tests):
  - Highest milestone payout logic
  - Threshold zero / below minimum threshold (0 payout)
  - Exact milestone threshold match
  - Intermediate views between milestones
  - Multi-milestone jumps in a single update
  - Repeated view updates (no double payout)
  - View regression resilience
- **`tests/budgetCap.test.ts`** (5 tests):
  - Ample budget full payout
  - Partial budget capping when remaining budget is less than owed increment
  - Zero budget remaining condition
  - Exhaustion state transition
  - Guarantee that remaining budget is never negative
- **`tests/anomaly.test.ts`** (5 tests):
  - Normal organic view growth
  - Initial setup bypass
  - Rapid velocity spike (> 2,000 views/sec)
  - Flash burst (> 50,000 views in < 30s)
  - Surge multiplier (> 10x in < 60s)
- **`tests/integration.test.ts`** (7 tests):
  - Full E2E flow: Health check, Brand signup, Campaign creation, Creator signup, Post submission, View updates, Budget cap exhaustion, and Double-pay prevention.

**Result: 28 passing tests across 4 test suites.**

---

## 🚀 Quick Start: Running Locally

### Prerequisites
- Node.js (v18+ or v22+)
- MongoDB (running locally or MongoDB Atlas connection string)
- Redis *(optional - will automatically use built-in cache if offline)*

### 1. Backend Setup
```bash
cd backend
npm install
npm run build
npm start
# Backend runs at http://localhost:5000
```
*Note: Demo data (Brand, Creator, and 3 Live Campaigns) is automatically seeded on startup!*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:3000
```

### 3. Pre-Seeded Demo Accounts for Evaluators
| Role | Email | Password | Pre-loaded Assets |
| :--- | :--- | :--- | :--- |
| **Brand** | `brand@memed.in` | `password123` | Swiggy Campaign (₹50K Budget), Spotify Campaign |
| **Creator** | `creator@memed.in` | `password123` | Active Instagram Reel & YouTube Short submissions |

*Both portals also offer a **"1-Click Demo Login"** button on the Navbar and Login page.*

---

## 🐳 Running via Docker Compose

To spin up the entire production stack (MongoDB 7.0 + Redis 7.2 + Express Backend + Next.js Frontend) in one command:

```bash
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Health check: `http://localhost:5000/api/health`

---

## 📡 API Reference

### Authentication
- `POST /api/auth/signup` — Create user account (`name`, `email`, `password`, `role: 'brand' | 'creator'`)
- `POST /api/auth/login` — Sign in and receive JWT token
- `GET /api/auth/me` — Get current authenticated user profile
- `POST /api/auth/seed` — Seed or re-seed demo data

### Campaigns
- `POST /api/campaigns` — Brand: Create campaign with milestone ladder *(Auth required, Role: brand)*
- `GET /api/campaigns` — Public/Creator: List live campaigns *(Cached via Redis)*
- `GET /api/campaigns/brand` — Brand: Get brand campaigns & budget analytics *(Auth required, Role: brand)*
- `GET /api/campaigns/:id` — Get campaign details, milestones, and all submitted posts

### Submissions & Payouts
- `POST /api/submissions` — Creator: Submit post link to campaign *(Auth required, Role: creator)*
- `GET /api/submissions/creator` — Creator: Get earnings & submitted post tracker *(Auth required, Role: creator)*
- `PATCH /api/submissions/:id/views` — **Simulate Platform Data:** Update post views & trigger milestone payout calculation *(No auth check needed per assignment specification)*

---

*Engineered with attention to detail for the **WLDD Meme’d Campaign Payout Tracker** evaluation.*
