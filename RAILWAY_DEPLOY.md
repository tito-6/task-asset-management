# Deploy to Railway.app (Free Tier)

This guide walks you through deploying the Asset & Task Management monorepo to Railway with a free PostgreSQL database.

---

## Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app) (free tier available).
2. **GitHub Repository**: Push your code to a GitHub repo (Railway deploys from Git).

---

## Step 1: Create a New Railway Project

1. Log in to [Railway](https://railway.app).
2. Click **"New Project"**.
3. Select **"Deploy from GitHub repo"** and authorize Railway to access your GitHub account.
4. Choose the repository containing this monorepo (`assetmanagement`).

---

## Step 2: Add a PostgreSQL Database

1. In your Railway project dashboard, click **"+ New"** → **"Database"** → **"Add PostgreSQL"**.
2. Railway will provision a free Postgres instance and automatically create a `DATABASE_URL` environment variable.
3. The `DATABASE_URL` will be available to all services in the project.

---

## Step 3: Deploy the Backend Service

### 3.1 Add the Backend Service

1. Click **"+ New"** → **"GitHub Repo"** → select your repo again.
2. Railway will detect multiple services; configure the backend:
   - **Root Directory**: `backend`
   - **Build Command**: (auto-detected from `railway.json` or set to `npm ci && npm run build`)
   - **Start Command**: `npm start` (this runs Prisma migrations + starts the server)

### 3.2 Set Backend Environment Variables

In the backend service settings, add these variables:

| Variable                  | Value                                                                 |
|---------------------------|-----------------------------------------------------------------------|
| `DATABASE_URL`            | (auto-injected by Railway Postgres plugin)                            |
| `PORT`                    | (auto-injected by Railway, typically `$PORT`)                         |
| `NODE_ENV`                | `production`                                                          |
| `JWT_SECRET`              | `your-secure-jwt-secret-min-32-chars-1234567890abcdef`               |
| `ENCRYPTION_KEY`          | `pVPB8oHq9qcu3z8BbX8bdz4iN98VD102F28mYIZx5Cs=`                        |
| `CALLMEBOT_API_KEY`       | `1044769`                                                             |
| `CALLMEBOT_SENDER_PHONE`  | `+905398240525`                                                       |
| `EMAIL_SENDER_ADDRESS`    | `marketing.innogy@gmail.com`                                          |
| `EMAIL_SENDER_NAME`       | `Marketing Task Management`                                           |
| `EMAIL_APP_PASSWORD`      | `tbhcilvnsqvxfctb`                                                    |

> **Note**: Railway auto-injects `DATABASE_URL` and `PORT` from the Postgres service.

### 3.3 Deploy

1. Click **"Deploy"**.
2. Railway will:
   - Run `npm ci` to install dependencies (including `prisma` and workspace packages).
   - Run `npm run build` (which includes `prisma generate`).
   - Run `npm start` (which runs `prisma migrate deploy` and starts the API server).

3. Once deployed, Railway will provide a public URL like `https://your-backend.railway.app`.

---

## Step 4: Deploy the Frontend Service

### 4.1 Add the Frontend Service

1. Click **"+ New"** → **"GitHub Repo"** → select your repo again.
2. Configure the frontend:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm run preview -- --host 0.0.0.0 --port $PORT`

### 4.2 Set Frontend Environment Variables

In the frontend service settings, add:

| Variable              | Value                                          |
|-----------------------|------------------------------------------------|
| `VITE_API_BASE_URL`   | `https://your-backend.railway.app/api`         |

> Replace `your-backend.railway.app` with the actual Railway backend URL from Step 3.

### 4.3 Deploy

1. Click **"Deploy"**.
2. Railway will build the Vite frontend and serve it via preview mode.
3. Once deployed, Railway will provide a public URL like `https://your-frontend.railway.app`.

---

## Step 5: Seed the Admin User (One-Time)

After the backend is deployed and migrations are applied, seed the admin user:

1. Go to your backend service in Railway.
2. Open the **"Deployments"** tab → click the latest deployment → **"View Logs"**.
3. In the Railway CLI or via a one-off command (if supported), run:
   ```bash
   npm run seed:dev
   ```
   Or connect to the Railway Postgres via a local client and run the seed script manually:
   ```bash
   # Locally, point to Railway DB
   DATABASE_URL="<Railway Postgres URL>" npm run seed:dev
   ```

**Default Admin Credentials:**
- **Email**: `admin@example.com`
- **Password**: `Admin12345!`

---

## Step 6: Access Your Application

- **Frontend**: `https://your-frontend.railway.app`
- **Backend API**: `https://your-backend.railway.app/api`

Log in with the admin credentials to verify the deployment.

---

## Notes & Tips

- **Free Tier Limits**: Railway's free tier includes 500 hours of usage per month and $5 in credits. Both backend and frontend services will consume these resources.
- **Database Backups**: Railway does not provide automatic backups on the free tier. For production, upgrade or set up manual backups.
- **Environment Variables**: Keep secrets like `JWT_SECRET`, `ENCRYPTION_KEY`, and `EMAIL_APP_PASSWORD` secure; Railway encrypts them.
- **Logs**: Use Railway's built-in log viewer to debug issues during deployment.
- **Scaling**: If you exceed free tier limits, Railway will prompt you to upgrade or add a payment method.

---

## Troubleshooting

### Backend fails to start
- Check logs for Prisma migration errors.
- Ensure `DATABASE_URL` is correctly injected from the Postgres service.
- Verify all required environment variables are set.

### Frontend can't reach backend
- Confirm `VITE_API_BASE_URL` points to the correct Railway backend URL.
- Ensure CORS is configured in the backend to allow the frontend origin.

### Admin login fails
- Verify the admin user was seeded by checking the Postgres database.
- Check backend logs for authentication errors.

---

## Local Development

To run locally without affecting Railway:

```cmd
# Start backend (requires local Postgres or Railway DB URL)
cd backend
npm run dev

# Start frontend (in a new terminal)
cd frontend
npm run dev
```

Update `backend/.env` to point to `localhost` or Railway Postgres for local dev:
```properties
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/asset_management?schema=public
```

---

## Summary

- **Backend**: Runs on Railway with Prisma migrations + API server.
- **Frontend**: Vite production build served via Railway preview mode.
- **Database**: Free Railway Postgres with auto-injected `DATABASE_URL`.
- **Admin Seeding**: One-time manual run via Railway logs or local CLI.

Enjoy your free deployment! 🚀
