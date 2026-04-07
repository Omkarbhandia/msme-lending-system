# ⚡ Vitto — MSME Lending Platform

Vitto is a lightweight, full-stack decision system built to simulate how digital lenders process business loan applications. It takes in a business's profile and financial data, runs it through a rules-based decision engine, and instantly calculates a credit score and approval verdict.

---

## 🛠 Tech Stack

**Frontend:** React.js, Vite, Framer Motion (Premium Light UI)
**Backend:** Node.js, Express.js
**Databases:** 
  - **PostgreSQL** (Core relational data: Profiles & Applications)
  - **MongoDB** (Audit trails & Decision outputs)
  - **Redis + Bull** (Asynchronous job queue for decision processing)
**Infrastructure:** Docker, Docker Compose

---

## ✨ Key Features

1. **Intelligent Decision Engine:** Evaluates loan applications based on 6 core financial rules (Revenue, EMI burden, Loan Ceiling, Tenure, Data Consistency, and PAN format) to generate a Credit Score (300-900).
2. **Asynchronous Processing:** Applications are instantly accepted (202 status) and processed securely in the background using Redis and Bull Workers, simulating real-world queue processing.
3. **Audit Trail:** Every critical action is safely logged into MongoDB with a 90-day auto-expiry (TTL) for compliance and tracking.
4. **Resilient API:** Built with Joi validation, centralized error handling, and rate limiting (100 req/15min) using `express-rate-limit`.

---

## 🚀 How to Run Locally

### 1. Using Docker (Recommended)
You can run the entire stack (Postgres, Mongo, Redis, Backend, Frontend) with a single command:

```bash
docker-compose up --build
```
- **Frontend Dashboard:** `http://localhost:3000`
- **Backend API API Health:** `http://localhost:4000/api/v1/health`

### 2. Manual Setup
If you prefer running services directly:

1. **Start Local Databases:** Ensure PostgreSQL, MongoDB, and Redis are running on your machine.
2. **Backend:**
   ```bash
   cd backend
   cp .env.example .env  # uses localhost defaults
   npm install
   npm run dev           # runs on port 4000
   ```
3. **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev           # runs on port 3002
   ```

---

*Built by Omkar Bhandia*
