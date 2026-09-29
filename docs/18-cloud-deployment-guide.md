# 🚀 Cloud Deployment Guide: Render (Backend) + Vercel (Frontend)

This guide provides end-to-end instructions for deploying **PETRO-TWIN AI** to the cloud:
* **Backend:** Python FastAPI ML & Physics Engine deployed on **Render** (Free tier)
* **Frontend:** React 19 + Vite Neo-Brutalist Control Room deployed on **Vercel** (Free tier)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────┐           ┌─────────────────────────────────┐
│        VERCEL (Frontend)        │           │         RENDER (Backend)        │
│    React 19 + Vite Dashboard    │  HTTPS    │   FastAPI ML & Physics Engine   │
│  https://petrotwin.vercel.app   │──────────▶│ https://petrotwin.onrender.com  │
│  (Env: VITE_API_URL=<render>)   │           │ (Uvicorn port $PORT)            │
└─────────────────────────────────┘           └─────────────────────────────────┘
```

---

## 📦 Step 1: Deploy Backend to Render

### Option A: Render Dashboard (Recommended)

1. **Sign Up / Log In:** Go to [render.com](https://render.com) and log in with your GitHub account.
2. **Create New Web Service:**
   * Click **New +** at the top right and select **Web Service**.
   * Select **Build and deploy from a Git repository**.
   * Connect your GitHub repository: `maddy-bit/SIH26120-PetroTwin-AI`.
3. **Configure Service Settings:**
   * **Name:** `petrotwin-ml-service` (or any unique name)
   * **Region:** Select the closest region (e.g., `Singapore`, `Frankfurt`, or `Oregon`)
   * **Branch:** `main`
   * **Root Directory:** Leave blank (or enter `.`)
   * **Runtime:** `Python 3`
   * **Build Command:**
     ```bash
     pip install -r ml_service/requirements.txt
     ```
   * **Start Command:**
     ```bash
     uvicorn ml_service.main:app --host 0.0.0.0 --port $PORT
     ```
   * **Instance Type:** `Free`
4. **Environment Variables:**
   * Click **Advanced** or navigate to the **Environment** tab:
     * Add `PYTHON_VERSION` with value `3.12.0`
5. **Click "Create Web Service":**
   * Render will clone your repository, install dependencies, and launch Uvicorn.
   * Build takes approximately 2–3 minutes.
6. **Verify Backend Deployment:**
   * Once status displays **Live**, copy your service URL:
     `https://<your-service-name>.onrender.com`
   * Visit `https://<your-service-name>.onrender.com/docs` in your browser. You should see the interactive Swagger API documentation.

---

### Option B: Render Blueprint (1-Click)

The repository includes a pre-configured `render.yaml`:
1. In Render, click **New +** -> **Blueprint**.
2. Select repository `maddy-bit/SIH26120-PetroTwin-AI`.
3. Render automatically reads `render.yaml` and provisions the web service.
4. Click **Apply**.

---

## 🌐 Step 2: Deploy Frontend to Vercel

1. **Sign Up / Log In:** Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. **Import Project:**
   * On your Vercel Dashboard, click **Add New...** -> **Project**.
   * Locate and click **Import** next to `maddy-bit/SIH26120-PetroTwin-AI`.
3. **Configure Project:**
   * **Project Name:** `petrotwin-ai` (or any name you prefer)
   * **Framework Preset:** `Vite` (Vercel automatically detects Vite)
   * **Root Directory:**
     * Click **Edit** next to Root Directory.
     * Select `frontend` and click **Continue**.
4. **Build & Output Settings:**
   * Build Command: `npm run build` (default)
   * Output Directory: `dist` (default)
   * Install Command: `npm install` (default)
5. **Environment Variables (CRITICAL):**
   * Expand the **Environment Variables** section.
   * Add the following variable:
     * **Key:** `VITE_API_URL`
     * **Value:** `https://<your-backend-name>.onrender.com` *(Your Render backend URL from Step 1, without a trailing slash)*
6. **Click "Deploy":**
   * Vercel builds the TypeScript bundle in ~30–45 seconds.
   * When complete, Vercel gives you a live production URL:
     `https://petrotwin-ai.vercel.app` (or similar custom subdomain).

---

## 🔍 Step 3: Verification & Live Smoke Test

1. **Open Frontend URL:** Open your Vercel URL in a browser.
2. **Check Status Indicator:**
   * Look at the top navbar. You should see `LIVE STREAM` in green.
3. **Test Views:**
   * **Live Operations:** Check if the dynamometer cards load properly.
   * **Digital Twin:** Move the 180-Day Time Machine slider to verify thermal and viscosity recalculations.
   * **Pareto Optimizer:** Click "RUN CONSTRAINED MULTI-OBJECTIVE SOLVER" to ensure optimization runs against the live API.
   * **AI Copilot:** Open the Copilot drawer and send a prompt (e.g. *"Why did failure risk increase?"*).
   * **5-Min System Tour:** Click the button to verify the modal step progression.
4. **Inspect Network Tab:**
   * Open Chrome DevTools (`F12` -> `Network`).
   * Filter by `Fetch/XHR`.
   * Confirm requests are firing to `https://<your-backend-name>.onrender.com`.

---

## 💡 Troubleshooting & Tips

### 1. Render Free Tier Spin-Down (Cold Starts)
* **Behavior:** Render free instances spin down after 15 minutes of inactivity. The first request after idle can take ~30–50 seconds to wake up.
* **Resilience:** The PETRO-TWIN AI frontend includes built-in offline physics fallbacks so the application never breaks even if the backend is waking up.
* **Keep-Alive (Optional):** Use a free cron ping service like [cron-job.org](https://cron-job.org) or [UptimeRobot](https://uptimerobot.com) to ping `https://<your-backend-name>.onrender.com/health` every 10 minutes.

### 2. CORS Issues
* The FastAPI backend has CORS enabled for all origins (`allow_origins=["*"]`), so requests from any Vercel domain are accepted by default.

### 3. Vercel SPA Routing
* The `frontend/vercel.json` file contains rewrite rules so that refreshing any route (`/`, `/live-ops`, etc.) routes back to `index.html` without 404 errors.
