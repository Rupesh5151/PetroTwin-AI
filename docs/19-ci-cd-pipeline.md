# 🔄 PETRO-TWIN AI: CI/CD Pipeline Architecture & Guide

This document describes the automated Continuous Integration and Continuous Deployment (CI/CD) pipeline for **PETRO-TWIN AI**, powered by **GitHub Actions**.

---

## 🏗️ Pipeline Overview

Whenever code is pushed or a pull request is opened on the `main` branch, the pipeline executes 5 parallel and sequential stages:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GITHUB ACTIONS WORKFLOW                          │
│                                                                             │
│   ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────────┐  │
│   │   1. Frontend CI   │ │  2. ML & Physics   │ │  3. Spring Boot Java   │  │
│   │   React 19 / Vite  │ │  FastAPI / Models  │ │  Flyway / H2 Context   │  │
│   │   TypeScript Build │ │  10/10 Unit Tests  │ │  Maven Clean Test      │  │
│   └─────────┬──────────┘ └─────────┬──────────┘ └───────────┬────────────┘  │
│             │                      │                        │               │
│             └──────────────────────┼────────────────────────┘               │
│                                    ▼                                        │
│                      ┌───────────────────────────┐                          │
│                      │ 4. Docker Validation      │                          │
│                      │ Multi-container builds    │                          │
│                      └─────────────┬─────────────┘                          │
│                                    ▼                                        │
│                      ┌───────────────────────────┐                          │
│                      │ 5. Continuous Deployment  │                          │
│                      │ Auto-deploy Vercel+Render │                          │
│                      └───────────────────────────┘                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Pipeline Stages

### Stage 1: Frontend CI (`frontend-ci`)
* **Environment:** `ubuntu-latest`, Node.js 20
* **Actions:**
  * Caches `node_modules` via npm cache.
  * Installs dependencies (`npm install`).
  * Runs TypeScript strict compilation and Vite bundling (`npm run build`).
  * Archives the production `dist/` directory as an artifact.

### Stage 2: ML & Physics Engine CI (`ml-physics-ci`)
* **Environment:** `ubuntu-latest`, Python 3.12
* **Actions:**
  * Installs mathematical and ML dependencies (`fastapi`, `scipy`, `scikit-learn`, `numpy`).
  * Executes the unified test suite `scripts/test_all.py` (covering Walther viscosity, Marx-Langenheim thermal dissipation, SRP kinematic downstroke sinking velocity, multi-hazard SHAP attribution, and Pareto optimization).
  * Executes automated FastAPI TestClient health checks verifying `GET /health` returns `200 OK`.

### Stage 3: Spring Boot Backend CI (`backend-springboot-ci`)
* **Environment:** `ubuntu-latest`, Eclipse Temurin Java 21, Maven 3.9
* **Actions:**
  * Caches Maven `.m2` repository.
  * Compiles Java source and executes `mvn clean test -B`.
  * Verifies Flyway database migrations and Spring Boot ApplicationContext initialization in embedded test profile.

### Stage 4: Docker Container Validation (`docker-validation`)
* **Environment:** `ubuntu-latest`, Docker Buildx
* **Dependencies:** Runs only after Stages 1, 2, and 3 succeed.
* **Actions:**
  * Validates `docker/Dockerfile.ml-service`.
  * Validates `docker/Dockerfile.backend`.
  * Ensures all microservice containers build without caching or dependency issues.

### Stage 5: Continuous Deployment (`deployment-status`)
* **Triggers:** Runs automatically when code merges to `main`.
* **Actions:**
  * **Vercel Frontend:** Vercel automatically deploys the updated `frontend/` directory to [https://sih-26120-petro-twin-ai.vercel.app](https://sih-26120-petro-twin-ai.vercel.app).
  * **Render Backends:** Render automatically pulls and redeploys the updated commit to:
    * `https://petrotwin-ml-service.onrender.com`
    * `https://petrotwin-backend-5w7q.onrender.com`
  * **Automated Webhooks:** If you configure the GitHub Secret `RENDER_DEPLOY_HOOK_URL`, the workflow automatically triggers Render deployment webhooks.

---

## ⚙️ Adding Render Deploy Webhooks (Optional)

To trigger Render deployments immediately upon pipeline success:
1. In Render, open your service settings.
2. Under **Deploy Hook**, copy the webhook URL.
3. In your GitHub repository:
   * Go to **Settings** ➔ **Secrets and variables** ➔ **Actions**.
   * Click **New repository secret**.
   * **Name:** `RENDER_DEPLOY_HOOK_URL`
   * **Value:** *(paste your Render webhook URL)*
